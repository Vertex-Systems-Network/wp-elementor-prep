/**
 * Minimal deterministic ZIP (recovery M3.2): STORE entries only (assets are already compressed images), a fixed
 * 1980-01-01 00:00 timestamp, UTF-8 names and CRC-32, so identical inputs give byte-identical archives. The reader
 * parses exactly what the writer produces and re-checks every CRC, so a pack is verified before it is exposed.
 * No compression, encryption, ZIP64 or extra fields; network-free and runtime-neutral (plugin, CLI, tests).
 */
export interface P15ZipEntry {
  path: string;
  bytes: Uint8Array;
}

const MAX_ENTRIES = 0xffff;
const MAX_SIZE = 0xffffffff;
const DOS_DATE_1980_01_01 = (0 << 9) | (1 << 5) | 1;

let crcTable: Uint32Array | null = null;
function table(): Uint32Array {
  if (crcTable) return crcTable;
  crcTable = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    crcTable[index] = value >>> 0;
  }
  return crcTable;
}

export function crc32(bytes: Uint8Array): number {
  const lookup = table();
  let crc = 0xffffffff;
  for (let index = 0; index < bytes.length; index += 1) crc = lookup[(crc ^ bytes[index]!) & 0xff]! ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

const utf8 = (value: string): Uint8Array => new TextEncoder().encode(value);

/** A safe relative path: forward slashes, no empty, `.` or `..` segments, no leading slash or drive. */
export function validP15ZipPath(path: string): boolean {
  return path.length > 0 && path.length <= 255 && !path.startsWith('/') && !/[\\\0:]/.test(path)
    && path.split('/').every((segment) => segment.length > 0 && segment !== '.' && segment !== '..');
}

export function writeP15Zip(entries: readonly P15ZipEntry[]): Uint8Array {
  if (entries.length > MAX_ENTRIES) throw new Error('Too many ZIP entries.');
  const seen = new Set<string>();
  const locals: Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let offset = 0;
  for (const entry of entries) {
    if (!validP15ZipPath(entry.path) || seen.has(entry.path)) throw new Error(`Invalid or duplicate ZIP path: ${entry.path}`);
    if (entry.bytes.length > MAX_SIZE) throw new Error(`ZIP entry too large: ${entry.path}`);
    seen.add(entry.path);
    const name = utf8(entry.path);
    const crc = crc32(entry.bytes);
    const local = new Uint8Array(30 + name.length);
    const view = new DataView(local.buffer);
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 0x0800, true); // UTF-8 names
    view.setUint16(8, 0, true); // STORE
    view.setUint16(10, 0, true);
    view.setUint16(12, DOS_DATE_1980_01_01, true);
    view.setUint32(14, crc, true);
    view.setUint32(18, entry.bytes.length, true);
    view.setUint32(22, entry.bytes.length, true);
    view.setUint16(26, name.length, true);
    view.setUint16(28, 0, true);
    local.set(name, 30);
    const central = new Uint8Array(46 + name.length);
    const cview = new DataView(central.buffer);
    cview.setUint32(0, 0x02014b50, true);
    cview.setUint16(4, 20, true);
    cview.setUint16(6, 20, true);
    cview.setUint16(8, 0x0800, true);
    cview.setUint16(10, 0, true);
    cview.setUint16(12, 0, true);
    cview.setUint16(14, DOS_DATE_1980_01_01, true);
    cview.setUint32(16, crc, true);
    cview.setUint32(20, entry.bytes.length, true);
    cview.setUint32(24, entry.bytes.length, true);
    cview.setUint16(28, name.length, true);
    cview.setUint32(42, offset, true);
    central.set(name, 46);
    locals.push(local, entry.bytes);
    centrals.push(central);
    offset += local.length + entry.bytes.length;
  }
  const centralSize = centrals.reduce((sum, part) => sum + part.length, 0);
  if (offset > MAX_SIZE || centralSize > MAX_SIZE) throw new Error('ZIP archive too large.');
  const end = new Uint8Array(22);
  const eview = new DataView(end.buffer);
  eview.setUint32(0, 0x06054b50, true);
  eview.setUint16(8, entries.length, true);
  eview.setUint16(10, entries.length, true);
  eview.setUint32(12, centralSize, true);
  eview.setUint32(16, offset, true);
  const parts = [...locals, ...centrals, end];
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.length;
  }
  return out;
}

/** Read an archive written by {@link writeP15Zip}; throws on anything else or on a CRC mismatch. */
export function readP15Zip(archive: Uint8Array): P15ZipEntry[] {
  const view = new DataView(archive.buffer, archive.byteOffset, archive.byteLength);
  if (archive.length < 22 || view.getUint32(archive.length - 22, true) !== 0x06054b50) throw new Error('Not a supported ZIP archive.');
  const count = view.getUint16(archive.length - 22 + 10, true);
  let central = view.getUint32(archive.length - 22 + 16, true);
  const decoder = new TextDecoder('utf-8', { fatal: true });
  const entries: P15ZipEntry[] = [];
  for (let index = 0; index < count; index += 1) {
    if (view.getUint32(central, true) !== 0x02014b50 || view.getUint16(central + 10, true) !== 0) throw new Error('Unsupported ZIP entry.');
    const crc = view.getUint32(central + 16, true);
    const size = view.getUint32(central + 24, true);
    const nameLength = view.getUint16(central + 28, true);
    const extraLength = view.getUint16(central + 30, true);
    const commentLength = view.getUint16(central + 32, true);
    const local = view.getUint32(central + 42, true);
    const path = decoder.decode(archive.subarray(central + 46, central + 46 + nameLength));
    if (view.getUint32(local, true) !== 0x04034b50) throw new Error(`Broken local header for ${path}.`);
    const start = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true);
    const bytes = archive.slice(start, start + size);
    if (bytes.length !== size || crc32(bytes) !== crc) throw new Error(`CRC mismatch for ${path}.`);
    entries.push({ path, bytes });
    central += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}
