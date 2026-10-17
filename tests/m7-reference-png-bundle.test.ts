import { describe, expect, it } from 'vitest';
import { buildP15ReferencePngBundle, pngSize, P15_REFERENCE_BUNDLE_FILE_NAME } from '../src/core/reference-png-bundle';
import { readP15Zip } from '../src/core/zip';

function fakePng(width: number, height: number): Uint8Array {
  const bytes = new Uint8Array(33);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52]);
  const view = new DataView(bytes.buffer);
  view.setUint32(16, width);
  view.setUint32(20, height);
  return bytes;
}

const renders = [
  { device: 'mobile' as const, frameId: '3:1', name: 'Mobile', widthPx: 390, heightPx: 1200, png: fakePng(390, 1200) },
  { device: 'desktop' as const, frameId: '1:1', name: 'Desktop', widthPx: 1440, heightPx: 900, png: fakePng(1440, 900) },
  { device: 'tablet' as const, frameId: '2:1', name: 'Tablet', widthPx: 1024, heightPx: 1000.4, png: fakePng(1024, 1000) },
];

describe('recovery M7.1 — reference PNG bundle', () => {
  it('reads the PNG IHDR size and rejects non-PNG bytes', () => {
    expect(pngSize(fakePng(10, 20))).toEqual({ widthPx: 10, heightPx: 20 });
    expect(pngSize(new Uint8Array(40))).toBeNull();
  });

  it('bundles one 1× PNG per breakpoint (desktop, tablet, mobile order) with a receipt, deterministically', () => {
    const result = buildP15ReferencePngBundle(renders, 'fp-1');
    expect(result.status).toBe('BUNDLE_READY');
    if (result.status !== 'BUNDLE_READY') return;
    expect(result.fileName).toMatch(P15_REFERENCE_BUNDLE_FILE_NAME);
    expect(result.receipt.frames.map((f) => f.device)).toEqual(['desktop', 'tablet', 'mobile']);
    expect(result.receipt).toEqual(expect.objectContaining({ scale: 1, breakpointSetFingerprint: 'fp-1', roundTripStatus: 'NOT_RUN', targetCompatibilityClaim: false }));
    expect(result.receipt.frames[1]!.heightPx).toBe(1000);
    const entries = readP15Zip(result.bytes);
    expect(entries.map((e) => e.path)).toEqual(['reference/desktop.png', 'reference/tablet.png', 'reference/mobile.png', 'reference-receipt.json']);
    expect(JSON.parse(new TextDecoder().decode(entries[3]!.bytes))).toEqual(result.receipt);
    const again = buildP15ReferencePngBundle(renders, 'fp-1');
    expect(again.status === 'BUNDLE_READY' && Buffer.from(again.bytes).equals(Buffer.from(result.bytes))).toBe(true);
  });

  it('blocks renders that are not 1×, not PNG, duplicated or out of range', () => {
    expect(buildP15ReferencePngBundle([{ ...renders[1]!, png: fakePng(2880, 1800) }], null).status).toBe('BUNDLE_BLOCKED');
    expect(buildP15ReferencePngBundle([{ ...renders[1]!, png: new Uint8Array(30) }], null).status).toBe('BUNDLE_BLOCKED');
    expect(buildP15ReferencePngBundle([renders[1]!, renders[1]!], null).status).toBe('BUNDLE_BLOCKED');
    expect(buildP15ReferencePngBundle([], null).status).toBe('BUNDLE_BLOCKED');
  });

});
