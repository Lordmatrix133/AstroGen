// API de horóscopo implementada em JavaScript
import axios from 'axios';

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
    
    if (isAdvice) {
      // Prompt para conselho
      prompt = `Como astrólogo profissional, forneça um conselho astral curto e útil para o signo de ${sign} hoje (${getCurrentDateBrazil()}). Use tom profissional e inspirador. Limite a resposta a apenas uma frase concisa (máximo 15 palavras).`;
    } else if (isRebel) {
      // Prompt para resumo rebelde
      prompt = `Como um especialista em astrologia com bom senso de humor, escreva um resumo rebelde, engraçado e direto para a previsão diária do signo de ${sign} para hoje (${getCurrentDateBrazil()}). Use linguagem coloquial, gírias e palavrões de forma moderada, mas mantenha uma opinião sincera sobre o dia. Seja conciso, direto e engraçado. Limite a resposta a no máximo 2 frases curtas (máximo 20 palavras total).`;
    } else {
      // Prompt para descrição detalhada
      prompt = `Como um astrólogo profissional, crie uma previsão astrológica concisa para o signo de ${sign} para hoje (${getCurrentDateBrazil()}). Mencione brevemente uma influência planetária e seus efeitos. Seja breve e direto. Limite a resposta a 2-3 frases (máximo 60 palavras).`;
    }
    
    // Dados para enviar à API
    const data = {
      messages: [
        { role: "user", content: prompt }
      ],
      model: "anthropic/claude-3-sonnet-20240229",
      max_tokens: 500,
      temperature: 0.7
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
    const { sign, use_cache = true } = req.body;
    
    // Validar o signo
    if (!sign) {
      return res.status(400).json({ 
        error: 'Parâmetro obrigatório',
        message: 'O signo não foi especificado'
      });
    }
    
    const today = getCurrentDateBrazil();
    const cacheKey = `${sign}_${today}`;
    
    // Verificar cache se permitido
    if (use_cache && horoscopeCache.has(cacheKey)) {
      // Definir cabeçalhos CORS
      Object.keys(corsHeaders).forEach(key => {
        res.setHeader(key, corsHeaders[key]);
      });
      return res.status(200).json(horoscopeCache.get(cacheKey));
    }
    
    // Gerar descrição, conselho e resumo
    const description = await generateHoroscopeText(sign, false);
    const advice = await generateHoroscopeText(sign, false, true);
    const summary = await generateHoroscopeText(sign, true);
    
    // Criar resposta
    const horoscopeData = {
      sign: sign,
      date: today,
      description: description,
      luckyNumber: getLuckyNumber(),
      color: getRandomColor(),
      advice: advice,
      summary: summary
    };
    
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