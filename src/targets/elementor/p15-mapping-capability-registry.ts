/**
 * Read-only inventory of P15's deliberately bounded Elementor write families.
 * This is not a compatibility or runtime-import claim.
 */
export const P15_ELEMENTOR_MAPPING_CAPABILITY_REGISTRY_VERSION =
  'p15-elementor-mapping-capability-registry-v1' as const;

export type P15ElementorMappingFamily =
  | 'container-layout'
  | 'text-alignment-and-color'
  | 'button-content-and-style'
  | 'button-responsive-style'
  | 'button-gradients'
  | 'image-reference';

export interface P15ElementorMappingCapabilityV1 {
  id: P15ElementorMappingFamily;
  elementorVersion: '4.2.4';
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d';
  sourceStates: readonly ('normal' | 'hover')[];
  breakpoints: readonly ('desktop' | 'tablet' | 'mobile')[];
  supportedSettingPrefixes: readonly string[];
  responsiveInferencePerformed: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
}

const capability = (entry: P15ElementorMappingCapabilityV1): P15ElementorMappingCapabilityV1 => Object.freeze({
  ...entry,
  sourceStates: Object.freeze([...entry.sourceStates]),
  breakpoints: Object.freeze([...entry.breakpoints]),
  supportedSettingPrefixes: Object.freeze([...entry.supportedSettingPrefixes]),
});

export const P15_ELEMENTOR_MAPPING_CAPABILITIES_V1: readonly P15ElementorMappingCapabilityV1[] = Object.freeze([
  capability({ id: 'container-layout', elementorVersion: '4.2.4', elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d', sourceStates: ['normal'], breakpoints: ['desktop', 'tablet', 'mobile'], supportedSettingPrefixes: ['flex_', 'container_', 'padding', 'margin', 'border_radius', 'min_height', 'width', 'z_index'], responsiveInferencePerformed: false, targetCompatibilityClaim: false, productionAcceptance: false }),
  capability({ id: 'text-alignment-and-color', elementorVersion: '4.2.4', elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d', sourceStates: ['normal'], breakpoints: ['desktop', 'tablet', 'mobile'], supportedSettingPrefixes: ['align', 'title_color', 'text_color'], responsiveInferencePerformed: false, targetCompatibilityClaim: false, productionAcceptance: false }),
  capability({ id: 'button-content-and-style', elementorVersion: '4.2.4', elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d', sourceStates: ['normal', 'hover'], breakpoints: ['desktop'], supportedSettingPrefixes: ['text', 'link', 'align', 'button_', 'text_shadow', 'border_'], responsiveInferencePerformed: false, targetCompatibilityClaim: false, productionAcceptance: false }),
  capability({ id: 'button-responsive-style', elementorVersion: '4.2.4', elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d', sourceStates: ['normal'], breakpoints: ['desktop', 'tablet', 'mobile'], supportedSettingPrefixes: ['align', 'content_align', 'text_padding', 'typography_'], responsiveInferencePerformed: false, targetCompatibilityClaim: false, productionAcceptance: false }),
  capability({ id: 'button-gradients', elementorVersion: '4.2.4', elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d', sourceStates: ['normal', 'hover'], breakpoints: ['desktop', 'tablet', 'mobile'], supportedSettingPrefixes: ['background_', 'button_background_hover_'], responsiveInferencePerformed: false, targetCompatibilityClaim: false, productionAcceptance: false }),
  capability({ id: 'image-reference', elementorVersion: '4.2.4', elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d', sourceStates: ['normal'], breakpoints: ['desktop'], supportedSettingPrefixes: ['image'], responsiveInferencePerformed: false, targetCompatibilityClaim: false, productionAcceptance: false }),
]);

export function findP15ElementorMappingCapability(id: string): P15ElementorMappingCapabilityV1 | null {
  return P15_ELEMENTOR_MAPPING_CAPABILITIES_V1.find((entry) => entry.id === id) ?? null;
}

export function serializeP15ElementorMappingCapabilities(): string {
  return `${JSON.stringify(P15_ELEMENTOR_MAPPING_CAPABILITIES_V1, null, 2)}\n`;
}
