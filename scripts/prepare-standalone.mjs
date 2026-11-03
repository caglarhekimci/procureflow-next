import { mkdirSync, readdirSync, copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
// Copy explicitly: portable across Windows workspaces with Unicode paths.
function copyTree(source, target) {
  mkdirSync(target, { recursive: true });
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    const from = join(source, entry.name),
      to = join(target, entry.name);
    if (entry.isDirectory()) copyTree(from, to);
    else copyFileSync(from, to);
  }
}
copyTree('.next/static', '.next/standalone/.next/static');
if (existsSync('public')) copyTree('public', '.next/standalone/public');
