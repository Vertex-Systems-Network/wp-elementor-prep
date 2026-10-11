import { createHash, randomBytes } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { sha256BytesHex, sha256Hex } from '../src/core/sha256';

describe('recovery M3 — byte SHA-256', () => {
  it('matches node:crypto on raw bytes, including block-boundary lengths and empty input', () => {
    for (const length of [0, 1, 55, 56, 63, 64, 65, 1000, 70_000]) {
      const bytes = randomBytes(length);
      expect(sha256BytesHex(bytes), String(length)).toBe(createHash('sha256').update(bytes).digest('hex'));
    }
    expect(sha256BytesHex([0x61, 0x62, 0x63])).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });

  it('the text variant is unchanged', () => {
    expect(sha256Hex('héllo')).toBe(createHash('sha256').update('héllo').digest('hex'));
  });
});
