# Next Actions

Last updated: 2026-09-15

Runtime artifact preflight requires `config/runtime-artifacts.json` schema-v3 and must fail closed on stale or mismatched registered artifacts.

## Priority 1 — preserve P14 mutation boundary

P14 remains **CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED**.

- Keep #159 genuine Figma Desktop Build-Ready runtime/parity evidence as the prerequisite before real P14 mutation exposure.
- `PRODUCTION_P14_SAFE_RECIPE_REGISTRY` remains empty.
- Do not convert read-only review packets, candidate signals or persisted evidence into production mutation authority.
- Any future mutation surface requires explicit recipe authorization, fresh exact evidence, candidate-only mutation, validation/re-score/source-immutability gates and fail-closed cleanup.

## Priority 2 — P15 only where genuine trusted evidence permits

P15 remains **CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED**.

The current Elementor evidence chain supports exact candidate/profile/import/reference binding, offline operator intake, sanitized pre-decision review and externally reported authentication-result binding.

A caller-supplied/external PASS is not repository authentication. A stronger P15 internal decision requires genuine retained trusted evidence and a separate explicit decision path.

## Parallel P16 state — bounded code-side foundation complete through early direct object-cardinality preflight

Classification: **CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED** with `N/A` progress.

Current implemented P16 chain:

- PR #346 — normalized parsed-block contract + documented-core capability reporting;
- PR #350 — immutable declared target profile + deterministic SHA-256 fingerprint;
- PR #352 — profile-bound normalized assessment;
- PR #356 — deterministic normalized candidate;
- PR #358 — exact canonical candidate SHA-256 identity;
- PR #360 — exact-bound external native-serialization PASS/FAIL receipt contract;
- PR #364 — Node-20 offline exact-bound native-serialization evidence intake;
- PR #366 — sanitized native-serialization pre-decision review packet;
- PR #370 — exact-bound externally reported native evidence authentication binding;
- PR #374 — exact-bound native decision-prerequisite packet;
- PR #376 — canonical decision-prerequisite docs sync;
- PR #378 — exact-bound genuine-evidence retention requirements manifest;
- PR #380 — canonical retention-requirements docs sync;
- PR #382 — offline/operator retention-requirements export command;
- PR #384 — canonical operator-export docs sync;
- PR #386 — exact-current strict-JSON retention-requirements manifest validator;
- PR #388 — canonical manifest-validator docs sync;
- PR #390 — offline/operator exact-current retention-manifest validation CLI;
- PR #392 — canonical validation-CLI docs sync;
- PR #394 — shared bounded local JSON I/O hardening for both retention operator CLIs;
- PR #396 — canonical file-bound-hardening docs sync;
- PR #398 — prototype-safe exact-current retention-manifest canonicalization;
- PR #400 — canonical prototype-safe-canonicalization docs sync;
- PR #402 — alias-safe atomic output writer for both retention operator CLIs;
- PR #404 — canonical alias-safe-output docs sync;
- PR #406 — iterative post-parse JSON structural bounds for both retention operator CLIs;
- PR #408 — canonical JSON-structure-bounds docs sync;
- PR #410 — direct retention-manifest canonicalization depth/value bounds independent of CLI guards;
- PR #412 — canonical direct-canonicalization-bounds docs sync;
- PR #414 — direct aggregate UTF-8 text-byte bound across canonical object keys and string values;
- PR #416 — canonical direct-canonical-text docs sync;
- PR #418 — accessor-safe direct canonicalization using own data descriptors without invoking getters/setters;
- PR #420 — canonical accessor-safe-canonicalization docs sync;
- PR #422 — strict own-property shape validation for direct canonicalization;
- PR #424 — canonical strict-own-property docs sync;
- PR #426 — direct plain-object cardinality preflight before descriptor/text/sort work.

Current progression is intentionally bounded:

`normalized document/profile -> READY candidate -> exact identity -> external receipt -> offline revalidation -> pre-decision packet -> REPORTED_PASS_AUTHENTICATION_REQUIRED -> external authentication report -> EXTERNALLY_REPORTED_PASS|FAIL -> decision prerequisite -> GENUINE_AUTHENTICATION_EVIDENCE_REQUIRED -> retention requirements manifest/export -> exact-current manifest validation/CLI -> genuinely retained authenticated evidence -> separate internal decision`

Both `p16:evidence-retention-requirements` and `p16:evidence-retention-requirements-validate` use the same fail-closed local JSON I/O guard:

