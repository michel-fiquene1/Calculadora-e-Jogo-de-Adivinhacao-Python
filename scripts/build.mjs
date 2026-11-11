// Explicit distribution list: new source files are never published implicitly.
import { lstat, mkdir, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const publicFiles = Object.freeze([
  'index.html',
  'assets/favicon.svg',
  'assets/css/styles.css',
  'assets/js/app.js',
  'assets/js/i18n.js',
  'assets/js/calculadora.js',
  'assets/js/tradicional.js',
  'assets/js/adivinhacao.js',
  '_headers',
]);

export async function buildSite(projectRoot = project) {
  const root = await realpath(projectRoot);
  const output = resolve(root, 'dist');
  // Resolve every source before replacing an existing distribution.
  const files = await Promise.all(publicFiles.map(async relative => {
    const source = await realpath(resolve(root, relative));
    if (!source.startsWith(root + sep)) throw new Error(`Source outside project: ${relative}`);
    return { relative, content: await readFile(source) };
  }));

  const existing = await lstat(output).catch(error => {
    if (error.code !== 'ENOENT') throw error;
    return null;
  });
  if (existing && (existing.isSymbolicLink() || !existing.isDirectory() || await realpath(output) !== output)) {
    throw new Error('Refusing to replace dist: expected a directory inside the project.');
  }
  // output is exactly <resolved project>/dist, never a caller-supplied delete target.
  await rm(output, { recursive: true, force: true });
  for (const { relative, content } of files) {
    const destination = resolve(output, relative);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, content);
  }
  return output;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await buildSite();
  console.log(`Build concluído: ${publicFiles.length - 1} recursos web e configuração de cabeçalhos em dist/.`);
}
