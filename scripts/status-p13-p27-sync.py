from pathlib import Path

PROJECT = Path('memory-bank/PROJECT_STATE.md')
ROADMAP = Path('memory-bank/ROADMAP.md')
NEXT = Path('memory-bank/NEXT_ACTIONS.md')


def replace_exact(path: Path, old: str, new: str, count: int = 1):
    text = path.read_text()
    actual = text.count(old)
    if actual != count:
        raise SystemExit(f'{path}: expected {count} copies of anchor, found {actual}')
    path.write_text(text.replace(old, new, count))

for path in (PROJECT, ROADMAP, NEXT):
    replace_exact(path, 'Last updated: 2026-09-11', 'Last updated: 2026-09-12')

replace_exact(
    PROJECT,
    """## Current issue queue\n\n- #84 — P12 final integrated validation/release acceptance: **ACTIVE / external-manual-runtime blocked**, retained at 80% until the exact publishing package/account/2FA/final-exit evidence is genuinely retained. Community approval remains external.\n- #119 — post-P12 P13-P26 commercial/multi-target roadmap: **PLANNED / dependency-blocked by #84 internal exit**. Research/reliability planning may progress; runtime implementation may not start yet.\n- #126 — exact release #20 publisher evidence intake hardening: **COMPLETED** through PR #129.\n""",
    """## Current issue queue\n\n- #84 — P12 final integrated validation/release acceptance: **ACTIVE / retained at 80%**. Remaining exact runtime/publisher/2FA evidence and the final internal release-exit decision are deferred to the P27 final-release sequence. Community approval remains external.\n- #119 — P13-P27 commercial/multi-target roadmap: **ACTIVE**. P13-P26 implementation/testing may proceed to implementation-complete/internal-readiness without waiting for #84; production acceptance/release remains separate.\n- #159 — P13 real-plugin Build-Ready runtime/parity evidence: **OPEN runtime-acceptance dependency**. P13 implementation is complete, but real-plugin runtime acceptance is not.\n- #182 — P27 final production-release gate: **DEFINED / execution deferred** until the implementation/internal-readiness program is ready.\n- #126 — exact release #20 publisher evidence intake hardening: **COMPLETED** through PR #129.\n""",
)

replace_exact(
    PROJECT,
    "The commercial plan has two recurring pre-implementation gates plus phases P13-P26:",
    "The commercial plan has two recurring pre-implementation gates, implementation phases P13-P26, and the final production-release gate P27:",
)

replace_exact(
    PROJECT,
    """| P13-P26 multi-target commercial expansion | PLANNED / BLOCKED | 0% | Do not implement before #84 internal exit |\n\nHistorical P0-P7 core progress remains 100%.\n""",
    """| P13 Build-Ready Score + Responsive Risk | IMPLEMENTATION COMPLETE / RUNTIME ACCEPTANCE PENDING | 100% impl | #159 real-plugin parity/internal runtime acceptance |\n| P14 Target-Ready Duplicate + Guided Prepare | CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED | N/A | Continue pure-core fail-closed hardening; production registry remains empty |\n| P15-P26 multi-target commercial implementation | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | Implement in dependency order with R0/R1 where applicable |\n| P27 final production release | GATE DEFINED / EXECUTION DEFERRED | 0% exec | Coordinate final live runtime/publisher/2FA evidence + #84 release-exit truth |\n\nHistorical P0-P7 core progress remains 100%. Implementation completion, runtime acceptance and production release are tracked separately.\n""",
)