- each JSON input is capped at 1 MiB before parse, with a post-read byte-length recheck;
- each input must be a regular file;
- zero-byte and whitespace-only inputs are rejected;
- after parse, container nesting is capped at 64 levels;
- after parse, total JSON values visited are capped at 50,000;
- structural traversal is iterative, not recursive, and over-limit input is rejected before target builders/validators execute;
- the normalized output path must not collide with any input path;
- Windows path comparison is case-normalized for collision checks;
- operator/input failures remain exit code 2 with deterministic content-free errors.

Their shared output writer additionally:

- creates the requested output parent directory, then resolves that parent through `realpath` before final target checks;
- compares the canonical output location against real input paths;
- rejects existing output symlinks and other non-regular output targets;
- rejects an existing output regular file that shares filesystem identity (`dev` + `ino`) with an input when identity is available;
- writes through a unique same-directory temporary regular file and atomically renames it into place, so a late-created final symlink is replaced rather than followed;
- removes temporary output state before fail-closed exit on write errors;
- preserves source-input bytes in rejected symlink/hardlink/parent-alias cases covered by focused tests.

The exact-current requirements-manifest canonicalizer is independently depth/value/text bounded, accessor-safe, strict-own-shape, object-cardinality-preflighted and prototype-safe:

- direct validator/fingerprint callers are capped at 64 nested container levels and 50,000 total visited values even when the CLI is bypassed;
- aggregate UTF-8 text across JSON string values + object keys is capped at 1 MiB;
- object-key text is charged before lexical sorting;
- browser-safe manual UTF-8 accounting covers ASCII, multi-byte Unicode, surrogate pairs and lone-surrogate replacement width and stops once the remaining budget is exceeded;
- own property descriptors are inspected instead of reading values through ordinary property access;
- object/array accessors fail closed without invoking caller-controlled getters/setters;
- plain objects reject own symbol properties and non-enumerable own string properties;
- arrays allow only standard `length` plus canonical own indices, reject extra named/symbol properties, preserve sparse-array rejection, and fail early when length cannot fit the remaining value budget;
- plain objects compare own string-property count with the remaining value budget before descriptor scanning, UTF-8 key charging or sorting; root + 49,999 primitive properties is accepted while root + 50,000 rejects;
- frozen/sealed JSON-shaped values remain acceptable because writable/configurable flags are not semantic authority inputs;
- normal own data descriptors remain supported, including own enumerable `__proto__` data keys;
- canonical object snapshots use `Object.create(null)`;
- own enumerable JSON keys such as `__proto__` remain data fields instead of invoking the legacy prototype setter;
- hostile top-level or nested `__proto__` additions therefore change the canonical fingerprint and are rejected as extra/stale fields;
- cycle, sparse-array, non-finite, non-JSON and non-plain-object rejection remains unchanged;
- validator version/schema/status remain unchanged because these are hardening of the existing exact-current metadata contract.

`p16:evidence-retention-requirements-validate` additionally:

- accepts only local document/profile/receipt/authentication-report/manifest JSON plus optional output path;
- invokes the strict-JSON exact-current requirements-manifest validator;
- writes only the sanitized validation result;
- returns exit 0 only for `CURRENT_REQUIREMENTS_MANIFEST_VALID`, otherwise exit 2;
- prints only output path, validation/current-requirements status, exactSemanticMatch and canonical expected/provided SHA-256 values;
- rejects unsupported, duplicate and missing options fail closed;
- never echoes the supplied manifest payload, raw evidence reference, source evidence-reference hash or native Gutenberg post content;
- accepts no future evidence artifact, authenticator identity, authentication method, authenticated-at assertion or evidence PASS/FAIL;
- performs no evidence authentication, WordPress validation or internal decision.

### Authority stop line

Do **not** implement a stronger P16 authority-bearing intake/decision merely by adding another caller-supplied result flag. The next authority-bearing progression requires genuinely retained authenticated evidence that satisfies the requirements profile, plus a separate explicit internal-decision contract/review.

Until such genuine evidence exists, keep these facts true:

- custom/unregistered/freeform blocks remain `REVIEW_REQUIRED`;
- normalized JSON is review evidence, not Gutenberg post-content serialization;
- repository model intentionally omits WordPress `innerContent`;
- declared target profile is intended-target evidence only;
- `PROFILE_ALIGNED_NATIVE_VALIDATION_PENDING` is metadata/profile alignment only;
- `EXTERNALLY_REPORTED_PASS` is caller-supplied authentication reporting only;
- `GENUINE_AUTHENTICATION_EVIDENCE_REQUIRED` is not authentication authority;
- `EVIDENCE_RETENTION_REQUIREMENTS_READY` is requirements metadata only;
- `CURRENT_REQUIREMENTS_MANIFEST_VALID` is exact-current metadata validation only;
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

