import type { AuditNode } from './types';

export const BUILD_READY_SCORE_VERSION = 2 as const;
export const RESPONSIVE_RISK_VERSION = 1 as const;
export const BUILD_READY_SCHEMA_VERSION = 1 as const;

export type BuildReadyCategory =
  | 'STRUCTURE'
  | 'RESPONSIVE_RISK'
  | 'CONSISTENCY'
  | 'HANDOFF_READINESS'
  | 'QA_ADVISORIES';

export type BuildReadyStatus =
  | 'READY'
  | 'REVIEW'
  | 'NOT_READY'
  | 'INSUFFICIENT_EVIDENCE';

export type BuildReadySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'BLOCKER';
export type BuildReadyRemediationClass = 'ADVISORY' | 'P14_SAFE_CANDIDATE' | 'MANUAL_REVIEW';

export interface BuildReadyRunConfig {
  referenceWidths: number[];
  minOverallCoverage: number;
  maxCollisionChildren: number;
  maxFindingsPerRule: number;
  maxNodes: number;
}

export interface BuildReadyRuleDefinition {
  id: string;
  version: number;
  category: BuildReadyCategory;
  severity: BuildReadySeverity;
  confidencePolicy: 'HIGH_ONLY' | 'MEDIUM_PLUS' | 'ADVISORY';
  maxPenalty: number;
  dedupeKeyStrategy: string;
  remediationClass: BuildReadyRemediationClass;
}

export interface BuildReadyFinding {
  id: string;
  ruleId: string;
  ruleVersion: number;
  category: BuildReadyCategory;
  relatedCategories: BuildReadyCategory[];
  severity: BuildReadySeverity;
  confidence: number;
  title: string;
  detail: string;
  nodeIds: string[];
  evidence: Record<string, string | number | boolean>;
  penalty: number;
  remediationClass: BuildReadyRemediationClass;
  targetAgnostic: true;
}

export interface BuildReadyCategoryResult {
  category: BuildReadyCategory;
  score: number | null;
  status: BuildReadyStatus;
  applicableWeight: number;
  coverage: number;
  findingCount: number;
  penaltiesApplied: number;
}

export interface EvidenceCoverage {
  scannedNodes: number;
  eligibleNodes: number;
  analyzedNodes: number;
  unsupportedNodes: number;
  unknownGeometryNodes: number;
  categoryCoverage: Record<BuildReadyCategory, number>;
  overallCoverage: number;
}

export interface BuildReadyScoreResult {
  score: number | null;
  status: BuildReadyStatus;
  hasHighRisk: boolean;
  blockerCount: number;
}

export interface ResponsiveRiskSummary {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'BLOCKER' | 'UNKNOWN';
  findingCount: number;
  highRiskCount: number;
  triggeredReferenceWidths: number[];
}

export interface BuildReadySourceFingerprint {
  rootId: string;
  rootName: string;
  structuralHash: string;
  configHash: string;
  analyzerVersion: string;
}

export interface BuildReadyLimitation {
  code: string;
  detail: string;
  consequence: 'DEFERRED_RULE' | 'REDUCED_CONFIDENCE' | 'INSUFFICIENT_EVIDENCE';
}

export interface BuildReadyReportV2 {
  schemaVersion: typeof BUILD_READY_SCHEMA_VERSION;
  buildReadyScoreVersion: typeof BUILD_READY_SCORE_VERSION;
  responsiveRiskVersion: typeof RESPONSIVE_RISK_VERSION;
  runId: string;
  generatedAt: string;
  source: BuildReadySourceFingerprint;
  config: BuildReadyRunConfig;
  score: BuildReadyScoreResult;
  categories: BuildReadyCategoryResult[];
  responsiveRisk: ResponsiveRiskSummary;
  findings: BuildReadyFinding[];
  coverage: EvidenceCoverage;
  limitations: BuildReadyLimitation[];
}

export interface BuildReadyAnalysisContext {
  root: AuditNode;
  config: BuildReadyRunConfig;
}
