import { describe, expect, it } from 'vitest';
import { sha256Hex } from '../src/core/sha256';

describe('runtime-neutral SHA-256', () => {
  it('matches standard known vectors', () => {
    expect(sha256Hex('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(sha256Hex('hello world')).toBe('b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9');
  });

  it('is deterministic and sensitive to exact UTF-8 input bytes', () => {
    const value = 'Elementor candidate π 🚀';
    expect(sha256Hex(value)).toBe(sha256Hex(value));
    expect(sha256Hex(value)).not.toBe(sha256Hex(`${value}\n`));
    expect(sha256Hex('A')).not.toBe(sha256Hex('a'));
  });
});
