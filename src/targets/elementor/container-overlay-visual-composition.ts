import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import {
  P15_ELEMENTOR_CONTAINER_OVERLAY_COLOR_FAMILY,
  type P15ElementorContainerOverlayColorResultV1,
} from './container-overlay-color-resolution';
import {
  resolveContainerPropertyFamily,
  serializeContainerPropertyFamilySummary,
  type ContainerFamilyIssue,
  type ContainerFamilyResult,
} from './mapping-engine/container-family-engine';
import type { ValueCodec } from './mapping-engine/codecs';
import type { ContainerPropertyFamily, FamilyEntryFailure, FamilySettingWrite } from './mapping-engine/property-family';
import { isRecord, onlyAllowedKeys, validSourceNodeId } from './mapping-engine/shared-validation';
import type { ElementorTemplateV04 } from './template-v04';

/**
 * Container overlay blend mode and CSS filters (recovery M1.5f target repair), from Elementor 4.2.4:
 * - every CSS-filter field is conditioned on its popover starter `<group>_css_filter` being non-empty
 *   (`includes/controls/groups/base.php` line 324), so v2 writes `css_filters[_hover]_css_filter: 'custom'`;
 * - the filter sliders are declared in `px` only (`css-filter.php`), so every value is `{ unit: 'px', size, sizes: [] }`;
 * - normal `css_filters` and `overlay_blend_mode` apply only with an overlay colour or image
 *   (`container.php` lines 834–890), so this family is chained on the exact overlay-colour result and
 *   refuses normal filters or a blend mode on a container without an explicit overlay colour.
 * v1 skipped the fingerprint, base-identity and authority checks and accepted unknown entry keys.
 */
export const P15_ELEMENTOR_CONTAINER_OVERLAY_VISUAL_MANIFEST_VERSION = 'p15-elementor-container-overlay-visual-manifest-v2' as const;
export const P15_ELEMENTOR_CONTAINER_OVERLAY_VISUAL_RESULT_VERSION = 'p15-elementor-container-overlay-visual-result-v2' as const;
export const P15_ELEMENTOR_CONTAINER_OVERLAY_BLEND_MODES = ['', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'saturation', 'color', 'luminosity'] as const;
export const P15_ELEMENTOR_CONTAINER_OVERLAY_VISUAL_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4', elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  containerSourcePath: 'includes/elements/container.php', containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
  cssFilterGroupSourcePath: 'includes/controls/groups/css-filter.php', cssFilterGroupSourceBlobSha: '5ab052329bccdc8dd8701529ec115733454a57b2',
  groupBaseSourcePath: 'includes/controls/groups/base.php', groupBaseSourceBlobSha: '6117c06b286dbec336eefe63475c747e2fda0234',
  normalGroupName: 'css_filters', hoverGroupName: 'css_filters_hover', popoverStarterSuffix: 'css_filter', popoverStarterValue: 'custom',
  blendModeSettingKey: 'overlay_blend_mode', filterUnit: 'px',
  filterRanges: { blur: [0, 10], brightness: [0, 200], contrast: [0, 200], saturate: [0, 200], hue: [0, 360] } as const,
  normalRequires: 'background_overlay_color or background_overlay_image[url] non-empty',
});

const FILTERS = ['blur', 'brightness', 'contrast', 'saturate', 'hue'] as const;
type FilterName = typeof FILTERS[number];
export type P15ContainerCssFilterV2 = Partial<Record<FilterName, number>>;
export type P15ContainerOverlayBlendMode = typeof P15_ELEMENTOR_CONTAINER_OVERLAY_BLEND_MODES[number];
export interface P15ContainerOverlayVisualEntryV2 {
  sourceNodeId: string;
  blendMode?: P15ContainerOverlayBlendMode;
  normal?: P15ContainerCssFilterV2;
  hover?: P15ContainerCssFilterV2;
}
export interface P15ContainerOverlayVisualManifestV2 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_CONTAINER_OVERLAY_VISUAL_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  /** The exact overlay-colour result this manifest builds on. */
  overlayColorCandidateIdentityDigest: string;
  containers: P15ContainerOverlayVisualEntryV2[];
  styleInferencePerformed: false;
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}
export interface P15ContainerOverlayVisualResultV2 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_CONTAINER_OVERLAY_VISUAL_RESULT_VERSION;
  status: 'BLOCKED_INVALID_SOURCE_IR' | 'BLOCKED_OVERLAY_COLOR_PREREQUISITE' | 'REJECTED_INVALID_MANIFEST'
    | 'NO_CONTAINER_OVERLAY_VISUAL_OVERRIDES' | 'CONTAINER_OVERLAY_VISUALS_RESOLVED';
  overlayColorPrerequisiteStatus: string | null;
  sourceIrFingerprint: string | null;
  overlayColorCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceContainerCount: number;
  resolvedContainerCount: number;
  resolvedOverlayVisuals: P15ContainerOverlayVisualEntryV2[];
  issues: ContainerFamilyIssue[];
  template: ElementorTemplateV04 | null;
  candidate: ElementorTemplateCandidateArtifactV1 | null;
  styleInferencePerformed: false;
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
  internalReviewRequired: true;
}

