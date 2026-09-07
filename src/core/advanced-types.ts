export type AdvancedPatternKind =
  | 'timeline-sequence'
  | 'alternating-timeline'
  | 'timeline-decoration-overlay'
  | 'carousel-viewport-track'
  | 'fragmented-card-synthesis'
  | 'milestone-grid'
  | 'page-vertical-flow'
  | 'header-hero-overlay';

/**
 * P6 starts read-only. `CANDIDATE` means structurally promising for a future P6 recipe, not that
 * mutation is currently enabled. `PRESERVE` explicitly marks a relationship that normalization
 * must not flatten or compress.
 */
export type AdvancedPatternDecision = 'CANDIDATE' | 'REVIEW' | 'PRESERVE' | 'NOOP';

export interface AdvancedPatternDetection {
  pattern: AdvancedPatternKind;
  decision: AdvancedPatternDecision;
  confidence: number;
  targetNodeId: string;
  targetNodeName: string;
  relatedNodeIds: string[];
  evidence: Record<string, string | number | boolean>;
}
