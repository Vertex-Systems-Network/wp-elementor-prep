import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const WORKFLOWS = readdirSync('.github/workflows')
  .filter((name) => /\.ya?ml$/i.test(name))
  .map((name) => `.github/workflows/${name}`)
  .sort();

const INSTALL_WORKFLOWS = [
  '.github/workflows/ci.yml',
  '.github/workflows/p12-final-release.yml',
  '.github/workflows/p12-offline-acceptance.yml',
];

function read(path) {
  return readFileSync(path, 'utf8');
}

function actionPins(workflow) {
  return [...workflow.matchAll(/^\s*-?\s*uses:\s*([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)?)@([^\s#]+)/gm)]
    .map((match) => ({ action: match[1], ref: match[2] }));
}

function checkoutStep(workflow) {
  const lines = workflow.split('\n');
  const index = lines.findIndex((line) => line.includes('uses: actions/checkout@'));
  return index >= 0 ? lines.slice(index, index + 8).join('\n') : '';
}

describe('security supply-chain contract', () => {
  it('commits a deterministic npm lockfile', () => {
    expect(existsSync('package-lock.json')).toBe(true);
    const lock = JSON.parse(read('package-lock.json'));
    expect(lock.name).toBe('wp-elementor-prep');
    expect(lock.lockfileVersion).toBe(3);
    expect(lock.packages).toBeTypeOf('object');
    expect(lock.packages['']).toBeTypeOf('object');
  });

  it('keeps trusted workflows read-only and pins first-party actions by immutable SHA', () => {
    for (const path of WORKFLOWS) {
      const workflow = read(path);
      expect(workflow).toContain('permissions:\n  contents: read');
      expect(workflow).not.toMatch(/pull_request_target\s*:/);
      expect(workflow).not.toMatch(/contents:\s*write/);

      const pins = actionPins(workflow);
      for (const pin of pins) {
        expect(pin.ref, `${path}: ${pin.action}`).toMatch(/^[0-9a-f]{40}$/i);
      }
    }
  });

  it('rejects mutable dependency installs and mutable container service tags in every workflow', () => {
    for (const path of WORKFLOWS) {
      const workflow = read(path);
      expect(workflow, `${path}: mutable npm install`).not.toMatch(/\bnpm install\b/);

      for (const match of workflow.matchAll(/^\s*image:\s*([^\s#]+)/gm)) {
        expect(match[1], `${path}: container image`).toMatch(/@sha256:[0-9a-f]{64}$/i);
      }
    }
  });

  it('does not persist checkout credentials into later build steps', () => {
    for (const path of WORKFLOWS) {
      const workflow = read(path);
      if (!workflow.includes('uses: actions/checkout@')) continue;
      const step = checkoutStep(workflow);
      expect(step, `${path}: checkout credentials`).toContain('persist-credentials: false');
    }
  });

  it('installs the exact locked dependency graph in build-bearing workflows', () => {
    for (const path of INSTALL_WORKFLOWS) {
      const workflow = read(path);
      expect(workflow).toMatch(/\bnpm ci\b/);
      expect(workflow).not.toMatch(/\bnpm install\b/);
    }
  });

  it('keeps CodeQL narrowly permissioned and scans JavaScript/TypeScript', () => {
    const workflow = read('.github/workflows/codeql.yml');
    expect(workflow).toContain('contents: read');
    expect(workflow).toContain('security-events: write');
    expect(workflow).toContain('languages: javascript-typescript');
    expect(workflow).toMatch(/\bnpm audit --audit-level=moderate\b/);
    expect(workflow).not.toMatch(/contents:\s*write/);
    expect(workflow).not.toMatch(/pull-requests:\s*write/);
  });

  it('keeps Integration Readiness always-reporting on pull requests', () => {
    const workflow = read('.github/workflows/integration-readiness.yml');
    expect(workflow).toMatch(/\n  pull_request:\s*\n/);
    expect(workflow).not.toMatch(/\n  pull_request:\s*\n\s+paths:/);
    expect(workflow).not.toMatch(/\n  pull_request:\s*\n\s+paths-ignore:/);
  });

  it('enables automated npm and GitHub Actions dependency update monitoring', () => {
    expect(existsSync('.github/dependabot.yml')).toBe(true);
    const dependabot = read('.github/dependabot.yml');
    expect(dependabot).toContain('package-ecosystem: npm');
    expect(dependabot).toContain('package-ecosystem: github-actions');
    expect(dependabot.match(/interval:\s*weekly/g)?.length).toBe(2);
  });

  it('does not retain the temporary write-capable lockfile bootstrap', () => {
    expect(existsSync('.github/workflows/security-lockfile-bootstrap.yml')).toBe(false);
  });

  it('ignores common local secret and private-key material', () => {
    const gitignore = read('.gitignore');
    for (const pattern of [
      '.env.*',
      '*.pem',
      '*.key',
      '*.p12',
      '*.pfx',
      'credentials.json',
      'service-account*.json',
    ]) {
      expect(gitignore).toContain(pattern);
    }
  });
});
