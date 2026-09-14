from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    file = Path(path)
    text = file.read_text()
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{path}: expected exactly one match, found {count}: {old[:100]!r}')
    file.write_text(text.replace(old, new, 1))


replace_once(
    'README.md',
    '- P15 Elementor R1 foundation: v0.4/container validation, bounded widget-capability reporting, exact candidate/import-evidence binding, immutable declared target profiles, read-only profile assessment, bounded global/core-image asset review, deterministic combined reference identity and exact-bound external closure-evidence receipts;',
    '- P15 Elementor R1 foundation: v0.4/container validation, bounded widget-capability reporting, exact candidate/import-evidence binding, immutable declared target profiles, read-only profile assessment, bounded global/core-image asset review, deterministic combined reference identity, exact-bound external closure-evidence receipts and offline closure-evidence operator intake;',
)
replace_once(
    'README.md',
    'Current verified main is:\n\n`d0796310fb3b6d4f1753d472e0e9f9783bb752b3`',
    'Current verified main is:\n\n`c20d8835c27cf73e1e367c478f346f6c80d72824`',
)
replace_once(
    'README.md',
    '- PR #330 added an exact-bound external reference-closure PASS/FAIL evidence receipt contract. Receipt intake rejects BLOCKED/REVIEW/no-reference identities, and even reported PASS remains non-authorizing; guarded squash merge `d0796310fb3b6d4f1753d472e0e9f9783bb752b3`.',
    '- PR #330 added an exact-bound external reference-closure PASS/FAIL evidence receipt contract. Receipt intake rejects BLOCKED/REVIEW/no-reference identities, and even reported PASS remains non-authorizing; guarded squash merge `d0796310fb3b6d4f1753d472e0e9f9783bb752b3`.\n- PR #332 synchronized canonical README/P14/project-state/next-actions through that reference-evidence batch; guarded squash merge `f2403e41998a8c91aedde3fa411863edd983ea99`.\n- PR #334 added a Node-20 offline operator intake for exact template/profile/reference-closure receipts. It emits sanitized current-identity/results/input-hash evidence, rejects stale/ineligible replay, never echoes evidence references/raw global values/raw asset URLs, and keeps reported PASS non-authorizing; guarded squash merge `c20d8835c27cf73e1e367c478f346f6c80d72824`.',
)
replace_once(
    'README.md',
    '| P15 Elementor native export + validation | CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED | N/A | `──────────` | Exact candidate/profile/import evidence + bounded global/core-image asset review + combined reference identity + external closure-evidence receipt contract are merged; actual external closure evidence/internal decision, real target import, Figma semantic generation and product download remain unaccepted/unwired |',
    '| P15 Elementor native export + validation | CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED | N/A | `──────────` | Exact candidate/profile/import evidence + bounded global/core-image asset review + combined reference identity + external closure receipt + offline operator intake are merged; authenticated external closure/internal decision, real target import, Figma semantic generation and product download remain unaccepted/unwired |',
)

