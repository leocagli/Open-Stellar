#!/bin/bash

# Script para subir Open-Stellar a GitHub
# Ejecuta esto en tu máquina local, no en Codespaces

set -e

echo "🌟 Subiendo Open-Stellar a GitHub..."
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "start-moltbot.sh" ]; then
    echo "❌ Error: Debes ejecutar este script desde el directorio moltworker"
    exit 1
fi

# Reemplazar README
if [ -f "README_OPEN_STELLAR.md" ]; then
    echo "📝 Actualizando README..."
    cp README.md README_ORIGINAL.md.bak
    cp README_OPEN_STELLAR.md README.md
    git add README.md
fi

# Eliminar archivos temporales
echo "🧹 Limpiando archivos temporales..."
rm -f README_OPEN_STELLAR.md CREATE_OPEN_STELLAR.md setup-open-stellar.sh

# Verificar remote
if git remote | grep -q "^stellar$"; then
    echo "✓ Remote 'stellar' ya existe"
else
    echo "➕ Agregando remote 'stellar'..."
    git remote add stellar https://github.com/leocagli/Open-Stellar.git
fi

# Commit de cambios si hay
if [ -n "$(git status --porcelain)" ]; then
    echo "💾 Haciendo commit de cambios..."
    git add .
    git commit -m "feat: Initial Open-Stellar setup

- Groq API integration with Llama 3.3 70B
- Token-based authentication
- WebSocket proxy support
- Admin UI with React
- R2 storage support
- Debug routes for development" || echo "No hay cambios para commitear"
fi

# Push a GitHub
echo "🚀 Subiendo a GitHub..."
git push -u stellar main --force

echo ""
echo "✅ ¡Completado!"
echo ""
echo "Tu repositorio está disponible en:"
echo "https://github.com/leocagli/Open-Stellar"
echo ""
