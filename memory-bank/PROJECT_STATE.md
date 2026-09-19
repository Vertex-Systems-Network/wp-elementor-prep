# Project State

Last updated: 2026-09-19

## Product direction

WP Builders Prepare is a deterministic Figma audit/safe-prep platform evolving toward validated multi-target build output while preserving offline/fail-closed authority boundaries.

`config/runtime-artifacts.json` is runtime artifact registry schema v3 and remains the machine-readable runtime artifact authority.

## P15 implementation provenance

Accepted implementation baseline immediately preceding the stable operator-I/O hardening line:

`d8d8ef2762dbe9aeae0da4bbcab3b46aae93535c`

Recent accepted P15 sequence:

- PR #478 — fresh locally validated Elementor Template JSON download; merge `e03b7f3233b51d7c3f9f81a0dcd0a21db26cfc20`;
- PR #480 — bounded deterministic container solid-background + uniform-radius fidelity; merge `f568ec2236a1a0c7102a656368a7632ec8f581dd`;
- PR #482 — exact-bound external Elementor target-proof evidence contract/intake; final head `500ce695d2392128dfd53d9d181dcf392ca64a57` passed CI #1281, Final #592 and Offline #636; merge `04c3710cab693c232e512e53de21b20f6f496555`;
- PR #485 — canonical post-#482 state sync; merge `623b09277bc90d52b324468b0429e01671ac8520`;
- PR #487 — observed target-environment qualification contract/intake; final head `d74b948401dbf4e4f15116cc9a57c8d8cabf7c18` passed CI #1294, Final #605 and Offline #649 on Ubuntu/Windows/macOS; merge `dd281b8bea7670e252629e931129a5276d08bef3`; issue #486 completed;
- PR #489 — exact candidate/profile/environment/proof chain binding; final head `6107a510fa3c97c939e5876c7e0d3e4bdd677b7c` passed CI #1303, Final #614 and Offline #658 on Ubuntu/macOS/Windows; merge `919e76249c110f92679be1a048bd53b366d10e86`; issue #488 completed;
- PR #491 — evidence-intake duplicate-option and resolved output/input path hardening; final head `d820f2a8babfaa719b26ad39dd15e2165cb6a857` passed CI #1305, Final #616 and Offline #660 on Ubuntu/macOS/Windows; merge `926af2c0663717cf1a3085d3ed49cf1c121f5670`; issue #490 completed;
- PR #493 — shared filesystem-identity guard rejecting symlink/hardlink output aliases; final head `4f03472868e0bd6b9a350d0f4a88240cfba5a05a` passed CI #1307, Final #618 and Offline #662 on Ubuntu/Windows/macOS; merge `d8d8ef2762dbe9aeae0da4bbcab3b46aae93535c`; issue #492 completed;
- PR #497 — stable opened-file snapshots, bounded small evidence packets and atomic TOCTOU-safe output for environment/proof/proof-chain intakes; final head `475a24ddcb4c12359b71b701e8b5654d1fe025ab` passed CI #1317, Final #628 and Offline #672 on Ubuntu/macOS/Windows; merge `0636cc478a9c4db8674710a49168c085c7436796`; issue #496 completed;
- PR #499 — allocation-light lexical embedded `templateJson` depth preflight; final head `918b2968069503f5f049ef3fc9276a3911aeaa49` passed CI #1319, Final #630 and Offline #674 on Ubuntu/macOS/Windows; merge `9c5d7b6c49a9133f2cd42bda853ab4c4602788f0`; issue #498 completed;
- PR #501 — retired the obsolete parse-based embedded `templateJson` depth helper/test path so the lexical scanner remains the sole embedded preflight; final head `c8537d324c1029ade785354ba796d087ab38da70` passed CI #1321, Final #632 and Offline #676 on Ubuntu/macOS/Windows; merge `351f6c9fa2c33b46e328db7bdce2980b3290a145`; issue #500 completed;
- PR #503 — migrated the remaining package-supported import/reference-closure operator surfaces to stable snapshots and atomic report commit; merge `b40f2deaf986cb362f054ed226f718d3abf1bbd8`; issue #502 completed;
- PR #505 — exact consumed-content SHA-256 snapshot binding plus streaming commit-time digest recheck; final head `f6431c95455d8d12ab78b3d67b83e701a86a27ad` passed CI #1329, Final #640 and Offline #684 on Ubuntu/macOS/Windows; merge `ebf8e81b20fe7f919009d48b465b007b4e668cf1`; issue #504 completed;
- PR #507 — exact raw-byte hashing plus fatal strict UTF-8 decode before JSON parsing; final head `84cd08455aa7480bcf8875ea24d5b8474ee99063` passed CI #1333, Final #644 and Offline #688 on Ubuntu/macOS/Windows; merge `048184222ed289abf3b399e21b3f97e31b3c12e7`; issue #506 completed;
- PR #509 — retained report input fingerprints reuse exact raw-byte snapshot digests instead of decoded-text rehashes; final head `3196b227e6a026b4e26e05d57cf4ec797429b105` passed CI #1337, Final #648 and Offline #692 on Ubuntu/macOS/Windows; merge `5c2c31097fcaeb43c9ee45176e6e185d176d6386`; issue #508 completed.
- PR #518 / issue #483 — first genuine controlled Elementor target proof; exact head `4f09efda101e5a2771df9bfc3ac8960a43655e96` passed CI, Integration Readiness, Final, Offline, CodeQL and P15 Real Elementor Target Proof run `35403469986`; retained artifact `10570709987` digest `sha256:206b703ab8185f1e5b1a83346074accb23cc458b9fdcb94f5eaad0c4752e33aa`; observed WordPress `6.8`, Elementor `4.2.4`, PHP `8.3.6`, MariaDB `11.4.13`, memory `256 MB`, Chrome `152.0.0.0`; import/editor/render and bounded structure/background/radius fidelity all PASS; merge `326494a3ee917de985a628cb0ecc7ebe91c1c8e5`; authority remained false.

