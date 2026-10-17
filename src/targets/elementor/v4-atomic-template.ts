/**
 * Elementor v4 Atomic template contract (recovery M6.4) and its own validator.
 *
 * Shape and prop envelopes follow docs/R0_ELEMENTOR_V4_ATOMIC_2026-10-17.md (Elementor source a1680ca). This is a separate
 * contract from the v3 Container template (`template-v04.ts`): no `container` elType, no classic setting keys.
 */
export const ELEMENTOR_V4_ATOMIC_ADAPTER_VERSION = 'elementor-v4-atomic-v1' as const;
export const ELEMENTOR_V4_ATOMIC_MAX_ELEMENTS = 10_000;
export const ELEMENTOR_V4_ATOMIC_MAX_DEPTH = 64;

export const ATOMIC_LAYOUT_TYPES = ['e-flexbox', 'e-div-block'] as const;
export const ATOMIC_WIDGET_TYPES = ['e-heading', 'e-paragraph', 'e-image', 'e-button'] as const;
export const ATOMIC_PROP_KEYS = [
  'string', 'number', 'boolean', 'color', 'url', 'classes', 'size', 'dimensions', 'image', 'image-src',
  'image-attachment-id', 'link', 'background', 'escaped-html',
] as const;
export type AtomicPropKey = (typeof ATOMIC_PROP_KEYS)[number];
export type AtomicBreakpoint = 'desktop' | 'tablet' | 'mobile';

export interface AtomicProp {
  $$type: AtomicPropKey;
  value: unknown;
}

export interface AtomicStyleVariant {
  meta: { breakpoint: AtomicBreakpoint; state: null };
  props: Record<string, AtomicProp>;
}

export interface AtomicLocalStyle {
  id: string;
  type: 'class';
  label: 'local';
  variants: AtomicStyleVariant[];
}

interface AtomicElementBase {
  id: string;
  settings: Record<string, AtomicProp>;
  isLocked: false;
  editor_settings: [];
  styles: Record<string, AtomicLocalStyle> | [];
  version: '0.0';
}

export interface AtomicLayoutElement extends AtomicElementBase {
  elType: (typeof ATOMIC_LAYOUT_TYPES)[number];
  elements: AtomicElement[];
}

export interface AtomicWidgetElement extends AtomicElementBase {
  elType: 'widget';
  widgetType: (typeof ATOMIC_WIDGET_TYPES)[number];
  elements: [];
}

export type AtomicElement = AtomicLayoutElement | AtomicWidgetElement;

export interface ElementorV4AtomicTemplate {
  title: string;
  type: 'page' | 'section';
  version: '0.4';
  page_settings: [];
  content: AtomicElement[];
}

export interface AtomicValidationIssue {
  code: 'ATOMIC_SHAPE_INVALID' | 'ATOMIC_ELEMENT_TYPE_UNSUPPORTED' | 'ATOMIC_PROP_INVALID' | 'ATOMIC_ID_DUPLICATE'
    | 'ATOMIC_STYLE_INVALID' | 'ATOMIC_CLASS_REFERENCE_INVALID' | 'ATOMIC_LIMIT_EXCEEDED';
  path: string;
  message: string;
}

export interface AtomicValidationResult {
  valid: boolean;
  elementCount: number;
  issues: AtomicValidationIssue[];
}

const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const emptyOrRecord = (value: unknown): boolean => (Array.isArray(value) && value.length === 0) || record(value);

function isProp(value: unknown): value is AtomicProp {
  return record(value)
    && Object.keys(value).length === 2
    && typeof value.$$type === 'string'
    && (ATOMIC_PROP_KEYS as readonly string[]).includes(value.$$type)
    && 'value' in value
    && value.value !== undefined;
}

/** Recursively checks a typed value: nested objects that carry `$$type` must also be valid envelopes. */
function propIssues(value: unknown, path: string, issues: AtomicValidationIssue[]): void {
  if (!isProp(value)) {
    issues.push({ code: 'ATOMIC_PROP_INVALID', path, message: 'Every atomic setting/style value must be a known {$$type, value} envelope.' });
    return;
  }
  const inner = value.value;
  if (record(inner)) {
    for (const [key, child] of Object.entries(inner)) {
      if (record(child) && '$$type' in child) propIssues(child, `${path}.value.${key}`, issues);
    }
  }
}

