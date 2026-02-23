import { existsSync, readdirSync } from 'fs';

const base = '/vercel/share/v0-next-shadcn/node_modules';

console.log('=== Check binaries ===');
console.log('next exists:', existsSync(`${base}/.bin/next`));
console.log('vite exists:', existsSync(`${base}/.bin/vite`));
console.log('wrangler exists:', existsSync(`${base}/.bin/wrangler`));

console.log('\n=== Check packages ===');
console.log('next pkg:', existsSync(`${base}/next`));
console.log('vite pkg:', existsSync(`${base}/vite`));
console.log('@cloudflare pkg:', existsSync(`${base}/@cloudflare`));
console.log('wrangler pkg:', existsSync(`${base}/wrangler`));

console.log('\n=== .bin directory listing ===');
try {
  const bins = readdirSync(`${base}/.bin`).filter(b => 
    b.includes('vite') || b.includes('next') || b.includes('wrangler') || b.includes('cloudflare')
  );
  console.log('Relevant bins:', bins);
} catch(e) {
  console.log('Error reading .bin:', e.message);
}

console.log('\n=== Check running processes ===');
import { execSync } from 'child_process';
try {
  const ps = execSync('ps aux | grep -E "vite|next" | grep -v grep').toString();
  console.log('Running processes:\n', ps);
} catch(e) {
  console.log('No vite/next processes found');
}
