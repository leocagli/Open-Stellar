import { rmSync, existsSync } from 'fs';
import { join } from 'path';

const baseDir = '/vercel/share/v0-next-shadcn/node_modules';

const targets = [
  '.bin/vite',
  '.bin/vitest',
  '.bin/wrangler',
  '.bin/wrangler2',
  '.bin/miniflare',
  '.bin/workerd',
  '@cloudflare',
  'vite',
  'vitest',
  'wrangler',
  'miniflare',
];

for (const target of targets) {
  const fullPath = join(baseDir, target);
  if (existsSync(fullPath)) {
    try {
      rmSync(fullPath, { recursive: true, force: true });
      console.log(`Removed: ${fullPath}`);
    } catch (e) {
      console.log(`Failed to remove ${fullPath}: ${e.message}`);
    }
  } else {
    console.log(`Not found: ${fullPath}`);
  }
}

console.log('Cleanup complete!');