replace_exact(
    PROJECT,
    """## Immediate target\n\nDo **not** start P13 runtime implementation.\n\nImmediate executable product path remains #84:\n\n1. use the exact release #20 ZIP + extracted three-file directory;\n2. retain a fresh live Figma Desktop runtime screenshot from that exact package;\n3. retain a fresh Publish/Add-final-details screenshot where the generated publishing ID is accepted and the intended publisher identity, Community target, support contact and No network access are visible;\n4. retain a fresh Figma account/security screenshot showing 2FA enabled;\n5. run `npm run p12:publisher-evidence -- ...` and retain the receipt;\n6. perform final P12 internal exit review against receipt + screenshots;\n7. only then open the focused P13 implementation issue;\n8. run R0 + R1 before each major external target adapter;\n9. implement only after target profile, capability matrix, error model, validator and acceptance harness are frozen.\n""",
    """## Immediate target\n\nContinue the implementation/internal-readiness program without making production-release claims:\n\n1. continue P14 target-neutral pure-core hardening with focused issues/branches/PRs while real Figma mutation remains unwired;\n2. complete #159 only when genuine real-plugin runtime/parity evidence is available; it gates P14 real mutation exposure, not pure-core development;\n3. refresh R0 and execute R1 before each major external target adapter where platform facts/capabilities require it;\n4. implement P15-P26 in dependency order with atomic validators/harnesses and no live-target claim without observed evidence;\n5. use P27 #182 only after implementation/internal-readiness is ready;\n6. during P27, capture the remaining exact runtime, Publish final-details and 2FA evidence, run the retained P12 publisher-evidence intake, and perform the genuine #84 release-exit decision;\n7. keep Community submission/review/approval external to internal production acceptance.\n""",
)

old_roadmap_rows = """| P13 | Build-Ready Score 2.0 + Responsive Risk | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | P12 internal exit first |\n| P14 | Target-Ready Duplicate + Guided Prepare | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Requires P13 read-only contracts |\n| P15 | Elementor native export + import validation | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | R0+R1, versioned v3/v4 adapters, real import acceptance |\n| P16 | Gutenberg native export + section transfer | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | R0+R1, parse/serialize/editor validation |\n| P17 | HTML/CSS/JS export + code-to-design import | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | R0+R1, static-first; JS sandbox spec required |\n| P18 | Framework adapter platform | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | R0+R1, neutral component IR + adapter SDK + build matrix |\n| P19 | Asset pack + font manifest + design-system export | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Stored-original vs rendered policy; font/API constraints |\n| P20 | Round-trip visual QA + exact section portability | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Target render harness + optional offline-first WP Builders Bridge |\n| P21 | Developer handoff + client/QA + bounded a11y/SEO advisories | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Build from accepted target outputs |\n| P22 | Deterministic complexity/effort estimator | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Transparent/configurable factors only |\n| P23 | Agency/project + existing-component bindings | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Stable adapters/report contracts first |\n| P24 | CMS/dynamic data/forms/interactions | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Static/native export stability first |\n| P25 | Free / Pro / Agency packaging + entitlements | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Keep account/payment outside deterministic core |\n| P26 | Optional AI assistance | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Opt-in research/explainer/drafting only |\n"""
new_roadmap_rows = """| P13 | Build-Ready Score 2.0 + Responsive Risk | IMPLEMENTATION COMPLETE / RUNTIME ACCEPTANCE PENDING | 100% impl | `██████████` | #159 real-plugin parity/internal runtime acceptance |\n| P14 | Target-Ready Duplicate + Guided Prepare | CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED | N/A | `──────────` | Continue pure-core hardening; production registry empty; #159 before real mutation exposure |\n| P15 | Elementor native export + import validation | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | R0+R1, versioned v3/v4 adapters, real import acceptance |\n| P16 | Gutenberg native export + section transfer | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | R0+R1, parse/serialize/editor validation |\n| P17 | HTML/CSS/JS export + code-to-design import | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | R0+R1, static-first; JS sandbox spec required |\n| P18 | Framework adapter platform | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | R0+R1, neutral component IR + adapter SDK + build matrix |\n| P19 | Asset pack + font manifest + design-system export | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Stored-original vs rendered policy; font/API constraints |\n| P20 | Round-trip visual QA + exact section portability | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Target render harness + optional offline-first WP Builders Bridge |\n| P21 | Developer handoff + client/QA + bounded a11y/SEO advisories | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Build from accepted target outputs |\n| P22 | Deterministic complexity/effort estimator | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Transparent/configurable factors only |\n| P23 | Agency/project + existing-component bindings | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Stable adapters/report contracts first |\n| P24 | CMS/dynamic data/forms/interactions | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Static/native export stability first |\n| P25 | Free / Pro / Agency packaging + entitlements | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Keep account/payment outside deterministic core |\n| P26 | Optional AI assistance | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Opt-in research/explainer/drafting only |\n| P27 | Final production release + publisher/runtime evidence | GATE DEFINED / EXECUTION DEFERRED | 0% exec | `░░░░░░░░░░` | Final live evidence + retained #84 release-exit decision after implementation/internal readiness |\n"""
replace_exact(ROADMAP, old_roadmap_rows, new_roadmap_rows)

