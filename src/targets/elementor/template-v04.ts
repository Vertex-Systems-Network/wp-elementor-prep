export const ELEMENTOR_TEMPLATE_CONTRACT_VERSION = 'elementor-template-v0.4-container-v1' as const;
export const ELEMENTOR_TEMPLATE_DATA_VERSION = '0.4' as const;
export const ELEMENTOR_TEMPLATE_MAX_ELEMENTS = 10_000;
export const ELEMENTOR_TEMPLATE_MAX_DEPTH = 64;

export type ElementorSettingsV04 = [] | Record<string, unknown>;

export interface ElementorContainerV04 {
  id: string;
  elType: 'container';
  isInner: boolean;
  settings: ElementorSettingsV04;
  elements: ElementorElementV04[];
}

export interface ElementorWidgetV04 {
  id: string;
  elType: 'widget';
  widgetType: string;
  isInner: boolean;
  settings: ElementorSettingsV04;
  elements: ElementorElementV04[];
}

export type ElementorElementV04 = ElementorContainerV04 | ElementorWidgetV04;

export interface ElementorTemplateV04 {
  title: string;
  type: string;
  version: typeof ELEMENTOR_TEMPLATE_DATA_VERSION;
  page_settings: ElementorSettingsV04;
  content: ElementorElementV04[];
}

export type ElementorTemplateValidationCode =
  | 'P15_DOCUMENT_NOT_OBJECT'
  | 'P15_TITLE_REQUIRED'
  | 'P15_DOCUMENT_TYPE_REQUIRED'
  | 'P15_UNSUPPORTED_DOCUMENT_VERSION'
  | 'P15_PAGE_SETTINGS_INVALID'
  | 'P15_CONTENT_INVALID'
  | 'P15_ELEMENT_NOT_OBJECT'
  | 'P15_ELEMENT_ID_REQUIRED'
  | 'P15_DUPLICATE_ELEMENT_ID'
  | 'P15_IS_INNER_INVALID'
  | 'P15_SETTINGS_INVALID'
  | 'P15_ELEMENTS_INVALID'
  | 'P15_WIDGET_TYPE_REQUIRED'
  | 'P15_LEGACY_ELEMENT_UNSUPPORTED'
  | 'P15_ATOMIC_ELEMENT_UNSUPPORTED'
  | 'P15_ELEMENT_TYPE_UNSUPPORTED'
  | 'P15_ELEMENT_LIMIT_EXCEEDED'
  | 'P15_DEPTH_LIMIT_EXCEEDED';

export interface ElementorTemplateValidationIssue {
  code: ElementorTemplateValidationCode;
  path: string;
  message: string;
}

export interface ElementorTemplateValidationResult {
  contractVersion: typeof ELEMENTOR_TEMPLATE_CONTRACT_VERSION;
  valid: boolean;
  documentVersion: string | null;
  elementCount: number;
  containerCount: number;
  widgetCount: number;
  widgetTypes: string[];
  issues: ElementorTemplateValidationIssue[];
}

interface ValidationState {
  issues: ElementorTemplateValidationIssue[];
  ids: Set<string>;
  widgetTypes: Set<string>;
  elementCount: number;
  containerCount: number;
  widgetCount: number;
  elementLimitReported: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nonEmptyBoundedString(value: unknown, maxLength = 512): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
}

function pushIssue(
  state: ValidationState,
  code: ElementorTemplateValidationCode,
  path: string,
  message: string,
): void {
  state.issues.push({ code, path, message });
}

function validSettingsShape(value: unknown): value is ElementorSettingsV04 {
  return (Array.isArray(value) && value.length === 0) || isRecord(value);
}

function validateSettings(
  value: unknown,
  path: string,
  state: ValidationState,
  code: 'P15_PAGE_SETTINGS_INVALID' | 'P15_SETTINGS_INVALID',
): void {
  if (!validSettingsShape(value)) {
    pushIssue(
      state,
      code,
      path,
      'Elementor v0.4 settings must be an empty array when unset or an object when populated.',
    );
  }
}

