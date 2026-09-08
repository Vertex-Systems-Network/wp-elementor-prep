import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { inspectRuntimeClosureIntake } from '../scripts/runtime-closure-intake.mjs';

const P5 = {
  sourceSha: '810d98d6e09cb4cf3fe4758fcb07e87734254a8e',
  runId: '34242984963',
  runNumber: '488',
  verifier: 'verify-p5-evidence.mjs',
  commands: ['p5-runtime-self-test', 'p5-runtime-evidence']
};

function sha256File(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function makeFixture({ finalClosureEligible = true } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'runtime-closure-intake-'));
  const artifactDir = join(root, 'artifact');
  const evidencePath = join(root, 'p5-evidence.json');
  mkdirSync(artifactDir);

  writeFileSync(join(artifactDir, 'BUILD_INFO.txt'), [
    `source_sha=${P5.sourceSha}`,
    `workflow_sha=${P5.sourceSha}`,
    `run_id=${P5.runId}`,
    `run_number=${P5.runNumber}`,
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
    menu: P5.commands.map((command) => ({ name: command, command })),
    networkAccess: { allowedDomains: ['none'] }
  }, null, 2));

  writeFileSync(join(artifactDir, 'code.js'), 'fixture compiled code');
  writeFileSync(join(artifactDir, 'ui.html'), '<html>fixture ui</html>');
  writeFileSync(join(artifactDir, 'prepare-figma-import.mjs'), 'console.log("fixture helper");');
  writeFileSync(join(artifactDir, P5.verifier), [
    "let raw = '';",
    "process.stdin.setEncoding('utf8');",
    'for await (const chunk of process.stdin) raw += chunk;',
    'const evidence = JSON.parse(raw);',
    "if (evidence.accepted === true) console.log('fixture verifier PASS');",
    "else { console.error('fixture verifier FAIL'); process.exit(1); }",
    ''
  ].join('\n'));

  const immutableFiles = ['BUILD_INFO.txt', 'code.js', 'ui.html', 'prepare-figma-import.mjs', P5.verifier];
  const immutableFileSha256 = Object.fromEntries(
    immutableFiles.map((name) => [name, sha256File(join(artifactDir, name))])
  );

  const registry = {
    schemaVersion: 2,
    tracks: {
      p5: {
        branch: 'fixture/p5',
        issue: 6,
        sourceSha: P5.sourceSha,
        runId: P5.runId,
        runNumber: P5.runNumber,
        artifactName: 'fixture-p5',
        digest: `sha256:${'0'.repeat(64)}`,
        verifier: P5.verifier,
        immutableFileSha256,
        requiredMenuCommands: P5.commands,
        finalClosureEligible,
        closureNote: finalClosureEligible ? 'Fixture final closure build.' : 'Reference-only fixture.'
      }
    }
  };

  return { root, artifactDir, evidencePath, registry };
}

