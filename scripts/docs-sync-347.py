from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    p = Path(path)
    text = p.read_text(encoding='utf-8')
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{path}: expected exactly one match, found {count}: {old[:140]!r}')
    p.write_text(text.replace(old, new, 1), encoding='utf-8')


MAIN = '66f6a77f31c69b0c4cd280a21bc03eb53759ec4d'

# README.md
replace_once(
    'README.md',
    '- P15 Elementor R1 foundation: v0.4/container validation, bounded widget-capability reporting, exact candidate/import-evidence binding, immutable declared target profiles, read-only profile assessment, bounded global/core-image asset review, deterministic combined reference identity, exact-bound external closure-evidence receipts, offline closure-evidence operator intake, deterministic non-authorizing pre-decision review packets and exact-bound externally reported authentication-result binding;\n- exact-build release/provenance tooling.',
    '- P15 Elementor R1 foundation: v0.4/container validation, bounded widget-capability reporting, exact candidate/import-evidence binding, immutable declared target profiles, read-only profile assessment, bounded global/core-image asset review, deterministic combined reference identity, exact-bound external closure-evidence receipts, offline closure-evidence operator intake, deterministic non-authorizing pre-decision review packets and exact-bound externally reported authentication-result binding;\n- P16 Gutenberg R1 foundation: repository-owned normalized parsed-block validation plus read-only documented-core API-v3 capability reporting for `core/paragraph`, `core/heading`, `core/image`, and `core/group`;\n- exact-build release/provenance tooling.',
)
replace_once(
    'README.md',
    '- `docs/P14_FOUNDATION_IMPLEMENTATION.md` — current target-neutral P14 safety/read-only review contract;\n- `memory-bank/PROJECT_STATE.md` — current repository/project truth;',
    '- `docs/P14_FOUNDATION_IMPLEMENTATION.md` — current target-neutral P14 safety/read-only review contract;\n- `docs/R0_GUTENBERG_P16_2026-09-14.md` — retained current WordPress/Gutenberg parser, markup, API-version and pattern research for the first P16 foundation;\n- `memory-bank/PROJECT_STATE.md` — current repository/project truth;',
)
replace_once(
    'README.md',
    'Current verified main is:\n\n`464461a86a4aed4bd43260baee79619a25216c2b`',
    f'Current verified main is:\n\n`{MAIN}`',
)
replace_once(
    'README.md',
    '- PR #343 added exact binding for a caller-supplied externally reported evidence-authentication result to the current reference-review identity, canonical closure-receipt SHA-256 and SHA-256 of each required evidence reference. `EXTERNALLY_REPORTED_PASS` is not repository authentication or closure authority; all authority flags stay false and `internalDecisionStatus=NOT_RUN`; exact head `e75a30ecd4d38b17ea0b56300827f5a3e06e0b0d` passed CI #1114, P12 Final Release Artifact #425 and P12 Offline Acceptance #469 on Windows/macOS/Ubuntu before guarded squash merge `464461a86a4aed4bd43260baee79619a25216c2b`. Integration Readiness did not trigger for this code-only diff.',
    '- PR #343 added exact binding for a caller-supplied externally reported evidence-authentication result to the current reference-review identity, canonical closure-receipt SHA-256 and SHA-256 of each required evidence reference. `EXTERNALLY_REPORTED_PASS` is not repository authentication or closure authority; all authority flags stay false and `internalDecisionStatus=NOT_RUN`; exact head `e75a30ecd4d38b17ea0b56300827f5a3e06e0b0d` passed CI #1114, P12 Final Release Artifact #425 and P12 Offline Acceptance #469 on Windows/macOS/Ubuntu before guarded squash merge `464461a86a4aed4bd43260baee79619a25216c2b`. Integration Readiness did not trigger for this code-only diff.\n- PR #345 synchronized canonical README/P14/project-state/next-actions through the external-authentication binding slice; exact head `c860f2dcbae7ef54bb54b76a4471f68733c85b2b` passed CI #1116, Integration Readiness #397, P12 Final Release Artifact #427 and P12 Offline Acceptance #471 before guarded squash merge `359f247fbb70ee5e301136682ad69a0945e0a6ed`.\n- PR #346 started P16 with a bounded repository-owned normalized parsed-block contract and read-only documented-core API-v3 capability registry for Paragraph, Heading, Image and Group. Raw WordPress `innerContent`, native post-content serialization, editor/import/render proof and target compatibility remain outside this slice; exact head `faab4bb4d0805e6d71c04e91ac543ee2805f762e` passed CI #1118, P12 Final Release Artifact #429 and P12 Offline Acceptance #473 on Windows/macOS/Ubuntu before guarded squash merge `66f6a77f31c69b0c4cd280a21bc03eb53759ec4d`. Integration Readiness did not trigger for this implementation diff.',
)
replace_once(
    'README.md',
    '| P16 Gutenberg native export + transfer | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | R0+R1 refresh as needed; native block/pattern/editor validation |',
    '| P16 Gutenberg native export + transfer | CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED | N/A | `──────────` | Normalized parsed-block validation + four documented core API-v3 capability entries are merged; exact document/profile identity, native serialization/runtime parity, real editor/import validation, Figma semantic mapping and download remain unwired/unaccepted |',
)
replace_once(
    'README.md',
    '**Overall progress is intentionally not collapsed into one synthetic percentage.** Historical P0-P7 core remains 100%; P12 remains 80%; P13 implementation is complete with real-plugin runtime acceptance pending; P14 core/read-only review implementation is active while confirmation and retained-duplicate mutation authority remain unwired; P15 core foundation is in progress with target import still unvalidated; P16-P26 implementation is not started; P27 release execution is not started.',
    '**Overall progress is intentionally not collapsed into one synthetic percentage.** Historical P0-P7 core remains 100%; P12 remains 80%; P13 implementation is complete with real-plugin runtime acceptance pending; P14 core/read-only review implementation is active while confirmation and retained-duplicate mutation authority remain unwired; P15 core foundation is in progress with target import still unvalidated; P16 core foundation is now in progress with native target validation/generation still unwired; P17-P26 implementation is not started; P27 release execution is not started.',
)
replace_once(
    'README.md',
    '4. implement P15 Elementor;\n5. implement P16 Gutenberg;\n6. continue P17-P26 in retained dependency order;',
    '4. continue bounded P15 Elementor work when genuine target/evidence dependencies permit;\n5. continue P16 Gutenberg from the normalized parsed-block/capability foundation through explicit document/profile identity and later native serialization/runtime validation gates;\n6. continue P17-P26 in retained dependency order;',
)

