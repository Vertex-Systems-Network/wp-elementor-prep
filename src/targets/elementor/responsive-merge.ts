import type { P15BreakpointMatchV1 } from '../../core/breakpoint-matcher';
import { buildElementorTemplateCandidateIdentity } from './import-validation-contract';
import type { P15NeutralContainerNode, P15NeutralExportDocumentV1, P15NeutralExportNode } from './neutral-export-ir';
import { fingerprintP15NeutralExportDocument } from './neutral-export-ir-identity';
import { composeP15ElementorPage, P15_PAGE_COMPOSITION_VERSION, type P15PageCompositionResultV1 } from './page-composition';
import { P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_MANIFEST_VERSION } from './responsive-alignment-resolution';
import { P15_ELEMENTOR_RESPONSIVE_DIRECTION_MANIFEST_VERSION } from './responsive-direction-resolution';
import { P15_ELEMENTOR_RESPONSIVE_ELEMENT_ORDER_MANIFEST_VERSION } from './responsive-element-order-resolution';
import { P15_ELEMENTOR_RESPONSIVE_GAP_MANIFEST_VERSION } from './responsive-gap-resolution';
import { P15_ELEMENTOR_RESPONSIVE_MARGIN_MANIFEST_VERSION } from './responsive-margin-resolution';
import { P15_ELEMENTOR_RESPONSIVE_PADDING_MANIFEST_VERSION } from './responsive-padding-resolution';
import { P15_ELEMENTOR_RESPONSIVE_VISIBILITY_MANIFEST_VERSION } from './responsive-visibility-resolution';
import { P15_ELEMENTOR_RESPONSIVE_TEXT_TYPOGRAPHY_MANIFEST_VERSION } from './responsive-text-typography-resolution';
import { P15_ELEMENTOR_RESPONSIVE_TEXT_ALIGNMENT_MANIFEST_VERSION } from './responsive-text-alignment-resolution';
import { P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_MANIFEST_VERSION } from './responsive-button-alignment-resolution';
import { expectedDesktopButtonAlignment } from './mapping-engine/widget-binding';
import { P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MANIFEST_VERSION, P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MAX_PX } from './responsive-min-height-resolution';
import { P15_ELEMENTOR_RESPONSIVE_BORDER_RADIUS_MANIFEST_VERSION } from './responsive-border-radius-resolution';
import { P15_ELEMENTOR_RESPONSIVE_CONTAINER_WIDTH_MANIFEST_VERSION, P15_ELEMENTOR_RESPONSIVE_WIDGET_WIDTH_MANIFEST_VERSION } from './responsive-size-resolution';
import { P15_NEUTRAL_EXPORT_MAX_RADIUS_PX } from './neutral-export-ir';
import { generateElementorV3TemplateCandidate } from './v3-template-generator';

/**
 * Responsive merge (recovery M4.3a–b). Desktop is the base; matched tablet/mobile nodes contribute explicit
 * per-breakpoint values, and the M1 engine writes them as `_tablet` / `_mobile` keys through one page composition.
 * Values are taken from the matched variant IR, never inferred.
 *
 * - M4.3a, container layout: differing direction, alignment, gap, padding and margin (direction, alignment, gap,
 *   padding, margin families).
 * - M4.3b, presence: a desktop-only element is hidden on the breakpoint that lacks it (`hide_<device>`); a
 *   variant-only element (with its subtree) is inserted into the desktop tree under its matched parent, right after
 *   its nearest preceding matched sibling, and hidden on every other device (visibility family).
 * - M4.3b, order: when a breakpoint reorders the visible children of a matched container, every child visible there
 *   gets that breakpoint's custom flex order, its position in the variant (element order family).
 *
 * - M4.3c, widgets: differing font size, line height and letter spacing of Heading, Text Editor and Button widgets
 *   (text typography family), and their alignment (text and Button alignment families).
 * - M4.3d, sizes: an exact container or Heading/Text/Button width on both sides (container and widget width
 *   families), container min height and uniform corner radius (existing integer families; values outside them are a
 *   review).
 *
 * - M4.4, mismatch policy: the matcher never guesses; nesting that cannot map is a review with its explanation —
 *   ambiguous matches, a changed element kind, a variant-only node with no matched parent, and the same content under a
 *   different parent (`RESPONSIVE_NESTING_DIFFERS`, rendered as a hidden original plus a breakpoint-only copy).
 *
 * What is not merged is an explicit review, never a silent drop: ambiguous matches, a variant-only node that cannot
 * be placed, wrap and grid layout changes, an unset variant value whose Elementor default would differ (padding,
 * alignment, typography), other typography (family, weight, colour…), different text, and any other differing
 * container or widget property (a width mode change, hug/fill/flex sizing, image sizing, colours, borders…).
 */
