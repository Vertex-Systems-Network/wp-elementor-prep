import { composeP15ButtonColors, P15_BUTTON_COLOR_COMPOSITION } from './button-color-composition';
import { composeP15ContainerStyles, P15_CONTAINER_STYLE_COMPOSITION } from './container-style-composition';
import {
  composeFamilies,
  serializeCompositionSummary,
  type CompositionResult,
  type CompositionSpec,
  type CompositionStep,
} from './mapping-engine/composer';
import { resolveP15ElementorResponsiveContainerAlignContent, P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_EVIDENCE } from './responsive-align-content-resolution';
import { resolveP15ElementorResponsiveContainerAlignments, P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_EVIDENCE } from './responsive-alignment-resolution';
import { resolveP15ElementorResponsiveContainerDirections, P15_ELEMENTOR_RESPONSIVE_DIRECTION_EVIDENCE } from './responsive-direction-resolution';
import { resolveP15ElementorResponsiveContainerGaps, P15_ELEMENTOR_RESPONSIVE_GAP_EVIDENCE } from './responsive-gap-resolution';
import { resolveP15ElementorResponsiveContainerMargin, P15_ELEMENTOR_RESPONSIVE_MARGIN_EVIDENCE } from './responsive-margin-resolution';
import { resolveP15ElementorResponsiveContainerPadding, P15_ELEMENTOR_RESPONSIVE_PADDING_EVIDENCE } from './responsive-padding-resolution';
import { resolveP15ElementorResponsiveContainerWraps, P15_ELEMENTOR_RESPONSIVE_WRAP_EVIDENCE } from './responsive-wrap-resolution';
import { resolveP15ElementorResponsiveElementOrder, P15_ELEMENTOR_RESPONSIVE_ELEMENT_ORDER_EVIDENCE } from './responsive-element-order-resolution';
import { resolveP15ElementorResponsiveVisibility, P15_ELEMENTOR_RESPONSIVE_VISIBILITY_EVIDENCE } from './responsive-visibility-resolution';
import { resolveP15ElementorResponsiveTextTypography, P15_ELEMENTOR_RESPONSIVE_TEXT_TYPOGRAPHY_EVIDENCE } from './responsive-text-typography-resolution';
import { resolveP15ElementorResponsiveTextAlignments, P15_ELEMENTOR_RESPONSIVE_TEXT_ALIGNMENT_EVIDENCE } from './responsive-text-alignment-resolution';
import { resolveP15ElementorResponsiveButtonAlignments, P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_EVIDENCE } from './responsive-button-alignment-resolution';
import type { ElementorElementV04 } from './template-v04';

/**
 * Page composition (recovery M1.5d): one ordered composer call applies the responsive container
 * layout families, the Container style composition and the Button colour composition to one tree.
 *
 * Every step is still its own exact resolver bound to the same source and base candidate. Layout runs
 * first in Elementor control order; align-content is chained on wrap, so it sees the exact wrap result.
 * Key ownership is single across the whole page: no step may write a key another step (or the base) owns.
 */
export const P15_PAGE_COMPOSITION_VERSION = 'p15-elementor-page-composition-v1' as const;
export const P15_PAGE_COMPOSITION_FAMILIES = [
  'direction', 'wrap', 'alignContent', 'alignment', 'gap', 'padding', 'margin', 'containerStyle', 'buttonColors',
  // Recovery M4.3b: responsive presence and order on any element (Container or core widget).
  'visibility', 'elementOrder',
  // Recovery M4.3c: responsive widget typography metrics and alignment.
  'textTypography', 'textAlignment', 'buttonAlignment',
] as const;
export type P15PageCompositionFamily = typeof P15_PAGE_COMPOSITION_FAMILIES[number];
export type P15PageCompositionResultV1 = CompositionResult<P15PageCompositionFamily>;

const isContainer = (node: ElementorElementV04): boolean => node.elType === 'container';
const isButton = (node: ElementorElementV04): boolean => node.elType === 'widget' && node.widgetType === 'button';
const isElement = (node: ElementorElementV04): boolean => node.elType === 'container' || node.elType === 'widget';
const isTextWidget = (node: ElementorElementV04): boolean => node.elType === 'widget' && (node.widgetType === 'heading' || node.widgetType === 'text-editor');
const isTypographyWidget = (node: ElementorElementV04): boolean => isTextWidget(node) || isButton(node);
const responsiveKeys = (evidence: { tabletSettingKey: string; mobileSettingKey: string }): string[] =>
  [evidence.tabletSettingKey, evidence.mobileSettingKey];
/** Every key a nested composition may add: the union of its own steps' allowlists. */
const compositionKeys = (spec: CompositionSpec<string>): string[] => Object.values<CompositionStep>(spec.steps).flatMap((step) => step.keys);

const containerStep = (resolve: CompositionStep['resolve'], resolvedStatus: string, keys: readonly string[]): CompositionStep =>
  ({ resolve, resolvedStatus, keys, accepts: isContainer });