replace_once(
    'memory-bank/PROJECT_STATE.md',
    '8. bounded P15 Elementor R1 foundation with v0.4/container validation, documented-core capabilities, exact candidate/import-evidence binding, immutable declared target profiles, read-only alignment, bounded global/core-image asset review, combined reference identity and exact-bound external closure-evidence receipts;',
    '8. bounded P15 Elementor R1 foundation with v0.4/container validation, documented-core capabilities, exact candidate/import-evidence binding, immutable declared target profiles, read-only alignment, bounded global/core-image asset review, combined reference identity, exact-bound external closure-evidence receipts and offline operator intake;',
)
replace_once(
    'memory-bank/PROJECT_STATE.md',
    'Current verified main after the P15 R1 asset/reference-identity/closure-evidence batch:\n\n`d0796310fb3b6d4f1753d472e0e9f9783bb752b3`',
    'Current verified main after the P15 R1 reference-closure operator-intake slice:\n\n`c20d8835c27cf73e1e367c478f346f6c80d72824`',
)
replace_once(
    'memory-bank/PROJECT_STATE.md',
    '- #330 exact-bound external reference-closure evidence receipt contract -> `d0796310fb3b6d4f1753d472e0e9f9783bb752b3`.',
    '- #330 exact-bound external reference-closure evidence receipt contract -> `d0796310fb3b6d4f1753d472e0e9f9783bb752b3`;\n- #332 canonical reference-evidence docs sync -> `f2403e41998a8c91aedde3fa411863edd983ea99`;\n- #334 offline exact-bound reference-closure evidence intake -> `c20d8835c27cf73e1e367c478f346f6c80d72824`.',
)
replace_once(
    'memory-bank/PROJECT_STATE.md',
    'Focused issues #275, #280, #284, #285, #288, #295, #297, #299, #301, #303, #305, #307, #309, #311, #313, #315, #317, #319, #321, #323, #325, #327 and #329 are completed through their reviewed implementation/artifact flows.',
    'Focused issues #275, #280, #284, #285, #288, #295, #297, #299, #301, #303, #305, #307, #309, #311, #313, #315, #317, #319, #321, #323, #325, #327, #329, #331 and #333 are completed through their reviewed implementation/artifact flows.',
)
replace_once(
    'memory-bank/PROJECT_STATE.md',
    '- PR #330 — exact-bound external global/asset closure PASS/FAIL evidence receipt contract. Intake is eligible only for current `EXTERNAL_CLOSURE_REQUIRED` identity; reported PASS remains external evidence, not a closure/compatibility/production authority claim.',
    '- PR #330 — exact-bound external global/asset closure PASS/FAIL evidence receipt contract. Intake is eligible only for current `EXTERNAL_CLOSURE_REQUIRED` identity; reported PASS remains external evidence, not a closure/compatibility/production authority claim.\n- PR #334 — offline operator intake for an exact template + declared profile + closure receipt. It revalidates the fresh current identity, emits only sanitized reported results/current identity/exact raw-input SHA-256 hashes, rejects stale/ineligible replay, and does not echo evidence references, raw global values or raw asset URLs.',
)
replace_once(
    'memory-bank/PROJECT_STATE.md',
    'Real WordPress/Elementor target import remains unvalidated. `targetCompatibilityClaim=false`, production acceptance remains false, generation/download authority remains disabled, global-reference values remain unresolved, raw asset URLs are not emitted, no external closure evidence is fetched/authenticated by repository code, and no Figma-to-Elementor semantic generator, Elementor Pro/third-party mapping, gallery/video/add-on asset support or Atomic generation has been accepted.',
    'Real WordPress/Elementor target import remains unvalidated. `targetCompatibilityClaim=false`, production acceptance remains false, generation/download authority remains disabled, global-reference values remain unresolved, raw asset URLs are not emitted, the offline intake does not fetch/authenticate external evidence references, reported PASS still requires separate authenticated/internal review, and no Figma-to-Elementor semantic generator, Elementor Pro/third-party mapping, gallery/video/add-on asset support or Atomic generation has been accepted.',
)

