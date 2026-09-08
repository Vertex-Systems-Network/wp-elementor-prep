import { describe, expect, it } from 'vitest';
import type { AdvancedRecipePlan } from '../src/core/advanced-recipe-types';
import { P5_RUNTIME_GATE_VERSION } from '../src/core/p5-runtime-gate';
import { assessP6PreservationRefusalAcceptance } from '../src/plugin/p6-refusal-acceptance';
import {
  buildP6PreservationRefusalEvidenceBundle,
  P6_REFUSAL_EVIDENCE_SCHEMA_VERSION,
} from '../src/plugin/p6-refusal-evidence';

function preservePlan(id = 'overlay'): AdvancedRecipePlan {
  return {
    schemaVersion: 1,
    decision: 'PRESERVE',
    recipe: null,
    reasonCode: 'PRESERVATION_RELATIONSHIP_REQUIRED',
    reason: 'Overlay relationship must remain absolute and layered.',
    confidence: 99,
    minConfidence: null,
    pattern: 'header-hero-overlay',
    targetNodeId: id,
    targetNodeName: 'Header Hero Overlay',
    targetPath: [0],
    preserveNodeIds: ['badge', 'hero-art'],
    mutationEnabled: false,
    futureMutationRequiresFullP3: true,
    futureMutationRequiresP4Rollback: true,
    evidence: { diagnosticBlob: 'must-not-be-copied' },
  };
}

function reviewPlan(): AdvancedRecipePlan {
  return {
    schemaVersion: 1,
    decision: 'REVIEW',
    recipe: 'timeline-flow',
    reasonCode: 'DETECTION_REQUIRES_REVIEW',
    reason: 'Timeline is ambiguous.',
    confidence: 74,
    minConfidence: 94,
    pattern: 'timeline-sequence',
    targetNodeId: 'timeline',
    targetNodeName: 'Timeline',
    targetPath: [1],
    preserveNodeIds: [],
    mutationEnabled: false,
    futureMutationRequiresFullP3: true,
    futureMutationRequiresP4Rollback: true,
    evidence: { largeEvidence: 'omitted' },
  };
}

function calibratePageFlowPlan(): AdvancedRecipePlan {
  return {
    schemaVersion: 1,
    decision: 'CALIBRATE',
    recipe: 'page-vertical-flow',
    reasonCode: 'CANDIDATE_READY_FOR_CALIBRATION',
    reason: 'Unsafe fixture for refusal acceptance.',
    confidence: 99,
    minConfidence: 94,
    pattern: 'page-vertical-flow',
    targetNodeId: 'frame',
    targetNodeName: 'Desktop Page',
    targetPath: [],
    preserveNodeIds: [],
    mutationEnabled: false,
    futureMutationRequiresFullP3: true,
    futureMutationRequiresP4Rollback: true,
    evidence: {},
  };
}

function build(plans: AdvancedRecipePlan[], maxPlans?: number) {
  return buildP6PreservationRefusalEvidenceBundle({
    pluginVersion: '0.1.0-alpha.1',
    p5RuntimeProofPassedAt: '2026-09-08T10:00:00.000Z',
    frame: { id: 'frame', name: 'Preservation Page' } as FrameNode,
    outcome: {
      status: 'NO_CANDIDATE',
      reason: 'Fresh P6 analysis found no unambiguous page-flow calibration candidate.',
      plans,
    },
    capturedAt: '2026-09-08T10:01:00.000Z',
    ...(maxPlans === undefined ? {} : { maxPlans }),
  });
}

describe('P6 preservation refusal evidence', () => {
  it('captures a bounded complete refusal plan set without diagnostic trees and accepts explicit PRESERVE evidence', () => {
    const evidence = build([preservePlan(), reviewPlan()]);

    expect(evidence.schemaVersion).toBe(P6_REFUSAL_EVIDENCE_SCHEMA_VERSION);
    expect(evidence.p5RuntimeGateVersion).toBe(P5_RUNTIME_GATE_VERSION);
    expect(evidence.outcomeStatus).toBe('NO_CANDIDATE');
    expect(evidence.totalPlanCount).toBe(2);
    expect(evidence.plansTruncated).toBe(false);
    expect(evidence.plans[0]).toMatchObject({
      decision: 'PRESERVE',
      reasonCode: 'PRESERVATION_RELATIONSHIP_REQUIRED',
      preserveNodeIds: ['badge', 'hero-art'],
      mutationEnabled: false,
    });
    expect(JSON.stringify(evidence)).not.toContain('diagnosticBlob');
    expect(JSON.stringify(evidence)).not.toContain('largeEvidence');
    expect(assessP6PreservationRefusalAcceptance(evidence)).toEqual({ accepted: true, failures: [] });
  });

  it('fails closed when a page-flow CALIBRATE plan remains in the alleged refusal evidence', () => {
    const assessment = assessP6PreservationRefusalAcceptance(build([
      preservePlan(),
      calibratePageFlowPlan(),
    ]));

    expect(assessment.accepted).toBe(false);
    expect(assessment.failures).toContain('P6 refusal evidence still contains a page-vertical-flow CALIBRATE plan.');
  });

  it('fails closed without imported P5 proof or an explicit preservation-sensitive PRESERVE plan', () => {
    const evidence = build([reviewPlan()]);
    evidence.p5RuntimeProofPassedAt = null;
    const assessment = assessP6PreservationRefusalAcceptance(evidence);

    expect(assessment.accepted).toBe(false);
    expect(assessment.failures).toContain('P6 refusal evidence was captured without a valid imported P5 runtime proof.');
    expect(assessment.failures).toContain('P6 refusal evidence contains no explicit preservation-sensitive PRESERVE plan.');
  });

  it('surfaces truncation rather than claiming acceptance from a partial plan set', () => {
    const evidence = build([preservePlan('a'), preservePlan('b'), reviewPlan()], 2);
    expect(evidence.totalPlanCount).toBe(3);
    expect(evidence.plans).toHaveLength(2);
    expect(evidence.plansTruncated).toBe(true);

    const assessment = assessP6PreservationRefusalAcceptance(evidence);
    expect(assessment.accepted).toBe(false);
    expect(assessment.failures).toContain('P6 refusal plan evidence was truncated; the complete decision set is required.');
    expect(assessment.failures).toContain('P6 refusal plan count does not match the complete captured plan set.');
  });
});