export const P15_RESPONSIVE_MERGE_VERSION = 'p15-elementor-responsive-merge-v1' as const;

type VariantDevice = 'tablet' | 'mobile';
type Device = 'desktop' | VariantDevice;

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
  /** The desktop IR with the inserted variant-only elements: the source the composition was bound to. */
  document: P15NeutralExportDocumentV1 | null;
  composition: P15PageCompositionResultV1 | null;
  /** Per family: the elements with responsive values (sorted by source node id). */
  entries: Record<string, Array<Record<string, unknown>>>;
  reviews: P15ResponsiveMergeReview[];
  blockReason: string | null;
}

const FLAGS = { responsiveInferencePerformed: false, figmaMutation: false, networkAccess: false, responsiveClosureClaim: false,
  targetCompatibilityClaim: false, productionAcceptance: false, downloadEnabled: false } as const;
const VERSIONS: Record<string, string> = {
  direction: P15_ELEMENTOR_RESPONSIVE_DIRECTION_MANIFEST_VERSION, alignment: P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_MANIFEST_VERSION,
  gap: P15_ELEMENTOR_RESPONSIVE_GAP_MANIFEST_VERSION, padding: P15_ELEMENTOR_RESPONSIVE_PADDING_MANIFEST_VERSION,
  margin: P15_ELEMENTOR_RESPONSIVE_MARGIN_MANIFEST_VERSION, visibility: P15_ELEMENTOR_RESPONSIVE_VISIBILITY_MANIFEST_VERSION,
  elementOrder: P15_ELEMENTOR_RESPONSIVE_ELEMENT_ORDER_MANIFEST_VERSION, textTypography: P15_ELEMENTOR_RESPONSIVE_TEXT_TYPOGRAPHY_MANIFEST_VERSION,
  textAlignment: P15_ELEMENTOR_RESPONSIVE_TEXT_ALIGNMENT_MANIFEST_VERSION, buttonAlignment: P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_MANIFEST_VERSION,
  minHeight: P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MANIFEST_VERSION, containerWidth: P15_ELEMENTOR_RESPONSIVE_CONTAINER_WIDTH_MANIFEST_VERSION,
  borderRadius: P15_ELEMENTOR_RESPONSIVE_BORDER_RADIUS_MANIFEST_VERSION, widgetWidth: P15_ELEMENTOR_RESPONSIVE_WIDGET_WIDTH_MANIFEST_VERSION,
};
const ENTRIES_FIELD: Record<string, string> = { visibility: 'elements', elementOrder: 'elements', textTypography: 'widgets', textAlignment: 'widgets',
  buttonAlignment: 'widgets', widgetWidth: 'widgets' };
const isIntIn = (value: number, max: number): boolean => Number.isSafeInteger(value) && value >= 0 && value <= max;
const TYPOGRAPHY_METRICS = [['fontSizePx', 'FontSizePx'], ['lineHeightPx', 'LineHeightPx'], ['letterSpacingPx', 'LetterSpacingPx']] as const;
/** Container keys this step handles (or that carry no layout value). */
const HANDLED_KEYS = new Set(['kind', 'sourceNodeId', 'children', 'styleReviews', 'direction', 'alignItems', 'justifyContent', 'gapPx', 'paddingPx', 'marginPx', 'wrap', 'grid',
  'sizing', 'cornerRadiusPx']);
const ZERO_BOX = { top: 0, right: 0, bottom: 0, left: 0 };
const HIDE_FIELD: Record<Device, string> = { desktop: 'hideDesktop', tablet: 'hideTablet', mobile: 'hideMobile' };

const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

interface Indexed {
  nodes: Map<string, P15NeutralExportNode>;
  parents: Map<string, P15NeutralContainerNode | null>;
}

