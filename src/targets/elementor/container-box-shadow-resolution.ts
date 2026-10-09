import {
  familyApi,
  type FamilyAuthorityFlag,
  type FamilyManifestV1,
  type FamilyResultV1,
  type FamilyStatus,
} from './mapping-engine/contract-types';
import type { ValueCodec } from './mapping-engine/codecs';
import { statePairFamily } from './mapping-engine/families/state-pair';
import { exactKeys, isRecord } from './mapping-engine/shared-validation';

export const P15_CONTAINER_BOX_SHADOW_MANIFEST_VERSION = 'p15-container-box-shadow-manifest-v1' as const;
/** v2: the standard engine result (recovery M1.5c); the v1 manifest and every write are unchanged. */
export const P15_CONTAINER_BOX_SHADOW_RESULT_VERSION = 'p15-container-box-shadow-result-v2' as const;
export const P15_CONTAINER_BOX_SHADOW_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4', elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  containerSourcePath: 'includes/elements/container.php',
  containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
  groupSourcePath: 'includes/controls/groups/box-shadow.php',
  groupSourceBlobSha: '1c068c900db0ff2593089028d67fb6d897dbaa33',
  controlSourcePath: 'includes/controls/box-shadow.php',
  controlSourceBlobSha: 'e55cf9af34db5cc3e73dc295cd9f35b437da6fa7',
  normalGroup: 'box_shadow', hoverGroup: 'box_shadow_hover',
  normalKeys: ['box_shadow_box_shadow_type', 'box_shadow_box_shadow', 'box_shadow_box_shadow_position'] as const,
  hoverKeys: ['box_shadow_hover_box_shadow_type', 'box_shadow_hover_box_shadow', 'box_shadow_hover_box_shadow_position'] as const,
  enabledValue: 'yes', normalSelector: '{{WRAPPER}}', hoverSelector: '{{WRAPPER}}:hover',
  acceptedColorPattern: '^#[0-9a-f]{6}$',
});
export interface P15ContainerBoxShadowValueV1 {
  horizontal: number; vertical: number; blur: number; spread: number;
  color: string; position: 'outline' | 'inset';
}
export interface P15ContainerBoxShadowEntryV1 {
  sourceNodeId: string;
  normal?: P15ContainerBoxShadowValueV1;
  hover?: P15ContainerBoxShadowValueV1;
}
type Contract = {
  manifestVersion: typeof P15_CONTAINER_BOX_SHADOW_MANIFEST_VERSION;
  resultVersion: typeof P15_CONTAINER_BOX_SHADOW_RESULT_VERSION;
  status: P15ContainerBoxShadowStatus;
  entriesField: 'containers';
  entry: P15ContainerBoxShadowEntryV1;
  summaryField: 'resolvedShadows';
  summary: P15ContainerBoxShadowEntryV1;
  issueCode: string;
  noun: 'Container';
  flags: FamilyAuthorityFlag<'styleInferencePerformed'>;
};
export type P15ContainerBoxShadowManifestV1 = FamilyManifestV1<Contract>;
export type P15ContainerBoxShadowStatus = FamilyStatus<'NO_CONTAINER_BOX_SHADOW_OVERRIDES', 'CONTAINER_BOX_SHADOWS_RESOLVED'>;
export type P15ContainerBoxShadowResultV2 = FamilyResultV1<Contract>;

const SHADOW_KEYS = ['horizontal', 'vertical', 'blur', 'spread', 'color', 'position'] as const;
const integer = (value: unknown, min: number, max: number): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= min && value <= max;

/** One exact box-shadow value: integer px offsets/blur/spread, lowercase hex colour, outline or inset. */
const boxShadowCodec: ValueCodec<P15ContainerBoxShadowValueV1, Record<string, unknown>> = {
  id: 'box-shadow:int-px+hex+outline|inset',
  is: (value): value is P15ContainerBoxShadowValueV1 => isRecord(value) && exactKeys(value, SHADOW_KEYS)
    && integer(value.horizontal, -100, 100) && integer(value.vertical, -100, 100)
    && integer(value.blur, 0, 100) && integer(value.spread, -100, 100)
    && typeof value.color === 'string' && /^#[0-9a-f]{6}$/.test(value.color)
    && (value.position === 'outline' || value.position === 'inset'),
  snapshot: (value) => ({ ...value }),
  encode: (value) => ({ horizontal: value.horizontal, vertical: value.vertical, blur: value.blur, spread: value.spread, color: value.color }),
};

const P15_CONTAINER_BOX_SHADOW_FAMILY = statePairFamily<P15ContainerBoxShadowValueV1>({
  id: 'container-box-shadow',
  issuePrefix: 'P15_CONTAINER_SHADOW',
  subject: 'Container box shadow',
  manifestVersion: P15_CONTAINER_BOX_SHADOW_MANIFEST_VERSION,
  resultVersion: P15_CONTAINER_BOX_SHADOW_RESULT_VERSION,
  maxEntries: 10_000,
  evidence: P15_CONTAINER_BOX_SHADOW_EVIDENCE,
  statuses: { none: 'NO_CONTAINER_BOX_SHADOW_OVERRIDES', resolved: 'CONTAINER_BOX_SHADOWS_RESOLVED' },
  summaryField: 'resolvedShadows',
  leadingAuthorityFlags: ['styleInferencePerformed'],
  codec: boxShadowCodec,
  settings(value, state) {
    const [type, shadow, position] = state === 'normal' ? P15_CONTAINER_BOX_SHADOW_EVIDENCE.normalKeys : P15_CONTAINER_BOX_SHADOW_EVIDENCE.hoverKeys;
    return [[type, P15_CONTAINER_BOX_SHADOW_EVIDENCE.enabledValue], [shadow, boxShadowCodec.encode(value)],
      [position, value.position === 'inset' ? 'inset' : ' ']];
  },
  entryEnvelopeMessage: 'Each Container box shadow entry may contain only sourceNodeId plus normal and/or hover shadows.',
  overrideRequiredMessage: 'Each Container box shadow entry must explicitly provide normal and/or hover.',
  valueInvalidMessage: 'Container box shadow values must be exact integers in range with a lowercase hex colour and outline or inset position.',
});

const API = familyApi<P15ContainerBoxShadowResultV2>(P15_CONTAINER_BOX_SHADOW_FAMILY);

/** Resolve only explicit Container normal/hover shadow groups from the exact 4.2.4 controls. */
export function resolveP15ContainerBoxShadows(sourceValue: unknown, manifestValue: unknown): P15ContainerBoxShadowResultV2 {
  return API.resolve(sourceValue, manifestValue);
}

/** Only bounded facts are emitted; private source text and candidate bytes stay out. */
export function serializeP15ContainerBoxShadowSummary(value: P15ContainerBoxShadowResultV2): string {
  return API.serialize(value);
}