# docs/P14_FOUNDATION_IMPLEMENTATION.md
replace_once(
    'docs/P14_FOUNDATION_IMPLEMENTATION.md',
    'Canonical status synchronized through P14 review-packet and P15 R1 profile/reference-review/closure-evidence/operator-intake/pre-decision-review/external-authentication-binding merges',
    'Canonical status synchronized through P14 review-packet, P15 R1 profile/reference-review/closure-evidence/operator-intake/pre-decision-review/external-authentication-binding merges, and the first P16 normalized parsed-block foundation',
)
replace_once(
    'docs/P14_FOUNDATION_IMPLEMENTATION.md',
    'Current main is:\n\n`464461a86a4aed4bd43260baee79619a25216c2b`',
    f'Current main is:\n\n`{MAIN}`',
)
replace_once(
    'docs/P14_FOUNDATION_IMPLEMENTATION.md',
    'P12 remains at its retained 80% release-exit state. P15 now has a bounded non-authorizing Elementor R1 foundation: v0.4/container validation, documented-core capability reporting, candidate identity/receipt + offline import intake, immutable declared target-profile fingerprints, profile-bound import evidence, read-only profile alignment, global-reference key review, exact core-image MEDIA asset review, a deterministic combined reference-review identity, an exact-bound external closure-evidence receipt contract, an offline closure-evidence operator intake, a deterministic pre-decision review packet and an exact-bound externally reported authentication-result contract. Real target import remains unvalidated; raw global values and asset URLs are not resolved/emitted; repository code does not authenticate evidence references or identify/verify an authenticator; `EXTERNALLY_REPORTED_PASS` only means the supplied PASS report matches the exact current receipt/identity/reference hashes, while `internalDecisionStatus=NOT_RUN`; all closure/compatibility/production/generation/download authority remains disabled; and no Figma-to-Elementor generation/download surface is wired. P16-P26 remain preflight-frozen / implementation-not-started. P27 #182 remains the final production-release gate.',
    'P12 remains at its retained 80% release-exit state. P15 now has a bounded non-authorizing Elementor R1 foundation: v0.4/container validation, documented-core capability reporting, candidate identity/receipt + offline import intake, immutable declared target-profile fingerprints, profile-bound import evidence, read-only profile alignment, global-reference key review, exact core-image MEDIA asset review, a deterministic combined reference-review identity, an exact-bound external closure-evidence receipt contract, an offline closure-evidence operator intake, a deterministic pre-decision review packet and an exact-bound externally reported authentication-result contract. Real Elementor target import remains unvalidated; raw global values and asset URLs are not resolved/emitted; repository code does not authenticate evidence references or identify/verify an authenticator; `EXTERNALLY_REPORTED_PASS` only means the supplied PASS report matches the exact current receipt/identity/reference hashes, while `internalDecisionStatus=NOT_RUN`; all closure/compatibility/production/generation/download authority remains disabled; and no Figma-to-Elementor generation/download surface is wired. P16 has now started a bounded non-authorizing Gutenberg R1 foundation with repository-owned normalized parsed-block validation and read-only documented-core API-v3 capability reporting only; raw native block markup generation, WordPress parser/serializer runtime parity, editor/import validation, Figma semantic mapping and download authority remain unwired. P17-P26 remain preflight-frozen / implementation-not-started. P27 #182 remains the final production-release gate.',
)

