import {
  ELEMENTOR_TEMPLATE_CONTRACT_VERSION,
  validateElementorTemplateV04,
  type ElementorElementV04,
  type ElementorSettingsV04,
  type ElementorTemplateV04,
  type ElementorTemplateValidationIssue,
} from './template-v04';

export const ELEMENTOR_CAPABILITY_REGISTRY_VERSION = 'elementor-core-widget-capabilities-v1' as const;

export type ElementorDocumentedCoreWidgetV1 = 'button' | 'heading' | 'image' | 'text-editor';
export type ElementorWidgetCompatibilityClass = 'DOCUMENTED_CORE' | 'REVIEW_REQUIRED';

export interface ElementorCoreWidgetCapabilityV1 {
  widgetType: ElementorDocumentedCoreWidgetV1;
  classification: 'DOCUMENTED_CORE';
  generationEnabled: false;
  availabilityClaim: false;
  evidence: 'ELEMENTOR_WIDGET_ELEMENT_DOCUMENTATION';
}

export const ELEMENTOR_CORE_WIDGET_CAPABILITIES_V1: readonly ElementorCoreWidgetCapabilityV1[] = Object.freeze([
  Object.freeze({
    widgetType: 'button',
    classification: 'DOCUMENTED_CORE',
    generationEnabled: false,
    availabilityClaim: false,
    evidence: 'ELEMENTOR_WIDGET_ELEMENT_DOCUMENTATION',
  }),
  Object.freeze({
    widgetType: 'heading',
    classification: 'DOCUMENTED_CORE',
    generationEnabled: false,
    availabilityClaim: false,
    evidence: 'ELEMENTOR_WIDGET_ELEMENT_DOCUMENTATION',
  }),
  Object.freeze({
    widgetType: 'image',
    classification: 'DOCUMENTED_CORE',
    generationEnabled: false,
    availabilityClaim: false,
    evidence: 'ELEMENTOR_WIDGET_ELEMENT_DOCUMENTATION',
  }),
  Object.freeze({
    widgetType: 'text-editor',
    classification: 'DOCUMENTED_CORE',
    generationEnabled: false,
    availabilityClaim: false,
    evidence: 'ELEMENTOR_WIDGET_ELEMENT_DOCUMENTATION',
  }),
]);

export interface ElementorWidgetCompatibilityEntry {
  path: string;
  id: string;
  widgetType: string;
  classification: ElementorWidgetCompatibilityClass;
  generationEnabled: false;
  availabilityClaim: false;
  responsiveSettingKeys: string[];
  globalReferenceKeys: string[];
}

export interface ElementorWidgetInventoryEntry {
  widgetType: string;
  classification: ElementorWidgetCompatibilityClass;
  count: number;
}

export interface ElementorTemplateCapabilityReport {
  schemaVersion: 1;
  registryVersion: typeof ELEMENTOR_CAPABILITY_REGISTRY_VERSION;
  targetContractVersion: typeof ELEMENTOR_TEMPLATE_CONTRACT_VERSION;
  targetCompatibilityClaim: false;
  generationEnabled: false;
  status: 'ASSESSED' | 'INVALID_TEMPLATE';
  templateValid: boolean;
  validationIssues: ElementorTemplateValidationIssue[];
  summary: {
    totalWidgets: number;
    documentedCoreWidgets: number;
    reviewRequiredWidgets: number;
    widgetsWithResponsiveSettings: number;
    widgetsWithGlobalReferences: number;
  };
  widgetInventory: ElementorWidgetInventoryEntry[];
  entries: ElementorWidgetCompatibilityEntry[];
}

