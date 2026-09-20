import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  P15_CANDIDATE_JSON_INPUT_MAX_DEPTH,
  P15_SMALL_JSON_INPUT_MAX_BYTES,
  P15_SMALL_JSON_INPUT_MAX_DEPTH,
  P15_SMALL_JSON_INPUT_MAX_VALUES,
  captureP15OperatorOutputDestinationSnapshot,
  captureP15OperatorOutputParentSnapshot,
  p15OperatorInputMatchesSnapshot,
  p15OperatorOutputDestinationMatchesSnapshot,
  p15OperatorOutputParentMatchesSnapshot,
  readP15OperatorJsonInput,
  validateP15OperatorJsonStructure,
  writeP15OperatorJsonOutput,
} from '../src/cli/p15-operator-json-io';

const tempDirs: string[] = [];

function fixtureDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'p15-operator-json-io-'));
  tempDirs.push(dir);
  return dir;
}

function fail(message: string): never {
  throw new Error(message);
}

const smallOptions = {
  maxBytes: P15_SMALL_JSON_INPUT_MAX_BYTES,
  maxDepth: P15_SMALL_JSON_INPUT_MAX_DEPTH,
  maxValues: P15_SMALL_JSON_INPUT_MAX_VALUES,
} as const;

afterEach(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe('P15 stable operator JSON IO', () => {
  it('reads a stable bounded small JSON input and retains raw bytes', async () => {
    const dir = fixtureDir();
    const input = join(dir, 'evidence.json');
    const raw = '{"schemaVersion":1,"source":"OBSERVED"}\n';
    writeFileSync(input, raw);

    const snapshot = await readP15OperatorJsonInput(input, 'evidence', smallOptions, fail);
    expect(snapshot.raw).toBe(raw);
    expect(snapshot.value).toEqual({ schemaVersion: 1, source: 'OBSERVED' });
    expect(await p15OperatorInputMatchesSnapshot(snapshot)).toBe(true);
  });

  it('rejects a symbolic-link operator input instead of following its target', async () => {
    const dir = fixtureDir();
    const target = join(dir, 'target.json');
    const input = join(dir, 'input.json');
    writeFileSync(target, '{"safe":true}\n');
    symlinkSync(target, input, 'file');

    await expect(readP15OperatorJsonInput(input, 'evidence', smallOptions, fail))
      .rejects.toThrow('evidence input must be a regular file.');
  });

  it('rejects a pathname replaced by a symbolic link after the read snapshot', async () => {
    const dir = fixtureDir();
    const input = join(dir, 'input.json');
    const original = join(dir, 'original.json');
    const output = join(dir, 'report.json');
    writeFileSync(input, '{"value":1}\n');

    const snapshot = await readP15OperatorJsonInput(input, 'evidence', smallOptions, fail);
    renameSync(input, original);
    symlinkSync(original, input, 'file');

    expect(await p15OperatorInputMatchesSnapshot(snapshot)).toBe(false);
    await expect(writeP15OperatorJsonOutput(output, [snapshot], '{"report":true}\n', fail))
      .rejects.toThrow('Input path changed after it was read.');
    expect(existsSync(output)).toBe(false);
  });

  it('rejects an oversized small evidence packet before JSON validation', async () => {
    const dir = fixtureDir();
    const input = join(dir, 'oversized.json');
    writeFileSync(input, `{"padding":"${'x'.repeat(P15_SMALL_JSON_INPUT_MAX_BYTES)}"}\n`);

    await expect(readP15OperatorJsonInput(input, 'proof', smallOptions, fail))
      .rejects.toThrow(`${P15_SMALL_JSON_INPUT_MAX_BYTES}-byte limit`);
  });

  it('rejects pathological candidate outer nesting without imposing a candidate byte cap', () => {
    let value: unknown = 0;
    for (let index = 0; index <= P15_CANDIDATE_JSON_INPUT_MAX_DEPTH; index += 1) value = [value];

    expect(() => validateP15OperatorJsonStructure(
      value,
      'candidate',
      { maxDepth: P15_CANDIDATE_JSON_INPUT_MAX_DEPTH },
      fail,
    )).toThrow(`${P15_CANDIDATE_JSON_INPUT_MAX_DEPTH}-level nesting limit`);
  });

  it('detects an input mutation before output commit', async () => {
    const dir = fixtureDir();
    const input = join(dir, 'input.json');
    const output = join(dir, 'report.json');
    writeFileSync(input, '{"value":1}\n');

    const snapshot = await readP15OperatorJsonInput(input, 'evidence', smallOptions, fail);
    writeFileSync(input, '{"value":2}\n');

    expect(await p15OperatorInputMatchesSnapshot(snapshot)).toBe(false);
    await expect(writeP15OperatorJsonOutput(output, [snapshot], '{"report":true}\n', fail))
      .rejects.toThrow('Input path changed after it was read.');
    expect(existsSync(output)).toBe(false);
    expect(readdirSync(dir).some((name) => name.startsWith('.p15-output-'))).toBe(false);
  });

  it('detects output parent identity drift through its retained snapshot', async () => {
    const dir = fixtureDir();
    const parent = join(dir, 'out');
    const moved = join(dir, 'out-old');
    mkdirSync(parent);

    const snapshot = await captureP15OperatorOutputParentSnapshot(parent, fail);
    renameSync(parent, moved);
    mkdirSync(parent);

    expect(await p15OperatorOutputParentMatchesSnapshot(snapshot)).toBe(false);
  });

  it('detects existing destination drift through its retained snapshot', async () => {
    const dir = fixtureDir();
    const output = join(dir, 'report.json');
    writeFileSync(output, '{"version":1}\n');

    const snapshot = await captureP15OperatorOutputDestinationSnapshot(output, fail);
    writeFileSync(output, '{"version":22}\n');

    expect(await p15OperatorOutputDestinationMatchesSnapshot(snapshot)).toBe(false);
  });

  it('atomically replaces an unrelated existing output and removes temporary artifacts', async () => {
    const dir = fixtureDir();
    const input = join(dir, 'input.json');
    const output = join(dir, 'report.json');
    writeFileSync(input, '{"value":1}\n');
    writeFileSync(output, '{"old":true}\n');

    const snapshot = await readP15OperatorJsonInput(input, 'evidence', smallOptions, fail);
    const next = '{"new":true}\n';
    await writeP15OperatorJsonOutput(output, [snapshot], next, fail);

    expect(readFileSync(output, 'utf8')).toBe(next);
    expect(readdirSync(dir).some((name) => name.startsWith('.p15-output-'))).toBe(false);
  });
});
