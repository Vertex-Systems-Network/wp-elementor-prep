import { intRangeCodec, literalCodec, numberEnumCodec, elementorPxSlider, enumCodec } from '../codecs';
import { crossAlignmentCodec, toElementorFlexAlignment } from './responsive-layout';

/**
 * Codecs and encoders for the responsive flex-item and sizing families (recovery M1.3c).
 * The family definitions live next to each resolver's public contract and use the shared
 * `responsiveEnumFamily` factory; this module holds the value vocabulary they share.
 */
export const alignSelfCodec = crossAlignmentCodec;
export const toElementorAlignSelf = toElementorFlexAlignment;
export const customSelectionCodec = literalCodec(true);
export const binaryFlexFactorCodec = numberEnumCodec([0, 1] as const);
export const orderPresetCodec = enumCodec(['start', 'end'] as const);
export const flexBasisPxCodec = intRangeCodec({ min: 0, max: 1000 });
export const flexOrderValueCodec = intRangeCodec({ min: -1000, max: 1000 });

/** Elementor `_flex_basis` stores `{ size, unit }` (size first), unlike the slider shape. */
export function elementorFlexBasisPx(size: number): { size: number; unit: 'px' } {
  return { size, unit: 'px' };
}

export const toElementorCustomSelection = (): 'custom' => 'custom';
export { elementorPxSlider };
