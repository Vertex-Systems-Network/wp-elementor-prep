import { sha256Hex } from '../../core/sha256';
import {
  P15_NEUTRAL_EXPORT_IR_VERSION,
  P15_NEUTRAL_EXPORT_MAX_URL_LENGTH,
  validateP15NeutralExportDocument,
  type P15NeutralButtonNode,
  type P15NeutralContainerNode,
  type P15NeutralExportDocumentV1,
  type P15NeutralExportNode,
  type P15NeutralHeadingLevel,
  type P15NeutralHeadingNode,
  type P15NeutralTextNode,
} from './neutral-export-ir';
import { fingerprintP15NeutralExportDocument } from './neutral-export-ir-identity';

export const P15_ELEMENTOR_SEMANTIC_RESOLUTION_MANIFEST_VERSION =
  'p15-elementor-semantic-resolution-manifest-v1' as const;
export const P15_ELEMENTOR_SEMANTIC_RESOLUTION_RESULT_VERSION =
  'p15-elementor-semantic-resolution-result-v1' as const;
export const P15_ELEMENTOR_SEMANTIC_RESOLUTION_MAX_ENTRIES = 10_000 as const;

export interface P15ElementorHeadingSemanticResolutionV1 {
  sourceNodeId: string;
  targetKind: 'heading';
  level: P15NeutralHeadingLevel;
}

export interface P15ElementorButtonSemanticResolutionV1 {
  sourceNodeId: string;
  targetKind: 'button';
  url?: string;
  openInNewTab?: boolean;
  nofollow?: boolean;
}

export type P15ElementorSemanticResolutionEntryV1 =
  | P15ElementorHeadingSemanticResolutionV1
  | P15ElementorButtonSemanticResolutionV1;

export interface P15ElementorSemanticResolutionManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_SEMANTIC_RESOLUTION_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  semantics: P15ElementorSemanticResolutionEntryV1[];
  semanticInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorSemanticResolutionIssueCode =
  | 'P15_SEMANTIC_SOURCE_IR_INVALID'
  | 'P15_SEMANTIC_MANIFEST_NOT_OBJECT'
  | 'P15_SEMANTIC_MANIFEST_FIELDS_INVALID'
  | 'P15_SEMANTIC_MANIFEST_VERSION_INVALID'
  | 'P15_SEMANTIC_SOURCE_FINGERPRINT_INVALID'
  | 'P15_SEMANTIC_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_SEMANTIC_ENTRIES_INVALID'
  | 'P15_SEMANTIC_ENTRY_INVALID'
  | 'P15_SEMANTIC_DUPLICATE_SOURCE_ID'
  | 'P15_SEMANTIC_SOURCE_NOT_TEXT'
  | 'P15_SEMANTIC_HEADING_LEVEL_INVALID'
  | 'P15_SEMANTIC_BUTTON_URL_INVALID'
  | 'P15_SEMANTIC_BUTTON_BOOLEAN_INVALID'
  | 'P15_SEMANTIC_JUSTIFY_ALIGNMENT_UNSUPPORTED'
  | 'P15_SEMANTIC_AUTHORITY_FLAGS_INVALID'
  | 'P15_SEMANTIC_RESOLVED_IR_INVALID';

export interface P15ElementorSemanticResolutionIssueV1 {
  code: P15ElementorSemanticResolutionIssueCode;
  path: string;
  message: string;
}

export type P15ElementorSemanticResolutionStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_SEMANTIC_RESOLUTIONS'
  | 'SEMANTICS_RESOLVED';

export type P15ElementorSemanticResolutionSummaryEntryV1 =
  | {
      sourceNodeId: string;
      targetKind: 'heading';
      level: P15NeutralHeadingLevel;
    }
  | {
      sourceNodeId: string;
      targetKind: 'button';
      urlPresent: boolean;
      urlFingerprint: string | null;
      openInNewTab: boolean;
      nofollow: boolean;
    };

export interface P15ElementorSemanticResolutionResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_SEMANTIC_RESOLUTION_RESULT_VERSION;
  status: P15ElementorSemanticResolutionStatus;
  sourceIrFingerprint: string | null;
  eligibleTextCount: number;
  resolvedSemanticCount: number;
  remainingTextCount: number;
  remainingReviewCount: number;
  resolvedSemantics: P15ElementorSemanticResolutionSummaryEntryV1[];
  issues: P15ElementorSemanticResolutionIssueV1[];
  document: P15NeutralExportDocumentV1 | null;
  semanticInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
  internalReviewRequired: true;
}

