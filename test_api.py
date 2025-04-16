import requests
import json

# Chave da API OpenRouter (mesma do arquivo de função)
API_KEY = 'test-key-for-testing-purposes-only'
API_URL = 'https://openrouter.ai/api/v1/chat/completions'

def test_horoscope_api(sign):
    # Definindo o prompt para o modelo
    prompt = f"""Dê-me um horóscopo divertido e extrovertido para o signo de {sign} para hoje. 
    Seja engraçado e irreverente, mas forneça informações claras. 
    Inclua: uma descrição geral do dia, um número da sorte, uma cor do dia e algum conselho divertido."""
    
    # Configuração para a requisição da API
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {API_KEY}',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'HTTP-Referer': 'https://astrogenapp.vercel.app/',  # Recomendado pela documentação
    }
    
    # Dados para enviar ao OpenRouter
    data = {
        "model": "deepseek/deepseek-chat:free",
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }
    
    print(f"Enviando requisição para OpenRouter para o signo {sign}")
    print(f"Usando cabeçalho de autorização: Bearer {API_KEY[:10]}...")
    
    # Mostrar dados sendo enviados (sem exibir a chave completa)
    print(f"Dados enviados: {json.dumps(data, indent=2)}")
    
    # Enviar a requisição para a API
    response = requests.post(API_URL, json=data, headers=headers)
    
    # Verificar se a requisição foi bem-sucedida
    if response.status_code == 200:
        response_data = response.json()
        print(f"Resposta recebida com sucesso para {sign}")
        
        # Extrair a resposta do modelo
        ai_response = response_data['choices'][0]['message']['content']
        print("\n--- HORÓSCOPO GERADO ---")
        print(f"Signo: {sign}")
        print(f"Resposta: {ai_response}")
        print("------------------------\n")
        
        return ai_response
    else:
        error_message = f"Erro na API: Status {response.status_code}, {response.text}"
        print(error_message)
        return None

if __name__ == "__main__":
    # Teste com um signo
    sign = input("Digite um signo do zodíaco para testar (ex: Áries, Touro, etc): ")
    test_horoscope_api(sign) 