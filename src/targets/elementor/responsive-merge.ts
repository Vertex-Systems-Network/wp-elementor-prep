import type { P15BreakpointMatchV1 } from '../../core/breakpoint-matcher';
import { buildElementorTemplateCandidateIdentity } from './import-validation-contract';
import type { P15NeutralContainerNode, P15NeutralExportDocumentV1, P15NeutralExportNode } from './neutral-export-ir';
import { fingerprintP15NeutralExportDocument } from './neutral-export-ir-identity';
import { composeP15ElementorPage, P15_PAGE_COMPOSITION_VERSION, type P15PageCompositionResultV1 } from './page-composition';
import { P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_MANIFEST_VERSION } from './responsive-alignment-resolution';
import { P15_ELEMENTOR_RESPONSIVE_DIRECTION_MANIFEST_VERSION } from './responsive-direction-resolution';
import { P15_ELEMENTOR_RESPONSIVE_GAP_MANIFEST_VERSION } from './responsive-gap-resolution';
import { P15_ELEMENTOR_RESPONSIVE_MARGIN_MANIFEST_VERSION } from './responsive-margin-resolution';
import { P15_ELEMENTOR_RESPONSIVE_PADDING_MANIFEST_VERSION } from './responsive-padding-resolution';
import { generateElementorV3TemplateCandidate } from './v3-template-generator';

/**
 * Responsive merge, container layout (recovery M4.3a). Desktop is the base; every matched tablet/mobile container
 * whose layout differs contributes explicit per-breakpoint values, and the M1 engine writes them as `_tablet` /
 * `_mobile` keys through one page composition (direction, alignment, gap, padding, margin families). Values are
 * taken from the matched variant IR, never inferred.
 *
 * What this step does not merge yet is an explicit review, never a silent drop: unmatched and ambiguous nodes
 * (presence → M4.3b), a changed child order (M4.3b), wrap and grid layout changes, an unset variant value whose
 * Elementor default would differ (padding, alignment), and any other differing container or widget property (M4.3c).
 */
export const P15_RESPONSIVE_MERGE_VERSION = 'p15-elementor-responsive-merge-v1' as const;

type VariantDevice = 'tablet' | 'mobile';

export interface P15ResponsiveVariantInput {
  device: VariantDevice;
  document: P15NeutralExportDocumentV1;
  match: P15BreakpointMatchV1;
}

export interface P15ResponsiveMergeReview {
  device: VariantDevice;
  sourceNodeId: string;
  reasonCode: string;
  detail: string;
}

export interface P15ResponsiveMergeResultV1 {
  version: typeof P15_RESPONSIVE_MERGE_VERSION;
  /** MERGED: every difference is written. REVIEW: written, with explicit review items. BLOCKED: nothing written. */
  status: 'MERGED' | 'REVIEW' | 'BLOCKED';
  composition: P15PageCompositionResultV1 | null;
  /** Per family: the containers with responsive values (sorted by source node id). */
  entries: Record<string, Array<Record<string, unknown>>>;
  reviews: P15ResponsiveMergeReview[];
  blockReason: string | null;
}

const FLAGS = { responsiveInferencePerformed: false, figmaMutation: false, networkAccess: false, responsiveClosureClaim: false,
  targetCompatibilityClaim: false, productionAcceptance: false, downloadEnabled: false } as const;
/** Container keys this step handles (or that carry no layout value). */
const HANDLED_KEYS = new Set(['kind', 'sourceNodeId', 'children', 'styleReviews', 'direction', 'alignItems', 'justifyContent', 'gapPx', 'paddingPx', 'marginPx', 'wrap', 'grid']);
const ZERO_BOX = { top: 0, right: 0, bottom: 0, left: 0 };

const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

function index(nodes: readonly P15NeutralExportNode[], out = new Map<string, P15NeutralExportNode>()): Map<string, P15NeutralExportNode> {
  for (const node of nodes) {
    out.set(node.sourceNodeId, node);
    if (node.kind === 'container') index(node.children, out);
  }
  return out;
}

function blocked(blockReason: string): P15ResponsiveMergeResultV1 {
  return { version: P15_RESPONSIVE_MERGE_VERSION, status: 'BLOCKED', composition: null, entries: {}, reviews: [], blockReason };
}