export function validateElementorV4AtomicTemplate(value: unknown): AtomicValidationResult {
  const issues: AtomicValidationIssue[] = [];
  const ids = new Set<string>();
  let elementCount = 0;
  if (!record(value) || typeof value.title !== 'string' || (value.type !== 'page' && value.type !== 'section')
    || value.version !== '0.4' || !Array.isArray(value.page_settings) || value.page_settings.length !== 0 || !Array.isArray(value.content)) {
    return { valid: false, elementCount: 0, issues: [{ code: 'ATOMIC_SHAPE_INVALID', path: '$', message: 'Template envelope is invalid.' }] };
  }

  const visit = (node: unknown, path: string, depth: number): void => {
    elementCount += 1;
    if (elementCount > ELEMENTOR_V4_ATOMIC_MAX_ELEMENTS || depth > ELEMENTOR_V4_ATOMIC_MAX_DEPTH) {
      issues.push({ code: 'ATOMIC_LIMIT_EXCEEDED', path, message: 'Element count or depth limit exceeded.' });
      return;
    }
    if (!record(node) || typeof node.id !== 'string' || !/^[0-9a-f]{8}$/.test(node.id) || !record(node.settings)
      || node.isLocked !== false || !Array.isArray(node.editor_settings) || node.version !== '0.0'
      || !emptyOrRecord(node.styles) || !Array.isArray(node.elements)) {
      issues.push({ code: 'ATOMIC_SHAPE_INVALID', path, message: 'Atomic element shape is invalid.' });
      return;
    }
    if (ids.has(node.id)) issues.push({ code: 'ATOMIC_ID_DUPLICATE', path: `${path}.id`, message: `Duplicate element id ${node.id}.` });
    ids.add(node.id);

    const isLayout = (ATOMIC_LAYOUT_TYPES as readonly unknown[]).includes(node.elType);
    const isWidget = node.elType === 'widget' && (ATOMIC_WIDGET_TYPES as readonly unknown[]).includes(node.widgetType);
    if (!isLayout && !isWidget) {
      issues.push({ code: 'ATOMIC_ELEMENT_TYPE_UNSUPPORTED', path, message: `Unsupported atomic element ${String(node.elType)}/${String(node.widgetType)}.` });
    }
    if (isWidget && node.elements.length > 0) issues.push({ code: 'ATOMIC_SHAPE_INVALID', path, message: 'Atomic widgets have no children.' });
    if (isLayout && 'widgetType' in node) issues.push({ code: 'ATOMIC_SHAPE_INVALID', path, message: 'Layout elements carry no widgetType.' });

    for (const [key, prop] of Object.entries(node.settings)) propIssues(prop, `${path}.settings.${key}`, issues);

    const styleIds = new Set<string>();
    if (record(node.styles)) {
      for (const [styleId, style] of Object.entries(node.styles)) {
        const stylePath = `${path}.styles.${styleId}`;
        if (!record(style) || style.id !== styleId || style.type !== 'class' || style.label !== 'local'
          || !styleId.startsWith(`e-${node.id}-`) || !Array.isArray(style.variants) || style.variants.length === 0) {
          issues.push({ code: 'ATOMIC_STYLE_INVALID', path: stylePath, message: 'Local style shape is invalid.' });
          continue;
        }
        styleIds.add(styleId);
        style.variants.forEach((variant, index) => {
          const variantPath = `${stylePath}.variants.${index}`;
          if (!record(variant) || !record(variant.meta) || !['desktop', 'tablet', 'mobile'].includes(variant.meta.breakpoint as string)
            || variant.meta.state !== null || !record(variant.props)) {
            issues.push({ code: 'ATOMIC_STYLE_INVALID', path: variantPath, message: 'Style variant shape is invalid.' });
            return;
          }
          for (const [prop, propValue] of Object.entries(variant.props)) {
            if (!/^[a-z][a-z-]*$/.test(prop)) issues.push({ code: 'ATOMIC_STYLE_INVALID', path: `${variantPath}.props.${prop}`, message: 'Style props are CSS property names.' });
            propIssues(propValue, `${variantPath}.props.${prop}`, issues);
          }
        });
      }
    }
    const classes = node.settings.classes;
    if (classes !== undefined) {
      const list = isProp(classes) && classes.$$type === 'classes' && Array.isArray(classes.value) ? classes.value : null;
      if (!list || list.some((id) => typeof id !== 'string' || !styleIds.has(id))) {
        issues.push({ code: 'ATOMIC_CLASS_REFERENCE_INVALID', path: `${path}.settings.classes`, message: 'classes must reference this element\'s local styles.' });
      }
    }
    node.elements.forEach((child, index) => visit(child, `${path}.elements.${index}`, depth + 1));
  };

  value.content.forEach((node, index) => visit(node, `$.content.${index}`, 1));
  return { valid: issues.length === 0, elementCount, issues };
}