export const P15_PAGE_COMPOSITION: CompositionSpec<P15PageCompositionFamily> = {
  version: P15_PAGE_COMPOSITION_VERSION,
  families: P15_PAGE_COMPOSITION_FAMILIES,
  merge: { kind: 'widgets', accepts: isContainer },
  issuePrefix: 'P15_PAGE_COMPOSITION_',
  subject: 'Page',
  refusalIssueCount: 'one',
  steps: {
    direction: containerStep(resolveP15ElementorResponsiveContainerDirections, 'RESPONSIVE_DIRECTIONS_RESOLVED',
      responsiveKeys(P15_ELEMENTOR_RESPONSIVE_DIRECTION_EVIDENCE)),
    wrap: containerStep(resolveP15ElementorResponsiveContainerWraps, 'RESPONSIVE_WRAPS_RESOLVED',
      responsiveKeys(P15_ELEMENTOR_RESPONSIVE_WRAP_EVIDENCE)),
    alignContent: {
      ...containerStep((source, manifest, manifests) => resolveP15ElementorResponsiveContainerAlignContent(source, manifests.wrap, manifest),
        'RESPONSIVE_ALIGN_CONTENT_RESOLVED', responsiveKeys(P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_EVIDENCE)),
      after: 'wrap',
      baseDigestField: 'wrappedCandidateIdentityDigest',
    },
    alignment: containerStep(resolveP15ElementorResponsiveContainerAlignments, 'RESPONSIVE_ALIGNMENTS_RESOLVED', [
      P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_EVIDENCE.tabletAlignSettingKey, P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_EVIDENCE.mobileAlignSettingKey,
      P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_EVIDENCE.tabletJustifySettingKey, P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_EVIDENCE.mobileJustifySettingKey]),
    gap: containerStep(resolveP15ElementorResponsiveContainerGaps, 'RESPONSIVE_GAPS_RESOLVED', responsiveKeys(P15_ELEMENTOR_RESPONSIVE_GAP_EVIDENCE)),
    padding: containerStep(resolveP15ElementorResponsiveContainerPadding, 'RESPONSIVE_PADDING_RESOLVED', responsiveKeys(P15_ELEMENTOR_RESPONSIVE_PADDING_EVIDENCE)),
    margin: containerStep(resolveP15ElementorResponsiveContainerMargin, 'RESPONSIVE_MARGIN_RESOLVED', responsiveKeys(P15_ELEMENTOR_RESPONSIVE_MARGIN_EVIDENCE)),
    containerStyle: containerStep(composeP15ContainerStyles as CompositionStep['resolve'], 'RESOLVED',
      compositionKeys(P15_CONTAINER_STYLE_COMPOSITION as CompositionSpec<string>)),
    buttonColors: { resolve: composeP15ButtonColors as CompositionStep['resolve'], resolvedStatus: 'RESOLVED',
      keys: compositionKeys(P15_BUTTON_COLOR_COMPOSITION as CompositionSpec<string>), accepts: isButton },
    visibility: { resolve: resolveP15ElementorResponsiveVisibility, resolvedStatus: 'RESPONSIVE_VISIBILITY_RESOLVED', accepts: isElement,
      keys: [P15_ELEMENTOR_RESPONSIVE_VISIBILITY_EVIDENCE.desktopSettingKey, P15_ELEMENTOR_RESPONSIVE_VISIBILITY_EVIDENCE.tabletSettingKey,
        P15_ELEMENTOR_RESPONSIVE_VISIBILITY_EVIDENCE.mobileSettingKey] },
    elementOrder: { resolve: resolveP15ElementorResponsiveElementOrder, resolvedStatus: 'RESPONSIVE_ELEMENT_ORDER_RESOLVED', accepts: isElement,
      keys: [P15_ELEMENTOR_RESPONSIVE_ELEMENT_ORDER_EVIDENCE.tabletOrderSettingKey, P15_ELEMENTOR_RESPONSIVE_ELEMENT_ORDER_EVIDENCE.mobileOrderSettingKey,
        P15_ELEMENTOR_RESPONSIVE_ELEMENT_ORDER_EVIDENCE.tabletCustomOrderSettingKey, P15_ELEMENTOR_RESPONSIVE_ELEMENT_ORDER_EVIDENCE.mobileCustomOrderSettingKey] },
    textTypography: { resolve: resolveP15ElementorResponsiveTextTypography, resolvedStatus: 'RESPONSIVE_TEXT_TYPOGRAPHY_RESOLVED', accepts: isTypographyWidget,
      keys: [P15_ELEMENTOR_RESPONSIVE_TEXT_TYPOGRAPHY_EVIDENCE.starterSettingKey, ...Object.values(P15_ELEMENTOR_RESPONSIVE_TEXT_TYPOGRAPHY_EVIDENCE.settingKeys)] },
    textAlignment: { resolve: resolveP15ElementorResponsiveTextAlignments, resolvedStatus: 'RESPONSIVE_TEXT_ALIGNMENTS_RESOLVED', accepts: isTextWidget,
      keys: responsiveKeys(P15_ELEMENTOR_RESPONSIVE_TEXT_ALIGNMENT_EVIDENCE) },
    buttonAlignment: { resolve: resolveP15ElementorResponsiveButtonAlignments, resolvedStatus: 'RESPONSIVE_BUTTON_ALIGNMENTS_RESOLVED', accepts: isButton,
      keys: responsiveKeys(P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_EVIDENCE) },
  },
};

/** Apply any subset of the page families, in fixed order, to one candidate built from the review-free base. */
export function composeP15ElementorPage(sourceValue: unknown, manifestValue: unknown): P15PageCompositionResultV1 {
  return composeFamilies(P15_PAGE_COMPOSITION, sourceValue, manifestValue);
}

/** Identities, applied families and issue codes only; no source text, candidate bytes or nested manifests. */
export function serializeP15ElementorPageCompositionSummary(value: P15PageCompositionResultV1): string {
  return serializeCompositionSummary(P15_PAGE_COMPOSITION, value);
}
