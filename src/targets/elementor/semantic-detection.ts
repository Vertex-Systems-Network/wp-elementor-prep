import type {
  P15NeutralExportDocumentV1,
  P15NeutralExportNode,
  P15NeutralHeadingLevel,
  P15NeutralTextNode,
} from './neutral-export-ir';

/**
 * Deterministic semantic detection on the neutral IR (recovery M2.2), applied by the Figma extractor.
 *
 * Headings (M2.2a) are detected by relative size and weight rank, never by copy. The body size is the
 * font size covering the most characters in the document. A uniform, single-paragraph, non-justified text
 * becomes a heading when it is at least {@link HEADING_SIZE_RATIO} times the body size, or at least
 * {@link HEADING_BOLD_SIZE_RATIO} times and weight 600 or more. Levels follow the distinct heading sizes from
 * largest (h1) down, capped at h6. A layer name `h1`..`h6` is a secondary hint that sets the level of a
 * detected heading. A layer named as a heading that the size rule does not support is a contradiction:
 * it stays a text and gets an explicit review, never a guess.
 */
export const HEADING_SIZE_RATIO = 1.25;
export const HEADING_BOLD_SIZE_RATIO = 1.1;
export const HEADING_MAX_LENGTH = 160;

const LEVELS: readonly P15NeutralHeadingLevel[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

function collectTexts(nodes: readonly P15NeutralExportNode[], out: P15NeutralTextNode[]): P15NeutralTextNode[] {
  for (const node of nodes) {
    if (node.kind === 'text') out.push(node);
    else if (node.kind === 'container') collectTexts(node.children, out);
  }
  return out;
}

/** The font size covering the most characters (ties: the smaller size), or null without typography. */
export function bodyFontSize(document: P15NeutralExportDocumentV1): number | null {
  const weights = new Map<number, number>();
  for (const text of collectTexts(document.nodes, [])) {
    const size = text.typography?.fontSizePx;
    if (size === undefined) continue;
    weights.set(size, (weights.get(size) ?? 0) + text.text.length);
  }
  let body: number | null = null;
  let best = -1;
  for (const [size, weight] of weights) {
    if (weight > best || (weight === best && body !== null && size < body)) { body = size; best = weight; }
  }
  return body;
}

function nameLevel(name: string | undefined): P15NeutralHeadingLevel | null {
  const match = /^\s*h([1-6])\b/i.exec(name ?? '');
  return match ? (`h${match[1]}` as P15NeutralHeadingLevel) : null;
}
const namedAsHeading = (name: string | undefined): boolean => nameLevel(name) !== null || /\b(heading|title|headline)\b/i.test(name ?? '');

function headingEligible(text: P15NeutralTextNode, body: number): boolean {
  const size = text.typography?.fontSizePx;
  if (size === undefined || text.paragraphs !== undefined || text.styleReviews !== undefined
    || text.align === 'justify' || text.text.length > HEADING_MAX_LENGTH || /[\r\n]/.test(text.text)) return false;
  const bold = Number(text.typography?.fontWeight ?? '400') >= 600;
  return size >= body * HEADING_SIZE_RATIO || (bold && size >= body * HEADING_BOLD_SIZE_RATIO);
}

/** Promote detected headings in place of their text nodes; `names` maps source ids to Figma layer names. */
export function detectP15Headings(document: P15NeutralExportDocumentV1, names: ReadonlyMap<string, string>): P15NeutralExportDocumentV1 {
  const body = bodyFontSize(document);
  if (body === null) return document;
  const texts = collectTexts(document.nodes, []);
  const headings = new Set(texts.filter((text) => headingEligible(text, body)).map((text) => text.sourceNodeId));
  const sizes = [...new Set(texts.filter((text) => headings.has(text.sourceNodeId)).map((text) => text.typography!.fontSizePx!))].sort((a, b) => b - a);
  // With a single font size there is no rank to contradict, so a heading-like layer name is not flagged.
  const ranked = new Set(texts.map((text) => text.typography?.fontSizePx).filter((size) => size !== undefined)).size > 1;
  const rewrite = (nodes: readonly P15NeutralExportNode[]): P15NeutralExportNode[] => nodes.map((node) => {
    if (node.kind === 'container') return { ...node, children: rewrite(node.children) };
    if (node.kind !== 'text') return node;
    const name = names.get(node.sourceNodeId);
    if (!headings.has(node.sourceNodeId)) {
      if (!ranked || !namedAsHeading(name) || node.styleReviews !== undefined) return node;
      return { ...node, styleReviews: [{ reasonCode: 'HEADING_DETECTION_REQUIRES_REVIEW',
        detail: 'The layer is named as a heading, but its size and weight do not rank above the body text.' }] };
    }
    const level = nameLevel(name) ?? LEVELS[Math.min(sizes.indexOf(node.typography!.fontSizePx!), LEVELS.length - 1)]!;
    return {
      kind: 'heading',
      sourceNodeId: node.sourceNodeId,
      text: node.text,
      level,
      ...(node.align === undefined ? {} : { align: node.align as 'start' | 'center' | 'end' }),
      ...(node.typography === undefined ? {} : { typography: node.typography }),
      ...(node.href === undefined ? {} : { href: node.href }),
      ...(node.sizing === undefined ? {} : { sizing: node.sizing }),
    };
  });
  return { ...document, nodes: rewrite(document.nodes) };
}

/**
 * Buttons (M2.2b). A container whose layer name says button/btn/cta (the explicit hint), whose only child
 * is a uniform single-line text of at most {@link BUTTON_MAX_LENGTH} characters, with a solid background, some
 * padding and no style reviews, becomes a native button carrying that text, typography, background,
 * padding and radius. Without the hint the container and text stay as they are: they already render the
 * same visuals, so nothing is lost and badges or chips are never guessed into buttons. A button-named
 * container that does not match the shape gets an explicit review.
 */
export const BUTTON_MAX_LENGTH = 80;
const namedAsButton = (name: string | undefined): boolean => /\b(button|btn|cta)\b/i.test(name ?? '');

function buttonShape(container: Extract<P15NeutralExportNode, { kind: 'container' }>): P15NeutralTextNode | null {
  const [only] = container.children;
  if (container.children.length !== 1 || only?.kind !== 'text' || container.styleReviews !== undefined || only.styleReviews !== undefined
    || container.backgroundColorHex === undefined || container.paddingPx === undefined
    || Object.values(container.paddingPx).every((side) => side === 0)
    || only.paragraphs !== undefined || /[\r\n]/.test(only.text) || only.text.length > BUTTON_MAX_LENGTH) return null;
  return only;
}

export function detectP15Buttons(document: P15NeutralExportDocumentV1, names: ReadonlyMap<string, string>): P15NeutralExportDocumentV1 {
  let changed = false;
  const rewrite = (nodes: readonly P15NeutralExportNode[]): P15NeutralExportNode[] => nodes.map((node) => {
    if (node.kind !== 'container') return node;
    if (!namedAsButton(names.get(node.sourceNodeId))) return { ...node, children: rewrite(node.children) };
    const label = buttonShape(node);
    changed = true;
    if (!label) {
      return { ...node, children: rewrite(node.children), styleReviews: [...(node.styleReviews ?? []), { reasonCode: 'BUTTON_DETECTION_REQUIRES_REVIEW',
        detail: 'The layer is named as a button but is not one solid, padded frame around a single short line of text.' }] };
    }
    return {
      kind: 'button',
      sourceNodeId: node.sourceNodeId,
      text: label.text,
      ...(label.href === undefined ? {} : { url: label.href }),
      ...(label.typography === undefined ? {} : { typography: label.typography }),
      backgroundColorHex: node.backgroundColorHex!,
      paddingPx: node.paddingPx!,
      ...(node.cornerRadiusPx === undefined ? {} : { cornerRadiusPx: node.cornerRadiusPx }),
    };
  });
  const nodes = rewrite(document.nodes);
  return changed ? { ...document, nodes } : document;
}