const documentedCoreWidgetTypes = new Set<string>(
  ELEMENTOR_CORE_WIDGET_CAPABILITIES_V1.map((entry) => entry.widgetType),
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function responsiveSettingKeys(settings: ElementorSettingsV04): string[] {
  if (!isRecord(settings)) return [];
  return Object.keys(settings)
    .filter((key) => key.endsWith('_tablet') || key.endsWith('_mobile'))
    .sort();
}

function globalReferenceKeys(settings: ElementorSettingsV04): string[] {
  if (!isRecord(settings) || !isRecord(settings.__globals__)) return [];
  return Object.keys(settings.__globals__).sort();
}

function classifyWidget(widgetType: string): ElementorWidgetCompatibilityClass {
  return documentedCoreWidgetTypes.has(widgetType) ? 'DOCUMENTED_CORE' : 'REVIEW_REQUIRED';
}

function collectWidgets(
  elements: ElementorElementV04[],
  parentPath: string,
  entries: ElementorWidgetCompatibilityEntry[],
): void {
  for (let index = 0; index < elements.length; index += 1) {
    const element = elements[index];
    if (!element) continue;
    const path = `${parentPath}[${index}]`;

    if (element.elType === 'widget') {
      entries.push({
        path,
        id: element.id,
        widgetType: element.widgetType,
        classification: classifyWidget(element.widgetType),
        generationEnabled: false,
        availabilityClaim: false,
        responsiveSettingKeys: responsiveSettingKeys(element.settings),
        globalReferenceKeys: globalReferenceKeys(element.settings),
      });
    }

    if (element.elements.length > 0) {
      collectWidgets(element.elements, `${path}.elements`, entries);
    }
  }
}

function buildInventory(entries: ElementorWidgetCompatibilityEntry[]): ElementorWidgetInventoryEntry[] {
  const counts = new Map<string, ElementorWidgetInventoryEntry>();
  for (const entry of entries) {
    const existing = counts.get(entry.widgetType);
    if (existing) {
      existing.count += 1;
      continue;
    }
    counts.set(entry.widgetType, {
      widgetType: entry.widgetType,
      classification: entry.classification,
      count: 1,
    });
  }
  return [...counts.values()].sort((a, b) => a.widgetType.localeCompare(b.widgetType));
}

function invalidReport(validationIssues: ElementorTemplateValidationIssue[]): ElementorTemplateCapabilityReport {
  return {
    schemaVersion: 1,
    registryVersion: ELEMENTOR_CAPABILITY_REGISTRY_VERSION,
    targetContractVersion: ELEMENTOR_TEMPLATE_CONTRACT_VERSION,
    targetCompatibilityClaim: false,
    generationEnabled: false,
    status: 'INVALID_TEMPLATE',
    templateValid: false,
    validationIssues: validationIssues.map((issue) => ({ ...issue })),
    summary: {
      totalWidgets: 0,
      documentedCoreWidgets: 0,
      reviewRequiredWidgets: 0,
      widgetsWithResponsiveSettings: 0,
      widgetsWithGlobalReferences: 0,
    },
    widgetInventory: [],
    entries: [],
  };
}

/**
 * Assess only already-valid classic Elementor v0.4 template data against the bounded v1 capability registry.
 *
 * This report is read-only evidence. `DOCUMENTED_CORE` means the widget identifier is directly evidenced in
 * Elementor's documented classic data examples; it does not mean WP Builders Prepare can generate it yet,
 * that the widget is installed on a target site, or that a real Elementor import has passed.
 */
export function assessElementorTemplateCapabilities(value: unknown): ElementorTemplateCapabilityReport {
  const validation = validateElementorTemplateV04(value);
  if (!validation.valid) return invalidReport(validation.issues);

  const document = value as ElementorTemplateV04;
  const entries: ElementorWidgetCompatibilityEntry[] = [];
  collectWidgets(document.content, '$.content', entries);

  return {
    schemaVersion: 1,
    registryVersion: ELEMENTOR_CAPABILITY_REGISTRY_VERSION,
    targetContractVersion: ELEMENTOR_TEMPLATE_CONTRACT_VERSION,
    targetCompatibilityClaim: false,
    generationEnabled: false,
    status: 'ASSESSED',
    templateValid: true,
    validationIssues: [],
    summary: {
      totalWidgets: entries.length,
      documentedCoreWidgets: entries.filter((entry) => entry.classification === 'DOCUMENTED_CORE').length,
      reviewRequiredWidgets: entries.filter((entry) => entry.classification === 'REVIEW_REQUIRED').length,
      widgetsWithResponsiveSettings: entries.filter((entry) => entry.responsiveSettingKeys.length > 0).length,
      widgetsWithGlobalReferences: entries.filter((entry) => entry.globalReferenceKeys.length > 0).length,
    },
    widgetInventory: buildInventory(entries),
    entries,
  };
}

export function serializeElementorTemplateCapabilityReport(report: ElementorTemplateCapabilityReport): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}