# memory-bank/PROJECT_STATE.md
replace_once(
    'memory-bank/PROJECT_STATE.md',
    '8. bounded P15 Elementor R1 foundation with v0.4/container validation, documented-core capabilities, exact candidate/import-evidence binding, immutable declared target profiles, read-only alignment, bounded global/core-image asset review, combined reference identity, exact-bound external closure-evidence receipts, offline operator intake, deterministic non-authorizing pre-decision review packets and exact-bound externally reported authentication-result binding;\n9. exact-build release/provenance and fail-closed P12 publisher-evidence tooling.',
    '8. bounded P15 Elementor R1 foundation with v0.4/container validation, documented-core capabilities, exact candidate/import-evidence binding, immutable declared target profiles, read-only alignment, bounded global/core-image asset review, combined reference identity, exact-bound external closure-evidence receipts, offline operator intake, deterministic non-authorizing pre-decision review packets and exact-bound externally reported authentication-result binding;\n9. bounded P16 Gutenberg foundation with repository-owned normalized parsed-block validation and read-only documented-core API-v3 capability reporting;\n10. exact-build release/provenance and fail-closed P12 publisher-evidence tooling.',
)
replace_once(
    'memory-bank/PROJECT_STATE.md',
    'Current verified main after the P15 R1 externally reported authentication-binding slice:\n\n`464461a86a4aed4bd43260baee79619a25216c2b`',
    f'Current verified main after the first P16 normalized parsed-block/capability foundation:\n\n`{MAIN}`',
)
replace_once(
    'memory-bank/PROJECT_STATE.md',
    '- #343 exact-bound externally reported authentication-result binding -> `464461a86a4aed4bd43260baee79619a25216c2b`.',
    '- #343 exact-bound externally reported authentication-result binding -> `464461a86a4aed4bd43260baee79619a25216c2b`;\n- #345 canonical P15 external-authentication docs sync -> `359f247fbb70ee5e301136682ad69a0945e0a6ed`;\n- #346 first P16 Gutenberg normalized parsed-block/capability foundation -> `66f6a77f31c69b0c4cd280a21bc03eb53759ec4d`.',
)
replace_once(
    'memory-bank/PROJECT_STATE.md',
    'Focused issues #275, #280, #284, #285, #288, #295, #297, #299, #301, #303, #305, #307, #309, #311, #313, #315, #317, #319, #321, #323, #325, #327, #329, #331, #333, #337, #339 and #342 are completed through their reviewed implementation/artifact flows.',
    'Focused issues #275, #280, #284, #285, #288, #295, #297, #299, #301, #303, #305, #307, #309, #311, #313, #315, #317, #319, #321, #323, #325, #327, #329, #331, #333, #337, #339, #342, #344 and #341 are completed through their reviewed implementation/artifact flows.',
)
replace_once(
    'memory-bank/PROJECT_STATE.md',
    '## P16-P26 state\n\nP16-P26 remain **preflight frozen / implementation not started** and proceed under roadmap #119 with R0/R1 gates as applicable.',
    '## P16 state\n\nP16 is now **CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED**. PR #346 retained the current official WordPress/Gutenberg R0 snapshot and added a repository-owned `gutenberg-normalized-parsed-block-v1` review envelope for bounded `blockName`, `attrs`, `innerBlocks` and `innerHTML` trees. Top-level `blockName=null` is retained as freeform/non-block content; nested freeform fails closed. The normalized model intentionally rejects raw-parser-only fields such as `innerContent`, so it is not represented as the complete `parse_blocks()` return type or as WordPress serialization.\n\nThe first read-only capability registry recognizes only exact current documented API-v3 IDs `core/paragraph`, `core/heading`, `core/image` and `core/group`; custom/unregistered/freeform content remains `REVIEW_REQUIRED`. `targetCompatibilityClaim=false`, `productionAcceptance=false`, `generationEnabled=false` and `downloadEnabled=false`. No raw block markup generation, WordPress runtime/site connection, native parser/serializer parity, editor/import/render proof, Figma semantic mapping, selected-section transfer or target-ready download is accepted yet.\n\n## P17-P26 state\n\nP17-P26 remain **preflight frozen / implementation not started** and proceed under roadmap #119 with R0/R1 gates as applicable.',
)
replace_once(
    'memory-bank/PROJECT_STATE.md',
    'Keep #159 genuine Figma Desktop evidence as the prerequisite before real P14 mutation exposure. In parallel, continue P15 only through bounded deterministic R1 target-adapter slices. Documented core-image asset review, combined reference-review identity, exact-bound closure-evidence receipt validation, offline operator intake, the non-authorizing pre-decision review packet and exact-bound externally reported authentication-result binding are implemented. The next authority-bearing step still requires genuine trusted authentication plus a separate internal decision; repository code must not fetch/authenticate evidenceReference values, infer authenticator identity, or treat `EXTERNALLY_REPORTED_PASS` as closure/compatibility authority. Product download, semantic generation and target-compatibility authority stay disabled until genuine Elementor target validation and later gates justify them.',
    'Keep #159 genuine Figma Desktop evidence as the prerequisite before real P14 mutation exposure. P15 remains blocked from stronger authority by genuine trusted authentication plus a separate internal decision; repository code must not fetch/authenticate `evidenceReference` values, infer authenticator identity, or treat `EXTERNALLY_REPORTED_PASS` as closure/compatibility authority. In parallel, the next safe repository-side P16 slice is exact normalized-document identity plus an immutable declared WordPress/Gutenberg target profile, still without raw native markup generation or compatibility authority. P15/P16 product download, semantic generation and target-compatibility authority stay disabled until genuine target validation and later gates justify them.',
)

