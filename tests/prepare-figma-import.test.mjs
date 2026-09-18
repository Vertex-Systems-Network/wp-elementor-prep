import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const helperPath = fileURLToPath(new URL('../scripts/prepare-figma-import.mjs', import.meta.url));
const PLUGIN_ID = '12345678901234567890';

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function makeSource(root) {
  const source = join(root, 'artifact');
  mkdirSync(source, { recursive: true });
  writeFileSync(join(source, 'code.js'), 'fixture compiled runtime\n');
  writeFileSync(join(source, 'ui.html'), '<html>fixture ui</html>\n');
  writeFileSync(join(source, 'BUILD_INFO.txt'), 'source_sha=fixture\n');
  writeFileSync(join(source, 'manifest.json'), `${JSON.stringify({
    name: 'Fixture',
    id: '000000000000000000',
    api: '1.0.0',
    editorType: ['figma'],
    main: 'code.js',
    ui: 'ui.html',
    networkAccess: { allowedDomains: ['none'] }
  }, null, 2)}\n`);
  return source;
}

function runHelper(source, output) {
  return spawnSync(process.execPath, [helperPath, PLUGIN_ID, source, output], {
    encoding: 'utf8'
  });
}

describe('prepare-figma-import output safety', () => {
  it('rejects an output directory nested inside the source artifact', () => {
    const root = mkdtempSync(join(process.cwd(), '.prepare-figma-import-'));
    try {
      const source = makeSource(root);
      const output = join(source, 'dist-local');
      const result = runHelper(source, output);

      expect(result.status).not.toBe(0);
      expect(`${result.stdout}\n${result.stderr}`).toContain('Unsafe path overlap');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('rejects manifest targets that traverse outside the source artifact', () => {
    const root = mkdtempSync(join(process.cwd(), '.prepare-figma-import-'));
    try {
      const source = makeSource(root);
      writeFileSync(join(root, 'outside.js'), 'outside secret fixture\n');
      const manifestPath = join(source, 'manifest.json');
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
      manifest.main = '../outside.js';
      writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

      const result = runHelper(source, join(root, 'artifact-local'));
      expect(result.status).not.toBe(0);
      expect(`${result.stdout}\n${result.stderr}`).toContain('escapes the source artifact');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('rejects absolute manifest target paths', () => {
    const root = mkdtempSync(join(process.cwd(), '.prepare-figma-import-'));
    try {
      const source = makeSource(root);
      const outside = resolve(root, 'outside.js');
      writeFileSync(outside, 'outside secret fixture\n');
      const manifestPath = join(source, 'manifest.json');
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
      manifest.main = outside;
      writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

      const result = runHelper(source, join(root, 'artifact-local'));
      expect(result.status).not.toBe(0);
      expect(`${result.stdout}\n${result.stderr}`).toContain('must be relative to the source artifact');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it.skipIf(process.platform === 'win32')('rejects manifest targets that are symbolic links', () => {
    const root = mkdtempSync(join(process.cwd(), '.prepare-figma-import-'));
    try {
      const source = makeSource(root);
      const outside = join(root, 'outside.js');
      writeFileSync(outside, 'outside secret fixture\n');
      const link = join(source, 'linked.js');
      symlinkSync(outside, link);
      const manifestPath = join(source, 'manifest.json');
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
      manifest.main = 'linked.js';
      writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

      const result = runHelper(source, join(root, 'artifact-local'));
      expect(result.status).not.toBe(0);
      expect(`${result.stdout}\n${result.stderr}`).toContain('non-symlink regular file');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('prepares a sibling output with compiled bytes unchanged and manifest id only rebound', () => {
    const root = mkdtempSync(join(process.cwd(), '.prepare-figma-import-'));
    try {
      const source = makeSource(root);
      const output = join(dirname(source), 'artifact-local');
      const sourceManifest = JSON.parse(readFileSync(join(source, 'manifest.json'), 'utf8'));
      const sourceCodeSha = sha256(join(source, 'code.js'));
      const sourceUiSha = sha256(join(source, 'ui.html'));

      const result = runHelper(source, output);
      expect(result.status).toBe(0);
      expect(result.stderr).toBe('');
      expect(sha256(join(output, 'code.js'))).toBe(sourceCodeSha);
      expect(sha256(join(output, 'ui.html'))).toBe(sourceUiSha);

      const preparedManifest = JSON.parse(readFileSync(join(output, 'manifest.json'), 'utf8'));
      expect(preparedManifest).toEqual({ ...sourceManifest, id: PLUGIN_ID });
      expect(JSON.parse(readFileSync(join(source, 'manifest.json'), 'utf8'))).toEqual(sourceManifest);

      const localInfo = readFileSync(join(output, 'LOCAL_IMPORT_INFO.txt'), 'utf8');
      expect(localInfo).toContain('compiled_targets_unchanged=true');
      expect(localInfo).toContain(`prepared_manifest_id=${PLUGIN_ID}`);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
