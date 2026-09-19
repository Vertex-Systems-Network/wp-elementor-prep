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
import { reviewElementorAssetReferences } from './asset-reference-review';
import { buildElementorReferenceReviewIdentity } from './reference-review-identity';

export const P15_ELEMENTOR_ASSET_PROOF_VECTOR_VERSION =
  'p15-elementor-asset-proof-vector-v1' as const;
export const P15_ELEMENTOR_ASSET_PROOF_WORDPRESS_VERSION = '6.8' as const;
export const P15_ELEMENTOR_ASSET_PROOF_ELEMENTOR_VERSION = '4.2.4' as const;
export const P15_ELEMENTOR_ASSET_PROOF_FIXTURE_URL =
  'http://127.0.0.1:8080/?p15_asset_fixture=p15-url-only-v1' as const;

export const P15_ELEMENTOR_ASSET_PROOF_VECTOR_FILENAMES = [
  'neutral-ir.json',
  'candidate.json',
  'target-profile.json',
  'template.json',
  'manifest.json',
] as const;

export type P15ElementorAssetProofVectorFilename =
  typeof P15_ELEMENTOR_ASSET_PROOF_VECTOR_FILENAMES[number];

export interface P15ElementorAssetProofVectorManifestV1 {
  schemaVersion: 1;
  vectorVersion: typeof P15_ELEMENTOR_ASSET_PROOF_VECTOR_VERSION;
  generatorVersion: typeof P15_ELEMENTOR_V3_GENERATOR_VERSION;
  purpose: 'CONTROLLED_ELEMENTOR_URL_ONLY_ASSET_PROOF_INPUTS';
  candidateStatus: 'READY_FOR_TARGET_IMPORT_VALIDATION';
  importValidationStatus: 'NOT_RUN';
  candidateIdentity: ElementorTemplateCandidateIdentityV1;
  targetProfileFingerprint: string;
  referenceReviewIdentityDigest: string;
  assetReference: {
    path: string;
    widgetId: string;
    referenceMode: 'URL_ONLY';
    urlFingerprint: string;
  };
  declaredTarget: {
    source: 'DECLARED';
    wordpressVersion: typeof P15_ELEMENTOR_ASSET_PROOF_WORDPRESS_VERSION;
    elementorVersion: typeof P15_ELEMENTOR_ASSET_PROOF_ELEMENTOR_VERSION;
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
  renderObserved: false;
  assetReferenceObserved: false;
  browserAssetLoadObserved: false;
  assetReferenceClosureClaim: false;
  acceptanceAuthority: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  internalReviewRequired: true;
}

export interface P15ElementorAssetProofVector {
  ir: P15NeutralExportDocumentV1;
  profile: ElementorTargetProfileV1;
  candidateIdentity: ElementorTemplateCandidateIdentityV1;
  targetProfileFingerprint: string;
  referenceReviewIdentityDigest: string;
  manifest: P15ElementorAssetProofVectorManifestV1;
  files: Readonly<Record<P15ElementorAssetProofVectorFilename, string>>;
}

function serializeJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function buildP15ElementorAssetProofNeutralIr(): P15NeutralExportDocumentV1 {
  return {
    schemaVersion: 1,
    irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
    title: 'P15 Controlled URL-Only Asset Proof Vector',
    documentType: 'page',
    nodes: [{
      kind: 'container',
      sourceNodeId: 'p15:asset-proof:container',
      direction: 'column',
      gapPx: 12,
      paddingPx: { top: 20, right: 20, bottom: 20, left: 20 },
      children: [{
        kind: 'heading',
        sourceNodeId: 'p15:asset-proof:heading',
        text: 'P15 Controlled URL-Only Asset Proof',
        level: 'h2',
      }, {
        kind: 'image',
        sourceNodeId: 'p15:asset-proof:image',
        url: P15_ELEMENTOR_ASSET_PROOF_FIXTURE_URL,
      }],
    }],
  };
}

export function buildP15ElementorAssetProofVector(): P15ElementorAssetProofVector {
  const ir = buildP15ElementorAssetProofNeutralIr();
  const generation = generateElementorV3TemplateCandidate(ir);
  if (generation.status !== 'GENERATED_LOCAL_CANDIDATE'
    || generation.candidate === null
    || generation.template === null
    || generation.candidate.status !== 'READY_FOR_TARGET_IMPORT_VALIDATION'
    || generation.candidate.templateJson === null
    || generation.candidate.importValidationStatus !== 'NOT_RUN'
    || generation.candidate.targetCompatibilityClaim !== false
    || generation.candidate.productionAcceptance !== false) {
    throw new Error('P15 asset-proof vector failed the accepted local candidate readiness boundary.');
  }

  const profile = buildElementorTargetProfile({
    wordpressVersion: P15_ELEMENTOR_ASSET_PROOF_WORDPRESS_VERSION,
    elementorVersion: P15_ELEMENTOR_ASSET_PROOF_ELEMENTOR_VERSION,
  });
  const candidateIdentity = buildElementorTemplateCandidateIdentity(generation.candidate);
  const targetProfileFingerprint = fingerprintElementorTargetProfile(profile);
  const assetReview = reviewElementorAssetReferences(generation.template, profile);
  if (assetReview.status !== 'EXTERNAL_ASSET_CLOSURE_REQUIRED'
    || assetReview.assetReferenceStatus !== 'NOT_VERIFIED'
    || assetReview.references.length !== 1
    || assetReview.references[0]?.referenceMode !== 'URL_ONLY'
    || assetReview.references[0].mediaId !== null
    || !assetReview.references[0].urlPresent
    || assetReview.references[0].urlFingerprint === null) {
    throw new Error('P15 asset-proof vector did not produce exactly one URL_ONLY documented Image MEDIA reference.');
  }

  const referenceReviewIdentity = buildElementorReferenceReviewIdentity(generation.template, profile);
  if (referenceReviewIdentity.disposition !== 'EXTERNAL_CLOSURE_REQUIRED'
    || !referenceReviewIdentity.externalClosureRequired
    || referenceReviewIdentity.assetReferenceReviewStatus !== 'EXTERNAL_ASSET_CLOSURE_REQUIRED'
    || referenceReviewIdentity.assetReferenceStatus !== 'NOT_VERIFIED'
    || referenceReviewIdentity.globalReferenceClosureStatus !== 'NOT_REQUIRED') {
    throw new Error('P15 asset-proof vector reference-review identity is not the expected asset-only closure state.');
  }

  const neutralIrJson = serializeJson(ir);
  const candidateJson = serializeElementorTemplateCandidateArtifact(generation.candidate);
  const targetProfileJson = serializeElementorTargetProfile(profile);
  const templateJson = generation.candidate.templateJson;
  const reference = assetReview.references[0];

  const manifest: P15ElementorAssetProofVectorManifestV1 = {
    schemaVersion: 1,
    vectorVersion: P15_ELEMENTOR_ASSET_PROOF_VECTOR_VERSION,
    generatorVersion: P15_ELEMENTOR_V3_GENERATOR_VERSION,
    purpose: 'CONTROLLED_ELEMENTOR_URL_ONLY_ASSET_PROOF_INPUTS',
    candidateStatus: 'READY_FOR_TARGET_IMPORT_VALIDATION',
    importValidationStatus: 'NOT_RUN',
    candidateIdentity,
    targetProfileFingerprint,
    referenceReviewIdentityDigest: referenceReviewIdentity.digest,
    assetReference: {
      path: reference.path,
      widgetId: reference.widgetId,
      referenceMode: 'URL_ONLY',
      urlFingerprint: reference.urlFingerprint,
    },
    declaredTarget: {
      source: 'DECLARED',
      wordpressVersion: P15_ELEMENTOR_ASSET_PROOF_WORDPRESS_VERSION,
      elementorVersion: P15_ELEMENTOR_ASSET_PROOF_ELEMENTOR_VERSION,
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
    renderObserved: false,
    assetReferenceObserved: false,
    browserAssetLoadObserved: false,
    assetReferenceClosureClaim: false,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    internalReviewRequired: true,
  };

  const files: Record<P15ElementorAssetProofVectorFilename, string> = {
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
    referenceReviewIdentityDigest: referenceReviewIdentity.digest,
    manifest,
    files: Object.freeze(files),
  };
}
