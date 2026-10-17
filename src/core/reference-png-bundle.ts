import { sha256BytesHex, sha256Hex } from './sha256';
import { writeP15Zip, type P15ZipEntry } from './zip';
import type { P15Device } from './breakpoint-set';

/**
 * Reference PNG bundle (recovery M7.1): one 1× render per breakpoint frame plus a receipt, as one deterministic ZIP.
 * The receipt is the input of the M7.2 round-trip comparison; it claims nothing about the target (`roundTripStatus`
 * stays NOT_RUN). Every PNG is checked before exposure: PNG signature, and an IHDR size equal to the frame size at 1×.
 */
export const P15_REFERENCE_BUNDLE_VERSION = 'p15-reference-png-bundle-v1' as const;
export const P15_REFERENCE_BUNDLE_FILE_NAME = /^reference-pngs-[0-9a-f]{16}\.zip$/;
const MAX_FRAMES = 3;
const MAX_PNG_BYTES = 50 * 1024 * 1024;
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] as const;

export interface P15ReferenceFrameRender {
  device: P15Device;
  frameId: string;
  name: string;
  widthPx: number;
  heightPx: number;
  png: Uint8Array;
}

export interface P15ReferenceReceiptFrame {
  device: P15Device;
  frameId: string;
  name: string;
  widthPx: number;
  heightPx: number;
  path: string;
  byteLength: number;
  sha256: string;
}

export interface P15ReferenceReceiptV1 {
  version: typeof P15_REFERENCE_BUNDLE_VERSION;
  scale: 1;
  /** Fingerprint of the confirmed breakpoint set, or null for a single selected frame. */
  breakpointSetFingerprint: string | null;
  frames: P15ReferenceReceiptFrame[];
  roundTripStatus: 'NOT_RUN';
  targetCompatibilityClaim: false;
}

export type P15ReferenceBundleResultV1 =
  | { version: typeof P15_REFERENCE_BUNDLE_VERSION; status: 'BUNDLE_READY'; fileName: string; bytes: Uint8Array; receipt: P15ReferenceReceiptV1 }
  | { version: typeof P15_REFERENCE_BUNDLE_VERSION; status: 'BUNDLE_BLOCKED'; fileName: null; bytes: null; receipt: null; blockReason: string };

function blocked(blockReason: string): P15ReferenceBundleResultV1 {
  return { version: P15_REFERENCE_BUNDLE_VERSION, status: 'BUNDLE_BLOCKED', fileName: null, bytes: null, receipt: null, blockReason };
}

/** Width and height from the PNG IHDR chunk, or null when the bytes are not a PNG. */
export function pngSize(bytes: Uint8Array): { widthPx: number; heightPx: number } | null {
  if (bytes.length < 24 || PNG_SIGNATURE.some((value, index) => bytes[index] !== value)) return null;
  if (String.fromCharCode(bytes[12]!, bytes[13]!, bytes[14]!, bytes[15]!) !== 'IHDR') return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return { widthPx: view.getUint32(16), heightPx: view.getUint32(20) };
}

const DEVICE_ORDER: readonly P15Device[] = ['desktop', 'tablet', 'mobile'];

export function buildP15ReferencePngBundle(
  renders: readonly P15ReferenceFrameRender[],
  breakpointSetFingerprint: string | null,
): P15ReferenceBundleResultV1 {
  if (renders.length === 0 || renders.length > MAX_FRAMES) return blocked(`Expected 1–${MAX_FRAMES} frames; got ${renders.length}.`);
  if (new Set(renders.map((render) => render.device)).size !== renders.length) return blocked('Each breakpoint may appear only once.');
  const ordered = [...renders].sort((a, b) => DEVICE_ORDER.indexOf(a.device) - DEVICE_ORDER.indexOf(b.device));
  const entries: P15ZipEntry[] = [];
  const frames: P15ReferenceReceiptFrame[] = [];
  for (const render of ordered) {
    if (render.png.length === 0 || render.png.length > MAX_PNG_BYTES) return blocked(`${render.device}: PNG is empty or too large.`);
    const size = pngSize(render.png);
    if (!size) return blocked(`${render.device}: the render is not a PNG.`);
    // Figma rasterises fractional frame sizes to whole pixels; anything beyond a 1 px rounding step is not a 1× render.
    if (Math.abs(size.widthPx - render.widthPx) >= 1 || Math.abs(size.heightPx - render.heightPx) >= 1) {
      return blocked(`${render.device}: the PNG is ${size.widthPx}×${size.heightPx}, but the frame at 1× is ${render.widthPx}×${render.heightPx}.`);
    }
    const width = size.widthPx;
    const height = size.heightPx;
    const path = `reference/${render.device}.png`;
    entries.push({ path, bytes: render.png });
    frames.push({
      device: render.device, frameId: render.frameId, name: render.name, widthPx: width, heightPx: height,
      path, byteLength: render.png.length, sha256: `sha256:${sha256BytesHex(render.png)}`,
    });
  }
  const receipt: P15ReferenceReceiptV1 = {
    version: P15_REFERENCE_BUNDLE_VERSION, scale: 1, breakpointSetFingerprint, frames, roundTripStatus: 'NOT_RUN', targetCompatibilityClaim: false,
  };
  const receiptJson = `${JSON.stringify(receipt, null, 2)}\n`;
  entries.push({ path: 'reference-receipt.json', bytes: new TextEncoder().encode(receiptJson) });
  const bytes = writeP15Zip(entries);
  const fileName = `reference-pngs-${sha256Hex(receiptJson).slice(0, 16)}.zip`;
  return { version: P15_REFERENCE_BUNDLE_VERSION, status: 'BUNDLE_READY', fileName, bytes, receipt };
}
