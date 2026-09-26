import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_MAPPING_CAPABILITIES_V1,
  P15_ELEMENTOR_MAPPING_CAPABILITY_REGISTRY_VERSION,
  findP15ElementorMappingCapability,
  serializeP15ElementorMappingCapabilities,
} from '../src/targets/elementor/p15-mapping-capability-registry';

describe('P15 bounded Elementor mapping capability registry', () => {
  it('has a deterministic exact-version inventory and no authority inflation', () => {
    expect(P15_ELEMENTOR_MAPPING_CAPABILITY_REGISTRY_VERSION).toBe('p15-elementor-mapping-capability-registry-v1');
    expect(P15_ELEMENTOR_MAPPING_CAPABILITIES_V1.map((entry) => entry.id)).toEqual([
      'container-layout', 'text-alignment-and-color', 'button-content-and-style',
      'button-responsive-style', 'button-gradients', 'image-reference',
    ]);
    for (const entry of P15_ELEMENTOR_MAPPING_CAPABILITIES_V1) {
      expect(entry.elementorVersion).toBe('4.2.4');
      expect(entry.responsiveInferencePerformed).toBe(false);
      expect(entry.targetCompatibilityClaim).toBe(false);
      expect(entry.productionAcceptance).toBe(false);
    }
  });

  it('keeps normal/hover and responsive families explicitly isolated', () => {
    expect(findP15ElementorMappingCapability('button-gradients')?.sourceStates).toEqual(['normal', 'hover']);
    expect(findP15ElementorMappingCapability('button-gradients')?.breakpoints).toEqual(['desktop', 'tablet', 'mobile']);
    expect(findP15ElementorMappingCapability('button-responsive-style')?.sourceStates).toEqual(['normal']);
    expect(findP15ElementorMappingCapability('unknown')).toBeNull();
  });

  it('serializes repeatably without a caller-controlled field surface', () => {
    expect(serializeP15ElementorMappingCapabilities()).toBe(serializeP15ElementorMappingCapabilities());
    expect(serializeP15ElementorMappingCapabilities()).toContain('button_background_hover_');
  });
});
