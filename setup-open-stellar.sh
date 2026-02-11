#!/bin/bash

# Open Stellar Setup Script
# Este script prepara el repositorio para ser subido a GitHub

set -e

echo "🌟 Open Stellar - GitHub Setup"
echo "================================"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}Paso 1:${NC} Creando repositorio en GitHub..."
echo ""
echo "Por favor, ve a: https://github.com/new"
echo ""
echo "Y crea un repositorio con estos datos:"
echo "  - Nombre: Open-Stellar"
echo "  - Descripción: Open Stellar - AI-powered Moltbot gateway on Cloudflare Workers with Groq integration"
echo "  - Público: Sí"
echo "  - NO agregues README, .gitignore ni licencia"
echo ""
read -p "Presiona ENTER cuando hayas creado el repositorio..."

echo ""
echo -e "${BLUE}Paso 2:${NC} Configurando remote..."
git remote remove stellar 2>/dev/null || true
git remote add stellar https://github.com/leocagli/Open-Stellar.git
echo -e "${GREEN}✓${NC} Remote 'stellar' configurado"

echo ""
echo -e "${BLUE}Paso 3:${NC} Verificando archivos modificados..."
MODIFIED_FILES=$(git status --porcelain | wc -l)
if [ "$MODIFIED_FILES" -eq 0 ]; then
    echo -e "${YELLOW}⚠${NC}  No hay cambios pendientes, creando commit con estado actual..."
    
    # Crear un README para Open Stellar
    cat > README.md << 'EOF'
# 🌟 Open Stellar

AI-powered Moltbot gateway running on Cloudflare Workers with free Groq LLM integration.

## Features

- 🚀 **Cloudflare Workers**: Runs in Cloudflare's edge network
- 🤖 **Groq Integration**: Free LLM API with Llama 3.3 70B (14,400 requests/day)
- 🔒 **Secure**: Token-based authentication
- 🌐 **WebSocket Support**: Real-time chat interface
- 💾 **R2 Storage**: Optional persistent storage for chat history

## Quick Start

1. Clone the repository
2. Copy `.dev.vars.example` to `.dev.vars`
3. Add your Groq API key to `.dev.vars`
4. Run `npm install`
5. Run `npm run build && npm run start`

## Configuration

Required environment variables in `.dev.vars`:

```bash
OPENAI_API_KEY=your_groq_api_key_here
OPENAI_BASE_URL=https://api.groq.com/openai/v1
MOLTBOT_GATEWAY_TOKEN=your_groq_api_key_here
DEV_MODE=true
DEBUG_ROUTES=true
```

## Get Groq API Key

1. Go to https://console.groq.com/
2. Sign up for a free account
3. Navigate to API Keys
4. Create a new API key

## Development

```bash
npm run dev      # Start Vite dev server
npm run start    # Start wrangler local dev
npm run build    # Build worker + client
npm run deploy   # Deploy to Cloudflare
```

## License

MIT
EOF
    
    git add README.md
    git commit -m "docs: Add Open Stellar README" || true
fi

echo ""
echo -e "${BLUE}Paso 4:${NC} Subiendo a GitHub..."
git push -u stellar main --force

echo ""
echo -e "${GREEN}✓ ¡Completado!${NC}"
echo ""
echo "Tu repositorio está disponible en:"
echo "https://github.com/leocagli/Open-Stellar"
echo ""