### Safe code-only work while genuine evidence is absent

Only deterministic/read-only/supporting work remains unblocked, such as further serialization/sanitization hardening or additional rejection tests. Such work must not accept evidence as trusted, assert authentication, connect to WordPress, claim compatibility or enable generation/download.

## Roadmap state

- P12 — IN PROGRESS / 80%; historical publishing candidate remains Final Release Artifact #20;
- P13 — IMPLEMENTATION COMPLETE / RUNTIME ACCEPTANCE PENDING (#159);
- P14 — CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED;
- P15 — CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED;
- P16 — CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED;
- P17-P26 — PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED;
- P27 — GATE DEFINED / EXECUTION DEFERRED (#182).

Future dependency order remains P14 -> R0/R1 as needed -> P15 only where genuine evidence permits -> bounded P16 support until genuine evidence exists -> P17 -> P18 -> P19 -> P20 -> P21 -> P22 -> P23 -> P24 -> P25 -> P26 -> P27.

## Latest retained proof

- #374 -> `6dc86dfc900244616869e5ff289c3afa815a1d2d`; corrected exact head `4560a7d9fdfaac79369bba1f5dc05b0897eeb9a9`; CI #1147, Final Release #458, Offline #502 PASS;
- #376 docs sync -> `31080f673102206e6e6ae41801569d62e2eb7512`; exact head `e05e6e366626f43e99d6745dddbdc9d87c348f93`; CI #1149, Integration #419, Final Release #460, Offline #504 PASS;
- #378 retention requirements -> `2d7c9e76eb293b8914dd1106c262064013d70b11`; exact head `8ffee524268d2fb1aac0a1dfefffd63014590d88`; CI #1151, Final Release #462, Offline #506 PASS;
- #380 docs sync -> `c6f6009538e1e0f82bed087783f2c55fa0d9e75d`; corrected exact head `c64a3cd5936fcc2c0d055fe7810a6cf574003da9`; CI #1155, Integration #424, Final Release #466, Offline #510 PASS;
- #382 requirements export -> `e2fe19364ac8615bc390f125c2afb4085bfc474c`; exact head `0626987afe962f54a7a89996219e12cf57744bc4`; CI #1157, Final Release #468, Offline #512 PASS;
- #384 docs sync -> `4c91cb3033672d6dc3a6fa28287e060a22e40734`; exact head `919df37267b195516f1b98dfd744502b58ecfe66`; CI #1159, Integration #427, Final Release #470, Offline #514 PASS;
- #386 manifest validator -> `1532fa54ec9c26bb8904ca939a01754418a70602`; exact head `dd5d1a9674e9e4fbc86fe11b040a4c9f04d0bb68`; CI #1162, Final Release #473, Offline #517 PASS;
- #388 docs sync -> `d7532a98b71e5dc5ac6c100b0386f06422966cf9`; exact head `83d76c7f91e66d6ffdff8b141b3ffa2338d30a27`; CI #1164, Integration #430, Final Release #475, Offline #519 PASS;
- #390 validation CLI -> `c173c617ad205f0fef4a5659f27bf007067e6eb5`; exact head `7fcd4b553830527ab5900355663c3412a63780bc`; CI #1166, Final Release #477, Offline #521 PASS;
- #392 docs sync -> `78f25d0cbc72427ea9824370762099db916750ed`; exact head `65d74941faa01a585e984d9d3b53c6932a864546`; CI #1168, Integration #433, Final Release #479, Offline #523 PASS;
- #394 local-file hardening -> `19d36b87b71cdc0d8b8f862c733420d64a56d3d2`; exact head `adbdfa0da1f61d4b9ff2dab3272526c36b19c3e4`; CI #1170, Final Release #481, Offline #525 PASS;
- #396 docs sync -> `12dc1e7e7e149e4da51a13c14722ac834f8a69ca`; exact head `6ac64e15f1c5fca058983a9a33ba4b9ab519a8d5`; CI #1172, Integration #436, Final Release #483, Offline #527 PASS;
- #398 prototype-safe canonicalization -> `4ec559f538899697d51138fc35ed79c2bea486b1`; exact head `b7f3eead07fd9305d9b2f9290a572c715466e981`; CI #1174, Final Release #485, Offline #529 PASS;
- #400 docs sync -> `158132b4076fe5a70afa8e8778ae888fcca4db60`; exact head `b6cfb1922429f48e69e40d6a8c270454d10c99a2`; CI #1176, Integration #439, Final Release #487, Offline #531 PASS;
- #402 alias-safe atomic output writes -> `8445fc0632a58515a52d72e3cf85ed1364761b9c`; exact head `039f45aaf95571828b38dfc661a41dd2bcc62dc0`; CI #1178, Final Release #489, Offline #533 PASS;
- #404 docs sync -> `4f66522ae9d8dc6fb82875b32634306918ed0a9a`; exact head `4917d79bad91086a5262b99f16091e3eff14c647`; CI #1180, Integration #442, Final Release #491, Offline #535 PASS;
- #406 JSON structural bounds -> `5feb04adcd6aaca2079b749d495e22e1da6f6671`; exact head `42c26747e6609cb4c890174baa5627a4e000e889`; CI #1182, Final Release #493, Offline #537 PASS;
- #408 docs sync -> `ab8cb5e783b14688180959017aa79b9a86adfa66`; exact head `8c984f124a5b22a5c05cb15527e1cf468b0ff772`; CI #1184, Integration #445, Final Release #495, Offline #539 PASS;
- #410 direct canonicalization bounds -> `cb4de36d4922b31b1e278d4f55426d042736549b`; exact head `c3ef7329d430c3e450a8b8e4292a5293eace8865`; CI #1186, Final Release #497, Offline #541 PASS;
- #412 docs sync -> `1a7cb4b7692a0361d645ddf1396f6aac561ad093`; exact head `edd6b0166ed9184dde5168614f2b311cd62062b6`; CI #1188, Integration #448, Final Release #499, Offline #543 PASS;
- #414 direct canonical text-byte bounds -> `86cc545456a1f994c9893069b878110662a60bbe`; exact head `6c92b2dd6707be8a7242bf1911cdb46c3ff4972a`; CI #1190, Final Release #501, Offline #545 PASS;
- #416 docs sync -> `5b0d3e9f08122c4df7cb29edfd0e51dabb8de440`; exact head `b463984615d3d1c78d872ee8e3ea85390093ca8f`; CI #1192, Integration #451, Final Release #503, Offline #547 PASS;
- #418 accessor-safe direct canonicalization -> `4adc40d74b74f74f362cb635854dd2c8240134d8`; exact head `7038cd7434dc4da03c3c0e590a4c927a47e8b7f7`; CI #1194, Final Release #505, Offline #549 PASS;
- #420 docs sync -> `b89dbba01dd85fc84d53761190581a2ab93ba8f0`; exact head `027b59c704fb8181c75df24e4e0f0487a49caeb5`; CI #1196, Integration #454, Final Release #507, Offline #551 PASS;
- #422 strict own-property canonicalization -> `29285d205a61cc437e446367b3d8fefc52595e1d`; exact head `5c7256666b690533a1821cf4c087cbaa7963c47d`; CI #1198, Final Release #509, Offline #553 PASS;
- #424 docs sync -> `61ba4dc5b456a588383ed0169045387e0fc51482`; exact head `56cdf6d1314dcb59764a6c652e2d31a10fca297e`; CI #1200, Integration #457, Final Release #511, Offline #555 PASS;
- #426 object-cardinality preflight -> `06cdd845e46613541f555cc0de59237d261c1fa3`; exact head `03c41d0c4b6880038e24a1f35c854401c0223fee`; CI #1202, Final Release #513, Offline #557 PASS.

## Current guardrails

1. No synthetic overall project percentage.
2. P12 retained release truth remains 80%; later implementation commits do not silently replace its publishing candidate.
3. P14 real mutation remains blocked until #159 plus separate mutation authorization.
4. P15/P16 caller-supplied evidence and external authentication reports remain non-authorizing until genuinely retained trusted evidence plus a separate explicit internal decision exists.
5. No raw evidence references, source evidence-reference hashes, raw global values, raw asset URLs, supplied manifest payloads or raw native Gutenberg post content should leak into sanitized review/decision/requirements/export/validation artifacts.
6. No Figma-to-Elementor/Gutenberg semantic generator or section transfer is accepted yet.
7. No WordPress target-environment/editor/import/render validation is accepted for P16 yet.
8. #287 remains an admin-level repository protection residual until branch rules are actually enabled.
9. P27 owns final production release and deferred live P12 evidence closure.