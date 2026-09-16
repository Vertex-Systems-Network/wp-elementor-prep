import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  P15_SMALL_JSON_INPUT_MAX_BYTES,
  P15_SMALL_JSON_INPUT_MAX_DEPTH,
  P15_SMALL_JSON_INPUT_MAX_VALUES,
  p15OperatorInputMatchesSnapshot,
  readP15OperatorJsonInput,
  writeP15OperatorJsonOutput,
  type P15OperatorJsonInputSnapshot,
} from '../src/cli/p15-operator-json-io';
import { readP15UnboundedTemplateJsonInput } from '../src/cli/p15-unbounded-template-json-input';

const tempDirs: string[] = [];

function fixtureDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'p15-input-content-digest-'));
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

function metadataAdjustedSnapshot(
  snapshot: P15OperatorJsonInputSnapshot,
): P15OperatorJsonInputSnapshot {
  const current = statSync(snapshot.resolvedPath);
  return Object.freeze({
    ...snapshot,
    file: Object.freeze({
      dev: current.dev,
      ino: current.ino,
      size: current.size,
      mtimeMs: current.mtimeMs,
      ctimeMs: current.ctimeMs,
    }),
  });
}

function sha256Bytes(bytes: Buffer): string {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
}

function malformedUtf8Json(): Buffer {
  return Buffer.concat([
    Buffer.from('{"value":"', 'utf8'),
    Buffer.from([0xc3, 0x28]),
    Buffer.from('"}\n', 'utf8'),
  ]);
}

describe('P15 input content digest binding', () => {
  it('retains and verifies the exact bounded JSON bytes', async () => {
    const dir = fixtureDir();
    const input = join(dir, 'evidence.json');
    writeFileSync(input, '{"schemaVersion":1,"source":"OBSERVED"}\n');

    const snapshot = await readP15OperatorJsonInput(input, 'evidence', smallOptions, fail);
    expect(snapshot.contentSha256).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(await p15OperatorInputMatchesSnapshot(snapshot)).toBe(true);
  });

  it('hashes the exact raw bytes for valid multibyte UTF-8 JSON', async () => {
    const dir = fixtureDir();
    const input = join(dir, 'multibyte.json');
    const bytes = Buffer.from('{"city":"İstanbul","symbol":"€","check":"✓"}\n', 'utf8');
    writeFileSync(input, bytes);

    const snapshot = await readP15OperatorJsonInput(input, 'evidence', smallOptions, fail);
    expect(snapshot.contentSha256).toBe(sha256Bytes(bytes));
    expect(snapshot.value).toEqual({ city: 'İstanbul', symbol: '€', check: '✓' });
    expect(await p15OperatorInputMatchesSnapshot(snapshot)).toBe(true);
  });

  it('rejects malformed UTF-8 bounded JSON before JSON semantic validation', async () => {
    const dir = fixtureDir();
    const input = join(dir, 'malformed-utf8.json');
    writeFileSync(input, malformedUtf8Json());

    await expect(readP15OperatorJsonInput(input, 'evidence', smallOptions, fail))
      .rejects.toThrow('evidence input is not valid UTF-8.');
  });

  it('retains and stream-verifies an unbounded raw template without adding a byte ceiling', async () => {
    const dir = fixtureDir();
    const input = join(dir, 'template.json');
    writeFileSync(input, JSON.stringify({
      version: '0.4',
      title: 'Reference closure fixture',
      type: 'page',
      page_settings: [],
      content: [],
      settings: { opaqueTargetOwnedValue: 'x'.repeat(256 * 1024) },
    }));

    const snapshot = await readP15UnboundedTemplateJsonInput(input, 'template', fail);
    expect(snapshot.contentSha256).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(await p15OperatorInputMatchesSnapshot(snapshot)).toBe(true);
  });

  it('rejects malformed UTF-8 raw reference-template input before JSON semantic validation', async () => {
    const dir = fixtureDir();
    const input = join(dir, 'malformed-template.json');
    writeFileSync(input, malformedUtf8Json());

    await expect(readP15UnboundedTemplateJsonInput(input, 'template', fail))
      .rejects.toThrow('template input is not valid UTF-8.');
  });

  it('rejects changed same-size bytes even when supplied metadata matches the changed file', async () => {
    const dir = fixtureDir();
    const input = join(dir, 'evidence.json');
    writeFileSync(input, '{"value":1}\n');

    const original = await readP15OperatorJsonInput(input, 'evidence', smallOptions, fail);
    writeFileSync(input, '{"value":2}\n');
    const metadataAdjusted = metadataAdjustedSnapshot(original);

    expect(metadataAdjusted.file.size).toBe(original.file.size);
    expect(await p15OperatorInputMatchesSnapshot(metadataAdjusted)).toBe(false);
  });

  it('refuses report commit on digest mismatch and cleans temporary artifacts', async () => {
    const dir = fixtureDir();
    const input = join(dir, 'evidence.json');
    const output = join(dir, 'report.json');
    writeFileSync(input, '{"value":1}\n');

    const original = await readP15OperatorJsonInput(input, 'evidence', smallOptions, fail);
    writeFileSync(input, '{"value":2}\n');
    const metadataAdjusted = metadataAdjustedSnapshot(original);

    await expect(writeP15OperatorJsonOutput(
      output,
      [metadataAdjusted],
      '{"report":true}\n',
      fail,
    )).rejects.toThrow('Input path changed after it was read.');

    expect(existsSync(output)).toBe(false);
    expect(readdirSync(dir).some((name) => name.startsWith('.p15-output-'))).toBe(false);
  });
});
