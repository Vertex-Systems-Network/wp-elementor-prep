# Project State

Last updated: 2026-09-21

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

## Security hardening

- #579 closes a repository-side audit train covering proof-token containment, controlled-loopback proof navigation, generic atomic output replacement and duplicate CLI option rejection.
- The P15 disposable target-proof token is not part of retained evidence: bridge payloads do not return token-bearing navigation URLs and retained proof artifacts/logs are sanitized and checked before upload.
- Generic CLI/script output replacement no longer unlinks an existing destination before same-directory rename.
- #287 remains the separate repository-admin branch/ruleset enforcement dependency; code-side controls do not substitute for repository settings.

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
- P14 — **IMPLEMENTATION COMPLETE / INTERNAL CONFIRMATION ACTIVATION / PRODUCTION ACCEPTANCE PENDING**, `100% impl`; R1-R6 are merged through PR #658 on main `64c8077eb37a728efa86a749a95e10f7bdce03c2`. The exact production planning registry binding is present; internal/dev execution requires explicit confirmation plus fresh authorization checks, publishable release activation is disabled/stripped, and `acceptanceAuthority=false` / `targetCompatibilityClaim=false` remain fixed.

## P17 state

P17 is **FOUNDATION IMPLEMENTATION IN PROGRESS / CONTROLLED LOCAL BROWSER PROOF**.

Accepted/active static-first foundation now includes deterministic static export, fail-closed import preflight, versioned neutral Web IR, neutral-IR → semantic HTML/CSS generation, exact R4 package validation and the R5 controlled local-only browser proof. R5 launches only after an exact `PACKAGE_VALIDATED` result, serves only generated HTML/CSS from an ephemeral `127.0.0.1` origin with restrictive CSP, denies requests outside the exact document/stylesheet allowlist, and retains only sanitized browser/version/viewport/request/DOM/computed-style metadata plus screenshot SHA-256 and exact GitHub run binding.

