import { describe, expect, it } from 'vitest';
import { P17_NEUTRAL_WEB_IR_VERSION, type P17NeutralWebDocumentV1 } from '../src/targets/web/neutral-web-ir';
import { analyzeReactWeb, generateReactWebArtifact, validateReactWebArtifact } from '../src/targets/react/static-adapter';

const profile = { language: 'typescript' as const, styling: 'plain-css' as const, scope: 'COMPONENT' as const, componentName: 'Landing', availableAssetPaths: ['assets/hero.png'] };
const provenance = (sourceRef: string) => ({ source: 'FIGMA' as const, sourceRef });
function fixture(): P17NeutralWebDocumentV1 {
  return {
    schemaVersion: 1, irVersion: P17_NEUTRAL_WEB_IR_VERSION, title: 'React fixture', language: 'en', direction: 'DESIGN_TO_WEB',
    nodes: [{
      kind: 'container', nodeId: 'root', provenance: provenance('1:1'), semanticTag: 'main',
      layout: { mode: 'flex', direction: 'column', gapPx: 16 }, style: { paddingPx: { top: 12, right: 12, bottom: 12, left: 12 } },
      children: [
        { kind: 'text', nodeId: 'heading', provenance: provenance('1:2'), semantic: 'heading', headingLevel: 1, text: '<Hello>' },
        { kind: 'image', nodeId: 'hero', provenance: provenance('1:3'), assetPath: 'assets/hero.png', alt: 'Hero', widthPx: 100, heightPx: 50 },
        { kind: 'link', nodeId: 'link', provenance: provenance('1:4'), role: 'link', text: 'Docs', href: 'https://example.com/docs' },
      ],
    }],
  };
}

describe('P18 bounded React static adapter', () => {
  it('generates deterministic TSX/CSS with source identity and hashes', () => {
    const first = generateReactWebArtifact(fixture(), profile);
    const second = generateReactWebArtifact(fixture(), profile);
    expect(first.status).toBe('READY');
    expect(first.files).toHaveLength(2);
    expect(first.files).toEqual(second.files);
    expect(first.receipt).toEqual(second.receipt);
    expect(first.files[0]?.content).toContain('data-wpb-source="1:2"');
    expect(first.files[0]?.content).toContain('&lt;Hello&gt;');
    expect(first.files[0]?.content).not.toContain('<script');
    expect(validateReactWebArtifact(first)).toEqual({ valid: true, issues: [] });
  });

  it('blocks missing local asset bytes and never emits files', () => {
    const result = generateReactWebArtifact(fixture(), { ...profile, availableAssetPaths: [] });
    expect(result.status).toBe('BLOCKED');
    expect(result.files).toEqual([]);
    expect(result.analysis.diagnostics.some((item) => item.code === 'ASSET_BYTES_UNVERIFIED')).toBe(true);
  });

  it('keeps review nodes explicit and separate from ready status', () => {
    const document = fixture();
    document.nodes = [{ kind: 'review', nodeId: 'review', provenance: provenance('2:1'), reasonCode: 'UNSUPPORTED_INTERACTION', detail: 'Manual review required.' }];
    const result = generateReactWebArtifact(document, profile);
    expect(result.status).toBe('READY_WITH_REVIEW');
    expect(result.files).toHaveLength(2);
    expect(result.files[0]?.content).toContain('wpb-review');
    expect(result.receipt.productionAcceptance).toBe(false);
  });

  it('blocks reverse direction and invalid component names', () => {
    const reverse = fixture();
    reverse.direction = 'WEB_TO_DESIGN';
    const result = analyzeReactWeb(reverse, profile);
    expect(result.status).toBe('BLOCKED');
    expect(result.diagnostics.map((item) => item.code)).toContain('IR_DIRECTION_UNSUPPORTED');
    expect(analyzeReactWeb(fixture(), { ...profile, componentName: 'bad-name' }).status).toBe('BLOCKED');
  });
});
