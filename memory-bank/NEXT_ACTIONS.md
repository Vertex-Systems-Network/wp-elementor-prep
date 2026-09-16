# Next Actions

Last updated: 2026-09-17

Runtime artifact preflight requires `config/runtime-artifacts.json` schema-v3 and must fail closed on stale or mismatched registered artifacts.

## Execution mode — focused Elementor V1 release train

Prioritize one coherent Elementor commercial V1. Keep P16 stable unless a concrete shared blocker appears, and keep P17-P26 frozen during this window.

Use focused typecheck/tests/builds while iterating. The exact integration head must pass the repository's full CI / P12 Final Release Artifact / P12 Offline Acceptance gates before merge. Canonical docs synchronize once per behavior-changing release train rather than in separate ceremonial docs PRs.

## Authority boundaries that must remain true

- P12 — **IN PROGRESS / 80%**; historical publishing authority remains Final Release Artifact #20 from source `5f12b1d28146d5c2af815cc9f83eb30431dce4b5`, plugin ID `1680034649341961379`.
- P13 — **IMPLEMENTATION COMPLETE / RUNTIME ACCEPTANCE PENDING**; #159 requires genuine Figma Desktop evidence.
- P14 — **CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED**; `PRODUCTION_P14_SAFE_RECIPE_REGISTRY` remains empty.
- P15 — **CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED**.
- P16 — **CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED**.
- P17-P26 — **PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED**.
- P27 — **GATE DEFINED / EXECUTION DEFERRED** under #182.
- #287 remains repository-admin branch/ruleset enforcement work.

Never promote local artifact validation, environment qualification, evidence-chain validation, deterministic style serialization, declared profile alignment, mapping readiness, caller-supplied evidence or CI success into real target compatibility/import/render/production authority.

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

The stable-I/O evidence-integrity line does not change `acceptanceAuthority=false`, `targetCompatibilityClaim=false`, `productionAcceptance=false`, `internalReviewRequired=true`, or P15's `TARGET IMPORT UNVALIDATED` state.

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
- migrated P15 report `inputs.*Sha256` fields reuse those immutable exact raw-byte snapshot digests rather than re-hashing decoded `.raw` strings, so retained report fingerprints remain identical to file-byte fingerprints even across valid decoder representation edges such as a UTF-8 BOM;
- raw reference-template digest rechecks are streaming and do not allocate a second complete in-memory copy or introduce a new generic byte limit;
- migrated reports are committed via exclusive restrictive-permission temporary payload + rename, with output parent/destination/input snapshots rechecked immediately before commit and owned temporary artifacts cleaned on failure;
- `p15:elementor-first-proof-vector` deterministically rebuilds the dedicated first-proof neutral IR through the accepted production generator, retains exact candidate identity/TargetProfile fingerprint/file hashes, writes a staged vector only when the destination is absent, and otherwise requires exact byte-for-byte verification without overwriting drift;
- the first-proof vector remains entirely unobserved/non-authorizing: `importValidationStatus=NOT_RUN`, target/import/editor/render observations false, acceptance/compatibility/production authority false and internal review required;
- repository code and CI never synthesize environment/import/editor/render observations.

`CHAIN_FULL_PASS` is evidence-chain consistency only. It never grants compatibility, production acceptance or target authority.

## Next P15 acceptance action — issue #483 real controlled target proof

The exact operator input set is now reproducible through the production generator path. The next P15 acceptance action remains the first genuine target proof against one real externally observed runtime.

Required order:

1. generate or verify the exact vector with `npm run p15:elementor-first-proof-vector -- --out-dir dist-p15/p15-elementor-first-proof-vector-v1` and retain `candidate.json`, `target-profile.json`, `template.json` and `manifest.json` unchanged;
2. capture the real runtime facts for the exact environment intended for the proof;
3. run `p15:elementor-target-environment-intake` and retain the environment report/fingerprint;
4. proceed only with the clean-Core `QUALIFIED_FOR_BOUND_TARGET_PROOF` path unless a separate review explicitly allows a review-required environment;
5. import the vector's exact `template.json` through Elementor Template Library JSON;
6. if import passes, open it in the Elementor editor;
7. if editor-open passes, render/preview and observe only the currently supported bounded fidelity slice;
8. build the exact-bound `elementor-target-proof-evidence-v1` packet from those genuine observations and the vector's exact candidate/profile identities;
9. run the standalone target-proof intake using the exact `candidate.json` and `target-profile.json`;
10. run `p15:elementor-target-proof-chain-intake` over the exact candidate/profile/environment/proof set;
11. retain every vector file, input/report fingerprint and durable evidence reference together;
12. perform separate internal review before changing any P15 authority/status.

The frozen profile's WordPress `6.8.0` and Elementor `4.2.4` values are declared target facts, not observed runtime facts. Never rewrite the real environment evidence merely to match them; an observed mismatch remains evidence and must flow through the existing review/partial semantics.

If a genuine qualified operator/environment is not available, stop at the evidence-capture boundary. CI, local vector generation, local JSON validity, Playground/SQLite-only observations, unbound screenshots and user-declared versions cannot substitute for #483.

## Repository-side boundary while #483 is blocked

Do not open additional P15 serializer/fidelity implementation merely to keep the queue moving while #483 is unproven. The next fidelity slice must be selected from a concrete gap exposed by the first real controlled target proof.

Repository-side work is limited to concrete CI/review regressions, evidence-harness/operator-integrity, platform-evidence refreshes, canonical status truth and newly opened actionable issues.

## P16 bounded retention evidence-integrity boundary

The concrete shared blocker represented by #510 is limited to the already-bounded P16 retention operator surfaces. Those inputs retain the accepted 1 MiB / 64-level / 50,000-value policy, are consumed as raw bytes, retain exact SHA-256, reject malformed UTF-8 before JSON parsing, and are stream-rehashed through a stable opened-file identity immediately before atomic report commit. Same-size byte drift fails closed even if filesystem metadata still appears unchanged.

Writer failure cleanup may remove only its own still-matching temporary payload; replaced or non-owned temporary content remains untouched. This hardening does not change P16's `TARGET VALIDATION UNWIRED` state or grant native-serialization/import/editor/render/compatibility/production authority.

`p16:native-serialization-intake` remains explicitly outside that bounded reader until a document-size/resource policy is accepted. Do not silently impose the retention reader's 1 MiB ceiling on the Gutenberg source document merely to unify implementation paths.

## Parallel operator/runtime evidence

When the required real environment/operator is available, these can proceed independently:

- #483 — qualified and chain-bound real Elementor import/editor/render evidence + separate internal review;
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
