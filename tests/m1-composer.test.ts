import { describe, expect, it } from 'vitest';
import { composeFamilies, serializeCompositionSummary, type ComposedFamilyResult, type CompositionSpec } from '../src/targets/elementor/mapping-engine/composer';
import { resolveP15ElementorButtonTextColors, P15_ELEMENTOR_BUTTON_TEXT_COLOR_MANIFEST_VERSION } from '../src/targets/elementor/button-text-color-resolution';
import { resolveP15ElementorContainerHoverBackgroundColor, P15_ELEMENTOR_CONTAINER_HOVER_BACKGROUND_COLOR_MANIFEST_VERSION } from '../src/targets/elementor/container-hover-background-color-resolution';
import { P15_NEUTRAL_EXPORT_IR_VERSION, type P15NeutralExportDocumentV1 } from '../src/targets/elementor/neutral-export-ir';
import { fingerprintP15NeutralExportDocument } from '../src/targets/elementor/neutral-export-ir-identity';
import { buildElementorTemplateCandidateIdentity } from '../src/targets/elementor/import-validation-contract';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';
import type { ElementorElementV04 } from '../src/targets/elementor/template-v04';
import { buildElementorTemplateCandidateArtifact } from '../src/targets/elementor/candidate-artifact';

const source = (): P15NeutralExportDocumentV1 => ({
  schemaVersion: 1, irVersion: P15_NEUTRAL_EXPORT_IR_VERSION, title: 'Composer source', documentType: 'section',
  nodes: [{ kind: 'container', sourceNodeId: 'root', direction: 'column', children: [
    { kind: 'button', sourceNodeId: 'button', text: 'Go' },
    { kind: 'container', sourceNodeId: 'nested', direction: 'row', children: [] },
  ] }],
});

function identity(document: P15NeutralExportDocumentV1) {
  const generation = generateElementorV3TemplateCandidate(document);
  if (!generation.candidate) throw new Error('fixture must generate');
  return { schemaVersion: 1, sourceIrFingerprint: fingerprintP15NeutralExportDocument(document),
    baseCandidateIdentityDigest: buildElementorTemplateCandidateIdentity(generation.candidate).digest,
    responsiveInferencePerformed: false, figmaMutation: false, networkAccess: false, responsiveClosureClaim: false,
    targetCompatibilityClaim: false, productionAcceptance: false, downloadEnabled: false };
}

const buttonManifest = (document: P15NeutralExportDocumentV1) => ({ ...identity(document),
  manifestVersion: P15_ELEMENTOR_BUTTON_TEXT_COLOR_MANIFEST_VERSION, colorInferencePerformed: false,
  buttons: [{ sourceNodeId: 'button', color: '#112233' }] });
const hoverManifest = (document: P15NeutralExportDocumentV1) => ({ ...identity(document),
  manifestVersion: P15_ELEMENTOR_CONTAINER_HOVER_BACKGROUND_COLOR_MANIFEST_VERSION,
  containers: [{ sourceNodeId: 'nested', color: '#abcdef' }] });

/** Wrap a resolver and edit the first node matching `pick` in its output tree (and, by default, its candidate). */
function tamper(resolve: (s: unknown, m: unknown) => ComposedFamilyResult, pick: (node: ElementorElementV04) => boolean,
  edit: (settings: Record<string, unknown>) => void, keepCandidate = false) {
  return (s: unknown, m: unknown): ComposedFamilyResult => {
    const resolved = resolve(s, m);
    const walk = (nodes: ElementorElementV04[]): boolean => nodes.some((node) => {
      if (pick(node) && !Array.isArray(node.settings)) { edit(node.settings as Record<string, unknown>); return true; }
      return walk(node.elements);
    });
    if (!resolved.template) return resolved;
    walk(resolved.template.content);
    return keepCandidate ? resolved : { ...resolved, candidate: buildElementorTemplateCandidateArtifact(resolved.template) };
  };
}
const isButton = (node: ElementorElementV04) => node.elType === 'widget' && node.widgetType === 'button';
const isContainer = (node: ElementorElementV04) => node.elType === 'container';