function withFixture(options, callback) {
  const fixture = makeFixture(options);
  try {
    return callback(fixture);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
}

describe('runtime closure intake', () => {
  it('passes only after artifact preflight and the same-artifact verifier both pass', () => {
    withFixture({}, ({ artifactDir, evidencePath, registry }) => {
      writeFileSync(evidencePath, JSON.stringify({ accepted: true }));
      const expectedEvidenceHash = sha256File(evidencePath);
      const result = inspectRuntimeClosureIntake('p5', artifactDir, evidencePath, { registry });
      expect(result.ok).toBe(true);
      expect(result.stage).toBe('complete');
      expect(result.preflight.ok).toBe(true);
      expect(result.preflight.immutableFileIntegrity.matched).toBe(5);
      expect(result.evidence.jsonObject).toBe(true);
      expect(result.evidence.utf8Valid).toBe(true);
      expect(result.evidence.hashScope).toBe('raw-file-bytes');
      expect(result.evidence.sha256).toBe(expectedEvidenceHash);
      expect(result.verifier.executed).toBe(true);
      expect(result.verifier.exitCode).toBe(0);
      expect(result.verifier.stdout).toContain('fixture verifier PASS');
    });
  });

  it('fails closed when the same-artifact verifier rejects evidence', () => {
    withFixture({}, ({ artifactDir, evidencePath, registry }) => {
      writeFileSync(evidencePath, JSON.stringify({ accepted: false }));
      const result = inspectRuntimeClosureIntake('p5', artifactDir, evidencePath, { registry });
      expect(result.ok).toBe(false);
      expect(result.stage).toBe('verifier');
      expect(result.preflight.ok).toBe(true);
      expect(result.verifier.executed).toBe(true);
      expect(result.verifier.exitCode).toBe(1);
      expect(result.errors.join('\n')).toContain('did not accept the evidence');
    });
  });

  it('never executes the verifier when final-closure preflight fails', () => {
    withFixture({ finalClosureEligible: false }, ({ artifactDir, evidencePath, registry }) => {
      writeFileSync(evidencePath, JSON.stringify({ accepted: true }));
      const result = inspectRuntimeClosureIntake('p5', artifactDir, evidencePath, {
        registry,
        spawnSyncImpl: () => { throw new Error('verifier must not run'); }
      });
      expect(result.ok).toBe(false);
      expect(result.stage).toBe('preflight');
      expect(result.verifier.executed).toBe(false);
      expect(result.errors.join('\n')).toContain('not eligible for final closure');
    });
  });

  it('rejects malformed evidence before executing the verifier', () => {
    withFixture({}, ({ artifactDir, evidencePath, registry }) => {
      writeFileSync(evidencePath, '{not-json');
      const result = inspectRuntimeClosureIntake('p5', artifactDir, evidencePath, {
        registry,
        spawnSyncImpl: () => { throw new Error('verifier must not run'); }
      });
      expect(result.ok).toBe(false);
      expect(result.stage).toBe('evidence');
      expect(result.verifier.executed).toBe(false);
      expect(result.errors.join('\n')).toContain('Evidence is not valid JSON');
    });
  });

  it('rejects symbolic-link evidence paths before reading or executing the verifier', () => {
    withFixture({}, ({ root, artifactDir, evidencePath, registry }) => {
      const targetPath = join(root, 'real-evidence.json');
      writeFileSync(targetPath, JSON.stringify({ accepted: true }));
      symlinkSync(targetPath, evidencePath);
      const result = inspectRuntimeClosureIntake('p5', artifactDir, evidencePath, {
        registry,
        spawnSyncImpl: () => { throw new Error('verifier must not run'); }
      });
      expect(result.ok).toBe(false);
      expect(result.stage).toBe('evidence');
      expect(result.verifier.executed).toBe(false);
      expect(result.evidence).toEqual({});
      expect(result.errors.join('\n')).toContain('must not be a symbolic link');
    });
  });

  it('rejects invalid UTF-8 while preserving the exact raw-byte evidence hash', () => {
    withFixture({}, ({ artifactDir, evidencePath, registry }) => {
      const invalidUtf8Json = Buffer.from([0x7b, 0x22, 0x78, 0x22, 0x3a, 0x22, 0xff, 0x22, 0x7d]);
      writeFileSync(evidencePath, invalidUtf8Json);
      const expectedEvidenceHash = sha256File(evidencePath);
      const result = inspectRuntimeClosureIntake('p5', artifactDir, evidencePath, {
        registry,
        spawnSyncImpl: () => { throw new Error('verifier must not run'); }
      });
      expect(result.ok).toBe(false);
      expect(result.stage).toBe('evidence');
      expect(result.verifier.executed).toBe(false);
      expect(result.evidence.sha256).toBe(expectedEvidenceHash);
      expect(result.evidence.hashScope).toBe('raw-file-bytes');
      expect(result.evidence.utf8Valid).toBe(false);
      expect(result.evidence.jsonObject).toBe(false);
      expect(result.errors.join('\n')).toContain('Evidence is not valid UTF-8');
    });
  });

  it('rejects oversized evidence before executing the verifier', () => {
    withFixture({}, ({ artifactDir, evidencePath, registry }) => {
      writeFileSync(evidencePath, JSON.stringify({ accepted: true, padding: 'x'.repeat(100) }));
      const result = inspectRuntimeClosureIntake('p5', artifactDir, evidencePath, {
        registry,
        maxEvidenceBytes: 32,
        spawnSyncImpl: () => { throw new Error('verifier must not run'); }
      });
      expect(result.ok).toBe(false);
      expect(result.stage).toBe('evidence');
      expect(result.verifier.executed).toBe(false);
      expect(result.errors.join('\n')).toContain('intake limit');
    });
  });
});
