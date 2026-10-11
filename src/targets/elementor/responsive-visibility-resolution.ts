import {
  familyApi,
  type FamilyAuthorityFlag,
  type FamilyIssueCode,
  type FamilyIssueV1,
  type FamilyManifestV1,
  type FamilyResultV1,
  type FamilyStatus,
} from './mapping-engine/contract-types';
import { literalCodec } from './mapping-engine/codecs';
import { ELEMENT_TARGET } from './mapping-engine/element-target';
import { responsiveEnumFamily } from './mapping-engine/families/responsive-layout';

/**
 * Responsive visibility (recovery M4.3b): hide an element on desktop, tablet or mobile because it exists in the
 * design on some breakpoints only. Explicit per device, never inferred.
 *
 * R0, Elementor 4.2.4 `includes/base/element-base.php` `add_hidden_device_controls()`: one `hide_<device>` SWITCHER
 * per active device with `return_value` `hidden-<device>` and `prefix_class` `elementor-`, on every element; the
 * frontend hides `.elementor-hidden-<device>` inside that device's range (`_visibility.scss`).
 */
export const P15_ELEMENTOR_RESPONSIVE_VISIBILITY_MANIFEST_VERSION = 'p15-elementor-responsive-visibility-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_VISIBILITY_RESULT_VERSION = 'p15-elementor-responsive-visibility-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_VISIBILITY_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_RESPONSIVE_VISIBILITY_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  elementBaseSourcePath: 'includes/base/element-base.php',
  elementBaseSourceBlobSha: '733769fc3f542d2a32a361fa1fbdb23cebd0f047',
  visibilityScssPath: 'assets/dev/scss/frontend/_visibility.scss',
  visibilityScssBlobSha: 'd5702c907f43af98bf92af94f1d67f33aa1d9716',
  desktopSettingKey: 'hide_desktop',
  tabletSettingKey: 'hide_tablet',
  mobileSettingKey: 'hide_mobile',
});

export interface P15ElementorResponsiveVisibilityEntryV1 {
  sourceNodeId: string;
  hideDesktop?: true;
  hideTablet?: true;
  hideMobile?: true;
}

export interface P15ElementorResponsiveVisibilitySummaryEntryV1 {
  sourceNodeId: string;
  hideDesktop: true | null;
  hideTablet: true | null;
  hideMobile: true | null;
}

type Contract = {
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_VISIBILITY_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_VISIBILITY_RESULT_VERSION;
  status: P15ElementorResponsiveVisibilityStatus;
  entriesField: 'elements';
  entry: P15ElementorResponsiveVisibilityEntryV1;
  summaryField: 'resolvedVisibility';
  summary: P15ElementorResponsiveVisibilitySummaryEntryV1;
  issueCode: P15ElementorResponsiveVisibilityIssueCode;
  noun: 'Element';
  flags: FamilyAuthorityFlag;
};
export type P15ElementorResponsiveVisibilityManifestV1 = FamilyManifestV1<Contract>;
export type P15ElementorResponsiveVisibilityIssueCode = FamilyIssueCode<'P15_RESPONSIVE_VISIBILITY'>;
export type P15ElementorResponsiveVisibilityIssueV1 = FamilyIssueV1<P15ElementorResponsiveVisibilityIssueCode>;
export type P15ElementorResponsiveVisibilityStatus = FamilyStatus<'NO_RESPONSIVE_VISIBILITY_OVERRIDES', 'RESPONSIVE_VISIBILITY_RESOLVED'>;
export type P15ElementorResponsiveVisibilityResultV1 = FamilyResultV1<Contract>;

const EVIDENCE = P15_ELEMENTOR_RESPONSIVE_VISIBILITY_EVIDENCE;
const hide = literalCodec(true);
const conflictMessage = (settingKey: string): string => `Generated base candidate already contains visibility key ${settingKey}.`;
const field = (name: string, settingKey: string, device: string) =>
  ({ field: name, settingKey, codec: hide, toElementor: () => `hidden-${device}`, conflictSubject: settingKey, conflictMessage: conflictMessage(settingKey) });

const FAMILY = responsiveEnumFamily({
  id: 'responsive-visibility',
  issuePrefix: 'P15_RESPONSIVE_VISIBILITY',
  subject: 'Responsive visibility',
  manifestVersion: P15_ELEMENTOR_RESPONSIVE_VISIBILITY_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_RESPONSIVE_VISIBILITY_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_RESPONSIVE_VISIBILITY_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_RESPONSIVE_VISIBILITY_OVERRIDES', resolved: 'RESPONSIVE_VISIBILITY_RESOLVED' },
  summaryField: 'resolvedVisibility',
  target: ELEMENT_TARGET,
  fields: [
    field('hideDesktop', EVIDENCE.desktopSettingKey, 'desktop'),
    field('hideTablet', EVIDENCE.tabletSettingKey, 'tablet'),
    field('hideMobile', EVIDENCE.mobileSettingKey, 'mobile'),
  ],
  conflictMode: 'all',
  entryEnvelopeMessage: 'Each responsive visibility entry may contain only sourceNodeId plus hideDesktop, hideTablet and hideMobile.',
  overrideRequiredMessage: 'Each responsive visibility entry must hide the element on at least one device.',
  valueInvalidMessage: 'Responsive visibility values must be exactly true.',
});

const API = familyApi<P15ElementorResponsiveVisibilityResultV1>(FAMILY);

/** Apply explicit per-device hide switches to exact generated element bindings; never inferred, desktop layout unchanged. */
export function resolveP15ElementorResponsiveVisibility(sourceValue: unknown, manifestValue: unknown): P15ElementorResponsiveVisibilityResultV1 {
  return API.resolve(sourceValue, manifestValue);
}

export function serializeP15ElementorResponsiveVisibilitySummary(result: P15ElementorResponsiveVisibilityResultV1): string {
  return API.serialize(result);
}
