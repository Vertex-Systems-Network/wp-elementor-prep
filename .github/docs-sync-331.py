from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    target = Path(path)
    text = target.read_text()
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{path}: expected exactly one match, got {count}: {old[:120]!r}")
    target.write_text(text.replace(old, new, 1))


# README.md
replace_once(
    "README.md",
    "- P15 Elementor R1 foundation: v0.4/container validation, bounded widget-capability reporting, exact candidate/import-evidence binding, immutable declared target profiles, read-only profile assessment and a non-authorizing global-reference review gate;",
    "- P15 Elementor R1 foundation: v0.4/container validation, bounded widget-capability reporting, exact candidate/import-evidence binding, immutable declared target profiles, read-only profile assessment, bounded global/core-image asset review, deterministic combined reference identity and exact-bound external closure-evidence receipts;",
)
replace_once(
    "README.md",
    "Current verified main is:\n\n`d603ce87a645160204d2de6fd458279ba7b3bf3f`",
    "Current verified main is:\n\n`d0796310fb3b6d4f1753d472e0e9f9783bb752b3`",
)
replace_once(
    "README.md",
    "- PR #322 added a non-authorizing global-reference key review gate. It emits no raw `__globals__` values, requires external closure when keys exist, and keeps asset-reference review `NOT_RUN`; guarded squash merge `d603ce87a645160204d2de6fd458279ba7b3bf3f`.",
    """- PR #322 added a non-authorizing global-reference key review gate. It emits no raw `__globals__` values, requires external closure when keys exist, and keeps asset-reference review `NOT_RUN`; guarded squash merge `d603ce87a645160204d2de6fd458279ba7b3bf3f`.
- PR #324 synchronized the canonical P15 R1 status docs through the global-reference review batch; guarded squash merge `94bc8635b68c5781353d3bcb89388e4b630c69c5`.
- PR #326 added the first documented asset-reference review gate, whitelisting only the exact core `image` widget `settings.image` MEDIA control from pinned upstream Elementor source. Raw asset URLs are not emitted; guarded squash merge `cde7ea30ad64e2fc6d308de29779f1a49068d543`.
- PR #328 bound the exact current global + documented asset review state into one deterministic SHA-256 reference-review identity while keeping closure/compatibility authority false; guarded squash merge `5b95d5e3e96d7051e4c74930b6df7eb16038707f`.
- PR #330 added an exact-bound external reference-closure PASS/FAIL evidence receipt contract. Receipt intake rejects BLOCKED/REVIEW/no-reference identities, and even reported PASS remains non-authorizing; guarded squash merge `d0796310fb3b6d4f1753d472e0e9f9783bb752b3`.""",
)
replace_once(
    "README.md",
    "| P15 Elementor native export + validation | CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED | N/A | `──────────` | Exact candidate/receipt intake + immutable target profile + profile-bound evidence + read-only alignment/global-reference review are merged; real target import, asset closure, Figma semantic generation and product download remain unwired |",
    "| P15 Elementor native export + validation | CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED | N/A | `──────────` | Exact candidate/profile/import evidence + bounded global/core-image asset review + combined reference identity + external closure-evidence receipt contract are merged; actual external closure evidence/internal decision, real target import, Figma semantic generation and product download remain unaccepted/unwired |",
)

# docs/P14_FOUNDATION_IMPLEMENTATION.md
replace_once(
    "docs/P14_FOUNDATION_IMPLEMENTATION.md",
    "Canonical status synchronized through P14 review-packet and P15 R1 evidence/profile/reference-review merges",
    "Canonical status synchronized through P14 review-packet and P15 R1 profile/reference-review/closure-evidence merges",
)
replace_once(
    "docs/P14_FOUNDATION_IMPLEMENTATION.md",
    "Current main is:\n\n`d603ce87a645160204d2de6fd458279ba7b3bf3f`",
    "Current main is:\n\n`d0796310fb3b6d4f1753d472e0e9f9783bb752b3`",
)
replace_once(
    "docs/P14_FOUNDATION_IMPLEMENTATION.md",
    "P12 remains at its retained 80% release-exit state. P15 now has a bounded non-authorizing Elementor R1 foundation: v0.4/container validation, documented-core capability reporting, candidate identity/receipt + offline intake, immutable declared target-profile fingerprints, profile-bound import evidence, read-only profile alignment assessment and a global-reference key review gate. Real target import remains unvalidated, detected global references are not resolved, asset-reference review remains NOT_RUN, and no Figma-to-Elementor generation/download surface is wired. P16-P26 remain preflight-frozen / implementation-not-started. P27 #182 remains the final production-release gate.",
    "P12 remains at its retained 80% release-exit state. P15 now has a bounded non-authorizing Elementor R1 foundation: v0.4/container validation, documented-core capability reporting, candidate identity/receipt + offline intake, immutable declared target-profile fingerprints, profile-bound import evidence, read-only profile alignment, global-reference key review, exact core-image MEDIA asset review, a deterministic combined reference-review identity and an exact-bound external closure-evidence receipt contract. Real target import remains unvalidated; raw global values and asset URLs are not resolved/emitted; no external closure evidence is authenticated by repository code; reported PASS remains non-authorizing; and no Figma-to-Elementor generation/download surface is wired. P16-P26 remain preflight-frozen / implementation-not-started. P27 #182 remains the final production-release gate.",
)