replace_once(
    'memory-bank/NEXT_ACTIONS.md',
    '## Immediate action — P15 external reference-closure evidence intake\n\nClassification: **PLANNED / NON-AUTHORITATIVE EXTERNAL EVIDENCE INTAKE**.\n\nThe documented core-image asset review, combined global+asset reference-review identity and exact-bound external closure PASS/FAIL receipt contract are merged. The next safe P15 R1 slice is offline/operator intake for a caller-supplied closure receipt plus an explicit separate internal-review candidate.\n\nThe intake must validate the exact current candidate/profile/reference-review identity, preserve class-specific reported PASS/FAIL unchanged, reject REVIEW/BLOCKED/no-reference bypass attempts, and never fetch/authenticate `evidenceReference` values. `allRequiredEvidenceReportsPass=true` remains reported external evidence only and must not set `referenceClosureClaim`, `targetCompatibilityClaim`, production acceptance, generation or download authority.\n\nDo not introduce a WordPress connection, target mutation, Pro/add-on availability inference, Atomic generation or product download UI merely to advance the offline contract.',
    '## Immediate action — P15 authenticated external closure + internal review boundary\n\nClassification: **OPERATOR INTAKE MERGED / AUTHENTICATED CLOSURE DECISION PENDING**.\n\nThe documented core-image asset review, combined global+asset reference-review identity, exact-bound external closure PASS/FAIL receipt contract and offline/operator intake are merged. The next authority-bearing step requires genuine externally captured closure evidence plus a separate internal review/decision; repository CI or a synthetic receipt cannot substitute for that evidence.\n\nUse `p15:reference-closure-intake` only to validate exact template/profile/receipt binding and sanitize operator evidence. `BOUND_REPORTED_PASS` means all currently required external reports say PASS; it does not authenticate `evidenceReference`, set `referenceClosureClaim`, establish target compatibility, or grant production/generation/download authority. Stale, REVIEW, BLOCKED and no-reference bypass attempts must continue to fail closed.\n\nDo not introduce a WordPress connection, target mutation, Pro/add-on availability inference, Atomic generation or product download UI merely to manufacture closure. Any next code-side review contract must preserve the distinction between reported evidence, authenticated evidence, internal decision and target compatibility.',
)
replace_once(
    'memory-bank/NEXT_ACTIONS.md',
    '- P15 — core foundation in progress / target import unvalidated: exact candidate/profile/import evidence, bounded global/core-image asset review, combined reference-review identity and exact-bound external closure-evidence receipt contract are merged; actual external closure evidence/internal decision, real target import, semantic generation and download authority remain pending/unwired;',
    '- P15 — core foundation in progress / target import unvalidated: exact candidate/profile/import evidence, bounded global/core-image asset review, combined reference-review identity, exact-bound external closure receipt and offline operator intake are merged; authenticated external closure/internal decision, real target import, semantic generation and download authority remain pending/unwired;',
)
replace_once(
    'memory-bank/NEXT_ACTIONS.md',
    '- PR #330 -> `d0796310fb3b6d4f1753d472e0e9f9783bb752b3`; CI #1102, Final Release #413 and Offline #457 PASS;\n- Integration Readiness did not trigger for the code-only #326/#328/#330 diffs.',
    '- PR #330 -> `d0796310fb3b6d4f1753d472e0e9f9783bb752b3`; CI #1102, Final Release #413 and Offline #457 PASS;\n- PR #332 docs sync -> `f2403e41998a8c91aedde3fa411863edd983ea99`; CI #1104, Integration Readiness #388, Final Release #415 and Offline #459 PASS;\n- PR #334 -> `c20d8835c27cf73e1e367c478f346f6c80d72824`; CI #1106, Final Release #417 and Offline #461 PASS;\n- Integration Readiness did not trigger for the code-only #326/#328/#330/#334 diffs.',
)
replace_once(
    'memory-bank/NEXT_ACTIONS.md',
    '5. Global review emits key/path inventory only; documented asset review currently covers only the pinned core Image MEDIA control and emits URL fingerprints, not raw URLs. External closure receipts are exact-bound PASS/FAIL evidence only; repository code does not authenticate evidence references and reported PASS does not grant closure authority.',
    '5. Global review emits key/path inventory only; documented asset review currently covers only the pinned core Image MEDIA control and emits URL fingerprints, not raw URLs. External closure receipts and the offline intake are exact-bound PASS/FAIL evidence only; repository code does not authenticate evidence references and `BOUND_REPORTED_PASS` does not grant closure authority.',
)

replace_once(
    'docs/P14_FOUNDATION_IMPLEMENTATION.md',
    'Canonical status synchronized through P14 review-packet and P15 R1 profile/reference-review/closure-evidence merges',
    'Canonical status synchronized through P14 review-packet and P15 R1 profile/reference-review/closure-evidence/operator-intake merges',
)
replace_once(
    'docs/P14_FOUNDATION_IMPLEMENTATION.md',
    'Current main is:\n\n`d0796310fb3b6d4f1753d472e0e9f9783bb752b3`',
    'Current main is:\n\n`c20d8835c27cf73e1e367c478f346f6c80d72824`',
)
replace_once(
    'docs/P14_FOUNDATION_IMPLEMENTATION.md',
    'P12 remains at its retained 80% release-exit state. P15 now has a bounded non-authorizing Elementor R1 foundation: v0.4/container validation, documented-core capability reporting, candidate identity/receipt + offline intake, immutable declared target-profile fingerprints, profile-bound import evidence, read-only profile alignment, global-reference key review, exact core-image MEDIA asset review, a deterministic combined reference-review identity and an exact-bound external closure-evidence receipt contract. Real target import remains unvalidated; raw global values and asset URLs are not resolved/emitted; no external closure evidence is authenticated by repository code; reported PASS remains non-authorizing; and no Figma-to-Elementor generation/download surface is wired. P16-P26 remain preflight-frozen / implementation-not-started. P27 #182 remains the final production-release gate.',
    'P12 remains at its retained 80% release-exit state. P15 now has a bounded non-authorizing Elementor R1 foundation: v0.4/container validation, documented-core capability reporting, candidate identity/receipt + offline import intake, immutable declared target-profile fingerprints, profile-bound import evidence, read-only profile alignment, global-reference key review, exact core-image MEDIA asset review, a deterministic combined reference-review identity, an exact-bound external closure-evidence receipt contract and an offline closure-evidence operator intake. Real target import remains unvalidated; raw global values and asset URLs are not resolved/emitted; the operator intake does not authenticate external evidence references; `BOUND_REPORTED_PASS` remains non-authorizing and requires separate genuine evidence/internal review; and no Figma-to-Elementor generation/download surface is wired. P16-P26 remain preflight-frozen / implementation-not-started. P27 #182 remains the final production-release gate.',
)