const MANIFEST_KEYS = [
  'downloadEnabled',
  'figmaMutation',
  'manifestVersion',
  'networkAccess',
  'productionAcceptance',
  'schemaVersion',
  'semanticInferencePerformed',
  'semantics',
  'sourceIrFingerprint',
  'targetCompatibilityClaim',
] as const;

const HEADING_KEYS = ['level', 'sourceNodeId', 'targetKind'] as const;
const BUTTON_KEYS = ['nofollow', 'openInNewTab', 'sourceNodeId', 'targetKind', 'url'] as const;
const HEADING_LEVELS: readonly P15NeutralHeadingLevel[] = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span', 'p',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const canonical = [...expected].sort();
  return actual.length === canonical.length
    && actual.every((key, index) => key === canonical[index]);
}

function onlyAllowedKeys(value: Record<string, unknown>, allowed: readonly string[]): boolean {
  return Object.keys(value).every((key) => allowed.includes(key));
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

function validHeadingLevel(value: unknown): value is P15NeutralHeadingLevel {
  return typeof value === 'string' && HEADING_LEVELS.includes(value as P15NeutralHeadingLevel);
}

function validButtonUrl(value: unknown): value is string {
  if (typeof value !== 'string'
    || value.length === 0
    || value.length > P15_NEUTRAL_EXPORT_MAX_URL_LENGTH
    || /[\u0000-\u001f\u007f]/.test(value)) {
    return false;
  }
  if (value.startsWith('/') || value.startsWith('#')) return true;
  try {
    const parsed = new URL(value);
    return ['https:', 'http:', 'mailto:', 'tel:'].includes(parsed.protocol)
      && parsed.username === ''
      && parsed.password === '';
  } catch {
    return false;
  }
}

function countReviewNodes(nodes: readonly P15NeutralExportNode[]): number {
  let count = 0;
  for (const node of nodes) {
    if (node.kind === 'review') count += 1;
    if (node.kind === 'container') count += countReviewNodes(node.children);
  }
  return count;
}

function collectTextNodes(
  nodes: readonly P15NeutralExportNode[],
  texts: Map<string, P15NeutralTextNode>,
): void {
  for (const node of nodes) {
    if (node.kind === 'text') texts.set(node.sourceNodeId, node);
    if (node.kind === 'container') collectTextNodes(node.children, texts);
  }
}

function countTextNodes(nodes: readonly P15NeutralExportNode[]): number {
  let count = 0;
  for (const node of nodes) {
    if (node.kind === 'text') count += 1;
    if (node.kind === 'container') count += countTextNodes(node.children);
  }
  return count;
}

function cloneContainer(
  node: P15NeutralContainerNode,
  resolutions: ReadonlyMap<string, P15ElementorSemanticResolutionEntryV1>,
): P15NeutralContainerNode {
  return {
    ...node,
    ...(node.paddingPx ? { paddingPx: { ...node.paddingPx } } : {}),
    children: node.children.map((child) => cloneNodeWithSemantics(child, resolutions)),
  };
}

function headingFromText(
  node: P15NeutralTextNode,
  entry: P15ElementorHeadingSemanticResolutionV1,
): P15NeutralHeadingNode {
  return {
    kind: 'heading',
    sourceNodeId: node.sourceNodeId,
    text: node.text,
    level: entry.level,
    ...(node.align ? { align: node.align } : {}),
  };
}

function buttonFromText(
  node: P15NeutralTextNode,
  entry: P15ElementorButtonSemanticResolutionV1,
): P15NeutralButtonNode {
  return {
    kind: 'button',
    sourceNodeId: node.sourceNodeId,
    text: node.text,
    ...(entry.url !== undefined ? { url: entry.url } : {}),
    ...(entry.openInNewTab !== undefined ? { openInNewTab: entry.openInNewTab } : {}),
    ...(entry.nofollow !== undefined ? { nofollow: entry.nofollow } : {}),
    ...(node.align ? { align: node.align } : {}),
  };
}

function cloneNodeWithSemantics(
  node: P15NeutralExportNode,
  resolutions: ReadonlyMap<string, P15ElementorSemanticResolutionEntryV1>,
): P15NeutralExportNode {
  if (node.kind === 'container') return cloneContainer(node, resolutions);
  if (node.kind !== 'text') return { ...node };

  const entry = resolutions.get(node.sourceNodeId);
  if (!entry) return { ...node };
  return entry.targetKind === 'heading'
    ? headingFromText(node, entry)
    : buttonFromText(node, entry);
}

function cloneDocument(
  source: P15NeutralExportDocumentV1,
  resolutions: ReadonlyMap<string, P15ElementorSemanticResolutionEntryV1>,
): P15NeutralExportDocumentV1 {
  return {
    schemaVersion: 1,
    irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
    title: source.title,
    documentType: source.documentType,
    nodes: source.nodes.map((node) => cloneNodeWithSemantics(node, resolutions)),
  };
}

function baseResult(
  status: P15ElementorSemanticResolutionStatus,
  sourceIrFingerprint: string | null,
  eligibleTextCount: number,
  resolvedSemanticCount: number,
  remainingTextCount: number,
  remainingReviewCount: number,
  resolvedSemantics: P15ElementorSemanticResolutionSummaryEntryV1[],
  issues: P15ElementorSemanticResolutionIssueV1[],
  document: P15NeutralExportDocumentV1 | null,
): P15ElementorSemanticResolutionResultV1 {
  return {
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_SEMANTIC_RESOLUTION_RESULT_VERSION,
    status,
    sourceIrFingerprint,
    eligibleTextCount,
    resolvedSemanticCount,
    remainingTextCount,
    remainingReviewCount,
    resolvedSemantics: resolvedSemantics.map((entry) => ({ ...entry })),
    issues: issues.map((issue) => ({ ...issue })),
    document,
    semanticInferencePerformed: false,
    figmaMutation: false,
    networkAccess: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    downloadEnabled: false,
    internalReviewRequired: true,
  };
}

/**
 * Apply only explicit source-bound semantic decisions to already-extracted neutral text nodes.
 *
 * No semantic inference is performed. Layer names, typography, font size, component names and visual
 * appearance are never consulted by this contract.
 */
export function resolveP15ElementorTextSemantics(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorSemanticResolutionResultV1 {
  const validation = validateP15NeutralExportDocument(sourceValue);
  if (!validation.valid) {
    return baseResult(
      'BLOCKED_INVALID_SOURCE_IR',
      null,
      0,
      0,
      0,
      0,
      [],
      validation.issues.map((issue) => ({
        code: 'P15_SEMANTIC_SOURCE_IR_INVALID' as const,
        path: issue.path,
        message: issue.message,
      })),
      null,
    );
  }

  const source = sourceValue as P15NeutralExportDocumentV1;
  const sourceIrFingerprint = fingerprintP15NeutralExportDocument(source);
  const textNodes = new Map<string, P15NeutralTextNode>();
  collectTextNodes(source.nodes, textNodes);
  const issues: P15ElementorSemanticResolutionIssueV1[] = [];
  const resolutions = new Map<string, P15ElementorSemanticResolutionEntryV1>();

  if (!isRecord(manifestValue)) {
    issues.push({
      code: 'P15_SEMANTIC_MANIFEST_NOT_OBJECT',
      path: '$manifest',
      message: 'Semantic resolution manifest must be an object.',
    });
  } else {
    if (!exactKeys(manifestValue, MANIFEST_KEYS)) {
      issues.push({
        code: 'P15_SEMANTIC_MANIFEST_FIELDS_INVALID',
        path: '$manifest',
        message: 'Semantic resolution manifest contains unknown or missing fields.',
      });
    }
    if (manifestValue.schemaVersion !== 1
      || manifestValue.manifestVersion !== P15_ELEMENTOR_SEMANTIC_RESOLUTION_MANIFEST_VERSION) {
      issues.push({
        code: 'P15_SEMANTIC_MANIFEST_VERSION_INVALID',
        path: '$manifest.manifestVersion',
        message: 'Semantic resolution manifest schema/version is unsupported.',
      });
    }
    if (!validFingerprint(manifestValue.sourceIrFingerprint)) {
      issues.push({
        code: 'P15_SEMANTIC_SOURCE_FINGERPRINT_INVALID',
        path: '$manifest.sourceIrFingerprint',
        message: 'sourceIrFingerprint must be a SHA-256 fingerprint.',
      });
    } else if (manifestValue.sourceIrFingerprint !== sourceIrFingerprint) {
      issues.push({
        code: 'P15_SEMANTIC_SOURCE_FINGERPRINT_MISMATCH',
        path: '$manifest.sourceIrFingerprint',
        message: 'Manifest is not bound to the exact current neutral IR.',
      });
    }
    if (manifestValue.semanticInferencePerformed !== false
      || manifestValue.figmaMutation !== false
      || manifestValue.networkAccess !== false
      || manifestValue.targetCompatibilityClaim !== false
      || manifestValue.productionAcceptance !== false
      || manifestValue.downloadEnabled !== false) {
      issues.push({
        code: 'P15_SEMANTIC_AUTHORITY_FLAGS_INVALID',
        path: '$manifest',
        message: 'Semantic resolution cannot grant inference/mutation/network/compatibility/production/download authority.',
      });
    }

    if (!Array.isArray(manifestValue.semantics)
      || manifestValue.semantics.length > P15_ELEMENTOR_SEMANTIC_RESOLUTION_MAX_ENTRIES) {
      issues.push({
        code: 'P15_SEMANTIC_ENTRIES_INVALID',
        path: '$manifest.semantics',
        message: `semantics must be an array of at most ${P15_ELEMENTOR_SEMANTIC_RESOLUTION_MAX_ENTRIES} entries.`,
      });
    } else {
      for (let index = 0; index < manifestValue.semantics.length; index += 1) {
        const raw = manifestValue.semantics[index];
        const path = `$manifest.semantics[${index}]`;
        if (!isRecord(raw)
          || !validSourceNodeId(raw.sourceNodeId)
          || (raw.targetKind !== 'heading' && raw.targetKind !== 'button')) {
          issues.push({
            code: 'P15_SEMANTIC_ENTRY_INVALID',
            path,
            message: 'Each semantic entry requires a bounded sourceNodeId and heading/button targetKind.',
          });
          continue;
        }

        const sourceNodeId = raw.sourceNodeId;
        if (resolutions.has(sourceNodeId)) {
          issues.push({
            code: 'P15_SEMANTIC_DUPLICATE_SOURCE_ID',
            path: `${path}.sourceNodeId`,
            message: 'Semantic sourceNodeId must be unique.',
          });
          continue;
        }

        const sourceNode = textNodes.get(sourceNodeId);
        if (!sourceNode) {
          issues.push({
            code: 'P15_SEMANTIC_SOURCE_NOT_TEXT',
            path: `${path}.sourceNodeId`,
            message: 'Semantic sourceNodeId must identify an existing neutral text node.',
          });
          continue;
        }
        if (sourceNode.align === 'justify') {
          issues.push({
            code: 'P15_SEMANTIC_JUSTIFY_ALIGNMENT_UNSUPPORTED',
            path: `${path}.sourceNodeId`,
            message: 'Justified text cannot be promoted to heading/button because those neutral nodes do not support justify alignment.',
          });
          continue;
        }

        if (raw.targetKind === 'heading') {
          if (!exactKeys(raw, HEADING_KEYS)) {
            issues.push({
              code: 'P15_SEMANTIC_ENTRY_INVALID',
              path,
              message: 'Heading semantic entry must contain exactly sourceNodeId, targetKind and level.',
            });
            continue;
          }
          if (!validHeadingLevel(raw.level)) {
            issues.push({
              code: 'P15_SEMANTIC_HEADING_LEVEL_INVALID',
              path: `${path}.level`,
              message: 'Heading level is unsupported.',
            });
            continue;
          }
          resolutions.set(sourceNodeId, {
            sourceNodeId,
            targetKind: 'heading',
            level: raw.level,
          });
          continue;
        }

        if (!onlyAllowedKeys(raw, BUTTON_KEYS)) {
          issues.push({
            code: 'P15_SEMANTIC_ENTRY_INVALID',
            path,
            message: 'Button semantic entry contains unsupported fields.',
          });
          continue;
        }
        if (raw.url !== undefined && !validButtonUrl(raw.url)) {
          issues.push({
            code: 'P15_SEMANTIC_BUTTON_URL_INVALID',
            path: `${path}.url`,
            message: 'Button URL must be a bounded safe http(s), mailto, tel, root-relative or fragment URL.',
          });
          continue;
        }
        if ((raw.openInNewTab !== undefined && typeof raw.openInNewTab !== 'boolean')
          || (raw.nofollow !== undefined && typeof raw.nofollow !== 'boolean')) {
          issues.push({
            code: 'P15_SEMANTIC_BUTTON_BOOLEAN_INVALID',
            path,
            message: 'Button openInNewTab/nofollow must be boolean when present.',
          });
          continue;
        }

        resolutions.set(sourceNodeId, {
          sourceNodeId,
          targetKind: 'button',
          ...(raw.url !== undefined ? { url: raw.url } : {}),
          ...(raw.openInNewTab !== undefined ? { openInNewTab: raw.openInNewTab } : {}),
          ...(raw.nofollow !== undefined ? { nofollow: raw.nofollow } : {}),
        });
      }
    }
  }

  if (issues.length > 0) {
    return baseResult(
      'REJECTED_INVALID_MANIFEST',
      sourceIrFingerprint,
      textNodes.size,
      0,
      textNodes.size,
      validation.reviewNodeCount,
      [],
      issues,
      null,
    );
  }

  if (resolutions.size === 0) {
    return baseResult(
      'NO_SEMANTIC_RESOLUTIONS',
      sourceIrFingerprint,
      textNodes.size,
      0,
      textNodes.size,
      validation.reviewNodeCount,
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
      textNodes.size,
      0,
      textNodes.size,
      validation.reviewNodeCount,
      [],
      resolvedValidation.issues.map((issue) => ({
        code: 'P15_SEMANTIC_RESOLVED_IR_INVALID' as const,
        path: issue.path,
        message: issue.message,
      })),
      null,
    );
  }

  const resolvedSemantics: P15ElementorSemanticResolutionSummaryEntryV1[] = [...resolutions.values()]
    .map((entry) => entry.targetKind === 'heading'
      ? {
          sourceNodeId: entry.sourceNodeId,
          targetKind: 'heading' as const,
          level: entry.level,
        }
      : {
          sourceNodeId: entry.sourceNodeId,
          targetKind: 'button' as const,
          urlPresent: entry.url !== undefined,
          urlFingerprint: entry.url === undefined ? null : `sha256:${sha256Hex(entry.url)}`,
          openInNewTab: entry.openInNewTab ?? false,
          nofollow: entry.nofollow ?? false,
        })
    .sort((left, right) => left.sourceNodeId.localeCompare(right.sourceNodeId));

  return baseResult(
    'SEMANTICS_RESOLVED',
    sourceIrFingerprint,
    textNodes.size,
    resolutions.size,
    countTextNodes(document.nodes),
    countReviewNodes(document.nodes),
    resolvedSemantics,
    [],
    document,
  );
}

function validSummaryEntry(entry: P15ElementorSemanticResolutionSummaryEntryV1): boolean {
  if (!validSourceNodeId(entry.sourceNodeId)) return false;
  if (entry.targetKind === 'heading') return validHeadingLevel(entry.level);
  return typeof entry.urlPresent === 'boolean'
    && entry.urlPresent === (entry.urlFingerprint !== null)
    && (entry.urlFingerprint === null || validFingerprint(entry.urlFingerprint))
    && typeof entry.openInNewTab === 'boolean'
    && typeof entry.nofollow === 'boolean';
}

/** Serialize only sanitized semantic metadata; source text, raw URLs and transformed IR are omitted. */
export function serializeP15ElementorSemanticResolutionSummary(
  result: P15ElementorSemanticResolutionResultV1,
): string {
  const validStatus = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    || result.status === 'REJECTED_INVALID_MANIFEST'
    || result.status === 'NO_SEMANTIC_RESOLUTIONS'
    || result.status === 'SEMANTICS_RESOLVED';
  const validCounts = [result.eligibleTextCount, result.resolvedSemanticCount, result.remainingTextCount, result.remainingReviewCount]
    .every((value) => Number.isSafeInteger(value) && value >= 0)
    && result.resolvedSemanticCount <= result.eligibleTextCount
    && result.remainingTextCount <= result.eligibleTextCount;
  const validSourceFingerprint = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    ? result.sourceIrFingerprint === null
    : validFingerprint(result.sourceIrFingerprint);

  if (!validStatus
    || !validCounts
    || !validSourceFingerprint
    || !result.resolvedSemantics.every(validSummaryEntry)
    || result.semanticInferencePerformed !== false
    || result.figmaMutation !== false
    || result.networkAccess !== false
    || result.targetCompatibilityClaim !== false
    || result.productionAcceptance !== false
    || result.downloadEnabled !== false
    || result.internalReviewRequired !== true) {
    throw new Error('Invalid or authority-inflated P15 semantic-resolution result.');
  }

  return `${JSON.stringify({
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_SEMANTIC_RESOLUTION_RESULT_VERSION,
    status: result.status,
    sourceIrFingerprint: result.sourceIrFingerprint,
    eligibleTextCount: result.eligibleTextCount,
    resolvedSemanticCount: result.resolvedSemanticCount,
    remainingTextCount: result.remainingTextCount,
    remainingReviewCount: result.remainingReviewCount,
    resolvedSemantics: result.resolvedSemantics.map((entry) => ({ ...entry })),
    issues: result.issues.map((issue) => ({ code: issue.code, path: issue.path })),
    semanticInferencePerformed: false,
    figmaMutation: false,
    networkAccess: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    downloadEnabled: false,
    internalReviewRequired: true,
  }, null, 2)}\n`;
}
