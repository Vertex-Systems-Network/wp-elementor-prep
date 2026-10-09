import { resolveP15ElementorContainerBorderStyles } from './container-border-style-resolution';
import { resolveP15ElementorContainerHoverBorderStyles } from './container-hover-border-style-resolution';
import { resolveP15ElementorContainerOverlayColor } from './container-overlay-color-resolution';
import { resolveP15ElementorContainerHoverOverlayColor } from './container-hover-overlay-color-resolution';
import { resolveP15ContainerBoxShadows } from './container-box-shadow-resolution';
import { resolveP15ElementorContainerHoverBackgroundColor } from './container-hover-background-color-resolution';
import { resolveP15ElementorResponsiveContainerBorderRadius } from './responsive-border-radius-resolution';
import { resolveP15ElementorResponsiveContainerHoverBorderRadius } from './responsive-hover-border-radius-resolution';
import {
  composeFamilies,
  serializeCompositionSummary,
  type ComposedFamilyResult,
  type CompositionResult,
  type CompositionSpec,
} from './mapping-engine/composer';

export const P15_CONTAINER_STYLE_COMPOSITION_VERSION = 'p15-container-style-composition-v3' as const;
export const P15_CONTAINER_STYLE_FAMILIES = [
  'normalBorder', 'hoverBorder', 'normalOverlay', 'hoverOverlay', 'boxShadows', 'hoverBackground',
  'responsiveRadius', 'responsiveHoverRadius',
] as const;
export type P15ContainerStyleFamily = typeof P15_CONTAINER_STYLE_FAMILIES[number];

export interface P15ContainerStyleCompositionManifestV1 {
  schemaVersion: 1;
  compositionVersion: typeof P15_CONTAINER_STYLE_COMPOSITION_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  families: Partial<Record<P15ContainerStyleFamily, unknown>>;
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ContainerStyleCompositionIssueCode =
  | 'P15_CONTAINER_COMPOSITION_SOURCE_INVALID'
  | 'P15_CONTAINER_COMPOSITION_BASE_NOT_READY'
  | 'P15_CONTAINER_COMPOSITION_MANIFEST_INVALID'
  | 'P15_CONTAINER_COMPOSITION_BINDING_MISMATCH'
  | 'P15_CONTAINER_COMPOSITION_FAMILY_REJECTED'
  | 'P15_CONTAINER_COMPOSITION_FAMILY_DRIFT'
  | 'P15_CONTAINER_COMPOSITION_KEY_CONFLICT'
  | 'P15_CONTAINER_COMPOSITION_TARGET_INVALID';

export interface P15ContainerStyleCompositionIssueV1 {
  code: P15ContainerStyleCompositionIssueCode;
  family: P15ContainerStyleFamily | null;
}

export type P15ContainerStyleCompositionResultV1 = Omit<CompositionResult<P15ContainerStyleFamily>, 'compositionVersion' | 'issues'> & {
  compositionVersion: typeof P15_CONTAINER_STYLE_COMPOSITION_VERSION;
  issues: P15ContainerStyleCompositionIssueV1[];
};

const step = (resolve: (source: unknown, manifest: unknown) => ComposedFamilyResult, resolvedStatus: string, keys: readonly string[]) =>
  ({ resolve, resolvedStatus, keys });

/** Eight Container style families, applied in this order through the container binding. */
export const P15_CONTAINER_STYLE_COMPOSITION: CompositionSpec<P15ContainerStyleFamily> = {
  version: P15_CONTAINER_STYLE_COMPOSITION_VERSION,
  families: P15_CONTAINER_STYLE_FAMILIES,
  merge: { kind: 'containers' },
  issuePrefix: 'P15_CONTAINER_COMPOSITION_',
  subject: 'Container style',
  refusalIssueCount: 'some',
  steps: {
    normalBorder: step(resolveP15ElementorContainerBorderStyles, 'CONTAINER_BORDER_STYLES_RESOLVED',
      ['border_border', 'border_color', 'border_width', 'border_width_tablet', 'border_width_mobile']),
    hoverBorder: step(resolveP15ElementorContainerHoverBorderStyles, 'CONTAINER_HOVER_BORDER_STYLES_RESOLVED',
      ['border_hover_border', 'border_hover_color', 'border_hover_width', 'border_hover_width_tablet', 'border_hover_width_mobile']),
    normalOverlay: step(resolveP15ElementorContainerOverlayColor, 'CONTAINER_OVERLAY_COLOR_RESOLVED',
      ['background_overlay_background', 'background_overlay_color', 'background_overlay_opacity', 'background_overlay_opacity_tablet', 'background_overlay_opacity_mobile']),
    hoverOverlay: step(resolveP15ElementorContainerHoverOverlayColor, 'CONTAINER_HOVER_OVERLAY_COLOR_RESOLVED',
      ['background_overlay_hover_background', 'background_overlay_hover_color', 'background_overlay_hover_opacity', 'background_overlay_hover_opacity_tablet', 'background_overlay_hover_opacity_mobile']),
    boxShadows: step(resolveP15ContainerBoxShadows, 'CONTAINER_BOX_SHADOWS_RESOLVED',
      ['box_shadow_box_shadow_type', 'box_shadow_box_shadow', 'box_shadow_box_shadow_position',
        'box_shadow_hover_box_shadow_type', 'box_shadow_hover_box_shadow', 'box_shadow_hover_box_shadow_position']),
    hoverBackground: step(resolveP15ElementorContainerHoverBackgroundColor, 'CONTAINER_HOVER_BACKGROUND_COLOR_RESOLVED',
      ['background_hover_background', 'background_hover_color']),
    responsiveRadius: step(resolveP15ElementorResponsiveContainerBorderRadius, 'RESPONSIVE_BORDER_RADIUS_RESOLVED',
      ['border_radius_tablet', 'border_radius_mobile']),
    responsiveHoverRadius: step(resolveP15ElementorResponsiveContainerHoverBorderRadius, 'RESPONSIVE_HOVER_BORDER_RADIUS_RESOLVED',
      ['border_radius_hover_tablet', 'border_radius_hover_mobile']),
  },
};

/** Re-run each exact resolver against one source and merge only its newly added, allowlisted Container settings. */
export function composeP15ContainerStyles(sourceValue: unknown, manifestValue: unknown): P15ContainerStyleCompositionResultV1 {
  return composeFamilies(P15_CONTAINER_STYLE_COMPOSITION, sourceValue, manifestValue) as P15ContainerStyleCompositionResultV1;
}

/** No source text, candidate bytes, or raw caller-supplied evidence is serialized. */
export function serializeP15ContainerStyleCompositionSummary(value: P15ContainerStyleCompositionResultV1): string {
  return serializeCompositionSummary(P15_CONTAINER_STYLE_COMPOSITION, value);
}
