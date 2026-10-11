# Next Actions

Last updated: 2026-09-28  
Recovery queue added: 2026-10-08; M1 synced 2026-10-10

Open dependency PRs: Dependabot #890/#892/#893 fail the pinned-toolchain contract (`verify`, `build-final-release`) and need one consolidated pin-update train like #835; #891 was green on its 2026-10-05 base.

## ACTIVE QUEUE — Product Recovery Program (since 2026-10-08)

Canonical backlog: [`docs/PRODUCT_RECOVERY_PLAN.md`](../docs/PRODUCT_RECOVERY_PLAN.md) (D-047). The resume pointer is also in `.ai/state/CURRENT-STATE.yaml` → `recovery_program`.

1. **M0 — Critical correctness fixes: ACCEPTED.** PR #895, exact head `e8672b0`, passed 10/10 required checks and was merged as `f18240e`.
2. **M1 — table-driven Elementor mapping engine: ACCEPTED.** PRs #898, #899 and #900 are merged (`47ada79`).
3. **M2 — full single-frame Figma extraction: ACCEPTED.** PRs #905, #906 and #907 are merged (`850c517`; #907 exact head `ff86754`, 10/10 checks). Acceptance evidence: the golden landing page exports with zero silent drops (`tests/m2-golden-landing-page.test.ts`).
4. **M3 — assets: ACCEPTED.** PRs #908, #909 and #910 are merged (PR #910, exact head `0b8663f`, 10/10 checks, merged `a4ee8dd`). Acceptance evidence: images and SVG load in the real-target render (run 38103090238).
5. **Active: M4 — responsive breakpoint engine.** M4.1 (breakpoint set), M4.2 (node matcher) M4.3a (container layout merge) and M4.3b (presence and order) are done; **next task: M4.3c** (widget properties per breakpoint). Then continue with:
   - M4: responsive breakpoint engine;
   - M5: smart duplicate and breakpoint alignment;
   - M6: target profiles and v4 Atomic;
   - M7: round-trip proof;
   - M8: Gutenberg.

The older sections below remain valid history and authority-boundary truth. Where they say "continue P15/P16/P17 evidence slices", that is superseded in priority by this queue (D-047).


Runtime artifact preflight requires `config/runtime-artifacts.json` schema-v3 and must fail closed on stale or mismatched registered artifacts.

Security audit train #579 hardens exact-loopback proof-token use/retention, atomic output replacement and duplicate CLI options. #603/#604 hardens canonical snapshot local-file identity, #605/#606 blocks credentialed Figma REST redirects, #607/#608 hardens runtime artifact byte ceilings during descriptor reads with post-read identity revalidation, and #609 extends the same bounded-read/post-read identity rule to runtime-closure evidence and same-artifact verifier rereads. #287 remains repository-admin branch/ruleset enforcement work and must not be represented as code-complete.

## Current P18 preflight

#849 merged as main `e5896d279988412736d1e0ea53ee5dc72081ba61` and #851 merged as `7f92b88a2b80eb92598ad76ef96be1d720c3b566`, each after seven exact-head workflows and zero unresolved review threads. #846 remains open. #848 records the React R0/R1 matrix; #850/#851 add the bounded deterministic static adapter with refusal tests; #852/#853 retain static TSX compile evidence. PR #858 then merged a pinned React/Vite runtime fixture and local Chrome receipt as main `4fc693b33051435ad5309e0e4cbcf068582cd95f`. P12 #84, visual parity, Elementor target acceptance and P19 remain independently pending.

## Toolchain baseline

Issue #634 establishes the coordinated repository baseline at Node.js `22.12.0+`, Vitest `5.0.1`, Vite `8.3.0`, esbuild `0.28.2`, Playwright Core `1.63.0` and `@types/node 26.6.1`. Do not reopen a standalone Vitest-major bump or downgrade individual members of this compatibility matrix without a new coordinated migration and exact-head Runner evidence. The 2026-10-10 consolidated patch train moved the matrix to Vitest `5.0.3`, Vite `8.3.2`, `@types/node 26.6.4` and Figma typings `1.140.0`.

## Execution mode — focused Elementor V1 release train

Prioritize evidence-backed P15/P16/P17 closure and open P18 R0/R1 preflight under #846 before P19. Continue independent bounded implementation while real target/source proof is unavailable. Keep P19-P26 frozen; no synthetic phase-exit claim.

