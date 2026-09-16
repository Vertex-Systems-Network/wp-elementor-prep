import { createHash } from 'node:crypto';
import { TextDecoder } from 'node:util';

type Fail = (message: string) => never;

export function sha256P16RawBytes(bytes: Uint8Array): string {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
}

export function decodeP16StrictUtf8(
  bytes: Uint8Array,
  label: string,
  fail: Fail,
): string {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    fail(`${label} input is not valid UTF-8.`);
  }
}
