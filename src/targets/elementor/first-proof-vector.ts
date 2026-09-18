import { sha256Hex } from '../../core/sha256';
import {
  buildElementorTemplateCandidateIdentity,
  type ElementorTemplateCandidateIdentityV1,
} from './import-validation-contract';
import {
  P15_NEUTRAL_EXPORT_IR_VERSION,
  type P15NeutralExportDocumentV1,
} from './neutral-export-ir';
import {
  buildElementorTargetProfile,
  fingerprintElementorTargetProfile,
  serializeElementorTargetProfile,
  type ElementorTargetProfileV1,
} from './target-profile';
import {
  P15_ELEMENTOR_V3_GENERATOR_VERSION,
  generateElementorV3TemplateCandidate,
} from './v3-template-generator';
import { serializeElementorTemplateCandidateArtifact } from './candidate-artifact';

export const P15_ELEMENTOR_FIRST_PROOF_VECTOR_VERSION = 'p15-elementor-first-proof-vector-v3' as const;
export const P15_ELEMENTOR_FIRST_PROOF_WORDPRESS_VERSION = '6.8' as const;
export const P15_ELEMENTOR_FIRST_PROOF_ELEMENTOR_VERSION = '4.2.4' as const;

export const P15_ELEMENTOR_FIRST_PROOF_VECTOR_FILENAMES = [
  'neutral-ir.json',
  'candidate.json',
  'target-profile.json',
  'template.json',
  'manifest.json',
] as const;

export type P15ElementorFirstProofVectorFilename = typeof P15_ELEMENTOR_FIRST_PROOF_VECTOR_FILENAMES[number];

export interface P15ElementorFirstProofVectorManifestV1 {
  schemaVersion: 1;
  vectorVersion: typeof P15_ELEMENTOR_FIRST_PROOF_VECTOR_VERSION;
  generatorVersion: typeof P15_ELEMENTOR_V3_GENERATOR_VERSION;
  purpose: 'FIRST_CONTROLLED_ELEMENTOR_TARGET_PROOF_INPUTS';
  candidateStatus: 'READY_FOR_TARGET_IMPORT_VALIDATION';
  importValidationStatus: 'NOT_RUN';
  candidateIdentity: ElementorTemplateCandidateIdentityV1;
  targetProfileFingerprint: string;
  declaredTarget: {
    source: 'DECLARED';
    wordpressVersion: typeof P15_ELEMENTOR_FIRST_PROOF_WORDPRESS_VERSION;
    elementorVersion: typeof P15_ELEMENTOR_FIRST_PROOF_ELEMENTOR_VERSION;
    architecture: 'CONTAINER';
    outputMode: 'TEMPLATE_JSON';
    atomicElements: 'UNSUPPORTED';
  };
  fileSha256: {
    neutralIr: string;
    candidate: string;
    targetProfile: string;
    template: string;
  };
  targetEnvironmentObserved: false;
  importObserved: false;
  editorObserved: false;
  renderObserved: false;
  acceptanceAuthority: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  internalReviewRequired: true;
}

export interface P15ElementorFirstProofVector {
  ir: P15NeutralExportDocumentV1;
  profile: ElementorTargetProfileV1;
  candidateIdentity: ElementorTemplateCandidateIdentityV1;
  targetProfileFingerprint: string;
  manifest: P15ElementorFirstProofVectorManifestV1;
  files: Readonly<Record<P15ElementorFirstProofVectorFilename, string>>;
}

function serializeJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function buildP15ElementorFirstProofNeutralIr(): P15NeutralExportDocumentV1 {
  return {
    schemaVersion: 1,
    irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
    title: 'P15 First Controlled Target Proof Vector',
    documentType: 'page',
    nodes: [{
      kind: 'container',
      sourceNodeId: 'p15:first-proof:container',
      direction: 'column',
      gapPx: 16,
      paddingPx: { top: 24, right: 24, bottom: 24, left: 24 },
      alignItems: 'start',
      justifyContent: 'start',
      backgroundColorHex: '#336699',
      cornerRadiusPx: 12,
      children: [{
        kind: 'heading',
        sourceNodeId: 'p15:first-proof:heading',
        text: 'P15 First Controlled Target Proof',
        level: 'h2',
        align: 'start',
      }, {
        kind: 'text',
        sourceNodeId: 'p15:first-proof:text',
        text: 'Deterministic Container V1 operator vector.',
        align: 'start',
      }],
    }],
  };
}

