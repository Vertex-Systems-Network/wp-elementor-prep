import { resolveP15ElementorButtonTextColors } from './button-text-color-resolution';
import { resolveP15ElementorButtonBackgroundColors } from './button-background-color-resolution';
import { resolveP15ElementorButtonHoverTextColors } from './button-hover-text-color-resolution';
import { resolveP15ElementorButtonHoverBackgroundColors } from './button-hover-background-color-resolution';
import { resolveP15ElementorButtonHoverBorderColors } from './button-hover-border-color-resolution';
import {
  composeFamilies,
  serializeCompositionSummary,
  type CompositionResult,
  type CompositionSpec,
} from './mapping-engine/composer';

export const P15_BUTTON_COLOR_COMPOSITION_VERSION = 'p15-button-color-composition-v1' as const;
export const P15_BUTTON_COLOR_FAMILIES = ['normalText', 'normalBackground', 'hoverText', 'hoverBackground', 'hoverBorder'] as const;
export type P15ButtonColorFamily = typeof P15_BUTTON_COLOR_FAMILIES[number];

export interface P15ButtonColorCompositionManifestV1 {
  schemaVersion: 1; compositionVersion: typeof P15_BUTTON_COLOR_COMPOSITION_VERSION;
  sourceIrFingerprint: string; baseCandidateIdentityDigest: string;
  families: Partial<Record<P15ButtonColorFamily, unknown>>;
  responsiveInferencePerformed: false; figmaMutation: false; networkAccess: false; responsiveClosureClaim: false;
  targetCompatibilityClaim: false; productionAcceptance: false; downloadEnabled: false;
}
export type P15ButtonColorCompositionIssueCode = 'SOURCE_INVALID' | 'BASE_NOT_READY' | 'MANIFEST_INVALID'
  | 'FAMILY_REJECTED' | 'FAMILY_DRIFT' | 'KEY_CONFLICT' | 'TARGET_INVALID';
export type P15ButtonColorCompositionResultV1 = Omit<CompositionResult<P15ButtonColorFamily>, 'compositionVersion' | 'issues'> & {
  compositionVersion: typeof P15_BUTTON_COLOR_COMPOSITION_VERSION;
  issues: Array<{ code: P15ButtonColorCompositionIssueCode; family: P15ButtonColorFamily | null }>;
};

/** Five Button colour families, applied in this order by a whole-tree walk that only lets Button widgets change. */
export const P15_BUTTON_COLOR_COMPOSITION: CompositionSpec<P15ButtonColorFamily> = {
  version: P15_BUTTON_COLOR_COMPOSITION_VERSION,
  families: P15_BUTTON_COLOR_FAMILIES,
  merge: { kind: 'widgets', accepts: (node) => node.elType === 'widget' && node.widgetType === 'button' },
  issuePrefix: '',
  subject: 'Button color',
  refusalIssueCount: 'one',
  steps: {
    normalText: { resolve: resolveP15ElementorButtonTextColors, resolvedStatus: 'BUTTON_TEXT_COLORS_RESOLVED', keys: ['button_text_color'] },
    normalBackground: { resolve: resolveP15ElementorButtonBackgroundColors, resolvedStatus: 'BUTTON_BACKGROUND_COLORS_RESOLVED',
      keys: ['background_background', 'background_color'] },
    hoverText: { resolve: resolveP15ElementorButtonHoverTextColors, resolvedStatus: 'BUTTON_HOVER_TEXT_COLORS_RESOLVED', keys: ['hover_color'] },
    hoverBackground: { resolve: resolveP15ElementorButtonHoverBackgroundColors, resolvedStatus: 'BUTTON_HOVER_BACKGROUND_COLORS_RESOLVED',
      keys: ['button_background_hover_background', 'button_background_hover_color'] },
    hoverBorder: { resolve: resolveP15ElementorButtonHoverBorderColors, resolvedStatus: 'BUTTON_HOVER_BORDER_COLORS_RESOLVED',
      keys: ['button_hover_border_color'] },
  },
};

export function composeP15ButtonColors(sourceValue: unknown, manifestValue: unknown): P15ButtonColorCompositionResultV1 {
  return composeFamilies(P15_BUTTON_COLOR_COMPOSITION, sourceValue, manifestValue) as P15ButtonColorCompositionResultV1;
}

/** Never serialize source text, candidate bytes or caller-provided nested manifests. */
export function serializeP15ButtonColorCompositionSummary(value: P15ButtonColorCompositionResultV1): string {
  return serializeCompositionSummary(P15_BUTTON_COLOR_COMPOSITION, value);
}
