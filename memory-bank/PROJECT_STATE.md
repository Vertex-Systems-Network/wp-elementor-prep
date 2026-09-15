# Project State

Last updated: 2026-09-16

## Product direction

WP Builders Prepare is a deterministic Figma audit/safe-prep platform evolving toward validated multi-target build output while preserving offline/fail-closed authority boundaries.

Current implemented surfaces:

1. P0-P12 deterministic audit/safe-prep/CLI/release foundations;
2. P13 Build-Ready Score 2.0 + Responsive Risk with `p13-core-v2` analyzer-bound provenance;
3. P14 retained-duplicate core and development-only read-only Guided Prepare/review evidence surfaces;
4. bounded P15 Elementor R1 candidate/profile/import/reference evidence chain plus target-neutral export IR, deterministic local Elementor v0.4 Container/Widget Template JSON candidate generation, and read-only selected-Figma-Frame extraction for bounded Auto Layout/plain-text structures;
5. bounded P16 Gutenberg R1 normalized candidate/native-validation evidence chain through a genuine-evidence retention requirements manifest, offline operator export, exact-current saved-manifest validator, offline validation CLI, byte/structure-bounded local JSON I/O with stable immutable read snapshots + output-parent snapshot revalidation + temporary payload identity binding + non-recursive temporary cleanup + output-destination state binding, depth/value/text-bounded accessor/own-shape-safe prototype-safe direct canonicalization with object-cardinality preflight and alias-safe atomic output writes;
6. exact-build release/provenance tooling.

`config/runtime-artifacts.json` is runtime artifact registry schema v3 and remains the machine-readable runtime artifact authority.

## Current repository main

Current verified main before this documentation sync:

`9d7718dd19d56c28a183023f347947bcdc3123c9`

Recent guarded merge line:

