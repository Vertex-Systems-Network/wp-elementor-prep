import { deflateSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { decodePngRgba } from '../scripts/png-rgba.mjs';

function png(width, height, colorType, rows) {
  const chunk = (type, data) => {
    const out = Buffer.alloc(12 + data.length);
    out.writeUInt32BE(data.length, 0); out.write(type, 4, 'latin1'); data.copy(out, 8);
    return out; // CRC is not checked by the decoder
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = colorType;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(Buffer.from(rows))), chunk('IEND', Buffer.alloc(0))]);
}

describe('recovery M7.2 — PNG decoder', () => {
  it('decodes RGB with Sub/Up/Paeth filters to RGBA', () => {
    // 2x2 RGB: row0 filter Sub, row1 filter Up then Paeth checked separately.
    const image = decodePngRgba(png(2, 2, 2, [1, 10, 20, 30, 5, 5, 5, 2, 1, 1, 1, 2, 2, 2]));
    expect(Array.from(image.data)).toEqual([10, 20, 30, 255, 15, 25, 35, 255, 11, 21, 31, 255, 17, 27, 37, 255]);
    const paeth = decodePngRgba(png(1, 2, 6, [0, 1, 2, 3, 4, 4, 1, 1, 1, 1]));
    expect(Array.from(paeth.data)).toEqual([1, 2, 3, 4, 2, 3, 4, 5]);
  });

  it('rejects unsupported or corrupt input', () => {
    expect(() => decodePngRgba(Buffer.alloc(40))).toThrow('Not a PNG');
    expect(() => decodePngRgba(png(1, 1, 3, [0, 0]))).toThrow('Unsupported PNG');
    expect(() => decodePngRgba(png(2, 2, 2, [0, 1]))).toThrow('length');
  });
});