function index(nodes: readonly P15NeutralExportNode[], parent: P15NeutralContainerNode | null = null,
  out: Indexed = { nodes: new Map(), parents: new Map() }): Indexed {
  for (const node of nodes) {
    out.nodes.set(node.sourceNodeId, node);
    out.parents.set(node.sourceNodeId, parent);
    if (node.kind === 'container') index(node.children, node, out);
  }
  return out;
}

/** Content identity of a subtree, ignoring source node ids (M4.4 nesting detection). */
function contentFingerprint(node: P15NeutralExportNode): string {
  const strip = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(strip);
    if (typeof value !== 'object' || value === null) return value;
    return Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'sourceNodeId').map(([key, entry]) => [key, strip(entry)]));
  };
  return JSON.stringify(strip(node));
}

const containsReview = (node: P15NeutralExportNode): boolean =>
  node.kind === 'review' || (node.kind === 'container' && node.children.some(containsReview));

function blocked(blockReason: string, reviews: P15ResponsiveMergeReview[] = [], entries: Record<string, Array<Record<string, unknown>>> = {}): P15ResponsiveMergeResultV1 {
  return { version: P15_RESPONSIVE_MERGE_VERSION, status: 'BLOCKED', document: null, composition: null, entries, reviews, blockReason };
}

export function buildP15ResponsiveMerge(desktop: P15NeutralExportDocumentV1, variants: readonly P15ResponsiveVariantInput[]): P15ResponsiveMergeResultV1 {
  if (variants.length === 0 || new Set(variants.map((variant) => variant.device)).size !== variants.length) {
    return blocked('One tablet and/or one mobile variant is required, each device at most once.');
  }
  if (generateElementorV3TemplateCandidate(desktop).status !== 'GENERATED_LOCAL_CANDIDATE') {
    return blocked('The desktop base must generate as a review-free local candidate.');
  }
  const merged = clone(desktop);
  const original = index(desktop.nodes);
  const reviews: P15ResponsiveMergeReview[] = [];
  const entries = new Map<string, Map<string, Record<string, unknown>>>();
  const put = (family: string, sourceNodeId: string, fields: Record<string, unknown>): void => {
    const byNode = entries.get(family) ?? new Map<string, Record<string, unknown>>();
    byNode.set(sourceNodeId, { ...(byNode.get(sourceNodeId) ?? { sourceNodeId }), ...fields });
    entries.set(family, byNode);
  };
  /** Inserted variant-only element id → the device it comes from. */
  const inserted = new Map<string, VariantDevice>();
  const prepared = variants.map((variant) => ({ ...variant, variantIndex: index(variant.document.nodes),
    counterpart: new Map(variant.match.matches.map((entry) => [entry.desktopId, entry.variantId])),
    reverse: new Map(variant.match.matches.map((entry) => [entry.variantId, entry.desktopId])) }));

  // Presence (M4.3b): place every top-most variant-only element, then hide desktop-only elements on that device.
  for (const { device, match, variantIndex, reverse } of prepared) {
    const review = (sourceNodeId: string, reasonCode: string, detail: string): void => { reviews.push({ device, sourceNodeId, reasonCode, detail }); };
    for (const entry of match.ambiguous) review(entry.desktopId, 'RESPONSIVE_MATCH_AMBIGUOUS', entry.detail);
    const mergedIndex = index(merged.nodes);
    const placedParents = new Set<string>();
    for (const id of match.unmatchedVariant) {
      const node = variantIndex.nodes.get(id);
      const parent = variantIndex.parents.get(id);
      if (!node || parent === undefined) continue; // A Figma layer without its own IR node (already inside a parent's IR).
      const desktopParentId = parent ? reverse.get(parent.sourceNodeId) : undefined;
      if (parent && reverse.get(parent.sourceNodeId) === undefined) continue; // Inside another variant-only subtree.
      const desktopParent = desktopParentId ? mergedIndex.nodes.get(desktopParentId) : undefined;
      if (!desktopParent || desktopParent.kind !== 'container' || containsReview(node)) {
        review(id, 'RESPONSIVE_NODE_NOT_PLACED', `Present only on ${device}, but it cannot be placed in the desktop tree.`);
        continue;
      }
      placedParents.add(parent!.sourceNodeId);
    }
    // Insert per parent in variant order, each right after the desktop counterpart of its nearest preceding matched sibling.
    for (const parentId of [...placedParents].sort()) {
      const parent = variantIndex.nodes.get(parentId) as P15NeutralContainerNode;
      const desktopParent = mergedIndex.nodes.get(reverse.get(parentId)!) as P15NeutralContainerNode;
      let cursor = 0;
      for (const child of parent.children) {
        const counterpartId = reverse.get(child.sourceNodeId);
        if (counterpartId !== undefined) {
          const at = desktopParent.children.findIndex((entry) => entry.sourceNodeId === counterpartId);
          if (at >= 0) cursor = at + 1;
        } else if (match.unmatchedVariant.includes(child.sourceNodeId) && !containsReview(child)) {
          desktopParent.children.splice(cursor, 0, clone(child));
          cursor += 1;
          inserted.set(child.sourceNodeId, device);
          // Hidden on every other device, provided or not: a device without its own frame shows the desktop design.
          put('visibility', child.sourceNodeId, Object.fromEntries((['desktop', 'tablet', 'mobile'] as Device[])
            .filter((other) => other !== device).map((other) => [HIDE_FIELD[other], true])));
        }
      }
    }
    const hiddenDesktop: string[] = [];
    for (const id of match.unmatchedDesktop) {
      const parent = original.parents.get(id);
      if (!original.nodes.has(id) || parent === undefined) continue;
      if (parent && match.unmatchedDesktop.includes(parent.sourceNodeId)) continue; // Hidden with its parent.
      put('visibility', id, { [HIDE_FIELD[device]]: true });
      hiddenDesktop.push(id);
    }
    // M4.4: the same content under a different parent is a nesting change the matcher does not map. The output still
    // renders each breakpoint (hidden original + breakpoint-only copy), but duplicates content: an explicit review.
    const insertedHere = [...inserted].filter(([, from]) => from === device).map(([id]) => id);
    for (const desktopId of hiddenDesktop) {
      const fingerprint = contentFingerprint(original.nodes.get(desktopId)!);
      const moved = insertedHere.find((variantId) => contentFingerprint(variantIndex.nodes.get(variantId)!) === fingerprint);
      if (moved !== undefined) {
        review(desktopId, 'RESPONSIVE_NESTING_DIFFERS', `Same content sits under another parent on ${device} (${moved}); kept as a hidden original plus a ${device}-only copy.`);
      }
    }
  }

  // Layout and order (M4.3a, M4.3b) for every matched pair.
  for (const { device, variantIndex, counterpart } of prepared) {
    const review = (sourceNodeId: string, reasonCode: string, detail: string): void => { reviews.push({ device, sourceNodeId, reasonCode, detail }); };
    for (const [desktopId, variantId] of counterpart) {
      const d = original.nodes.get(desktopId);
      const v = variantIndex.nodes.get(variantId);
      if (!d || !v) continue; // Figma layers without an IR node (merged into a parent, e.g. text runs).
      if (d.kind !== v.kind) {
        review(desktopId, 'RESPONSIVE_KIND_DIFFERS', `${d.kind} on desktop, ${v.kind} on ${device}.`);
        continue;
      }
      if (d.kind !== 'container' || v.kind !== 'container') {
        mergeWidget(d, v, device, put, review);
        continue;
      }
      mergeContainerLayout(d, v, device, put, review);
    }
    // Order: positions of the children visible on this device, in the merged desktop order.
    for (const node of index(merged.nodes).nodes.values()) {
      if (node.kind !== 'container') continue;
      const variantParentId = counterpart.get(node.sourceNodeId);
      const variantParent = variantParentId ? variantIndex.nodes.get(variantParentId) : undefined;
      if (!variantParent || variantParent.kind !== 'container') continue;
      const variantOrder = variantParent.children.map((child) => child.sourceNodeId);
      const positions = node.children.map((child) => {
        const id = inserted.get(child.sourceNodeId) === device ? child.sourceNodeId : counterpart.get(child.sourceNodeId);
        return id === undefined ? -1 : variantOrder.indexOf(id);
      });
      const visible = positions.filter((position) => position >= 0);
      if (visible.every((position, i) => i === 0 || position > visible[i - 1]!)) continue;
      node.children.forEach((child, i) => {
        if (positions[i]! >= 0) put('elementOrder', child.sourceNodeId, { [`${device}OrderCustom`]: true, [`${device}OrderValue`]: positions[i] });
      });
    }
  }

  const families: Record<string, Array<Record<string, unknown>>> = {};
  for (const [family, byNode] of [...entries].sort(([a], [b]) => (a < b ? -1 : 1))) {
    families[family] = [...byNode.values()].sort((a, b) => (String(a.sourceNodeId) < String(b.sourceNodeId) ? -1 : 1));
  }
  reviews.sort((a, b) => (a.device + a.sourceNodeId + a.reasonCode < b.device + b.sourceNodeId + b.reasonCode ? -1 : 1));
  const generation = generateElementorV3TemplateCandidate(merged);
  if (generation.status !== 'GENERATED_LOCAL_CANDIDATE' || !generation.candidate) {
    return blocked(`The desktop tree with the inserted breakpoint-only elements does not generate review-free (${generation.status}).`, reviews, families);
  }
  const common = { schemaVersion: 1, sourceIrFingerprint: fingerprintP15NeutralExportDocument(merged),
    baseCandidateIdentityDigest: buildElementorTemplateCandidateIdentity(generation.candidate).digest, ...FLAGS };
  const manifests = Object.fromEntries(Object.entries(families).map(([family, list]) =>
    [family, { ...common, manifestVersion: VERSIONS[family], [ENTRIES_FIELD[family] ?? 'containers']: list }]));
  const composition = composeP15ElementorPage(merged, { ...common, compositionVersion: P15_PAGE_COMPOSITION_VERSION, families: manifests });
  if (composition.status !== 'RESOLVED') {
    return blocked(`The page composition refused the responsive values: ${composition.issues.map((issue) => issue.code).join(', ') || composition.status}.`, reviews, families);
  }
  return { version: P15_RESPONSIVE_MERGE_VERSION, status: reviews.length === 0 ? 'MERGED' : 'REVIEW', document: merged, composition,
    entries: families, reviews, blockReason: null };
}