# memory-bank/PROJECT_STATE.md
replace_once(
    "memory-bank/PROJECT_STATE.md",
    "8. bounded P15 Elementor R1 foundation with v0.4/container validation, documented-core capabilities, exact candidate/import-evidence binding, immutable declared target profiles, read-only alignment assessment and global-reference key review;",
    "8. bounded P15 Elementor R1 foundation with v0.4/container validation, documented-core capabilities, exact candidate/import-evidence binding, immutable declared target profiles, read-only alignment, bounded global/core-image asset review, combined reference identity and exact-bound external closure-evidence receipts;",
)
replace_once(
    "memory-bank/PROJECT_STATE.md",
    "Current verified main after the P15 R1 target-profile/evidence/reference-review batch:\n\n`d603ce87a645160204d2de6fd458279ba7b3bf3f`",
    "Current verified main after the P15 R1 asset/reference-identity/closure-evidence batch:\n\n`d0796310fb3b6d4f1753d472e0e9f9783bb752b3`",
)
replace_once(
    "memory-bank/PROJECT_STATE.md",
    "- #322 non-authorizing global-reference key review gate -> `d603ce87a645160204d2de6fd458279ba7b3bf3f`.",
    """- #322 non-authorizing global-reference key review gate -> `d603ce87a645160204d2de6fd458279ba7b3bf3f`;
- #324 canonical P15 R1 docs sync -> `94bc8635b68c5781353d3bcb89388e4b630c69c5`;
- #326 documented core Image MEDIA asset-reference review -> `cde7ea30ad64e2fc6d308de29779f1a49068d543`;
- #328 deterministic combined reference-review identity -> `5b95d5e3e96d7051e4c74930b6df7eb16038707f`;
- #330 exact-bound external reference-closure evidence receipt contract -> `d0796310fb3b6d4f1753d472e0e9f9783bb752b3`.""",
)
replace_once(
    "memory-bank/PROJECT_STATE.md",
    "Focused issues #275, #280, #284, #285, #288, #295, #297, #299, #301, #303, #305, #307, #309, #311, #313, #315, #317, #319 and #321 are completed through their reviewed implementation/artifact flows.",
    "Focused issues #275, #280, #284, #285, #288, #295, #297, #299, #301, #303, #305, #307, #309, #311, #313, #315, #317, #319, #321, #323, #325, #327 and #329 are completed through their reviewed implementation/artifact flows.",
)
old_p15 = """## P15 state

P15 remains **CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED**. The bounded offline/read-only chain now includes:

- PR #304 — documented Elementor data version `0.4` modern `container`/`widget` contract with bounded validation; legacy `section`/`column`, Atomic `e-*`, unknown element types, malformed settings, duplicate IDs and resource-limit violations fail closed;
- PR #306 — versioned read-only capability registry/report for directly evidenced classic widget IDs `heading`, `image`, and `button`; unregistered widgets are `REVIEW_REQUIRED`, with no Pro/add-on availability inference;
- PR #308 — deterministic non-authorizing candidate artifact envelope;
- PR #312 — exact canonical candidate SHA-256 identity and fail-closed non-authorizing import-validation receipt contract;
- PR #314 — offline operator intake for externally captured exact-bound PASS/FAIL import evidence; even bound observed PASS requires separate internal review and grants no compatibility/download authority;
- PR #316 — immutable declared Elementor target profile with SHA-256 fingerprint; environment source remains `DECLARED`, not observed;
- PR #318 — additive import-evidence binding to the exact current target-profile fingerprint and declared target versions;
- PR #320 — read-only target-profile/candidate metadata alignment assessment; the highest state is `PROFILE_ALIGNED_REFERENCE_REVIEW_PENDING`, not target compatibility;
- PR #322 — global-reference key review gate that emits only widget/path/key inventory, never raw `__globals__` values. Detected keys require external closure; asset-reference review remains `NOT_RUN`.

Real WordPress/Elementor target import remains unvalidated. `targetCompatibilityClaim=false`, production acceptance remains false, generation/download authority remains disabled, global-reference values are unresolved, asset-reference closure is not implemented, and no Figma-to-Elementor semantic generator, Elementor Pro/third-party mapping or Atomic generation has been accepted."""
new_p15 = """## P15 state

P15 remains **CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED**. The bounded offline/read-only chain now includes:

- PR #304 — documented Elementor data version `0.4` modern `container`/`widget` contract with bounded validation; legacy `section`/`column`, Atomic `e-*`, unknown element types, malformed settings, duplicate IDs and resource-limit violations fail closed;
- PR #306 — versioned read-only capability registry/report for directly evidenced classic widget IDs `heading`, `image`, and `button`; unregistered widgets are `REVIEW_REQUIRED`, with no Pro/add-on availability inference;
- PR #308 — deterministic non-authorizing candidate artifact envelope;
- PR #312 — exact canonical candidate SHA-256 identity and fail-closed non-authorizing import-validation receipt contract;
- PR #314 — offline operator intake for externally captured exact-bound PASS/FAIL import evidence; even bound observed PASS requires separate internal review and grants no compatibility/download authority;
- PR #316 — immutable declared Elementor target profile with SHA-256 fingerprint; environment source remains `DECLARED`, not observed;
- PR #318 — additive import-evidence binding to the exact current target-profile fingerprint and declared target versions;
- PR #320 — read-only target-profile/candidate metadata alignment assessment; the highest state is `PROFILE_ALIGNED_REFERENCE_REVIEW_PENDING`, not target compatibility;
- PR #322 — global-reference key review gate that emits only widget/path/key inventory, never raw `__globals__` values; detected keys require external closure;
- PR #326 — first documented asset-reference review gate, restricted to the exact core `image` widget `settings.image` MEDIA control from pinned Elementor source. Source media IDs remain evidence only, raw URLs are replaced by SHA-256 fingerprints, and arbitrary/third-party media-shaped settings are not inferred as supported;
- PR #328 — one deterministic SHA-256 reference-review identity binding exact candidate/profile plus canonical global + asset review state. REVIEW/BLOCKED and outstanding external-closure facts remain distinct;
- PR #330 — exact-bound external global/asset closure PASS/FAIL evidence receipt contract. Intake is eligible only for current `EXTERNAL_CLOSURE_REQUIRED` identity; reported PASS remains external evidence, not a closure/compatibility/production authority claim.

Real WordPress/Elementor target import remains unvalidated. `targetCompatibilityClaim=false`, production acceptance remains false, generation/download authority remains disabled, global-reference values remain unresolved, raw asset URLs are not emitted, no external closure evidence is fetched/authenticated by repository code, and no Figma-to-Elementor semantic generator, Elementor Pro/third-party mapping, gallery/video/add-on asset support or Atomic generation has been accepted."""
replace_once("memory-bank/PROJECT_STATE.md", old_p15, new_p15)
replace_once(
    "memory-bank/PROJECT_STATE.md",
    "Keep #159 genuine Figma Desktop evidence as the prerequisite before real P14 mutation exposure. In parallel, continue P15 only through bounded deterministic R1 target-adapter slices. Exact candidate + declared-profile evidence binding is now implemented; the next reference-closure work must audit asset-reference semantics against documented target data before implementation and must not infer support from arbitrary settings. Product download, semantic generation and target-compatibility authority stay disabled until genuine Elementor target validation and later gates justify them.",
    "Keep #159 genuine Figma Desktop evidence as the prerequisite before real P14 mutation exposure. In parallel, continue P15 only through bounded deterministic R1 target-adapter slices. Documented core-image asset review, combined reference-review identity and exact-bound external closure-evidence receipt validation are now implemented. The next safe slice is offline/operator intake plus separate internal review for externally captured closure evidence; repository code must not fetch/authenticate evidenceReference values or treat reported PASS as closure/compatibility authority. Product download, semantic generation and target-compatibility authority stay disabled until genuine Elementor target validation and later gates justify them.",
)

