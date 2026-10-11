import {
  familyApi,
  type FamilyAuthorityFlag,
  type FamilyIssueCode,
  type FamilyIssueV1,
  type FamilyManifestV1,
  type FamilyResultV1,
  type FamilyStatus,
} from './mapping-engine/contract-types';
import { elementorPxSlider, type ValueCodec } from './mapping-engine/codecs';
import { responsiveEnumFamily } from './mapping-engine/families/responsive-layout';
import { widgetTarget } from './mapping-engine/widget-binding';
import { P15_NEUTRAL_EXPORT_MAX_SIZE_PX } from './container-sizing';

/**
 * Responsive sizes (recovery M4.3d): explicit tablet/mobile px widths at the neutral IR's own precision (two
 * decimals, up to `P15_NEUTRAL_EXPORT_MAX_SIZE_PX`), for breakpoint frames whose layers have a different exact width.
 *
 * - Container width: `width_<device>`. R0, Elementor 4.2.4 `includes/elements/container.php` (blob 3486766)
 *   `add_responsive_control( 'width' )` with `condition` `content_width => full`; the base writes `content_width: full`
 *   with every exact width, and the family refuses a Container whose base is not `full`.
 * - Widget width: `_element_custom_width_<device>`. R0 `includes/widgets/common-base.php` (blob 77c497b)
 *   `add_responsive_control( '_element_custom_width' )` with `condition` `_element_width => initial`, which the base
 *   writes with every exact widget width; the family refuses a widget whose base is not `initial`. Image widgets are
 *   not targeted: their picture is sized by the Image widget's own `width`/`height` (M3.4), not the element width.
 */
export const P15_ELEMENTOR_RESPONSIVE_CONTAINER_WIDTH_MANIFEST_VERSION = 'p15-elementor-responsive-container-width-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_CONTAINER_WIDTH_RESULT_VERSION = 'p15-elementor-responsive-container-width-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_WIDGET_WIDTH_MANIFEST_VERSION = 'p15-elementor-responsive-widget-width-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_WIDGET_WIDTH_RESULT_VERSION = 'p15-elementor-responsive-widget-width-result-v1' as const;

export const P15_ELEMENTOR_RESPONSIVE_SIZE_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  containerSourcePath: 'includes/elements/container.php',
  containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
  widgetCommonSourcePath: 'includes/widgets/common-base.php',
  widgetCommonSourceBlobSha: '77c497bfa4a3b7bb283c585e87efb06c590cb0c1',
  containerTabletSettingKey: 'width_tablet',
  containerMobileSettingKey: 'width_mobile',
  widgetTabletSettingKey: '_element_custom_width_tablet',
  widgetMobileSettingKey: '_element_custom_width_mobile',
});

interface SizeEntry {
  sourceNodeId: string;
  tabletWidthPx?: number;
  mobileWidthPx?: number;
}
type ContainerContract = {
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_CONTAINER_WIDTH_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_CONTAINER_WIDTH_RESULT_VERSION;
  status: FamilyStatus<'NO_RESPONSIVE_CONTAINER_WIDTH_OVERRIDES', 'RESPONSIVE_CONTAINER_WIDTH_RESOLVED'>;
  entriesField: 'containers';
  entry: SizeEntry;
  summaryField: 'resolvedWidths';
  summary: Record<keyof SizeEntry, unknown>;
  issueCode: FamilyIssueCode<'P15_RESPONSIVE_CONTAINER_WIDTH', 'PRECONDITION_FAILED'>;
  noun: 'Container';
  flags: FamilyAuthorityFlag;
};
type WidgetContract = Omit<ContainerContract, 'manifestVersion' | 'resultVersion' | 'status' | 'entriesField' | 'issueCode' | 'noun'> & {
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_WIDGET_WIDTH_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_WIDGET_WIDTH_RESULT_VERSION;
  status: FamilyStatus<'NO_RESPONSIVE_WIDGET_WIDTH_OVERRIDES', 'RESPONSIVE_WIDGET_WIDTH_RESOLVED'>;
  entriesField: 'widgets';
  issueCode: FamilyIssueCode<'P15_RESPONSIVE_WIDGET_WIDTH', 'SOURCE_NOT_SIZED_WIDGET' | 'PRECONDITION_FAILED'>;
  noun: 'Widget';
};
export type P15ElementorResponsiveContainerWidthManifestV1 = FamilyManifestV1<ContainerContract>;
export type P15ElementorResponsiveContainerWidthResultV1 = FamilyResultV1<ContainerContract>;
export type P15ElementorResponsiveContainerWidthIssueV1 = FamilyIssueV1<ContainerContract['issueCode']>;
export type P15ElementorResponsiveWidgetWidthManifestV1 = FamilyManifestV1<WidgetContract>;
export type P15ElementorResponsiveWidgetWidthResultV1 = FamilyResultV1<WidgetContract>;

/** A positive px size up to the neutral maximum with at most two decimals. */
export const p15ResponsiveSizeCodec: ValueCodec<number, ReturnType<typeof elementorPxSlider>> = {
  id: `px2:0<..${P15_NEUTRAL_EXPORT_MAX_SIZE_PX}`,
  is: (value): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0 && value <= P15_NEUTRAL_EXPORT_MAX_SIZE_PX
    && Math.abs(Math.round(value * 100) - value * 100) < 1e-9,
  snapshot: (value) => value,
  encode: (value) => elementorPxSlider(value),
};