Use focused typecheck/tests/builds while iterating. The exact integration head must pass the repository's full CI / P12 Final Release Artifact / P12 Offline Acceptance gates before merge. Canonical docs synchronize once per behavior-changing release train rather than in separate ceremonial docs PRs.

## Authority boundaries that must remain true

- P12 — **IN PROGRESS / 80%**; historical publishing authority remains Final Release Artifact #20 from source `5f12b1d28146d5c2af815cc9f83eb30431dce4b5`, plugin ID `1680034649341961379`.
- P13 — **IMPLEMENTATION COMPLETE / RUNTIME ACCEPTANCE PENDING**; #159 requires genuine Figma Desktop evidence.
- P14 — **IMPLEMENTATION COMPLETE / INTERNAL CONFIRMATION ACTIVATION / PRODUCTION ACCEPTANCE PENDING**; R1-R6 are merged through PR #658, the exact production planning registry binding is present, internal/dev activation requires explicit confirmation + fresh authorization checks, and publishable release activation remains hard-disabled/stripped.
- P15 — **CORE FOUNDATION IN PROGRESS / CONTROLLED TARGET PROOF RETAINED**. Terminal PR #770 passed 7/7 and merged as main `5f7fa2b5...`. Issue #773 / PR #774 passed 7/7 on exact head `3fd122cd...`, zero review threads, merged main `6ef3ea58...`; Issue #775 / PR #776 passed 7/7 on `2c1a8c5d...`, merged main `ebbe9ee8...`; Issue #777 / PR #778 passed 7/7 on `74641fd6...`, merged main `21848e94...`; Issue #779 / PR #780 passed 7/7 on `7d59a098...`, merged main `cbec0be0...`; Issue #781 / PR #782 passed 7/7 on `5e3976a1...`, merged main `5eb93905...`; Issue #783 / PR #784 passed 7/7 on `4389969f...`, merged main `d7c5cc87...`; Issue #785 / PR #787 passed 7/7 on `57a08f4b...`, merged main `965bb48e...`; Issue #788 / PR #789 passed 7/7 on `9ec87232...`, merged main `228b68a1...`; Issue #790 / PR #791 passed 7/7 on `2aa8d19c...`, merged main `d24ed13b...`; Issue #792 / PR #793 passed 7/7 on `5e404876...`, merged main `e6de603b...`; Issue #794 / PR #795 composed five bounded Button color families and merged after 7/7 exact-head gates; #786 closed duplicate. PR #772 closed unmerged after an overbroad registry review.
- P16 — **CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED**.
- P17 — **FOUNDATION IMPLEMENTATION IN PROGRESS / CONTROLLED LOCAL BROWSER PROOF**; #612/#613 static export, #614/#615 import safety preflight, #616/#617 neutral Web IR, #618/#623 IR→HTML/CSS generation and #628/#629 package validation are merged; #630 adds one exact local-only Chrome render observation. JavaScript execution, visual-fidelity comparison, Web→Figma reconstruction and production acceptance remain unclaimed.
- P18 — **REACT STATIC ADAPTER + CONTROLLED RUNTIME PROOF RETAINED / TARGET ACCEPTANCE PENDING**; #850 SDK/refusal tests and #858 pinned React/Vite + local Chrome receipt are green. Visual/Figma parity, Elementor target acceptance and production acceptance remain separate.
- P19-P26 — **PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED**.
- P27 — **GATE DEFINED / EXECUTION DEFERRED** under #182.
- #287 remains repository-admin branch/ruleset enforcement work.

Never promote local artifact validation, environment qualification, evidence-chain validation, deterministic style serialization, declared profile alignment, mapping readiness, caller-supplied evidence or CI success into real target compatibility/import/render/production authority.

## P17 active implementation line

Continue only static-first, non-authorizing slices from the merged neutral Web IR. #630 is the first controlled local-only browser observation and must stay bound to the exact R4-validated package, loopback allowlist and non-authorizing receipt. Any next slice must keep visual-fidelity comparison, JavaScript execution, Web→Figma reconstruction and production acceptance as separate evidence gates.

## Current continuation after PR #818

