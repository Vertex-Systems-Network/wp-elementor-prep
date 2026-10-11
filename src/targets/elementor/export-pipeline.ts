import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import { buildElementorTemplateCandidateIdentity } from './import-validation-contract';
import {
  composeP15ElementorPage,
  serializeP15ElementorPageCompositionSummary,
  type P15PageCompositionResultV1,
} from './page-composition';
import type { ElementorTemplateV04 } from './template-v04';
import { buildP15FontManifest, type P15FontManifestV1 } from './font-manifest';
import { validateP15NeutralExportDocument, type P15NeutralExportDocumentV1 } from './neutral-export-ir';
import { generateElementorV3TemplateCandidate, type P15ElementorV3GenerationResult } from './v3-template-generator';

/**
 * The one Elementor export path (recovery M1.6) shared by the Figma plugin preview/download and the CLI.
 *
 * The neutral source always goes through the v3 generator first. Without a page manifest the generated
 * base candidate is the export, byte for byte what the generator produced. With a page manifest the
 * mapping engine's page composition applies the requested families on that exact base, and only a
 * RESOLVED composition yields a candidate. Nothing here mutates Figma, reaches the network or claims
 * target compatibility: a candidate is a locally validated artifact, never an import/render proof.
 */
export const P15_ELEMENTOR_EXPORT_PIPELINE_VERSION = 'p15-elementor-export-pipeline-v1' as const;

export type P15ElementorExportStatus =
  /** The generator refused the source or it carries REVIEW nodes; no candidate. */
  | 'BLOCKED_GENERATION'
  /** The page composition refused its manifest; no candidate. */
  | 'REJECTED_COMPOSITION'
  /** No page manifest: the generated base candidate is the export. */
  | 'BASE_CANDIDATE'
  /** A RESOLVED page composition on the generated base. */
  | 'COMPOSED_CANDIDATE';

export interface P15ElementorExportResultV1 {
  schemaVersion: 1;
  pipelineVersion: typeof P15_ELEMENTOR_EXPORT_PIPELINE_VERSION;
  status: P15ElementorExportStatus;
  generation: P15ElementorV3GenerationResult;
  /** Present only when a page manifest was supplied and generation succeeded. */
  composition: P15PageCompositionResultV1 | null;
  template: ElementorTemplateV04 | null;
  candidate: ElementorTemplateCandidateArtifactV1 | null;
  candidateIdentityDigest: string | null;
  /** Families and weights the source uses and whether Elementor 4.2.4 can load them (recovery M2.8); null for an invalid source. */
  fontManifest: P15FontManifestV1 | null;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  importValidationStatus: 'NOT_RUN';
}

function exportResult(status: P15ElementorExportStatus, generation: P15ElementorV3GenerationResult,
  composition: P15PageCompositionResultV1 | null, template: ElementorTemplateV04 | null,
  candidate: ElementorTemplateCandidateArtifactV1 | null, sourceValue: unknown): P15ElementorExportResultV1 {
  return {
    schemaVersion: 1,
    pipelineVersion: P15_ELEMENTOR_EXPORT_PIPELINE_VERSION,
    status,
    generation,
    composition,
    template,
    candidate,
    candidateIdentityDigest: candidate ? buildElementorTemplateCandidateIdentity(candidate).digest : null,
    fontManifest: validateP15NeutralExportDocument(sourceValue).valid ? buildP15FontManifest(sourceValue as P15NeutralExportDocumentV1).manifest : null,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    importValidationStatus: 'NOT_RUN',
  };
}

/** Build the Elementor export for one neutral source, optionally applying a page-composition manifest. */
export function buildP15ElementorExport(sourceValue: unknown, pageManifestValue: unknown = null): P15ElementorExportResultV1 {
  const generation = generateElementorV3TemplateCandidate(sourceValue);
  if (generation.status !== 'GENERATED_LOCAL_CANDIDATE' || !generation.template || !generation.candidate) {
    return exportResult('BLOCKED_GENERATION', generation, null, null, null, sourceValue);
  }
  if (pageManifestValue === null) return exportResult('BASE_CANDIDATE', generation, null, generation.template, generation.candidate, sourceValue);
  const composition = composeP15ElementorPage(sourceValue, pageManifestValue);
  if (composition.status !== 'RESOLVED' || !composition.template || !composition.candidate) {
    return exportResult('REJECTED_COMPOSITION', generation, composition, null, null, sourceValue);
  }
  return exportResult('COMPOSED_CANDIDATE', generation, composition, composition.template, composition.candidate, sourceValue);
}

/** Sanitized summary: statuses, versions and identities only, never source text or template bytes. */
export function serializeP15ElementorExportSummary(value: P15ElementorExportResultV1): string {
  const hasCandidate = value.status === 'BASE_CANDIDATE' || value.status === 'COMPOSED_CANDIDATE';
  if (value.schemaVersion !== 1 || value.pipelineVersion !== P15_ELEMENTOR_EXPORT_PIPELINE_VERSION
    || !['BLOCKED_GENERATION', 'REJECTED_COMPOSITION', 'BASE_CANDIDATE', 'COMPOSED_CANDIDATE'].includes(value.status)
    || hasCandidate !== (value.candidate !== null && value.candidateIdentityDigest !== null)
    || (value.status === 'COMPOSED_CANDIDATE' || value.status === 'REJECTED_COMPOSITION') !== (value.composition !== null)
    || value.targetCompatibilityClaim !== false || value.productionAcceptance !== false || value.importValidationStatus !== 'NOT_RUN') {
    throw new Error('Invalid or authority-inflated Elementor export result.');
  }
  return `${JSON.stringify({
    schemaVersion: 1,
    pipelineVersion: P15_ELEMENTOR_EXPORT_PIPELINE_VERSION,
    status: value.status,
    generatorVersion: value.generation.generatorVersion,
    generationStatus: value.generation.status,
    reviewEntryCount: value.generation.reviewEntries.length,
    composition: value.composition ? JSON.parse(serializeP15ElementorPageCompositionSummary(value.composition)) as unknown : null,
    candidateStatus: value.candidate?.status ?? null,
    candidateIdentityDigest: value.candidateIdentityDigest,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    importValidationStatus: 'NOT_RUN',
  }, null, 2)}\n`;
}
