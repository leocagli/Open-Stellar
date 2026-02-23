import { execSync } from 'child_process';
import { existsSync } from 'fs';

const base = '/vercel/share/v0-next-shadcn/node_modules';

// List what's actually there
try {
  const viteExists = existsSync(`${base}/vite`);
  const cfExists = existsSync(`${base}/@cloudflare`);
  const wranglerExists = existsSync(`${base}/wrangler`);
  const miniflareExists = existsSync(`${base}/miniflare`);
  
  console.log('vite exists:', viteExists);
  console.log('@cloudflare exists:', cfExists);
  console.log('wrangler exists:', wranglerExists);
  console.log('miniflare exists:', miniflareExists);

  // Force remove with rm -rf
  if (viteExists) {
    execSync(`rm -rf ${base}/vite`);
    console.log('Removed vite');
  }
  if (cfExists) {
    execSync(`rm -rf ${base}/@cloudflare`);
    console.log('Removed @cloudflare');
  }
  if (wranglerExists) {
    execSync(`rm -rf ${base}/wrangler`);
    console.log('Removed wrangler');
  }
  if (miniflareExists) {
    execSync(`rm -rf ${base}/miniflare`);
    console.log('Removed miniflare');
  }
  
  // Also remove vite binaries
  try { execSync(`rm -f ${base}/.bin/vite`); } catch(e) {}
  try { execSync(`rm -f ${base}/.bin/vitest`); } catch(e) {}
  try { execSync(`rm -f ${base}/.bin/wrangler`); } catch(e) {}
  try { execSync(`rm -f ${base}/.bin/wrangler2`); } catch(e) {}
  try { execSync(`rm -f ${base}/.bin/miniflare`); } catch(e) {}
  try { execSync(`rm -f ${base}/.bin/workerd`); } catch(e) {}
  
  // Also remove vitest and related
  try { execSync(`rm -rf ${base}/vitest`); } catch(e) {}
  try { execSync(`rm -rf ${base}/@vitejs`); } catch(e) {}
  try { execSync(`rm -rf ${base}/@vitest`); } catch(e) {}
  
  // Check wrangler.jsonc in root
  const wranglerJsonc = '/vercel/share/v0-next-shadcn/wrangler.jsonc';
  console.log('wrangler.jsonc exists:', existsSync(wranglerJsonc));
  
  // Check if vite config exists
  const viteConfig = '/vercel/share/v0-next-shadcn/vite.config.ts';
  console.log('vite.config.ts exists:', existsSync(viteConfig));
  
  // Verify removal
  console.log('---AFTER CLEANUP---');
  console.log('vite exists:', existsSync(`${base}/vite`));
  console.log('@cloudflare exists:', existsSync(`${base}/@cloudflare`));
  console.log('wrangler exists:', existsSync(`${base}/wrangler`));

} catch(err) {
  console.error('Error:', err.message);
}