R5 remains non-authorizing: `visualFidelityStatus=NOT_RUN`, reconstruction remains `NOT_RUN`, JavaScript execution and external browser networking remain disabled, and production acceptance stays false.

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
- one retained clean-Core controlled reference proof on exact WordPress `6.8` + Elementor `4.2.4` Container/Template JSON data `0.4`, with `QUALIFIED_FOR_BOUND_TARGET_PROOF` + `BOUND_FULL_PASS` + `CHAIN_FULL_PASS`, import/editor/render PASS and bounded structure/solid-background/uniform-radius fidelity PASS; this reference excludes Atomic-v4, Elementor Pro, third-party addons, responsive closure, general media-asset closure and general version compatibility.
- PR #564 / #563 adds a separate deterministic URL-only Image asset vector and dedicated asset-proof evidence contract. The same controlled WP/Elementor workflow must import that exact candidate, bind its exact reference-review identity, prove the Elementor-managed attachment retains exact source provenance, match the rendered URL fingerprint to the rewritten target-managed MEDIA URL fingerprint and observe positive browser image dimensions before `ASSET_BOUND_FULL_PASS`; `assetReferenceClosureClaim=false` remains mandatory.
- PR #566 / #565 adds a separate observed asset-reference bridge that accepts only exact `ASSET_BOUND_FULL_PASS` evidence for an asset-only `EXTERNAL_CLOSURE_REQUIRED` identity. It binds the current reference-review digest, candidate identity and TargetProfile, retains only proof/evidence-reference SHA-256 values plus sanitized URL fingerprints, and reports `OBSERVED_PROOF_VALIDATED` while keeping `internalDecisionStatus=NOT_RUN`, `authenticationAuthority=false` and `referenceClosureClaim=false`.
- PR #568 / #567 adds a separate target-managed media content-integrity proof layer. The source digest must equal canonical controlled PNG SHA-256 `sha256:65cbaae5caf987301a644dbad6b783476a2e39b2980425a0c57a6505a1c7e5a8`, the imported WordPress attachment original-file digest must equal that same value, and wrong-but-equal non-canonical digests are rejected. Attachment post type, `image/png` MIME and positive dimensions are also required for `TARGET_MANAGED_CONTENT_INTEGRITY_PASS`; `referenceClosureClaim=false`, no file path/numeric attachment ID, and no portability authority are retained.
- PR #570 / #569 adds a separate target-managed media internal-review prerequisite. It recomputes the exact #566 observed-reference path and validates #568 content integrity from the same raw candidate/profile/proof/integrity inputs, then cross-binds candidate/profile/reference/target/evidence-reference state before `READY_FOR_INTERNAL_REVIEW`. `internalDecisionStatus=NOT_RUN` and all closure/compatibility/production/generation/download authority remain false.
- PR #572 / #571 adds one controlled cross-target managed-media portability evidence path after that prerequisite. The exact review-ready Target-A template is exported through Elementor `4.2.4`'s real local-template export, SHA-256 bound, and re-imported into a fresh second WordPress `6.8` + Elementor `4.2.4` target with a distinct database/site URL through the real local-template import path. Full pass requires Target-A source-provenance binding, a distinct Target-B-local managed-media URL fingerprint, the canonical controlled PNG digest on Target B, `image/png`, positive dimensions and a loaded render bound to Target B. The raw export remains temporary/non-artifact; retained reports omit raw Target-A URLs, filesystem paths and numeric attachment IDs. This exact portability evidence keeps `internalDecisionStatus=NOT_RUN`, closure/compatibility/production/generation/download authority false and does not generalize to arbitrary hosts or portable attachment IDs.
- PR #574 / #573 adds the separate exact-bound internal-decision record contract/intake. It recomputes #570 readiness, revalidates #572 full-pass portability and requires an explicit operator APPROVE / REJECT / DEFER record bound to candidate identity, TargetProfile, deterministic prerequisite digest, consumed portability-evidence SHA-256, exported-template SHA-256 and retained evidence-reference digest. Decision references are retained only as SHA-256. A synthetic APPROVE may exist only in tests; repository/CI/runtime does not synthesize a real approval. Therefore the retained proof state remains `internalDecisionStatus=NOT_RUN` until a separate operator record is actually supplied. An explicit exact APPROVE can authorize only the bounded asset-reference closure claim; global closure, arbitrary-host/general media portability, attachment-ID portability, target compatibility, production, generation and download authority remain false.
- PR #576 / #575 adds exact default-breakpoint container wrap overrides. The manifest remains bound to the canonical neutral source plus exact base-candidate identity; only explicit `tabletWrap` / `mobileWrap` values `nowrap` or `wrap` are accepted. Exact Elementor `4.2.4` source and QUnit fixture blob identities are retained as evidence for responsive `flex_wrap_tablet` / `flex_wrap_mobile` keys. Desktop `flex_wrap` is preserved, omitted breakpoints stay absent, and no inference, custom-breakpoint, `align_content`, closure, compatibility, production, generation/download, network or Figma-mutation authority is introduced.
- PR #582 / #581 adds exact default-breakpoint container border-radius overrides. Elementor `4.2.4` Container source blob `3486766b9565af99536ae205ed1936bb155daed0` registers responsive `border_radius`, and Controls Stack blob `00b280e518b89925c8f85a059b34136177ff3d4d` establishes non-desktop `<id>_<device>` naming. The manifest is exact-source + base-candidate bound, accepts only explicit uniform integer px tablet/mobile radius values, preserves desktop `border_radius`, and grants no responsive inference/closure, custom-breakpoint, compatibility, production, generation/download, network or Figma-mutation authority.
- PR #586 / #585 adds exact default-breakpoint Heading/Text alignment overrides. Elementor `4.2.4` Heading blob `5b193f958ba34d8d4a24d165a9114f9bc3ef2561` and Text Editor blob `72ff868493a3c0f27c6305794ffcff9cf217c9ea` register responsive `align`, with Controls Stack suffix contract `00b280e518b89925c8f85a059b34136177ff3d4d`. Exact source/base-candidate binding and widget-type/desktop-align revalidation precede writes; Heading allows `start|center|end`, Text additionally `justify`, and no responsive inference/closure or production authority is added.
- PR #588 / #587 corrects Button desktop alignment to exact Elementor `4.2.4` Button Trait target values from blob `31192aaee6851c445f79d1998499f6ce73ba7da5`: neutral `start|center|end` now emits target `left|center|right`. The deterministic generator advances to v3.
- PR #590 / #589 adds exact default-breakpoint Button alignment overrides on top of that corrected desktop candidate. The manifest is exact-source + base-candidate bound, accepts only explicit `left|center|right|justify`, writes only `align_tablet` / `align_mobile`, preserves desktop `align`, and grants no inference/custom-breakpoint/closure/compatibility/production/download authority.
- PR #592 / #591 adds security-bounded default-breakpoint Container margin overrides. Elementor `4.2.4` Container source blob `3486766b9565af99536ae205ed1936bb155daed0`, Controls Stack blob `00b280e518b89925c8f85a059b34136177ff3d4d`, and Dimensions blob `7de34809d407e5fa208935b77a6b6648c72d3c5d` anchor the contract. Only explicit finite non-negative px four-side values are accepted, only `margin_tablet` / `margin_mobile` are written, `isLinked` is derived, and negative/custom/CSS values fail closed.
- PR #596 / #595 adds security-bounded default-breakpoint Container min-height overrides. Exact Elementor `4.2.4` Container, Controls Stack, Slider and converter-fixture evidence binds `min_height_tablet` / `min_height_mobile`; only explicit integer px `0..1440` values are accepted, desktop min-height remains untouched, and vh/em/rem/custom/CSS/negative/fractional/non-finite values fail closed.
- PR #598 / #597 adds condition-bound default-breakpoint Container boxed-width overrides. Exact Elementor `4.2.4` Container source binds `boxed_width` to `content_width=boxed` with default `boxed` and px Slider range `500..1600`; Controls Stack, Slider and converter-fixture evidence lock `boxed_width_tablet` / `boxed_width_mobile`. The resolver accepts only integer px `500..1600`, preserves desktop content/boxed width, rejects any explicit non-boxed generated target condition and rejects non-px/custom/CSS/fractional/non-finite/out-of-range values.
- Issue #599 is completed with security-bounded default-breakpoint Container z-index overrides. Issue #659 is also completed: PR #660 merged exact Elementor 4.2.4 evidence for `content_width=full` plus bounded `width_tablet` / `width_mobile` px overrides (`500..1600`), exact source/candidate binding and no desktop-width write. Exact Elementor `4.2.4` Container source registers responsive `z_index` as NUMBER with minimum `0`; Controls Stack, Container Playwright and responsive-number fixture evidence anchor numeric value shape and tablet/mobile lineage. The resolver accepts only explicit integers `0..9999`, where `9999` is a repository safety cap; desktop `z_index` remains untouched and string/CSS/negative/fractional/non-finite/out-of-range values fail closed.

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

