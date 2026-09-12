import { DEFAULT_P14_INPUT_BOUNDS } from './p14-input-bounds';
import { snapshotP14AdapterOutputRecord } from './p14-adapter-output-snapshot';
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
  const captured = snapshotP14AdapterOutputRecord(
    value,
    [
      'runId',
      'status',
      'score',
      'blockerCount',
      'highRiskCount',
      'introducedBlockerOrHighCount',
      'reviewRequired',
    ] as const,
    'P14 candidate re-score evidence',
  );
  if (!captured.valid || !captured.value) {
    return { valid: false, failures: captured.failures, value: null };
  }

  const failures: string[] = [];
  const runId = captured.value.runId;
  const status = captured.value.status;
  const score = captured.value.score;
  const blockerCount = captured.value.blockerCount;
  const highRiskCount = captured.value.highRiskCount;
  const introducedBlockerOrHighCount = captured.value.introducedBlockerOrHighCount;
  const reviewRequired = captured.value.reviewRequired;

  if (!boundedIdentity(runId)) {
    failures.push('P14 candidate re-score runId is missing or oversized.');
  }

  if (!boundedIdentity(status)) {
    failures.push('P14 candidate re-score status is missing or oversized.');
  } else if (status === 'INSUFFICIENT_EVIDENCE') {
    failures.push('P14 numeric re-score evidence cannot represent P13 INSUFFICIENT_EVIDENCE because the accepted P13 model uses score=null for that status.');
  } else if (!SCORED_BUILD_READY_STATUSES.has(status as BuildReadyStatus)) {
    failures.push('P14 candidate re-score status is outside the accepted scored P13 status domain.');
  }

  if (typeof score !== 'number'
    || !Number.isFinite(score)
    || !Number.isInteger(score)
    || score < 0
    || score > 100) {
    failures.push('P14 candidate re-score score must be a finite integer from 0 through 100.');
  }

  if (!nonNegativeSafeInteger(blockerCount)) {
    failures.push('P14 candidate re-score blockerCount must be a non-negative safe integer.');
  }
  if (!nonNegativeSafeInteger(highRiskCount)) {
    failures.push('P14 candidate re-score highRiskCount must be a non-negative safe integer.');
  }
  if (!nonNegativeSafeInteger(introducedBlockerOrHighCount)) {
    failures.push('P14 candidate re-score introducedBlockerOrHighCount must be a non-negative safe integer.');
  }
  if (typeof reviewRequired !== 'boolean') {
    failures.push('P14 candidate re-score reviewRequired must be boolean.');
  }

  if (failures.length > 0) return { valid: false, failures, value: null };

  return {
    valid: true,
    failures: [],
    value: {
      runId: runId as string,
      score: score as number,
      status: status as string,
      blockerCount: blockerCount as number,
      highRiskCount: highRiskCount as number,
      introducedBlockerOrHighCount: introducedBlockerOrHighCount as number,
      reviewRequired: reviewRequired as boolean,
    },
  };
}
