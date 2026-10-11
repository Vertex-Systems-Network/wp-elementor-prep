import type { ElementorTemplateV04 } from './template-v04';
import { slugFragment } from '../../core/slug';

/**
 * Partial export as an explicit REVIEW artifact (decision D-049, recovery M2.9a).
 *
 * When a valid document still carries review items, the generator keeps `template: null` and `candidate: null`
 * (nothing is ever presented as ready), and additionally returns this artifact: the partial template plus a
 * machine-readable `reviewItems` list naming every unmapped item, labelled `REVIEW REQUIRED`.
 *
 * Unmapped content is kept as an explicit placeholder, never silently dropped and never replaced by a screenshot,
 * HTML or another widget. The placeholder is an empty Container, hidden on desktop, tablet and mobile so it adds no
 * size or gap to the rendered page, and visible in the Elementor editor with a class naming the reason:
 * - `includes/base/element-base.php` (blob 733769fc3f542d2a32a361fa1fbdb23cebd0f047) `add_hidden_device_controls()`:
 *   switchers `hide_<device>` with prefix class `elementor-` and return value `hidden-<device>`.
 * - `assets/dev/scss/frontend/_visibility.scss` (blob d5702c907f43af98bf92af94f1d67f33aa1d9716):
 *   `.elementor .elementor-hidden-<device> { display: none }` inside each device's range.
 * - `includes/elements/container.php` (blob 3486766b9565af99536ae205ed1936bb155daed0) `css_classes`.
 * The three default devices are hidden; a site that activates extra breakpoints (laptop, widescreen, …) would show
 * the empty placeholder there, which only matters while the artifact is under review anyway.
 *
 * Bounds failures (depth or node limits) are BLOCKED: they produce no artifact at all.
 */
export const P15_REVIEW_ARTIFACT_VERSION = 'p15-elementor-review-artifact-v1' as const;
export const P15_BLOCKING_REVIEW_CODES: readonly string[] = ['DEPTH_LIMIT_EXCEEDED', 'NODE_LIMIT_EXCEEDED'];

export interface P15ElementorReviewItem {
  sourceNodeId: string;
  reasonCode: string;
  detail: string;
  /** The placeholder Container for unmapped content, or the generated element whose property is unmapped. */
  elementId: string | null;
  kind: 'placeholder' | 'unmapped-property';
}

export interface P15ElementorReviewArtifactV1 {
  schemaVersion: 1;
  artifactVersion: typeof P15_REVIEW_ARTIFACT_VERSION;
  label: 'REVIEW REQUIRED';
  readiness: 'REVIEW_REQUIRED';
  targetImportReady: false;
  template: ElementorTemplateV04;
  reviewItems: P15ElementorReviewItem[];
}

/** Lowercase CSS class fragment built only from [a-z0-9-]. */
function classFragment(value: string): string {
  return slugFragment(value, { lowercase: true, maxLength: 64 }) || 'unknown';
}

export function reviewPlaceholderSettings(reasonCode: string): Record<string, unknown> {
  return {
    hide_desktop: 'hidden-desktop',
    hide_tablet: 'hidden-tablet',
    hide_mobile: 'hidden-mobile',
    css_classes: `p15-review-placeholder p15-review-${classFragment(reasonCode)}`,
  };
}
