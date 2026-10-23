import { chmod, copyFile, mkdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(new URL('../node_modules/@deno/linux-x64-glibc/deno', import.meta.url));
const target = fileURLToPath(new URL('../api/runtime/deno', import.meta.url));

await stat(source);
await mkdir(fileURLToPath(new URL('../api/runtime/', import.meta.url)), { recursive: true });
await copyFile(source, target);
await chmod(target, 0o755);
console.log('Prepared the Deno runtime for the Python media functions.');
