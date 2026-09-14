from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    p = Path(path)
    text = p.read_text(encoding='utf-8')
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{path}: expected exactly one match, found {count}: {old[:120]!r}')
    p.write_text(text.replace(old, new, 1), encoding='utf-8')


MAIN = '464461a86a4aed4bd43260baee79619a25216c2b'

# README.md
replace_once(
    'README.md',
    '- P15 Elementor R1 foundation: v0.4/container validation, bounded widget-capability reporting, exact candidate/import-evidence binding, immutable declared target profiles, read-only profile assessment, bounded global/core-image asset review, deterministic combined reference identity, exact-bound external closure-evidence receipts, offline closure-evidence operator intake and deterministic non-authorizing pre-decision review packets;',
    '- P15 Elementor R1 foundation: v0.4/container validation, bounded widget-capability reporting, exact candidate/import-evidence binding, immutable declared target profiles, read-only profile assessment, bounded global/core-image asset review, deterministic combined reference identity, exact-bound external closure-evidence receipts, offline closure-evidence operator intake, deterministic non-authorizing pre-decision review packets and exact-bound externally reported authentication-result binding;',
)
replace_once(
    'README.md',
    '`250f3d2f82f0f7ca8a5c374ff0199ffef39d16ba`',
    f'`{MAIN}`',
)
replace_once(
    'README.md',
    '- PR #338 added a deterministic sanitized pre-decision reference-closure review packet. Exact-bound PASS advances only to `REPORTED_PASS_AUTHENTICATION_REQUIRED`; evidence authentication and internal decision stay `NOT_RUN`, all authority flags remain false, and raw evidence references/global values/asset URLs remain absent; guarded squash merge `250f3d2f82f0f7ca8a5c374ff0199ffef39d16ba`.',
    '- PR #338 added a deterministic sanitized pre-decision reference-closure review packet. Exact-bound PASS advances only to `REPORTED_PASS_AUTHENTICATION_REQUIRED`; evidence authentication and internal decision stay `NOT_RUN`, all authority flags remain false, and raw evidence references/global values/asset URLs remain absent; guarded squash merge `250f3d2f82f0f7ca8a5c374ff0199ffef39d16ba`.\n- PR #340 synchronized canonical README/P14/project-state/next-actions through the pre-decision review-packet slice; guarded squash merge `34b77b567d49423dae9e15212cf4c82cf842eca5`.\n- PR #343 added exact binding for a caller-supplied externally reported evidence-authentication result to the current reference-review identity, canonical closure-receipt SHA-256 and SHA-256 of each required evidence reference. `EXTERNALLY_REPORTED_PASS` is not repository authentication or closure authority; all authority flags stay false and `internalDecisionStatus=NOT_RUN`; exact head `e75a30ecd4d38b17ea0b56300827f5a3e06e0b0d` passed CI #1114, P12 Final Release Artifact #425 and P12 Offline Acceptance #469 on Windows/macOS/Ubuntu before guarded squash merge `464461a86a4aed4bd43260baee79619a25216c2b`. Integration Readiness did not trigger for this code-only diff.',
)
replace_once(
    'README.md',
    '| P15 Elementor native export + validation | CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED | N/A | `──────────` | Exact candidate/profile/import evidence + bounded global/core-image asset review + combined reference identity + external closure receipt + offline operator intake + non-authorizing pre-decision review packet are merged; genuine evidence authentication/internal decision, real target import, Figma semantic generation and product download remain unaccepted/unwired |',
    '| P15 Elementor native export + validation | CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED | N/A | `──────────` | Exact candidate/profile/import evidence + bounded global/core-image asset review + combined reference identity + external closure receipt + offline operator intake + non-authorizing pre-decision review packet + exact-bound externally reported authentication-result binding are merged; genuine trusted authentication/internal decision, real target import, Figma semantic generation and product download remain unaccepted/unwired |',
)

