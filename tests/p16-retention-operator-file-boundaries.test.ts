import { spawnSync } from 'node:child_process';
import {
  link,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { P16_OPERATOR_JSON_INPUT_MAX_BYTES } from '../src/cli/p16-operator-json-io';

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

async function createBaseInputs(dir: string, cli: CliCase): Promise<string[]> {
  const args: string[] = [cli.script];
  for (const [flag, filename] of cli.extraInputs) {
    const path = join(dir, filename);
    await writeFile(path, '{}\n', 'utf8');
    args.push(flag, path);
  }
  return args;
}

function run(args: string[]) {
  return spawnSync(process.execPath, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
  });
}

describe('P16 retention operator local file boundaries', () => {
  for (const cli of cases) {
    describe(cli.name, () => {
      it('rejects oversized JSON input before parsing', async () => {
        const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-bound-oversized-'));
        try {
          const documentPath = join(dir, 'document.json');
          await writeFile(documentPath, 'x'.repeat(P16_OPERATOR_JSON_INPUT_MAX_BYTES + 1), 'utf8');
          const args = await createBaseInputs(dir, cli);
          args.push('--document', documentPath, '--out', join(dir, 'out.json'));

          const result = run(args);

          expect(result.status).toBe(2);
          expect(result.stdout).toBe('');
          expect(result.stderr).toContain(
            `${cli.prefix}: document input exceeds ${P16_OPERATOR_JSON_INPUT_MAX_BYTES}-byte limit.`,
          );
        } finally {
          await rm(dir, { recursive: true, force: true });
        }
      });

      it('rejects whitespace-only JSON input', async () => {
        const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-bound-empty-'));
        try {
          const documentPath = join(dir, 'document.json');
          await writeFile(documentPath, ' \n\t  ', 'utf8');
          const args = await createBaseInputs(dir, cli);
          args.push('--document', documentPath, '--out', join(dir, 'out.json'));

          const result = run(args);

          expect(result.status).toBe(2);
          expect(result.stdout).toBe('');
          expect(result.stderr).toContain(`${cli.prefix}: document input is empty.`);
        } finally {
          await rm(dir, { recursive: true, force: true });
        }
      });

      it('rejects non-regular JSON input', async () => {
        const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-bound-nonfile-'));
        try {
          const documentPath = join(dir, 'document-dir');
          await mkdir(documentPath);
          const args = await createBaseInputs(dir, cli);
          args.push('--document', documentPath, '--out', join(dir, 'out.json'));

          const result = run(args);

          expect(result.status).toBe(2);
          expect(result.stdout).toBe('');
          expect(result.stderr).toContain(
            `${cli.prefix}: document input must be a regular file.`,
          );
        } finally {
          await rm(dir, { recursive: true, force: true });
        }
      });

      it('rejects output path collision with any input before reading', async () => {
        const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-bound-collision-'));
        try {
          const documentPath = join(dir, 'document.json');
          await writeFile(documentPath, '{}\n', 'utf8');
          const args = await createBaseInputs(dir, cli);
          args.push('--document', documentPath, '--out', documentPath);

          const result = run(args);

          expect(result.status).toBe(2);
          expect(result.stdout).toBe('');
          expect(result.stderr).toContain(
            `${cli.prefix}: Output path must not resolve to an input path.`,
          );
        } finally {
          await rm(dir, { recursive: true, force: true });
        }
      });

      it('rejects an existing output hardlink to an input without modifying the input', async () => {
        const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-bound-hardlink-'));
        try {
          const documentPath = join(dir, 'document.json');
          const outPath = join(dir, 'out.json');
          const original = '{"protected":"input"}\n';
          await writeFile(documentPath, original, 'utf8');
          await link(documentPath, outPath);
          const args = await createBaseInputs(dir, cli);
          args.push('--document', documentPath, '--out', outPath);

          const result = run(args);

          expect(result.status).toBe(2);
          expect(result.stdout).toBe('');
          expect(result.stderr).toContain(
            `${cli.prefix}: Output path must not alias an input file.`,
          );
          expect(await readFile(documentPath, 'utf8')).toBe(original);
        } finally {
          await rm(dir, { recursive: true, force: true });
        }
      });

      it('rejects an existing output symlink without following it', async () => {
        if (process.platform === 'win32') return;
        const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-bound-symlink-'));
        try {
          const documentPath = join(dir, 'document.json');
          const outPath = join(dir, 'out.json');
          const original = '{"protected":"input"}\n';
          await writeFile(documentPath, original, 'utf8');
          await symlink(documentPath, outPath, 'file');
          const args = await createBaseInputs(dir, cli);
          args.push('--document', documentPath, '--out', outPath);

          const result = run(args);

          expect(result.status).toBe(2);
          expect(result.stdout).toBe('');
          expect(result.stderr).toContain(
            `${cli.prefix}: Output path must not be a symbolic link.`,
          );
          expect(await readFile(documentPath, 'utf8')).toBe(original);
        } finally {
          await rm(dir, { recursive: true, force: true });
        }
      });

      it('rejects output through a symlinked parent that resolves onto an input', async () => {
        if (process.platform === 'win32') return;
        const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-bound-parent-alias-'));
        try {
          const realDir = join(dir, 'real');
          const aliasDir = join(dir, 'alias');
          await mkdir(realDir);
          await symlink(realDir, aliasDir, 'dir');
          const documentPath = join(realDir, 'document.json');
          const aliasOutputPath = join(aliasDir, 'document.json');
          const original = '{"protected":"input"}\n';
          await writeFile(documentPath, original, 'utf8');
          const args = await createBaseInputs(dir, cli);
          args.push('--document', documentPath, '--out', aliasOutputPath);

          const result = run(args);

          expect(result.status).toBe(2);
          expect(result.stdout).toBe('');
          expect(result.stderr).toContain(
            `${cli.prefix}: Output path must not resolve to an input path.`,
          );
          expect(await readFile(documentPath, 'utf8')).toBe(original);
        } finally {
          await rm(dir, { recursive: true, force: true });
        }
      });
    });
  }
});
