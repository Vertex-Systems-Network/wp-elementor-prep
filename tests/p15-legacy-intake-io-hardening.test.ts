import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, sep } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { P15_SMALL_JSON_INPUT_MAX_BYTES } from '../src/cli/p15-operator-json-io';
import { readP15UnboundedTemplateJsonInput } from '../src/cli/p15-unbounded-template-json-input';

const tempDirs: string[] = [];

function fixtureDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'p15-legacy-intake-io-'));
  tempDirs.push(dir);
  return dir;
}

function fail(message: string): never {
  throw new Error(message);
}

function runScript(script: string, args: string[]) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe('P15 legacy operator intake IO hardening', () => {
  it.each([
    ['scripts/p15-elementor-import-intake.mjs', ['--candidate', 'missing.json', '--candidate', 'missing.json', '--receipt', 'missing.json']],
    ['scripts/p15-reference-closure-intake.mjs', ['--template', 'missing.json', '--template', 'missing.json', '--profile', 'missing.json', '--receipt', 'missing.json']],
    ['scripts/p15-reference-closure-review-packet.mjs', ['--template', 'missing.json', '--profile', 'missing.json', '--receipt', 'missing.json', '--receipt', 'missing.json']],
  ])('rejects duplicate supported options in %s', (script, args) => {
    const run = runScript(script, args);
    expect(run.status).toBe(2);
    expect(run.stderr).toContain('Duplicate option:');
  });

  it('import intake rejects an output alias to candidate evidence and preserves candidate bytes', () => {
    const dir = fixtureDir();
    const candidate = join(dir, 'candidate.json');
    const receipt = join(dir, 'receipt.json');
    const original = '{"status":"READY_FOR_TARGET_IMPORT_VALIDATION"}\n';
    writeFileSync(candidate, original);
    writeFileSync(receipt, '{}\n');

    const run = runScript('scripts/p15-elementor-import-intake.mjs', [
      '--candidate', candidate,
      '--receipt', receipt,
      '--out', `${dir}${sep}.${sep}candidate.json`,
    ]);

    expect(run.status).toBe(2);
    expect(run.stderr).toContain('--out must not overwrite or alias a candidate or receipt input file.');
    expect(readFileSync(candidate, 'utf8')).toBe(original);
  });

  it.each([
    ['scripts/p15-reference-closure-intake.mjs', 'P15_REFERENCE_CLOSURE_INTAKE_FAILED'],
    ['scripts/p15-reference-closure-review-packet.mjs', 'P15_REFERENCE_CLOSURE_REVIEW_PACKET_FAILED'],
  ])('reference command %s rejects an output alias to template evidence', (script, prefix) => {
    const dir = fixtureDir();
    const template = join(dir, 'template.json');
    const profile = join(dir, 'profile.json');
    const receipt = join(dir, 'receipt.json');
    const original = '{"title":"retained-template"}\n';
    writeFileSync(template, original);
    writeFileSync(profile, '{}\n');
    writeFileSync(receipt, '{}\n');

    const run = runScript(script, [
      '--template', template,
      '--profile', profile,
      '--receipt', receipt,
      '--out', `${dir}${sep}.${sep}template.json`,
    ]);

    expect(run.status).toBe(2);
    expect(run.stderr).toContain(prefix);
    expect(run.stderr).toContain('--out must not overwrite or alias a template, profile, or receipt input file.');
    expect(readFileSync(template, 'utf8')).toBe(original);
  });

  it('import intake rejects an oversized receipt before report write', () => {
    const dir = fixtureDir();
    const candidate = join(dir, 'candidate.json');
    const receipt = join(dir, 'receipt.json');
    const out = join(dir, 'report.json');
    writeFileSync(candidate, '{}\n');
    writeFileSync(receipt, `{"padding":"${'x'.repeat(P15_SMALL_JSON_INPUT_MAX_BYTES)}"}\n`);

    const run = runScript('scripts/p15-elementor-import-intake.mjs', [
      '--candidate', candidate,
      '--receipt', receipt,
      '--out', out,
    ]);

    expect(run.status).toBe(2);
    expect(run.stderr).toContain(`${P15_SMALL_JSON_INPUT_MAX_BYTES}-byte limit`);
    expect(existsSync(out)).toBe(false);
  });

  it('reference-closure intake rejects an oversized small profile before report write', () => {
    const dir = fixtureDir();
    const template = join(dir, 'template.json');
    const profile = join(dir, 'profile.json');
    const receipt = join(dir, 'receipt.json');
    const out = join(dir, 'report.json');
    writeFileSync(template, '{}\n');
    writeFileSync(profile, `{"padding":"${'x'.repeat(P15_SMALL_JSON_INPUT_MAX_BYTES)}"}\n`);
    writeFileSync(receipt, '{}\n');

    const run = runScript('scripts/p15-reference-closure-intake.mjs', [
      '--template', template,
      '--profile', profile,
      '--receipt', receipt,
      '--out', out,
    ]);

    expect(run.status).toBe(2);
    expect(run.stderr).toContain(`${P15_SMALL_JSON_INPUT_MAX_BYTES}-byte limit`);
    expect(existsSync(out)).toBe(false);
  });

  it('reads a deeply nested raw reference template without inventing a generic structural ceiling', async () => {
    const dir = fixtureDir();
    const template = join(dir, 'template.json');
    let nested: unknown = 'leaf';
    for (let index = 0; index < 96; index += 1) nested = { nested };
    const raw = `${JSON.stringify({ settings: nested })}\n`;
    writeFileSync(template, raw);

    const snapshot = await readP15UnboundedTemplateJsonInput(template, 'template', fail);
    expect(snapshot.raw).toBe(raw);
    expect(snapshot.resolvedPath).toBe(template);
  });
});
