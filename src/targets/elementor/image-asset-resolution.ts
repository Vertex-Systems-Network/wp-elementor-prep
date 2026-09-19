import { sha256Hex } from '../../core/sha256';
import {
  P15_NEUTRAL_EXPORT_IR_VERSION,
  validateP15NeutralExportDocument,
  type P15NeutralButtonNode,
  type P15NeutralContainerNode,
  type P15NeutralExportDocumentV1,
  type P15NeutralExportNode,
  type P15NeutralHeadingNode,
  type P15NeutralImageNode,
  type P15NeutralReviewNode,
  type P15NeutralTextNode,
} from './neutral-export-ir';

export const P15_ELEMENTOR_IMAGE_ASSET_RESOLUTION_MANIFEST_VERSION =
  'p15-elementor-image-asset-resolution-manifest-v1' as const;
export const P15_ELEMENTOR_IMAGE_ASSET_RESOLUTION_RESULT_VERSION =
  'p15-elementor-image-asset-resolution-result-v1' as const;
export const P15_ELEMENTOR_IMAGE_ASSET_REVIEW_REASON = 'IMAGE_ASSET_EXPORT_REQUIRED' as const;
export const P15_ELEMENTOR_IMAGE_ASSET_MAX_RESOLUTIONS = 10_000 as const;

export interface P15ElementorImageAssetResolutionEntryV1 {
  sourceNodeId: string;
  url: string;
}

export interface P15ElementorImageAssetResolutionManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_IMAGE_ASSET_RESOLUTION_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  assets: P15ElementorImageAssetResolutionEntryV1[];
  networkAccess: false;
  assetUploadPerformed: false;
  assetReferenceClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorImageAssetResolutionIssueCode =
  | 'P15_IMAGE_ASSET_SOURCE_IR_INVALID'
  | 'P15_IMAGE_ASSET_MANIFEST_NOT_OBJECT'
  | 'P15_IMAGE_ASSET_MANIFEST_FIELDS_INVALID'
  | 'P15_IMAGE_ASSET_MANIFEST_VERSION_INVALID'
  | 'P15_IMAGE_ASSET_SOURCE_FINGERPRINT_INVALID'
  | 'P15_IMAGE_ASSET_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_IMAGE_ASSET_RESOLUTIONS_INVALID'
  | 'P15_IMAGE_ASSET_RESOLUTION_ENTRY_INVALID'
  | 'P15_IMAGE_ASSET_RESOLUTION_DUPLICATE_SOURCE_ID'
  | 'P15_IMAGE_ASSET_RESOLUTION_URL_INVALID'
  | 'P15_IMAGE_ASSET_RESOLUTION_SOURCE_NOT_REVIEWABLE'
  | 'P15_IMAGE_ASSET_RESOLUTION_MISSING'
  | 'P15_IMAGE_ASSET_AUTHORITY_FLAGS_INVALID'
  | 'P15_IMAGE_ASSET_RESOLVED_IR_INVALID';

export interface P15ElementorImageAssetResolutionIssueV1 {
  code: P15ElementorImageAssetResolutionIssueCode;
  path: string;
  message: string;
}

export type P15ElementorImageAssetResolutionStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_IMAGE_ASSET_REVIEWS'
  | 'IMAGE_ASSETS_RESOLVED';

export interface P15ElementorImageAssetResolutionReferenceSummaryV1 {
  sourceNodeId: string;
  urlFingerprint: string;
}

export interface P15ElementorImageAssetResolutionResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_IMAGE_ASSET_RESOLUTION_RESULT_VERSION;
  status: P15ElementorImageAssetResolutionStatus;
  sourceIrFingerprint: string | null;
  imageReviewCount: number;
  resolvedImageCount: number;
  remainingReviewCount: number;
  resolvedReferences: P15ElementorImageAssetResolutionReferenceSummaryV1[];
  issues: P15ElementorImageAssetResolutionIssueV1[];
  document: P15NeutralExportDocumentV1 | null;
  networkAccess: false;
  assetUploadPerformed: false;
  assetReferenceClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
  internalReviewRequired: true;
}

const MANIFEST_KEYS = [
  'assetReferenceClosureClaim',
  'assetUploadPerformed',
  'assets',
  'downloadEnabled',
  'manifestVersion',
  'networkAccess',
  'productionAcceptance',
  'schemaVersion',
  'sourceIrFingerprint',
  'targetCompatibilityClaim',
] as const;