/** Typography metrics and alignment of Heading, Text Editor and Button widgets (M4.3c); anything else is a review. */
function mergeWidget(
  d: P15NeutralExportNode,
  v: P15NeutralExportNode,
  device: VariantDevice,
  put: (family: string, sourceNodeId: string, fields: Record<string, unknown>) => void,
  review: (sourceNodeId: string, reasonCode: string, detail: string) => void,
): void {
  const id = d.sourceNodeId;
  const dr = d as unknown as Record<string, unknown>;
  const vr = v as unknown as Record<string, unknown>;
  const handled = new Set(['kind', 'sourceNodeId']);
  if (d.kind === 'heading' || d.kind === 'text' || d.kind === 'button') {
    handled.add('typography').add('align');
    const dt = (dr.typography ?? {}) as Record<string, unknown>;
    const vt = (vr.typography ?? {}) as Record<string, unknown>;
    for (const [metric, key] of TYPOGRAPHY_METRICS) {
      if (same(dt[metric], vt[metric])) continue;
      if (vt[metric] === undefined) review(id, 'RESPONSIVE_VALUE_UNSET_ON_VARIANT', `typography.${metric} is unset on ${device}.`);
      else put('textTypography', id, { [`${device}${key}`]: vt[metric] });
    }
    const otherTypography = Object.keys({ ...dt, ...vt }).filter((key) => !TYPOGRAPHY_METRICS.some(([metric]) => metric === key) && !same(dt[key], vt[key]));
    if (otherTypography.length > 0) review(id, 'RESPONSIVE_WIDGET_PROPERTY_NOT_MERGED', `typography ${otherTypography.sort().join(', ')} differ on ${device}.`);
    if (!same(dr.align, vr.align)) {
      if (vr.align === undefined) review(id, 'RESPONSIVE_VALUE_UNSET_ON_VARIANT', `align is unset on ${device}.`);
      else if (d.kind === 'button') put('buttonAlignment', id, { [`${device}Align`]: expectedDesktopButtonAlignment(vr.align as 'start' | 'center' | 'end') });
      else put('textAlignment', id, { [`${device}Align`]: vr.align });
    }
  }
  if (d.kind === 'heading' || d.kind === 'text' || d.kind === 'button') {
    // M4.3d: an exact width on both sides (the base writes `_element_width: initial` with it).
    handled.add('sizing');
    const ds = (dr.sizing ?? {}) as Record<string, unknown>;
    const vs = (vr.sizing ?? {}) as Record<string, unknown>;
    if (!same(ds.widthPx, vs.widthPx)) {
      if (typeof ds.widthPx === 'number' && typeof vs.widthPx === 'number') put('widgetWidth', id, { [`${device}WidthPx`]: vs.widthPx });
      else review(id, 'RESPONSIVE_SIZING_NOT_MERGED', `Width mode differs on ${device} (exact width on one side only).`);
    }
    const otherSizing = Object.keys({ ...ds, ...vs }).filter((key) => key !== 'widthPx' && !same(ds[key], vs[key]));
    if (otherSizing.length > 0) review(id, 'RESPONSIVE_SIZING_NOT_MERGED', `sizing ${otherSizing.sort().join(', ')} differ on ${device}.`);
  }
  const differing = Object.keys({ ...dr, ...vr }).filter((key) => !handled.has(key) && !same(dr[key], vr[key]));
  if (differing.length > 0) review(id, 'RESPONSIVE_WIDGET_PROPERTY_NOT_MERGED', `${differing.sort().join(', ')} differ on ${device}.`);
}