export function buildP15ResponsiveMerge(desktop: P15NeutralExportDocumentV1, variants: readonly P15ResponsiveVariantInput[]): P15ResponsiveMergeResultV1 {
  if (variants.length === 0 || new Set(variants.map((variant) => variant.device)).size !== variants.length) {
    return blocked('One tablet and/or one mobile variant is required, each device at most once.');
  }
  const generation = generateElementorV3TemplateCandidate(desktop);
  if (generation.status !== 'GENERATED_LOCAL_CANDIDATE' || !generation.candidate) {
    return blocked(`The desktop base must generate as a review-free local candidate (got ${generation.status}).`);
  }
  const desktopNodes = index(desktop.nodes);
  const reviews: P15ResponsiveMergeReview[] = [];
  const entries = new Map<string, Map<string, Record<string, unknown>>>();
  const put = (family: string, sourceNodeId: string, fields: Record<string, unknown>): void => {
    const byNode = entries.get(family) ?? new Map<string, Record<string, unknown>>();
    byNode.set(sourceNodeId, { ...(byNode.get(sourceNodeId) ?? { sourceNodeId }), ...fields });
    entries.set(family, byNode);
  };

  for (const { device, document, match } of variants) {
    const review = (sourceNodeId: string, reasonCode: string, detail: string): void => { reviews.push({ device, sourceNodeId, reasonCode, detail }); };
    const variantNodes = index(document.nodes);
    const counterpart = new Map(match.matches.map((entry) => [entry.desktopId, entry.variantId]));
    for (const id of match.unmatchedDesktop) review(id, 'RESPONSIVE_NODE_ONLY_ON_DESKTOP', `Not present on ${device}; presence (hide) is merged by M4.3b.`);
    for (const id of match.unmatchedVariant) review(id, 'RESPONSIVE_NODE_ONLY_ON_VARIANT', `Present only on ${device}; presence (hide) is merged by M4.3b.`);
    for (const entry of match.ambiguous) review(entry.desktopId, 'RESPONSIVE_MATCH_AMBIGUOUS', entry.detail);

    for (const [desktopId, variantId] of counterpart) {
      const d = desktopNodes.get(desktopId);
      const v = variantNodes.get(variantId);
      if (!d || !v) continue; // Figma layers without an IR node (merged into a parent, e.g. text runs).
      if (d.kind !== v.kind) {
        review(desktopId, 'RESPONSIVE_KIND_DIFFERS', `${d.kind} on desktop, ${v.kind} on ${device}.`);
        continue;
      }
      if (d.kind !== 'container' || v.kind !== 'container') {
        const differing = Object.keys({ ...d, ...v }).filter((key) => key !== 'sourceNodeId' && !same((d as unknown as Record<string, unknown>)[key], (v as unknown as Record<string, unknown>)[key]));
        if (differing.length > 0) review(desktopId, 'RESPONSIVE_WIDGET_PROPERTY_NOT_MERGED', `${differing.sort().join(', ')} differ on ${device} (M4.3c).`);
        continue;
      }
      mergeContainer(d, v, device, counterpart, put, review);
    }
  }

  const families: Record<string, Array<Record<string, unknown>>> = {};
  for (const [family, byNode] of [...entries].sort(([a], [b]) => (a < b ? -1 : 1))) {
    families[family] = [...byNode.values()].sort((a, b) => (String(a.sourceNodeId) < String(b.sourceNodeId) ? -1 : 1));
  }
  reviews.sort((a, b) => (a.device + a.sourceNodeId + a.reasonCode < b.device + b.sourceNodeId + b.reasonCode ? -1 : 1));
  const common = { schemaVersion: 1, sourceIrFingerprint: fingerprintP15NeutralExportDocument(desktop),
    baseCandidateIdentityDigest: buildElementorTemplateCandidateIdentity(generation.candidate).digest, ...FLAGS };
  const versions: Record<string, string> = {
    direction: P15_ELEMENTOR_RESPONSIVE_DIRECTION_MANIFEST_VERSION, alignment: P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_MANIFEST_VERSION,
    gap: P15_ELEMENTOR_RESPONSIVE_GAP_MANIFEST_VERSION, padding: P15_ELEMENTOR_RESPONSIVE_PADDING_MANIFEST_VERSION,
    margin: P15_ELEMENTOR_RESPONSIVE_MARGIN_MANIFEST_VERSION,
  };
  const manifests = Object.fromEntries(Object.entries(families).map(([family, containers]) => [family, { ...common, manifestVersion: versions[family], containers }]));
  const composition = composeP15ElementorPage(desktop, { ...common, compositionVersion: P15_PAGE_COMPOSITION_VERSION, families: manifests });
  if (composition.status !== 'RESOLVED') {
    return { ...blocked(`The page composition refused the responsive values: ${composition.issues.map((issue) => issue.code).join(', ') || composition.status}.`), entries: families, reviews };
  }
  return { version: P15_RESPONSIVE_MERGE_VERSION, status: reviews.length === 0 ? 'MERGED' : 'REVIEW', composition, entries: families, reviews, blockReason: null };
}

