// Local preview only. The application itself is entirely static.
import { createServer } from 'node:http';
import { readFile, realpath } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, sep, extname } from 'node:path';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const root = await realpath(process.argv.includes('--dist') ? resolve(project, 'dist') : project);
// Apply the same headers as Netlify when reviewing the distribution locally.
const securityHeaders = Object.fromEntries((await readFile(resolve(root, '_headers'), 'utf8'))
  .split(/\r?\n/).filter(line => /^\s+[^:]+:/.test(line))
  .map(line => { const colon = line.indexOf(':'); return [line.slice(0, colon).trim(), line.slice(colon + 1).trim()]; }));
const port = Number(process.env.DUOLAB_PORT ?? 4173);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('DUOLAB_PORT must be an integer between 1024 and 65535.');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };
const publicFiles = new Set(['index.html', 'assets/favicon.svg', 'assets/css/styles.css', 'assets/js/app.js', 'assets/js/i18n.js', 'assets/js/calculadora.js', 'assets/js/tradicional.js', 'assets/js/adivinhacao.js']);

createServer(async (request, response) => {
  const headers = { ...securityHeaders, 'Cache-Control': 'no-store' };
  try {
    const url = new URL(request.url, 'http://127.0.0.1');
    const pathname = decodeURIComponent(url.pathname).replace(/^\/PESSOAIS\//, '/');
    const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
    if (!['GET', 'HEAD'].includes(request.method) || !publicFiles.has(relative)) {
      response.writeHead(404, headers).end();
      return;
    }
    const target = await realpath(resolve(root, relative));
    if (!target.startsWith(root + sep)) {
      response.writeHead(404, headers).end();
      return;
    }
    const content = await readFile(target);
    response.writeHead(200, { ...headers, 'Content-Type': types[extname(target)] });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch {
    response.writeHead(404, headers).end();
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Duo Lab: http://127.0.0.1:${port}/`);
  console.log('Ctrl+C para encerrar / to stop');
}).on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? `Porta ${port} em uso / Port ${port} is in use.` : error.message);
  process.exitCode = 1;
});
