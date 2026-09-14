import { spawnSync } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  P16_OPERATOR_JSON_INPUT_MAX_BYTES,
  P16_OPERATOR_JSON_INPUT_MAX_DEPTH,
  P16_OPERATOR_JSON_INPUT_MAX_VALUES,
} from '../src/cli/p16-operator-json-io';

type CliCase = {
  name: string;
  script: string;
  extraInputs: Array<[flag: string, filename: string]>;
  prefix: string;
};

const cases: CliCase[] = [
  {
    name: 'requirements export',
    script: 'scripts/p16-evidence-retention-requirements.mjs',
    extraInputs: [
      ['--profile', 'profile.json'],
      ['--receipt', 'receipt.json'],
      ['--authentication-report', 'authentication-report.json'],
    ],
    prefix: 'P16_EVIDENCE_RETENTION_REQUIREMENTS_FAILED',
  },
  {
    name: 'requirements validation',
    script: 'scripts/p16-evidence-retention-requirements-validate.mjs',
    extraInputs: [
      ['--profile', 'profile.json'],
      ['--receipt', 'receipt.json'],
      ['--authentication-report', 'authentication-report.json'],
      ['--manifest', 'manifest.json'],
    ],
    prefix: 'P16_EVIDENCE_RETENTION_REQUIREMENTS_VALIDATE_FAILED',
  },
];

async function createArgs(dir: string, cli: CliCase, documentPayload: string): Promise<string[]> {
  const documentPath = join(dir, 'document.json');
  await writeFile(documentPath, documentPayload, 'utf8');

  const args: string[] = [cli.script, '--document', documentPath];
  for (const [flag, filename] of cli.extraInputs) {
    const path = join(dir, filename);
    await writeFile(path, '{}\n', 'utf8');
    args.push(flag, path);
  }
  args.push('--out', join(dir, 'out.json'));
  return args;
}

function run(args: string[]) {
  return spawnSync(process.execPath, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
  });
}

describe('P16 retention operator JSON structural bounds', () => {
  for (const cli of cases) {
    describe(cli.name, () => {
      it(`rejects more than ${P16_OPERATOR_JSON_INPUT_MAX_DEPTH} nested container levels`, async () => {
        const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-depth-bound-'));
        try {
          const levels = P16_OPERATOR_JSON_INPUT_MAX_DEPTH + 1;
          const payload = `${'['.repeat(levels)}0${']'.repeat(levels)}\n`;
          expect(Buffer.byteLength(payload, 'utf8')).toBeLessThan(P16_OPERATOR_JSON_INPUT_MAX_BYTES);
          const args = await createArgs(dir, cli, payload);

          const result = run(args);

          expect(result.status).toBe(2);
          expect(result.stdout).toBe('');
          expect(result.stderr).toContain(
            `${cli.prefix}: document input exceeds ${P16_OPERATOR_JSON_INPUT_MAX_DEPTH}-level nesting limit.`,
          );
          expect(result.stderr).not.toContain(payload.trim());
        } finally {
          await rm(dir, { recursive: true, force: true });
        }
      });

      it(`rejects more than ${P16_OPERATOR_JSON_INPUT_MAX_VALUES} total JSON values`, async () => {
        const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-value-bound-'));
        try {
          const payload = `[${'null,'.repeat(P16_OPERATOR_JSON_INPUT_MAX_VALUES - 1)}null]\n`;
          expect(Buffer.byteLength(payload, 'utf8')).toBeLessThan(P16_OPERATOR_JSON_INPUT_MAX_BYTES);
          const args = await createArgs(dir, cli, payload);

          const result = run(args);

          expect(result.status).toBe(2);
          expect(result.stdout).toBe('');
          expect(result.stderr).toContain(
            `${cli.prefix}: document input exceeds ${P16_OPERATOR_JSON_INPUT_MAX_VALUES}-value structural limit.`,
          );
          expect(result.stderr).not.toContain(payload.slice(0, 128));
        } finally {
          await rm(dir, { recursive: true, force: true });
        }
      });
    });
  }
});
