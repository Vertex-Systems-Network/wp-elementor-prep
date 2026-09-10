export type LayoutMode = 'NONE' | 'HORIZONTAL' | 'VERTICAL' | 'GRID' | 'UNKNOWN';

export interface Geometry {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AuditNode {
  id: string;
  name: string;
  type: string;
  geometry: Geometry;
  layoutMode: LayoutMode;
  isAutoLayout: boolean;
  isContainer: boolean;
  isText: boolean;
  isImageLike: boolean;
  isGenericName: boolean;
  textLength: number;
  textAutoResize: string | null;
  absolutePositioned: boolean;
  clipsContent: boolean;
  opacity: number;
  visible: boolean;
  childIds: string[];
  children: AuditNode[];
}

export interface AuditStats {
  nodes: number;
  containers: number;
  autoLayoutContainers: number;
  manualContainers: number;
  autoLayoutCoveragePct: number;
  textNodes: number;
  autoHeightTextNodes: number;
  genericNames: number;
  absolutePositionedNodes: number;
  imageLikeNodes: number;
}

export type FindingSeverity = 'info' | 'warning' | 'error';

export interface AuditFinding {
  code: string;
  severity: FindingSeverity;
  title: string;
  detail: string;
  evidence: Record<string, string | number | boolean>;
}

export type AuditStatus = 'PASS' | 'REVIEW' | 'NEEDS_WORK';

export type PatternKind =
  | 'two-column'
  | 'grid'
  | 'horizontal-row'
  | 'vertical-stack'
  | 'carousel-track'
  | 'unknown';

export type SemanticHint =
  | 'carousel-viewport'
  | 'repeated-cards'
  | 'metric-grid'
  | 'split-header'
  | 'facts-list'
  | 'footer-columns'
  | 'social-link-strip'
  | 'timeline-chapter';

export interface PatternDetection {
  pattern: PatternKind;
  confidence: number;
  targetNodeId: string;
  targetNodeName: string;
  evidence: Record<string, string | number | boolean>;
  /** Optional higher-level interpretation derived conservatively from geometry + subtree evidence. */
  semanticHint?: SemanticHint;
}

export type RoleKind = 'background-layer' | 'absolute-overlay' | 'decorative-overlay';

export interface RoleDetection {
  role: RoleKind;
  confidence: number;
  targetNodeId: string;
  targetNodeName: string;
  parentNodeId: string;
  evidence: Record<string, string | number | boolean>;
}

export interface SectionAudit {
  id: string;
  name: string;
  score: number;
  status: AuditStatus;
  stats: AuditStats;
  findings: AuditFinding[];
  /** Strongest detection retained for backwards-compatible consumers. */
  detection: PatternDetection | null;
  /** Multiple explainable targets for complex sections such as Numbers or Journey. */
  detections: PatternDetection[];
  /** Special visual roles that must be preserved rather than normalized into ordinary flow. */
  roleDetections: RoleDetection[];
  recommendedRecipe: string | null;
}

export interface AuditReport {
  schemaVersion: 1;
  pluginVersion: string;
  root: {
    id: string;
    name: string;
    width: number;
    height: number;
  };
  score: number;
  status: AuditStatus;
  stats: AuditStats;
  findings: AuditFinding[];
  sections: SectionAudit[];
  generatedAt: string;
}
