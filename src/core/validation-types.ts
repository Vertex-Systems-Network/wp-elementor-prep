export interface ValidationGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type IntegrityAnchorKind = 'text' | 'image';

export interface IntegrityAnchor {
  kind: IntegrityAnchorKind;
  /** Stable content identity. Node ids are intentionally excluded because clone candidates get new ids. */
  fingerprint: string;
  geometry: ValidationGeometry;
  /** Structural path is debug evidence only; validation does not require the candidate to keep the same wrapper tree. */
  path: string;
}

export interface IntegritySnapshot {
  schemaVersion: 1;
  root: {
    width: number;
    height: number;
  };
  textAnchors: IntegrityAnchor[];
  imageAnchors: IntegrityAnchor[];
  visibleNodeCount: number;
  nodeTypeCounts: Record<string, number>;
}

export interface PixelDiffMetrics {
  sameDimensions: boolean;
  widthBefore: number;
  heightBefore: number;
  widthAfter: number;
  heightAfter: number;
  totalPixels: number;
  changedPixels: number;
  changedPixelPct: number;
  meanChannelDelta: number;
  maxChannelDelta: number;
  channelTolerance: number;
}

export interface ValidationThresholds {
  version: string;
  rootSizePx: number;
  anchorPositionPx: number;
  anchorSizePx: number;
  /** Per-channel 0–255 delta ignored when deciding whether a pixel changed. */
  pixelChannelDelta: number;
  /** Percentage on a 0–100 scale. */
  maxChangedPixelPct: number;
  maxMeanChannelDelta: number;
}

export type ValidationFailureCode =
  | 'INVALID_SNAPSHOT_GEOMETRY'
  | 'ROOT_GEOMETRY_DRIFT'
  | 'TEXT_CONTENT_DRIFT'
  | 'IMAGE_CONTENT_DRIFT'
  | 'TEXT_GEOMETRY_DRIFT'
  | 'IMAGE_GEOMETRY_DRIFT'
  | 'PIXEL_DIMENSION_MISMATCH'
  | 'PIXEL_DIFF_EXCEEDED';

export interface ValidationFinding {
  code: ValidationFailureCode;
  severity: 'error';
  title: string;
  detail: string;
  evidence: Record<string, string | number | boolean>;
}

export interface ValidationMetrics {
  textAnchorCountBefore: number;
  textAnchorCountAfter: number;
  imageAnchorCountBefore: number;
  imageAnchorCountAfter: number;
  maxRootSizeDriftPx: number;
  maxTextPositionDriftPx: number;
  maxTextSizeDriftPx: number;
  maxImagePositionDriftPx: number;
  maxImageSizeDriftPx: number;
  visibleNodeCountBefore: number;
  visibleNodeCountAfter: number;
  pixel?: PixelDiffMetrics;
}

export interface ValidationReport {
  schemaVersion: 1;
  passed: boolean;
  thresholdVersion: string;
  thresholds: ValidationThresholds;
  findings: ValidationFinding[];
  metrics: ValidationMetrics;
}