# docs/P14_FOUNDATION_IMPLEMENTATION.md
replace_once(
    'docs/P14_FOUNDATION_IMPLEMENTATION.md',
    'Canonical status synchronized through P14 review-packet and P15 R1 profile/reference-review/closure-evidence/operator-intake/pre-decision-review merges',
    'Canonical status synchronized through P14 review-packet and P15 R1 profile/reference-review/closure-evidence/operator-intake/pre-decision-review/external-authentication-binding merges',
)
replace_once(
    'docs/P14_FOUNDATION_IMPLEMENTATION.md',
    '`250f3d2f82f0f7ca8a5c374ff0199ffef39d16ba`',
    f'`{MAIN}`',
)
replace_once(
    'docs/P14_FOUNDATION_IMPLEMENTATION.md',
    'P12 remains at its retained 80% release-exit state. P15 now has a bounded non-authorizing Elementor R1 foundation: v0.4/container validation, documented-core capability reporting, candidate identity/receipt + offline import intake, immutable declared target-profile fingerprints, profile-bound import evidence, read-only profile alignment, global-reference key review, exact core-image MEDIA asset review, a deterministic combined reference-review identity, an exact-bound external closure-evidence receipt contract, an offline closure-evidence operator intake and a deterministic pre-decision review packet. Real target import remains unvalidated; raw global values and asset URLs are not resolved/emitted; the operator intake does not authenticate external evidence references; `BOUND_REPORTED_PASS` advances only to authentication-required review, with `evidenceAuthenticationStatus=NOT_RUN` and `internalDecisionStatus=NOT_RUN`; all closure/compatibility/production/generation/download authority remains disabled; and no Figma-to-Elementor generation/download surface is wired. P16-P26 remain preflight-frozen / implementation-not-started. P27 #182 remains the final production-release gate.',
    'P12 remains at its retained 80% release-exit state. P15 now has a bounded non-authorizing Elementor R1 foundation: v0.4/container validation, documented-core capability reporting, candidate identity/receipt + offline import intake, immutable declared target-profile fingerprints, profile-bound import evidence, read-only profile alignment, global-reference key review, exact core-image MEDIA asset review, a deterministic combined reference-review identity, an exact-bound external closure-evidence receipt contract, an offline closure-evidence operator intake, a deterministic pre-decision review packet and an exact-bound externally reported authentication-result contract. Real target import remains unvalidated; raw global values and asset URLs are not resolved/emitted; repository code does not authenticate evidence references or identify/verify an authenticator; `EXTERNALLY_REPORTED_PASS` only means the supplied PASS report matches the exact current receipt/identity/reference hashes, while `internalDecisionStatus=NOT_RUN`; all closure/compatibility/production/generation/download authority remains disabled; and no Figma-to-Elementor generation/download surface is wired. P16-P26 remain preflight-frozen / implementation-not-started. P27 #182 remains the final production-release gate.',
)

