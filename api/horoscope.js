// Este arquivo será executado quando a rota /api/horoscope for acessada
import { createPythonCaller } from '../utils/pythonCaller';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    // Configurar cabeçalhos CORS para requisições OPTIONS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).end();
    return;
  }
  
  if (req.method === 'POST') {
    try {
      // Importar o módulo Python dinâmicamente
      const { spawn } = require('child_process');
      
      // Executar o script Python
      const pythonProcess = spawn('python', ['api/horoscope.py', JSON.stringify(req.body)]);
      
      let result = '';
      
      // Capturar a saída do script Python
      pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
      });
      
      // Lidar com erros
      pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
      });
      
      // Quando o processo terminar
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          res.status(500).json({ error: 'Erro ao processar a requisição' });
          return;
        }
        
        try {
          const jsonResult = JSON.parse(result);
          res.status(200).json(jsonResult);
        } catch (e) {
          res.status(500).json({ error: 'Erro ao processar o resultado', details: e.message });
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST', 'OPTIONS']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 