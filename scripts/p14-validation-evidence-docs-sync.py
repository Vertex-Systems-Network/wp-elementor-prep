from pathlib import Path

DOC = Path('docs/P14_FOUNDATION_IMPLEMENTATION.md')


def replace_exact(old: str, new: str, count: int = 1):
    text = DOC.read_text()
    actual = text.count(old)
    if actual != count:
        raise SystemExit(f'{DOC}: expected {count} copies of anchor, found {actual}')
    DOC.write_text(text.replace(old, new, count))

replace_exact(
    'Foundation issues: #163, #165, #169, #171, #173, #175, #177, #179, #181, #184, #186, #188  ',
    'Foundation issues: #163, #165, #169, #171, #173, #175, #177, #179, #181, #184, #186, #188, #190  ',
)

replace_exact(
    'It includes explicit P13→P14 handoff, versioned safe-recipe authorization, bounded input preflight, deterministic dependency-topological planning, explicit reviewed-plan confirmation, plan/receipt integrity validation, retained-duplicate transaction semantics, candidate-only recipe callbacks, sequential runtime action-eligibility re-evaluation, bounded adapter-output evidence, active-recipe validation-profile coverage, mandatory validation/re-score, bounded re-score evidence validation, bounded runtime source-fingerprint evidence, source-immutability proof, cooperative cancellation with bounded callback-failure handling, fail-closed cleanup and source-scope transaction coordination.',
    'It includes explicit P13→P14 handoff, versioned safe-recipe authorization, bounded input preflight, deterministic dependency-topological planning, explicit reviewed-plan confirmation, plan/receipt integrity validation, retained-duplicate transaction semantics, candidate-only recipe callbacks, sequential runtime action-eligibility re-evaluation, bounded adapter-output evidence, active-recipe validation-profile coverage, bounded validation-check evidence, mandatory validation/re-score, bounded re-score evidence validation, bounded runtime source-fingerprint evidence, source-immutability proof, cooperative cancellation with bounded callback-failure handling, fail-closed cleanup and source-scope transaction coordination.',
)

anchor = '''Validation-profile coverage and generic mandatory validation checks are independent gates. Both must pass before Build-Ready re-score can start. Profile coverage proves only that declared validator profiles were represented in execution evidence; it does not prove the validators are externally accepted, prove target compatibility or grant runtime/production acceptance.\n\n## Candidate re-score evidence hardening\n'''
replacement = '''Validation-profile coverage and generic mandatory validation checks are independent gates. Both must pass before Build-Ready re-score can start. Profile coverage proves only that declared validator profiles were represented in execution evidence; it does not prove the validators are externally accepted, prove target compatibility or grant runtime/production acceptance.\n\n## Bounded validation-check evidence\n\n`validateP14ValidationEvidence(...)` treats the adapter-provided validation summary and its `checks` array as untrusted runtime evidence before policy evaluation or receipt attachment. Strong TypeScript return types are not runtime authority.\n\nThe validator enforces resource and evidence bounds before the transaction can trust check data:\n\n- `checks` must be an explicit array and its count is bounded by the existing P14 action-count safety limit;\n- an oversized check array is rejected from `.length` before any item traversal;\n- every check ID must be a non-empty string within the existing P14 identity bound;\n- optional check detail must be a string within the existing P14 detail bound;\n- `passed` and `required` must be booleans;\n- only accepted bounded checks are normalized into transaction evidence.\n\nMalformed or oversized validation-check evidence follows `P14_VALIDATION_FAILED`, discards the candidate and stops before re-score or retention. Raw hostile oversized check detail is not copied into the receipt. Receipt integrity reuses the same bounded check validator, so copied/forged receipts cannot bypass the runtime resource contract.\n\nThis shape/resource gate remains separate from validation-profile coverage and from the generic mandatory-check policy. It does not decide whether a required check should exist, does not authorize a validator, and does not create target-readiness or production-acceptance evidence.\n\n## Candidate re-score evidence hardening\n'''
replace_exact(anchor, replacement)

replace_exact(
    'Receipt validation rejects contradictory/malformed status, candidate, retention, source-fingerprint, error, event, validation, re-score and recipe-execution evidence. Validation profile evidence must be present, bounded and duplicate-free where validation evidence is carried; prepared outcomes require non-empty profile execution evidence. Runtime/receipt re-score evidence uses the same accepted scored-P13 validator.',
    'Receipt validation rejects contradictory/malformed status, candidate, retention, source-fingerprint, error, event, validation, re-score and recipe-execution evidence. Validation profile evidence must be present, bounded and duplicate-free where validation evidence is carried; validation-check count, IDs, boolean fields and optional detail are bounded through the same shared validator used at runtime; prepared outcomes require non-empty profile execution evidence. Runtime/receipt re-score evidence uses the same accepted scored-P13 validator.',
)

replace_exact(
    '33. Acquired transaction leases are released in a bounded `finally` path, including cancellation-check failure paths.\n',
    '33. Acquired transaction leases are released in a bounded `finally` path, including cancellation-check failure paths.\n34. Validation-check arrays are count-bounded before traversal, and check IDs/details are bounded before policy evaluation or receipt attachment.\n35. Validation-check shape/resource validation remains separate from profile coverage and required-check policy; bounded evidence alone never proves target readiness.\n',
)