# memory-bank/PROJECT_STATE.md
replace_once(
    'memory-bank/PROJECT_STATE.md',
    '8. bounded P15 Elementor R1 foundation with v0.4/container validation, documented-core capabilities, exact candidate/import-evidence binding, immutable declared target profiles, read-only alignment, bounded global/core-image asset review, combined reference identity, exact-bound external closure-evidence receipts, offline operator intake and deterministic non-authorizing pre-decision review packets;',
    '8. bounded P15 Elementor R1 foundation with v0.4/container validation, documented-core capabilities, exact candidate/import-evidence binding, immutable declared target profiles, read-only alignment, bounded global/core-image asset review, combined reference identity, exact-bound external closure-evidence receipts, offline operator intake, deterministic non-authorizing pre-decision review packets and exact-bound externally reported authentication-result binding;',
)
replace_once(
    'memory-bank/PROJECT_STATE.md',
    'Current verified main after the P15 R1 reference-closure pre-decision review-packet slice:\n\n`250f3d2f82f0f7ca8a5c374ff0199ffef39d16ba`',
    f'Current verified main after the P15 R1 externally reported authentication-binding slice:\n\n`{MAIN}`',
)
replace_once(
    'memory-bank/PROJECT_STATE.md',
    '- #338 non-authorizing pre-decision reference-closure review packet -> `250f3d2f82f0f7ca8a5c374ff0199ffef39d16ba`.',
    '- #338 non-authorizing pre-decision reference-closure review packet -> `250f3d2f82f0f7ca8a5c374ff0199ffef39d16ba`;\n- #340 canonical pre-decision packet docs sync -> `34b77b567d49423dae9e15212cf4c82cf842eca5`;\n- #343 exact-bound externally reported authentication-result binding -> `464461a86a4aed4bd43260baee79619a25216c2b`.',
)
replace_once(
    'memory-bank/PROJECT_STATE.md',
    'Focused issues #275, #280, #284, #285, #288, #295, #297, #299, #301, #303, #305, #307, #309, #311, #313, #315, #317, #319, #321, #323, #325, #327, #329, #331, #333 and #337 are completed through their reviewed implementation/artifact flows.',
    'Focused issues #275, #280, #284, #285, #288, #295, #297, #299, #301, #303, #305, #307, #309, #311, #313, #315, #317, #319, #321, #323, #325, #327, #329, #331, #333, #337, #339 and #342 are completed through their reviewed implementation/artifact flows.',
)
replace_once(
    'memory-bank/PROJECT_STATE.md',
    '- PR #338 — deterministic pre-decision reference-closure review packet. It binds the fresh current identity and canonical valid-receipt SHA-256, separates invalid/reported-fail/reported-pass states, keeps `evidenceAuthenticationStatus=NOT_RUN` and `internalDecisionStatus=NOT_RUN`, and grants no closure/compatibility/production/generation/download authority.',
    '- PR #338 — deterministic pre-decision reference-closure review packet. It binds the fresh current identity and canonical valid-receipt SHA-256, separates invalid/reported-fail/reported-pass states, keeps `evidenceAuthenticationStatus=NOT_RUN` and `internalDecisionStatus=NOT_RUN`, and grants no closure/compatibility/production/generation/download authority.\n- PR #343 — exact-bound externally reported evidence-authentication result contract. It requires the current authentication-required pre-decision packet and binds the supplied PASS|FAIL report to current identity digest, canonical receipt SHA-256 and SHA-256 of each required evidence reference without emitting the raw references. Repository code does not authenticate the evidence or verifier; even `EXTERNALLY_REPORTED_PASS` keeps `authenticationAuthority=false`, all closure/compatibility/production/generation/download authority false and `internalDecisionStatus=NOT_RUN`.',
)
replace_once(
    'memory-bank/PROJECT_STATE.md',
    'Real WordPress/Elementor target import remains unvalidated. `targetCompatibilityClaim=false`, production acceptance remains false, generation/download authority remains disabled, global-reference values remain unresolved, raw asset URLs are not emitted, the offline intake does not fetch/authenticate external evidence references, and the review packet explicitly leaves evidence authentication and internal decision `NOT_RUN`. Reported PASS still requires genuine authentication plus a separate internal decision, and no Figma-to-Elementor semantic generator, Elementor Pro/third-party mapping, gallery/video/add-on asset support or Atomic generation has been accepted.',
    'Real WordPress/Elementor target import remains unvalidated. `targetCompatibilityClaim=false`, production acceptance remains false, generation/download authority remains disabled, global-reference values remain unresolved, raw asset URLs are not emitted, and repository code does not fetch/authenticate external evidence references or identify/verify an authenticator. The exact-bound external authentication-report contract records only a caller-supplied PASS|FAIL result tied to current hashes; `EXTERNALLY_REPORTED_PASS` is not genuine authentication authority, and `internalDecisionStatus` remains `NOT_RUN`. Genuine trusted authentication plus a separate internal decision are still required, and no Figma-to-Elementor semantic generator, Elementor Pro/third-party mapping, gallery/video/add-on asset support or Atomic generation has been accepted.',
)
replace_once(
    'memory-bank/PROJECT_STATE.md',
    'Keep #159 genuine Figma Desktop evidence as the prerequisite before real P14 mutation exposure. In parallel, continue P15 only through bounded deterministic R1 target-adapter slices. Documented core-image asset review, combined reference-review identity, exact-bound closure-evidence receipt validation, offline operator intake and the non-authorizing pre-decision review packet are implemented. The next authority-bearing step requires genuine evidence authentication plus a separate internal decision; repository code must not fetch/authenticate evidenceReference values or treat reported PASS as closure/compatibility authority. Product download, semantic generation and target-compatibility authority stay disabled until genuine Elementor target validation and later gates justify them.',
    'Keep #159 genuine Figma Desktop evidence as the prerequisite before real P14 mutation exposure. In parallel, continue P15 only through bounded deterministic R1 target-adapter slices. Documented core-image asset review, combined reference-review identity, exact-bound closure-evidence receipt validation, offline operator intake, the non-authorizing pre-decision review packet and exact-bound externally reported authentication-result binding are implemented. The next authority-bearing step still requires genuine trusted authentication plus a separate internal decision; repository code must not fetch/authenticate evidenceReference values, infer authenticator identity, or treat `EXTERNALLY_REPORTED_PASS` as closure/compatibility authority. Product download, semantic generation and target-compatibility authority stay disabled until genuine Elementor target validation and later gates justify them.',
)

