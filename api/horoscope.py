import json
import os
import requests
from datetime import datetime
import random
import re

# Chave da API OpenRouter - obtém da variável de ambiente ou usa o valor padrão
API_KEY = os.environ.get('OPENROUTER_API_KEY')
if not API_KEY:
    raise ValueError("OPENROUTER_API_KEY não configurada nas variáveis de ambiente")
API_URL = 'https://openrouter.ai/api/v1/chat/completions'

# Sistema de cache para armazenar respostas anteriores
response_cache = {}

def parse_ai_response(text):
    """Tenta extrair dados estruturados da resposta da IA"""
    data = {
        "description": text, 
        "luckyNumber": random.randint(1, 100),
        "color": random.choice(['Azul Celestial', 'Verde Esperança', 'Vermelho Paixão', 'Roxo Místico', 'Amarelo Solar', 'Laranja Energético']),
        "advice": "Lembre-se: rir é o melhor remédio.",
        "summary": "O Oráculo está tirando uma soneca, mas te deseja um dia... interessante!",
        "date": datetime.now().strftime("%d/%m/%Y")
    }
    
    patterns = {
        'description': r"Descrição:\s*(.*?)(?:Número da Sorte:|Cor:|Conselho:|Resumindo:|$)",
        'luckyNumber': r"Número da Sorte:\s*(\d+)",
        'color': r"Cor:\s*(.*?)(?:Conselho:|Resumindo:|$)", 
        'advice': r"Conselho:\s*(.*?)(?:Resumindo:|$)",
        'summary': r"Resumindo:\s*(.*?)(?:$)" 
    }
    
    extracted_description = False
    clean_text = text.strip()
    
    for key, pattern in patterns.items():
        match = re.search(pattern, clean_text, re.DOTALL | re.IGNORECASE | re.MULTILINE)
        if match:
            value = match.group(1).strip()
            if value:
                if key == 'luckyNumber':
                    try:
                        data[key] = int(value)
                    except ValueError:
                        pass 
                else:
                    data[key] = value.replace('*', '')
                    if key == 'description':
                        extracted_description = True

    if not extracted_description or data['description'] == clean_text:
        first_match_index = len(clean_text)
        relevant_patterns = [p for k, p in patterns.items() if k != 'description']
        for pattern_val in relevant_patterns:
             match = re.search(pattern_val, clean_text, re.DOTALL | re.IGNORECASE | re.MULTILINE)
             if match and match.start() < first_match_index:
                 first_match_index = match.start()
        
        data['description'] = clean_text[:first_match_index].strip()
        data['description'] = re.sub(r"^Descrição:\s*", "", data['description'], flags=re.IGNORECASE | re.MULTILINE).strip()
        data['description'] = data['description'].replace('*', '')
        if not data['description']:
            data['description'] = clean_text.split('\n')[0].strip().replace('*', '')

    for key in ['color', 'advice', 'summary']:
        if key in data:
             if isinstance(data[key], str):
                 data[key] = data[key].replace('*', '')
                 for next_key_label in ['Número da Sorte:', 'Cor:', 'Conselho:', 'Resumindo:']:
                     if next_key_label.lower() in data[key].lower():
                         data[key] = data[key][:data[key].lower().find(next_key_label.lower())].strip()
                         break

    # Limpeza final do summary para remover repetições dos dados se o parser falhar
    if isinstance(data['summary'], str):
        if f"número da sorte é {data['luckyNumber']}" in data['summary'].lower():
             data['summary'] = data['summary'].split('.')[0] + '.' # Tenta pegar só a primeira frase
        elif f"cor {data['color']}" in data['summary'].lower():
             data['summary'] = data['summary'].split('.')[0] + '.'

    return data

def generate_rebel_summary(cached_data):
    """Gera um resumo rebelde e engraçado a partir do cache"""
    prompt = f"""Crie um resumo CURTO, REBELDE e ENGRAÇADO para o seguinte horóscopo SÉRIO:
Descrição: {cached_data.get('description', 'Nenhuma descrição disponível')}
Número da Sorte: {cached_data.get('luckyNumber', 7)}
Cor: {cached_data.get('color', 'Indefinida')}
Conselho: {cached_data.get('advice', 'Nenhum conselho disponível')}

SEU RESUMO DEVE:
1. Ser EXTREMAMENTE REBELDE, SARCÁSTICO e DEBOCHADO
2. Zombar das previsões de forma engraçada, fazendo um contraste forte com o tom sério do horóscopo
3. Ter no máximo 2-3 frases curtas e impactantes
4. Incluir pelo menos um palavrão
5. Mencionar o número da sorte {cached_data.get('luckyNumber', 7)} de forma irônica
6. Zombar da previsão/conselho como se fossem "óbvios demais" ou totalmente inúteis

EXEMPLO de tom (adaptar para o conteúdo real):
"Número {cached_data.get('luckyNumber', 7)}? Que merda de sorte é essa? Com esse conselho profundo de '{cached_data.get('advice', 'seja você mesmo')}', você tá mais fodido que peixe no deserto!"
"""

    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://astrogenapp.vercel.app/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    data = {
        "model": "deepseek/deepseek-chat:free",
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }
    
    try:
        response = requests.post(API_URL, json=data, headers=headers)
        if response.status_code == 200:
            response_data = response.json()
            summary = response_data['choices'][0]['message']['content']
            # Remover formatações extras que a IA possa incluir
            summary = summary.replace('Resumo:', '').replace('Resumindo:', '').strip()
            return summary
        else:
            return "Número da sorte é só {cached_data.get('luckyNumber', 7)}? Caralho, que previsão de merda! Os astros devem estar de ressaca hoje."
    except Exception:
        return "Puta que pariu! As estrelas estão ocupadas, mas seu número continua sendo {cached_data.get('luckyNumber', 7)}!"