- #370 exact-bound external native evidence authentication binding -> `5328f6d0205a350e5e1f27b0106fd930e680ae17`;
- #372 canonical authentication docs sync -> `ba2e3d78de79d66a5a07abd2030548893b090845`;
- #374 exact-bound native decision prerequisite -> `6dc86dfc900244616869e5ff289c3afa815a1d2d`;
- #376 canonical decision-prerequisite docs sync -> `31080f673102206e6e6ae41801569d62e2eb7512`;
- #378 genuine evidence retention requirements manifest -> `2d7c9e76eb293b8914dd1106c262064013d70b11`;
- #380 canonical retention-requirements docs sync -> `c6f6009538e1e0f82bed087783f2c55fa0d9e75d`;
- #382 offline/operator retention-requirements export -> `e2fe19364ac8615bc390f125c2afb4085bfc474c`;
- #384 canonical operator-export docs sync -> `4c91cb3033672d6dc3a6fa28287e060a22e40734`;
- #386 exact-current retention-requirements manifest validator -> `1532fa54ec9c26bb8904ca939a01754418a70602`;
- #388 canonical manifest-validator docs sync -> `d7532a98b71e5dc5ac6c100b0386f06422966cf9`;
- #390 offline/operator exact-current retention-manifest validation CLI -> `c173c617ad205f0fef4a5659f27bf007067e6eb5`;
- #392 canonical validation-CLI docs sync -> `78f25d0cbc72427ea9824370762099db916750ed`;
- #394 retention operator local-file hardening -> `19d36b87b71cdc0d8b8f862c733420d64a56d3d2`;
- #396 canonical file-bound-hardening docs sync -> `12dc1e7e7e149e4da51a13c14722ac834f8a69ca`;
- #398 prototype-safe retention-manifest canonicalization -> `4ec559f538899697d51138fc35ed79c2bea486b1`;
- #400 canonical prototype-safe docs sync -> `158132b4076fe5a70afa8e8778ae888fcca4db60`;
- #402 alias-safe atomic retention output writes -> `8445fc0632a58515a52d72e3cf85ed1364761b9c`;
- #404 canonical alias-safe-output docs sync -> `4f66522ae9d8dc6fb82875b32634306918ed0a9a`;
- #406 iterative retention JSON structural bounds -> `5feb04adcd6aaca2079b749d495e22e1da6f6671`;
- #408 canonical JSON-structure-bounds docs sync -> `ab8cb5e783b14688180959017aa79b9a86adfa66`;
- #410 direct retention-manifest canonicalization bounds -> `cb4de36d4922b31b1e278d4f55426d042736549b`;
- #412 canonical direct-canonicalization-bounds docs sync -> `1a7cb4b7692a0361d645ddf1396f6aac561ad093`;
- #414 direct canonicalization UTF-8 text-byte bounds -> `86cc545456a1f994c9893069b878110662a60bbe`;
- #416 canonical direct-canonical-text docs sync -> `5b0d3e9f08122c4df7cb29edfd0e51dabb8de440`;
- #418 accessor-safe direct canonicalization -> `4adc40d74b74f74f362cb635854dd2c8240134d8`;
- #420 canonical accessor-safe docs sync -> `b89dbba01dd85fc84d53761190581a2ab93ba8f0`;
- #422 strict own-property direct canonicalization -> `29285d205a61cc437e446367b3d8fefc52595e1d`;
- #424 canonical strict-own-property docs sync -> `61ba4dc5b456a588383ed0169045387e0fc51482`;
- #426 direct object-cardinality preflight -> `06cdd845e46613541f555cc0de59237d261c1fa3`;
- #428 canonical object-cardinality docs sync -> `44186a19b5719ae3cd3b883140e6e2b8bf776553`;
- #430 stable retention operator input snapshots -> `146b2dd7a534ab12b4598fe1c78823d5e9733118`;
- #432 canonical stable-input-snapshot docs sync -> `686a4e8bf65a2b0b43075baa20c6fa6eccadb10d`;
- #434 immutable retention operator snapshot metadata -> `78c162728af3249a4ce5905eb831b7a0f72dcd4d`;
- #436 canonical immutable-snapshot docs sync -> `df3a5503eb274c4e9c5c5dccf6383b66138cec12`;
- #438 output-parent snapshot revalidation -> `2b67f292d192b86f825e99860313978ee49dfb6f`;
- #440 canonical output-parent snapshot docs sync -> `f58029610c5fc8e07c2cff467eae33490be6a92f`;
- #442 temporary payload identity binding -> `13cc556d87652a9f0f30a8749f98ae823c9dbd9a`;
- #444 canonical temporary-payload docs sync -> `f82a667f1e397e713af1447af2117e20c55150d4`;
- #446 non-recursive temporary-directory cleanup -> `0c9325fe995e983b4c904f59f788ac91167276aa`;
- #448 canonical non-recursive-cleanup docs sync -> `af517e1477d57753993f805ccb4d0f770fdf51d5`;
- #452 output-destination state binding -> `f3306a3aba5b42544cbdabe950f975ce5ce338a9`;
- #454 canonical four-document status sync -> `b5e8f919156fb8dc75cab9bad418ce95c7e36f0a`;
- #456 read-only main PR-origin audit -> `1896ba5d576e6d33f693a2a5dc0a7fb09094d1d6`;
- #458 forced-update detection in the same read-only main-origin audit -> `cd4e8394dfaa6917d28676e51eec831591b6b99a`;
- #460 README P0-P27 status expansion -> `e2c446b162607767e55dfaa8705d5ac446c49734`;
- #462 bounded target-neutral IR + deterministic Elementor v0.4 Template JSON candidate generation -> `673a366ad3da25c5d3a327ed87572bcdb2af408d`;
- #464 read-only selected-Figma-Frame -> neutral IR extraction, plain `text-editor` mapping and fail-closed depth/node review bounds -> `9d7718dd19d56c28a183023f347947bcdc3123c9`.

## Persistent issue queue

- #84 — P12 final integrated validation/release-exit, retained at 80%;
- #119 — P13-P27 commercial/multi-target roadmap owner;
- #159 — genuine Figma Desktop Build-Ready runtime/parity acceptance dependency;
- #182 — P27 final production-release/evidence gate;
- #287 — repository-admin branch protection/ruleset hardening residual.

## P12 state

P12 remains **IN PROGRESS / 80%**.

The publishing-authoritative historical candidate remains Final Release Artifact #20 from source `5f12b1d28146d5c2af815cc9f83eb30431dce4b5`, plugin ID `1680034649341961379`.

Later P13-P16 development commits do not replace this historical publishing candidate by implication. Remaining live/manual release evidence is deferred to P27.

## P13 state

P13 is **IMPLEMENTATION COMPLETE / RUNTIME ACCEPTANCE PENDING** with `100% impl`. #159 remains required for genuine Figma Desktop runtime/parity acceptance.

## P14 state

P14 remains exactly **CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED** with `N/A` progress.

`PRODUCTION_P14_SAFE_RECIPE_REGISTRY` remains empty. Production handoff remains REVIEW/BLOCKED and no real P14 mutation authority exists. #159 remains required before real mutation exposure.

## P15 state

P15 remains exactly **CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED** with `N/A` progress.

