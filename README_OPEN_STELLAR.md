# 🌟 Open Stellar

> AI-powered Moltbot gateway running on Cloudflare Workers with **free** Groq LLM integration

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/leocagli/Open-Stellar)

## ✨ Features

- 🚀 **Cloudflare Workers** - Runs at the edge, globally distributed
- 🤖 **Groq Integration** - Free LLM API with **Llama 3.3 70B** (14,400 requests/day)
- 🔒 **Secure** - Token-based authentication with DEV_MODE support
- 🌐 **WebSocket Support** - Real-time chat interface with message streaming
- 💾 **R2 Storage** - Optional persistent storage for chat history
- 🎯 **Admin UI** - Built-in React dashboard for device management
- 🗺️ **Interactive Agent Map** - NEW! Visualize and control AI agents on an interactive map
- 🔧 **Debug Routes** - Development tools and API testing endpoints

## 🚀 Quick Start

### 1. Get Your Free Groq API Key

1. Go to [console.groq.com](https://console.groq.com/)
2. Sign up for a free account
3. Navigate to **API Keys** section
4. Click **Create API Key**
5. Copy your key (starts with `gsk_...`)

### 2. Clone and Setup

```bash
git clone https://github.com/leocagli/Open-Stellar.git
cd Open-Stellar
npm install
```

### 3. Configure Environment

Create `.dev.vars` file:

```bash
# Groq Configuration
OPENAI_API_KEY=your_groq_api_key_here
OPENAI_BASE_URL=https://api.groq.com/openai/v1
MOLTBOT_GATEWAY_TOKEN=your_groq_api_key_here

# Development Settings
DEV_MODE=true
DEBUG_ROUTES=true
```

### 4. Build and Run

```bash
npm run build
npm run start
```

Visit `http://localhost:8789` in your browser.

## 📚 Available Models

Open Stellar automatically configures these Groq models:

- **Llama 3.3 70B Versatile** (Primary) - 131K context
- **Llama 3.1 70B Versatile** - 131K context
- **Mixtral 8x7B** - 32K context
- **Gemma 2 9B** - 8K context

## 🏗️ Architecture

```
Browser → Cloudflare Worker → Sandbox Container → Moltbot Gateway → Groq API
```

The worker proxies HTTP and WebSocket traffic to a Moltbot instance running in a Cloudflare Sandbox container, which then communicates with the Groq API.

## 📖 Documentation

- [`AGENTS.md`](AGENTS.md) - Development guide for AI agents
- [`MAP_FEATURE.md`](MAP_FEATURE.md) - Interactive Agent Map documentation
- [`README.md`](README.md) - This file
- [`CREATE_OPEN_STELLAR.md`](CREATE_OPEN_STELLAR.md) - Repository setup guide

## 🔧 Development

```bash
npm run dev        # Start Vite dev server for UI development
npm run start      # Start wrangler dev (local worker)
npm run build      # Build worker + client
npm run deploy     # Deploy to Cloudflare Workers
npm run test       # Run tests with Vitest
npm run typecheck  # TypeScript type checking
```

## 🌐 Deployment

### Prerequisites

- Cloudflare account
- Wrangler CLI configured
- Domain (optional, workers.dev provided by default)

### Deploy

```bash
# Set production secrets
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put MOLTBOT_GATEWAY_TOKEN

# Deploy
npm run deploy
```

Your worker will be available at `https://your-worker.your-subdomain.workers.dev`

## 🔐 Security Notes

- Never commit `.dev.vars` to git (already in `.gitignore`)
- Use `npx wrangler secret put` for production secrets
- The `MOLTBOT_GATEWAY_TOKEN` should match your `OPENAI_API_KEY` for simplicity
- Enable Cloudflare Access for production deployments

## 📝 Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your Groq API key | `gsk_...` |
| `OPENAI_BASE_URL` | Groq API endpoint | `https://api.groq.com/openai/v1` |
| `MOLTBOT_GATEWAY_TOKEN` | Gateway authentication token | Same as API key |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `DEV_MODE` | Skip authentication checks | `false` |
| `DEBUG_ROUTES` | Enable `/debug/*` endpoints | `false` |
| `R2_ACCESS_KEY_ID` | R2 storage access key | - |
| `R2_SECRET_ACCESS_KEY` | R2 storage secret | - |
| `CF_ACCOUNT_ID` | Cloudflare account ID | - |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built on [Moltbot](https://molt.bot/) by Anthropic
- Powered by [Groq](https://groq.com/) for lightning-fast LLM inference
- Running on [Cloudflare Workers](https://workers.cloudflare.com/)

## 🔗 Links

- [Groq Documentation](https://console.groq.com/docs)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Moltbot Documentation](https://docs.molt.bot/)

---

Made with ❤️ for the open source community