const ENTRY_KEYS = ['sourceNodeId', 'url'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const canonical = [...expected].sort();
  return actual.length === canonical.length
    && actual.every((key, index) => key === canonical[index]);
}

function validFingerprint(value: unknown): value is string {
  return typeof value === 'string' && /^sha256:[0-9a-f]{64}$/.test(value);
}

function validSourceNodeId(value: unknown): value is string {
  return typeof value === 'string'
    && value.length > 0
    && value.length <= 512
    && value.trim() === value;
}

function validHttpUrl(value: unknown): value is string {
  if (typeof value !== 'string' || value.length === 0 || value.length > 8192 || value.trim() !== value) return false;
  try {
    const parsed = new URL(value);
    return (parsed.protocol === 'https:' || parsed.protocol === 'http:')
      && parsed.username === ''
      && parsed.password === '';
  } catch {
    return false;
  }
}

function canonicalContainer(node: P15NeutralContainerNode): Record<string, unknown> {
  const value: Record<string, unknown> = {
    kind: 'container',
    sourceNodeId: node.sourceNodeId,
    direction: node.direction,
  };
  if (node.gapPx !== undefined) value.gapPx = node.gapPx;
  if (node.paddingPx !== undefined) {
    value.paddingPx = {
      top: node.paddingPx.top,
      right: node.paddingPx.right,
      bottom: node.paddingPx.bottom,
      left: node.paddingPx.left,
    };
  }
  if (node.alignItems !== undefined) value.alignItems = node.alignItems;
  if (node.justifyContent !== undefined) value.justifyContent = node.justifyContent;
  if (node.backgroundColorHex !== undefined) value.backgroundColorHex = node.backgroundColorHex;
  if (node.cornerRadiusPx !== undefined) value.cornerRadiusPx = node.cornerRadiusPx;
  value.children = node.children.map(canonicalNode);
  return value;
}

function canonicalHeading(node: P15NeutralHeadingNode): Record<string, unknown> {
  const value: Record<string, unknown> = {
    kind: 'heading',
    sourceNodeId: node.sourceNodeId,
    text: node.text,
    level: node.level,
  };
  if (node.align !== undefined) value.align = node.align;
  return value;
}

function canonicalText(node: P15NeutralTextNode): Record<string, unknown> {
  const value: Record<string, unknown> = {
    kind: 'text',
    sourceNodeId: node.sourceNodeId,
    text: node.text,
  };
  if (node.align !== undefined) value.align = node.align;
  return value;
}

function canonicalButton(node: P15NeutralButtonNode): Record<string, unknown> {
  const value: Record<string, unknown> = {
    kind: 'button',
    sourceNodeId: node.sourceNodeId,
    text: node.text,
  };
  if (node.url !== undefined) value.url = node.url;
  if (node.openInNewTab !== undefined) value.openInNewTab = node.openInNewTab;
  if (node.nofollow !== undefined) value.nofollow = node.nofollow;
  if (node.align !== undefined) value.align = node.align;
  return value;
}

function canonicalImage(node: P15NeutralImageNode): Record<string, unknown> {
  const value: Record<string, unknown> = {
    kind: 'image',
    sourceNodeId: node.sourceNodeId,
    url: node.url,
  };
  if (node.attachmentId !== undefined) value.attachmentId = node.attachmentId;
  return value;
}

function canonicalReview(node: P15NeutralReviewNode): Record<string, unknown> {
  return {
    kind: 'review',
    sourceNodeId: node.sourceNodeId,
    reasonCode: node.reasonCode,
    detail: node.detail,
  };
}

function canonicalNode(node: P15NeutralExportNode): Record<string, unknown> {
  if (node.kind === 'container') return canonicalContainer(node);
  if (node.kind === 'heading') return canonicalHeading(node);
  if (node.kind === 'text') return canonicalText(node);
  if (node.kind === 'button') return canonicalButton(node);
  if (node.kind === 'image') return canonicalImage(node);
  return canonicalReview(node);
}

function canonicalDocument(document: P15NeutralExportDocumentV1): string {
  return JSON.stringify({
    schemaVersion: 1,
    irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
    title: document.title,
    documentType: document.documentType,
    nodes: document.nodes.map(canonicalNode),
  });
}

