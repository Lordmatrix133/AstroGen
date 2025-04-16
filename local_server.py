import json
import http.server
import socketserver
from urllib.parse import urlparse, parse_qs
from api.horoscope import handler

# Porta na qual o servidor vai rodar
PORT = 9999

class HoroscopeServer(http.server.SimpleHTTPRequestHandler):
    """Servidor simples para fornecer a função de horóscopo como um endpoint HTTP"""
    
    def do_OPTIONS(self):
        """Manipular solicitações OPTIONS para CORS"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Content-Length', '0')
        self.end_headers()
    
    def do_POST(self):
        """Manipular solicitações POST"""
        # Verificar o caminho da URL
        if self.path == '/api/horoscope' or self.path == '/api/horoscope.py':
            # Obter dados da solicitação
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            # Converter dados para dicionário
            body = json.loads(post_data.decode('utf-8'))
            
            # Criar um evento simulado para a função
            mock_event = {
                'httpMethod': 'POST',
                'body': json.dumps(body)
            }
            
            # Chamar a função do horóscopo
            result = handler(mock_event, {})
            
            # Obter o código de status da resposta
            status_code = result.get('statusCode', 500)
            
            # Configurar a resposta HTTP
            self.send_response(status_code)
            
            # Adicionar cabeçalhos CORS
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            
            # Encerrar cabeçalhos
            self.end_headers()
            
            # Enviar resposta
            self.wfile.write(result.get('body', '').encode('utf-8'))
        else:
            # Para outros caminhos, retornar 404
            self.send_response(404)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Caminho não encontrado'}).encode('utf-8'))

# Configurar e iniciar o servidor
def start_server():
    with socketserver.TCPServer(("", PORT), HoroscopeServer) as httpd:
        print(f"Servidor rodando na porta {PORT}")
        print(f"Endpoints disponíveis:")
        print(f"  - http://localhost:{PORT}/api/horoscope")
        print(f"  - http://localhost:{PORT}/api/horoscope.py")
        httpd.serve_forever()

if __name__ == "__main__":
    start_server() 