# P14 Candidate Re-score Evidence Hardening

Status: IMPLEMENTATION FOUNDATION ONLY — RUNTIME UNWIRED  
Foundation issue: #179  
Roadmap: #119  
Dependencies still open: P13 real-Figma acceptance (#159) and final production release gate (#84)

## Purpose

The frozen P14 preparation specification requires the accepted P13 Build-Ready model to re-score a validated candidate before retention. A TypeScript adapter return type is not runtime trust, so candidate re-score output must be validated before any field is used for preparation acceptance or finalization.

## Accepted scored P13 domain

The accepted P13 core defines these Build-Ready statuses:

- `READY`;
- `REVIEW`;
- `NOT_READY`;
- `INSUFFICIENT_EVIDENCE`.

For scored reports, P13 clamps the numeric score to an integer from 0 through 100. `INSUFFICIENT_EVIDENCE` is different: the accepted P13 model emits `score: null` for that status.

`P14RescoreSummary` currently carries a numeric score. Therefore the P14 runtime re-score evidence boundary accepts only the scored P13 statuses `READY`, `REVIEW` and `NOT_READY`. A numeric summary claiming `INSUFFICIENT_EVIDENCE` is internally contradictory to the accepted P13 report contract and fails closed instead of inventing a numeric score for missing evidence.

This does not create a new score threshold for P14 preparation. The P14 specification explicitly says score improvement alone is not sufficient for acceptance and does not require the candidate to reach `READY`. The source design remains authoritative over score chasing.

## Runtime evidence validation

`validateP14RescoreEvidence(...)` treats adapter output as unknown runtime evidence and requires:

- an object result;
- bounded, non-empty `runId` and `status` identities;
- status inside the accepted scored P13 domain;
- a finite integer score from 0 through 100;
- non-negative safe-integer blocker/high-risk/introduced-risk counts;
- boolean `reviewRequired` evidence.

Invalid evidence is not normalized into a plausible score and is not attached to the receipt as if it were trustworthy. Failure messages are bounded and do not echo hostile oversized identity values.

## Transaction behavior

After mandatory candidate validation succeeds, P14 requests the candidate re-score and validates the returned evidence before dereferencing it.

Malformed, null, non-finite, out-of-domain or otherwise invalid re-score evidence:

1. returns `P14_RESCORE_FAILED`;
2. discards the candidate by the normal cleanup path;
3. does not enter source-finalization/retention;
4. does not attach the invalid raw re-score object to the receipt;
5. becomes `CLEANUP_REQUIRED` only if candidate discard itself fails.

Valid evidence then enters the existing preparation-acceptance policy as a separate step. In particular, a valid `introducedBlockerOrHighCount > 0` remains a `P14_VALIDATION_FAILED` outcome because the evidence is structurally valid but proves the preparation introduced a forbidden HIGH/BLOCKER result.

Likewise, `reviewRequired=true` still requires the explicit `allowPreparedWithReview` policy. Re-score shape validation does not silently convert review evidence into approval.

## Receipt integrity

`validateP14PreparationReceipt(...)` reuses the same re-score evidence validator. A copied or forged receipt cannot bypass the runtime boundary by inserting NaN, Infinity, negative/fractional counts, unsupported statuses, oversized identities or numeric `INSUFFICIENT_EVIDENCE` evidence.

Receipt validation remains evidence validation only. It grants no mutation authority, target compatibility, publish authority or production acceptance.

## Deliberate non-scope

This slice does not:

- change P13 scoring weights, thresholds or findings;
- create a new P14 score target;
- implement a real Figma re-score adapter;
- expose a P14 Figma command, UI or mutation path;
- register a production mutating recipe;
- create Elementor/Gutenberg/framework readiness claims;
- change P13 #159 or P12 #84 acceptance state.

Production safe-recipe authority remains intentionally empty and P14 remains implementation-foundation only.
