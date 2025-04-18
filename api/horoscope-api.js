// API de horóscopo implementada em JavaScript
import axios from 'axios';
import * as dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Imprime um log para debug
console.log('Chave da API disponível?', process.env.OPENROUTER_API_KEY ? 'Sim' : 'Não');
console.log('Primeiros 10 caracteres da chave:', process.env.OPENROUTER_API_KEY ? process.env.OPENROUTER_API_KEY.substring(0, 10) + '...' : 'Não disponível');

// Cabeçalhos CORS para todas as respostas
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

// Cache para armazenar as previsões já geradas
const horoscopeCache = new Map();

// Função para gerar uma cor aleatória
function getRandomColor() {
  const colors = [
    'vermelho', 'azul', 'verde', 'amarelo', 'roxo', 
    'laranja', 'rosa', 'turquesa', 'dourado', 'prata',
    'violeta', 'lavanda', 'esmeralda', 'índigo', 'coral'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Função para gerar um número da sorte
function getLuckyNumber() {
  return Math.floor(Math.random() * 100) + 1;
}

// Função para obter a data atual no formato brasileiro (GMT-3)
function getCurrentDateBrazil() {
  const now = new Date();
  // Ajuste para GMT-3 (fuso de Brasília)
  const brasiliaTime = new Date(now.getTime() - (3 * 60 * 60 * 1000));
  return brasiliaTime.toISOString().split('T')[0]; // YYYY-MM-DD
}

// Função para gerar texto do horóscopo usando OpenRouter
async function generateHoroscopeText(sign, isRebel = false, isAdvice = false) {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY não configurada nas variáveis de ambiente');
  }
  
  try {
    // Configuração para a API OpenRouter
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://astrogenapp.vercel.app/'
    };
    
    // Texto base para o prompt
    let prompt = '';
    
    if (isRebel) {
      // Prompt para estilo rebelde
      if (isAdvice) {
        prompt = `Como um jovem debochado e cético sobre astrologia, dê um conselho curto e direto para o signo de ${sign} hoje (${getCurrentDateBrazil()}). Seja sincero, um pouco irônico e direto ao ponto. Limite a resposta a apenas uma frase concisa (máximo 15 palavras).`;
      } else {
        prompt = `Como um jovem debochado e cético sobre astrologia, dê uma visão rápida e direta para ${sign} hoje (${getCurrentDateBrazil()}). Seja direto, um pouco irônico, sem muitas gírias. Se for algo bom, diga que "tá ok" ou "menos mal", se for ruim, seja sincero que "tá uma bosta". Limite a resposta a 1-2 frases curtas (máximo 30 palavras).`;
      }
    } else if (isAdvice) {
      // Prompt para conselho
      prompt = `Como astrólogo profissional, forneça um conselho astral curto e útil para o signo de ${sign} hoje (${getCurrentDateBrazil()}). Use tom profissional e inspirador. Limite a resposta a apenas uma frase concisa (máximo 15 palavras).`;
    } else {
      // Prompt para descrição detalhada
      prompt = `Como um astrólogo profissional, crie uma previsão astrológica concisa para o signo de ${sign} para hoje (${getCurrentDateBrazil()}). Mencione brevemente uma influência planetária e seus efeitos. Seja breve e direto. Limite a resposta a 2-3 frases (máximo 60 palavras).`;
    }
    
    // Dados para enviar à API
    const data = {
      messages: [
        { role: "user", content: prompt }
      ],
      model: "google/gemma-3-4b-it:free",
      max_tokens: 500,
      temperature: isRebel ? 0.9 : 0.7
    };
    
    // Enviando requisição para OpenRouter
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', data, { headers });
    
    // Extraindo a resposta gerada
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Erro ao consultar API OpenRouter:', error);
    throw new Error(`Erro ao gerar texto: ${error.message}`);
  }
}

