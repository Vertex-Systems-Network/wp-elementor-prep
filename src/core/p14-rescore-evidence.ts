import { DEFAULT_P14_INPUT_BOUNDS } from './p14-input-bounds';
import type { BuildReadyStatus } from './build-ready-types';
import type { P14RescoreSummary } from './p14-preparation-types';

const SCORED_BUILD_READY_STATUSES = new Set<BuildReadyStatus>([
  'READY',
  'REVIEW',
  'NOT_READY',
]);

export interface P14RescoreEvidenceValidation {
  valid: boolean;
  failures: string[];
  value: P14RescoreSummary | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function boundedIdentity(value: unknown): value is string {
  return typeof value === 'string'
    && value.length > 0
    && value.length <= DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength;
}

function nonNegativeSafeInteger(value: unknown): value is number {
  return typeof value === 'number'
    && Number.isSafeInteger(value)
    && value >= 0;
}

export function validateP14RescoreEvidence(value: unknown): P14RescoreEvidenceValidation {
  const failures: string[] = [];
  if (!isRecord(value)) {
    return {
      valid: false,
      failures: ['P14 candidate re-score evidence must be an object.'],
      value: null,
    };
  }

  if (!boundedIdentity(value.runId)) {
    failures.push('P14 candidate re-score runId is missing or oversized.');
  }

  if (!boundedIdentity(value.status)) {
    failures.push('P14 candidate re-score status is missing or oversized.');
  } else if (value.status === 'INSUFFICIENT_EVIDENCE') {
    failures.push('P14 numeric re-score evidence cannot represent P13 INSUFFICIENT_EVIDENCE because the accepted P13 model uses score=null for that status.');
  } else if (!SCORED_BUILD_READY_STATUSES.has(value.status as BuildReadyStatus)) {
    failures.push('P14 candidate re-score status is outside the accepted scored P13 status domain.');
  }

  if (typeof value.score !== 'number'
    || !Number.isFinite(value.score)
    || !Number.isInteger(value.score)
    || value.score < 0
    || value.score > 100) {
    failures.push('P14 candidate re-score score must be a finite integer from 0 through 100.');
  }

  if (!nonNegativeSafeInteger(value.blockerCount)) {
    failures.push('P14 candidate re-score blockerCount must be a non-negative safe integer.');
  }
  if (!nonNegativeSafeInteger(value.highRiskCount)) {
    failures.push('P14 candidate re-score highRiskCount must be a non-negative safe integer.');
  }
  if (!nonNegativeSafeInteger(value.introducedBlockerOrHighCount)) {
    failures.push('P14 candidate re-score introducedBlockerOrHighCount must be a non-negative safe integer.');
  }
  if (typeof value.reviewRequired !== 'boolean') {
    failures.push('P14 candidate re-score reviewRequired must be boolean.');
  }

  if (failures.length > 0) return { valid: false, failures, value: null };

  return {
    valid: true,
    failures: [],
    value: {
      runId: value.runId as string,
      score: value.score as number,
      status: value.status as string,
      blockerCount: value.blockerCount as number,
      highRiskCount: value.highRiskCount as number,
      introducedBlockerOrHighCount: value.introducedBlockerOrHighCount as number,
      reviewRequired: value.reviewRequired as boolean,
    },
  };
}
