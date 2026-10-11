import type { P15Device } from './breakpoint-set';

/**
 * Deterministic cross-breakpoint node matcher (recovery M4.2). Pure and network-free.
 *
 * Top-down per section: the desktop root is paired with each variant root (tablet, mobile); then, for every matched
 * pair, their visible children are scored pairwise and matched greedily, and matching recurses into each matched
 * pair. A node is only ever compared with nodes under its counterpart parent, so nothing is matched across sections.
 *
 * Score (0–1) of a candidate pair of the same node type — every term is explainable:
 * - name    0.30: equal normalised layer name;
 * - content 0.30: TEXT → equal normalised characters; image fill → equal image hash; container → the share of
 *   child names both sides have; other leaves → equal size class (both wide, both narrow);
 * - order   0.20: 1 − |normalised sibling index difference|;
 * - geometry 0.20: 1 − distance between the normalised centres inside the parent (clamped).
 * Different node types are never candidates (a FRAME/GROUP/COMPONENT/INSTANCE pair counts as one container type).
 *
 * The matcher never guesses. A pair is accepted only at or above `minScore`, and only when no other still-free
 * candidate of either node scores within `ambiguityMargin` of it; such ties are reported as ambiguous and both nodes
 * stay unmatched (M4.4 turns unmatched nodes into REVIEW). Ties in ordering are broken by sibling index, then id.
 */
export const P15_BREAKPOINT_MATCH_VERSION = 'p15-breakpoint-match-v1' as const;

export interface P15MatchNode {
  id: string;
  name: string;
  type: string;
  visible?: boolean;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  characters?: string;
  fills?: readonly unknown[] | unknown;
  children?: readonly P15MatchNode[];
}

export interface P15NodeMatch {
  desktopId: string;
  variantId: string;
  confidence: number;
}

export interface P15AmbiguousMatch {
  desktopId: string;
  variantIds: string[];
  detail: string;
}

export interface P15BreakpointMatchV1 {
  version: typeof P15_BREAKPOINT_MATCH_VERSION;
  device: Exclude<P15Device, 'desktop'>;
  matches: P15NodeMatch[];
  unmatchedDesktop: string[];
  unmatchedVariant: string[];
  ambiguous: P15AmbiguousMatch[];
}

export interface P15MatcherOptions {
  minScore?: number;
  ambiguityMargin?: number;
}

const WEIGHTS = { name: 0.3, content: 0.3, order: 0.2, geometry: 0.2 } as const;
const CONTAINER_TYPES = new Set(['FRAME', 'GROUP', 'COMPONENT', 'INSTANCE']);
const round = (value: number): number => Math.round(value * 1000) / 1000;

const visibleChildren = (node: P15MatchNode): P15MatchNode[] => (node.children ?? []).filter((child) => child.visible !== false);
const normName = (value: string): string => value.trim().replace(/\s+/g, ' ').toLowerCase();
const typeClass = (type: string): string => (CONTAINER_TYPES.has(type) ? 'CONTAINER' : type);

function imageHash(node: P15MatchNode): string | null {
  if (!Array.isArray(node.fills)) return null;
  for (const fill of node.fills as Array<Record<string, unknown>>) {
    if (fill?.type === 'IMAGE' && fill.visible !== false && typeof fill.imageHash === 'string') return fill.imageHash;
  }
  return null;
}

function contentScore(a: P15MatchNode, b: P15MatchNode, aParent: P15MatchNode, bParent: P15MatchNode): number {
  if (a.type === 'TEXT') return normName(a.characters ?? '') === normName(b.characters ?? '') ? 1 : 0;
  const hashA = imageHash(a);
  const hashB = imageHash(b);
  if (hashA !== null || hashB !== null) return hashA === hashB ? 1 : 0;
  if (typeClass(a.type) === 'CONTAINER') {
    const namesA = new Set(visibleChildren(a).map((child) => normName(child.name)));
    const namesB = new Set(visibleChildren(b).map((child) => normName(child.name)));
    if (namesA.size === 0 && namesB.size === 0) return 1;
    let shared = 0;
    for (const name of namesA) if (namesB.has(name)) shared += 1;
    return shared / Math.max(namesA.size, namesB.size);
  }
  const wide = (node: P15MatchNode, parent: P15MatchNode): boolean => (node.width ?? 0) >= 0.5 * (parent.width ?? Number.POSITIVE_INFINITY);
  return wide(a, aParent) === wide(b, bParent) ? 1 : 0;
}

function centre(node: P15MatchNode, parent: P15MatchNode): [number, number] | null {
  const { x, y, width, height } = node;
  if ([x, y, width, height, parent.width, parent.height].some((value) => typeof value !== 'number' || !Number.isFinite(value))) return null;
  if (parent.width! <= 0 || parent.height! <= 0) return null;
  return [(x! + width! / 2) / parent.width!, (y! + height! / 2) / parent.height!];
}

