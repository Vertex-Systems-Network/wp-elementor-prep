import {
  validateP15NeutralExportDocument,
  type P15NeutralExportDocumentV1,
  type P15NeutralExportNode,
  type P15NeutralReviewNode,
  type P15NeutralExportValidationIssue,
} from './neutral-export-ir';

export const P15_ELEMENTOR_COMPATIBILITY_READINESS_VERSION = 'p15-elementor-compatibility-readiness-v1' as const;

export type P15ElementorCompatibilityCategory =
  | 'NATIVE'
  | 'NATIVE_WITH_REVIEW'
  | 'CONVERTIBLE'
  | 'FALLBACK'
  | 'UNSUPPORTED'
  | 'UNKNOWN';

export type P15ElementorTargetReadyStatus =
  | 'READY'
  | 'READY_WITH_REVIEW'
  | 'NOT_READY'
  | 'INSUFFICIENT_EVIDENCE';

export interface P15ElementorCompatibilityFindingV1 {
  sourceNodeId: string;
  category: P15ElementorCompatibilityCategory;
  reasonCode: string;
}

export interface P15ElementorCompatibilityCountsV1 {
  native: number;
  nativeWithReview: number;
  convertible: number;
  fallback: number;
  unsupported: number;
  unknown: number;
}

export interface P15ElementorCompatibilityReadinessV1 {
  schemaVersion: 1;
  reportVersion: typeof P15_ELEMENTOR_COMPATIBILITY_READINESS_VERSION;
  adapterId: 'elementor-v3-container';
  status: P15ElementorTargetReadyStatus;
  compatibilityCoverage: number;
  eligibleNodeCount: number;
  counts: P15ElementorCompatibilityCountsV1;
  blockers: P15ElementorCompatibilityFindingV1[];
  reviewItems: P15ElementorCompatibilityFindingV1[];
  findings: P15ElementorCompatibilityFindingV1[];
  neutralValidationIssues: Array<Pick<P15NeutralExportValidationIssue, 'code' | 'path'>>;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  importValidationStatus: 'NOT_RUN';
  targetEnvironmentValidationStatus: 'NOT_RUN';
  downloadEnabled: false;
}

function nativeReason(node: Exclude<P15NeutralExportNode, P15NeutralReviewNode>): string {
  if (node.kind === 'container') return 'P15_NATIVE_CONTAINER';
  if (node.kind === 'heading') return 'P15_NATIVE_HEADING';
  if (node.kind === 'text') return 'P15_NATIVE_TEXT_EDITOR';
  if (node.kind === 'button') return 'P15_NATIVE_BUTTON';
  return 'P15_NATIVE_IMAGE';
}

function classifyReview(node: P15NeutralReviewNode): P15ElementorCompatibilityFindingV1 {
  if (node.reasonCode === 'IMAGE_ASSET_EXPORT_REQUIRED') {
    return {
      sourceNodeId: node.sourceNodeId,
      category: 'NATIVE_WITH_REVIEW',
      reasonCode: node.reasonCode,
    };
  }
  if (node.reasonCode === 'UNSUPPORTED_NODE_TYPE' || node.reasonCode === 'SPACING_OUT_OF_RANGE') {
    return {
      sourceNodeId: node.sourceNodeId,
      category: 'UNSUPPORTED',
      reasonCode: node.reasonCode,
    };
  }
  return {
    sourceNodeId: node.sourceNodeId,
    category: 'UNKNOWN',
    reasonCode: node.reasonCode,
  };
}

function collectFindings(nodes: readonly P15NeutralExportNode[], findings: P15ElementorCompatibilityFindingV1[]): void {
  for (const node of nodes) {
    if (node.kind === 'review') {
      findings.push(classifyReview(node));
      continue;
    }
    findings.push({
      sourceNodeId: node.sourceNodeId,
      category: 'NATIVE',
      reasonCode: nativeReason(node),
    });
    if (node.kind === 'container') collectFindings(node.children, findings);
  }
}

function emptyCounts(): P15ElementorCompatibilityCountsV1 {
  return {
    native: 0,
    nativeWithReview: 0,
    convertible: 0,
    fallback: 0,
    unsupported: 0,
    unknown: 0,
  };
}

function countFindings(findings: readonly P15ElementorCompatibilityFindingV1[]): P15ElementorCompatibilityCountsV1 {
  const counts = emptyCounts();
  for (const finding of findings) {
    if (finding.category === 'NATIVE') counts.native += 1;
    else if (finding.category === 'NATIVE_WITH_REVIEW') counts.nativeWithReview += 1;
    else if (finding.category === 'CONVERTIBLE') counts.convertible += 1;
    else if (finding.category === 'FALLBACK') counts.fallback += 1;
    else if (finding.category === 'UNSUPPORTED') counts.unsupported += 1;
    else counts.unknown += 1;
  }
  return counts;
}

function readinessStatus(counts: P15ElementorCompatibilityCountsV1, eligibleNodeCount: number): P15ElementorTargetReadyStatus {
  if (eligibleNodeCount === 0) return 'INSUFFICIENT_EVIDENCE';
  if (counts.unsupported > 0) return 'NOT_READY';
  if (counts.unknown > 0) return 'INSUFFICIENT_EVIDENCE';
  if (counts.nativeWithReview > 0 || counts.convertible > 0 || counts.fallback > 0) return 'READY_WITH_REVIEW';
  return 'READY';
}

function coverage(counts: P15ElementorCompatibilityCountsV1, eligibleNodeCount: number): number {
  if (eligibleNodeCount === 0) return 0;
  const accepted = counts.native + counts.nativeWithReview + counts.convertible + counts.fallback;
  return Math.round(((accepted / eligibleNodeCount) * 100) * 100) / 100;
}

/**
 * Classify only the already-bounded target-neutral IR against mappings implemented by the current
 * v3 generator. This is mapping-readiness evidence, not observed target compatibility or import proof.
 */
export function assessP15ElementorCompatibilityReadiness(
  document: P15NeutralExportDocumentV1,
): P15ElementorCompatibilityReadinessV1 {
  const validation = validateP15NeutralExportDocument(document);
  const findings: P15ElementorCompatibilityFindingV1[] = [];

  if (validation.valid) collectFindings(document.nodes, findings);

  const counts = countFindings(findings);
  const eligibleNodeCount = findings.length;
  const blockers = findings.filter((finding) => finding.category === 'UNSUPPORTED' || finding.category === 'UNKNOWN');
  const reviewItems = findings.filter((finding) => (
    finding.category === 'NATIVE_WITH_REVIEW'
    || finding.category === 'CONVERTIBLE'
    || finding.category === 'FALLBACK'
  ));

  return {
    schemaVersion: 1,
    reportVersion: P15_ELEMENTOR_COMPATIBILITY_READINESS_VERSION,
    adapterId: 'elementor-v3-container',
    status: validation.valid ? readinessStatus(counts, eligibleNodeCount) : 'INSUFFICIENT_EVIDENCE',
    compatibilityCoverage: validation.valid ? coverage(counts, eligibleNodeCount) : 0,
    eligibleNodeCount,
    counts,
    blockers,
    reviewItems,
    findings,
    neutralValidationIssues: validation.issues.map((issue) => ({ code: issue.code, path: issue.path })),
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    importValidationStatus: 'NOT_RUN',
    targetEnvironmentValidationStatus: 'NOT_RUN',
    downloadEnabled: false,
  };
}