Current bounded Elementor chain includes documented template/capability validation, deterministic candidate + identity, declared target profile, exact-bound import/reference evidence, offline intake, sanitized pre-decision review and externally reported authentication-result binding.

The commercial-V1 code-side foundation now also includes a bounded target-neutral export IR and deterministic local Elementor v0.4 Container/Widget Template JSON candidate generator. Neutral IR supports explicit container, heading, button, image, generic plain-text and REVIEW intents without accepting Elementor control names. Generated local candidates are revalidated through the existing P15 template/candidate contract; any REVIEW intent fails closed without a partial candidate.

Read-only Figma extraction now maps a selected Frame through bounded HORIZONTAL/VERTICAL Auto Layout facts, padding/gap/alignment and visible plain TEXT into the neutral IR. Generic plain text maps to the documented core Elementor `text-editor` widget with HTML escaping and line-break retention. Manual/grid/wrapped layout, absolute-positioned children, image-backed content pending asset export, unsupported visible node/alignment states and depth/node bound overflow become explicit REVIEW outcomes. Figma layer names are not used to guess heading/button semantics.

This does **not** establish target compatibility. Genuine trusted evidence authentication/internal decision, broader semantic/media/responsive mapping, plugin UI exposure, real WordPress/Elementor import/editor/render validation, production acceptance and download/transfer authority remain pending/unwired.

## P16 state

P16 remains exactly **CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED** with `N/A` progress.

Current bounded deterministic/read-only/evidence chain includes:

- official WordPress/Gutenberg R0 snapshot;
- normalized parsed-block contract over repository-owned review JSON;
- documented-core capability reporting;
- immutable declared target profile + SHA-256 profile fingerprint;
- profile-bound normalized assessment with strongest metadata state `PROFILE_ALIGNED_NATIVE_VALIDATION_PENDING`;
- deterministic normalized candidate + exact canonical candidate identity;
- exact-bound caller-supplied native-serialization receipt;
- Node-20 offline exact-bound receipt intake/revalidation;
- deterministic sanitized pre-decision review packet;
- exact-bound externally reported evidence-authentication report;
- deterministic decision prerequisite where external auth PASS stops at `GENUINE_AUTHENTICATION_EVIDENCE_REQUIRED`;
- deterministic `gutenberg-native-serialization-evidence-retention-requirements-v1` that is READY only from that exact prerequisite, preserves exact chain fingerprints + declared WordPress version, and fingerprints a fixed future evidence-retention requirements profile;
- package command `p16:evidence-retention-requirements`, a Node-20 offline/operator export that reads only the existing local document/profile/receipt/authentication-report JSON chain and writes that sanitized requirements manifest;
- deterministic `gutenberg-native-serialization-evidence-retention-requirements-validation-v1`, which rebuilds the current exact requirements manifest and validates a previously exported manifest using strict JSON-only, key-order-independent semantic equality;
- package command `p16:evidence-retention-requirements-validate`, a Node-20 offline/operator validation CLI that reads only local document/profile/receipt/authentication-report/manifest JSON and writes only the sanitized validator result;
- shared bounded local JSON I/O for both retention CLIs: each input is capped at 1 MiB before parse with a post-read byte-length recheck, must be a regular file, cannot be zero-byte/whitespace-only, and the normalized output path cannot collide with any input path;
- stable operator input snapshots: initial path inspection stays ahead of content read, the opened handle must match the inspected regular file before read, handle/path metadata is rechecked after read, and parsed `.value` is carried with resolved/canonical path + read-time dev/ino and size/mtime/ctime metadata into output safety;
- immutable snapshot metadata: outer snapshot fields and nested read-time file metadata are TypeScript-readonly and runtime-frozen, so resolved/canonical paths and captured dev/ino/size/time metadata cannot be changed after capture. Parsed `.value` intentionally remains outside this freeze so builder/validator behavior is unchanged;
- output snapshot revalidation: the exact files read are checked before temporary output creation and immediately before atomic rename; observed post-read pathname replacement fails closed and temp state is cleaned before failure. Stable dev/ino identity is used where available; otherwise canonical path + size/mtime/ctime consistency is a bounded fallback, not a perfect filesystem-race-elimination guarantee;
- output-parent snapshot revalidation: the canonical output directory is captured as a frozen path/dev/ino snapshot after creation/resolution, revalidated before temporary output creation and immediately before final rename, and must remain a directory that self-resolves to the same canonical path. Where stable identity existed at capture, the same dev/ino directory identity is required; otherwise canonical-path/directory consistency is the bounded fallback;
- output-destination state binding: final output state is captured before staging as `ABSENT` or frozen `EXISTING_REGULAR` canonical path/file metadata, then revalidated immediately before rename. Observed creation/replacement/removal/type change fails closed with `Output path changed during write.`; unchanged existing regular output remains intentionally overwritable;
- non-recursive temp cleanup: after output-parent and temporary-directory snapshot checks, cleanup attempts only `rmdir`. Successful writes remove the now-empty owned temp directory after payload rename; failed/non-empty temp state is left untouched and may remain as a bounded orphan rather than recursively traversing a pathname whose ownership cannot be continuously proven;
- temporary-directory identity binding: the `mkdtemp` directory is captured and must remain a directory that self-resolves to the same path; it is revalidated before payload open, immediately after payload open, after payload write and immediately before final rename, with same dev/ino required where stable identity was captured;
- opened temporary payload binding: `payload.json` is created exclusively with `open(..., 'wx')`, the opened handle and current pathname must identify the same regular file before any content write, content is written through that `FileHandle`, a frozen post-write file snapshot is captured, and the source pathname must still match that snapshot before rename;
- iterative post-parse structural validation that rejects more than 64 nested container levels or more than 50,000 total JSON values before target builders/validators execute;
- direct exact-current retention-manifest canonicalization independently caps nested containers at 64 levels, total visited values at 50,000 and aggregate UTF-8 text from object keys + string values at 1 MiB for exported validator/fingerprint callers that bypass the CLIs;
- accessor-safe direct canonicalization reads own property descriptors instead of invoking values through ordinary property access, so object/array accessors fail closed without getter/setter execution;
- strict own-shape direct canonicalization rejects own symbol/non-enumerable fields on plain objects and rejects extra named/symbol properties on arrays while accepting standard `length` + canonical indices and frozen/sealed JSON-shaped data;
- object-cardinality preflight rejects a plain object whose own string-property count cannot fit the remaining 50,000-value budget before descriptor scanning, UTF-8 key charging or sorting; root + 49,999 primitive properties remains valid, root + 50,000 rejects;
- prototype-safe exact-current canonicalization: canonical object snapshots use no `Object.prototype`, so own enumerable JSON keys such as `__proto__` remain data properties, alter fingerprints and are rejected when added instead of being silently dropped;
- alias-safe output writes: canonical output locations are compared to the read snapshots, existing output symlinks/non-regular targets are rejected, hardlink aliases to files actually read are rejected where stable identity is available, output is staged in a unique same-directory temp file and input/output-parent/output-destination/temp-directory/payload snapshots are revalidated before atomic rename.

