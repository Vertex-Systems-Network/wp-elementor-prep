from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    file = Path(path)
    text = file.read_text(encoding='utf-8')
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{path}: expected exactly one match, found {count}: {old[:120]!r}')
    file.write_text(text.replace(old, new, 1), encoding='utf-8')


# README
replace_once(
    'README.md',
    '- P15 Elementor R1 foundation: v0.4/container validation, bounded widget-capability reporting, exact candidate/import-evidence binding, immutable declared target profiles, read-only profile assessment, bounded global/core-image asset review, deterministic combined reference identity, exact-bound external closure-evidence receipts and offline closure-evidence operator intake;',
    '- P15 Elementor R1 foundation: v0.4/container validation, bounded widget-capability reporting, exact candidate/import-evidence binding, immutable declared target profiles, read-only profile assessment, bounded global/core-image asset review, deterministic combined reference identity, exact-bound external closure-evidence receipts, offline closure-evidence operator intake and deterministic non-authorizing pre-decision review packets;',
)
replace_once(
    'README.md',
    '`c20d8835c27cf73e1e367c478f346f6c80d72824`',
    '`250f3d2f82f0f7ca8a5c374ff0199ffef39d16ba`',
)
replace_once(
    'README.md',
    '- PR #334 added a Node-20 offline operator intake for exact template/profile/reference-closure receipts. It emits sanitized current-identity/results/input-hash evidence, rejects stale/ineligible replay, never echoes evidence references/raw global values/raw asset URLs, and keeps reported PASS non-authorizing; guarded squash merge `c20d8835c27cf73e1e367c478f346f6c80d72824`.',
    '- PR #334 added a Node-20 offline operator intake for exact template/profile/reference-closure receipts. It emits sanitized current-identity/results/input-hash evidence, rejects stale/ineligible replay, never echoes evidence references/raw global values/raw asset URLs, and keeps reported PASS non-authorizing; guarded squash merge `c20d8835c27cf73e1e367c478f346f6c80d72824`.\n- PR #338 added a deterministic sanitized pre-decision reference-closure review packet. Exact-bound PASS advances only to `REPORTED_PASS_AUTHENTICATION_REQUIRED`; evidence authentication and internal decision stay `NOT_RUN`, all authority flags remain false, and raw evidence references/global values/asset URLs remain absent; guarded squash merge `250f3d2f82f0f7ca8a5c374ff0199ffef39d16ba`.',
)
replace_once(
    'README.md',
    '| P15 Elementor native export + validation | CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED | N/A | `──────────` | Exact candidate/profile/import evidence + bounded global/core-image asset review + combined reference identity + external closure receipt + offline operator intake are merged; authenticated external closure/internal decision, real target import, Figma semantic generation and product download remain unaccepted/unwired |',
    '| P15 Elementor native export + validation | CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED | N/A | `──────────` | Exact candidate/profile/import evidence + bounded global/core-image asset review + combined reference identity + external closure receipt + offline operator intake + non-authorizing pre-decision review packet are merged; genuine evidence authentication/internal decision, real target import, Figma semantic generation and product download remain unaccepted/unwired |',
)

# P14 canonical status doc
replace_once(
    'docs/P14_FOUNDATION_IMPLEMENTATION.md',
    'Canonical status synchronized through P14 review-packet and P15 R1 profile/reference-review/closure-evidence/operator-intake merges',
    'Canonical status synchronized through P14 review-packet and P15 R1 profile/reference-review/closure-evidence/operator-intake/pre-decision-review merges',
)
replace_once(
    'docs/P14_FOUNDATION_IMPLEMENTATION.md',
    '`c20d8835c27cf73e1e367c478f346f6c80d72824`',
    '`250f3d2f82f0f7ca8a5c374ff0199ffef39d16ba`',
)
replace_once(
    'docs/P14_FOUNDATION_IMPLEMENTATION.md',
    'P12 remains at its retained 80% release-exit state. P15 now has a bounded non-authorizing Elementor R1 foundation: v0.4/container validation, documented-core capability reporting, candidate identity/receipt + offline import intake, immutable declared target-profile fingerprints, profile-bound import evidence, read-only profile alignment, global-reference key review, exact core-image MEDIA asset review, a deterministic combined reference-review identity, an exact-bound external closure-evidence receipt contract and an offline closure-evidence operator intake. Real target import remains unvalidated; raw global values and asset URLs are not resolved/emitted; the operator intake does not authenticate external evidence references; `BOUND_REPORTED_PASS` remains non-authorizing and requires separate genuine evidence/internal review; and no Figma-to-Elementor generation/download surface is wired. P16-P26 remain preflight-frozen / implementation-not-started. P27 #182 remains the final production-release gate.',
    'P12 remains at its retained 80% release-exit state. P15 now has a bounded non-authorizing Elementor R1 foundation: v0.4/container validation, documented-core capability reporting, candidate identity/receipt + offline import intake, immutable declared target-profile fingerprints, profile-bound import evidence, read-only profile alignment, global-reference key review, exact core-image MEDIA asset review, a deterministic combined reference-review identity, an exact-bound external closure-evidence receipt contract, an offline closure-evidence operator intake and a deterministic pre-decision review packet. Real target import remains unvalidated; raw global values and asset URLs are not resolved/emitted; the operator intake does not authenticate external evidence references; `BOUND_REPORTED_PASS` advances only to authentication-required review, with `evidenceAuthenticationStatus=NOT_RUN` and `internalDecisionStatus=NOT_RUN`; all closure/compatibility/production/generation/download authority remains disabled; and no Figma-to-Elementor generation/download surface is wired. P16-P26 remain preflight-frozen / implementation-not-started. P27 #182 remains the final production-release gate.',
)

