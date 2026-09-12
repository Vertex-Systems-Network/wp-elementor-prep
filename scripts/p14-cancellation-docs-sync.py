from pathlib import Path

DOC = Path('docs/P14_FOUNDATION_IMPLEMENTATION.md')


def replace_exact(old: str, new: str, count: int = 1):
    text = DOC.read_text()
    actual = text.count(old)
    if actual != count:
        raise SystemExit(f'{DOC}: expected {count} copies of anchor, found {actual}')
    DOC.write_text(text.replace(old, new, count))

replace_exact(
    'Foundation issues: #163, #165, #169, #171, #173, #175, #177, #179, #181, #184, #186  ',
    'Foundation issues: #163, #165, #169, #171, #173, #175, #177, #179, #181, #184, #186, #188  ',
)

replace_exact(
    'It includes explicit P13→P14 handoff, versioned safe-recipe authorization, bounded input preflight, deterministic dependency-topological planning, explicit reviewed-plan confirmation, plan/receipt integrity validation, retained-duplicate transaction semantics, candidate-only recipe callbacks, sequential runtime action-eligibility re-evaluation, bounded adapter-output evidence, active-recipe validation-profile coverage, mandatory validation/re-score, bounded re-score evidence validation, bounded runtime source-fingerprint evidence, source-immutability proof, cooperative cancellation, fail-closed cleanup and source-scope transaction coordination.',
    'It includes explicit P13→P14 handoff, versioned safe-recipe authorization, bounded input preflight, deterministic dependency-topological planning, explicit reviewed-plan confirmation, plan/receipt integrity validation, retained-duplicate transaction semantics, candidate-only recipe callbacks, sequential runtime action-eligibility re-evaluation, bounded adapter-output evidence, active-recipe validation-profile coverage, mandatory validation/re-score, bounded re-score evidence validation, bounded runtime source-fingerprint evidence, source-immutability proof, cooperative cancellation with bounded callback-failure handling, fail-closed cleanup and source-scope transaction coordination.',
)

anchor = """Receipt integrity applies the same bounded fingerprint shape contract while permitting `UNKNOWN` only as a receipt sentinel for unavailable proof. This validation establishes evidence shape/bounds only; it does not establish cryptographic strength, Figma identity, publisher identity, or external runtime acceptance.\n\n## Source-scope transaction coordination\n"""
replacement = """Receipt integrity applies the same bounded fingerprint shape contract while permitting `UNKNOWN` only as a receipt sentinel for unavailable proof. This validation establishes evidence shape/bounds only; it does not establish cryptographic strength, Figma identity, publisher identity, or external runtime acceptance.\n\n## Cancellation control hardening\n\n`shouldCancel()` is runtime control evidence, not a trusted boolean merely because its TypeScript signature says so. `assessP14CancellationCheck(...)` therefore distinguishes three outcomes: explicit `true`, explicit `false`, and callback failure.\n\nA callback failure includes synchronous throw, rejected promise, or a non-boolean runtime return. Failure is never relabeled as user-requested cancellation. Failure detail is bounded before it can enter receipt/event evidence.\n\nThe transaction applies this rule at every cooperative cancellation checkpoint: before clone, before each recipe execution checkpoint, before validation, and before finalization. A pre-clone callback failure returns a structured fail-closed receipt without cloning or mutating. Once a candidate exists, callback failure first attempts candidate discard and returns the normal rejection path; if discard itself fails, the result becomes `CLEANUP_REQUIRED`.\n\nNormal `true` cancellation semantics remain unchanged: pre-clone cancellation performs no clone, while post-clone cancellation discards the candidate before returning `CANCELLED`. Callback failure and user cancellation remain separate evidence states.\n\nThe source-scope transaction lease remains covered by the outer bounded `finally` release path, so cancellation-check failure cannot intentionally retain coordinator ownership after the run returns. This is process-local transaction safety only; it is not host cancellation proof, user identity evidence or production acceptance.\n\n## Source-scope transaction coordination\n"""
replace_exact(anchor, replacement)

replace_exact(
    '24. Failed/cancelled candidates are discarded; discard failure becomes `CLEANUP_REQUIRED`.\n25. A no-op plan completes without cloning and without mutating-plan confirmation.\n26. Target-neutral preparation does not imply target readiness.\n27. Malformed/tampered plans are blocked before adapter access.\n28. Eligible recipes require current registry authorization before adapter access.\n29. P14 receipts have no acceptance/target-compatibility authority.\n30. One executable READY transaction may own a source scope at a time.\n31. Acquired transaction leases are released in a bounded `finally` path.',
    '24. Explicit cancellation and cancellation-check failure are distinct; callback failure is never emitted as `P14_CANCELLED`.\n25. Cancellation-check throw/reject/non-boolean results fail closed; after clone they require candidate cleanup before return.\n26. Failed/cancelled candidates are discarded; discard failure becomes `CLEANUP_REQUIRED`.\n27. A no-op plan completes without cloning and without mutating-plan confirmation.\n28. Target-neutral preparation does not imply target readiness.\n29. Malformed/tampered plans are blocked before adapter access.\n30. Eligible recipes require current registry authorization before adapter access.\n31. P14 receipts have no acceptance/target-compatibility authority.\n32. One executable READY transaction may own a source scope at a time.\n33. Acquired transaction leases are released in a bounded `finally` path, including cancellation-check failure paths.',
)