PR #546 / #545 binds declared TargetProfiles to that retained reference by exact immutable TargetProfile fingerprint. PR #548 / #547 extends the same registry to the exact retained candidate identity `sha256:96ffe8a19b0c4d05eccd1e3d28d8b453f41464450ebd6c3f69decc1ab2543f26`. `EXACT_REFERENCE_CANDIDATE_MATCH` means only that the current canonical candidate is byte-identical under the existing candidate-identity contract to the candidate observed in #483; `REFERENCE_CANDIDATE_MISMATCH` means only that it is a different candidate and is not an incompatibility verdict. PR #552 / #551 adds an exact neutral-IR-fingerprint-bound URL-only resolution contract for `IMAGE_ASSET_EXPORT_REQUIRED` review nodes. It can produce native neutral image nodes for the existing generator but performs no network/upload work, invents no target attachment IDs, and deliberately leaves downstream asset-reference closure `NOT_VERIFIED`. PR #554 / #553 adds a shared canonical neutral-IR identity and an explicit text-semantic manifest that can promote exact neutral text source IDs to Heading/Button nodes without layer-name/font/style inference; unlisted text remains text, source copy is unchanged and justified promotion fails closed. PR #556 / #555 adds an exact neutral-IR + base-candidate-bound responsive direction manifest for existing containers, preserving desktop direction and writing only explicit Elementor `4.2.4` default-breakpoint tablet/mobile direction keys. PR #558 / #557 reuses a shared source→generated-container binding contract and adds exact linked-px tablet/mobile gap overrides while preserving desktop `flex_gap`; Elementor `4.2.4` source/tests retain the exact GAPS evidence. PR #560 / #559 adds exact default tablet/mobile flex alignment overrides for the verified `flex_align_items_*` / `flex_justify_content_*` keys, preserving desktop alignment and omitting any unspecified control/breakpoint instead of synthesizing inheritance. PR #562 / #561 adds exact default tablet/mobile px padding overrides using Elementor DIMENSIONS shape, preserving desktop padding, rejecting malformed side sets and deriving `isLinked` deterministically. PR #564 / #563 adds one exact controlled URL-only Image asset observation bound to a separate production-generated candidate, declared profile and reference-review identity; it observes only the disposable localhost fixture plus Elementor's target-managed media rewrite/source-provenance behavior and grants no general URL portability, media-library portability or attachment-ID claim. PR #566 / #565 consumes only that exact full-pass evidence class to produce a sanitized observed asset-reference evidence artifact; it is evidence authentication for this bounded proof path, not a reference-closure decision. PR #568 / #567 then proves exact byte integrity for the one imported target-managed attachment under the same controlled proof, without converting the observed numeric attachment identity or filesystem location into a portable claim. PR #570 / #569 binds those exact observed + integrity prerequisites into `READY_FOR_INTERNAL_REVIEW` only; it does not execute the internal decision. PR #572 / #571 then adds exact controlled Target-A → fresh-Target-B managed-media portability evidence without converting the observed attachment identity into a portable numeric ID and without granting closure. PR #574 / #573 defines how a future explicit operator decision is exact-bound and sanitized; it does not fabricate that decision. PR #576 / #575 independently extends only the bounded default-breakpoint responsive mapping with explicit wrap keys. PR #578 / #577 composes exact `align_content` on top of that wrap result only when the same container/breakpoint is explicitly `wrap`, and binds the decision to the wrapped-candidate identity. PR #582 / #581 independently adds only explicit uniform integer-px `border_radius_tablet` / `border_radius_mobile` values while preserving desktop radius and exact source/base-candidate binding. PR #586 / #585 adds only explicit Heading/Text `align_tablet` / `align_mobile` values after exact widget binding, with `justify` restricted to Text. PR #588 / #587 separately fixes Button desktop target vocabulary, PR #590 / #589 adds only explicit exact-bound default tablet/mobile Button alignment settings, PR #592 / #591 adds only bounded finite non-negative px Container margin overrides, PR #596 / #595 adds bounded integer-px Container min-height, PR #598 / #597 adds condition-bound bounded integer-px Container boxed width, issue #599 adds bounded integer Container z-index, and #659 adds explicit full-width tablet/mobile px width; #663 adds bounded responsive hover border-radius only. These remain bounded preparation/evidence/decision-contract/responsive slices, not responsive closure, custom-breakpoint support, broad target compatibility or general asset closure. Local/download UI truth remains non-authorizing.