function mergeContainerLayout(
  d: P15NeutralContainerNode,
  v: P15NeutralContainerNode,
  device: VariantDevice,
  put: (family: string, sourceNodeId: string, fields: Record<string, unknown>) => void,
  review: (sourceNodeId: string, reasonCode: string, detail: string) => void,
): void {
  const id = d.sourceNodeId;
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
  // M4.3d sizes. Exact width on both sides → container width; min height and radius → the existing integer families.
  const ds = (d.sizing ?? {}) as Record<string, unknown>;
  const vs = (v.sizing ?? {}) as Record<string, unknown>;
  if (!same(ds.widthPx, vs.widthPx)) {
    if (typeof ds.widthPx === 'number' && typeof vs.widthPx === 'number') put('containerWidth', id, { [`${device}WidthPx`]: vs.widthPx });
    else review(id, 'RESPONSIVE_SIZING_NOT_MERGED', `Width mode differs on ${device} (exact width on one side only).`);
  }
  if (!same(ds.minHeightPx, vs.minHeightPx)) {
    const value = vs.minHeightPx;
    if (typeof value === 'number' && isIntIn(value, P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MAX_PX)) put('minHeight', id, { [`${device}MinHeightPx`]: value });
    else review(id, 'RESPONSIVE_SIZING_NOT_MERGED', `minHeightPx ${String(value)} on ${device} is unset or outside the min-height family (integer 0–${P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MAX_PX}).`);
  }
  const otherSizing = Object.keys({ ...ds, ...vs }).filter((key) => key !== 'widthPx' && key !== 'minHeightPx' && !same(ds[key], vs[key]));
  if (otherSizing.length > 0) review(id, 'RESPONSIVE_SIZING_NOT_MERGED', `sizing ${otherSizing.sort().join(', ')} differ on ${device}.`);
  if (!same(d.cornerRadiusPx, v.cornerRadiusPx)) {
    // No radius is radius 0 (Elementor writes no border-radius by default).
    const value = v.cornerRadiusPx ?? 0;
    if (isIntIn(value, P15_NEUTRAL_EXPORT_MAX_RADIUS_PX)) put('borderRadius', id, { [`${device}CornerRadiusPx`]: value });
    else review(id, 'RESPONSIVE_SIZING_NOT_MERGED', `cornerRadiusPx ${value} on ${device} is outside the radius family (integer px).`);
  }
  const differing = Object.keys({ ...d, ...v }).filter((key) => !HANDLED_KEYS.has(key)
    && !same((d as unknown as Record<string, unknown>)[key], (v as unknown as Record<string, unknown>)[key]));
  if (differing.length > 0) review(id, 'RESPONSIVE_PROPERTY_NOT_MERGED', `${differing.sort().join(', ')} differ on ${device}.`);
}