function validateElement(
  value: unknown,
  path: string,
  depth: number,
  state: ValidationState,
): void {
  if (depth > ELEMENTOR_TEMPLATE_MAX_DEPTH) {
    pushIssue(
      state,
      'P15_DEPTH_LIMIT_EXCEEDED',
      path,
      `Element nesting exceeds the bounded depth of ${ELEMENTOR_TEMPLATE_MAX_DEPTH}.`,
    );
    return;
  }

  if (state.elementCount >= ELEMENTOR_TEMPLATE_MAX_ELEMENTS) {
    if (!state.elementLimitReported) {
      state.elementLimitReported = true;
      pushIssue(
        state,
        'P15_ELEMENT_LIMIT_EXCEEDED',
        path,
        `Template contains more than ${ELEMENTOR_TEMPLATE_MAX_ELEMENTS} elements.`,
      );
    }
    return;
  }

  state.elementCount += 1;

  if (!isRecord(value)) {
    pushIssue(state, 'P15_ELEMENT_NOT_OBJECT', path, 'Elementor content elements must be objects.');
    return;
  }

  const id = value.id;
  if (!nonEmptyBoundedString(id, 128)) {
    pushIssue(state, 'P15_ELEMENT_ID_REQUIRED', `${path}.id`, 'Element id must be a non-empty bounded string.');
  } else if (state.ids.has(id)) {
    pushIssue(state, 'P15_DUPLICATE_ELEMENT_ID', `${path}.id`, `Duplicate Elementor element id: ${id}.`);
  } else {
    state.ids.add(id);
  }

  if (typeof value.isInner !== 'boolean') {
    pushIssue(state, 'P15_IS_INNER_INVALID', `${path}.isInner`, 'isInner must be a boolean.');
  }

  validateSettings(value.settings, `${path}.settings`, state, 'P15_SETTINGS_INVALID');

  const elements = value.elements;
  if (!Array.isArray(elements)) {
    pushIssue(state, 'P15_ELEMENTS_INVALID', `${path}.elements`, 'elements must be an array.');
  }

  const elType = value.elType;
  if (elType === 'container') {
    state.containerCount += 1;
  } else if (elType === 'widget') {
    state.widgetCount += 1;
    if (!nonEmptyBoundedString(value.widgetType, 128)) {
      pushIssue(
        state,
        'P15_WIDGET_TYPE_REQUIRED',
        `${path}.widgetType`,
        'Widget elements require a non-empty bounded widgetType.',
      );
    } else {
      state.widgetTypes.add(value.widgetType);
    }
  } else if (elType === 'section' || elType === 'column') {
    pushIssue(
      state,
      'P15_LEGACY_ELEMENT_UNSUPPORTED',
      `${path}.elType`,
      `Legacy Elementor ${elType} elements are outside the modern container contract.`,
    );
  } else if (typeof elType === 'string' && elType.startsWith('e-')) {
    pushIssue(
      state,
      'P15_ATOMIC_ELEMENT_UNSUPPORTED',
      `${path}.elType`,
      `Atomic Elementor element ${elType} uses a separate versioned schema and is not accepted by this contract.`,
    );
  } else {
    pushIssue(
      state,
      'P15_ELEMENT_TYPE_UNSUPPORTED',
      `${path}.elType`,
      'Only documented modern container and widget elements are accepted by this contract.',
    );
  }

  if (Array.isArray(elements)) {
    for (let index = 0; index < elements.length; index += 1) {
      validateElement(elements[index], `${path}.elements[${index}]`, depth + 1, state);
      if (state.elementLimitReported) break;
    }
  }
}

/**
 * Validate an untrusted value against the bounded P15 classic Elementor template v0.4 contract.
 *
 * This is schema validation only. It does not claim that arbitrary widget settings are generatable,
 * that Elementor Pro/add-on widgets are available, or that the artifact has passed a real import.
 */
export function validateElementorTemplateV04(value: unknown): ElementorTemplateValidationResult {
  const state: ValidationState = {
    issues: [],
    ids: new Set<string>(),
    widgetTypes: new Set<string>(),
    elementCount: 0,
    containerCount: 0,
    widgetCount: 0,
    elementLimitReported: false,
  };

  let documentVersion: string | null = null;

  if (!isRecord(value)) {
    pushIssue(state, 'P15_DOCUMENT_NOT_OBJECT', '$', 'Elementor template document must be an object.');
  } else {
    if (!nonEmptyBoundedString(value.title, 512)) {
      pushIssue(state, 'P15_TITLE_REQUIRED', '$.title', 'Template title must be a non-empty bounded string.');
    }

    if (!nonEmptyBoundedString(value.type, 128)) {
      pushIssue(state, 'P15_DOCUMENT_TYPE_REQUIRED', '$.type', 'Template document type must be a non-empty bounded string.');
    }

    if (typeof value.version === 'string') documentVersion = value.version;
    if (value.version !== ELEMENTOR_TEMPLATE_DATA_VERSION) {
      pushIssue(
        state,
        'P15_UNSUPPORTED_DOCUMENT_VERSION',
        '$.version',
        `This target contract accepts Elementor data version ${ELEMENTOR_TEMPLATE_DATA_VERSION} only.`,
      );
    }

    validateSettings(value.page_settings, '$.page_settings', state, 'P15_PAGE_SETTINGS_INVALID');

    if (!Array.isArray(value.content)) {
      pushIssue(state, 'P15_CONTENT_INVALID', '$.content', 'Template content must be an array.');
    } else {
      for (let index = 0; index < value.content.length; index += 1) {
        validateElement(value.content[index], `$.content[${index}]`, 1, state);
        if (state.elementLimitReported) break;
      }
    }
  }

  return {
    contractVersion: ELEMENTOR_TEMPLATE_CONTRACT_VERSION,
    valid: state.issues.length === 0,
    documentVersion,
    elementCount: state.elementCount,
    containerCount: state.containerCount,
    widgetCount: state.widgetCount,
    widgetTypes: [...state.widgetTypes].sort(),
    issues: state.issues,
  };
}

export function serializeElementorTemplateV04(document: ElementorTemplateV04): string {
  const validation = validateElementorTemplateV04(document);
  if (!validation.valid) {
    const first = validation.issues[0];
    if (!first) {
      throw new Error('Invalid Elementor template v0.4: validation failed without a diagnostic.');
    }
    throw new Error(`Invalid Elementor template v0.4: ${first.code} at ${first.path}: ${first.message}`);
  }
  return `${JSON.stringify(document, null, 2)}\n`;
}
