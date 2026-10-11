import { describe, expect, it } from 'vitest';
import { slugFragment } from '../src/core/slug';

describe('recovery M3 — linear slug fragments', () => {
  it('collapses separators, trims dashes and cuts without a trailing dash', () => {
    expect(slugFragment('I1:2;3:4')).toBe('I1-2-3-4');
    expect(slugFragment('  Landing Page!  ', { lowercase: true })).toBe('landing-page');
    expect(slugFragment('IMAGE_ASSET_EXPORT_REQUIRED', { lowercase: true })).toBe('image-asset-export-required');
    expect(slugFragment('ab cd', { maxLength: 3 })).toBe('ab');
    expect(slugFragment('---', { lowercase: true })).toBe('');
    expect(slugFragment('über', { lowercase: true })).toBe('ber');
  });

  it('stays fast on adversarial separator runs', () => {
    const started = Date.now();
    expect(slugFragment(`a${'-'.repeat(200_000)}`)).toBe('a');
    expect(Date.now() - started).toBeLessThan(1_000);
  });
});