// Handler principal para a API de horóscopo
export default async function handler(req, res) {
  // Lidar com requisições OPTIONS (para CORS)
  if (req.method === 'OPTIONS') {
    Object.keys(corsHeaders).forEach(key => {
      res.setHeader(key, corsHeaders[key]);
    });
    res.status(200).end();
    return;
  }
  
  // Verificar se é uma requisição POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Método não permitido',
      message: 'Esta API só aceita requisições POST'
    });
  }
  
  try {
    const { sign, use_cache = true, isRebel = false } = req.body;
    
    // Validar o signo
    if (!sign) {
      return res.status(400).json({ 
        error: 'Parâmetro obrigatório',
        message: 'O signo não foi especificado'
      });
    }
    
    const today = getCurrentDateBrazil();
    const cacheKey = `${sign}_${today}_${isRebel ? 'rebel' : 'normal'}`;
    
    // Verificar cache se permitido
    if (use_cache && horoscopeCache.has(cacheKey)) {
      // Definir cabeçalhos CORS
      Object.keys(corsHeaders).forEach(key => {
        res.setHeader(key, corsHeaders[key]);
      });
      return res.status(200).json(horoscopeCache.get(cacheKey));
    }
    
    // Gerar descrição e conselho
    console.log(`Gerando horóscopo para ${sign}... ${isRebel ? '(estilo rebelde)' : ''}`);
    const description = await generateHoroscopeText(sign, isRebel, false);
    const advice = await generateHoroscopeText(sign, isRebel, true);
    
    // Criar resumo (apenas para versão não-rebelde)
    let summary = "";
    if (!isRebel) {
      summary = await generateRebelSummary(sign, description, advice);
    }
    
    // Criar resposta
    const horoscopeData = {
      sign: sign,
      date: today,
      description: description,
      luckyNumber: getLuckyNumber(),
      color: getRandomColor(),
      advice: advice,
      isRebel: isRebel
    };
    
    // Adicionar o resumo apenas para versão não-rebelde
    if (!isRebel) {
      horoscopeData.summary = summary;
    }
    
    // Armazenar no cache
    horoscopeCache.set(cacheKey, horoscopeData);
    
    // Definir cabeçalhos CORS
    Object.keys(corsHeaders).forEach(key => {
      res.setHeader(key, corsHeaders[key]);
    });
    
    // Retornar resposta
    return res.status(200).json(horoscopeData);
    
  } catch (error) {
    console.error('Erro na API:', error);
    // Definir cabeçalhos CORS
    Object.keys(corsHeaders).forEach(key => {
      res.setHeader(key, corsHeaders[key]);
    });
    return res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
}

// Nova função para gerar o resumo rebelde com base na descrição e no conselho
async function generateRebelSummary(sign, description, advice) {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY não configurada nas variáveis de ambiente');
  }
  
  try {
    // Configuração para a API OpenRouter
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://astrogenapp.vercel.app/'
    };
    
    // Prompt para resumo rebelde
    const prompt = `Você é um jovem brasileiro rebelde e debochado que detesta astrologia e "clichês astrológicos". 
    
    Baseando-se nas informações abaixo sobre o horóscopo de ${sign} para hoje (${getCurrentDateBrazil()}), crie um resumo extremamente direto e sem rodeios.
    
    A descrição do horóscopo de ${sign} hoje diz: "${description}"
    O conselho para ${sign} hoje é: "${advice}"
    
    Regras importantes:
    - Seu resumo DEVE refletir o conteúdo real da descrição/conselho, mas de forma bem direta e até um pouco rude
    - SEJA DEBOCHADO! Se o horóscopo é positivo, diga que "tá ok" ou "menos mal". Se é negativo, diga que "tá uma bosta mesmo"
    - Não use muitas gírias, apenas uma ou duas no máximo se necessário
    - Use um tom mais irônico e cético, não tente soar "descolado"
    - Evite termos específicos de gênero como "mina" ou "cara", mantenha neutro
    - Seja breve: máximo 1-2 frases curtas e diretas
    - Se o horóscopo menciona amor, trabalho ou saúde, seja mais direto sobre o que realmente significa
    - Não estique as palavras (tipo "caaaara") e evite emojis
    - Ideal que soe como alguém que diz verdades duras, mas sem ser grosseiro demais
    
    OBS: Este resumo será mostrado DEPOIS que a pessoa já leu a descrição formal e o conselho, então você está dando uma versão mais crua e direta do que já foi dito.`;
    
    // Dados para enviar à API
    const data = {
      messages: [
        { role: "user", content: prompt }
      ],
      model: "google/gemma-3-4b-it:free",
      max_tokens: 500,
      temperature: 0.9
    };
    
    // Enviando requisição para OpenRouter
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', data, { headers });
    
    // Extraindo a resposta gerada
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Erro ao gerar resumo rebelde:', error);
    return `Resumo rebelde não disponível: ${error.message}`;
  }
} 
