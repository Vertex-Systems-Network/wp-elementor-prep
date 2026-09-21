import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const NODE_VERSION = '22.12.0';
const NODE_ENGINE = '>=22.12.0';

const WORKFLOWS = [
  '.github/workflows/ci.yml',
  '.github/workflows/codeql.yml',
  '.github/workflows/p12-final-release.yml',
  '.github/workflows/p12-offline-acceptance.yml',
  '.github/workflows/p15-real-target-proof.yml',
  '.github/workflows/p17-local-browser-proof.yml',
];

describe('coordinated Node 22 toolchain contract', () => {
  it('pins the supported runtime floor and explicit test/build toolchain', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
    const root = lock.packages?.[''];

    expect(readFileSync('.nvmrc', 'utf8').trim()).toBe(NODE_VERSION);
    expect(pkg.engines?.node).toBe(NODE_ENGINE);
    expect(root?.engines?.node).toBe(NODE_ENGINE);

    expect(pkg.devDependencies?.vitest).toBe('5.0.1');
    expect(pkg.devDependencies?.vite).toBe('8.3.0');
    expect(pkg.devDependencies?.esbuild).toBe('0.28.2');
    expect(pkg.devDependencies?.['playwright-core']).toBe('1.63.0');
    expect(pkg.devDependencies?.['@types/node']).toBe('^26.6.1');

    expect(lock.packages?.['node_modules/vitest']?.version).toBe('5.0.1');
    expect(lock.packages?.['node_modules/vite']?.version).toBe('8.3.0');
    expect(lock.packages?.['node_modules/esbuild']?.version).toBe('0.28.2');
    expect(lock.packages?.['node_modules/playwright-core']?.version).toBe('1.63.0');
    expect(lock.packages?.['node_modules/@types/node']?.version).toBe('26.6.1');
  });

  it('runs every Node-backed acceptance workflow on the same exact Node floor', () => {
    for (const path of WORKFLOWS) {
      const workflow = readFileSync(path, 'utf8');
      expect(workflow).toContain(`node-version: ${NODE_VERSION}`);
      expect(workflow).not.toContain('node-version: 20');
      expect(workflow).not.toContain('--legacy-peer-deps');
      expect(workflow).not.toContain('npm install --force');
    }
  });

  it('does not retain the one-shot lockfile writer in the accepted tree', () => {
    expect(() => readFileSync('.github/workflows/toolchain-lockfile-refresh.yml', 'utf8')).toThrow();
  });
});
