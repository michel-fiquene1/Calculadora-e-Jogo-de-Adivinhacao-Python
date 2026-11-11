import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSite, publicFiles } from '../scripts/build.mjs';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'duolab-build-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const file of publicFiles) {
    await mkdir(dirname(join(root, file)), { recursive: true });
    await cp(join(project, file), join(root, file));
  }
  return root;
}

test('distribution excludes development files and stale output without changing source assets', async t => {
  const root = await fixture(t);
  for (const file of ['.env', 'README.md', 'assets/private.txt', 'scripts/serve.mjs', 'tests/example.mjs', 'dist/stale.txt']) {
    await mkdir(dirname(join(root, file)), { recursive: true });
    await writeFile(join(root, file), 'not a public asset');
  }
  const output = await buildSite(root);
  const files = (await readdir(output, { recursive: true, withFileTypes: true }))
    .filter(entry => entry.isFile()).map(entry => join(entry.parentPath, entry.name).slice(output.length + 1).replaceAll('\\', '/'));
  assert.deepEqual(files.sort(), [...publicFiles].sort());
  for (const file of publicFiles) assert.deepEqual(await readFile(join(output, file)), await readFile(join(root, file)));
  assert.equal(await readFile(join(root, '.env'), 'utf8'), 'not a public asset');
});

test('missing required source aborts the build before replacing the previous distribution', async t => {
  const root = await fixture(t);
  await mkdir(join(root, 'dist'));
  await writeFile(join(root, 'dist', 'index.html'), 'previous successful release');
  await rm(join(root, 'assets', 'js', 'app.js'));
  await assert.rejects(buildSite(root), { code: 'ENOENT' });
  assert.equal(await readFile(join(root, 'dist', 'index.html'), 'utf8'), 'previous successful release');
});

test('deployment policy preserves the application CSP and prohibits framing and unused capabilities', async () => {
  const html = await readFile(join(project, 'index.html'), 'utf8');
  const headers = await readFile(join(project, '_headers'), 'utf8');
  const policy = html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)[1];
  const deployedPolicy = headers.match(/Content-Security-Policy: ([^\r\n]+)/)[1];
  for (const directive of policy.split(';').map(value => value.trim())) assert.ok(deployedPolicy.includes(directive));
  assert.doesNotMatch(deployedPolicy, /unsafe-inline|unsafe-eval/);
  assert.match(deployedPolicy, /frame-ancestors 'none'/);
  assert.match(headers, /X-Content-Type-Options: nosniff/);
  assert.match(headers, /Referrer-Policy: no-referrer/);
  assert.match(headers, /Permissions-Policy: camera=\(\), microphone=\(\), geolocation=\(\), payment=\(\), usb=\(\)/);
});
