import { describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { inspectRuntimeArtifact } from '../scripts/runtime-artifact-preflight.mjs';

const P5 = {
  sourceSha: '810d98d6e09cb4cf3fe4758fcb07e87734254a8e',
  runId: '34242984963',
  runNumber: '488',
  verifier: 'verify-p5-evidence.mjs',
  commands: ['open', 'p5-runtime-self-test', 'p5-runtime-evidence']
};

const P6 = {
  sourceSha: '9a6ae3b29e2f70ebbd987a686856c2957f590b75',
  runId: '34244113623',
  runNumber: '494',
  verifier: 'verify-p6-closure.mjs',
  commands: ['open', 'p5-runtime-self-test', 'p5-runtime-evidence', 'p6-page-flow-calibration', 'p6-runtime-evidence']
};

function makeArtifact(track, overrides = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'runtime-artifact-preflight-'));
  const build = {
    sourceSha: track.sourceSha,
    workflowSha: track.sourceSha,
    runId: track.runId,
    runNumber: track.runNumber,
    ...overrides.build
  };
  writeFileSync(join(dir, 'BUILD_INFO.txt'), [
    `source_sha=${build.sourceSha}`,
    `workflow_sha=${build.workflowSha}`,
    `run_id=${build.runId}`,
    `run_number=${build.runNumber}`,
    'figma_plugin_id=000000000000000000',
    ''
  ].join('\n'));

  const commands = overrides.commands || track.commands;
  writeFileSync(join(dir, 'manifest.json'), JSON.stringify({
    name: 'Pella Elementor Prep',
    id: overrides.pluginId || '000000000000000000',
    api: '1.0.0',
    editorType: ['figma'],
    main: 'code.js',
    ui: 'ui.html',
    documentAccess: 'dynamic-page',
    menu: commands.map((command) => ({ name: command, command })),
    networkAccess: { allowedDomains: ['none'] }
  }, null, 2));

  for (const file of ['code.js', 'ui.html', 'prepare-figma-import.mjs', track.verifier]) {
    writeFileSync(join(dir, file), `fixture:${file}`);
  }
  return dir;
}

function withArtifact(track, overrides, callback) {
  const dir = makeArtifact(track, overrides);
  try {
    return callback(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe('runtime artifact preflight', () => {
  it('accepts canonical P5 for final closure and requires manifest rebinding', () => {
    withArtifact(P5, {}, (dir) => {
      const result = inspectRuntimeArtifact('p5', dir, { intent: 'final-closure' });
      expect(result.ok).toBe(true);
      expect(result.needsManifestRebind).toBe(true);
      expect(result.registeredArtifact.finalClosureEligible).toBe(true);
    });
  });

  it('rejects P6 reference artifact for final closure', () => {
    withArtifact(P6, {}, (dir) => {
      const result = inspectRuntimeArtifact('p6', dir, { intent: 'final-closure' });
      expect(result.ok).toBe(false);
      expect(result.errors.join('\n')).toContain('not eligible for final closure');
    });
  });

  it('allows P6 reference inspection with a warning', () => {
    withArtifact(P6, {}, (dir) => {
      const result = inspectRuntimeArtifact('p6', dir, { intent: 'reference' });
      expect(result.ok).toBe(true);
      expect(result.warnings.join('\n')).toContain('Reference engineering build only');
    });
  });

  it('fails closed on build identity mismatch', () => {
    withArtifact(P5, { build: { runNumber: '999' } }, (dir) => {
      const result = inspectRuntimeArtifact('p5', dir, { intent: 'final-closure' });
      expect(result.ok).toBe(false);
      expect(result.errors.join('\n')).toContain('BUILD_INFO mismatch for run_number');
    });
  });

  it('fails closed when a required runtime menu command is missing', () => {
    withArtifact(P5, { commands: ['open', 'p5-runtime-evidence'] }, (dir) => {
      const result = inspectRuntimeArtifact('p5', dir, { intent: 'final-closure' });
      expect(result.ok).toBe(false);
      expect(result.errors.join('\n')).toContain('p5-runtime-self-test');
    });
  });
});
