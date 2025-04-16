import http from 'http';
import url from 'url';
import * as dotenv from 'dotenv';
import handler from './api/horoscope-api.js';

// Carregar variáveis de ambiente
dotenv.config();

// Porta na qual o servidor vai rodar
const PORT = 9999;

// Servidor HTTP simples
const server = http.createServer((req, res) => {
  // Configurar CORS para todas as respostas
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Tratamento de requisições OPTIONS (preflight CORS)
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }
  
  // Verificar se é uma requisição POST para o endpoint correto
  if (req.method === 'POST' && req.url === '/api/horoscope') {
    let body = '';
    
    // Coletar dados da requisição
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    // Processar os dados quando a requisição terminar
    req.on('end', async () => {
      try {
        // Converter os dados para objeto
        const data = JSON.parse(body);
        
        // Criar objeto de requisição e resposta adaptados para o handler
        const mockReq = {
          method: 'POST',
          body: data
        };
        
        const mockRes = {
          statusCode: 200,
          headers: {},
          body: '',
          
          // Métodos para simular a API do objeto res do Vercel
          status(code) {
            this.statusCode = code;
            return this;
          },
          
          setHeader(name, value) {
            this.headers[name] = value;
          },
          
          json(data) {
            this.body = JSON.stringify(data);
            return this;
          },
          
          end() {
            return this;
          }
        };
        
        // Chamar o handler da API
        await handler(mockReq, mockRes);
        
        // Configurar a resposta HTTP
        res.statusCode = mockRes.statusCode;
        
        // Adicionar cabeçalhos
        Object.keys(mockRes.headers).forEach(key => {
          res.setHeader(key, mockRes.headers[key]);
        });
        
        // Sempre enviar como JSON
        res.setHeader('Content-Type', 'application/json');
        
        // Enviar resposta
        res.end(mockRes.body);
      } catch (error) {
        console.error('Erro ao processar requisição:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          error: 'Erro interno do servidor',
          message: error.message
        }));
      }
    });
  } else {
    // Para outros caminhos ou métodos, retornar 404
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Caminho não encontrado' }));
  }
});

// Iniciar o servidor
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Endpoint disponível:`);
  console.log(`  - http://localhost:${PORT}/api/horoscope`);
}); 