export function buildP15ElementorFirstProofVector(): P15ElementorFirstProofVector {
  const ir = buildP15ElementorFirstProofNeutralIr();
  const generation = generateElementorV3TemplateCandidate(ir);
  if (generation.status !== 'GENERATED_LOCAL_CANDIDATE'
    || generation.candidate === null
    || generation.template === null
    || generation.candidate.status !== 'READY_FOR_TARGET_IMPORT_VALIDATION'
    || generation.candidate.templateJson === null
    || generation.candidate.importValidationStatus !== 'NOT_RUN'
    || generation.candidate.targetCompatibilityClaim !== false
    || generation.candidate.productionAcceptance !== false) {
    throw new Error('P15 first-proof vector failed the accepted local candidate readiness boundary.');
  }

  const profile = buildElementorTargetProfile({
    wordpressVersion: P15_ELEMENTOR_FIRST_PROOF_WORDPRESS_VERSION,
    elementorVersion: P15_ELEMENTOR_FIRST_PROOF_ELEMENTOR_VERSION,
  });
  const candidateIdentity = buildElementorTemplateCandidateIdentity(generation.candidate);
  const targetProfileFingerprint = fingerprintElementorTargetProfile(profile);

  const neutralIrJson = serializeJson(ir);
  const candidateJson = serializeElementorTemplateCandidateArtifact(generation.candidate);
  const targetProfileJson = serializeElementorTargetProfile(profile);
  const templateJson = generation.candidate.templateJson;

  const manifest: P15ElementorFirstProofVectorManifestV1 = {
    schemaVersion: 1,
    vectorVersion: P15_ELEMENTOR_FIRST_PROOF_VECTOR_VERSION,
    generatorVersion: P15_ELEMENTOR_V3_GENERATOR_VERSION,
    purpose: 'FIRST_CONTROLLED_ELEMENTOR_TARGET_PROOF_INPUTS',
    candidateStatus: 'READY_FOR_TARGET_IMPORT_VALIDATION',
    importValidationStatus: 'NOT_RUN',
    candidateIdentity,
    targetProfileFingerprint,
    declaredTarget: {
      source: 'DECLARED',
      wordpressVersion: P15_ELEMENTOR_FIRST_PROOF_WORDPRESS_VERSION,
      elementorVersion: P15_ELEMENTOR_FIRST_PROOF_ELEMENTOR_VERSION,
      architecture: 'CONTAINER',
      outputMode: 'TEMPLATE_JSON',
      atomicElements: 'UNSUPPORTED',
    },
    fileSha256: {
      neutralIr: `sha256:${sha256Hex(neutralIrJson)}`,
      candidate: `sha256:${sha256Hex(candidateJson)}`,
      targetProfile: `sha256:${sha256Hex(targetProfileJson)}`,
      template: `sha256:${sha256Hex(templateJson)}`,
    },
    targetEnvironmentObserved: false,
    importObserved: false,
    editorObserved: false,
    renderObserved: false,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    internalReviewRequired: true,
  };

  const files: Record<P15ElementorFirstProofVectorFilename, string> = {
    'neutral-ir.json': neutralIrJson,
    'candidate.json': candidateJson,
    'target-profile.json': targetProfileJson,
    'template.json': templateJson,
    'manifest.json': serializeJson(manifest),
  };

  return {
    ir,
    profile,
    candidateIdentity,
    targetProfileFingerprint,
    manifest,
    files: Object.freeze(files),
  };
}
