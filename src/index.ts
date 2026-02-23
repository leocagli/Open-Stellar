// Stub entry for Cloudflare Workers compatibility
// The actual app is rendered via index.html -> src/main.tsx
export default {
  async fetch(request: Request): Promise<Response> {
    return new Response("Moltbot City", { status: 200 })
  },
}
