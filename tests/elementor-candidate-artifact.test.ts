import { describe, expect, it } from 'vitest';
import {
  ELEMENTOR_TEMPLATE_CANDIDATE_VERSION,
  buildElementorTemplateCandidateArtifact,
  serializeElementorTemplateCandidateArtifact,
} from '../src/targets/elementor/candidate-artifact';
import type { ElementorTemplateV04 } from '../src/targets/elementor/template-v04';

function template(widgetType = 'heading'): ElementorTemplateV04 {
  return {
    title: 'Candidate Fixture',
    type: 'page',
    version: '0.4',
    page_settings: [],
    content: [
      {
        id: 'container1',
        elType: 'container',
        isInner: false,
        settings: [],
        elements: [
          {
            id: 'widget1',
            elType: 'widget',
            widgetType,
            isInner: false,
            settings: widgetType === 'heading' ? { title: 'Hello' } : [],
            elements: [],
          },
        ],
      },
    ],
  };
}

describe('P15 Elementor candidate artifact envelope', () => {
  it('allows documented-core valid JSON to progress only to target import validation', () => {
    const document = template();
    const artifact = buildElementorTemplateCandidateArtifact(document);

    expect(artifact.candidateVersion).toBe(ELEMENTOR_TEMPLATE_CANDIDATE_VERSION);
    expect(artifact.status).toBe('READY_FOR_TARGET_IMPORT_VALIDATION');
    expect(artifact.validation.valid).toBe(true);
    expect(artifact.capabilityReport?.status).toBe('ASSESSED');
    expect(artifact.reviewWidgetTypes).toEqual([]);
    expect(artifact.templateJson).toBe(`${JSON.stringify(document, null, 2)}\n`);
    expect(artifact.importValidationStatus).toBe('NOT_RUN');
    expect(artifact.downloadEnabled).toBe(false);
    expect(artifact.targetCompatibilityClaim).toBe(false);
    expect(artifact.productionAcceptance).toBe(false);
  });

  it('holds valid templates with unregistered widgets in review and keeps authority locked', () => {
    const document = template('custom-addon-widget');
    const artifact = buildElementorTemplateCandidateArtifact(document);

    expect(artifact.status).toBe('REVIEW_REQUIRED');
    expect(artifact.validation.valid).toBe(true);
    expect(artifact.reviewWidgetTypes).toEqual(['custom-addon-widget']);
    expect(artifact.templateJson).toBe(`${JSON.stringify(document, null, 2)}\n`);
    expect(artifact.capabilityReport?.summary.reviewRequiredWidgets).toBe(1);
    expect(artifact.importValidationStatus).toBe('NOT_RUN');
    expect(artifact.downloadEnabled).toBe(false);
    expect(artifact.targetCompatibilityClaim).toBe(false);
    expect(artifact.productionAcceptance).toBe(false);
  });

  it('rejects invalid templates before capability assessment and emits no candidate template JSON', () => {
    const invalid = { ...template(), version: '0.5' };
    const artifact = buildElementorTemplateCandidateArtifact(invalid);

    expect(artifact.status).toBe('REJECTED_INVALID_TEMPLATE');
    expect(artifact.validation.valid).toBe(false);
    expect(artifact.validation.issues.map((issue) => issue.code)).toContain('P15_UNSUPPORTED_DOCUMENT_VERSION');
    expect(artifact.capabilityReport).toBeNull();
    expect(artifact.reviewWidgetTypes).toEqual([]);
    expect(artifact.templateJson).toBeNull();
    expect(artifact.importValidationStatus).toBe('NOT_RUN');
    expect(artifact.downloadEnabled).toBe(false);
    expect(artifact.targetCompatibilityClaim).toBe(false);
    expect(artifact.productionAcceptance).toBe(false);
  });

  it('sorts multiple review widget types deterministically', () => {
    const document = template('z-addon');
    document.content[0]!.elements.push({
      id: 'widget2',
      elType: 'widget',
      widgetType: 'a-addon',
      isInner: false,
      settings: [],
      elements: [],
    });
    const artifact = buildElementorTemplateCandidateArtifact(document);

    expect(artifact.status).toBe('REVIEW_REQUIRED');
    expect(artifact.reviewWidgetTypes).toEqual(['a-addon', 'z-addon']);
  });

  it('serializes the same candidate artifact byte-identically without runtime timestamps', () => {
    const firstArtifact = buildElementorTemplateCandidateArtifact(template());
    const secondArtifact = buildElementorTemplateCandidateArtifact(template());
    const first = serializeElementorTemplateCandidateArtifact(firstArtifact);
    const second = serializeElementorTemplateCandidateArtifact(secondArtifact);

    expect(firstArtifact).toEqual(secondArtifact);
    expect(first).toBe(second);
    expect(first.endsWith('\n')).toBe(true);
    expect(first).not.toContain('generatedAt');
    expect(first).not.toContain('capturedAt');
  });
});