PR #818 exact head `dea45549df14cc23df01939139fa65793d654cc3` passed all seven required gates with zero unresolved review threads, expected-head merged as main `13fb2f5b9200dc9ece2174be3d24d5d259ea29bd`, and #817 closed. Issue #819 owns post-merge state reconciliation and a fresh P15 capability-map review. README and older P15 action lists still contain stale handoff text; update from exact current source before selecting a feature. Keep #84, #159, #182 and #287 authority blockers unchanged.

## P15 evidence-integrity provenance

Accepted implementation baseline immediately preceding the stable operator-I/O hardening line is `d8d8ef2762dbe9aeae0da4bbcab3b46aae93535c`.

Accepted sequence relevant to the live proof boundary:

- PR #487 / issue #486 — environment qualification; merge `dd281b8bea7670e252629e931129a5276d08bef3`; final head passed CI #1294, Final #605, Offline #649;
- PR #489 / issue #488 — exact environment-bound proof chain; merge `919e76249c110f92679be1a048bd53b366d10e86`; final head `6107a510fa3c97c939e5876c7e0d3e4bdd677b7c` passed CI #1303, Final #614, Offline #658;
- PR #491 / issue #490 — duplicate-option and resolved output/input path hardening; merge `926af2c0663717cf1a3085d3ed49cf1c121f5670`; final head passed CI #1305, Final #616, Offline #660;
- PR #493 / issue #492 — shared symlink/hardlink filesystem-alias protection for intake outputs; merge `d8d8ef2762dbe9aeae0da4bbcab3b46aae93535c`; final head `4f03472868e0bd6b9a350d0f4a88240cfba5a05a` passed CI #1307, Final #618, Offline #662 on Ubuntu/Windows/macOS;
- PR #497 / issue #496 — stable opened-file snapshots, bounded small packets and atomic report output for environment/proof/proof-chain intakes; merge `0636cc478a9c4db8674710a49168c085c7436796`; final head `475a24ddcb4c12359b71b701e8b5654d1fe025ab` passed CI #1317, Final #628, Offline #672;
- PR #499 / issue #498 — allocation-light lexical `templateJson` depth preflight; merge `9c5d7b6c49a9133f2cd42bda853ab4c4602788f0`; final head `918b2968069503f5f049ef3fc9276a3911aeaa49` passed CI #1319, Final #630, Offline #674;
- PR #501 / issue #500 — removed the retired parse-based embedded depth helper/test path; merge `351f6c9fa2c33b46e328db7bdce2980b3290a145`; final head `c8537d324c1029ade785354ba796d087ab38da70` passed CI #1321, Final #632, Offline #676;
- PR #503 / issue #502 — migrated the remaining package-supported import/reference-closure operator surfaces to stable snapshots and atomic report commit; merge `b40f2deaf986cb362f054ed226f718d3abf1bbd8`;
- PR #505 / issue #504 — exact consumed-content SHA-256 snapshot binding plus streaming commit-time digest recheck; final head `f6431c95455d8d12ab78b3d67b83e701a86a27ad` passed CI #1329, Final #640, Offline #684 on Ubuntu/macOS/Windows; merge `ebf8e81b20fe7f919009d48b465b007b4e668cf1`;
- PR #507 / issue #506 — raw-byte hashing plus fatal strict UTF-8 decoding before JSON parsing; final head `84cd08455aa7480bcf8875ea24d5b8474ee99063` passed CI #1333, Final #644, Offline #688 on Ubuntu/macOS/Windows; merge `048184222ed289abf3b399e21b3f97e31b3c12e7`;
- PR #509 / issue #508 — retained P15 report fingerprints reuse exact raw-byte snapshot digests; final head `3196b227e6a026b4e26e05d57cf4ec797429b105` passed CI #1337, Final #648, Offline #692 on Ubuntu/macOS/Windows; merge `5c2c31097fcaeb43c9ee45176e6e185d176d6386`.

The stable-I/O evidence-integrity line does not change `acceptanceAuthority=false`, `targetCompatibilityClaim=false`, `productionAcceptance=false` or `internalReviewRequired=true`. PR #518 subsequently retained one exact controlled target proof without converting that observation into broad target authority.

## P15 proof/evidence harness behavior for this release line