## Completed P15 Fast Batch #713 Button visual depth and radius

PR #712 final exact head `56607e9a5c42071167cd84aa9d82eefef74c4a3e` passed 7/7 and merged as main `012edb7f8403c18eb5bab8f41ac1fd2572e4be0e`; Issue #711 closed completed.

Issue #713 / PR #714 is closed completed. Repaired exact head `4e2cc76a309d99c8c37b73402bcd8f1f5050715d` passed all seven required gates with zero unresolved review threads and expected-head merge produced main `f25acc0e0f1d9dc1220c20856c2a1f3d20b71b3c`. The exact-bound composite Button resolver provides bounded normal text shadow, bounded normal box shadow and explicit desktop/tablet/mobile integer-px border radius. Padding, inference, compatibility, production and download authority remain false/out of scope.

Issue #715 / PR #716 is closed completed after repaired exact head `ac5e676867b6755382af598b9695852ed8689c2c` passed all seven required gates with zero unresolved review threads and expected-head merge produced main `d99695e8e1183f152a01a308251d2f02f086e67f`.

## Terminal post-PR #724 finalization #725

PR #724 exact head `ea3d844754273d6601e4e2bd925b718d31834bd2` passed all seven required gates with zero unresolved review threads and merged as main `c887ab4d1e39fe8ca0a2898580ba0757cedd5c90`. Canonical state is settled as `IDLE_READY_NEXT_P15_BATCH` with no active canonical Issue/PR. Issue #725 / PR #726 is transport-only state finalization; its eventual merge does not by itself require another reconciliation PR.

