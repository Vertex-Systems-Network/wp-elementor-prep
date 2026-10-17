import { inflateSync } from 'node:zlib';

/**
 * Minimal PNG → RGBA decoder for the round-trip harness (recovery M7.2): 8-bit truecolour (2) or truecolour+alpha (6),
 * non-interlaced, all five scanline filters. Anything else throws, so the probe never compares a misread image.
 */
export function decodePngRgba(bytes) {
  const buffer = Buffer.from(bytes);
  if (buffer.length < 33 || buffer.readUInt32BE(0) !== 0x89504e47 || buffer.readUInt32BE(4) !== 0x0d0a1a0a) throw new Error('Not a PNG.');
  let offset = 8;
  let width = 0;
  let height = 0;
  let colorType = -1;
  const idat = [];
  while (offset + 8 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('latin1', offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      const bitDepth = data[8];
      colorType = data[9];
      if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6) || data[12] !== 0) throw new Error(`Unsupported PNG (depth ${bitDepth}, colour ${colorType}, interlace ${data[12]}).`);
    } else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    offset += 12 + length;
  }
  if (!width || !height || idat.length === 0) throw new Error('PNG has no image data.');
  const channels = colorType === 6 ? 4 : 3;
  const stride = width * channels;
  const raw = inflateSync(Buffer.concat(idat));
  if (raw.length !== height * (stride + 1)) throw new Error('PNG data length does not match its header.');
  const pixels = new Uint8Array(height * stride);
  for (let y = 0; y < height; y += 1) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const out = y * stride;
    for (let x = 0; x < stride; x += 1) {
      const a = x >= channels ? pixels[out + x - channels] : 0;
      const b = y > 0 ? pixels[out - stride + x] : 0;
      const c = y > 0 && x >= channels ? pixels[out - stride + x - channels] : 0;
      let value;
      if (filter === 0) value = line[x];
      else if (filter === 1) value = line[x] + a;
      else if (filter === 2) value = line[x] + b;
      else if (filter === 3) value = line[x] + ((a + b) >> 1);
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        value = line[x] + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
      } else throw new Error(`Unknown PNG filter ${filter}.`);
      pixels[out + x] = value & 0xff;
    }
  }
  if (channels === 4) return { width, height, data: pixels };
  const rgba = new Uint8Array(width * height * 4);
  for (let index = 0; index < width * height; index += 1) {
    rgba[index * 4] = pixels[index * 3];
    rgba[index * 4 + 1] = pixels[index * 3 + 1];
    rgba[index * 4 + 2] = pixels[index * 3 + 2];
    rgba[index * 4 + 3] = 255;
  }
  return { width, height, data: rgba };
}