- `elementor-target-proof-chain-v1` validates exact candidate + declared TargetProfile + observed environment + observed proof together;
- existing candidate and TargetProfile replay protection remains authoritative;
- environment must be structurally valid and the clean-Core full-pass path requires `QUALIFIED_FOR_BOUND_TARGET_PROOF`;
- proof-observed WordPress and Elementor versions must exactly match environment evidence;
- environment and proof must retain the same durable operator evidence/run reference;
- proof observation time cannot precede environment observation time;
- combined classifications are `CHAIN_FULL_PASS`, `CHAIN_PARTIAL`, `CHAIN_FAIL`, `CHAIN_BLOCKED`, `REJECTED`;
- sanitized `p15:elementor-target-proof-chain-intake` fingerprints candidate/profile/environment/proof inputs without emitting template contents;
- duplicate supported CLI options fail closed across the migrated P15 operator intake surfaces;
- `--out` may not alias consumed inputs by resolved path, symlink/realpath or hardlink filesystem identity where available;
- environment/profile/proof/import-receipt/reference-profile/reference-receipt operator packets have a 1 MiB raw-input ceiling plus bounded parsed JSON depth/value traversal;
- candidate input deliberately has no arbitrary low byte ceiling because the accepted generator envelope can legitimately be much larger; candidate outer JSON and embedded `templateJson` use the accepted bounded preflights before identity canonicalization;
- raw reference-closure template inputs use stable opened-file snapshots without a newly invented generic byte/depth/value ceiling because target-owned Elementor v0.4 settings remain structurally open;
- environment/proof/proof-chain and package-supported import/reference-closure operator commands read through stable opened-file snapshots and recheck consumed inputs before commit;
- migrated JSON inputs are read as raw bytes, exact SHA-256 is computed over those bytes, and decoding uses fatal strict UTF-8 semantics before JSON parsing so malformed UTF-8 fails closed rather than being normalized through replacement characters;
- each migrated input snapshot retains the SHA-256 of the exact bytes consumed at read time, and the final report-commit boundary stream-hashes the currently opened file to reject content drift even when path/filesystem metadata still matches;
- #593 aligns P15 with the newer P16 pathname boundary: operator JSON inputs must remain regular non-symlink path entries through read and pre-commit revalidation, so symlink aliases fail closed rather than being followed;
- migrated P15 report `inputs.*Sha256` fields reuse those immutable exact raw-byte snapshot digests rather than re-hashing decoded `.raw` strings, so retained report fingerprints remain identical to file-byte fingerprints even across valid decoder representation edges such as a UTF-8 BOM;
- raw reference-template digest rechecks are streaming and do not allocate a second complete in-memory copy or introduce a new generic byte limit;
- migrated reports are committed via exclusive restrictive-permission temporary payload + rename, with output parent/destination/input snapshots rechecked immediately before commit and owned temporary artifacts cleaned on failure;
- `p15:elementor-first-proof-vector` deterministically rebuilds the dedicated first-proof neutral IR through the accepted production generator, retains exact candidate identity/TargetProfile fingerprint/file hashes, writes a staged vector only when the destination is absent, and otherwise requires exact byte-for-byte verification without overwriting drift;
- the first-proof vector remains entirely unobserved/non-authorizing: `importValidationStatus=NOT_RUN`, target/import/editor/render observations false, acceptance/compatibility/production authority false and internal review required;
- repository code and CI never synthesize environment/import/editor/render observations.

`CHAIN_FULL_PASS` is evidence-chain consistency only. It never grants compatibility, production acceptance or target authority.

## Next P15 development action — retained-reference alignment and bounded coverage

#483 is complete. PR #518 retained the first exact clean-Core proof on WordPress `6.8` + Elementor `4.2.4`: import/editor/render PASS, bounded structure/solid-background/uniform-radius fidelity PASS, and qualified/full/full environment/proof/chain classifications. That result remains non-production-authorizing.