Stable operator-I/O hardening builds on this provenance without changing P15 target authority. PR #518 is the first retained real WordPress/Elementor import/editor/render observation, but it is one exact bounded reference proof rather than a general compatibility, production or download authorization.

## Persistent dependencies

- #84 — P12 final integrated validation/release exit; retained at 80%;
- #119 — P13-P27 commercial/multi-target roadmap owner;
- #159 — genuine Figma Desktop P13 Build-Ready runtime/parity acceptance dependency;
- #182 — P27 final production-release/evidence gate;
- #287 — repository-admin branch protection/ruleset hardening residual;

## AI-native execution state

Repository development remains issue-first, PR-second, R0/R1-aware and exact-head gated.

- one acceptance objective per focused release train;
- tightly related implementation/tests/docs may stay in the same PR;
- focused verification during iteration;
- full CI / Final Release / Offline Acceptance mandatory on the exact merge head;
- no synthetic overall project percentage or fabricated runtime evidence.

## P12-P14 state

- P12 — **IN PROGRESS / 80%**. Historical publishing authority remains Final Release Artifact #20 from source `5f12b1d28146d5c2af815cc9f83eb30431dce4b5`, plugin ID `1680034649341961379`.
- P13 — **IMPLEMENTATION COMPLETE / RUNTIME ACCEPTANCE PENDING**, `100% impl`; #159 still requires genuine Figma Desktop evidence and separate internal review.
- P14 — **CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED**, `N/A`; `PRODUCTION_P14_SAFE_RECIPE_REGISTRY` remains empty and no production P14 mutation authority exists.

## P15 state

P15 remains **CORE FOUNDATION IN PROGRESS / CONTROLLED TARGET PROOF RETAINED** with `N/A` progress.

Accepted foundation now includes:

- target-neutral export IR;
- deterministic local Elementor v0.4 Container/Widget Template JSON generation;
- bounded selected-Figma-Frame extraction and fail-closed REVIEW semantics;
- sanitized Elementor preview and bounded declared TargetProfile alignment preview;
- compatibility/mapping-readiness categories;
- explicit fresh local Template JSON download with immediate candidate revalidation and sanitized receipt;
- bounded deterministic opaque single-solid background and uniform-radius extraction/serialization;
- `elementor-target-proof-evidence-v1` bound to exact candidate identity and immutable TargetProfile fingerprint;
- separate retention of actually observed WordPress/Elementor versions;
- import/editor-open/render/fidelity observations with prerequisite sequencing;
- proof classifications `BOUND_FULL_PASS`, `BOUND_PARTIAL`, `BOUND_FAIL`, `REJECTED`;
- sanitized `p15:elementor-target-proof-intake` with SHA-256 input fingerprints;
- `elementor-target-environment-evidence-v1` and policy `elementor-target-environment-policy-2026-09-16-v1`;
- environment classifications `QUALIFIED_FOR_BOUND_TARGET_PROOF`, `REVIEW_REQUIRED`, `NOT_QUALIFIED`, `REJECTED`;
- conservative runtime minimums and clean-Core review policy;
- sanitized `p15:elementor-target-environment-intake` with explicit `importObserved=false`, `editorObserved=false`, `renderObserved=false`;
- `elementor-target-proof-chain-v1` validating exact candidate + TargetProfile + environment evidence + proof evidence together;
- exact environment/proof WordPress+Elementor equality, durable evidence/run-reference equality, chronology validation and existing candidate/profile replay protection;
- combined classifications `CHAIN_FULL_PASS`, `CHAIN_PARTIAL`, `CHAIN_FAIL`, `CHAIN_BLOCKED`, `REJECTED`;
- sanitized `p15:elementor-target-proof-chain-intake` with candidate/profile/environment/proof SHA-256 fingerprints and no template-content leakage;
- duplicate CLI options rejected rather than silently last-write-wins across the migrated P15 operator intake surfaces;
- resolved `--out` paths rejected when they collide with consumed input paths;
- shared local/offline filesystem-identity protection using canonical real paths and `dev + ino` identity where available so existing symlink/hardlink output aliases cannot overwrite retained evidence inputs;
- stable opened-file snapshots with identity/metadata verification across reads and recheck before report commit for environment/proof/proof-chain plus the package-supported import/reference-closure operator surfaces;
- migrated JSON inputs are read as raw bytes, exact SHA-256 is computed over those bytes, and decoding uses fatal strict UTF-8 semantics before JSON parsing so malformed UTF-8 fails closed rather than being normalized through replacement characters;
- every migrated operator input snapshot is additionally bound to the exact SHA-256 of the consumed bytes, with a streaming opened-file digest recheck at the final report-commit boundary so byte drift fails closed even when path/filesystem metadata still appears unchanged;
- migrated P15 report `inputs.*Sha256` fields use those immutable exact raw-byte snapshot digests rather than recomputing hashes from decoded text, preserving file-byte fingerprint identity across valid UTF-8 decoder edges such as BOM handling;
- the digest recheck does not load deliberately unbounded raw reference-template inputs into memory a second time and does not introduce a new generic candidate/template byte ceiling;
- a 1 MiB raw-input ceiling plus bounded JSON depth/value traversal for intrinsically small TargetProfile/environment/proof/import-receipt/reference-profile/reference-receipt packets;
- no arbitrary low candidate byte ceiling: candidate outer JSON and embedded `templateJson` instead receive the accepted bounded nesting preflights while the existing 10,000-element/64-level target contract remains authoritative;
- raw reference-closure template inputs use stable opened-file snapshots without a newly invented generic byte/depth/value ceiling because the accepted Elementor v0.4 settings contract remains target-owned and structurally open;
- atomic report output through an exclusive restrictive-permission temporary payload plus rename, with output-parent/destination/input snapshots rechecked before commit and owned temporary artifacts cleaned on failure across the migrated P15 operator report surfaces;
- a reproducible non-authorizing first-proof operator vector generated only through the accepted neutral-IR -> production Elementor v3 generator path, retaining exact candidate identity, immutable declared TargetProfile fingerprint, exact file SHA-256 values and a byte-for-byte drift check while keeping all target/runtime observations false and `importValidationStatus=NOT_RUN`.
- one retained clean-Core controlled reference proof on exact WordPress `6.8` + Elementor `4.2.4` Container/Template JSON data `0.4`, with `QUALIFIED_FOR_BOUND_TARGET_PROOF` + `BOUND_FULL_PASS` + `CHAIN_FULL_PASS`, import/editor/render PASS and bounded structure/solid-background/uniform-radius fidelity PASS; this reference excludes Atomic-v4, Elementor Pro, third-party addons, responsive mapping, media-asset closure and general version compatibility.

User-facing local-download truth remains exactly bounded to:

- **LOCAL ARTIFACT VALIDATED**;
- **TARGET IMPORT NOT VERIFIED**.

Authority remains:

- `acceptanceAuthority=false` for environment qualification, proof intake and proof-chain intake;
- `targetCompatibilityClaim=false`;
- `productionAcceptance=false`;
- local generation/download keeps `importValidationStatus=NOT_RUN`, `targetEnvironmentValidationStatus=NOT_RUN`, `environmentObserved=false`;
- qualification and chain validation are evidence integrity only, not import/render verification;
- `internalReviewRequired=true` for external environment/proof evidence;
- no WordPress/Elementor network connection from the Figma core;
- no automated target import/editor/render execution claim;
- no Atomic-v4 acceptance from the Container proof path;
- no clipboard/section transfer;
- no Figma mutation.

The retained #483 proof establishes only one exact clean-Core reference observation. It does not make arbitrary locally generated candidates imported, does not observe a user's declared environment and does not change `acceptanceAuthority=false`, `targetCompatibilityClaim=false`, `productionAcceptance=false` or `internalReviewRequired=true`.