## Completed P15 Fast Batch #731 / PR #732 Button responsive padding

Issue #731 / PR #732 is closed completed. Final exact head `8ba3ec30501bc2e6f8627d33b5c878eda6f173f0` passed all seven required gates with zero unresolved review threads and expected-head merge produced main `d0404cfc13745f6a13f13581d8e793deefad62d5`.

The merged scope retains three exact Elementor 4.2.4 Button padding capabilities: explicit desktop `text_padding`, tablet `text_padding_tablet`, and mobile `text_padding_mobile` px DIMENSIONS. Exact neutral-source and generated base-candidate identities remain replay-bound; Button text/link/alignment is revalidated; existing requested target keys reject rather than overwrite.

Values remain exact top/right/bottom/left finite px in `0..4096`, with deterministic `isLinked`. Non-px units, custom breakpoints, responsive inference, icon/typography mutation, Figma/network mutation, target compatibility, responsive closure, production acceptance and download authority remain false/out of scope.

Canonical AI-native state is `IDLE_READY_NEXT_P15_BATCH` with no active canonical Issue/PR. Issue #733 / PR #734 is transport-only terminal finalization and does not become canonical lifecycle ownership.

## Completed P15 Fast Batch #727 / PR #728 Button responsive typography metrics

Issue #727 / PR #728 is closed completed. Repaired exact head `98a65b5f043deea9fc2945326eeacef2be51752a` passed all seven required gates with zero unresolved review threads and expected-head merge produced main `ceb64cfdd8a989a01ec671eb235598bdec68596f`.

The merged scope retains four tightly-related exact Elementor 4.2.4 Button responsive typography capabilities: explicit default tablet/mobile font size, line height, letter spacing and word spacing. Exact Typography group source marks each control responsive and Controls Stack establishes the non-desktop suffix contract. Applied entries write `typography_typography=custom` plus only requested tablet/mobile px slider keys.

Font size is integer px `1..200`; line height is locally bounded integer px `1..400`; letter spacing is `-5..10` px in `0.1` steps; word spacing is locally bounded integer px `0..50`. Desktop metric writes, font-family/global-token resolution, variable-font axes, custom breakpoints, inheritance synthesis, responsive inference, CSS/custom units, Figma/network mutation, target compatibility, responsive closure, production acceptance and download authority remain false/out of scope.

Canonical AI-native state is `IDLE_READY_NEXT_P15_BATCH` with no active canonical Issue/PR. Issue #729 / PR #730 was transport-only terminal finalization; repaired exact head `2250c7f5e535478e4ff78a2d84d9876fa9cf2267` passed 7/7 and merged as main `9cf147db96662723845c57bfab13d5d8582c96c3` without becoming canonical lifecycle ownership.

