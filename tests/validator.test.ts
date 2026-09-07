import { describe, expect, it } from 'vitest';
import type { IntegrityAnchor, IntegritySnapshot } from '../src/core/validation-types';
import { stableFingerprint, validateIntegrity } from '../src/core/validator';

function anchor(
  kind: 'text' | 'image',
  fingerprint: string,
  x: number,
  y: number,
  width = 200,
  height = 40,
  path = '0/0',
): IntegrityAnchor {
  return { kind, fingerprint, geometry: { x, y, width, height }, path };
}

function snapshot(overrides: Partial<IntegritySnapshot> = {}): IntegritySnapshot {
  return {
    schemaVersion: 1,
    root: { width: 1000, height: 800 },
    textAnchors: [
      anchor('text', `text:${stableFingerprint('Heading')}`, 100, 100, 400, 60, '0/0'),
      anchor('text', `text:${stableFingerprint('Body copy')}`, 100, 190, 500, 80, '0/1'),
    ],
    imageAnchors: [anchor('image', 'image:hash-a', 650, 100, 250, 300, '0/2#fill-0')],
    visibleNodeCount: 8,
    nodeTypeCounts: { FRAME: 5, TEXT: 2, RECTANGLE: 1 },
    ...overrides,
  };
}

describe('stableFingerprint', () => {
  it('is deterministic and content-sensitive without returning raw text', () => {
    const a = stableFingerprint('Hello world');
    expect(a).toBe(stableFingerprint('Hello world'));
    expect(a).not.toBe(stableFingerprint('Hello World'));
    expect(a).not.toContain('Hello');
  });
});

describe('validateIntegrity', () => {
  it('passes a no-op candidate', () => {
    const before = snapshot();
    const after = structuredClone(before);
    const report = validateIntegrity(before, after);

    expect(report.passed).toBe(true);
    expect(report.findings).toEqual([]);
    expect(report.thresholdVersion).toBe('p3-v1');
  });

  it('allows wrapper/node-count changes when visible content and geometry remain equivalent', () => {
    const before = snapshot();
    const after = snapshot({
      visibleNodeCount: 12,
      nodeTypeCounts: { FRAME: 9, TEXT: 2, RECTANGLE: 1 },
      textAnchors: before.textAnchors.map((item, index) => ({ ...item, path: `candidate/${index}` })),
      imageAnchors: before.imageAnchors.map((item) => ({ ...item, path: 'candidate/media#fill-0' })),
    });

    expect(validateIntegrity(before, after).passed).toBe(true);
  });

  it('fails root geometry drift beyond threshold', () => {
    const report = validateIntegrity(snapshot(), snapshot({ root: { width: 1000, height: 806 } }));
    expect(report.passed).toBe(false);
    expect(report.findings.some((item) => item.code === 'ROOT_GEOMETRY_DRIFT')).toBe(true);
  });

  it('fails changed text content even when anchor counts are unchanged', () => {
    const after = snapshot();
    after.textAnchors[1] = anchor('text', `text:${stableFingerprint('Different body')}`, 100, 190, 500, 80, 'x');
    const report = validateIntegrity(snapshot(), after);

    expect(report.passed).toBe(false);
    expect(report.findings.some((item) => item.code === 'TEXT_CONTENT_DRIFT')).toBe(true);
  });

  it('fails changed image content', () => {
    const after = snapshot({ imageAnchors: [anchor('image', 'image:hash-b', 650, 100, 250, 300)] });
    const report = validateIntegrity(snapshot(), after);

    expect(report.passed).toBe(false);
    expect(report.findings.some((item) => item.code === 'IMAGE_CONTENT_DRIFT')).toBe(true);
  });

  it('fails text geometry drift while allowing movement inside the configured tolerance', () => {
    const before = snapshot();
    const within = structuredClone(before);
    within.textAnchors[0]!.geometry.x += 1.5;
    expect(validateIntegrity(before, within).passed).toBe(true);

    const beyond = structuredClone(before);
    beyond.textAnchors[0]!.geometry.y += 3;
    const report = validateIntegrity(before, beyond);
    expect(report.findings.some((item) => item.code === 'TEXT_GEOMETRY_DRIFT')).toBe(true);
  });

  it('fails image geometry drift', () => {
    const before = snapshot();
    const after = structuredClone(before);
    after.imageAnchors[0]!.geometry.width += 5;
    const report = validateIntegrity(before, after);

    expect(report.findings.some((item) => item.code === 'IMAGE_GEOMETRY_DRIFT')).toBe(true);
  });

  it('matches duplicate content anchors by stable visual order instead of Figma node id/path', () => {
    const fp = `text:${stableFingerprint('Repeated')}`;
    const before = snapshot({
      textAnchors: [
        anchor('text', fp, 100, 100, 200, 40, 'old/a'),
        anchor('text', fp, 100, 200, 200, 40, 'old/b'),
      ],
      imageAnchors: [],
    });
    const after = snapshot({
      textAnchors: [
        anchor('text', fp, 100, 200, 200, 40, 'new/z'),
        anchor('text', fp, 100, 100, 200, 40, 'new/y'),
      ],
      imageAnchors: [],
      visibleNodeCount: 14,
    });

    expect(validateIntegrity(before, after).passed).toBe(true);
  });

  it('fails invalid snapshot geometry explicitly', () => {
    const after = snapshot({ root: { width: Number.NaN, height: 800 } });
    const report = validateIntegrity(snapshot(), after);

    expect(report.passed).toBe(false);
    expect(report.findings.some((item) => item.code === 'INVALID_SNAPSHOT_GEOMETRY')).toBe(true);
  });
});