PR #546 / #545 completed the exact declared-profile registry, PR #548 / #547 completed exact retained-candidate binding, PR #552 / #551 added source-bound image-reference resolution, PR #554 / #553 added explicit Heading/Button semantic promotion, PR #556 / #555 added tablet/mobile direction, PR #558 / #557 linked-px gap, PR #560 / #559 flex align/justify, PR #562 / #561 px padding, PR #564 / #563 added one controlled URL-only Image → target-managed media observation, PR #566 / #565 bound only its exact full-pass evidence into sanitized observed asset-reference evidence, PR #568 / #567 added canonical controlled-PNG versus imported-original-file byte-integrity evidence, PR #570 / #569 added the sanitized exact-bound `READY_FOR_INTERNAL_REVIEW` prerequisite, PR #572 / #571 added exact controlled Target-A export → fresh Target-B re-import/render portability, PR #574 / #573 added the exact operator-supplied APPROVE / REJECT / DEFER decision contract without generating a retained decision itself, PR #576 / #575 added exact source/candidate-bound tablet/mobile container wrap overrides, PR #578 / #577 added exact wrap-conditioned tablet/mobile align-content on the wrapped-candidate identity only, PR #582 / #581 added exact source/candidate-bound uniform integer-px tablet/mobile container border-radius overrides, PR #586 / #585 added exact Heading/Text-only tablet/mobile alignment overrides, PR #588 / #587 corrected Button desktop alignment into the exact Elementor target vocabulary, PR #590 / #589 added explicit exact-bound default tablet/mobile Button alignment using that vocabulary, PR #592 / #591 added security-bounded exact-bound Container margin, PR #596 / #595 added security-bounded exact-bound Container min-height, PR #598 / #597 added condition-bound exact-bound Container boxed width, and issue #599 completed security-bounded exact-bound Container z-index for default tablet/mobile only.

1. keep semantic resolution explicit: never infer Heading/Button from layer names, font size, typography, components or visual style;
2. keep responsive decisions explicit and exact-bound: #556 writes only direction, #558 linked-px gap, #560 verified container flex align/justify, #562 px padding, #576 `nowrap`/`wrap`, #578 `align_content` only after exact same-breakpoint `wrap`, #582 uniform integer-px `border_radius`, and #586 Heading/Text `align`; #588 corrects Button desktop target vocabulary; #590 adds only explicit Button `align_tablet` / `align_mobile` values from `left|center|right|justify`; #592 adds only explicit Container `margin_tablet` / `margin_mobile` DIMENSIONS from finite non-negative px values; #596/#595 adds only explicit integer-px `min_height_tablet` / `min_height_mobile` Slider values in `0..1440`; #598/#597 adds only condition-bound integer-px `boxed_width_tablet` / `boxed_width_mobile` in `500..1600`, accepting only Elementor's exact boxed content-width state; #599 adds only explicit integer `z_index_tablet` / `z_index_mobile` in repo-bounded `0..9999`, rejecting strings/CSS/fractional/negative/non-finite/out-of-range values; #659 is merged and adds only explicit `content_width=full` plus integer-px `width_tablet` / `width_mobile` in `500..1600`; #663 separately adds only explicit uniform-px `border_radius_hover_tablet` / `border_radius_hover_mobile`, with no desktop hover-radius write or responsive inference; desktop values remain preserved/untouched and omitted responsive controls remain omitted;
3. keep shared source→generated-container structural binding plus source IR/base-candidate identity fail closed so stale or drifted generator/source state cannot replay responsive decisions;
4. keep ordinary image URL resolution as preparation rather than closure: no upload/network/target attachment-ID invention and ordinary asset-reference status remains `NOT_VERIFIED`;
5. treat #564 only as one exact controlled localhost URL-only → target-managed media rewrite observation; do not generalize it to arbitrary external hosts, media-library upload, attachment-ID portability or user-target asset closure;
6. after #574, keep the decision contract separate from a real retained operator decision: never let CI synthesize APPROVE; an explicit exact APPROVE may close only the bounded asset-reference scope, while global closure, arbitrary-host/general media portability, attachment-ID portability, compatibility/production/generation/download authority remain separate;
7. preserve `environmentObserved=false` for user-declared preview state, `targetCompatibilityClaim=false`, `productionAcceptance=false`, generation/download authority false, `assetReferenceClosureClaim=false` and internal review required.