## Completed P15 Fast Batch #723 / PR #724 Button typography metrics

Issue #723 / PR #724 completed five tightly-related exact Elementor 4.2.4 Button typography metrics: literal font family and explicit desktop px font size, line height, letter spacing and word spacing. Applied entries write `typography_typography=custom` plus only requested bounded keys. Source IR and exact generated base-candidate identities remain replay-bound, Button text/alignment/link binding is revalidated, and any pre-existing `typography_*` setting fails closed.

Font size is integer px `1..200`; line height is locally bounded integer px `1..400`; letter spacing is `-5..10` px in `0.1` steps; word spacing is integer px `0..50`; font family is a single bounded literal family with no token/fallback-list syntax. Responsive typography, CSS/custom units, global/token font resolution, variable-font axes, inference, Figma/network mutation, target compatibility, responsive closure, production acceptance and download authority remain false/out of scope.

## Completed P15 Fast Batch #717 / PR #718 Button typography basics

Issue #717 / PR #718 is closed completed. Its exact Elementor 4.2.4 typography scope contained three tightly-related capabilities: `typography_font_weight`, `typography_text_transform` and `typography_font_style`. Product commit `df3b5cf079b8c3901231fa00f378d15462200406` writes `typography_typography=custom` plus only explicitly requested bounded keys, rejects pre-existing `typography_*` settings, and preserves exact Button text/alignment/link binding.

Font family/size, variable axes, text decoration, line height, letter/word spacing, padding, responsive typography, global/token resolution, inference, Figma/network mutation, compatibility, responsive closure, production acceptance and download authority remain false/out of scope.

Exact head `747ce4312c7723e00235143510e1fc3d394aae7c` passed all seven required gates with zero unresolved review threads and expected-head merge produced main `1cd8181cf863353c3f5e4bab7b1270156067b288`. Issue #719 / PR #720 is closed completed. Exact reconciliation head `243e0aa91f7613e644bb98d6116c0ecc8aa28e0d` passed all seven required gates with zero unresolved review threads and expected-head merge produced main `f3384739609ea68e9141f7488e924e20e5ac9d6b`. Canonical AI-native state is `IDLE_READY_NEXT_P15_BATCH`. Issue #721 / PR #722 is transport-only terminal finalization and is deliberately not a canonical lifecycle owner; its merge does not trigger another reconciliation when no product/runtime/security/authority truth changes.
## P16 state

P16 remains **CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED** with `N/A` progress.

The retained foundation includes normalized Gutenberg candidate/capability/profile contracts, exact candidate identity, external receipt/offline revalidation, sanitized review/decision prerequisites, genuine-evidence retention requirements, offline operator export/current-manifest validation and hardened local JSON I/O/output handling. P15/P16 operator JSON pathname boundaries reject symbolic-link inputs and revalidate regular-file identity/content before atomic report commit; the intentional unbounded P15 raw-template reader enforces the same non-symlink pathname rule without changing its separate resource-policy contract; canonical snapshot loading is likewise bound to a stable regular non-symlink opened file with canonical-path/metadata checks around its bounded read. Credentialed Figma REST requests target the fixed API endpoint with redirect following disabled, retaining bounded/timeout-controlled response handling without broadening network authority. Runtime artifact preflight enforces required-file/archive byte ceilings during descriptor reads and revalidates descriptor/path identity after reading so growth/replacement races fail closed. Runtime-closure intake extends the same bounded-read/post-read identity rule to operator evidence and same-artifact verifier rereads before verified-memory execution.

For the existing bounded P16 retention operator surfaces, JSON inputs keep the accepted 1 MiB / 64-level / 50,000-value policy, are read as raw bytes, retain exact SHA-256 snapshots, decode with fatal strict UTF-8 semantics, and are stream-rehashed through a stable opened-file identity immediately before atomic report commit. Same-size byte drift therefore fails closed even when path/filesystem metadata still appears unchanged. Failure cleanup removes only a writer-owned payload whose retained snapshot still matches; non-owned or replaced temporary content is preserved rather than recursively deleted.

