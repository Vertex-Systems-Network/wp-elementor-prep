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

export const P15_NEUTRAL_EXPORT_IR_IDENTITY_VERSION = 'p15-neutral-export-ir-identity-v1' as const;

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

/**
 * Serialize one valid target-neutral P15 document in a fixed key order.
 *
 * This is an identity primitive only. It does not authorize target generation, compatibility,
 * reference closure, production acceptance or transfer.
 */
export function serializeCanonicalP15NeutralExportDocument(value: unknown): string {
  const validation = validateP15NeutralExportDocument(value);
  if (!validation.valid) {
    const first = validation.issues[0];
    throw new Error(first
      ? `Invalid P15 neutral IR for canonical identity: ${first.code} at ${first.path}`
      : 'Invalid P15 neutral IR for canonical identity.');
  }

  const document = value as P15NeutralExportDocumentV1;
  return JSON.stringify({
    schemaVersion: 1,
    irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
    title: document.title,
    documentType: document.documentType,
    nodes: document.nodes.map(canonicalNode),
  });
}

export function fingerprintP15NeutralExportDocument(value: unknown): string {
  return `sha256:${sha256Hex(serializeCanonicalP15NeutralExportDocument(value))}`;
}
