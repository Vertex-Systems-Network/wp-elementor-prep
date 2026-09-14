import {
  ELEMENTOR_CAPABILITY_REGISTRY_VERSION,
  assessElementorTemplateCapabilities,
  type ElementorTemplateCapabilityReport,
} from './capability-registry';
import {
  ELEMENTOR_TEMPLATE_CONTRACT_VERSION,
  serializeElementorTemplateV04,
  validateElementorTemplateV04,
  type ElementorTemplateV04,
  type ElementorTemplateValidationResult,
} from './template-v04';

export const ELEMENTOR_TEMPLATE_CANDIDATE_VERSION = 'elementor-template-candidate-v1' as const;

export type ElementorTemplateCandidateStatus =
  | 'REJECTED_INVALID_TEMPLATE'
  | 'REVIEW_REQUIRED'
  | 'READY_FOR_TARGET_IMPORT_VALIDATION';

export interface ElementorTemplateCandidateArtifactV1 {
  schemaVersion: 1;
  candidateVersion: typeof ELEMENTOR_TEMPLATE_CANDIDATE_VERSION;
  targetContractVersion: typeof ELEMENTOR_TEMPLATE_CONTRACT_VERSION;
  capabilityRegistryVersion: typeof ELEMENTOR_CAPABILITY_REGISTRY_VERSION;
  status: ElementorTemplateCandidateStatus;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
  importValidationStatus: 'NOT_RUN';
  validation: ElementorTemplateValidationResult;
  capabilityReport: ElementorTemplateCapabilityReport | null;
  reviewWidgetTypes: string[];
  templateJson: string | null;
}

function cloneValidation(validation: ElementorTemplateValidationResult): ElementorTemplateValidationResult {
  return {
    ...validation,
    widgetTypes: [...validation.widgetTypes],
    issues: validation.issues.map((issue) => ({ ...issue })),
  };
}

/**
 * Build a deterministic, non-authorizing candidate envelope around untrusted Elementor template JSON.
 *
 * A valid candidate can progress only to a future target-import-validation step. This function never
 * claims that Elementor imported the template, never enables a download action, and never converts
 * unregistered widgets into supported mappings.
 */
export function buildElementorTemplateCandidateArtifact(value: unknown): ElementorTemplateCandidateArtifactV1 {
  const validation = validateElementorTemplateV04(value);
  const validationSnapshot = cloneValidation(validation);

  if (!validation.valid) {
    return {
      schemaVersion: 1,
      candidateVersion: ELEMENTOR_TEMPLATE_CANDIDATE_VERSION,
      targetContractVersion: ELEMENTOR_TEMPLATE_CONTRACT_VERSION,
      capabilityRegistryVersion: ELEMENTOR_CAPABILITY_REGISTRY_VERSION,
      status: 'REJECTED_INVALID_TEMPLATE',
      targetCompatibilityClaim: false,
      productionAcceptance: false,
      downloadEnabled: false,
      importValidationStatus: 'NOT_RUN',
      validation: validationSnapshot,
      capabilityReport: null,
      reviewWidgetTypes: [],
      templateJson: null,
    };
  }

  const capabilityReport = assessElementorTemplateCapabilities(value);
  if (capabilityReport.status !== 'ASSESSED' || !capabilityReport.templateValid) {
    throw new Error('Elementor candidate capability assessment contradicted successful template validation.');
  }

  const reviewWidgetTypes = capabilityReport.widgetInventory
    .filter((entry) => entry.classification === 'REVIEW_REQUIRED')
    .map((entry) => entry.widgetType)
    .sort();
  const status: ElementorTemplateCandidateStatus = reviewWidgetTypes.length > 0
    ? 'REVIEW_REQUIRED'
    : 'READY_FOR_TARGET_IMPORT_VALIDATION';

  return {
    schemaVersion: 1,
    candidateVersion: ELEMENTOR_TEMPLATE_CANDIDATE_VERSION,
    targetContractVersion: ELEMENTOR_TEMPLATE_CONTRACT_VERSION,
    capabilityRegistryVersion: ELEMENTOR_CAPABILITY_REGISTRY_VERSION,
    status,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    downloadEnabled: false,
    importValidationStatus: 'NOT_RUN',
    validation: validationSnapshot,
    capabilityReport,
    reviewWidgetTypes,
    templateJson: serializeElementorTemplateV04(value as ElementorTemplateV04),
  };
}

export function serializeElementorTemplateCandidateArtifact(
  artifact: ElementorTemplateCandidateArtifactV1,
): string {
  return `${JSON.stringify(artifact, null, 2)}\n`;
}