Do not broaden semantics, responsive behavior or asset portability through heuristics merely to increase coverage. #556/#558/#560/#562/#576/#578/#582/#586 are bounded responsive slices and #564 is one bounded URL-only → target-managed media rewrite observation, #566 is only its sanitized observed-evidence binding, #568 proves only exact imported-file byte integrity, #570 only makes those exact prerequisites review-ready, #572 proves only one exact controlled cross-target re-import path, and #574 only defines the exact decision-record contract. A real retained operator decision remains separate/manual evidence and must not be fabricated. While it is unsupplied, any next code-side P15 work must remain another independently evidenced bounded responsive or target-matrix slice; #586 adds only exact Heading/Text default-breakpoint alignment, #590 separately adds exact Button default-breakpoint alignment, #592 adds only bounded px Container margin, #596 adds bounded px Container min-height, #598 adds exact-condition bounded px Container boxed width, #599 adds bounded integer Container z-index and #659 adds explicit full-width tablet/mobile px width; none introduces custom breakpoints or responsive closure, and arbitrary-host/general media portability remains separately unclaimed.


## Post-#662 handoff and active #663 slice

PR #662 exact head `f4d188ef9b056afeb50a82322ca62114be869f74` passed the complete required gate set and merged as main `143808f4e60b1d0a10ed8b148b4cc24bd6633a6e`; Issue #661 is completed.

Issue #717 / PR #718 and #719 / PR #720 remain closed completed. Terminal #721 / PR #722 is also closed completed after repaired 7/7 exact-head gates. Issue #723 / PR #724 now owns literal Button font family plus desktop px font size, line height, letter spacing and word spacing. Verify only its final bound exact head before starting another product batch.

## P16 bounded retention evidence-integrity boundary

The concrete shared blocker represented by #510 is limited to the already-bounded P16 retention operator surfaces. Those inputs retain the accepted 1 MiB / 64-level / 50,000-value policy, are consumed as raw bytes, retain exact SHA-256, reject malformed UTF-8 before JSON parsing, and are stream-rehashed through a stable opened-file identity immediately before atomic report commit. Same-size byte drift fails closed even if filesystem metadata still appears unchanged.

Writer failure cleanup may remove only its own still-matching temporary payload; replaced or non-owned temporary content remains untouched. This hardening does not change P16's `TARGET VALIDATION UNWIRED` state or grant native-serialization/import/editor/render/compatibility/production authority.

`p16:native-serialization-intake` remains explicitly outside that bounded reader until a document-size/resource policy is accepted. Do not silently impose the retention reader's 1 MiB ceiling on the Gutenberg source document merely to unify implementation paths.

## Parallel operator/runtime evidence

When the required real environment/operator is available, these can proceed independently:

- #483 is retained/completed; future P15 target observations must be opened only for concrete new coverage claims;
- #159 — genuine Figma Desktop P13 runtime/parity evidence + separate internal review;
- #84/#182 — remaining P12 package/publisher/account/2FA/final-exit evidence.

Do not fabricate any of these from CI/repository metadata.

## AI-native speed rules

- one acceptance objective -> one focused release train;
- parallelize only across non-overlapping ownership;
- isolate new controllers/adapters where practical instead of repeatedly editing shared hotspots;
- focused verification during iteration;
- full exact-head gates at merge;
- one canonical status sync per behavior-changing train;
- no synthetic overall percentage;
- no synthetic runtime/target/external evidence.

- PR #816 exact head `14ae0c87b00776060ae3a05c83a8388c51da4e30` passed all seven required gates with zero unresolved review threads and merged as main `bdebce3e0efcf06d4c7596e2572e5611e254c267`; Issue #815 is complete. Issue #817 / branch `ai-native/finalize-pr-816-state-817` owns canonical post-merge state finalization. After that PR merges, refresh the P15 capability map from current source evidence before opening the next bounded product batch.


## Current continuation after PR #823

PR #823 exact head a89bee55c3d43a0f40b2c97701c4a473ef9cce6b passed all seven required workflows, had zero unresolved review threads, and merged under expected-head guard as main b34f5b254dfe7bf8f217d691ecf8d58652674428; Issue #823 is complete. Issue #824 owns canonical state reconciliation. All P12/P27/operator/admin and P15 broad compatibility, production, release and download boundaries remain unchanged.


## Current continuation after PR #835

Exact main before state transport: `12758d9d19b634948adc07aa798b4593734abe2c`. PRs #824–#829, #830, #832 and #835 are merged; #831/#833/#834 closed unmerged as superseded. There is no canonical active product Issue or PR. Inspect existing P15 template/asset evidence for a representative real demo spacing and image import gap, then scope a bounded fix with source and target proof. Do not infer broad compatibility or P12/P27 authority. #287/#159/#84/#182 remain as before.


