import {
  familyApi,
  type FamilyManifestV1,
} from './mapping-engine/contract-types';
import type { PairEntry } from './mapping-engine/families/state-pair';
import {
  containerGradientFamily,
  P15_ELEMENTOR_CONTAINER_GRADIENT_SOURCE_EVIDENCE,
  type P15ContainerGradientAuthorityFlag,
  type P15ContainerGradientResultV2,
} from './container-linear-gradient-composition';

/**
 * Container normal/hover radial gradients (recovery M1.5e target repair). v1 rewrote a linear
 * template into radial but returned the unchanged linear candidate and digest, so the artifact still
 * said `linear`. v2 is its own engine family: the candidate is always rebuilt from the exact writes,
 * stops are sliders, and `gradient_position` (responsive in 4.2.4) accepts the nine documented values.
 */
export const P15_ELEMENTOR_CONTAINER_RADIAL_GRADIENT_MANIFEST_VERSION = 'p15-elementor-container-radial-gradient-manifest-v2' as const;
export const P15_ELEMENTOR_CONTAINER_RADIAL_GRADIENT_RESULT_VERSION = 'p15-elementor-container-radial-gradient-result-v2' as const;
export const P15_ELEMENTOR_CONTAINER_RADIAL_GRADIENT_POSITIONS = ['center center', 'center left', 'center right', 'top center', 'top left',
  'top right', 'bottom center', 'bottom left', 'bottom right'] as const;
export type P15ContainerRadialGradientPosition = typeof P15_ELEMENTOR_CONTAINER_RADIAL_GRADIENT_POSITIONS[number];
export const P15_ELEMENTOR_CONTAINER_RADIAL_GRADIENT_EVIDENCE = Object.freeze({
  ...P15_ELEMENTOR_CONTAINER_GRADIENT_SOURCE_EVIDENCE,
  acceptedGradientType: 'radial', positionControl: 'gradient_position', positionResponsive: true,
  acceptedPositions: P15_ELEMENTOR_CONTAINER_RADIAL_GRADIENT_POSITIONS,
});

export interface P15ContainerRadialGradientV2 {
  colorA: string; colorB: string; stopA: number; stopB: number; position: P15ContainerRadialGradientPosition;
  tabletStopA?: number; tabletStopB?: number; mobileStopA?: number; mobileStopB?: number;
  tabletPosition?: P15ContainerRadialGradientPosition; mobilePosition?: P15ContainerRadialGradientPosition;
}
export type P15ContainerRadialGradientEntryV2 = PairEntry<P15ContainerRadialGradientV2>;
export type P15ContainerRadialGradientManifestV2 = FamilyManifestV1<{
  manifestVersion: typeof P15_ELEMENTOR_CONTAINER_RADIAL_GRADIENT_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_CONTAINER_RADIAL_GRADIENT_RESULT_VERSION;
  status: string;
  entriesField: 'containers';
  entry: P15ContainerRadialGradientEntryV2;
  summaryField: 'resolvedGradients';
  summary: P15ContainerRadialGradientEntryV2;
  issueCode: string;
  noun: 'Container';
  flags: P15ContainerGradientAuthorityFlag;
}>;
export type P15ContainerRadialGradientResultV2 = P15ContainerGradientResultV2<P15ContainerRadialGradientEntryV2, typeof P15_ELEMENTOR_CONTAINER_RADIAL_GRADIENT_RESULT_VERSION>;

const P15_CONTAINER_RADIAL_GRADIENT_FAMILY = containerGradientFamily<P15ContainerRadialGradientV2>('radial', {
  manifestVersion: P15_ELEMENTOR_CONTAINER_RADIAL_GRADIENT_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_CONTAINER_RADIAL_GRADIENT_RESULT_VERSION,
  evidence: P15_ELEMENTOR_CONTAINER_RADIAL_GRADIENT_EVIDENCE,
  positions: P15_ELEMENTOR_CONTAINER_RADIAL_GRADIENT_POSITIONS,
});

const API = familyApi<P15ContainerRadialGradientResultV2>(P15_CONTAINER_RADIAL_GRADIENT_FAMILY);

export function resolveP15ElementorContainerRadialGradients(sourceValue: unknown, manifestValue: unknown): P15ContainerRadialGradientResultV2 {
  return API.resolve(sourceValue, manifestValue);
}

export function serializeP15ElementorContainerRadialGradientSummary(value: P15ContainerRadialGradientResultV2): string {
  return API.serialize(value);
}
