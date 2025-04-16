const { spawn } = require('child_process');

/**
 * Cria uma função que executa um script Python com os argumentos fornecidos
 * @param {string} scriptPath - Caminho para o script Python
 * @returns {Function} - Função que executa o script Python
 */
export function createPythonCaller(scriptPath) {
  return function(args) {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [scriptPath, JSON.stringify(args)]);
      
      let result = '';
      let errorOutput = '';
      
      pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.error(`Python stderr: ${data}`);
      });
      
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python process exited with code ${code}: ${errorOutput}`));
          return;
        }
        
        try {
          const jsonResult = JSON.parse(result);
          resolve(jsonResult);
        } catch (e) {
          reject(new Error(`Failed to parse Python output: ${e.message}\nOutput: ${result}`));
        }
      });
    });
  };
} 