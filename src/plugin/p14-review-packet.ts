import type { BuildReadyReportV2 } from '../core/build-ready-types';
import type { P7RuntimeBuildIdentity } from '../core/batch-runtime-evidence';
import type {
  P13RuntimeEvidenceBundle,
  P13RuntimeEvidenceContext,
} from './p13-runtime-evidence';
import type { P14PlanPreviewV1 } from './p14-plan-preview';
import type { P14ProposedChangeReviewManifestV1 } from './p14-proposed-change-review';

export const P14_REVIEW_PACKET_SCHEMA_VERSION = 1 as const;
export const P14_REVIEW_PACKET_VERSION = 1 as const;

export interface P14ReviewPacketV1 {
  schemaVersion: typeof P14_REVIEW_PACKET_SCHEMA_VERSION;
  packetVersion: typeof P14_REVIEW_PACKET_VERSION;
  acceptanceAuthority: false;
  targetCompatibilityClaim: false;
  mutationEnabled: false;
  confirmationEnabled: false;
  runtime: {
    pluginVersion: string;
    build: P7RuntimeBuildIdentity;
  };
  evidence: {
    capturedAt: string;
    pluginVersion: string;
    build: P7RuntimeBuildIdentity;
    traceableBuild: boolean;
    realFigmaContext: boolean;
  };
  context: P13RuntimeEvidenceContext;
  p13Identity: {
    runId: string;
    structuralHash: string;
    configHash: string;
    analyzerVersion: string;
  };
  preview: {
    schemaVersion: P14PlanPreviewV1['schemaVersion'];
    previewVersion: P14PlanPreviewV1['previewVersion'];
    status: P14PlanPreviewV1['summary']['status'];
    totalActions: number;
    eligible: number;
    noOp: number;
    review: number;
    refused: number;
    blockers: number;
    planDigest: string | null;
  };
  reviewManifest: P14ProposedChangeReviewManifestV1 | null;
}

function sameBuild(a: P7RuntimeBuildIdentity, b: P7RuntimeBuildIdentity): boolean {
  return a.sourceSha === b.sourceSha
    && a.runId === b.runId
    && a.runNumber === b.runNumber;
}

function assertReadOnlyPreview(preview: P14PlanPreviewV1): void {
  if (preview.acceptanceAuthority !== false
    || preview.targetCompatibilityClaim !== false
    || preview.mutationEnabled !== false
    || preview.confirmationEnabled !== false) {
    throw new Error('P14 review packet requires a fully read-only Guided Prepare preview.');
  }
}

function buildP13Identity(report: BuildReadyReportV2): P14ReviewPacketV1['p13Identity'] {
  return {
    runId: report.runId,
    structuralHash: report.source.structuralHash,
    configHash: report.source.configHash,
    analyzerVersion: report.source.analyzerVersion,
  };
}

function cloneReviewManifest(
  manifest: P14ProposedChangeReviewManifestV1 | null,
): P14ProposedChangeReviewManifestV1 | null {
  if (!manifest) return null;
  return JSON.parse(JSON.stringify(manifest)) as P14ProposedChangeReviewManifestV1;
}

/**
 * Build a deterministic human-review packet for the exact development-only P14 preview context.
 *
 * The packet deliberately creates no approval, confirmation or execution capability. It only
 * snapshots already-validated runtime/evidence identity next to the existing read-only review
 * manifest so an exported artifact cannot silently lose file/page/frame or build provenance.
 */
export function buildP14ReviewPacket(input: {
  preview: P14PlanPreviewV1;
  evidence: P13RuntimeEvidenceBundle;
  pluginVersion: string;
  runtimeBuild: P7RuntimeBuildIdentity;
}): P14ReviewPacketV1 {
  assertReadOnlyPreview(input.preview);
  if (input.evidence.pluginVersion !== input.pluginVersion) {
    throw new Error('P14 review packet plugin version does not match persisted P13 evidence.');
  }
  if (!sameBuild(input.evidence.build, input.runtimeBuild)) {
    throw new Error('P14 review packet runtime build does not match persisted P13 evidence.');
  }

  const summary = input.preview.summary;
  return {
    schemaVersion: P14_REVIEW_PACKET_SCHEMA_VERSION,
    packetVersion: P14_REVIEW_PACKET_VERSION,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    mutationEnabled: false,
    confirmationEnabled: false,
    runtime: {
      pluginVersion: input.pluginVersion,
      build: { ...input.runtimeBuild },
    },
    evidence: {
      capturedAt: input.evidence.capturedAt,
      pluginVersion: input.evidence.pluginVersion,
      build: { ...input.evidence.build },
      traceableBuild: input.evidence.traceableBuild,
      realFigmaContext: input.evidence.realFigmaContext,
    },
    context: { ...input.evidence.context },
    p13Identity: buildP13Identity(input.evidence.buildReady),
    preview: {
      schemaVersion: input.preview.schemaVersion,
      previewVersion: input.preview.previewVersion,
      status: summary.status,
      totalActions: summary.totalActions,
      eligible: summary.eligible,
      noOp: summary.noOp,
      review: summary.review,
      refused: summary.refused,
      blockers: summary.blockers,
      planDigest: input.preview.plan?.planDigest ?? null,
    },
    reviewManifest: cloneReviewManifest(input.preview.reviewManifest),
  };
}

export function serializeP14ReviewPacketJson(packet: P14ReviewPacketV1): string {
  return `${JSON.stringify(packet, null, 2)}\n`;
}
