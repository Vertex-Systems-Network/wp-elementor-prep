import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const [command, ...args] = process.argv.slice(2);
if (!command) {
  console.error('Usage: node scripts/run-cli.mjs <command> [options]');
  process.exitCode = 2;
} else {
  const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-cli-'));
  const outfile = join(dir, 'elementor-prep.mjs');
  try {
    await build({
      entryPoints: ['src/cli/index.ts'],
      bundle: true,
      platform: 'node',
      target: 'node20',
      format: 'esm',
      outfile,
      sourcemap: false,
      logLevel: 'silent',
    });

    const child = spawn(process.execPath, [outfile, command, ...args], {
      stdio: 'inherit',
      env: process.env,
      windowsHide: true,
    });
    const exitCode = await new Promise((resolveExit, reject) => {
      child.once('error', reject);
      child.once('exit', (code, signal) => {
        if (signal) {
          reject(new Error(`CLI child process terminated by signal ${signal}.`));
          return;
        }
        resolveExit(code ?? 1);
      });
    });
    process.exitCode = exitCode;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
