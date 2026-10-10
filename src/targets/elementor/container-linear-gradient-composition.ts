import {
  familyApi,
  type FamilyAuthorityFlag,
  type FamilyManifestV1,
  type FamilyResultV1,
} from './mapping-engine/contract-types';
import { gradientProfileCodec, gradientWrites, type GradientKind, type GradientProfile } from './mapping-engine/families/button-gradient';
import { statePairFamily, type PairEntry } from './mapping-engine/families/state-pair';

/**
 * Container normal/hover linear gradients (recovery M1.5e target repair).
 *
 * Elementor 4.2.4 declares `color_stop` / `color_b_stop` and `gradient_angle` as SLIDER controls, and
 * the gradient CSS reads `{{color_stop.SIZE}}{{color_stop.UNIT}}`. v1 wrote bare stop numbers, which
 * Elementor cannot render. v2 reuses the Button gradient codec and writes, which encode sliders
 * (`{ unit, size, sizes: [] }`) and require integer stops in order with paired responsive stops.
 */
export const P15_ELEMENTOR_CONTAINER_LINEAR_GRADIENT_MANIFEST_VERSION = 'p15-elementor-container-linear-gradient-manifest-v2' as const;
export const P15_ELEMENTOR_CONTAINER_LINEAR_GRADIENT_RESULT_VERSION = 'p15-elementor-container-linear-gradient-result-v2' as const;
export const P15_ELEMENTOR_CONTAINER_GRADIENT_SOURCE_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4', elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  containerSourcePath: 'includes/elements/container.php', containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
  backgroundGroupSourcePath: 'includes/controls/groups/background.php', backgroundGroupSourceBlobSha: 'ac8e1a510ec663f3f428c9f564dc2c5b727435e1',
  normalGroupName: 'background', hoverGroupName: 'background_hover', acceptedBackgroundType: 'gradient',
  colorPattern: '^#[0-9a-f]{6}$', stopEncoding: 'slider { unit: "%", size, sizes: [] }', stopMin: 0, stopMax: 100,
  stopOrder: 'stopA <= stopB', responsiveStops: 'tablet/mobile stop pairs, both or neither',
});
export const P15_ELEMENTOR_CONTAINER_LINEAR_GRADIENT_EVIDENCE = Object.freeze({
  ...P15_ELEMENTOR_CONTAINER_GRADIENT_SOURCE_EVIDENCE,
  acceptedGradientType: 'linear', angleEncoding: 'slider { unit: "deg", size, sizes: [] }', angleMin: 0, angleMax: 360,
});

export interface P15ContainerLinearGradientV2 {
  colorA: string; colorB: string; stopA: number; stopB: number;
  tabletStopA?: number; tabletStopB?: number; mobileStopA?: number; mobileStopB?: number;
  angleDeg?: number; tabletAngleDeg?: number; mobileAngleDeg?: number;
}
export type P15ContainerLinearGradientEntryV2 = PairEntry<P15ContainerLinearGradientV2>;
/** Authority flags shared by the Container linear and radial gradient families. */
export type P15ContainerGradientAuthorityFlag = FamilyAuthorityFlag<'gradientInferencePerformed'>;
export type P15ContainerLinearGradientManifestV2 = FamilyManifestV1<{
  manifestVersion: typeof P15_ELEMENTOR_CONTAINER_LINEAR_GRADIENT_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_CONTAINER_LINEAR_GRADIENT_RESULT_VERSION;
  status: string;
  entriesField: 'containers';
  entry: P15ContainerLinearGradientEntryV2;
  summaryField: 'resolvedGradients';
  summary: P15ContainerLinearGradientEntryV2;
  issueCode: string;
  noun: 'Container';
  flags: P15ContainerGradientAuthorityFlag;
}>;

/** The standard engine result shared by the Container linear and radial gradient families. */
export type P15ContainerGradientResultV2<Entry, ResultVersion extends string = string> = FamilyResultV1<{
  manifestVersion: string;
  resultVersion: ResultVersion;
  status: string;
  entriesField: 'containers';
  entry: Entry;
  summaryField: 'resolvedGradients';
  summary: Entry;
  issueCode: string;
  noun: 'Container';
  flags: P15ContainerGradientAuthorityFlag;
}>;
export type P15ContainerLinearGradientResultV2 = P15ContainerGradientResultV2<P15ContainerLinearGradientEntryV2, typeof P15_ELEMENTOR_CONTAINER_LINEAR_GRADIENT_RESULT_VERSION>;

/** One Container gradient family over the shared Button gradient codec and writes. */
export function containerGradientFamily<Value>(kind: GradientKind, meta: {
  manifestVersion: string; resultVersion: string; evidence: Readonly<Record<string, unknown>> & { elementorVersion: string };
  positions?: readonly string[];
}) {
  const upper = kind.toUpperCase();
  return statePairFamily<Value>({
    id: `container-${kind}-gradient`,
    issuePrefix: `P15_CONTAINER_${upper}_GRADIENT`,
    subject: `Container ${kind} gradient`,
    manifestVersion: meta.manifestVersion,
    resultVersion: meta.resultVersion,
    maxEntries: 10_000,
    evidence: meta.evidence,
    statuses: { none: `NO_CONTAINER_${upper}_GRADIENT_OVERRIDES`, resolved: `CONTAINER_${upper}_GRADIENTS_RESOLVED` },
    summaryField: 'resolvedGradients',
    leadingAuthorityFlags: ['gradientInferencePerformed'],
    codec: gradientProfileCodec(kind, meta.positions) as never,
    settings: (value, state) => gradientWrites(kind, state === 'hover' ? 'background_hover' : 'background', value as GradientProfile, 0, 'Container')
      .map((write) => [write.settingKey, write.value] as const),
    entryEnvelopeMessage: `Each Container ${kind} gradient entry may contain only sourceNodeId plus normal and/or hover gradients.`,
    overrideRequiredMessage: `Each Container ${kind} gradient entry must explicitly provide normal and/or hover.`,
    valueInvalidMessage: `Container ${kind} gradient values must be lowercase hex colours with ordered integer stops 0..100${kind === 'linear' ? ' and integer angles 0..360' : ' and a documented position'}.`,
  });
}

const P15_CONTAINER_LINEAR_GRADIENT_FAMILY = containerGradientFamily<P15ContainerLinearGradientV2>('linear', {
  manifestVersion: P15_ELEMENTOR_CONTAINER_LINEAR_GRADIENT_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_CONTAINER_LINEAR_GRADIENT_RESULT_VERSION,
  evidence: P15_ELEMENTOR_CONTAINER_LINEAR_GRADIENT_EVIDENCE,
});

const API = familyApi<P15ContainerLinearGradientResultV2>(P15_CONTAINER_LINEAR_GRADIENT_FAMILY);

export function resolveP15ElementorContainerLinearGradients(sourceValue: unknown, manifestValue: unknown): P15ContainerLinearGradientResultV2 {
  return API.resolve(sourceValue, manifestValue);
}

export function serializeP15ElementorContainerLinearGradientSummary(value: P15ContainerLinearGradientResultV2): string {
  return API.serialize(value);
}
