import json
from http.server import BaseHTTPRequestHandler
from api.horoscope import handler as horoscope_handler

class Handler(BaseHTTPRequestHandler):
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
        # Obter dados da solicitação
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        
        # Converter dados para dicionário
        body = json.loads(post_data.decode('utf-8'))
        
        # Criar um evento simulado para a função
        mock_event = {
            'httpMethod': 'POST',
            'body': json.dumps(body)
        }
        
        # Chamar a função do horóscopo
        result = horoscope_handler(mock_event, {})
        
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

def handler(request, response):
    return Handler(request, response) 