PR #546 / #545 binds declared TargetProfiles to that retained reference by exact immutable TargetProfile fingerprint. PR #548 / #547 extends the same registry to the exact retained candidate identity `sha256:96ffe8a19b0c4d05eccd1e3d28d8b453f41464450ebd6c3f69decc1ab2543f26`. `EXACT_REFERENCE_CANDIDATE_MATCH` means only that the current canonical candidate is byte-identical under the existing candidate-identity contract to the candidate observed in #483; `REFERENCE_CANDIDATE_MISMATCH` means only that it is a different candidate and is not an incompatibility verdict. PR #552 / #551 adds an exact neutral-IR-fingerprint-bound URL-only resolution contract for `IMAGE_ASSET_EXPORT_REQUIRED` review nodes. It can produce native neutral image nodes for the existing generator but performs no network/upload work, invents no target attachment IDs, and deliberately leaves downstream asset-reference closure `NOT_VERIFIED`. PR #554 / #553 adds a shared canonical neutral-IR identity and an explicit text-semantic manifest that can promote exact neutral text source IDs to Heading/Button nodes without layer-name/font/style inference; unlisted text remains text, source copy is unchanged and justified promotion fails closed. PR #556 / #555 adds an exact neutral-IR + base-candidate-bound responsive direction manifest for existing containers, preserving desktop direction and writing only explicit Elementor `4.2.4` default-breakpoint tablet/mobile direction keys. PR #558 / #557 reuses a shared source→generated-container binding contract and adds exact linked-px tablet/mobile gap overrides while preserving desktop `flex_gap`; Elementor `4.2.4` source/tests retain the exact GAPS evidence. PR #560 / #559 adds exact default tablet/mobile flex alignment overrides for the verified `flex_align_items_*` / `flex_justify_content_*` keys, preserving desktop alignment and omitting any unspecified control/breakpoint instead of synthesizing inheritance. PR #562 / #561 adds exact default tablet/mobile px padding overrides using Elementor DIMENSIONS shape, preserving desktop padding, rejecting malformed side sets and deriving `isLinked` deterministically. These are bounded responsive preparation slices, not responsive closure. Local/download UI truth remains non-authorizing.


## P16 state

P16 remains **CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED** with `N/A` progress.

The retained foundation includes normalized Gutenberg candidate/capability/profile contracts, exact candidate identity, external receipt/offline revalidation, sanitized review/decision prerequisites, genuine-evidence retention requirements, offline operator export/current-manifest validation and hardened bounded local JSON I/O/output handling.

For the existing bounded P16 retention operator surfaces, JSON inputs keep the accepted 1 MiB / 64-level / 50,000-value policy, are read as raw bytes, retain exact SHA-256 snapshots, decode with fatal strict UTF-8 semantics, and are stream-rehashed through a stable opened-file identity immediately before atomic report commit. Same-size byte drift therefore fails closed even when path/filesystem metadata still appears unchanged. Failure cleanup removes only a writer-owned payload whose retained snapshot still matches; non-owned or replaced temporary content is preserved rather than recursively deleted.

`p16:native-serialization-intake` remains on its separate direct read/write path. Do not route its Gutenberg source document through the bounded retention reader until an explicit document-size/resource policy is accepted; doing so today would silently introduce the retention reader's 1 MiB ceiling.

These reliability controls do not validate Gutenberg target import/editor/render behavior and do not grant native-serialization, compatibility, production, generation or download authority.

During the focused Elementor V1 window, keep P16 stable unless a concrete shared blocker appears.

## P17-P27 state

- P17-P26 — **PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED**;
- P27 — **GATE DEFINED / EXECUTION DEFERRED** under #182.

Do not open future phases merely to increase parallelism while the bounded Elementor-first V1 is unfinished.

## Immediate execution target

Continue the coherent Elementor-first internal V1 from the retained controlled proof:

`selected Figma Frame -> deterministic extraction -> exact source-bound semantic/image-reference resolution where supplied -> exact bounded responsive direction/gap/alignment/padding overrides where supplied -> mapping readiness -> fresh candidate -> local artifact validation/download -> exact declared TargetProfile -> exact retained profile/candidate reference binding -> real reference/asset closure + remaining responsive work -> additional controlled target observations where evidence is required -> bounded handoff`

The retained WordPress `6.8` + Elementor `4.2.4` proof is a reference point, not broad version support. Keep P16 stable unless a concrete shared blocker appears, keep P17-P26 frozen during this Elementor V1 window, and preserve false compatibility/production/download authority until the applicable evidence and release gates explicitly change it.
