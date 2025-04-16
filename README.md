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

- **Frontend**: React, TypeScript, TailwindCSS, Vite
- **Backend**: Node.js, API REST
- **Integração de IA**: OpenRouter API (Claude 3 Sonnet)
- **Deploy**: Vercel

## Arquitetura do Sistema

O sistema é composto por duas partes principais:

### Frontend (React/TypeScript)
- Interface responsiva e moderna com efeitos visuais
- Armazenamento local (localStorage) para controle de consultas diárias
- Detecção automática de ambiente (desenvolvimento/produção)
- Adaptação automática ao fuso horário brasileiro (GMT-3)

### Backend (Node.js)
- API RESTful para geração de horóscopos
- Cache de resultados para otimizar requisições
- Integração com OpenRouter para acesso ao modelo Claude 3 Sonnet
- Sistema de prompts específicos para cada tipo de conteúdo (descrição, conselho, resumo rebelde)

## Instalação Local

### Pré-requisitos

- Node.js 16+ e npm

### Passos para instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/Lordmatrix133/AstroGen.git
   cd AstroGen
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente criando um arquivo `.env` na raiz do projeto:
   ```
   OPENROUTER_API_KEY=sua_chave_openrouter_aqui
   ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   # Inicia tanto o frontend quanto o servidor API
   npm start
   
   # Ou inicie cada um separadamente
   # Terminal 1: Frontend
   npm run dev
   
   # Terminal 2: API local
   npm run server
   ```

5. Acesse em seu navegador: `http://localhost:5173`

## Estrutura de Arquivos

```
├── api/                      # API do backend
│   └── horoscope-api.js      # Implementação da API de horóscopo
├── src/                      # Código do frontend
│   ├── App.tsx               # Componente principal da aplicação
│   ├── index.css             # Estilos globais
│   ├── main.tsx              # Ponto de entrada React
│   └── types.d.ts            # Definições de tipos TypeScript
├── local_server.js           # Servidor local para desenvolvimento
├── .env                      # Configurações de ambiente (não versionado)
├── package.json              # Dependências e scripts
├── vite.config.ts            # Configuração do Vite
└── tailwind.config.js        # Configuração do TailwindCSS
```

## Fluxo da Aplicação

1. O usuário seleciona seu signo na interface
2. Ao consultar, o frontend envia uma requisição à API
3. A API verifica se há cache disponível para o signo/data
4. Se não houver cache, a API faz duas requisições ao OpenRouter:
   - Uma para gerar a descrição e conselho
   - Outra para gerar o resumo rebelde
5. A API formata e retorna os dados para o frontend
6. O frontend exibe os resultados e marca a consulta como realizada para aquele dia

## Configuração da API OpenRouter

O sistema utiliza a API OpenRouter para acessar o modelo Claude 3 Sonnet da Anthropic. A configuração é feita através da variável de ambiente `OPENROUTER_API_KEY`.

Para obter uma chave:
1. Crie uma conta em [openrouter.ai](https://openrouter.ai/)
2. Gere uma chave de API no painel de controle
3. Adicione a chave ao arquivo `.env`

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

## Limitações e Considerações

- O sistema utiliza armazenamento local (localStorage) para controlar consultas diárias, portanto usar navegadores diferentes ou limpar o cache permitirá novas consultas
- O cache do servidor é volátil e se reinicia quando o servidor é reiniciado
- As requisições à API OpenRouter podem incorrer em custos, dependendo do volume de uso

## Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

## Licença

MIT

## Desenvolvido por Lordmatrix

---

Powered by AstroGen 🌟 # AstroGen