The operator structural traversal is iterative, not recursive, so the guard itself does not create stack-exhaustion risk. Stable read snapshots bind parsed content to the observed file and carry the same observation into output safety; their path/identity metadata is frozen after capture. Output-parent snapshots bind the final rename to the canonical directory that was safety-checked. Output-destination snapshots bind overwrite eligibility to the absent-or-existing regular entry observed before staging. Temporary-directory snapshots and the opened payload handle/file snapshot separately bind temporary payload creation, content write and rename to the observed temp subtree. Path changes detected before/during/after input read, before output rename or across the parent/temp/payload boundaries fail closed. These checks narrow path-swap/TOCTOU ambiguity but do not claim perfect race elimination; a narrow final destination check→rename race remains without an OS-specific conditional-rename primitive, and metadata fallback is bounded when stable filesystem identity is unavailable.

The direct canonicalizer accepts depth 64 and exactly 50,000 total values and fails closed for 65 / 50,001. It also limits aggregate object-key + string-value UTF-8 text to 1 MiB, charges key bytes before sorting and uses browser-safe manual accounting for ASCII, multi-byte Unicode, surrogate pairs and lone-surrogate replacement width. Accessor-backed properties fail closed without invocation. Hidden JavaScript-only own state is rejected rather than omitted from fingerprints. Arrays and plain objects both preflight child cardinality against the remaining value budget; the plain-object preflight runs before descriptor/text/sort work. Frozen/sealed JSON-shaped values and own enumerable `__proto__` data keys remain canonicalized.

