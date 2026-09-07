import type {
  IntegrityAnchor,
  IntegritySnapshot,
  PixelDiffMetrics,
  ValidationFinding,
  ValidationGeometry,
  ValidationMetrics,
  ValidationReport,
  ValidationThresholds,
} from './validation-types';

export const DEFAULT_VALIDATION_THRESHOLDS: ValidationThresholds = {
  version: 'p3-v1',
  rootSizePx: 2,
  anchorPositionPx: 2,
  anchorSizePx: 2,
  pixelChannelDelta: 8,
  maxChangedPixelPct: 0.5,
  maxMeanChannelDelta: 0.5,
};

/**
 * Small deterministic non-cryptographic fingerprint used only for local integrity comparison.
 * Length + two independent 32-bit accumulators make accidental collisions less likely while
 * avoiding persistence of raw text content in reports.
 */
export function stableFingerprint(value: string): string {
  let fnv = 0x811c9dc5;
  let djb = 5381;

  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    fnv ^= code;
    fnv = Math.imul(fnv, 0x01000193);
    djb = ((djb << 5) + djb) ^ code;
  }

  const a = (fnv >>> 0).toString(16).padStart(8, '0');
  const b = (djb >>> 0).toString(16).padStart(8, '0');
  return `${value.length}:${a}:${b}`;
}

function finiteGeometry(geometry: ValidationGeometry): boolean {
  return [geometry.x, geometry.y, geometry.width, geometry.height].every(Number.isFinite)
    && geometry.width >= 0
    && geometry.height >= 0;
}

function maxPositionDrift(a: ValidationGeometry, b: ValidationGeometry): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

function maxSizeDrift(a: ValidationGeometry, b: ValidationGeometry): number {
  return Math.max(Math.abs(a.width - b.width), Math.abs(a.height - b.height));
}

function sortedAnchors(anchors: IntegrityAnchor[]): IntegrityAnchor[] {
  return [...anchors].sort((a, b) =>
    a.geometry.y - b.geometry.y
    || a.geometry.x - b.geometry.x
    || a.geometry.width - b.geometry.width
    || a.geometry.height - b.geometry.height
    || a.path.localeCompare(b.path));
}

function groupByFingerprint(anchors: IntegrityAnchor[]): Map<string, IntegrityAnchor[]> {
  const groups = new Map<string, IntegrityAnchor[]>();
  for (const anchor of anchors) {
    const existing = groups.get(anchor.fingerprint);
    if (existing) existing.push(anchor);
    else groups.set(anchor.fingerprint, [anchor]);
  }
  for (const [fingerprint, group] of groups) groups.set(fingerprint, sortedAnchors(group));
  return groups;
}

interface AnchorComparison {
  contentMatches: boolean;
  changedFingerprintGroups: number;
  maxPositionDriftPx: number;
  maxSizeDriftPx: number;
}

function compareAnchorSets(before: IntegrityAnchor[], after: IntegrityAnchor[]): AnchorComparison {
  const a = groupByFingerprint(before);
  const b = groupByFingerprint(after);
  const fingerprints = new Set([...a.keys(), ...b.keys()]);

  let contentMatches = before.length === after.length;
  let changedFingerprintGroups = 0;
  let maxPositionDriftPx = 0;
  let maxSizeDriftPx = 0;

  for (const fingerprint of fingerprints) {
    const beforeGroup = a.get(fingerprint) ?? [];
    const afterGroup = b.get(fingerprint) ?? [];
    if (beforeGroup.length !== afterGroup.length) {
      contentMatches = false;
      changedFingerprintGroups += 1;
      continue;
    }

    for (let index = 0; index < beforeGroup.length; index += 1) {
      const left = beforeGroup[index];
      const right = afterGroup[index];
      if (!left || !right) continue;
      maxPositionDriftPx = Math.max(maxPositionDriftPx, maxPositionDrift(left.geometry, right.geometry));
      maxSizeDriftPx = Math.max(maxSizeDriftPx, maxSizeDrift(left.geometry, right.geometry));
    }
  }

  return { contentMatches, changedFingerprintGroups, maxPositionDriftPx, maxSizeDriftPx };
}

function snapshotGeometryValid(snapshot: IntegritySnapshot): boolean {
  if (!Number.isFinite(snapshot.root.width) || !Number.isFinite(snapshot.root.height)) return false;
  if (snapshot.root.width <= 0 || snapshot.root.height <= 0) return false;
  return [...snapshot.textAnchors, ...snapshot.imageAnchors].every((anchor) => finiteGeometry(anchor.geometry));
}

function finding(
  code: ValidationFinding['code'],
  title: string,
  detail: string,
  evidence: Record<string, string | number | boolean>,
): ValidationFinding {
  return { code, severity: 'error', title, detail, evidence };
}

/**
 * Compare two section snapshots without requiring equal node ids or wrapper structure.
 * This is intentional: a future safe refactor may create/reparent wrapper containers while
 * visible text/images must remain equivalent and anchored to the same rendered geometry.
 */