def handler(event, context):
    """
    Função serverless para Vercel
    """
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
    }
    
    method = event.get('httpMethod', '')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers, 'body': ''}
    if method != 'POST':
        return {'statusCode': 405, 'headers': cors_headers, 'body': json.dumps({'error': 'Método não permitido'})}
    
    try:
        body = json.loads(event.get('body', '{}'))
        sign = body.get('sign', '')
        use_cache = body.get('use_cache', False)
        
        if not sign:
            return {'statusCode': 400, 'headers': cors_headers, 'body': json.dumps({'error': 'Signo não fornecido'})}
        
        # Verificar se devemos gerar um resumo rebelde a partir do cache
        if use_cache and sign in response_cache:
            cached_data = response_cache[sign]
            rebel_summary = generate_rebel_summary(cached_data)
            cached_data['summary'] = rebel_summary
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps(cached_data)
            }
        
        print(f"Recebida solicitação para o signo: {sign}")
        
        # Prompt atualizado: Descrição e conselho mais sérios e maduros
        prompt = f"""Para o signo de {sign}, gere um horóscopo para o dia de HOJE.
1.  **Descrição:** Crie uma descrição SÉRIA, MADURA e CONCISA (1-2 frases) que soe relevante para as energias astrais de HOJE. Mencione alguma influência planetária real, e evite humor exagerado ou linguagem infantil. A descrição deve ser respeitosa e útil, como encontrada em um horóscopo profissional.

2.  **Dados Adicionais:** Gere os seguintes dados:
    Número da Sorte: [Número inteiro]
    Cor: [Nome da Cor]
    Conselho: [Um conselho diário SÉRIO e REFLEXIVO, que realmente possa ajudar a pessoa. Evite humor, excentricidades ou linguagem informal demais]

3.  **Resumo Final:** Adicione um comentário final com o título 'Resumindo:'.
    -   Esta seção será substituída automaticamente por um resumo rebelde gerado pelo sistema.

Siga EXATAMENTE este formato completo, sem adicionar nada fora do padrão:
Descrição: [Texto sério e conciso sobre HOJE]
Número da Sorte: [Número]
Cor: [Cor]
Conselho: [Conselho sério e maduro]
Resumindo: [Qualquer texto - será substituído]
"""
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {API_KEY}',
            'HTTP-Referer': 'https://astrogenapp.vercel.app/',
        }
        data = {
            "model": "deepseek/deepseek-chat:free",
            "messages": [
                {"role": "user", "content": prompt}
            ]
        }
        
        print(f"Enviando requisição para OpenRouter para o signo {sign}")
        
        response = requests.post(API_URL, json=data, headers=headers)
        
        if response.status_code == 200:
            response_data = response.json()
            print(f"Resposta recebida com sucesso para {sign}")
            ai_response_text = response_data['choices'][0]['message']['content']
            print("Texto bruto da IA:\n---\n", ai_response_text, "\n---")
            
            horoscope_data = parse_ai_response(ai_response_text)
            
            # Salvar a resposta no cache
            response_cache[sign] = horoscope_data
            
            print("Dados parseados:", json.dumps(horoscope_data, indent=2))
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps(horoscope_data)
            }
        else:
            error_message = f"Erro na API: Status {response.status_code}, {response.text}"
            print(error_message)
            return {'statusCode': 500, 'headers': cors_headers, 'body': json.dumps({'error': 'Erro ao consultar a API OpenRouter', 'details': error_message})}
            
    except Exception as e:
        print(f"Erro na função: {str(e)}")
        return {'statusCode': 500, 'headers': cors_headers, 'body': json.dumps({'error': 'Erro ao processar sua solicitação', 'details': str(e)})}

# Adicionar no final do arquivo
if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        # Quando executado como um script, o primeiro argumento é o JSON com os dados
        import json
        body = json.loads(sys.argv[1])
        mock_event = {
            'httpMethod': 'POST',
            'body': json.dumps(body)
        }
        result = handler(mock_event, {})
        print(result.get('body', '')) 