# memory-bank/NEXT_ACTIONS.md
old_immediate = """## Immediate action — P15 asset-reference review contract

Classification: **PLANNED / READ-ONLY R1 REFERENCE CLOSURE**.

The exact-candidate receipt, offline intake, immutable declared target profile, profile-bound evidence, read-only target-profile assessment and global-reference key review gates are merged. The next safe P15 R1 slice is bounded asset-reference review/closure semantics.

Refresh official target documentation first where asset fields/version behavior could have changed. Do not infer asset semantics from arbitrary Elementor settings. Keep asset work read-only and evidence-oriented: classify only documented asset references, preserve provenance, fail closed on unknown shapes, and leave `downloadEnabled=false`, `generationEnabled=false`, `targetCompatibilityClaim=false`, and `productionAcceptance=false` until genuine target validation and later gates justify authority.

Do not introduce a WordPress connection, Pro/add-on availability inference, Atomic generation or product download UI merely to advance the offline contract."""
new_immediate = """## Immediate action — P15 external reference-closure evidence intake

Classification: **PLANNED / NON-AUTHORITATIVE EXTERNAL EVIDENCE INTAKE**.

The documented core-image asset review, combined global+asset reference-review identity and exact-bound external closure PASS/FAIL receipt contract are merged. The next safe P15 R1 slice is offline/operator intake for a caller-supplied closure receipt plus an explicit separate internal-review candidate.

The intake must validate the exact current candidate/profile/reference-review identity, preserve class-specific reported PASS/FAIL unchanged, reject REVIEW/BLOCKED/no-reference bypass attempts, and never fetch/authenticate `evidenceReference` values. `allRequiredEvidenceReportsPass=true` remains reported external evidence only and must not set `referenceClosureClaim`, `targetCompatibilityClaim`, production acceptance, generation or download authority.

Do not introduce a WordPress connection, target mutation, Pro/add-on availability inference, Atomic generation or product download UI merely to advance the offline contract."""
replace_once("memory-bank/NEXT_ACTIONS.md", old_immediate, new_immediate)
replace_once(
    "memory-bank/NEXT_ACTIONS.md",
    "- P15 — core foundation in progress / target import unvalidated: exact candidate/receipt intake, immutable declared target profile, profile-bound evidence, read-only profile alignment and global-reference key review are merged; real target import, asset closure, semantic generation and download authority remain unwired;",
    "- P15 — core foundation in progress / target import unvalidated: exact candidate/profile/import evidence, bounded global/core-image asset review, combined reference-review identity and exact-bound external closure-evidence receipt contract are merged; actual external closure evidence/internal decision, real target import, semantic generation and download authority remain pending/unwired;",
)
replace_once(
    "memory-bank/NEXT_ACTIONS.md",
    "### P15 exact-evidence + R1 profile/reference batch",
    "### P15 exact-evidence + R1 profile/reference/closure batch",
)
replace_once(
    "memory-bank/NEXT_ACTIONS.md",
    "- PR #322 -> `d603ce87a645160204d2de6fd458279ba7b3bf3f`; CI #1094, Final Release #405 and Offline #449 PASS;\n- Integration Readiness did not trigger for these code-only diffs.",
    """- PR #322 -> `d603ce87a645160204d2de6fd458279ba7b3bf3f`; CI #1094, Final Release #405 and Offline #449 PASS;
- PR #324 docs sync -> `94bc8635b68c5781353d3bcb89388e4b630c69c5`; CI #1096, Integration Readiness #383, Final Release #407 and Offline #451 PASS;
- PR #326 -> `cde7ea30ad64e2fc6d308de29779f1a49068d543`; CI #1098, Final Release #409 and Offline #453 PASS;
- PR #328 -> `5b95d5e3e96d7051e4c74930b6df7eb16038707f`; CI #1100, Final Release #411 and Offline #455 PASS;
- PR #330 -> `d0796310fb3b6d4f1753d472e0e9f9783bb752b3`; CI #1102, Final Release #413 and Offline #457 PASS;
- Integration Readiness did not trigger for the code-only #326/#328/#330 diffs.""",
)
replace_once(
    "memory-bank/NEXT_ACTIONS.md",
    "4. Exact-candidate receipt intake and exact declared-profile evidence binding are implemented; future observed target evidence must match both identities and still requires internal review.\n5. Global-reference review emits key/path inventory only; raw global values remain unresolved and asset-reference review/closure remains `NOT_RUN`.",
    "4. Exact-candidate/import evidence, declared-profile binding and combined global+asset reference-review identity are implemented; future observed target evidence must match current identities and still requires internal review.\n5. Global review emits key/path inventory only; documented asset review currently covers only the pinned core Image MEDIA control and emits URL fingerprints, not raw URLs. External closure receipts are exact-bound PASS/FAIL evidence only; repository code does not authenticate evidence references and reported PASS does not grant closure authority.",
)