type Fam = 'a' | 'b';
type Resolve = (s: unknown, m: unknown) => ComposedFamilyResult;
function widgetSpec(a: Resolve, b: Resolve, keysA: string[], keysB: string[]): CompositionSpec<Fam> {
  return { version: 'composer-test-v1', families: ['a', 'b'], issuePrefix: 'T_', subject: 'Test', refusalIssueCount: 'one',
    merge: { kind: 'widgets', accepts: isButton },
    steps: { a: { resolve: a, resolvedStatus: 'BUTTON_TEXT_COLORS_RESOLVED', keys: keysA },
      b: { resolve: b, resolvedStatus: 'BUTTON_TEXT_COLORS_RESOLVED', keys: keysB } } };
}
const composition = (document: P15NeutralExportDocumentV1, families: Record<string, unknown>) =>
  ({ ...identity(document), compositionVersion: 'composer-test-v1', families });

describe('recovery M1.5 — ordered composer', () => {
  it('applies families in spec order regardless of manifest key order', () => {
    const document = source();
    const spec = widgetSpec(resolveP15ElementorButtonTextColors,
      tamper(resolveP15ElementorButtonTextColors, isButton, (s) => { s.hover_color = '#000000'; }),
      ['button_text_color'], ['button_text_color', 'hover_color']);
    const forward = composeFamilies(spec, document, composition(document, { a: buttonManifest(document), b: buttonManifest(document) }));
    const backward = composeFamilies(spec, document, composition(document, { b: buttonManifest(document), a: buttonManifest(document) }));
    expect(forward.status).toBe('REJECTED');
    expect(forward.issues).toEqual([{ code: 'T_KEY_CONFLICT', family: 'b' }]);
    expect(backward).toEqual(forward);
  });

  it('gives every key a single owner: a second family writing an owned key is a KEY_CONFLICT, never an overwrite', () => {
    const document = source();
    const spec = widgetSpec(resolveP15ElementorButtonTextColors,
      tamper(resolveP15ElementorButtonTextColors, isButton, (s) => { delete s.button_text_color; s.hover_color = '#000000'; }),
      ['button_text_color'], ['hover_color']);
    const ok = composeFamilies(spec, document, composition(document, { a: buttonManifest(document), b: buttonManifest(document) }));
    expect(ok.status).toBe('RESOLVED');
    expect(ok.appliedFamilies).toEqual(['a', 'b']);
    const button = ok.template?.content[0]?.elements[0];
    expect(button?.settings).toMatchObject({ button_text_color: '#112233', hover_color: '#000000' });
  });

  it('rejects a family that adds a key outside its allowlist, or on a node kind it may not change', () => {
    const document = source();
    const extra = widgetSpec(tamper(resolveP15ElementorButtonTextColors, isButton, (s) => { s.typography_typography = 'custom'; }),
      resolveP15ElementorButtonTextColors, ['button_text_color'], ['button_text_color']);
    expect(composeFamilies(extra, document, composition(document, { a: buttonManifest(document) })).issues)
      .toEqual([{ code: 'T_FAMILY_DRIFT', family: 'a' }]);
    const container = widgetSpec(tamper(resolveP15ElementorButtonTextColors, isContainer, (s) => { s.button_text_color = '#000000'; }),
      resolveP15ElementorButtonTextColors, ['button_text_color'], ['button_text_color']);
    expect(composeFamilies(container, document, composition(document, { a: buttonManifest(document) })).issues)
      .toEqual([{ code: 'T_FAMILY_DRIFT', family: 'a' }]);
  });

  it('rejects a family that changes or removes a base setting', () => {
    const document = source();
    for (const edit of [(s: Record<string, unknown>) => { s.text = 'changed'; }, (s: Record<string, unknown>) => { delete s.text; }]) {
      const spec = widgetSpec(tamper(resolveP15ElementorButtonTextColors, isButton, edit),
        resolveP15ElementorButtonTextColors, ['button_text_color'], ['button_text_color']);
      const result = composeFamilies(spec, document, composition(document, { a: buttonManifest(document) }));
      expect(result.issues).toEqual([{ code: 'T_FAMILY_DRIFT', family: 'a' }]);
      expect(result.template).toBeNull();
    }
  });

  it('container merge rejects drift on a container and on any non-container node', () => {
    const document = source();
    const spec = (resolve: (s: unknown, m: unknown) => ComposedFamilyResult): CompositionSpec<'h'> => ({
      version: 'composer-test-v1', families: ['h'], issuePrefix: 'T_', subject: 'Test', refusalIssueCount: 'some',
      merge: { kind: 'containers' },
      steps: { h: { resolve, resolvedStatus: 'CONTAINER_HOVER_BACKGROUND_COLOR_RESOLVED', keys: ['background_hover_background', 'background_hover_color'] } } });
    const manifest = composition(document, { h: hoverManifest(document) });
    expect(composeFamilies(spec(resolveP15ElementorContainerHoverBackgroundColor), document, manifest).status).toBe('RESOLVED');
    for (const [pick, edit] of [
      [isContainer, (s: Record<string, unknown>) => { s.flex_gap = { size: 1 }; }],
      [isButton, (s: Record<string, unknown>) => { s.button_text_color = '#000000'; }],
    ] as const) {
      const result = composeFamilies(spec(tamper(resolveP15ElementorContainerHoverBackgroundColor, pick, edit)), document, manifest);
      expect(result.issues).toEqual([{ code: 'T_FAMILY_DRIFT', family: 'h' }]);
    }
  });

  it('rejects a family whose template differs from its own candidate', () => {
    const document = source();
    for (const merge of [{ kind: 'widgets' as const, accepts: isButton }, { kind: 'containers' as const }]) {
      const spec = { ...widgetSpec(tamper(resolveP15ElementorButtonTextColors, isButton, (s) => { s.button_text_color = '#000000'; }, true),
        resolveP15ElementorButtonTextColors, ['button_text_color'], ['button_text_color']), merge };
      expect(composeFamilies(spec, document, composition(document, { a: buttonManifest(document) })).issues)
        .toEqual([{ code: 'T_FAMILY_DRIFT', family: 'a' }]);
    }
  });

  it('rejects a family result with another family\'s status', () => {
    const document = source();
    const spec = widgetSpec(resolveP15ElementorButtonTextColors, resolveP15ElementorButtonTextColors, ['button_text_color'], ['button_text_color']);
    const wrong = { ...spec, steps: { ...spec.steps, a: { ...spec.steps.a, resolvedStatus: 'BUTTON_HOVER_TEXT_COLORS_RESOLVED' } } };
    expect(composeFamilies(wrong, document, composition(document, { a: buttonManifest(document) })).issues)
      .toEqual([{ code: 'T_FAMILY_REJECTED', family: 'a' }]);
  });

  it('serializer refuses unknown issue codes, duplicate families and inflated authority', () => {
    const document = source();
    const spec = widgetSpec(resolveP15ElementorButtonTextColors, resolveP15ElementorButtonTextColors, ['button_text_color'], ['hover_color']);
    const ok = composeFamilies(spec, document, composition(document, { a: buttonManifest(document) }));
    expect(serializeCompositionSummary(spec, ok)).toContain('"appliedFamilies": [\n    "a"\n  ]');
    for (const bad of [{ ...ok, appliedFamilies: ['a', 'a'] }, { ...ok, downloadEnabled: true },
      { ...ok, status: 'REJECTED', resolvedCandidateIdentityDigest: null, appliedFamilies: [], issues: [{ code: 'OTHER', family: null }] }]) {
      expect(() => serializeCompositionSummary(spec, bad as never)).toThrow('Invalid or authority-inflated Test composition result.');
    }
  });
});