function mergeContainer(
  d: P15NeutralContainerNode,
  v: P15NeutralContainerNode,
  device: VariantDevice,
  counterpart: ReadonlyMap<string, string>,
  put: (family: string, sourceNodeId: string, fields: Record<string, unknown>) => void,
  review: (sourceNodeId: string, reasonCode: string, detail: string) => void,
): void {
  const id = d.sourceNodeId;
  // Child order: the matched children must keep their relative order (order changes are merged by M4.3b).
  const variantOrder = v.children.map((child) => child.sourceNodeId);
  const mappedOrder = d.children.map((child) => counterpart.get(child.sourceNodeId)).filter((value): value is string => value !== undefined)
    .map((variantId) => variantOrder.indexOf(variantId)).filter((position) => position >= 0);
  if (mappedOrder.some((position, i) => i > 0 && position < mappedOrder[i - 1]!)) {
    review(id, 'RESPONSIVE_ORDER_CHANGED', `Children are reordered on ${device}; order is merged by M4.3b.`);
  }
  if (d.grid !== undefined || v.grid !== undefined) {
    if (!same(d.grid, v.grid) || d.direction !== v.direction) review(id, 'RESPONSIVE_GRID_DIFFERS', `Grid layout differs on ${device}.`);
  } else {
    if (d.direction !== v.direction) put('direction', id, { [`${device}Direction`]: v.direction });
    for (const [field, key] of [['alignItems', 'AlignItems'], ['justifyContent', 'JustifyContent']] as const) {
      if (same(d[field], v[field])) continue;
      if (v[field] === undefined) review(id, 'RESPONSIVE_VALUE_UNSET_ON_VARIANT', `${field} is unset on ${device}.`);
      else put('alignment', id, { [`${device}${key}`]: v[field] });
    }
    if (d.wrap !== undefined || v.wrap !== undefined) {
      if (!same(d.wrap, v.wrap) || !same(d.gapPx, v.gapPx)) review(id, 'RESPONSIVE_WRAP_DIFFERS', `Wrap or wrapped gaps differ on ${device}.`);
    } else if (!same(d.gapPx, v.gapPx)) {
      if (v.gapPx === undefined) review(id, 'RESPONSIVE_VALUE_UNSET_ON_VARIANT', `gapPx is unset on ${device}.`);
      else put('gap', id, { [`${device}GapPx`]: v.gapPx });
    }
  }
  if (!same(d.paddingPx, v.paddingPx)) {
    // Elementor 4.2.4 `_container.scss` (blob d6c65cb): `--padding-*: var(--container-default-padding-*, 10px)`, so an
    // unset variant padding is not zero and cannot be written as a value.
    if (v.paddingPx === undefined) review(id, 'RESPONSIVE_VALUE_UNSET_ON_VARIANT', `paddingPx is unset on ${device}.`);
    else put('padding', id, { [`${device}PaddingPx`]: v.paddingPx });
  }
  // `_container.scss` (blob d6c65cb): `--margin-*: 0px`, so no margin is the zero box on either side.
  if (!same(d.marginPx ?? ZERO_BOX, v.marginPx ?? ZERO_BOX)) put('margin', id, { [`${device}MarginPx`]: v.marginPx ?? ZERO_BOX });
  const differing = Object.keys({ ...d, ...v }).filter((key) => !HANDLED_KEYS.has(key)
    && !same((d as unknown as Record<string, unknown>)[key], (v as unknown as Record<string, unknown>)[key]));
  if (differing.length > 0) review(id, 'RESPONSIVE_PROPERTY_NOT_MERGED', `${differing.sort().join(', ')} differ on ${device} (M4.3c).`);
}