## Active P15 #838 / PR #839

Verify the bounded transient Image MEDIA diagnostic on the exact PR head. The representative external handoff has 44/45 unique temporary Figma URLs and no permanent media/browser render certification. After green gates and guarded merge, investigate full ZIP media references and selected visual spacing with genuine target screenshots; do not call this Image-widget-only check complete demo import parity.


## Active P15 #840 Container background MEDIA review

PR #839 merged as `f6bbbd7db3d9220e8ade26cc59443fd1184f9f55` after seven exact-head gates. The representative Template 2 ZIP includes two temporary Figma background refs in addition to 43 Image widget refs. Issue #840 binds review to documented Elementor Container normal background MEDIA controls and preserves false closure/compatibility/download/production authority. Verify its final PR head before guarded merge; actual Package 13/14 media bytes, target uploads and render comparison remain external prerequisites.


## P15 #840 merged and README reconciliation

PR #841 exact head `449ffa6e9c1aa533a425d595e358e0a43eb3f2cd` passed seven required workflows, zero threads and guarded merged as `d1fc115b9f6764d90c0c319b880e291009eb7199`; #840 closed. Terminal #842/#843 synchronizes README and compact state; it does not change product authority. P17 static foundation was already in progress. Package 13/14 still need genuine source image bytes, target-managed WordPress media and browser spacing/image-load comparison.


## Active README clarity #844 / PR #845

PR #843 passed all seven exact-head gates and merged as `2ca818d500474182a3e04eacdd477df4761a1269`; #842 closed. The README readability batch moves detailed historical chronology into a linked archive and puts P15/P16/P17 progress and missing evidence at the top. Verify the final PR #845 head before guarded merge. Demo asset bytes, WordPress media mapping and visual spacing parity are still pending; no phase completion/production authority is implied.


## Pre-P19 evidence order and authorization

The user authorized routine in-scope implementation and guarded green merges through the P15–P18 program without repeated confirmation before P19. Issue #846 and `docs/PRE_P19_EVIDENCE_EXIT.md` define separate real exits; this does not supply missing Package 13/14 asset bytes, Gutenberg authentication, visual parity, framework build/render results, production deployment or publishing evidence. Work through safe independent slices, record unavailable proof as pending and do not start P19.


## P18 runtime proof reconciliation

The #858 receipt is evidence for generated React output installing, building and rendering on loopback in policy-supported Chrome with DOM/source-ref/request/error/screenshot observations. It is intentionally not a visual parity, Web-to-Figma, Elementor target or production acceptance result. Keep P19 frozen until the separate P15–P18 exit document is satisfied.


## ANPOS adoption continuation after #871

The bounded child-adoption foundation is implemented on the current release train. Validate `npm run anpos:validate` and the Integration Readiness check at the exact PR head. After merge, keep the matrix as the authority for selecting any further ANPOS requirement slice. Do not copy `commercial-service/` or activate PM/AI identity/consent/lease/repository-admin capabilities without a dedicated implementation, authorization and evidence contract. Existing P15–P18 and pre-P19 gates remain unchanged.


## ANPOS policy-contract continuation

After the policy-contract slice merges, use the adoption matrix and traceability file to choose only applicable requirement work. Keep provider connections, privileged agent runtime, leases/consent/CAS, repository-admin enforcement and commercial service inactive until independently authorized and evidenced.


## 2026-09-29 evidence-register sync

- Consolidated evidence index: `docs/P15_P18_EVIDENCE_REGISTER_2026-09-29.md`.
- Machine-readable register: `config/evidence/p15-p18-register.json`; ANPOS validator enforces ordered P15–P18 coverage, `authority:false`, `PRE_P19_OPEN` and four P19 unlock conditions.
- P15 runtime binding is fail-closed and emits `RUNTIME_REVIEW_REQUIRED` for missing/unreadable import, frontend or responsive receipts.
- P16 reproducible intake uses `--document`, `--profile`, `--receipt`, `--out`; missing input exits 2.
- P17 controlled browser proof requires explicit Chrome path and retained git/run identity; local render remains separate from visual parity.
- P19 remains frozen until P15 source/media/import evidence, P16 authenticated Gutenberg evidence, P17 genuine source comparison and P18 framework-specific evidence are retained.