export function validateIntegrity(
  before: IntegritySnapshot,
  after: IntegritySnapshot,
  thresholds: ValidationThresholds = DEFAULT_VALIDATION_THRESHOLDS,
): ValidationReport {
  const findings: ValidationFinding[] = [];
  const beforeValid = snapshotGeometryValid(before);
  const afterValid = snapshotGeometryValid(after);

  if (!beforeValid || !afterValid) {
    findings.push(finding(
      'INVALID_SNAPSHOT_GEOMETRY',
      'Snapshot contains invalid geometry',
      'Validation cannot trust a snapshot containing non-finite, negative, or zero-sized root geometry.',
      { beforeValid, afterValid },
    ));
  }

  const rootDrift = Math.max(
    Math.abs(before.root.width - after.root.width),
    Math.abs(before.root.height - after.root.height),
  );
  if (rootDrift > thresholds.rootSizePx) {
    findings.push(finding(
      'ROOT_GEOMETRY_DRIFT',
      'Section bounds changed',
      'The candidate section changed width or height beyond the allowed root-size tolerance.',
      { maxDriftPx: rootDrift, allowedPx: thresholds.rootSizePx },
    ));
  }

  const text = compareAnchorSets(before.textAnchors, after.textAnchors);
  if (!text.contentMatches) {
    findings.push(finding(
      'TEXT_CONTENT_DRIFT',
      'Text content changed',
      'The candidate does not contain the same multiset of text-content fingerprints as the original section.',
      {
        beforeCount: before.textAnchors.length,
        afterCount: after.textAnchors.length,
        changedFingerprintGroups: text.changedFingerprintGroups,
      },
    ));
  } else if (
    text.maxPositionDriftPx > thresholds.anchorPositionPx
    || text.maxSizeDriftPx > thresholds.anchorSizePx
  ) {
    findings.push(finding(
      'TEXT_GEOMETRY_DRIFT',
      'Text geometry drifted',
      'Text content is intact, but one or more text anchors moved or resized beyond tolerance.',
      {
        maxPositionDriftPx: text.maxPositionDriftPx,
        maxSizeDriftPx: text.maxSizeDriftPx,
        allowedPositionPx: thresholds.anchorPositionPx,
        allowedSizePx: thresholds.anchorSizePx,
      },
    ));
  }

  const image = compareAnchorSets(before.imageAnchors, after.imageAnchors);
  if (!image.contentMatches) {
    findings.push(finding(
      'IMAGE_CONTENT_DRIFT',
      'Image content changed',
      'The candidate does not contain the same multiset of image-fill fingerprints as the original section.',
      {
        beforeCount: before.imageAnchors.length,
        afterCount: after.imageAnchors.length,
        changedFingerprintGroups: image.changedFingerprintGroups,
      },
    ));
  } else if (
    image.maxPositionDriftPx > thresholds.anchorPositionPx
    || image.maxSizeDriftPx > thresholds.anchorSizePx
  ) {
    findings.push(finding(
      'IMAGE_GEOMETRY_DRIFT',
      'Image geometry drifted',
      'Image content is intact, but one or more image anchors moved or resized beyond tolerance.',
      {
        maxPositionDriftPx: image.maxPositionDriftPx,
        maxSizeDriftPx: image.maxSizeDriftPx,
        allowedPositionPx: thresholds.anchorPositionPx,
        allowedSizePx: thresholds.anchorSizePx,
      },
    ));
  }

  const metrics: ValidationMetrics = {
    textAnchorCountBefore: before.textAnchors.length,
    textAnchorCountAfter: after.textAnchors.length,
    imageAnchorCountBefore: before.imageAnchors.length,
    imageAnchorCountAfter: after.imageAnchors.length,
    maxRootSizeDriftPx: rootDrift,
    maxTextPositionDriftPx: text.maxPositionDriftPx,
    maxTextSizeDriftPx: text.maxSizeDriftPx,
    maxImagePositionDriftPx: image.maxPositionDriftPx,
    maxImageSizeDriftPx: image.maxSizeDriftPx,
    visibleNodeCountBefore: before.visibleNodeCount,
    visibleNodeCountAfter: after.visibleNodeCount,
  };

  return {
    schemaVersion: 1,
    passed: findings.length === 0,
    thresholdVersion: thresholds.version,
    thresholds,
    findings,
    metrics,
  };
}

/** Append section-level rendered-pixel evidence to an existing integrity report. */
export function mergePixelValidation(report: ValidationReport, pixel: PixelDiffMetrics): ValidationReport {
  const findings = [...report.findings];
  const thresholds = report.thresholds;

  if (!pixel.sameDimensions) {
    findings.push(finding(
      'PIXEL_DIMENSION_MISMATCH',
      'Rendered dimensions differ',
      'Original and candidate PNG exports decoded to different pixel dimensions.',
      {
        widthBefore: pixel.widthBefore,
        heightBefore: pixel.heightBefore,
        widthAfter: pixel.widthAfter,
        heightAfter: pixel.heightAfter,
      },
    ));
  } else if (
    pixel.changedPixelPct > thresholds.maxChangedPixelPct
    || pixel.meanChannelDelta > thresholds.maxMeanChannelDelta
  ) {
    findings.push(finding(
      'PIXEL_DIFF_EXCEEDED',
      'Rendered pixel drift exceeded threshold',
      'The candidate render differs from the original beyond the configured section-level visual tolerance.',
      {
        changedPixelPct: pixel.changedPixelPct,
        allowedChangedPixelPct: thresholds.maxChangedPixelPct,
        meanChannelDelta: pixel.meanChannelDelta,
        allowedMeanChannelDelta: thresholds.maxMeanChannelDelta,
        maxChannelDelta: pixel.maxChannelDelta,
        channelTolerance: pixel.channelTolerance,
      },
    ));
  }

  return {
    ...report,
    passed: findings.length === 0,
    findings,
    metrics: { ...report.metrics, pixel },
  };
}
