import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_COMPATIBILITY_READINESS_VERSION,
  assessP15ElementorCompatibilityReadiness,
} from '../src/targets/elementor/compatibility-readiness';
import {
  P15_NEUTRAL_EXPORT_IR_VERSION,
  type P15NeutralExportDocumentV1,
} from '../src/targets/elementor/neutral-export-ir';

function document(nodes: P15NeutralExportDocumentV1['nodes']): P15NeutralExportDocumentV1 {
  return {
    schemaVersion: 1,
    irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
    title: 'Compatibility fixture',
    documentType: 'section',
    nodes,
  };
}

describe('P15 Elementor compatibility coverage + Target-Ready readiness', () => {
  it('classifies supported container + plain text as all native and READY', () => {
    const result = assessP15ElementorCompatibilityReadiness(document([
      {
        kind: 'container',
        sourceNodeId: 'container',
        direction: 'column',
        children: [
          { kind: 'text', sourceNodeId: 'copy', text: 'Hello', align: 'start' },
        ],
      },
    ]));

    expect(result.reportVersion).toBe(P15_ELEMENTOR_COMPATIBILITY_READINESS_VERSION);
    expect(result.status).toBe('READY');
    expect(result.compatibilityCoverage).toBe(100);
    expect(result.eligibleNodeCount).toBe(2);
    expect(result.counts).toEqual({
      native: 2,
      nativeWithReview: 0,
      convertible: 0,
      fallback: 0,
      unsupported: 0,
      unknown: 0,
    });
    expect(result.findings).toEqual([
      { sourceNodeId: 'container', category: 'NATIVE', reasonCode: 'P15_NATIVE_CONTAINER' },
      { sourceNodeId: 'copy', category: 'NATIVE', reasonCode: 'P15_NATIVE_TEXT_EDITOR' },
    ]);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
    expect(result.importValidationStatus).toBe('NOT_RUN');
    expect(result.targetEnvironmentValidationStatus).toBe('NOT_RUN');
    expect(result.downloadEnabled).toBe(false);
  });

  it('classifies known image representation with unresolved asset closure as NATIVE_WITH_REVIEW', () => {
    const result = assessP15ElementorCompatibilityReadiness(document([
      {
        kind: 'review',
        sourceNodeId: 'photo',
        reasonCode: 'IMAGE_ASSET_EXPORT_REQUIRED',
        detail: 'Asset closure is not available yet.',
      },
    ]));

    expect(result.status).toBe('READY_WITH_REVIEW');
    expect(result.compatibilityCoverage).toBe(100);
    expect(result.counts.nativeWithReview).toBe(1);
    expect(result.reviewItems).toEqual([
      { sourceNodeId: 'photo', category: 'NATIVE_WITH_REVIEW', reasonCode: 'IMAGE_ASSET_EXPORT_REQUIRED' },
    ]);
    expect(result.blockers).toEqual([]);
  });

  it('classifies unsupported visible source types as UNSUPPORTED and NOT_READY', () => {
    const result = assessP15ElementorCompatibilityReadiness(document([
      {
        kind: 'review',
        sourceNodeId: 'unsupported',
        reasonCode: 'UNSUPPORTED_NODE_TYPE',
        detail: 'Unsupported visible source type.',
      },
    ]));

    expect(result.status).toBe('NOT_READY');
    expect(result.compatibilityCoverage).toBe(0);
    expect(result.counts.unsupported).toBe(1);
    expect(result.blockers).toEqual([
      { sourceNodeId: 'unsupported', category: 'UNSUPPORTED', reasonCode: 'UNSUPPORTED_NODE_TYPE' },
    ]);
  });

  it.each([
    'MANUAL_LAYOUT_REQUIRES_REVIEW',
    'GRID_LAYOUT_REQUIRES_REVIEW',
    'WRAPPED_AUTO_LAYOUT_REQUIRES_REVIEW',
    'ABSOLUTE_POSITION_REQUIRES_REVIEW',
    'DEPTH_LIMIT_EXCEEDED',
    'NODE_LIMIT_EXCEEDED',
  ])('keeps %s visible as UNKNOWN / INSUFFICIENT_EVIDENCE', (reasonCode) => {
    const result = assessP15ElementorCompatibilityReadiness(document([
      {
        kind: 'review',
        sourceNodeId: `review-${reasonCode}`,
        reasonCode,
        detail: 'Current mapping evidence is insufficient.',
      },
    ]));

    expect(result.status).toBe('INSUFFICIENT_EVIDENCE');
    expect(result.compatibilityCoverage).toBe(0);
    expect(result.counts.unknown).toBe(1);
    expect(result.blockers[0]).toEqual(expect.objectContaining({ category: 'UNKNOWN', reasonCode }));
  });

  it('keeps unknown nodes in the denominator instead of inflating compatibility coverage', () => {
    const result = assessP15ElementorCompatibilityReadiness(document([
      { kind: 'text', sourceNodeId: 'copy', text: 'Known native text' },
      {
        kind: 'review',
        sourceNodeId: 'manual',
        reasonCode: 'MANUAL_LAYOUT_REQUIRES_REVIEW',
        detail: 'Manual layout is ambiguous.',
      },
    ]));

    expect(result.eligibleNodeCount).toBe(2);
    expect(result.counts.native).toBe(1);
    expect(result.counts.unknown).toBe(1);
    expect(result.compatibilityCoverage).toBe(50);
    expect(result.status).toBe('INSUFFICIENT_EVIDENCE');
  });

  it('returns zero coverage and INSUFFICIENT_EVIDENCE when no eligible nodes exist', () => {
    const result = assessP15ElementorCompatibilityReadiness(document([]));

    expect(result.eligibleNodeCount).toBe(0);
    expect(result.compatibilityCoverage).toBe(0);
    expect(result.status).toBe('INSUFFICIENT_EVIDENCE');
    expect(result.findings).toEqual([]);
  });

  it('is deterministic and exposes only bounded IDs/categories/reason codes in findings', () => {
    const fixture = document([
      {
        kind: 'container',
        sourceNodeId: 'root',
        direction: 'row',
        children: [
          { kind: 'heading', sourceNodeId: 'heading', text: 'Secret heading', level: 'h2' },
          { kind: 'button', sourceNodeId: 'button', text: 'Secret CTA', url: 'https://example.com/path' },
          { kind: 'image', sourceNodeId: 'image', url: 'https://example.com/private-image.jpg' },
        ],
      },
    ]);
    const first = assessP15ElementorCompatibilityReadiness(fixture);
    const second = assessP15ElementorCompatibilityReadiness(fixture);

    expect(first).toEqual(second);
    const serializedFindings = JSON.stringify(first.findings);
    expect(serializedFindings).not.toContain('Secret heading');
    expect(serializedFindings).not.toContain('Secret CTA');
    expect(serializedFindings).not.toContain('example.com');
  });

  it('fails closed with zero readiness coverage when the neutral document itself is invalid', () => {
    const invalid = document([
      { kind: 'text', sourceNodeId: 'duplicate', text: 'One' },
      { kind: 'text', sourceNodeId: 'duplicate', text: 'Two' },
    ]);
    const result = assessP15ElementorCompatibilityReadiness(invalid);

    expect(result.status).toBe('INSUFFICIENT_EVIDENCE');
    expect(result.compatibilityCoverage).toBe(0);
    expect(result.eligibleNodeCount).toBe(0);
    expect(result.findings).toEqual([]);
    expect(result.neutralValidationIssues.map((issue) => issue.code)).toContain('P15_IR_DUPLICATE_SOURCE_ID');
  });
});