export function fingerprintP15ElementorImageAssetSourceIr(value: unknown): string {
  const validation = validateP15NeutralExportDocument(value);
  if (!validation.valid) {
    const first = validation.issues[0];
    throw new Error(first
      ? `Invalid P15 neutral IR for image-asset fingerprint: ${first.code} at ${first.path}`
      : 'Invalid P15 neutral IR for image-asset fingerprint.');
  }
  return `sha256:${sha256Hex(canonicalDocument(value as P15NeutralExportDocumentV1))}`;
}

function collectImageReviews(
  nodes: readonly P15NeutralExportNode[],
  result: Map<string, P15NeutralReviewNode>,
): void {
  for (const node of nodes) {
    if (node.kind === 'review' && node.reasonCode === P15_ELEMENTOR_IMAGE_ASSET_REVIEW_REASON) {
      result.set(node.sourceNodeId, node);
    } else if (node.kind === 'container') {
      collectImageReviews(node.children, result);
    }
  }
}

function countReviewNodes(nodes: readonly P15NeutralExportNode[]): number {
  let total = 0;
  for (const node of nodes) {
    if (node.kind === 'review') total += 1;
    if (node.kind === 'container') total += countReviewNodes(node.children);
  }
  return total;
}

function cloneNodeWithResolutions(
  node: P15NeutralExportNode,
  resolutions: ReadonlyMap<string, P15ElementorImageAssetResolutionEntryV1>,
): P15NeutralExportNode {
  if (node.kind === 'container') {
    return {
      ...node,
      ...(node.paddingPx ? { paddingPx: { ...node.paddingPx } } : {}),
      children: node.children.map((child) => cloneNodeWithResolutions(child, resolutions)),
    };
  }
  if (node.kind === 'review' && node.reasonCode === P15_ELEMENTOR_IMAGE_ASSET_REVIEW_REASON) {
    const resolution = resolutions.get(node.sourceNodeId);
    if (!resolution) return { ...node };
    return {
      kind: 'image',
      sourceNodeId: node.sourceNodeId,
      url: resolution.url,
    };
  }
  return { ...node };
}

function cloneDocument(
  document: P15NeutralExportDocumentV1,
  resolutions: ReadonlyMap<string, P15ElementorImageAssetResolutionEntryV1>,
): P15NeutralExportDocumentV1 {
  return {
    schemaVersion: 1,
    irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
    title: document.title,
    documentType: document.documentType,
    nodes: document.nodes.map((node) => cloneNodeWithResolutions(node, resolutions)),
  };
}

function baseResult(
  status: P15ElementorImageAssetResolutionStatus,
  sourceIrFingerprint: string | null,
  imageReviewCount: number,
  resolvedImageCount: number,
  remainingReviewCount: number,
  resolvedReferences: P15ElementorImageAssetResolutionReferenceSummaryV1[],
  issues: P15ElementorImageAssetResolutionIssueV1[],
  document: P15NeutralExportDocumentV1 | null,
): P15ElementorImageAssetResolutionResultV1 {
  return {
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_IMAGE_ASSET_RESOLUTION_RESULT_VERSION,
    status,
    sourceIrFingerprint,
    imageReviewCount,
    resolvedImageCount,
    remainingReviewCount,
    resolvedReferences: resolvedReferences.map((entry) => ({ ...entry })),
    issues: issues.map((issue) => ({ ...issue })),
    document,
    networkAccess: false,
    assetUploadPerformed: false,
    assetReferenceClosureClaim: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    downloadEnabled: false,
    internalReviewRequired: true,
  };
}

/**
 * Resolve only exact IMAGE_ASSET_EXPORT_REQUIRED neutral-review nodes into URL-only image nodes.
 *
 * The manifest is bound to the exact canonical source IR. This function never fetches the URL, uploads
 * media, invents a target attachment ID, connects to WordPress/Elementor, or claims asset closure.
 */