`p16:native-serialization-intake` remains on its separate direct read/write path. Do not route its Gutenberg source document through the bounded retention reader until an explicit document-size/resource policy is accepted; doing so today would silently introduce the retention reader's 1 MiB ceiling.

These reliability controls do not validate Gutenberg target import/editor/render behavior and do not grant native-serialization, compatibility, production, generation or download authority.

During the focused Elementor V1 window, keep P16 stable unless a concrete shared blocker appears.

## Repository toolchain state

The accepted development/CI floor is Node.js `22.12.0`, declared as `engines.node >=22.12.0` and exercised at the exact floor by every Node-backed CI/release/security/browser-proof workflow. The explicit coordinated test/build matrix is Vitest `5.0.1`, Vite `8.3.0`, esbuild `0.28.2`, Playwright Core `1.63.0` and `@types/node 26.6.1`.

The migration lockfile was generated by a one-shot Runner with lifecycle scripts disabled and exact run/artifact evidence retained in the Runner Benchmark; the temporary write-capable workflow is not part of the accepted repository tree.

## P17-P27 state

- P17 — **FOUNDATION IMPLEMENTATION IN PROGRESS / CONTROLLED LOCAL BROWSER PROOF**. Merged foundations cover deterministic static HTML/CSS export, fail-closed static import safety preflight, versioned neutral Web IR identity, deterministic neutral-IR → HTML/CSS generation, exact package validation and one controlled local-only Chrome render observation. Visual-fidelity comparison, JavaScript execution, Web→Figma reconstruction and production acceptance remain unclaimed;
- P18-P26 — **PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED**;
- P27 — **GATE DEFINED / EXECUTION DEFERRED** under #182.

Do not open P18-P26 merely to increase parallelism while the bounded Elementor-first V1 and active P17 static-only line remain unfinished.

## Immediate execution target

Continue the coherent Elementor-first internal V1 from the retained controlled proof:

`selected Figma Frame -> deterministic extraction -> exact source-bound semantic/image-reference resolution where supplied -> exact bounded responsive direction/gap/alignment/padding/margin/min-height/boxed-width/z-index overrides where supplied -> mapping readiness -> fresh candidate -> local artifact validation/download -> exact declared TargetProfile -> exact retained profile/candidate reference binding -> exact controlled asset/reference observations where applicable -> sanitized observed evidence binding -> exact imported-file content integrity -> separate internal closure decision / durable target-managed portability proof + remaining responsive work -> bounded handoff`

