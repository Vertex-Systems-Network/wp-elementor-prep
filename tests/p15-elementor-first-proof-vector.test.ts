import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_FIRST_PROOF_ELEMENTOR_VERSION,
  P15_ELEMENTOR_FIRST_PROOF_VECTOR_FILENAMES,
  P15_ELEMENTOR_FIRST_PROOF_WORDPRESS_VERSION,
  buildP15ElementorFirstProofVector,
} from '../src/targets/elementor/first-proof-vector';

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function fixtureDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'p15-first-proof-vector-test-'));
  tempDirs.push(dir);
  return dir;
}

function runVector(outDir: string) {
  return spawnSync(process.execPath, [
    'scripts/p15-elementor-first-proof-vector.mjs',
    '--out-dir', outDir,
  ], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });
}

describe('P15 first controlled Elementor target-proof operator vector', () => {
  it('rebuilds the exact candidate/profile/template file set deterministically through production helpers', () => {
    const first = buildP15ElementorFirstProofVector();
    const second = buildP15ElementorFirstProofVector();

    expect(first.files).toEqual(second.files);
    expect(Object.keys(first.files).sort()).toEqual([...P15_ELEMENTOR_FIRST_PROOF_VECTOR_FILENAMES].sort());
    expect(first.manifest.candidateStatus).toBe('READY_FOR_TARGET_IMPORT_VALIDATION');
    expect(first.manifest.importValidationStatus).toBe('NOT_RUN');
    expect(first.candidateIdentity.digest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(first.targetProfileFingerprint).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(first.profile.environment).toEqual({
      source: 'DECLARED',
      wordpressVersion: P15_ELEMENTOR_FIRST_PROOF_WORDPRESS_VERSION,
      elementorVersion: P15_ELEMENTOR_FIRST_PROOF_ELEMENTOR_VERSION,
    });
  });

  it('contains only the already-supported bounded Container fidelity slice with no asset dependency', () => {
    const vector = buildP15ElementorFirstProofVector();
    const template = JSON.parse(vector.files['template.json']) as {
      type: string;
      content: Array<{
        elType: string;
        settings: Record<string, unknown>;
        elements: Array<{ widgetType?: string }>;
      }>;
    };
    const root = template.content[0];

    expect(template.type).toBe('page');
    expect(root?.elType).toBe('container');
    expect(root?.settings.background_background).toBe('classic');
    expect(root?.settings.background_color).toBe('#336699');
    expect(root?.settings.border_radius).toEqual({
      unit: 'px',
      top: '12',
      right: '12',
      bottom: '12',
      left: '12',
      isLinked: true,
    });
    expect(root?.elements.map((element) => element.widgetType)).toEqual(['heading', 'text-editor']);
    expect(vector.files['template.json']).not.toContain('"widgetType":"image"');
  });

  it('keeps the frozen vector explicitly non-authorizing and unobserved', () => {
    const manifest = buildP15ElementorFirstProofVector().manifest;

    expect(manifest.targetEnvironmentObserved).toBe(false);
    expect(manifest.importObserved).toBe(false);
    expect(manifest.editorObserved).toBe(false);
    expect(manifest.renderObserved).toBe(false);
    expect(manifest.acceptanceAuthority).toBe(false);
    expect(manifest.targetCompatibilityClaim).toBe(false);
    expect(manifest.productionAcceptance).toBe(false);
    expect(manifest.internalReviewRequired).toBe(true);
    expect(manifest.declaredTarget.architecture).toBe('CONTAINER');
    expect(manifest.declaredTarget.outputMode).toBe('TEMPLATE_JSON');
    expect(manifest.declaredTarget.atomicElements).toBe('UNSUPPORTED');
  });

  it('writes a new vector, verifies an exact existing vector, and refuses to overwrite drift', () => {
    const dir = fixtureDir();
    const outDir = join(dir, 'vector');

    const generated = runVector(outDir);
    expect(generated.status).toBe(0);
    expect(JSON.parse(generated.stdout).status).toBe('GENERATED');
    for (const filename of P15_ELEMENTOR_FIRST_PROOF_VECTOR_FILENAMES) {
      expect(readFileSync(join(outDir, filename), 'utf8')).toBe(
        buildP15ElementorFirstProofVector().files[filename],
      );
    }

    const verified = runVector(outDir);
    expect(verified.status).toBe(0);
    expect(JSON.parse(verified.stdout).status).toBe('VERIFIED_EXISTING');

    const candidatePath = join(outDir, 'candidate.json');
    const drifted = `${readFileSync(candidatePath, 'utf8')} `;
    writeFileSync(candidatePath, drifted);
    const rejected = runVector(outDir);
    expect(rejected.status).toBe(2);
    expect(rejected.stderr).toContain('Existing vector drift detected in candidate.json');
    expect(readFileSync(candidatePath, 'utf8')).toBe(drifted);
  });

  it('rejects duplicate output options rather than using last-write-wins', () => {
    const dir = fixtureDir();
    const first = join(dir, 'a');
    const second = join(dir, 'b');
    const run = spawnSync(process.execPath, [
      'scripts/p15-elementor-first-proof-vector.mjs',
      '--out-dir', first,
      '--out-dir', second,
    ], { cwd: process.cwd(), encoding: 'utf8' });

    expect(run.status).toBe(2);
    expect(run.stderr).toContain('Duplicate option: --out-dir.');
  });
});
