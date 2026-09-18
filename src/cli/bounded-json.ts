import { createReadStream } from 'node:fs';
import { resolve } from 'node:path';

export const CLI_JSON_MAX_BYTES = 64 * 1024 * 1024;

export class BoundedJsonReadError extends Error {
  constructor(
    public readonly kind: 'READ_FAILED' | 'RESOURCE_LIMIT' | 'INVALID_UTF8' | 'INVALID_JSON',
    message: string,
  ) {
    super(message);
    this.name = 'BoundedJsonReadError';
  }
}

export interface BoundedJsonReadOptions {
  maxBytes?: number;
  label?: string;
}

function positiveMaxBytes(value: number | undefined): number {
  if (value === undefined) return CLI_JSON_MAX_BYTES;
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new BoundedJsonReadError('RESOURCE_LIMIT', 'maxBytes must be a positive safe integer.');
  }
  return value;
}

export async function readBoundedJsonFile(
  inputPath: string,
  options: BoundedJsonReadOptions = {},
): Promise<unknown> {
  const absolute = resolve(inputPath);
  const maxBytes = positiveMaxBytes(options.maxBytes);
  const label = options.label ?? inputPath;
  const chunks: Buffer[] = [];
  let totalBytes = 0;

  try {
    const stream = createReadStream(absolute, { flags: 'r' });
    for await (const chunk of stream) {
      const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      totalBytes += bytes.byteLength;
      if (totalBytes > maxBytes) {
        stream.destroy();
        throw new BoundedJsonReadError(
          'RESOURCE_LIMIT',
          `${label} exceeds the ${maxBytes}-byte JSON input limit.`,
        );
      }
      chunks.push(bytes);
    }
  } catch (error) {
    if (error instanceof BoundedJsonReadError) throw error;
    const detail = error instanceof Error ? error.message : String(error);
    throw new BoundedJsonReadError('READ_FAILED', `Unable to read ${label}: ${detail}`);
  }

  if (totalBytes === 0) {
    throw new BoundedJsonReadError('INVALID_JSON', `${label} is empty.`);
  }

  const bytes = Buffer.concat(chunks, totalBytes);
  let raw: string;
  try {
    raw = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw new BoundedJsonReadError('INVALID_UTF8', `${label} is not valid UTF-8.`);
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new BoundedJsonReadError('INVALID_JSON', `${label} is not valid JSON.`);
  }
}
