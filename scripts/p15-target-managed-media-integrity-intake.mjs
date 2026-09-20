import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p15-media-integrity-'));
const outfile = join(dir, 'p15-target-managed-media-integrity-intake.mjs');

try {
  await build({
    entryPoints: ['src/cli/p15-target-managed-media-integrity-intake.ts'],
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'esm',
    outfile,
    sourcemap: false,
    logLevel: 'silent',
  });

  const child = spawn(process.execPath, [outfile, ...process.argv.slice(2)], {
    stdio: 'inherit',
    env: process.env,
    windowsHide: true,
  });
  const exitCode = await new Promise((resolveExit, reject) => {
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (signal) {
        reject(new Error(`P15 target-managed media integrity child process terminated by signal ${signal}.`));
        return;
      }
      resolveExit(code ?? 1);
    });
  });
  process.exitCode = exitCode;
} finally {
  await rm(dir, { recursive: true, force: true });
}