# PROJECT_STATE
replace_once(
    'memory-bank/PROJECT_STATE.md',
    '8. bounded P15 Elementor R1 foundation with v0.4/container validation, documented-core capabilities, exact candidate/import-evidence binding, immutable declared target profiles, read-only alignment, bounded global/core-image asset review, combined reference identity, exact-bound external closure-evidence receipts and offline operator intake;',
    '8. bounded P15 Elementor R1 foundation with v0.4/container validation, documented-core capabilities, exact candidate/import-evidence binding, immutable declared target profiles, read-only alignment, bounded global/core-image asset review, combined reference identity, exact-bound external closure-evidence receipts, offline operator intake and deterministic non-authorizing pre-decision review packets;',
)
replace_once(
    'memory-bank/PROJECT_STATE.md',
    'Current verified main after the P15 R1 reference-closure operator-intake slice:\n\n`c20d8835c27cf73e1e367c478f346f6c80d72824`',
    'Current verified main after the P15 R1 reference-closure pre-decision review-packet slice:\n\n`250f3d2f82f0f7ca8a5c374ff0199ffef39d16ba`',
)
replace_once(
    'memory-bank/PROJECT_STATE.md',
    '- #334 offline exact-bound reference-closure evidence intake -> `c20d8835c27cf73e1e367c478f346f6c80d72824`.',
    '- #334 offline exact-bound reference-closure evidence intake -> `c20d8835c27cf73e1e367c478f346f6c80d72824`;\n- #338 non-authorizing pre-decision reference-closure review packet -> `250f3d2f82f0f7ca8a5c374ff0199ffef39d16ba`.',
)
replace_once(
    'memory-bank/PROJECT_STATE.md',
    'Focused issues #275, #280, #284, #285, #288, #295, #297, #299, #301, #303, #305, #307, #309, #311, #313, #315, #317, #319, #321, #323, #325, #327, #329, #331 and #333 are completed through their reviewed implementation/artifact flows.',
    'Focused issues #275, #280, #284, #285, #288, #295, #297, #299, #301, #303, #305, #307, #309, #311, #313, #315, #317, #319, #321, #323, #325, #327, #329, #331, #333 and #337 are completed through their reviewed implementation/artifact flows.',
)
replace_once(
    'memory-bank/PROJECT_STATE.md',
    '- PR #334 — offline operator intake for an exact template + declared profile + closure receipt. It revalidates the fresh current identity, emits only sanitized reported results/current identity/exact raw-input SHA-256 hashes, rejects stale/ineligible replay, and does not echo evidence references, raw global values or raw asset URLs.',
    '- PR #334 — offline operator intake for an exact template + declared profile + closure receipt. It revalidates the fresh current identity, emits only sanitized reported results/current identity/exact raw-input SHA-256 hashes, rejects stale/ineligible replay, and does not echo evidence references, raw global values or raw asset URLs.\n- PR #338 — deterministic pre-decision reference-closure review packet. It binds the fresh current identity and canonical valid-receipt SHA-256, separates invalid/reported-fail/reported-pass states, keeps `evidenceAuthenticationStatus=NOT_RUN` and `internalDecisionStatus=NOT_RUN`, and grants no closure/compatibility/production/generation/download authority.',
)
replace_once(
    'memory-bank/PROJECT_STATE.md',
    'Real WordPress/Elementor target import remains unvalidated. `targetCompatibilityClaim=false`, production acceptance remains false, generation/download authority remains disabled, global-reference values remain unresolved, raw asset URLs are not emitted, the offline intake does not fetch/authenticate external evidence references, reported PASS still requires separate authenticated/internal review, and no Figma-to-Elementor semantic generator, Elementor Pro/third-party mapping, gallery/video/add-on asset support or Atomic generation has been accepted.',
    'Real WordPress/Elementor target import remains unvalidated. `targetCompatibilityClaim=false`, production acceptance remains false, generation/download authority remains disabled, global-reference values remain unresolved, raw asset URLs are not emitted, the offline intake does not fetch/authenticate external evidence references, and the review packet explicitly leaves evidence authentication and internal decision `NOT_RUN`. Reported PASS still requires genuine authentication plus a separate internal decision, and no Figma-to-Elementor semantic generator, Elementor Pro/third-party mapping, gallery/video/add-on asset support or Atomic generation has been accepted.',
)
replace_once(
    'memory-bank/PROJECT_STATE.md',
    'Keep #159 genuine Figma Desktop evidence as the prerequisite before real P14 mutation exposure. In parallel, continue P15 only through bounded deterministic R1 target-adapter slices. Documented core-image asset review, combined reference-review identity and exact-bound external closure-evidence receipt validation are now implemented. The next safe slice is offline/operator intake plus separate internal review for externally captured closure evidence; repository code must not fetch/authenticate evidenceReference values or treat reported PASS as closure/compatibility authority. Product download, semantic generation and target-compatibility authority stay disabled until genuine Elementor target validation and later gates justify them.',
    'Keep #159 genuine Figma Desktop evidence as the prerequisite before real P14 mutation exposure. In parallel, continue P15 only through bounded deterministic R1 target-adapter slices. Documented core-image asset review, combined reference-review identity, exact-bound closure-evidence receipt validation, offline operator intake and the non-authorizing pre-decision review packet are implemented. The next authority-bearing step requires genuine evidence authentication plus a separate internal decision; repository code must not fetch/authenticate evidenceReference values or treat reported PASS as closure/compatibility authority. Product download, semantic generation and target-compatibility authority stay disabled until genuine Elementor target validation and later gates justify them.',
)