The retained WordPress `6.8` + Elementor `4.2.4` proof is a reference point, not broad version support. Keep P16 stable unless a concrete shared blocker appears. The explicitly opened P17 static-only line may continue in bounded dependency order; keep P18-P26 frozen, and preserve false compatibility/production/download authority until the applicable evidence and release gates explicitly change it.
` semantics. A verifier-only line-boundary repair is applied and repaired-head re-verification is pending. Exact Elementor `4.2.4` Heading source proves normal `title_color` and separate hover/link `title_hover_color`. The resolver accepts only lowercase six-digit hex, writes only `title_color`, rejects global/theme tokens, CSS variables, shorthand/alpha/named/custom color strings and leaves hover/link color untouched. Exact source/candidate binding, fail-closed validation and false compatibility/production/closure/download/network/Figma authority remain mandatory.

## P16 state

P16 remains **CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED** with `N/A` progress.

The retained foundation includes normalized Gutenberg candidate/capability/profile contracts, exact candidate identity, external receipt/offline revalidation, sanitized review/decision prerequisites, genuine-evidence retention requirements, offline operator export/current-manifest validation and hardened local JSON I/O/output handling. P15/P16 operator JSON pathname boundaries reject symbolic-link inputs and revalidate regular-file identity/content before atomic report commit; the intentional unbounded P15 raw-template reader enforces the same non-symlink pathname rule without changing its separate resource-policy contract; canonical snapshot loading is likewise bound to a stable regular non-symlink opened file with canonical-path/metadata checks around its bounded read. Credentialed Figma REST requests target the fixed API endpoint with redirect following disabled, retaining bounded/timeout-controlled response handling without broadening network authority. Runtime artifact preflight enforces required-file/archive byte ceilings during descriptor reads and revalidates descriptor/path identity after reading so growth/replacement races fail closed. Runtime-closure intake extends the same bounded-read/post-read identity rule to operator evidence and same-artifact verifier rereads before verified-memory execution.

For the existing bounded P16 retention operator surfaces, JSON inputs keep the accepted 1 MiB / 64-level / 50,000-value policy, are read as raw bytes, retain exact SHA-256 snapshots, decode with fatal strict UTF-8 semantics, and are stream-rehashed through a stable opened-file identity immediately before atomic report commit. Same-size byte drift therefore fails closed even when path/filesystem metadata still appears unchanged. Failure cleanup removes only a writer-owned payload whose retained snapshot still matches; non-owned or replaced temporary content is preserved rather than recursively deleted.

`p16:native-serialization-intake` remains on its separate direct read/write path. Do not route its Gutenberg source document through the bounded retention reader until an explicit document-size/resource policy is accepted; doing so today would silently introduce the retention reader's 1 MiB ceiling.

These reliability controls do not validate Gutenberg target import/editor/render behavior and do not grant native-serialization, compatibility, production, generation or download authority.

During the focused Elementor V1 window, keep P16 stable unless a concrete shared blocker appears.

## Repository toolchain state

The accepted development/CI floor is Node.js `22.12.0`, declared as `engines.node >=22.12.0` and exercised at the exact floor by every Node-backed CI/release/security/browser-proof workflow. The explicit coordinated test/build matrix is Vitest `5.0.1`, Vite `8.3.0`, esbuild `0.28.2`, Playwright Core `1.63.0` and `@types/node 26.6.1`.

The migration lockfile was generated by a one-shot Runner with lifecycle scripts disabled and exact run/artifact evidence retained in the Runner Benchmark; the temporary write-capable workflow is not part of the accepted repository tree.

## P17-P27 state

- P17 — **FOUNDATION IMPLEMENTATION IN PROGRESS / CONTROLLED LOCAL BROWSER PROOF**. Merged foundations cover deterministic static HTML/CSS export, fail-closed static import safety preflight, versioned neutral Web IR identity, deterministic neutral-IR → HTML/CSS generation, exact package validation and one controlled local-only Chrome render observation. Visual-fidelity comparison, JavaScript execution, Web→Figma reconstruction and production acceptance remain unclaimed;
- P18-P26 — **PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED**;
- P27 — **GATE DEFINED / EXECUTION DEFERRED** under #182.

Do not open P18-P26 merely to increase parallelism while the bounded Elementor-first V1 and active P17 static-only line remain unfinished.

## Immediate execution target

Continue the coherent Elementor-first internal V1 from the retained controlled proof:

`selected Figma Frame -> deterministic extraction -> exact source-bound semantic/image-reference resolution where supplied -> exact bounded responsive direction/gap/alignment/padding/margin/min-height/boxed-width/z-index overrides where supplied -> mapping readiness -> fresh candidate -> local artifact validation/download -> exact declared TargetProfile -> exact retained profile/candidate reference binding -> exact controlled asset/reference observations where applicable -> sanitized observed evidence binding -> exact imported-file content integrity -> separate internal closure decision / durable target-managed portability proof + remaining responsive work -> bounded handoff`

The retained WordPress `6.8` + Elementor `4.2.4` proof is a reference point, not broad version support. Keep P16 stable unless a concrete shared blocker appears. The explicitly opened P17 static-only line may continue in bounded dependency order; keep P18-P26 frozen, and preserve false compatibility/production/download authority until the applicable evidence and release gates explicitly change it.