export function resolveP15ElementorImageAssets(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorImageAssetResolutionResultV1 {
  const sourceValidation = validateP15NeutralExportDocument(sourceValue);
  if (!sourceValidation.valid) {
    return baseResult(
      'BLOCKED_INVALID_SOURCE_IR',
      null,
      0,
      0,
      0,
      [],
      sourceValidation.issues.map((issue) => ({
        code: 'P15_IMAGE_ASSET_SOURCE_IR_INVALID' as const,
        path: issue.path,
        message: issue.message,
      })),
      null,
    );
  }

  const source = sourceValue as P15NeutralExportDocumentV1;
  const sourceIrFingerprint = fingerprintP15ElementorImageAssetSourceIr(source);
  const imageReviews = new Map<string, P15NeutralReviewNode>();
  collectImageReviews(source.nodes, imageReviews);
  const issues: P15ElementorImageAssetResolutionIssueV1[] = [];
  const resolutions = new Map<string, P15ElementorImageAssetResolutionEntryV1>();

  if (!isRecord(manifestValue)) {
    issues.push({
      code: 'P15_IMAGE_ASSET_MANIFEST_NOT_OBJECT',
      path: '$manifest',
      message: 'Image-asset resolution manifest must be an object.',
    });
  } else {
    if (!exactKeys(manifestValue, MANIFEST_KEYS)) {
      issues.push({
        code: 'P15_IMAGE_ASSET_MANIFEST_FIELDS_INVALID',
        path: '$manifest',
        message: 'Image-asset resolution manifest contains unknown or missing fields.',
      });
    }
    if (manifestValue.schemaVersion !== 1
      || manifestValue.manifestVersion !== P15_ELEMENTOR_IMAGE_ASSET_RESOLUTION_MANIFEST_VERSION) {
      issues.push({
        code: 'P15_IMAGE_ASSET_MANIFEST_VERSION_INVALID',
        path: '$manifest.manifestVersion',
        message: 'Image-asset resolution manifest schema/version is unsupported.',
      });
    }
    if (!validFingerprint(manifestValue.sourceIrFingerprint)) {
      issues.push({
        code: 'P15_IMAGE_ASSET_SOURCE_FINGERPRINT_INVALID',
        path: '$manifest.sourceIrFingerprint',
        message: 'Manifest sourceIrFingerprint must be a SHA-256 fingerprint.',
      });
    } else if (manifestValue.sourceIrFingerprint !== sourceIrFingerprint) {
      issues.push({
        code: 'P15_IMAGE_ASSET_SOURCE_FINGERPRINT_MISMATCH',
        path: '$manifest.sourceIrFingerprint',
        message: 'Manifest is not bound to the exact current neutral IR.',
      });
    }

    if (manifestValue.networkAccess !== false
      || manifestValue.assetUploadPerformed !== false
      || manifestValue.assetReferenceClosureClaim !== false
      || manifestValue.targetCompatibilityClaim !== false
      || manifestValue.productionAcceptance !== false
      || manifestValue.downloadEnabled !== false) {
      issues.push({
        code: 'P15_IMAGE_ASSET_AUTHORITY_FLAGS_INVALID',
        path: '$manifest',
        message: 'Image-asset resolution cannot grant network/upload/closure/compatibility/production/download authority.',
      });
    }

    if (!Array.isArray(manifestValue.assets)
      || manifestValue.assets.length > P15_ELEMENTOR_IMAGE_ASSET_MAX_RESOLUTIONS) {
      issues.push({
        code: 'P15_IMAGE_ASSET_RESOLUTIONS_INVALID',
        path: '$manifest.assets',
        message: `assets must be an array of at most ${P15_ELEMENTOR_IMAGE_ASSET_MAX_RESOLUTIONS} entries.`,
      });
    } else {
      for (let index = 0; index < manifestValue.assets.length; index += 1) {
        const raw = manifestValue.assets[index];
        const path = `$manifest.assets[${index}]`;
        if (!isRecord(raw) || !exactKeys(raw, ENTRY_KEYS) || !validSourceNodeId(raw.sourceNodeId)) {
          issues.push({
            code: 'P15_IMAGE_ASSET_RESOLUTION_ENTRY_INVALID',
            path,
            message: 'Each image-asset resolution must contain only a bounded sourceNodeId and url.',
          });
          continue;
        }
        const sourceNodeId = raw.sourceNodeId;
        if (resolutions.has(sourceNodeId)) {
          issues.push({
            code: 'P15_IMAGE_ASSET_RESOLUTION_DUPLICATE_SOURCE_ID',
            path: `${path}.sourceNodeId`,
            message: 'Image-asset resolution sourceNodeId must be unique.',
          });
          continue;
        }
        if (!validHttpUrl(raw.url)) {
          issues.push({
            code: 'P15_IMAGE_ASSET_RESOLUTION_URL_INVALID',
            path: `${path}.url`,
            message: 'Image-asset resolution URL must be a bounded absolute HTTP(S) URL without credentials.',
          });
          continue;
        }
        const entry = { sourceNodeId, url: raw.url };
        resolutions.set(sourceNodeId, entry);
        if (!imageReviews.has(sourceNodeId)) {
          issues.push({
            code: 'P15_IMAGE_ASSET_RESOLUTION_SOURCE_NOT_REVIEWABLE',
            path: `${path}.sourceNodeId`,
            message: 'Resolution sourceNodeId does not identify an IMAGE_ASSET_EXPORT_REQUIRED review node.',
          });
        }
      }
    }
  }

  for (const sourceNodeId of [...imageReviews.keys()].sort()) {
    if (!resolutions.has(sourceNodeId)) {
      issues.push({
        code: 'P15_IMAGE_ASSET_RESOLUTION_MISSING',
        path: '$manifest.assets',
        message: `Missing image-asset resolution for sourceNodeId ${sourceNodeId}.`,
      });
    }
  }

  if (issues.length > 0) {
    return baseResult(
      'REJECTED_INVALID_MANIFEST',
      sourceIrFingerprint,
      imageReviews.size,
      0,
      sourceValidation.reviewNodeCount,
      [],
      issues,
      null,
    );
  }

  if (imageReviews.size === 0) {
    return baseResult(
      'NO_IMAGE_ASSET_REVIEWS',
      sourceIrFingerprint,
      0,
      0,
      sourceValidation.reviewNodeCount,
      [],
      [],
      cloneDocument(source, resolutions),
    );
  }

  const document = cloneDocument(source, resolutions);
  const resolvedValidation = validateP15NeutralExportDocument(document);
  if (!resolvedValidation.valid) {
    return baseResult(
      'REJECTED_INVALID_MANIFEST',
      sourceIrFingerprint,
      imageReviews.size,
      0,
      sourceValidation.reviewNodeCount,
      [],
      resolvedValidation.issues.map((issue) => ({
        code: 'P15_IMAGE_ASSET_RESOLVED_IR_INVALID' as const,
        path: issue.path,
        message: issue.message,
      })),
      null,
    );
  }

  const resolvedReferences = [...resolutions.values()]
    .filter((entry) => imageReviews.has(entry.sourceNodeId))
    .map((entry) => ({
      sourceNodeId: entry.sourceNodeId,
      urlFingerprint: `sha256:${sha256Hex(entry.url)}`,
    }))
    .sort((left, right) => left.sourceNodeId.localeCompare(right.sourceNodeId));

  return baseResult(
    'IMAGE_ASSETS_RESOLVED',
    sourceIrFingerprint,
    imageReviews.size,
    resolvedReferences.length,
    countReviewNodes(document.nodes),
    resolvedReferences,
    [],
    document,
  );
}

/**
 * Serialize only the sanitized resolution summary. The transformed IR is intentionally omitted because
 * it can contain raw asset URLs and source content.
 */
export function serializeP15ElementorImageAssetResolutionSummary(
  result: P15ElementorImageAssetResolutionResultV1,
): string {
  if (result.networkAccess !== false
    || result.assetUploadPerformed !== false
    || result.assetReferenceClosureClaim !== false
    || result.targetCompatibilityClaim !== false
    || result.productionAcceptance !== false
    || result.downloadEnabled !== false
    || result.internalReviewRequired !== true) {
    throw new Error('Invalid or authority-inflated P15 image-asset resolution result.');
  }

  return `${JSON.stringify({
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_IMAGE_ASSET_RESOLUTION_RESULT_VERSION,
    status: result.status,
    sourceIrFingerprint: result.sourceIrFingerprint,
    imageReviewCount: result.imageReviewCount,
    resolvedImageCount: result.resolvedImageCount,
    remainingReviewCount: result.remainingReviewCount,
    resolvedReferences: result.resolvedReferences.map((entry) => ({ ...entry })),
    issues: result.issues.map((issue) => ({ ...issue })),
    networkAccess: false,
    assetUploadPerformed: false,
    assetReferenceClosureClaim: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    downloadEnabled: false,
    internalReviewRequired: true,
  }, null, 2)}\n`;
}