# NEXT_ACTIONS
replace_once(
    'memory-bank/NEXT_ACTIONS.md',
    'Classification: **OPERATOR INTAKE MERGED / AUTHENTICATED CLOSURE DECISION PENDING**.',
    'Classification: **PRE-DECISION REVIEW PACKET MERGED / AUTHENTICATED CLOSURE DECISION PENDING**.',
)
replace_once(
    'memory-bank/NEXT_ACTIONS.md',
    'The documented core-image asset review, combined global+asset reference-review identity, exact-bound external closure PASS/FAIL receipt contract and offline/operator intake are merged. The next authority-bearing step requires genuine externally captured closure evidence plus a separate internal review/decision; repository CI or a synthetic receipt cannot substitute for that evidence.',
    'The documented core-image asset review, combined global+asset reference-review identity, exact-bound external closure PASS/FAIL receipt contract, offline/operator intake and deterministic pre-decision review packet are merged. The next authority-bearing step requires genuine externally captured closure evidence authentication plus a separate internal review/decision; repository CI, synthetic receipts or fixture review packets cannot substitute for that evidence.',
)
replace_once(
    'memory-bank/NEXT_ACTIONS.md',
    'Use `p15:reference-closure-intake` only to validate exact template/profile/receipt binding and sanitize operator evidence. `BOUND_REPORTED_PASS` means all currently required external reports say PASS; it does not authenticate `evidenceReference`, set `referenceClosureClaim`, establish target compatibility, or grant production/generation/download authority. Stale, REVIEW, BLOCKED and no-reference bypass attempts must continue to fail closed.',
    'Use `p15:reference-closure-intake` only to validate exact template/profile/receipt binding and sanitize operator evidence. Use `p15:reference-closure-review-packet` only to freeze that exact-bound reported state for human pre-decision review. `BOUND_REPORTED_PASS` / `REPORTED_PASS_AUTHENTICATION_REQUIRED` mean all currently required external reports say PASS; neither state authenticates `evidenceReference`, sets `referenceClosureClaim`, establishes target compatibility, or grants production/generation/download authority. Stale, REVIEW, BLOCKED and no-reference bypass attempts must continue to fail closed.',
)
replace_once(
    'memory-bank/NEXT_ACTIONS.md',
    'Do not introduce a WordPress connection, target mutation, Pro/add-on availability inference, Atomic generation or product download UI merely to manufacture closure. Any next code-side review contract must preserve the distinction between reported evidence, authenticated evidence, internal decision and target compatibility.',
    'Do not introduce a WordPress connection, target mutation, Pro/add-on availability inference, Atomic generation or product download UI merely to manufacture closure. No next code-side contract may turn `evidenceAuthenticationStatus=NOT_RUN` or `internalDecisionStatus=NOT_RUN` into authority without genuine retained evidence and an explicit separate decision path.',
)
replace_once(
    'memory-bank/NEXT_ACTIONS.md',
    '- P15 — core foundation in progress / target import unvalidated: exact candidate/profile/import evidence, bounded global/core-image asset review, combined reference-review identity, exact-bound external closure receipt and offline operator intake are merged; authenticated external closure/internal decision, real target import, semantic generation and download authority remain pending/unwired;',
    '- P15 — core foundation in progress / target import unvalidated: exact candidate/profile/import evidence, bounded global/core-image asset review, combined reference-review identity, exact-bound external closure receipt, offline operator intake and non-authorizing pre-decision review packet are merged; genuine evidence authentication/internal decision, real target import, semantic generation and download authority remain pending/unwired;',
)
replace_once(
    'memory-bank/NEXT_ACTIONS.md',
    '- PR #334 -> `c20d8835c27cf73e1e367c478f346f6c80d72824`; CI #1106, Final Release #417 and Offline #461 PASS;\n- Integration Readiness did not trigger for the code-only #326/#328/#330/#334 diffs.',
    '- PR #334 -> `c20d8835c27cf73e1e367c478f346f6c80d72824`; CI #1106, Final Release #417 and Offline #461 PASS;\n- PR #338 -> `250f3d2f82f0f7ca8a5c374ff0199ffef39d16ba`; CI #1110, Final Release #421 and Offline #465 PASS;\n- Integration Readiness did not trigger for the code-only #326/#328/#330/#334/#338 diffs.',
)
replace_once(
    'memory-bank/NEXT_ACTIONS.md',
    '5. Global review emits key/path inventory only; documented asset review currently covers only the pinned core Image MEDIA control and emits URL fingerprints, not raw URLs. External closure receipts and the offline intake are exact-bound PASS/FAIL evidence only; repository code does not authenticate evidence references and `BOUND_REPORTED_PASS` does not grant closure authority.',
    '5. Global review emits key/path inventory only; documented asset review currently covers only the pinned core Image MEDIA control and emits URL fingerprints, not raw URLs. External closure receipts, offline intake and pre-decision packet are exact-bound reported evidence/review surfaces only; repository code does not authenticate evidence references, and neither `BOUND_REPORTED_PASS` nor `REPORTED_PASS_AUTHENTICATION_REQUIRED` grants closure authority.',
)

