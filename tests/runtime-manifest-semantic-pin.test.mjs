import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { inspectRuntimeArtifact, manifestSemanticSha256 } from '../scripts/runtime-artifact-preflight.mjs';

const SOURCE_SHA = '810d98d6e09cb4cf3fe4758fcb07e87734254a8e';
const RUN_ID = '34242984963';
const RUN_NUMBER = '488';
const VERIFIER = 'verify-p5-evidence.mjs';
const CANONICAL_MANIFEST_SEMANTIC_SHA256 = '640b8cf980c1ff43230656fc453c9f581ad5aa4ad35da45e766e53bfd00ccf46';

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function canonicalManifest(id = '000000000000000000') {
  return {
    name: 'Pella Elementor Prep',
    id,
    api: '1.0.0',
    editorType: ['figma'],
    main: 'code.js',
    ui: 'ui.html',
    documentAccess: 'dynamic-page',
    menu: [
      { name: 'Open', command: 'open' },
      { name: 'Developer: P5 Runtime Self-Test', command: 'p5-runtime-self-test' },
      { name: 'Developer: P5 Runtime Evidence', command: 'p5-runtime-evidence' }
    ],
    networkAccess: { allowedDomains: ['none'] }
  };
}

function makeFixture(manifest) {
  const dir = mkdtempSync(join(tmpdir(), 'runtime-manifest-pin-'));
  writeFileSync(join(dir, 'BUILD_INFO.txt'), [
    `source_sha=${SOURCE_SHA}`,
    `workflow_sha=${SOURCE_SHA}`,
    `run_id=${RUN_ID}`,
    `run_number=${RUN_NUMBER}`,
    'figma_plugin_id=000000000000000000',
    ''
  ].join('\n'));
  writeFileSync(join(dir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  for (const name of ['code.js', 'ui.html', 'prepare-figma-import.mjs', VERIFIER]) {
    writeFileSync(join(dir, name), `fixture:${name}`);
  }
  return dir;
}

function registryFor(dir, manifestSemanticSha256Value = CANONICAL_MANIFEST_SEMANTIC_SHA256) {
  const immutableFiles = ['BUILD_INFO.txt', 'code.js', 'ui.html', 'prepare-figma-import.mjs', VERIFIER];
  return {
    schemaVersion: 3,
    tracks: {
      p5: {
        branch: 'feat/p5-safe-recipes',
        issue: 6,
        sourceSha: SOURCE_SHA,
        runId: RUN_ID,
        runNumber: RUN_NUMBER,
        artifactName: 'figma-plugin-dist-488',
        digest: `sha256:${'0'.repeat(64)}`,
        manifestSemanticSha256: manifestSemanticSha256Value,
        verifier: VERIFIER,
        immutableFileSha256: Object.fromEntries(immutableFiles.map((name) => [name, sha256(join(dir, name))])),
        requiredMenuCommands: ['p5-runtime-self-test', 'p5-runtime-evidence'],
        finalClosureEligible: true,
        closureNote: 'Canonical exact build fixture.'
      }
    }
  };
}

function withFixture(manifest, callback) {
  const dir = makeFixture(manifest);
  try {
    return callback(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe('runtime manifest semantic pin', () => {
  it('matches the independently recorded canonical P5 manifest semantic hash', () => {
    expect(manifestSemanticSha256(canonicalManifest())).toBe(CANONICAL_MANIFEST_SEMANTIC_SHA256);
  });

  it('accepts the canonical manifest under schema v3', () => {
    withFixture(canonicalManifest(), (dir) => {
      const result = inspectRuntimeArtifact('p5', dir, { registry: registryFor(dir) });
      expect(result.ok).toBe(true);
      expect(result.manifestSemanticIntegrity.required).toBe(true);
      expect(result.manifestSemanticIntegrity.matched).toBe(true);
    });
  });

  it('accepts a numeric plugin-id-only rebind with the same semantic hash', () => {
    withFixture(canonicalManifest('12345678901234567890'), (dir) => {
      const result = inspectRuntimeArtifact('p5', dir, { registry: registryFor(dir) });
      expect(result.ok).toBe(true);
      expect(result.needsManifestRebind).toBe(false);
      expect(result.manifestSemanticIntegrity.matched).toBe(true);
      expect(result.manifestSemanticIntegrity.observedSha256).toBe(CANONICAL_MANIFEST_SEMANTIC_SHA256);
    });
  });

  it('fails closed when any non-id manifest semantic content drifts', () => {
    const manifest = canonicalManifest('12345678901234567890');
    manifest.name = 'Tampered Plugin Name';
    withFixture(manifest, (dir) => {
      const result = inspectRuntimeArtifact('p5', dir, { registry: registryFor(dir) });
      expect(result.ok).toBe(false);
      expect(result.manifestSemanticIntegrity.matched).toBe(false);
      expect(result.errors.join('\n')).toContain('Manifest semantic SHA-256 mismatch (plugin id excluded)');
    });
  });

  it('fails closed when schema v3 omits the manifest semantic pin', () => {
    withFixture(canonicalManifest(), (dir) => {
      const result = inspectRuntimeArtifact('p5', dir, { registry: registryFor(dir, null) });
      expect(result.ok).toBe(false);
      expect(result.manifestSemanticIntegrity.required).toBe(true);
      expect(result.manifestSemanticIntegrity.expectedSha256).toBe(null);
      expect(result.errors.join('\n')).toContain('Registry manifest semantic SHA-256 is missing or invalid');
    });
  });
});
