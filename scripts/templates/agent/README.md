# {{PROJECT_NAME}}

An AI agent project scaffolded with [Open-Stellar](https://github.com/Killerjunior/Open-Stellar).

## Getting Started

1. **Configure environment**

   ```bash
   cp .env.example .env.local
   # Edit .env.local and fill in your API keys
   ```

2. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Register your agent**

   Edit `lib/agent.ts` to configure your agent's name, description, and capabilities.

## Project Structure

```
{{PROJECT_NAME}}/
├── app/
│   └── page.tsx          # Agent dashboard (entry point)
├── lib/
│   └── agent.ts          # Agent registration and runtime stub
├── .env.example          # Environment variable template
├── .env.local            # Your local secrets (git-ignored)
├── next.config.mjs       # Next.js configuration
├── package.json
└── tsconfig.json
```

## Environment Variables

See [`.env.example`](.env.example) for all required and optional variables with descriptions.

## Learn More

- [Open-Stellar Docs](https://github.com/Killerjunior/Open-Stellar)
- [Stellar Network](https://stellar.org)
- [Next.js Docs](https://nextjs.org/docs)