replace_exact(
    ROADMAP,
    """R0/R1 are governance/acceptance gates and do not receive product implementation percentages. P13-P26 are approved future scope at `0% / PLANNED-BLOCKED`. New scope does not retroactively lower completed-core progress.\n""",
    """R0/R1 are recurring governance/acceptance gates. P13 implementation is complete but runtime acceptance remains open; P14 implementation is active with no stable numeric denominator while the pure-core safety surface is still being closed; P15-P26 implementation is not started; P27 execution is deferred. New scope does not retroactively lower completed-core progress.\n""",
)

replace_exact(ROADMAP, '## P13-P26 dependency order', '## P13-P27 dependency and release order')
replace_exact(
    ROADMAP,
    '13. P26 adds optional AI only after deterministic outputs exist.\n',
    '13. P26 adds optional AI only after deterministic outputs exist.\n14. P27 performs the final production-release sequence, coordinates remaining live runtime/publisher/2FA evidence and preserves #84 as the P12 release-exit truth.\n',
)

replace_exact(
    NEXT,
    "### #84 — P12 final integrated validation/release acceptance\n\nClassification: **active external/manual runtime + publisher gate**.\n\nP12 remains `80%` until live evidence closes the exact publishing-package/account/2FA/final-exit path.",
    "### #84 — P12 final integrated validation/release acceptance\n\nClassification: **active retained release-exit truth / live evidence deferred to P27**.\n\nP12 remains `80%` until genuine live evidence closes the exact publishing-package/account/2FA/final-exit path. Development through P13-P26 is no longer blocked by this manual gate.",
)

replace_exact(NEXT, 'Immediate required evidence/action:', 'Deferred P27 release evidence/action:')

replace_exact(
    NEXT,
    """### #119 — Multi-target commercial expansion roadmap\n\nClassification: **planning active / implementation dependency-blocked by #84 internal exit**.\n\nResearch/reliability planning may proceed; P13 runtime code may not.\n""",
    """### #119 — Multi-target commercial expansion roadmap\n\nClassification: **P13-P27 active roadmap; implementation/testing through P26 is authorized independently of final production release**.\n\nP13 implementation is complete, P14 pure-core implementation is active, P15-P26 remain preflight-frozen/not-started, and P27 #182 is the deferred final production-release gate.\n""",
)

replace_exact(
    NEXT,
    '- P26 — optional AI assistance.\n',
    '- P26 — optional AI assistance;\n- P27 — final production release + retained live runtime/publisher/2FA evidence and #84 release-exit decision.\n',
)

replace_exact(NEXT, '## First implementation sequence after P12 internal exit', '## Current implementation sequence under the P13-P27 model')

replace_exact(
    NEXT,
    """### P13\n\n1. open a focused P13 implementation issue from #119;\n2. freeze Build-Ready v2 categories and target-compatibility evidence schema;\n3. add responsive-risk fixtures;\n4. implement read-only only;\n5. add deterministic plugin/CLI parity tests;\n6. calibrate on real Figma where offline fixtures cannot prove behavior;\n7. production acceptance before P14 new mutation scope.\n\n### P14\n\nAfter P13 acceptance:\n\n1. define `Create Target-Ready Duplicate` transaction contract;\n2. ensure original remains untouched;\n3. prepare only already-explainable patterns;\n4. validate/re-score duplicate;\n5. add cancellation/retry/source-staleness coverage;\n6. real Figma acceptance.\n""",
    """### P13\n\nImplementation is complete for Build-Ready Score v2, Responsive Risk, plugin/CLI integration and retained real-source calibration. Remaining work is #159 genuine real-plugin runtime/parity evidence and separate internal runtime acceptance. This is not a production-release claim.\n\n### P14\n\nCurrent work is target-neutral pure-core hardening only:\n\n1. keep the approved source immutable and mutate only retained candidates;\n2. keep production safe-recipe authority empty until explicit acceptance;\n3. fail closed on malformed/stale adapter/control evidence and preserve cleanup;\n4. validate/re-score before retention and reject newly introduced HIGH/BLOCKER findings;\n5. continue focused safety-gap audits until core implementation is internally ready;\n6. require #159 before real Figma mutation exposure;\n7. require genuine real-Figma acceptance before any production mutation/readiness claim.\n""",
)
