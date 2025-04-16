#!/bin/bash

# Instalar dependências Python
pip install -r requirements.txt

# Instalar dependências Node.js e construir o frontend
npm install
npm run build 