# P14 Retained-Duplicate Foundation

Status: CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED  
Roadmap: #119  
Canonical status synchronized through P14 review-packet work, the bounded P15 Elementor R1 evidence/review chain plus target-neutral IR, deterministic local v0.4 Template JSON generation and read-only selected-Figma-Frame extraction, and P16 Gutenberg R1 through genuine-evidence retention requirements metadata + offline export + exact-current manifest validation + offline validation CLI + bounded local JSON I/O + stable immutable operator input snapshots + output-parent snapshot revalidation + temporary payload identity binding + non-recursive temporary cleanup + output-destination state binding + iterative structural bounds + depth/value/text-bounded accessor/own-shape-safe direct canonicalization + object-cardinality preflight + prototype-safe canonicalization + alias-safe atomic output writes.

Open acceptance/release dependencies: P13 real-Figma acceptance (#159), P12 release-exit review (#84), and P27 final production-release gate (#182).

## Purpose

P14 owns target-neutral **Target-Ready Duplicate + Guided Prepare** foundations. The approved source design remains authoritative. Preparation must operate on a retained candidate/duplicate, validate before acceptance, fail closed on ambiguity and never reinterpret static evidence as production mutation authority.

## Current P14 authority boundary

P14 remains exactly **CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED**.

`PRODUCTION_P14_SAFE_RECIPE_REGISTRY` remains empty. Current production handoff therefore remains REVIEW/BLOCKED and no production-eligible mutation action IDs exist.

Read-only preview/review/evidence surfaces do not confirm or execute a mutation, grant target compatibility or production acceptance, or bypass #159 genuine Figma Desktop evidence.

P13 analyzer identity remains `p13-core-v2`; stale or unsupported persisted evidence must fail closed.

## Downstream adapter separation

P15 Elementor and P16 Gutenberg may build deterministic/read-only/evidence contracts in parallel, but they do not authorize P14 mutation and P14 does not manufacture target-runtime evidence.

### Current P15 state

P15 remains exactly **CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED** with `N/A` progress.

Its bounded chain includes declared target profiles, exact candidate/import/reference evidence binding, offline operator intake, pre-decision review and externally reported authentication-result binding. These remain non-authorizing evidence/review surfaces.

The commercial-V1 code-side foundation now additionally includes a target-neutral export IR plus deterministic local Elementor v0.4 Container/Widget Template JSON generation for bounded explicit container/heading/button/image/plain-text intents. Generated candidates are revalidated through the existing template/candidate contract and any REVIEW intent fails closed without partial output.

A read-only selected-Figma-Frame extractor now retains bounded HORIZONTAL/VERTICAL Auto Layout, padding/gap/alignment and visible plain TEXT facts in that neutral IR. Generic plain text maps to documented core `text-editor` with escaping and line-break retention. Manual/grid/wrapped layout, absolute children, image-backed content pending asset export, unsupported visible node/alignment states and depth/node overflow produce REVIEW. Layer names are never used to guess heading/button semantics.

Real WordPress/Elementor target import/editor/render validation, genuine trusted evidence authentication/internal decision, broader semantic/media/responsive mapping, production acceptance and download/transfer authority remain unvalidated/unaccepted. The new local generation/extraction surfaces do not authorize P14 mutation.

### Current P16 state

P16 remains exactly **CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED** with `N/A` progress.

Current bounded chain includes:

- normalized `gutenberg-normalized-parsed-block-v1` review contract and documented-core capability reporting;
- immutable declared `gutenberg-target-profile-v1` + deterministic profile fingerprint;
- profile-bound assessment with strongest metadata state `PROFILE_ALIGNED_NATIVE_VALIDATION_PENDING`;
- deterministic normalized candidate + exact canonical candidate identity;
- exact-bound caller-supplied native-serialization receipt;
- offline exact-bound receipt intake/revalidation;
- sanitized pre-decision review packet;
- exact-bound externally reported evidence-authentication report;
- sanitized decision prerequisite where external auth PASS stops at `GENUINE_AUTHENTICATION_EVIDENCE_REQUIRED`;
- deterministic `gutenberg-native-serialization-evidence-retention-requirements-v1`, READY only from that exact prerequisite and containing only chain fingerprints, declared WordPress version and future retention requirements metadata;
- Node-20 package command `p16:evidence-retention-requirements`, which exports that sanitized requirements manifest from local document/profile/receipt/authentication-report JSON only;
- deterministic `gutenberg-native-serialization-evidence-retention-requirements-validation-v1`, which rebuilds the current exact requirements manifest and rejects stale/tampered/extra/missing saved manifests using strict JSON-only, key-order-independent semantic comparison;
- Node-20 package command `p16:evidence-retention-requirements-validate`, which validates local document/profile/receipt/authentication-report/manifest JSON through that contract and writes only sanitized validation metadata;
- shared fail-closed local JSON I/O for both retention CLIs: every input is capped at 1 MiB before parse with a post-read byte-length recheck, must be a regular file, cannot be zero-byte/whitespace-only, and the normalized output path cannot collide with any input path;
- stable operator input snapshots: the initial path inspection stays ahead of content read, the opened handle must still match the inspected regular file before read, handle/path metadata is checked after read, and parsed `.value` is carried together with resolved/canonical path + read-time identity/metadata into output safety;
- immutable snapshot metadata: `P16OperatorJsonInputSnapshot` wrapper fields and nested read-time file metadata are TypeScript-readonly and runtime-frozen, preventing later mutation of resolved/canonical paths or captured dev/ino/size/time metadata used by output safety. Parsed `.value` is intentionally not deep-frozen, preserving current builder/validator behavior;
- output snapshot revalidation: the files actually read are checked again before temporary output creation and immediately before atomic rename. Observed post-read pathname replacement fails closed and temporary output state is cleaned before failure. Stable dev/ino identity is used when available; otherwise canonical path + size/mtime/ctime consistency is a bounded fallback rather than a perfect filesystem-race-elimination guarantee;
- output-parent snapshot revalidation: the canonical output directory is captured as a frozen path/dev/ino snapshot after creation/resolution, checked again before temp creation and immediately before final rename, and must still be a directory that self-resolves to the same canonical path. When stable identity existed at capture, the same dev/ino directory identity is required; otherwise the fallback is canonical-path/directory consistency only;
- output-destination state binding: the final output entry is captured before staging as `ABSENT` or frozen `EXISTING_REGULAR` canonical path/file metadata. Immediately before rename, it must still match that state; observed creation/replacement/removal/type change fails closed with `Output path changed during write.`, while overwrite of the same unchanged regular destination remains supported;
- non-recursive temp cleanup: after output-parent and temporary-directory snapshot checks, cleanup attempts only `rmdir`. Successful writes remove the now-empty owned temp directory after payload rename; failed/non-empty temp state is left untouched and may remain as a bounded orphan rather than recursively traversing a pathname whose ownership cannot be continuously proven;
- temporary-directory identity binding: the `mkdtemp` directory is captured and must remain a directory that self-resolves to the same path; it is revalidated before payload open, immediately after payload open, after payload write and immediately before final rename, with same dev/ino required where stable identity was captured;
- opened temporary payload binding: `payload.json` is created exclusively with `open(..., 'wx')`, the opened handle and current pathname must identify the same regular file before any content write, content is written through that `FileHandle`, a frozen post-write file snapshot is captured, and the source pathname must still match that snapshot before rename;
- iterative post-parse structural validation: container nesting is capped at 64 levels and total JSON values at 50,000 before target builders/validators execute;
- direct exact-current canonicalization independently enforces 64 container levels, 50,000 visited values and an aggregate 1 MiB UTF-8 text budget across string values + object keys for exported validator/fingerprint callers, so bypassing the operator CLI does not bypass complexity bounds;
- accessor-safe direct canonicalization: own property descriptors are read instead of invoking enumerable values through normal property access; enumerable object accessors and array-index accessors are rejected without getter/setter execution;
- strict own-shape direct canonicalization: plain objects reject own symbol properties and non-enumerable own string properties; arrays allow only standard `length` plus canonical own indices and reject extra named/symbol properties while frozen/sealed JSON-shaped data remains accepted;
- object-cardinality preflight: plain-object own string-property count must fit the remaining 50,000-value budget before descriptor scanning, UTF-8 key charging or sorting; root + 49,999 primitive properties is accepted while root + 50,000 rejects;
- prototype-safe canonicalization for the exact-current manifest validator: canonical objects use no `Object.prototype`, so own enumerable JSON keys including `__proto__` remain data fields, affect fingerprints and are rejected when added instead of being silently dropped;
- alias-safe output writes: canonical output is compared against the read snapshots, existing symlink/non-regular targets are rejected, hardlink identity against the files actually read is rejected where stable identity is available, output is staged in a unique same-directory regular temp file, and input/output-parent/output-destination/temp-directory/payload snapshots are revalidated before atomic rename.

The operator structural guard is iterative rather than recursive, so the guard itself does not create a recursion limit. It rejects byte-bounded but deeply nested or high-cardinality JSON before downstream validation/canonicalization. Stable read snapshots bind parsed content to the observed file and carry the same observation into output checks; their path/identity metadata is frozen after capture. Output-parent snapshots bind the final rename to the canonical directory that was safety-checked. Output-destination snapshots bind overwrite eligibility to the absent-or-existing regular entry observed before staging. Temporary-directory snapshots and the opened payload handle/file snapshot separately bind payload creation, content write and rename to the temp subtree actually observed. Path changes detected before/during/after read or before output rename fail closed. These checks narrow path-swap/TOCTOU ambiguity but do not claim perfect race elimination; a narrow final destination check→rename race remains without an OS-specific conditional-rename primitive, and metadata fallback is bounded where stable filesystem identity is unavailable.

The direct canonicalizer accepts depth 64 and exactly 50,000 total values, fails closed for 65 / 50,001, and caps aggregate UTF-8 text from object keys + string values at 1 MiB. Object-key bytes are charged before sorting. Browser-safe manual UTF-8 accounting covers ASCII, multi-byte Unicode, surrogate pairs and lone-surrogate replacement width. Accessor-backed properties fail closed without invoking caller-controlled getters/setters. Hidden JavaScript-only own state is rejected rather than omitted from fingerprints. Arrays and plain objects both preflight child cardinality against the remaining value budget; plain-object property count is rejected before descriptor/text/sort work. Frozen/sealed JSON-shaped data and own enumerable `__proto__` data keys remain canonicalized. Existing cycle, sparse-array, non-finite, non-JSON and non-plain-object rejection remains unchanged.

The output writer rejects a destination entry that is created, replaced, removed or changes type after its captured destination state and before the final checked rename boundary, so an observed late-created final symlink is not followed or silently accepted. Temporary payload content is written through an exclusively opened `FileHandle` after handle/path identity is verified, and the post-write payload snapshot is revalidated before rename. Temporary cleanup is never recursive: after parent/temp snapshot revalidation it attempts only `rmdir`; non-empty failed-path temp state is preserved rather than recursively deleting unproven contents. Focused tests cover symlink, hardlink and symlinked-parent aliases, stable input snapshots, post-read pathname replacement, runtime-frozen snapshot metadata, stable/replaced output-parent snapshots, absent/existing/replaced output-destination snapshots including inode-zero metadata fallback and unchanged-overwrite support, stable/replaced temp-directory snapshots, opened payload handle/path mismatch, post-write payload replacement, empty owned-temp removal and non-empty temp-content preservation.

Focused canonicalization regressions cover top-level and nested own `__proto__` additions, direct structural/text boundaries, accessor-backed values, strict own-property shape and exact object-cardinality boundaries, and confirm `Object.prototype` is not polluted. Validator version/schema/status are unchanged because the hardenings preserve the existing strict exact-current metadata contract.

Operator/input failures remain exit code 2 with deterministic content-free errors. Windows path comparison is case-normalized for output/input collision checks.

Validation CLI exit 0 means only `CURRENT_REQUIREMENTS_MANIFEST_VALID`; every rejection exits 2. Stdout is limited to output path, validation/current-requirements status, exactSemanticMatch and canonical expected/provided SHA-256 values. The supplied manifest payload is never echoed.

Validator outcomes remain `REJECTED_CURRENT_CHAIN_NOT_READY`, `REJECTED_REQUIREMENTS_MANIFEST_INVALID_OR_STALE`, or `CURRENT_REQUIREMENTS_MANIFEST_VALID`. VALID means only that the saved non-authorizing requirements metadata matches the current exact chain. It does not authenticate evidence, validate WordPress, or create an internal decision.

The retention requirements manifest/export/validator/validation CLI accepts no future evidence artifact, authenticator identity, authentication method, authenticated-at assertion or evidence PASS/FAIL; it does not authenticate evidence and does not make an internal decision. Export exit 0 still means only `EVIDENCE_RETENTION_REQUIREMENTS_READY` metadata.

It intentionally does not expose raw evidence references, source evidence-reference hashes, supplied manifest payloads or raw native Gutenberg post content in the written manifest, validator result or stdout.

Current P16 authority remains fixed:

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

Repository code still does not execute WordPress/PHP/`@wordpress/blocks`, connect to WordPress REST/site runtime, fetch/authenticate evidence, identify/verify an authenticator, validate signatures, prove target environment/editor/import/render behavior, map Figma semantics, transfer sections, or generate patterns/packages.

The normalized JSON serializer is not Gutenberg post-content serialization and the repository normalized model intentionally omits WordPress `innerContent`. Custom/unregistered/freeform content remains `REVIEW_REQUIRED`.

## Current repository state

Current verified main before this documentation sync:

`9d7718dd19d56c28a183023f347947bcdc3123c9`

Recent merge line:

- #452 output-destination state binding -> `f3306a3aba5b42544cbdabe950f975ce5ce338a9`;
- #454 canonical four-document status sync -> `b5e8f919156fb8dc75cab9bad418ce95c7e36f0a`;
- #456 read-only main PR-origin audit -> `1896ba5d576e6d33f693a2a5dc0a7fb09094d1d6`;
- #458 forced-update detection in the same audit -> `cd4e8394dfaa6917d28676e51eec831591b6b99a`;
- #460 README P0-P27 phase-status expansion -> `e2c446b162607767e55dfaa8705d5ac446c49734`;
- #462 bounded P15 neutral IR + deterministic local Elementor v0.4 Template JSON generation -> `673a366ad3da25c5d3a327ed87572bcdb2af408d`;
- #464 read-only selected-Figma-Frame extraction + plain `text-editor` mapping + depth/node fail-closed reviews -> `9d7718dd19d56c28a183023f347947bcdc3123c9`.

P12 remains at the retained **80%** release-exit state. Its publishing-authoritative historical candidate remains Final Release Artifact #20 from source `5f12b1d28146d5c2af815cc9f83eb30431dce4b5` with plugin ID `1680034649341961379`.

P17-P26 remain preflight-frozen / implementation-not-started. P27 #182 remains the final production-release gate. #287 remains the admin-level repository-protection residual.

## Next P13/P14 step

Keep #159 genuine Figma Desktop evidence as the prerequisite before real P14 mutation exposure. Any future P14 mutation surface requires separate explicit authorization with fresh evidence, candidate-only mutation, validation/re-score/source-immutability gates and fail-closed cleanup.

P15 may continue deterministic/read-only commercial-V1 generation, extraction and plugin UI/reporting integration while target compatibility, import/editor/render validation, production acceptance and download/transfer authority remain false. Any stronger authority-bearing decision still requires genuinely retained trusted evidence and a separate accepted decision path.

For P16, do not promote the requirements manifest/export/validator/validation CLI, stable immutable read-snapshot/file-bound/output-parent/temp-payload/non-recursive-cleanup guards, depth/value/text-bounded accessor/own-shape-safe prototype-safe direct canonicalization or any caller-supplied result into trusted evidence, authentication authority or an internal decision. The next authority-bearing step requires genuinely retained authenticated evidence first.