# 🌟 Crear Repositorio Open-Stellar

## Opción 1: Desde la Web (Más Fácil)

1. **Crea el repositorio en GitHub**:
   - Ve a: https://github.com/new
   - Nombre: `Open-Stellar`
   - Descripción: `🌟 Open Stellar - AI-powered Moltbot gateway on Cloudflare Workers with Groq integration`
   - Público
   - **NO** marques: Add README, Add .gitignore, Choose a license

2. **Sube el código**:
   ```bash
   cd /workspaces/moltworker
   git remote add stellar https://github.com/leocagli/Open-Stellar.git
   git push -u stellar main
   ```

## Opción 2: Desde tu Máquina Local

Si tienes GitHub CLI instalado con permisos completos:

```bash
# Clona este repositorio
git clone https://github.com/leocagli/moltworker.git
cd moltworker

# Crea el nuevo repositorio
gh repo create Open-Stellar --public \
  --description "🌟 Open Stellar - AI Moltbot on Cloudflare Workers with Groq" \
  --source=. --push

# O si prefieres hacerlo manualmente:
gh repo create Open-Stellar --public \
  --description "🌟 Open Stellar - AI Moltbot on Cloudflare Workers with Groq"

git remote add stellar https://github.com/TU_USUARIO/Open-Stellar.git
git push -u stellar main
```

## Opción 3: Script Automático

Ejecuta el script incluido:

```bash
cd /workspaces/moltworker
./setup-open-stellar.sh
```

El script te guiará paso a paso.

## Nota Importante 🔒

El archivo `.dev.vars` contiene tu API key de Groq y **NO** debe subirse a GitHub.
Ya está incluido en `.gitignore` para protegerlo.

## Después de Crear el Repositorio

1. Ve a Settings > Secrets and variables > Actions
2. Agrega estos secretos para deployment automático:
   - `CLOUDFLARE_API_TOKEN`: Tu token de Cloudflare
   - `CLOUDFLARE_ACCOUNT_ID`: Tu account ID
   - `OPENAI_API_KEY`: Tu Groq API key

---

¿Por qué no se puede crear desde aquí?

El token de GitHub en este ambiente tiene permisos limitados de solo lectura
para seguridad. Necesitas crearlo manualmente o desde tu máquina local donde
tienes control total de tu cuenta de GitHub.
