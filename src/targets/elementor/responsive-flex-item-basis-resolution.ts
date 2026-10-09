import {
  familyApi,
  type FamilyAuthorityFlag,
  type FamilyIssueCode,
  type FamilyIssueV1,
  type FamilyManifestV1,
  type FamilyResultV1,
  type FamilyStatus,
} from './mapping-engine/contract-types';
import { customSelectionCodec, elementorFlexBasisPx, flexBasisPxCodec, toElementorCustomSelection } from './mapping-engine/families/responsive-flex-item-sizing';
import { responsiveEnumFamily } from './mapping-engine/families/responsive-layout';

export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_BASIS_MANIFEST_VERSION =
  'p15-elementor-responsive-flex-item-basis-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_BASIS_RESULT_VERSION =
  'p15-elementor-responsive-flex-item-basis-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_BASIS_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_BASIS_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  flexItemSourcePath: 'includes/controls/groups/flex-item.php',
  flexItemSourceBlobSha: 'dc95ad439d8f9acfd5eefb1d129da67d9ff9c13a',
  containerFixturePath: 'tests/qunit/mock/elments/container.json',
  containerFixtureBlobSha: 'f06c5f60afa8fbef34ed922af419284cece09692',
  groupName: '_flex',
  basisTypeControlName: 'basis_type',
  basisControlName: 'basis',
  tabletBasisTypeSettingKey: '_flex_basis_type_tablet',
  mobileBasisTypeSettingKey: '_flex_basis_type_mobile',
  tabletBasisSettingKey: '_flex_basis_tablet',
  mobileBasisSettingKey: '_flex_basis_mobile',
  acceptedUnit: 'px',
  acceptedSizeRange: [0, 1000] as const,
});

export type P15ElementorFlexBasisPx = number;
export type P15ElementorFlexBasisCustom = true;

export interface P15ElementorResponsiveFlexItemBasisEntryV1 {
  sourceNodeId: string;
  tabletBasisCustom?: P15ElementorFlexBasisCustom;
  mobileBasisCustom?: P15ElementorFlexBasisCustom;
  tabletBasisPx?: P15ElementorFlexBasisPx;
  mobileBasisPx?: P15ElementorFlexBasisPx;
}

export interface P15ElementorResponsiveFlexItemBasisSummaryEntryV1 {
  sourceNodeId: string;
  tabletBasisCustom: P15ElementorFlexBasisCustom | null;
  mobileBasisCustom: P15ElementorFlexBasisCustom | null;
  tabletBasisPx: P15ElementorFlexBasisPx | null;
  mobileBasisPx: P15ElementorFlexBasisPx | null;
}

type Contract = {
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_BASIS_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_BASIS_RESULT_VERSION;
  status: P15ElementorResponsiveFlexItemBasisStatus;
  entriesField: 'containers';
  entry: P15ElementorResponsiveFlexItemBasisEntryV1;
  summaryField: 'resolvedBasis';
  summary: P15ElementorResponsiveFlexItemBasisSummaryEntryV1;
  issueCode: P15ElementorResponsiveFlexItemBasisIssueCode;
  noun: 'Container';
  flags: FamilyAuthorityFlag;
};
export type P15ElementorResponsiveFlexItemBasisManifestV1 = FamilyManifestV1<Contract>;
export type P15ElementorResponsiveFlexItemBasisIssueCode =
  FamilyIssueCode<'P15_RESPONSIVE_FLEX_ITEM_BASIS'>;
export type P15ElementorResponsiveFlexItemBasisIssueV1 = FamilyIssueV1<P15ElementorResponsiveFlexItemBasisIssueCode>;
export type P15ElementorResponsiveFlexItemBasisStatus = FamilyStatus<'NO_RESPONSIVE_FLEX_ITEM_BASIS_OVERRIDES', 'RESPONSIVE_FLEX_ITEM_BASIS_RESOLVED'>;
export type P15ElementorResponsiveFlexItemBasisResultV1 = FamilyResultV1<Contract>;

const EVIDENCE = P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_BASIS_EVIDENCE;
const conflictMessage = (settingKey: string): string =>
  `Generated base candidate already contains requested responsive flex-item basis key ${settingKey}.`;
const FAMILY = responsiveEnumFamily({
  id: 'responsive-flex-item-basis',
  issuePrefix: 'P15_RESPONSIVE_FLEX_ITEM_BASIS',
  subject: 'Responsive flex-item basis',
  manifestVersion: P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_BASIS_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_BASIS_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_BASIS_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_RESPONSIVE_FLEX_ITEM_BASIS_OVERRIDES', resolved: 'RESPONSIVE_FLEX_ITEM_BASIS_RESOLVED' },
  summaryField: 'resolvedBasis',
  fields: [
    { field: 'tabletBasisCustom', settingKey: EVIDENCE.tabletBasisTypeSettingKey, codec: customSelectionCodec, toElementor: toElementorCustomSelection, conflictSubject: 'tablet basis type', conflictMessage: conflictMessage(EVIDENCE.tabletBasisTypeSettingKey) },
    { field: 'mobileBasisCustom', settingKey: EVIDENCE.mobileBasisTypeSettingKey, codec: customSelectionCodec, toElementor: toElementorCustomSelection, conflictSubject: 'mobile basis type', conflictMessage: conflictMessage(EVIDENCE.mobileBasisTypeSettingKey) },
    { field: 'tabletBasisPx', settingKey: EVIDENCE.tabletBasisSettingKey, codec: flexBasisPxCodec, toElementor: elementorFlexBasisPx, conflictSubject: 'tablet basis', conflictMessage: conflictMessage(EVIDENCE.tabletBasisSettingKey) },
    { field: 'mobileBasisPx', settingKey: EVIDENCE.mobileBasisSettingKey, codec: flexBasisPxCodec, toElementor: elementorFlexBasisPx, conflictSubject: 'mobile basis', conflictMessage: conflictMessage(EVIDENCE.mobileBasisSettingKey) },
  ],
  pairs: [['tabletBasisCustom', 'tabletBasisPx'], ['mobileBasisCustom', 'mobileBasisPx']],
  conflictMode: 'all',
  entryEnvelopeMessage: 'Each responsive flex-item basis entry may contain only sourceNodeId plus tablet/mobile custom-basis type/value pairs.',
  overrideRequiredMessage: 'Each responsive flex-item basis entry must explicitly provide a complete tablet or mobile custom-basis type/value pair.',
  valueInvalidMessage: 'Responsive flex-item custom basis must use type custom and a finite integer px size from 0 through 1000.',
});

const API = familyApi<P15ElementorResponsiveFlexItemBasisResultV1>(FAMILY);

/**
 * Apply explicit tablet/mobile flex-item-basis overrides to exact generated container bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.3c); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-container-family-golden-sizing.test.ts`.
 * The contract never infers responsive values, never changes desktop settings and claims no closure.
 */
export function resolveP15ElementorResponsiveContainerFlexItemBasis(sourceValue: unknown, manifestValue: unknown): P15ElementorResponsiveFlexItemBasisResultV1 {
  return API.resolve(sourceValue, manifestValue);
}

/** Serialize only sanitized flex-item-basis metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveFlexItemBasisSummary(result: P15ElementorResponsiveFlexItemBasisResultV1): string {
  return API.serialize(result);
}
