# AstroGen - Gerador de Horóscopo com IA

Um gerador de horóscopo diário que utiliza IA para criar previsões personalizadas e resumos rebeldes para cada signo.

![AstroGen Preview](https://i.postimg.cc/P52wTV9K/images-removebg-preview.png)

## Funcionalidades

- Previsão diária para cada signo do zodíaco
- Descrições sérias e profissionais sobre influências planetárias
- Conselhos úteis e reflexivos
- Resumos rebeldes e engraçados gerados por IA
- Número da sorte e cor do dia
- Limite de uma consulta por dia por usuário
- Adaptado ao fuso horário brasileiro (GMT-3)

## Tecnologias Utilizadas

- **Frontend**: React, TypeScript, TailwindCSS
- **Backend**: Python, API REST
- **Integração de IA**: OpenRouter API (DeepSeek Chat)
- **Deploy**: Vercel

## Instalação Local

### Pré-requisitos

- Node.js 16+ e npm
- Python 3.9+

### Passos para instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/Lordmatrix133/AstroGen.git
   cd AstroGen
   ```

2. Instale as dependências do frontend:
   ```bash
   npm install
   ```

3. Instale as dependências do Python:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure as variáveis de ambiente criando um arquivo `.env` na raiz do projeto:
   ```
   OPENROUTER_API_KEY=sua_chave_openrouter_aqui
   ```

5. Inicie o servidor de desenvolvimento:
   ```bash
   # Terminal 1: Frontend
   npm run dev
   
   # Terminal 2: API local
   python local_server.py
   ```

6. Acesse em seu navegador: `http://localhost:5173`

## Deploy para Vercel

### Configuração manual

1. Faça o push do seu código para o GitHub

2. No Vercel:
   - Importe o projeto diretamente do GitHub
   - Configure as variáveis de ambiente:
     - `OPENROUTER_API_KEY`: sua chave da OpenRouter
   - Defina o framework preset como "Vite"
   - Configure o diretório base como "/"

### Deploy via CLI

```bash
# Instale a CLI da Vercel
npm install -g vercel

# Login na Vercel
vercel login

# Deploy
vercel
```

## Uso

1. Selecione seu signo no menu dropdown
2. Clique em "Consultar"
3. Veja sua previsão diária com:
   - Descrição astrológica
   - Número da sorte
   - Cor do dia
   - Conselho
   - Um resumo rebelde e engraçado

**Importante**: Você só pode fazer uma consulta por dia. Escolha seu signo com cuidado!

## Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

## Licença

MIT

## Desenvolvido por

Dan

---

Powered by AstroGen 🌟 