const RANGES = P15_ELEMENTOR_CONTAINER_OVERLAY_VISUAL_EVIDENCE.filterRanges;
/** A non-empty set of CSS filters, each a finite number inside its Elementor slider range. */
const cssFilterCodec: ValueCodec<P15ContainerCssFilterV2> = {
  id: 'css-filter:px-sliders',
  is: (value): value is P15ContainerCssFilterV2 => isRecord(value) && Object.keys(value).length > 0 && onlyAllowedKeys(value, FILTERS)
    && FILTERS.every((name) => {
      const size = value[name];
      const [min, max] = RANGES[name];
      return size === undefined || (typeof size === 'number' && Number.isFinite(size) && size >= min && size <= max);
    }),
  snapshot: (value) => Object.fromEntries(FILTERS.filter((name) => value[name] !== undefined).map((name) => [name, value[name]])),
  encode: (value) => value,
};
const blendMode = (value: unknown): value is P15ContainerOverlayBlendMode =>
  typeof value === 'string' && (P15_ELEMENTOR_CONTAINER_OVERLAY_BLEND_MODES as readonly string[]).includes(value);
const ENTRY_KEYS = ['sourceNodeId', 'blendMode', 'normal', 'hover'] as const;

function snapshot(entry: P15ContainerOverlayVisualEntryV2): P15ContainerOverlayVisualEntryV2 {
  return { sourceNodeId: entry.sourceNodeId,
    ...(entry.blendMode === undefined ? {} : { blendMode: entry.blendMode }),
    ...(entry.normal === undefined ? {} : { normal: cssFilterCodec.snapshot(entry.normal) }),
    ...(entry.hover === undefined ? {} : { hover: cssFilterCodec.snapshot(entry.hover) }) };
}

function filterWrites(group: string, filters: P15ContainerCssFilterV2): FamilySettingWrite[] {
  const evidence = P15_ELEMENTOR_CONTAINER_OVERLAY_VISUAL_EVIDENCE;
  return [
    { settingKey: `${group}_${evidence.popoverStarterSuffix}`, value: evidence.popoverStarterValue, conflictSubject: `${group} popover` },
    ...FILTERS.filter((name) => filters[name] !== undefined).map((name): FamilySettingWrite => ({
      settingKey: `${group}_${name}`, value: { unit: evidence.filterUnit, size: filters[name], sizes: [] }, conflictSubject: `${group} ${name}`,
    })),
  ];
}

/** Normal filters and the blend mode need an explicit overlay colour on the same container (container.php conditions). */
function overlayColorPrerequisite(entry: P15ContainerOverlayVisualEntryV2, prerequisite: Readonly<Record<string, unknown>>): FamilyEntryFailure[] {
  const overlays = prerequisite.resolvedOverlayColors as P15ElementorContainerOverlayColorResultV1['resolvedOverlayColors'];
  if (overlays.some((overlay) => overlay.sourceNodeId === entry.sourceNodeId)) return [];
  const message = (what: string) => `Container overlay ${what} requires an explicit overlay color on the same container.`;
  return [
    ...(entry.normal === undefined ? [] : [{ code: 'OVERLAY_COLOR_REQUIRED', pathSuffix: '.normal', message: message('normal CSS filters') }]),
    ...(entry.blendMode === undefined ? [] : [{ code: 'OVERLAY_COLOR_REQUIRED', pathSuffix: '.blendMode', message: message('blend mode') }]),
  ];
}

