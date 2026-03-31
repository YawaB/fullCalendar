#!/usr/bin/env node

const [major] = process.versions.node.split('.').map(Number);

if (major < 20 || major >= 23) {
  console.error(`\n[easycal] Unsupported Node.js version: ${process.version}`);
  console.error('[easycal] Please use Node.js 20.x, then reinstall dependencies:');
  console.error('  nvm use 20.19.0');
  console.error('  rm -rf node_modules packages/*/node_modules pnpm-lock.yaml');
  console.error('  pnpm store prune');
  console.error('  pnpm install\n');
  process.exit(1);
}
