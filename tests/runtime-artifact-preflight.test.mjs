import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { mkdtempSync, openSync, readFileSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
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

function fileSha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

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

function fixtureRegistry(trackName, track, dir, { finalClosureEligible = true } = {}) {
  const immutableFiles = ['BUILD_INFO.txt', 'code.js', 'ui.html', 'prepare-figma-import.mjs', track.verifier];
  const immutableFileSha256 = Object.fromEntries(
    immutableFiles.map((name) => [name, fileSha256(join(dir, name))])
  );

  return {
    schemaVersion: 2,
    tracks: {
      [trackName]: {
        branch: `fixture/${trackName}`,
        issue: trackName === 'p5' ? 6 : 7,
        sourceSha: track.sourceSha,
        runId: track.runId,
        runNumber: track.runNumber,
        artifactName: `fixture-${trackName}`,
        digest: `sha256:${'0'.repeat(64)}`,
        verifier: track.verifier,
        immutableFileSha256,
        requiredMenuCommands: track.commands.filter((command) => command !== 'open' && command !== 'p5-runtime-evidence'),
        finalClosureEligible,
        closureNote: finalClosureEligible
          ? 'Fixture final closure build.'
          : 'Reference engineering build only. Final build required.'
      }
    }
  };
}

function withArtifact(trackName, track, overrides, options, callback) {
  const dir = makeArtifact(track, overrides);
  try {
    const registry = fixtureRegistry(trackName, track, dir, options);
    return callback(dir, registry);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe('runtime artifact preflight', () => {
  it('accepts canonical-shape P5 for final closure and verifies immutable hashes', () => {
    withArtifact('p5', P5, {}, { finalClosureEligible: true }, (dir, registry) => {
      const result = inspectRuntimeArtifact('p5', dir, { intent: 'final-closure', registry });
      expect(result.ok).toBe(true);
      expect(result.needsManifestRebind).toBe(true);
      expect(result.registeredArtifact.finalClosureEligible).toBe(true);
      expect(result.immutableFileIntegrity.checked).toBe(5);
      expect(result.immutableFileIntegrity.matched).toBe(5);
      expect(result.immutableFileIntegrity.manifestIntentionallyExcluded).toBe(true);
    });
  });

  it('allows a numeric manifest plugin-id rebind because manifest is intentionally not hash pinned', () => {
    withArtifact('p5', P5, { pluginId: '12345678901234567890' }, { finalClosureEligible: true }, (dir, registry) => {
      const result = inspectRuntimeArtifact('p5', dir, { intent: 'final-closure', registry });
      expect(result.ok).toBe(true);
      expect(result.needsManifestRebind).toBe(false);
      expect(result.immutableFileIntegrity.matched).toBe(5);
    });
  });

  it('rejects P6 reference artifact for final closure', () => {
    withArtifact('p6', P6, {}, { finalClosureEligible: false }, (dir, registry) => {
      const result = inspectRuntimeArtifact('p6', dir, { intent: 'final-closure', registry });
      expect(result.ok).toBe(false);
      expect(result.errors.join('\n')).toContain('not eligible for final closure');
    });
  });

  it('allows P6 reference inspection with a warning', () => {
    withArtifact('p6', P6, {}, { finalClosureEligible: false }, (dir, registry) => {
      const result = inspectRuntimeArtifact('p6', dir, { intent: 'reference', registry });
      expect(result.ok).toBe(true);
      expect(result.warnings.join('\n')).toContain('Reference engineering build only');
      expect(result.immutableFileIntegrity.matched).toBe(5);
    });
  });

  it('fails closed on build identity mismatch even when that file is hash pinned as observed', () => {
    withArtifact('p5', P5, { build: { runNumber: '999' } }, { finalClosureEligible: true }, (dir, registry) => {
      const result = inspectRuntimeArtifact('p5', dir, { intent: 'final-closure', registry });
      expect(result.ok).toBe(false);
      expect(result.errors.join('\n')).toContain('BUILD_INFO mismatch for run_number');
    });
  });

  it('fails closed when a required runtime menu command is missing', () => {
    withArtifact('p5', P5, { commands: ['open', 'p5-runtime-evidence'] }, { finalClosureEligible: true }, (dir, registry) => {
      const result = inspectRuntimeArtifact('p5', dir, { intent: 'final-closure', registry });
      expect(result.ok).toBe(false);
      expect(result.errors.join('\n')).toContain('p5-runtime-self-test');
    });
  });

  it('fails closed when compiled code is changed after registry pinning', () => {
    withArtifact('p5', P5, {}, { finalClosureEligible: true }, (dir, registry) => {
      writeFileSync(join(dir, 'code.js'), 'tampered compiled runtime');
      const result = inspectRuntimeArtifact('p5', dir, { intent: 'final-closure', registry });
      expect(result.ok).toBe(false);
      expect(result.errors.join('\n')).toContain('SHA-256 mismatch for code.js');
      expect(result.immutableFileIntegrity.matched).toBe(4);
    });
  });

  it('fails closed when the packaged same-artifact verifier is changed', () => {
    withArtifact('p5', P5, {}, { finalClosureEligible: true }, (dir, registry) => {
      writeFileSync(join(dir, P5.verifier), 'tampered verifier');
      const result = inspectRuntimeArtifact('p5', dir, { intent: 'final-closure', registry });
      expect(result.ok).toBe(false);
      expect(result.errors.join('\n')).toContain(`SHA-256 mismatch for ${P5.verifier}`);
      expect(result.immutableFileIntegrity.matched).toBe(4);
    });
  });

  it.skipIf(process.platform === 'win32')('fails closed when a required artifact file is a symbolic link', () => {
    withArtifact('p5', P5, {}, { finalClosureEligible: true }, (dir, registry) => {
      const codePath = join(dir, 'code.js');
      const targetPath = join(dir, 'code-target.js');
      writeFileSync(targetPath, readFileSync(codePath));
      rmSync(codePath);
      symlinkSync(targetPath, codePath);

      const result = inspectRuntimeArtifact('p5', dir, { intent: 'final-closure', registry });
      expect(result.ok).toBe(false);
      expect(result.errors.join('\n')).toContain('Required artifact file must not be a symbolic link: code.js');
      expect(result.immutableFileIntegrity.checked).toBe(4);
      expect(result.immutableFileIntegrity.matched).toBe(4);
    });
  });

  it.skipIf(process.platform === 'win32')('fails closed when a required artifact file is replaced between validation and open', () => {
    withArtifact('p5', P5, {}, { finalClosureEligible: true }, (dir, registry) => {
      const codePath = join(dir, 'code.js');
      let replaced = false;
      const result = inspectRuntimeArtifact('p5', dir, {
        intent: 'final-closure',
        registry,
        openSyncImpl: (path, flags) => {
          if (!replaced && path === codePath) {
            const replacementPath = join(dir, 'code-replacement.js');
            writeFileSync(replacementPath, 'replacement compiled runtime');
            renameSync(replacementPath, codePath);
            replaced = true;
          }
          return openSync(path, flags);
        }
      });

      expect(result.ok).toBe(false);
      expect(result.errors.join('\n')).toContain('Required artifact file changed between validation and open: code.js');
      expect(result.immutableFileIntegrity.checked).toBe(4);
      expect(result.immutableFileIntegrity.matched).toBe(4);
    });
  });

  it.skipIf(process.platform === 'win32')('fails closed when the supplied artifact directory is a symbolic link', () => {
    withArtifact('p5', P5, {}, { finalClosureEligible: true }, (dir, registry) => {
      const linkPath = `${dir}-link`;
      try {
        symlinkSync(dir, linkPath, 'dir');
        const result = inspectRuntimeArtifact('p5', linkPath, { intent: 'final-closure', registry });
        expect(result.ok).toBe(false);
        expect(result.errors.join('\n')).toContain('Artifact directory must not be a symbolic link');
      } finally {
        rmSync(linkPath, { force: true });
      }
    });
  });
});
