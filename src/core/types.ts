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

export interface SectionAudit {
  id: string;
  name: string;
  score: number;
  status: AuditStatus;
  stats: AuditStats;
  findings: AuditFinding[];
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
