import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import {
  resolveContainerPropertyFamily,
  serializeContainerPropertyFamilySummary,
  type ContainerFamilyIssue,
  type ContainerFamilyResult,
} from './mapping-engine/container-family-engine';
import type { ValueCodec } from './mapping-engine/codecs';
import { responsiveEnumFamily } from './mapping-engine/families/responsive-layout';
import type { ElementorTemplateV04 } from './template-v04';

export const P15_ELEMENTOR_CONTAINER_HOVER_TRANSITION_MANIFEST_VERSION = 'p15-elementor-container-hover-transition-manifest-v1' as const;
/** The standard engine result (recovery M1.5c); the v1 manifest and every write are unchanged. */
export const P15_ELEMENTOR_CONTAINER_HOVER_TRANSITION_RESULT_VERSION = 'p15-elementor-container-hover-transition-result-v2' as const;
export const P15_ELEMENTOR_CONTAINER_HOVER_TRANSITION_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4', elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  containerSourcePath: 'includes/elements/container.php', containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
  backgroundGroupSourcePath: 'includes/controls/groups/background.php', backgroundGroupSourceBlobSha: 'ac8e1a510ec663f3f428c9f564dc2c5b727435e1',
  acceptedSecondsMin: 0, acceptedSecondsMax: 3, acceptedStep: 0.1,
  keys: ['background_hover_transition', 'background_overlay_hover_transition', 'border_hover_transition'] as const,
});
export const P15_CONTAINER_HOVER_TRANSITION_FAMILIES = ['backgroundHover', 'overlayHover', 'borderHover'] as const;
export type P15ContainerHoverTransitionFamily = typeof P15_CONTAINER_HOVER_TRANSITION_FAMILIES[number];
export interface P15ContainerHoverTransitionEntryV1 { sourceNodeId: string; backgroundHover?: number; overlayHover?: number; borderHover?: number; }
export interface P15ContainerHoverTransitionManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_CONTAINER_HOVER_TRANSITION_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  containers: P15ContainerHoverTransitionEntryV1[];
  transitionInferencePerformed: false;
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}
export interface P15ContainerHoverTransitionSummaryEntryV2 {
  sourceNodeId: string;
  backgroundHover: number | null;
  overlayHover: number | null;
  borderHover: number | null;
}
export interface P15ContainerHoverTransitionResultV2 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_CONTAINER_HOVER_TRANSITION_RESULT_VERSION;
  status: 'BLOCKED_INVALID_SOURCE_IR' | 'BLOCKED_UPSTREAM_GENERATION' | 'REJECTED_INVALID_MANIFEST'
    | 'NO_CONTAINER_HOVER_TRANSITION_OVERRIDES' | 'CONTAINER_HOVER_TRANSITIONS_RESOLVED';
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceContainerCount: number;
  resolvedContainerCount: number;
  resolvedTransitions: P15ContainerHoverTransitionSummaryEntryV2[];
  issues: ContainerFamilyIssue[];
  template: ElementorTemplateV04 | null;
  candidate: ElementorTemplateCandidateArtifactV1 | null;
  transitionInferencePerformed: false;
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
  internalReviewRequired: true;
}

/** Seconds 0..3 in exact 0.1 steps, the Elementor 4.2.4 slider range; written as `{ size, unit: 's' }`. */
const secondsCodec: ValueCodec<number, { size: number; unit: 's' }> = {
  id: 'seconds:0..3/0.1',
  is: (value): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 3
    && Math.round(value * 10) === value * 10,
  snapshot: (value) => value,
  encode: (value) => ({ size: value, unit: 's' }),
};

const [backgroundKey, overlayKey, borderKey] = P15_ELEMENTOR_CONTAINER_HOVER_TRANSITION_EVIDENCE.keys;
const P15_CONTAINER_HOVER_TRANSITION_FAMILY = responsiveEnumFamily({
  id: 'container-hover-transition',
  issuePrefix: 'P15_CONTAINER_HOVER_TRANSITION',
  subject: 'Container hover transition',
  manifestVersion: P15_ELEMENTOR_CONTAINER_HOVER_TRANSITION_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_CONTAINER_HOVER_TRANSITION_RESULT_VERSION,
  maxEntries: 10_000,
  evidence: P15_ELEMENTOR_CONTAINER_HOVER_TRANSITION_EVIDENCE,
  statuses: { none: 'NO_CONTAINER_HOVER_TRANSITION_OVERRIDES', resolved: 'CONTAINER_HOVER_TRANSITIONS_RESOLVED' },
  summaryField: 'resolvedTransitions',
  fields: [
    { field: 'backgroundHover', settingKey: backgroundKey, codec: secondsCodec, toElementor: secondsCodec.encode as (value: never) => unknown, conflictSubject: 'background hover transition' },
    { field: 'overlayHover', settingKey: overlayKey, codec: secondsCodec, toElementor: secondsCodec.encode as (value: never) => unknown, conflictSubject: 'overlay hover transition' },
    { field: 'borderHover', settingKey: borderKey, codec: secondsCodec, toElementor: secondsCodec.encode as (value: never) => unknown, conflictSubject: 'border hover transition' },
  ],
  leadingAuthorityFlags: ['transitionInferencePerformed'],
  entryEnvelopeMessage: 'Each Container hover transition entry may contain only sourceNodeId plus backgroundHover, overlayHover and borderHover seconds.',
  overrideRequiredMessage: 'Each Container hover transition entry must explicitly provide backgroundHover, overlayHover and/or borderHover.',
  valueInvalidMessage: 'Container hover transition seconds must be within 0..3 in exact 0.1 steps.',
});

/** Apply explicit hover transition seconds for Container background, overlay and border; no inference. */
export function resolveP15ElementorContainerHoverTransitions(sourceValue: unknown, manifestValue: unknown): P15ContainerHoverTransitionResultV2 {
  return resolveContainerPropertyFamily(P15_CONTAINER_HOVER_TRANSITION_FAMILY, sourceValue, manifestValue) as unknown as P15ContainerHoverTransitionResultV2;
}

/** Only bounded facts are emitted; private source text and candidate bytes stay out. */
export function serializeP15ElementorContainerHoverTransitionSummary(value: P15ContainerHoverTransitionResultV2): string {
  return serializeContainerPropertyFamilySummary(P15_CONTAINER_HOVER_TRANSITION_FAMILY, value as unknown as ContainerFamilyResult);
}
