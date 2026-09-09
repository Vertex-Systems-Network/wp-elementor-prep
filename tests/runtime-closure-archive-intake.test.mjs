import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { inspectRuntimeClosureIntake } from '../scripts/runtime-closure-intake.mjs';

const TRACK = {
  sourceSha: '810d98d6e09cb4cf3fe4758fcb07e87734254a8e',
  runId: '34242984963',
  runNumber: '488',
  verifier: 'verify-p5-evidence.mjs',
  commands: ['p5-runtime-self-test', 'p5-runtime-evidence']
};

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function makeFixture() {
  const root = mkdtempSync(join(tmpdir(), 'runtime-closure-archive-'));
  const artifactDir = join(root, 'artifact');
  const evidencePath = join(root, 'p5-evidence.json');
  const archivePath = join(root, 'figma-plugin-dist-488.zip');
  mkdirSync(artifactDir);

  writeFileSync(join(artifactDir, 'BUILD_INFO.txt'), [
    `source_sha=${TRACK.sourceSha}`,
    `workflow_sha=${TRACK.sourceSha}`,
    `run_id=${TRACK.runId}`,
    `run_number=${TRACK.runNumber}`,
    'figma_plugin_id=000000000000000000',
    ''
  ].join('\n'));
  writeFileSync(join(artifactDir, 'manifest.json'), JSON.stringify({
    name: 'Pella Elementor Prep',
    id: '000000000000000000',
    api: '1.0.0',
    editorType: ['figma'],
    main: 'code.js',
    ui: 'ui.html',
    documentAccess: 'dynamic-page',
    menu: TRACK.commands.map((command) => ({ name: command, command })),
    networkAccess: { allowedDomains: ['none'] }
  }));
  writeFileSync(join(artifactDir, 'code.js'), 'fixture compiled code');
  writeFileSync(join(artifactDir, 'ui.html'), '<html>fixture ui</html>');
  writeFileSync(join(artifactDir, 'prepare-figma-import.mjs'), 'console.log("fixture helper");');
  writeFileSync(join(artifactDir, TRACK.verifier), [
    "let raw = '';",
    "process.stdin.setEncoding('utf8');",
    'for await (const chunk of process.stdin) raw += chunk;',
    'const evidence = JSON.parse(raw);',
    "if (evidence.accepted === true) console.log('fixture verifier PASS');",
    "else process.exit(1);",
    ''
  ].join('\n'));
  writeFileSync(evidencePath, JSON.stringify({ accepted: true }));
  writeFileSync(archivePath, Buffer.from('fixture raw artifact zip bytes'));

  const immutableFiles = ['BUILD_INFO.txt', 'code.js', 'ui.html', 'prepare-figma-import.mjs', TRACK.verifier];
  const immutableFileSha256 = Object.fromEntries(
    immutableFiles.map((name) => [name, sha256(join(artifactDir, name))])
  );
  const registry = {
    schemaVersion: 2,
    tracks: {
      p5: {
        branch: 'fixture/p5',
        issue: 6,
        sourceSha: TRACK.sourceSha,
        runId: TRACK.runId,
        runNumber: TRACK.runNumber,
        artifactName: 'fixture-p5',
        digest: `sha256:${sha256(archivePath)}`,
        verifier: TRACK.verifier,
        immutableFileSha256,
        requiredMenuCommands: TRACK.commands,
        finalClosureEligible: true,
        closureNote: 'Fixture final closure build.'
      }
    }
  };

  return { root, artifactDir, evidencePath, archivePath, registry };
}

function withFixture(callback) {
  const fixture = makeFixture();
  try {
    return callback(fixture);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
}

describe('runtime closure intake archive binding', () => {
  it('passes the supplied archive through final-closure preflight and requires a digest match', () => {
    withFixture(({ artifactDir, evidencePath, archivePath, registry }) => {
      const result = inspectRuntimeClosureIntake('p5', artifactDir, evidencePath, {
        registry,
        archivePath
      });

      expect(result.ok).toBe(true);
      expect(result.stage).toBe('complete');
      expect(result.preflight.archiveIntegrity.supplied).toBe(true);
      expect(result.preflight.archiveIntegrity.matched).toBe(true);
      expect(result.preflight.archiveIntegrity.observedSha256).toBe(sha256(archivePath));
      expect(result.verifier.executed).toBe(true);
      expect(result.verifier.exitCode).toBe(0);
    });
  });

  it('fails at preflight and suppresses verifier execution when the supplied archive digest mismatches', () => {
    withFixture(({ artifactDir, evidencePath, archivePath, registry }) => {
      registry.tracks.p5.digest = `sha256:${'0'.repeat(64)}`;
      const result = inspectRuntimeClosureIntake('p5', artifactDir, evidencePath, {
        registry,
        archivePath,
        spawnSyncImpl: () => { throw new Error('verifier must not run'); }
      });

      expect(result.ok).toBe(false);
      expect(result.stage).toBe('preflight');
      expect(result.preflight.archiveIntegrity.supplied).toBe(true);
      expect(result.preflight.archiveIntegrity.matched).toBe(false);
      expect(result.verifier.executed).toBe(false);
      expect(result.errors.join('\n')).toContain('Artifact archive SHA-256 mismatch');
    });
  });
});
