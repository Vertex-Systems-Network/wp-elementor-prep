import type { P13RuntimeEvidenceContext } from './p13-runtime-evidence';

export interface P14CurrentPreviewContext {
  fileKey: string;
  pageId: string;
  frameId: string;
}

export interface P14PreviewContextBindingAssessment {
  valid: boolean;
  failures: string[];
}

/**
 * Bind a persisted P13 evidence bundle to the exact Figma identity currently being reviewed.
 * Human-readable names are deliberately non-authoritative because they may change without the
 * underlying file/page/frame identity changing.
 */
export function assessP14PreviewContextBinding(
  evidenceContext: P13RuntimeEvidenceContext,
  currentContext: P14CurrentPreviewContext,
): P14PreviewContextBindingAssessment {
  const failures: string[] = [];

  if (evidenceContext.fileKey !== currentContext.fileKey) {
    failures.push('Persisted P13 evidence belongs to a different Figma file.');
  }
  if (evidenceContext.pageId !== currentContext.pageId) {
    failures.push('Persisted P13 evidence belongs to a different Figma page.');
  }
  if (evidenceContext.frameId !== currentContext.frameId) {
    failures.push('Persisted P13 evidence belongs to a different selected Frame.');
  }

  return { valid: failures.length === 0, failures };
}