Focused output-path tests cover symlink, hardlink and symlinked-parent aliases, plus absent/existing/replaced output-destination snapshots, inode-zero metadata fallback and unchanged-existing-output overwrite support; source input immutability remains verified. Stable-input-snapshot tests cover normal writes, post-read pathname replacement rejection, pre-read symlink rejection and immutable metadata. Output-parent tests cover stable parent revalidation, non-directory replacement, identity-aware same-path replacement and replacement-controlled sentinel preservation. Temp/payload tests cover stable temp-directory matching, non-directory and identity-aware same-path temp replacement, opened payload handle/path mismatch before content write, and post-write payload pathname replacement rejection. Non-recursive cleanup tests prove an empty stable owned temp directory is removed and a non-empty stable temp directory/sentinel is preserved. Focused canonicalization regressions cover top-level/nested own `__proto__`, direct structural/text limits, accessor-backed values, strict own-property shape and exact object-cardinality limits, and confirm `Object.prototype` remains unpolluted.

Operator/input failures remain exit code 2 with deterministic content-free errors. Windows path comparison is case-normalized for output/input collision checks.

The validation CLI exits 0 only for `CURRENT_REQUIREMENTS_MANIFEST_VALID`; every rejected current-chain/stale/tampered state exits 2. Stdout contains only output path, validation status, current requirements status, exactSemanticMatch and canonical expected/provided SHA-256 values.

The validator rejects extra/missing/mutated fields and stale exact-chain bindings. Exact outcomes are `REJECTED_CURRENT_CHAIN_NOT_READY`, `REJECTED_REQUIREMENTS_MANIFEST_INVALID_OR_STALE`, and `CURRENT_REQUIREMENTS_MANIFEST_VALID`. VALID means only that the previously exported non-authorizing requirements metadata exactly matches the current deterministic chain.

The retention requirements manifest/export/validator/validation CLI accepts no future evidence artifact, authenticator identity, authentication method, authenticated-at assertion or evidence PASS/FAIL. It does not authenticate anything and does not make an internal decision. Export exit 0 means only `EVIDENCE_RETENTION_REQUIREMENTS_READY` requirements metadata.

Written output/stdout/validator results intentionally omit the raw evidence reference, source evidence-reference hash, supplied manifest payload and native Gutenberg post content. Validator/CLI output carries sanitized status metadata plus canonical expected/provided SHA-256 fingerprints only.

Repository code still does not execute WordPress, `@wordpress/blocks` or PHP; does not connect to WordPress REST/site runtime; does not fetch/authenticate evidence; does not identify or verify an authenticator; does not validate signatures; and does not prove target environment/editor/import/render behavior.

Current authority remains fixed:

- `evidenceAuthenticationStatus=NOT_RUN`;
- `authenticationAuthority=false`;
- `nativeSerializationAuthority=false`;
- `targetEnvironmentValidated=false`;
- `editorImportValidated=false`;
- `renderValidated=false`;
- `decisionAuthority=false`;
- `acceptanceAuthority=false`;
- `targetCompatibilityClaim=false`;
- `productionAcceptance=false`;
- `generationEnabled=false`;
- `downloadEnabled=false`;
- `internalDecisionStatus=NOT_RUN`;
- `internalDecisionEligible=false`.

The normalized JSON model is not Gutenberg post-content serialization and intentionally omits WordPress `innerContent`. Custom/unregistered/freeform content remains `REVIEW_REQUIRED`.

Strongest current P16 code-side state remains a requirements-ready export/validation surface with an offline exact-current checker, byte/structure-bounded alias-safe local-file I/O with stable immutable input snapshots + output-parent snapshot revalidation + temporary payload identity binding + non-recursive temporary cleanup and depth/value/text-bounded accessor/own-shape-safe prototype-safe direct canonicalization with early object-cardinality preflight that still requires **genuinely retained authenticated evidence** before any authority-bearing internal decision path may be added or executed.

## P17-P26 state

P17-P26 remain **PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED**. No implementation-complete or production claims are made.

## P27 state

P27 #182 remains **GATE DEFINED / EXECUTION DEFERRED**. It owns final production acceptance, exact-current release provenance, deferred live P12 runtime/publisher/2FA evidence and the separate #84 release-exit decision.

## Immediate project action

1. Keep #159 as the prerequisite before real P14 mutation exposure.
2. Continue P15 commercial-V1 only through deterministic/read-only generation, extraction and UI/reporting work while target/import/download authority remains false; genuine trusted evidence is still required before any stronger authority-bearing internal decision.
3. Do not manufacture a P16 trusted-evidence intake or internal decision from another caller-supplied flag; actual retained authenticated evidence is now required for the next authority-bearing progression.
4. Additional P16 code-only work may remain deterministic/read-only/supporting only if every current false authority flag remains false.
5. Keep P17-P26 in dependency order after stable target-adapter foundations.
6. Execute P27 only when implementation/internal readiness is complete.
7. Keep #287 open until repository settings actually enforce the required rules.

No synthetic overall project percentage is used.