# Hard invariants
readme = Path('README.md').read_text(encoding='utf-8')
project = Path('memory-bank/PROJECT_STATE.md').read_text(encoding='utf-8')
next_actions = Path('memory-bank/NEXT_ACTIONS.md').read_text(encoding='utf-8')
p14 = Path('docs/P14_FOUNDATION_IMPLEMENTATION.md').read_text(encoding='utf-8')

required = [
    'CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED',
    'CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED',
    '| P15 Elementor native export + validation | CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED | N/A | `──────────` |',
    'production registry remains empty',
]
for token in required:
    if token not in readme:
        raise SystemExit(f'README invariant missing: {token}')

if 'schema v3' not in readme:
    raise SystemExit('README runtime registry schema-v3 anchor missing')
if 'schema v3' not in project:
    raise SystemExit('PROJECT_STATE runtime registry schema-v3 anchor missing')
if 'schema-v3' not in next_actions:
    raise SystemExit('NEXT_ACTIONS runtime registry schema-v3 anchor missing')
if 'Status: CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED' not in p14:
    raise SystemExit('P14 canonical status changed unexpectedly')
if 'p15:reference-closure-review-packet' not in next_actions:
    raise SystemExit('NEXT_ACTIONS missing new review-packet operator command')

print('docs-sync-339 bounded replacements and invariants: PASS')