# memory-bank/NEXT_ACTIONS.md
replace_once(
    'memory-bank/NEXT_ACTIONS.md',
    '## Immediate action — P15 genuine authentication + internal decision boundary\n\nClassification: **EXTERNAL AUTHENTICATION-REPORT BINDING MERGED / GENUINE AUTHENTICATION + INTERNAL DECISION PENDING**.\n\nThe documented core-image asset review, combined global+asset reference-review identity, exact-bound external closure PASS/FAIL receipt contract, offline/operator intake, deterministic pre-decision review packet and exact-bound externally reported authentication-result contract are merged. The next authority-bearing step still requires genuine trusted evidence authentication plus a separate internal review/decision; repository CI, synthetic receipts, fixture packets or caller-supplied PASS fields cannot substitute for that evidence.\n\nUse `p15:reference-closure-intake` only to validate exact template/profile/receipt binding and sanitize operator evidence. Use `p15:reference-closure-review-packet` only to freeze that exact-bound reported state for human pre-decision review. The external authentication-report contract may record `EXTERNALLY_REPORTED_PASS` only when the supplied PASS report matches the current reference-review identity digest, canonical receipt SHA-256 and SHA-256 of every required evidence reference. It does not fetch/authenticate evidence, identify a verifier, verify signatures, set `referenceClosureClaim`, establish target compatibility or grant production/generation/download authority; `authenticationAuthority=false` and `internalDecisionStatus=NOT_RUN` remain mandatory.\n\nDo not introduce a WordPress connection, target mutation, Pro/add-on availability inference, Atomic generation or product download UI merely to manufacture closure. No next code-side contract may convert caller-supplied authentication reporting into authority without genuine retained evidence and an explicit separate internal decision path.',
    '## Immediate action — P16 normalized-document identity + declared target profile\n\nClassification: **P16 CORE FOUNDATION IN PROGRESS / NON-AUTHORITATIVE IDENTITY-PROFILE SLICE NEXT**.\n\nPR #346 merged the first bounded Gutenberg foundation: current official R0 snapshot, repository-owned normalized parsed-block validation and a read-only documented-core API-v3 registry for `core/paragraph`, `core/heading`, `core/image` and `core/group`. Custom/unregistered/freeform content remains `REVIEW_REQUIRED`; raw Gutenberg markup generation, WordPress parser/serializer runtime parity, editor/import/render validation and Figma semantic mapping are still unwired.\n\nThe next safe repository-side P16 slice is deterministic canonical identity for the exact normalized document plus an immutable **declared** WordPress/Gutenberg target profile. It must remain metadata/evidence only: no claim that the declared target was observed, no native block markup generation, no target-site availability inference, no editor/import compatibility claim, no production acceptance and no download authority.\n\nP15 remains a parallel external-evidence dependency: genuine trusted authentication plus a separate internal decision are still required before any closure/compatibility authority. Repository CI, synthetic receipts or caller-supplied `EXTERNALLY_REPORTED_PASS` cannot substitute for that evidence.',
)
replace_once(
    'memory-bank/NEXT_ACTIONS.md',
    '- P16-P26 — preflight frozen / implementation not started;',
    '- P16 — core foundation in progress / target validation unwired: normalized parsed-block validation + exact four-block documented-core API-v3 capability registry are merged; document/profile identity, native serialization/runtime parity, real editor/import validation, semantic mapping and download remain pending;\n- P17-P26 — preflight frozen / implementation not started;',
)
replace_once(
    'memory-bank/NEXT_ACTIONS.md',
    '- PR #343 -> `464461a86a4aed4bd43260baee79619a25216c2b`; exact head `e75a30ecd4d38b17ea0b56300827f5a3e06e0b0d`; CI #1114, Final Release #425 and Offline #469 PASS;\n- Integration Readiness did not trigger for the code-only #326/#328/#330/#334/#338/#343 diffs.',
    '- PR #343 -> `464461a86a4aed4bd43260baee79619a25216c2b`; exact head `e75a30ecd4d38b17ea0b56300827f5a3e06e0b0d`; CI #1114, Final Release #425 and Offline #469 PASS;\n- PR #345 docs sync -> `359f247fbb70ee5e301136682ad69a0945e0a6ed`; CI #1116, Integration Readiness #397, Final Release #427 and Offline #471 PASS;\n- Integration Readiness did not trigger for the code-only #326/#328/#330/#334/#338/#343 diffs.\n\n### P16 Gutenberg foundation batch\n\n- PR #346 -> `66f6a77f31c69b0c4cd280a21bc03eb53759ec4d`; exact head `faab4bb4d0805e6d71c04e91ac543ee2805f762e`; CI #1118, Final Release #429 and Offline #473 PASS;\n- Integration Readiness did not trigger for #346.',
)
replace_once(
    'memory-bank/NEXT_ACTIONS.md',
    '6. No Figma-to-Elementor semantic generator, Pro/add-on mapping or Atomic generation support is accepted yet.\n7. #287 remains an admin-level repository protection residual until branch rules are actually enabled.\n8. P12 historical publishing evidence remains unchanged and P27 owns final live release-exit evidence.',
    '6. No Figma-to-Elementor semantic generator, Pro/add-on mapping or Atomic generation support is accepted yet.\n7. P16 normalized parsed-block/core-capability evidence is not WordPress serialization or target compatibility; native serializer/parser parity, target profile observation, editor/import validation and Figma semantic mapping remain pending.\n8. #287 remains an admin-level repository protection residual until branch rules are actually enabled.\n9. P12 historical publishing evidence remains unchanged and P27 owns final live release-exit evidence.',
)

print('docs sync 347 replacements applied')