const EVIDENCE = P15_ELEMENTOR_RESPONSIVE_SIZE_EVIDENCE;
const fields = (tabletKey: string, mobileKey: string) => [
  { field: 'tabletWidthPx', settingKey: tabletKey, codec: p15ResponsiveSizeCodec, toElementor: (value: never) => elementorPxSlider(value as number), conflictSubject: tabletKey },
  { field: 'mobileWidthPx', settingKey: mobileKey, codec: p15ResponsiveSizeCodec, toElementor: (value: never) => elementorPxSlider(value as number), conflictSubject: mobileKey },
];
const common = {
  maxEntries: 10_000,
  evidence: EVIDENCE,
  summaryField: 'resolvedWidths',
  conflictMode: 'all' as const,
  extraIssueSuffixes: ['PRECONDITION_FAILED'],
  overrideRequiredMessage: 'Each responsive width entry must provide tabletWidthPx and/or mobileWidthPx.',
  valueInvalidMessage: `Responsive widths must be px values above 0 and up to ${P15_NEUTRAL_EXPORT_MAX_SIZE_PX}, with at most two decimals.`,
};

const CONTAINER_FAMILY = responsiveEnumFamily({
  ...common,
  id: 'responsive-container-width',
  issuePrefix: 'P15_RESPONSIVE_CONTAINER_WIDTH',
  subject: 'Responsive container width',
  manifestVersion: P15_ELEMENTOR_RESPONSIVE_CONTAINER_WIDTH_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_RESPONSIVE_CONTAINER_WIDTH_RESULT_VERSION,
  statuses: { none: 'NO_RESPONSIVE_CONTAINER_WIDTH_OVERRIDES', resolved: 'RESPONSIVE_CONTAINER_WIDTH_RESOLVED' },
  fields: fields(EVIDENCE.containerTabletSettingKey, EVIDENCE.containerMobileSettingKey),
  precondition: (settings) => (settings.content_width === 'full' ? null
    : { code: 'PRECONDITION_FAILED', message: 'Responsive container width requires a base Container with content_width full.' }),
  entryEnvelopeMessage: 'Each responsive container width entry may contain only sourceNodeId plus tabletWidthPx and mobileWidthPx.',
});

const WIDGET_FAMILY = responsiveEnumFamily({
  ...common,
  id: 'responsive-widget-width',
  issuePrefix: 'P15_RESPONSIVE_WIDGET_WIDTH',
  subject: 'Responsive widget width',
  manifestVersion: P15_ELEMENTOR_RESPONSIVE_WIDGET_WIDTH_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_RESPONSIVE_WIDGET_WIDTH_RESULT_VERSION,
  statuses: { none: 'NO_RESPONSIVE_WIDGET_WIDTH_OVERRIDES', resolved: 'RESPONSIVE_WIDGET_WIDTH_RESOLVED' },
  target: widgetTarget({
    kinds: ['heading', 'text', 'button'],
    entriesField: 'widgets',
    sourceCountField: 'sourceWidgetCount',
    resolvedCountField: 'resolvedWidgetCount',
    notTargetSuffix: 'SOURCE_NOT_SIZED_WIDGET',
    notTargetMessage: (subject) => `${subject} sourceNodeId must identify an existing neutral Heading, Text or Button node.`,
    bindingMissingMessage: (sourceNodeId) => `Generated widget binding missing for sourceNodeId ${sourceNodeId}.`,
    reviewMessage: 'Review nodes cannot participate in responsive widget width binding.',
    matches: () => true,
    driftPathSuffix: '.settings',
    driftMessage: 'Generated widget drifted from the neutral source.',
  }),
  fields: fields(EVIDENCE.widgetTabletSettingKey, EVIDENCE.widgetMobileSettingKey),
  precondition: (settings) => (settings._element_width === 'initial' ? null
    : { code: 'PRECONDITION_FAILED', message: 'Responsive widget width requires a base widget with _element_width initial.' }),
  extraIssueSuffixes: ['PRECONDITION_FAILED', 'SOURCE_NOT_SIZED_WIDGET'],
  entryEnvelopeMessage: 'Each responsive widget width entry may contain only sourceNodeId plus tabletWidthPx and mobileWidthPx.',
});

const CONTAINER_API = familyApi<P15ElementorResponsiveContainerWidthResultV1>(CONTAINER_FAMILY);
const WIDGET_API = familyApi<P15ElementorResponsiveWidgetWidthResultV1>(WIDGET_FAMILY);

export function resolveP15ElementorResponsiveContainerWidth(sourceValue: unknown, manifestValue: unknown): P15ElementorResponsiveContainerWidthResultV1 {
  return CONTAINER_API.resolve(sourceValue, manifestValue);
}

export function resolveP15ElementorResponsiveWidgetWidth(sourceValue: unknown, manifestValue: unknown): P15ElementorResponsiveWidgetWidthResultV1 {
  return WIDGET_API.resolve(sourceValue, manifestValue);
}

export function serializeP15ElementorResponsiveContainerWidthSummary(result: P15ElementorResponsiveContainerWidthResultV1): string {
  return CONTAINER_API.serialize(result);
}

export function serializeP15ElementorResponsiveWidgetWidthSummary(result: P15ElementorResponsiveWidgetWidthResultV1): string {
  return WIDGET_API.serialize(result);
}