function orderPosition(index: number, count: number): number {
  return count <= 1 ? 0 : index / (count - 1);
}

interface Candidate {
  d: number;
  v: number;
  score: number;
}

export function scoreP15Pair(
  a: P15MatchNode, aIndex: number, aCount: number, aParent: P15MatchNode,
  b: P15MatchNode, bIndex: number, bCount: number, bParent: P15MatchNode,
): number | null {
  if (typeClass(a.type) !== typeClass(b.type)) return null;
  const name = normName(a.name) === normName(b.name) ? 1 : 0;
  const content = contentScore(a, b, aParent, bParent);
  const order = 1 - Math.abs(orderPosition(aIndex, aCount) - orderPosition(bIndex, bCount));
  const ca = centre(a, aParent);
  const cb = centre(b, bParent);
  const geometry = ca && cb ? Math.max(0, 1 - Math.hypot(ca[0] - cb[0], ca[1] - cb[1])) : 0;
  return round(WEIGHTS.name * name + WEIGHTS.content * content + WEIGHTS.order * order + WEIGHTS.geometry * geometry);
}

export function matchP15Breakpoint(
  desktop: P15MatchNode,
  variant: P15MatchNode,
  device: Exclude<P15Device, 'desktop'>,
  options: P15MatcherOptions = {},
): P15BreakpointMatchV1 {
  const minScore = options.minScore ?? 0.6;
  const margin = options.ambiguityMargin ?? 0.05;
  const result: P15BreakpointMatchV1 = { version: P15_BREAKPOINT_MATCH_VERSION, device, matches: [], unmatchedDesktop: [], unmatchedVariant: [], ambiguous: [] };
  const unmatchedSubtree = (node: P15MatchNode, out: string[]): void => {
    out.push(node.id);
    for (const child of visibleChildren(node)) unmatchedSubtree(child, out);
  };

  const visit = (d: P15MatchNode, v: P15MatchNode): void => {
    const dc = visibleChildren(d);
    const vc = visibleChildren(v);
    const candidates: Candidate[] = [];
    dc.forEach((a, di) => vc.forEach((b, vi) => {
      const score = scoreP15Pair(a, di, dc.length, d, b, vi, vc.length, v);
      if (score !== null && score >= minScore) candidates.push({ d: di, v: vi, score });
    }));
    candidates.sort((x, y) => y.score - x.score || x.d - y.d || x.v - y.v);
    const usedD = new Set<number>();
    const usedV = new Set<number>();
    const blockedD = new Set<number>();
    const blockedV = new Set<number>();
    for (const candidate of candidates) {
      if (usedD.has(candidate.d) || usedV.has(candidate.v) || blockedD.has(candidate.d) || blockedV.has(candidate.v)) continue;
      const rivals = candidates.filter((other) => other !== candidate && other.score >= candidate.score - margin
        && !usedD.has(other.d) && !usedV.has(other.v)
        && (other.d === candidate.d || other.v === candidate.v));
      if (rivals.length > 0) {
        blockedD.add(candidate.d);
        blockedV.add(candidate.v);
        for (const rival of rivals) {
          blockedD.add(rival.d);
          blockedV.add(rival.v);
        }
        const variantIds = [...new Set([candidate, ...rivals].map((entry) => vc[entry.v]!.id))].sort();
        result.ambiguous.push({ desktopId: dc[candidate.d]!.id, variantIds,
          detail: `Candidates score within ${margin} of each other (${[candidate, ...rivals].map((entry) => entry.score).join(', ')}); not matched.` });
        continue;
      }
      usedD.add(candidate.d);
      usedV.add(candidate.v);
      result.matches.push({ desktopId: dc[candidate.d]!.id, variantId: vc[candidate.v]!.id, confidence: candidate.score });
      visit(dc[candidate.d]!, vc[candidate.v]!);
    }
    dc.forEach((a, di) => { if (!usedD.has(di)) unmatchedSubtree(a, result.unmatchedDesktop); });
    vc.forEach((b, vi) => { if (!usedV.has(vi)) unmatchedSubtree(b, result.unmatchedVariant); });
  };

  // The roots are the user's confirmed breakpoint frames: matched by definition (M4.1), with full confidence.
  result.matches.push({ desktopId: desktop.id, variantId: variant.id, confidence: 1 });
  visit(desktop, variant);
  result.matches.sort((a, b) => (a.desktopId < b.desktopId ? -1 : a.desktopId > b.desktopId ? 1 : 0));
  result.unmatchedDesktop.sort();
  result.unmatchedVariant.sort();
  result.ambiguous.sort((a, b) => (a.desktopId < b.desktopId ? -1 : a.desktopId > b.desktopId ? 1 : 0));
  return result;
}
