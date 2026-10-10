import { sha256Hex } from '../../core/sha256';
import { canonicalButtonSizing, canonicalContainerSizing } from './container-sizing';
import { canonicalBorder, canonicalCornerRadii } from './container-visual-style';
import {
  P15_NEUTRAL_EXPORT_IR_VERSION,
  validateP15NeutralExportDocument,
  type P15NeutralButtonNode,
  type P15NeutralContainerNode,
  type P15NeutralExportDocumentV1,
  type P15NeutralExportNode,
  type P15NeutralHeadingNode,
  type P15NeutralImageNode,
  type P15NeutralParagraph,
  type P15NeutralReviewNode,
  type P15NeutralStyleReview,
  type P15NeutralTextNode,
  type P15NeutralTypography,
} from './neutral-export-ir';

export const P15_NEUTRAL_EXPORT_IR_IDENTITY_VERSION = 'p15-neutral-export-ir-identity-v1' as const;

/*
 * Every optional fact that changes generation must be part of the identity, or a manifest bound to one
 * document's fingerprint would also bind to a document that differs only in that fact. Optional facts are
 * added only when present, in a fixed key order, so documents without them keep their exact fingerprint.
 */
const TYPOGRAPHY_ORDER = ['fontFamily', 'fontWeight', 'fontStyle', 'fontSizePx', 'lineHeightPx', 'letterSpacingPx',
  'textTransform', 'textDecoration', 'colorHex'] as const;

function canonicalTypography(value: P15NeutralTypography): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of TYPOGRAPHY_ORDER) if (value[key] !== undefined) out[key] = value[key];
  return out;
}

function canonicalParagraphs(paragraphs: readonly P15NeutralParagraph[]): unknown[] {
  return paragraphs.map((paragraph) => ({
    spans: paragraph.spans.map((span) => ({ text: span.text, ...(span.style === undefined ? {} : { style: canonicalTypography(span.style) }),
      ...(span.href === undefined ? {} : { href: span.href }) })),
  }));
}

function canonicalStyleReviews(value: Record<string, unknown>, reviews: readonly P15NeutralStyleReview[] | undefined): void {
  if (reviews !== undefined) value.styleReviews = reviews.map((review) => ({ reasonCode: review.reasonCode, detail: review.detail }));
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
  if (node.cornerRadiiPx !== undefined) value.cornerRadiiPx = canonicalCornerRadii(node.cornerRadiiPx);
  if (node.border !== undefined) value.border = canonicalBorder(node.border);
  if (node.clipsContent !== undefined) value.clipsContent = node.clipsContent;
  if (node.sizing !== undefined) value.sizing = canonicalContainerSizing(node.sizing);
  canonicalStyleReviews(value, node.styleReviews);
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
  if (node.typography !== undefined) value.typography = canonicalTypography(node.typography);
  if (node.href !== undefined) value.href = node.href;
  if (node.sizing !== undefined) value.sizing = canonicalContainerSizing(node.sizing);
  return value;
}

function canonicalText(node: P15NeutralTextNode): Record<string, unknown> {
  const value: Record<string, unknown> = {
    kind: 'text',
    sourceNodeId: node.sourceNodeId,
    text: node.text,
  };
  if (node.align !== undefined) value.align = node.align;
  if (node.typography !== undefined) value.typography = canonicalTypography(node.typography);
  if (node.paragraphs !== undefined) value.paragraphs = canonicalParagraphs(node.paragraphs);
  if (node.paragraphSpacingPx !== undefined) value.paragraphSpacingPx = node.paragraphSpacingPx;
  if (node.href !== undefined) value.href = node.href;
  if (node.sizing !== undefined) value.sizing = canonicalContainerSizing(node.sizing);
  canonicalStyleReviews(value, node.styleReviews);
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
  if (node.typography !== undefined) value.typography = canonicalTypography(node.typography);
  if (node.backgroundColorHex !== undefined) value.backgroundColorHex = node.backgroundColorHex;
  if (node.paddingPx !== undefined) {
    value.paddingPx = { top: node.paddingPx.top, right: node.paddingPx.right, bottom: node.paddingPx.bottom, left: node.paddingPx.left };
  }
  if (node.cornerRadiusPx !== undefined) value.cornerRadiusPx = node.cornerRadiusPx;
  if (node.sizing !== undefined) value.sizing = canonicalButtonSizing(node.sizing);
  canonicalStyleReviews(value, node.styleReviews);
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
  if (node.kind === 'divider') {
    return { kind: 'divider', sourceNodeId: node.sourceNodeId, weightPx: node.weightPx, colorHex: node.colorHex,
      ...(node.widthPx === undefined ? {} : { widthPx: node.widthPx }), ...(node.align === undefined ? {} : { align: node.align }) };
  }
  if (node.kind === 'spacer') return { kind: 'spacer', sourceNodeId: node.sourceNodeId, heightPx: node.heightPx };
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
