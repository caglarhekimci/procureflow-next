import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
// Standalone changes cwd; preserve the caller's durable database location.
process.env.DATABASE_PATH = resolve(process.env.DATABASE_PATH ?? 'data/procureflow.sqlite');
process.env.HOSTNAME ??= '127.0.0.1';
await import(pathToFileURL(resolve('.next/standalone/server.js')).href);