# memory-bank/NEXT_ACTIONS.md
replace_once(
    'memory-bank/NEXT_ACTIONS.md',
    '## Immediate action — P15 authenticated external closure + internal review boundary\n\nClassification: **PRE-DECISION REVIEW PACKET MERGED / AUTHENTICATED CLOSURE DECISION PENDING**.\n\nThe documented core-image asset review, combined global+asset reference-review identity, exact-bound external closure PASS/FAIL receipt contract, offline/operator intake and deterministic pre-decision review packet are merged. The next authority-bearing step requires genuine externally captured closure evidence authentication plus a separate internal review/decision; repository CI, synthetic receipts or fixture review packets cannot substitute for that evidence.\n\nUse `p15:reference-closure-intake` only to validate exact template/profile/receipt binding and sanitize operator evidence. Use `p15:reference-closure-review-packet` only to freeze that exact-bound reported state for human pre-decision review. `BOUND_REPORTED_PASS` / `REPORTED_PASS_AUTHENTICATION_REQUIRED` mean all currently required external reports say PASS; neither state authenticates `evidenceReference`, sets `referenceClosureClaim`, establishes target compatibility, or grants production/generation/download authority. Stale, REVIEW, BLOCKED and no-reference bypass attempts must continue to fail closed.\n\nDo not introduce a WordPress connection, target mutation, Pro/add-on availability inference, Atomic generation or product download UI merely to manufacture closure. No next code-side contract may turn `evidenceAuthenticationStatus=NOT_RUN` or `internalDecisionStatus=NOT_RUN` into authority without genuine retained evidence and an explicit separate decision path.',
    '## Immediate action — P15 genuine authentication + internal decision boundary\n\nClassification: **EXTERNAL AUTHENTICATION-REPORT BINDING MERGED / GENUINE AUTHENTICATION + INTERNAL DECISION PENDING**.\n\nThe documented core-image asset review, combined global+asset reference-review identity, exact-bound external closure PASS/FAIL receipt contract, offline/operator intake, deterministic pre-decision review packet and exact-bound externally reported authentication-result contract are merged. The next authority-bearing step still requires genuine trusted evidence authentication plus a separate internal review/decision; repository CI, synthetic receipts, fixture packets or caller-supplied PASS fields cannot substitute for that evidence.\n\nUse `p15:reference-closure-intake` only to validate exact template/profile/receipt binding and sanitize operator evidence. Use `p15:reference-closure-review-packet` only to freeze that exact-bound reported state for human pre-decision review. The external authentication-report contract may record `EXTERNALLY_REPORTED_PASS` only when the supplied PASS report matches the current reference-review identity digest, canonical receipt SHA-256 and SHA-256 of every required evidence reference. It does not fetch/authenticate evidence, identify a verifier, verify signatures, set `referenceClosureClaim`, establish target compatibility or grant production/generation/download authority; `authenticationAuthority=false` and `internalDecisionStatus=NOT_RUN` remain mandatory.\n\nDo not introduce a WordPress connection, target mutation, Pro/add-on availability inference, Atomic generation or product download UI merely to manufacture closure. No next code-side contract may convert caller-supplied authentication reporting into authority without genuine retained evidence and an explicit separate internal decision path.',
)
replace_once(
    'memory-bank/NEXT_ACTIONS.md',
    '- P15 — core foundation in progress / target import unvalidated: exact candidate/profile/import evidence, bounded global/core-image asset review, combined reference-review identity, exact-bound external closure receipt, offline operator intake and non-authorizing pre-decision review packet are merged; genuine evidence authentication/internal decision, real target import, semantic generation and download authority remain pending/unwired;',
    '- P15 — core foundation in progress / target import unvalidated: exact candidate/profile/import evidence, bounded global/core-image asset review, combined reference-review identity, exact-bound external closure receipt, offline operator intake, non-authorizing pre-decision review packet and exact-bound externally reported authentication-result binding are merged; genuine trusted authentication/internal decision, real target import, semantic generation and download authority remain pending/unwired;',
)
replace_once(
    'memory-bank/NEXT_ACTIONS.md',
    '- PR #338 -> `250f3d2f82f0f7ca8a5c374ff0199ffef39d16ba`; CI #1110, Final Release #421 and Offline #465 PASS;\n- Integration Readiness did not trigger for the code-only #326/#328/#330/#334/#338 diffs.',
    '- PR #338 -> `250f3d2f82f0f7ca8a5c374ff0199ffef39d16ba`; CI #1110, Final Release #421 and Offline #465 PASS;\n- PR #340 docs sync -> `34b77b567d49423dae9e15212cf4c82cf842eca5`; CI #1112, Integration Readiness #394, Final Release #423 and Offline #467 PASS;\n- PR #343 -> `464461a86a4aed4bd43260baee79619a25216c2b`; exact head `e75a30ecd4d38b17ea0b56300827f5a3e06e0b0d`; CI #1114, Final Release #425 and Offline #469 PASS;\n- Integration Readiness did not trigger for the code-only #326/#328/#330/#334/#338/#343 diffs.',
)
replace_once(
    'memory-bank/NEXT_ACTIONS.md',
    '5. Global review emits key/path inventory only; documented asset review currently covers only the pinned core Image MEDIA control and emits URL fingerprints, not raw URLs. External closure receipts, offline intake and pre-decision packet are exact-bound reported evidence/review surfaces only; repository code does not authenticate evidence references, and neither `BOUND_REPORTED_PASS` nor `REPORTED_PASS_AUTHENTICATION_REQUIRED` grants closure authority.',
    '5. Global review emits key/path inventory only; documented asset review currently covers only the pinned core Image MEDIA control and emits URL fingerprints, not raw URLs. External closure receipts, offline intake, pre-decision packet and external authentication-report binding are exact-bound evidence/reporting surfaces only; repository code does not authenticate evidence references or verifier identity, and neither `BOUND_REPORTED_PASS`, `REPORTED_PASS_AUTHENTICATION_REQUIRED` nor `EXTERNALLY_REPORTED_PASS` grants closure authority.',
)

print('docs sync replacements applied')