const P15_CONTAINER_OVERLAY_VISUAL_FAMILY: ContainerPropertyFamily<P15ContainerOverlayVisualEntryV2, P15ContainerOverlayVisualEntryV2> = {
  id: 'container-overlay-visual',
  issuePrefix: 'P15_CONTAINER_OVERLAY_VISUAL',
  subject: 'Container overlay visual',
  manifestVersion: P15_ELEMENTOR_CONTAINER_OVERLAY_VISUAL_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_CONTAINER_OVERLAY_VISUAL_RESULT_VERSION,
  maxEntries: 10_000,
  evidence: P15_ELEMENTOR_CONTAINER_OVERLAY_VISUAL_EVIDENCE,
  statuses: { none: 'NO_CONTAINER_OVERLAY_VISUAL_OVERRIDES', resolved: 'CONTAINER_OVERLAY_VISUALS_RESOLVED' },
  summaryField: 'resolvedOverlayVisuals',
  entryKeys: ENTRY_KEYS,
  leadingAuthorityFlags: ['styleInferencePerformed'],
  extraIssueSuffixes: ['OVERLAY_COLOR_REQUIRED'],
  bindingIssuesLast: true,
  chain: {
    prerequisite: P15_ELEMENTOR_CONTAINER_OVERLAY_COLOR_FAMILY,
    statusField: 'overlayColorPrerequisiteStatus',
    digestField: 'overlayColorCandidateIdentityDigest',
    digestIssueStem: 'OVERLAY_COLOR_CANDIDATE_IDENTITY',
    baseNoun: 'overlay color candidate',
    blockedStatus: 'BLOCKED_OVERLAY_COLOR_PREREQUISITE',
    blockedSuffix: 'OVERLAY_COLOR_PREREQUISITE_INVALID',
    blockedPath: '$overlayColorManifest',
    blockedMessage: 'Overlay visual resolution requires a valid exact Container overlay color prerequisite result.',
  },
  entryEnvelopeMessage: 'Each Container overlay visual entry may contain only sourceNodeId plus blendMode, normal and hover CSS filters.',
  codecs: [cssFilterCodec as ValueCodec<unknown>],
  parseEntry(raw, _node, prerequisite) {
    if (raw.blendMode === undefined && raw.normal === undefined && raw.hover === undefined) {
      return { ok: false, code: 'OVERRIDE_REQUIRED', message: 'Each Container overlay visual entry must explicitly provide blendMode, normal and/or hover.' };
    }
    if ((raw.blendMode !== undefined && !blendMode(raw.blendMode))
      || (raw.normal !== undefined && !cssFilterCodec.is(raw.normal)) || (raw.hover !== undefined && !cssFilterCodec.is(raw.hover))) {
      return { ok: false, code: 'VALUE_INVALID', message: 'Overlay blend mode must be a documented value and CSS filters non-empty numbers inside their Elementor 4.2.4 ranges.' };
    }
    const entry = snapshot(raw as unknown as P15ContainerOverlayVisualEntryV2);
    const failures = prerequisite ? overlayColorPrerequisite(entry, prerequisite) : [];
    return failures.length > 0 ? { ok: false, failures } : { ok: true, entry };
  },
  writes(entry) {
    const evidence = P15_ELEMENTOR_CONTAINER_OVERLAY_VISUAL_EVIDENCE;
    return [
      ...(entry.blendMode === undefined ? [] : [{ settingKey: evidence.blendModeSettingKey, value: entry.blendMode, conflictSubject: 'overlay blend mode' }]),
      ...(entry.normal === undefined ? [] : filterWrites(evidence.normalGroupName, entry.normal)),
      ...(entry.hover === undefined ? [] : filterWrites(evidence.hoverGroupName, entry.hover)),
    ];
  },
  summarize: snapshot,
  validSummary: (entry) => isRecord(entry) && onlyAllowedKeys(entry, ENTRY_KEYS) && validSourceNodeId(entry.sourceNodeId)
    && (entry.blendMode !== undefined || entry.normal !== undefined || entry.hover !== undefined)
    && (entry.blendMode === undefined || blendMode(entry.blendMode))
    && (entry.normal === undefined || cssFilterCodec.is(entry.normal)) && (entry.hover === undefined || cssFilterCodec.is(entry.hover)),
};

/** Apply explicit overlay blend mode and CSS filters on top of the exact overlay-colour result. */
export function resolveP15ElementorContainerOverlayVisuals(sourceValue: unknown, overlayColorManifestValue: unknown,
  manifestValue: unknown): P15ContainerOverlayVisualResultV2 {
  return resolveContainerPropertyFamily(P15_CONTAINER_OVERLAY_VISUAL_FAMILY, sourceValue, manifestValue, overlayColorManifestValue) as unknown as P15ContainerOverlayVisualResultV2;
}

/** Only bounded facts are emitted; private source text and candidate bytes stay out. */
export function serializeP15ElementorContainerOverlayVisualSummary(value: P15ContainerOverlayVisualResultV2): string {
  return serializeContainerPropertyFamilySummary(P15_CONTAINER_OVERLAY_VISUAL_FAMILY, value as unknown as ContainerFamilyResult);
}
