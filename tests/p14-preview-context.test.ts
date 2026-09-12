import { describe, expect, it } from 'vitest';
import { assessP14PreviewContextBinding } from '../src/plugin/p14-preview-context';
import type { P13RuntimeEvidenceContext } from '../src/plugin/p13-runtime-evidence';

function evidenceContext(overrides: Partial<P13RuntimeEvidenceContext> = {}): P13RuntimeEvidenceContext {
  return {
    fileKey: 'file-1',
    pageId: 'page-1',
    pageName: 'Page One',
    frameId: 'frame-1',
    frameName: 'Desktop — Original',
    ...overrides,
  };
}

describe('P14 Guided Prepare preview current-context binding', () => {
  it('accepts the exact current file/page/frame identity', () => {
    expect(assessP14PreviewContextBinding(evidenceContext(), {
      fileKey: 'file-1',
      pageId: 'page-1',
      frameId: 'frame-1',
    })).toEqual({ valid: true, failures: [] });
  });

  it.each([
    [{ fileKey: 'file-2' }, 'different Figma file'],
    [{ pageId: 'page-2' }, 'different Figma page'],
    [{ frameId: 'frame-2' }, 'different selected Frame'],
  ] as const)('rejects stale %s evidence', (currentOverride, expectedFailure) => {
    const result = assessP14PreviewContextBinding(evidenceContext(), {
      fileKey: currentOverride.fileKey ?? 'file-1',
      pageId: currentOverride.pageId ?? 'page-1',
      frameId: currentOverride.frameId ?? 'frame-1',
    });
    expect(result.valid).toBe(false);
    expect(result.failures.some((failure) => failure.includes(expectedFailure))).toBe(true);
  });

  it('does not use human-readable names as authority', () => {
    expect(assessP14PreviewContextBinding(evidenceContext({
      pageName: 'Renamed Page',
      frameName: 'Renamed Frame',
    }), {
      fileKey: 'file-1',
      pageId: 'page-1',
      frameId: 'frame-1',
    })).toEqual({ valid: true, failures: [] });
  });
});
