# Changelog

## 2026-09-20 — P15 raw-template pathname hardening (#601)

- Security audit found that the intentional unbounded raw Elementor-template reader still used pathname `stat()` and could follow an operator-supplied symbolic link even though the main P15/P16 operator JSON boundary had already moved to non-symlink `lstat()` checks.
- The raw-template reader now requires the supplied pathname itself to remain a regular non-symlink file before open, before read and after read, while preserving opened-handle identity/metadata, canonical-path and exact raw-byte SHA-256 checks.
- Direct regressions cover stable regular-file intake, initial symlink rejection and unchanged strict JSON parsing.
- The template resource-policy contract is intentionally unchanged: this issue does not add a generic byte/depth/value ceiling or any product authority.


## 2026-09-20 — P15 security-bounded responsive Container z-index

- Continued issue #599 after merged PR #598 / issue #597 as the next independently evidenced responsive slice.
- Exact Elementor `4.2.4` Container blob `3486766b9565af99536ae205ed1936bb155daed0` registers responsive `z_index` as NUMBER with minimum `0`; Controls Stack blob `00b280e518b89925c8f85a059b34136177ff3d4d` anchors default responsive suffixing. Exact Container Playwright blob `1cdbc387887abea49d4e8477b1b3a684c5149c9e` uses numeric `z_index=50`, and responsive-number fixture blob `20f71a3e127ac3806446c95b313abff01e4b97c2` retains tablet/mobile z-index lineage.
- The resolver accepts only explicit integer values `0..9999` for `z_index_tablet` / `z_index_mobile`; the upper bound is a deliberate repository safety cap rather than a claim that Elementor imposes that maximum.
- Strings/CSS expressions, negative/fractional/non-finite/out-of-range values, stale bindings, conflicts and authority inflation fail closed. Desktop `z_index` remains untouched and sanitized summaries exclude source/template/candidate content.


## 2026-09-20 — P15 condition-bound responsive Container boxed width

- Continued issue #597 as the next independently evidenced responsive slice after merged PR #596 / issue #595.
- Exact Elementor `4.2.4` Container blob `3486766b9565af99536ae205ed1936bb155daed0` defines `content_width` default `boxed`, conditions responsive `boxed_width` on that value and defines the shared px Slider range `500..1600`. Controls Stack blob `00b280e518b89925c8f85a059b34136177ff3d4d`, Slider blob `f56798bd5e0a2bee5a7c3a7771ecbaf2af87fb7f` and exact converter fixture blob `27c8d0eadae77a9c4e33258111829f47ed9e217b` anchor suffixes/value shape/persisted tablet-mobile keys.
- The resolver accepts only explicit integer px `500..1600` for `boxed_width_tablet` / `boxed_width_mobile`; desktop `content_width` / `boxed_width` remain untouched and omitted breakpoints stay absent.
- The exact condition is fail-closed: a generated target with omitted `content_width` uses Elementor's documented `boxed` default, explicit `boxed` is accepted, and any future explicit non-boxed value blocks the override.
- Percent/vw/em/rem/custom/CSS strings, expressions, fractional/non-finite/out-of-range values and authority inflation fail closed. Sanitized summaries omit source content/template/candidate bytes.


## 2026-09-20 — P15 security-bounded responsive Container min-height

- Continued issue #595 as the next independently evidenced responsive slice after Container margin and the P15 operator-input symlink hardening.
- Exact Elementor `4.2.4` Container blob `3486766b9565af99536ae205ed1936bb155daed0` registers responsive `min_height` as a Slider with px max `1440`; Controls Stack blob `00b280e518b89925c8f85a059b34136177ff3d4d`, Slider blob `f56798bd5e0a2bee5a7c3a7771ecbaf2af87fb7f` and exact converter fixture blob `27c8d0eadae77a9c4e33258111829f47ed9e217b` lock the setting names and persisted Slider shape.
- The resolver accepts only explicit integer px values `0..1440` for `min_height_tablet` / `min_height_mobile`; desktop min-height is untouched and omitted breakpoints remain absent.
- `vh`, `em`, `rem`, custom/CSS strings, expressions, negative/fractional/non-finite/out-of-range values and unknown fields fail closed.
- Exact source/base-candidate binding, generator structural binding, existing-override conflict rejection and false authority flags remain mandatory. Sanitized summaries omit source content/template/candidate bytes.


## 2026-09-20 — P15 operator-input symlink hardening (#593)

- Security audit found an inconsistent filesystem boundary: P16 operator JSON intake rejected symlink path entries, while the shared P15 operator intake followed them before applying canonical-path/file-identity/content-digest checks.
- P15 pathname observations now use `lstat()` and require a regular non-symlink file before open, around the read, and during later snapshot/content-digest revalidation.
- Initial symlink inputs and post-read pathname replacement with a symlink fail closed before report commit; existing strict UTF-8, byte/depth/value limits, canonical-path binding, file metadata/identity checks and SHA-256 revalidation remain in force.
- No evidence schema, product authority, network behavior or compatibility/production claim changes.


## 2026-09-20 — P15 bounded responsive Container margin

- Continued issue #591 through PR #592 as the next independently evidenced responsive slice after Button alignment.
- Exact Elementor `4.2.4` Container blob `3486766b9565af99536ae205ed1936bb155daed0` registers `margin` as responsive `DIMENSIONS`; Controls Stack blob `00b280e518b89925c8f85a059b34136177ff3d4d` establishes `margin_tablet` / `margin_mobile`, and Dimensions blob `7de34809d407e5fa208935b77a6b6648c72d3c5d` locks the four-side value shape.
- The resolver is exact neutral-source + base-candidate bound and writes only explicit default-breakpoint margin keys for existing Container IDs.
- Security boundary is intentionally narrower than Elementor's full control: only finite non-negative px numbers up to the existing neutral spacing maximum are accepted; negative margins, CSS strings, custom units, expressions and unit conversion fail closed. `isLinked` is derived from side equality.
- Sanitized summaries omit source copy, template JSON and candidate bytes. No responsive inference, custom breakpoints, compatibility, production, generation/download, transfer, Figma mutation or network authority is introduced.


## 2026-09-20 — P15 exact responsive Button alignment

- Continued issue #589 through PR #590 after #588 normalized Button desktop alignment into the exact Elementor target vocabulary.
- Exact Elementor `4.2.4` Button Trait blob `31192aaee6851c445f79d1998499f6ce73ba7da5` registers responsive `align` with target values `left|center|right|justify`; the retained Controls Stack suffix contract establishes `align_tablet` / `align_mobile`.
- Added an exact neutral-source + base-candidate-bound manifest for existing neutral Button source IDs only; stale source/candidate bindings, duplicate/non-Button IDs, malformed values, existing override conflicts and generator binding drift fail closed.
- Normalized desktop Button `align` from #588 is preserved exactly; only explicitly supplied default tablet/mobile keys are written and omitted breakpoints remain absent.
- Sanitized summaries omit source copy, template JSON and candidate bytes. No responsive inference, custom breakpoints, responsive closure, compatibility, production, generation/download, transfer, Figma mutation or network authority is introduced.


## 2026-09-20 — P15 Button target-alignment vocabulary correction

- Follow-up audit while preparing responsive Button work found that exact Elementor `4.2.4` Button Trait blob `31192aaee6851c445f79d1998499f6ce73ba7da5` accepts Button `align` values `left|center|right|justify`, while the current generator emitted neutral `start|end` directly.
- Issue #587 / PR #588 corrects the deterministic desktop candidate mapping to neutral `start → left`, `center → center`, `end → right`.
- Generator contract version advances from `p15-elementor-v3-template-generator-v2` to `...-v3` because target bytes/semantics change for aligned Button nodes.
- Heading/Text mapping remains unchanged because their exact Elementor `4.2.4` controls natively accept logical `start|center|end` values.
- Regression coverage locks the exact Button Trait evidence and prevents generated Button settings from retaining unsupported `start` / `end` values.
- Responsive Button overrides remain a separate future bounded slice; this correction adds no responsive closure, compatibility, production, generation/download or transfer authority.


## 2026-09-20 — P15 exact responsive Heading/Text alignment

- Continued issue #585 through PR #586 as the next independently evidenced bounded responsive slice after container border radius.
- Verified exact Elementor `4.2.4` source: Heading blob `5b193f958ba34d8d4a24d165a9114f9bc3ef2561` and Text Editor blob `72ff868493a3c0f27c6305794ffcff9cf217c9ea` both register `align` through `add_responsive_control`; Controls Stack blob `00b280e518b89925c8f85a059b34136177ff3d4d` establishes default non-desktop `<id>_<device>` naming.
- Added an exact neutral-source fingerprint + exact base-candidate identity manifest for explicit `tabletAlign` / `mobileAlign` on existing neutral Heading/Text nodes.
- Heading accepts only its neutral `start|center|end`; Text additionally accepts `justify`. Button is intentionally excluded pending separate exact trait-level evidence.
- The resolver lockstep-binds the review-free neutral tree to generated core widgets, validates widget type and desktop alignment before applying only `align_tablet` / `align_mobile`, preserves desktop `align`, and leaves omitted breakpoints absent.
- Stale source/candidate bindings, duplicates, non-text nodes, invalid values, structural/widget drift, existing-key conflicts and authority inflation fail closed.
- Sanitized summaries omit source copy, template JSON and candidate bytes. No semantic/responsive inference, custom breakpoints, responsive closure, compatibility, production, generation/download, transfer, Figma mutation or network authority is introduced.


## 2026-09-20 — P15 exact responsive container border-radius overrides

- Continued issue #581 through PR #582 as the next independently evidenced bounded responsive container slice after wrap-conditioned align-content.
- Verified exact Elementor `4.2.4` source: Container registers `border_radius` through `add_responsive_control` in blob `3486766b9565af99536ae205ed1936bb155daed0`, while Controls Stack blob `00b280e518b89925c8f85a059b34136177ff3d4d` derives non-desktop responsive names as `<id>_<device>`, establishing `border_radius_tablet` / `border_radius_mobile` for the default profile.
- Added an exact neutral-source fingerprint + exact base-candidate identity manifest for explicit uniform integer px `tabletCornerRadiusPx` / `mobileCornerRadiusPx` on existing neutral containers.
- Desktop `border_radius` remains unchanged; requested breakpoint values map only to linked px DIMENSIONS objects, zero is retained as a real override, and omitted breakpoints remain absent with no inheritance synthesis.
- Stale source/candidate bindings, duplicates, non-container IDs, empty/unknown entries, fractional/non-finite/negative/out-of-range values, generator drift, existing-key conflicts and authority inflation fail closed.
- Sanitized summaries omit source text, template JSON and candidate bytes. No custom breakpoints, responsive inference/closure, target compatibility, production, generation/download, transfer, Figma mutation or network authority is introduced.


## 2026-09-20 — P15 generated proof-token log masking (#583)

- Follow-up log audit found that #580 removed token-bearing bridge payloads and sanitized retained artifacts, but the generated `P15_PROOF_TOKEN` still appeared in GitHub Actions step environment logging after persistence through `$GITHUB_ENV`.
- The proof workflow now generates the token into a shell-local variable, registers the exact value with GitHub Actions `::add-mask::`, and only then persists it to `$GITHUB_ENV`.
- Existing exact-loopback token routing and pre-upload artifact redaction/absence verification remain mandatory.
- Added a regression contract that locks generation → mask → environment-persistence ordering and rejects the previous direct generated-token persistence pattern.
- This change affects credential handling only; no target compatibility, production, generation/download, transfer or acceptance authority changes.


## 2026-09-20 — Security boundary hardening (#579)

- deep-audited current repository trust boundaries after P15 #578, including CI permissions/action pinning, Figma REST credential/response handling, operator filesystem I/O, disposable WordPress/Elementor proof endpoints and retained proof artifacts;
- bound the P15 browser proof token to exact controlled loopback origins `http://127.0.0.1:8080` and `http://127.0.0.1:8082` before any token-bearing navigation;
- stopped the disposable proof bridge from reflecting token-bearing render/login URLs and added pre-upload retained-artifact token redaction plus a fail-closed absence check;
- removed pre-rename destination unlinking from shared CLI/script atomic output writers so supported replacement uses a direct same-directory rename without an unlink/rename race gap;
- changed the main P10 CLI parser from duplicate-option last-write-wins behavior to deterministic `DUPLICATE_OPTION` rejection;
- added security regression contracts for proof-token containment, output replacement and duplicate CLI options;
- repository-admin main branch/ruleset enforcement remains separately tracked in #287 and is not claimed fixed by repository code.


## 2026-09-20 — P15 wrap-conditioned responsive container align-content

- Continued issue #577 through draft PR #578 after #576 established exact default-breakpoint wrap overrides.
- Verified exact Elementor `4.2.4` evidence: `align_content` is responsive and source-conditioned on `wrap=wrap`; exact QUnit fixture blob `f06c5f60afa8fbef34ed922af419284cece09692` exposes `container_align_content_tablet` / `container_align_content_mobile` and the six accepted values.
- Added a composition resolver that first runs the exact #576 wrap contract, then binds a separate align-content manifest to the neutral-source fingerprint plus exact wrapped-candidate identity.
- Every requested tablet/mobile align-content value requires explicit `wrap` for the same container and breakpoint. Missing wrap or `nowrap` rejects; inheritance is never synthesized and wrap is never promoted implicitly.
- Desktop `container_align_content` is preserved. Only requested tablet/mobile keys are written, with stale source/wrapped-candidate bindings, malformed/duplicate/non-container entries, invalid values, generator drift, conflicts and authority inflation failing closed.
- Sanitized summaries omit source text, template JSON and candidate bytes. No custom breakpoints, responsive closure, target compatibility, production, generation/download, network or Figma-mutation authority is introduced.

## 2026-09-20 — P15 exact responsive container wrap overrides

- Continued issue #575 through draft PR #576 as the fifth bounded responsive container slice after direction, linked-px gap, flex alignment and px padding.
- Verified exact Elementor `4.2.4` evidence: `includes/controls/groups/flex-container.php` marks `wrap` responsive, while exact QUnit container fixture blob `f06c5f60afa8fbef34ed922af419284cece09692` exposes `flex_wrap_tablet` and `flex_wrap_mobile`.
- Added a versioned source-IR + exact base-candidate-bound manifest for explicit `tabletWrap` / `mobileWrap`. This slice accepts only current source-level `nowrap` / `wrap`; `wrap-reverse` is deliberately not broadened from fixture-only shape.
- Desktop `flex_wrap` remains untouched, only explicitly requested default-breakpoint keys are written, and omitted breakpoints remain absent with no inheritance synthesis.
- Stale source/candidate bindings, duplicate/non-container/empty/unknown entries, unsupported values, generator drift, existing-key conflicts and authority inflation fail closed. Sanitized summaries omit source text, template JSON and candidate bytes.
- No geometry/viewport/layer-name inference, custom breakpoints, `align_content` coupling, responsive closure, target compatibility, production, generation/download, network or Figma mutation authority is introduced.

## 2026-09-20 — P15 exact-bound managed-media internal decision contract

- Continued issue #573 through draft PR #574 after the exact #570 internal-review prerequisite and #572 controlled cross-target portability proof.
- Added versioned `elementor-target-managed-media-internal-decision-v1` plus a sanitized intake CLI. It recomputes `READY_FOR_INTERNAL_REVIEW`, revalidates `CONTROLLED_CROSS_TARGET_MEDIA_PORTABILITY_PASS`, then validates only an explicit operator-supplied bounded APPROVE / REJECT / DEFER record.
- Decision records are exact-bound to candidate identity, TargetProfile fingerprint, deterministic review-prerequisite SHA-256, exact consumed portability-evidence SHA-256, exported-template SHA-256 and retained evidence-reference SHA-256. The opaque decision reference is emitted only as SHA-256.
- Stale profile/candidate/evidence/export bindings, changed portability bytes, pre-evidence decision timestamps, malformed references and authority-boundary inflation fail closed. Sanitized output omits raw evidence references, raw media URLs, exported template content, filesystem paths and numeric attachment IDs.
- Synthetic tests exercise all outcomes, including bounded APPROVE, but repository/CI/runtime does not create a real approval. The retained runtime evidence remains `internalDecisionStatus=NOT_RUN` until a separate explicit operator record is supplied.
- A valid explicit APPROVE can set only the bounded asset-reference closure claim for the exact reviewed chain. Global reference closure, arbitrary-host/general media portability, attachment-ID portability, target compatibility, production acceptance, generation and download authority remain false.

## 2026-09-20 — P15 controlled cross-target managed-media portability

- Continued issue #571 through draft PR #572 after the exact `READY_FOR_INTERNAL_REVIEW` prerequisite in #570.
- Added versioned `elementor-target-managed-media-portability-evidence-v1` plus a sanitized intake that recomputes the existing managed-media review prerequisite from the exact candidate/TargetProfile/asset-proof/integrity inputs before considering portability.
- The disposable real-target harness now keeps Target A on WordPress `6.8` + Elementor `4.2.4`, exports the already-imported asset template through Elementor's real local-template export path only after managed-media/source-provenance/content-integrity checks, SHA-256 binds the exact exported JSON bytes, and keeps those raw bytes under the runner temporary directory rather than uploaded proof artifacts.
- A fresh second WordPress `6.8` + Elementor `4.2.4` target is provisioned with a separate database and site URL. It must import those exact Target-A JSON bytes through Elementor's real local-template import path, prove the imported image source provenance matches Target A's managed-media URL fingerprint, create a distinct Target-B-local managed-media URL, preserve canonical PNG digest `sha256:65cbaae5caf987301a644dbad6b783476a2e39b2980425a0c57a6505a1c7e5a8` with `image/png` and positive dimensions, and render/load that Target-B media.
- Stale/tampered export bytes, TargetProfile/prerequisite replay, Target-A media identity reused as Target-B identity, canonical file-digest mismatch and authority inflation fail closed. Retained intake output contains hashes/fingerprints/version metadata only; it omits raw Target-A media URLs, filesystem paths and numeric attachment IDs.
- `CONTROLLED_CROSS_TARGET_MEDIA_PORTABILITY_PASS` is bounded to these exact disposable targets/versions and does not establish arbitrary-host portability, portable attachment IDs, general media-library compatibility, P19 expansion or an internal closure decision. `internalDecisionStatus=NOT_RUN`, reference/asset closure false, compatibility/production false and generation/download false remain mandatory.

## 2026-09-20 — P15 target-managed media internal-review prerequisite

- Continued issue #569 through PR #570 after observed asset-reference evidence (#566) and canonical imported-file integrity (#568).
- Added deterministic `elementor-target-managed-media-review-prerequisite-v1`, recomputed directly from the exact candidate, TargetProfile, asset proof and integrity evidence rather than trusting prior report files.
- `READY_FOR_INTERNAL_REVIEW` requires exact `OBSERVED_ASSET_EVIDENCE_BOUND` plus exact `TARGET_MANAGED_CONTENT_INTEGRITY_PASS`, then cross-binds candidate identity, TargetProfile fingerprint, reference-review identity, observed target and retained evidence-reference SHA-256.
- The sanitized prerequisite retains canonical proof/evidence hashes, URL fingerprints, canonical source/target file digests, MIME and bounded dimensions while omitting raw asset URLs, raw evidence-reference text, filesystem paths and numeric attachment IDs.
- Readiness does not perform the internal decision: `internalDecisionStatus=NOT_RUN`, `referenceClosureClaim=false`, `assetReferenceClosureClaim=false`, authentication/acceptance authority false, target compatibility/production false and generation/download false remain mandatory.
- The real Elementor proof workflow now requires this review prerequisite after the existing observed-reference and content-integrity gates. Durable media portability and any actual internal closure decision remain separate future evidence/decision work.

## 2026-09-19 — P15 target-managed media content-integrity evidence

- Continued issue #567 through PR #568 after the controlled managed-media observation (#564) and sanitized observed-reference binding (#566).
- Added `elementor-target-managed-media-integrity-evidence-v1` plus a bounded intake CLI.
- The disposable target bridge now observes the imported attachment original file without exposing its path or numeric attachment ID: attachment post type, file existence, exact SHA-256, MIME and image dimensions only.
- The workflow hashes the exact controlled PNG fixture before import and asserts it equals canonical digest `sha256:65cbaae5caf987301a644dbad6b783476a2e39b2980425a0c57a6505a1c7e5a8`. `TARGET_MANAGED_CONTENT_INTEGRITY_PASS` requires a valid exact `ASSET_BOUND_FULL_PASS` prerequisite, exact candidate/profile/reference/target/evidence-reference binding, the source digest equal to that canonical fixture digest, the imported original-file digest equal to the same value, attachment post type, `image/png` and positive dimensions. Wrong-but-equal non-canonical hashes are rejected.
- Exact-bound target-file digest mismatch against the canonical source is retained as `TARGET_MANAGED_CONTENT_INTEGRITY_FAIL`; a non-canonical source digest is rejected instead of being treated as a genuine fixture failure. Malformed metadata, stale proof/profile/reference state, `referenceClosureClaim=true` and other authority inflation are rejected.
- This proves bytes for one controlled imported file only. Attachment-ID portability, arbitrary-host portability, general media-library compatibility, reference closure, compatibility, production, generation and download authority remain false/unclaimed.

## 2026-09-19 — P15 observed asset reference evidence bridge

- Continued issue #565 through PR #566 after the real controlled asset proof retained in #563/#564.
- Added `elementor-observed-asset-reference-evidence-v1`, which accepts only a valid exact-bound `ASSET_BOUND_FULL_PASS` for an asset-only current `EXTERNAL_CLOSURE_REQUIRED` reference identity.
- The bridge binds the current reference-review digest, canonical candidate identity and TargetProfile fingerprint, then retains only SHA-256 of the canonical source proof and its retained evidence reference plus sanitized source/target/render URL fingerprints.
- Mixed global+asset closure scope, stale profile/candidate/reference binding, partial/fail proof, malformed proof and authority inflation fail closed.
- Added a sanitized CLI and wired the real P15 target-proof workflow so the genuine #564 asset observation must also produce `OBSERVED_ASSET_EVIDENCE_BOUND` with `OBSERVED_PROOF_VALIDATED`.
- The new evidence explicitly keeps `internalDecisionStatus=NOT_RUN`, `authenticationAuthority=false`, `referenceClosureClaim=false`, `targetCompatibilityClaim=false`, `productionAcceptance=false` and generation/download authority false. It does not establish attachment-ID portability, arbitrary-host portability or general media-library closure.

## 2026-09-19 — P15 controlled URL-only Image asset proof

- Continued issue #563 through PR #564 as the first genuine controlled asset-reference observation, separate from the retained #483 first-proof candidate.
- Added deterministic `p15-elementor-asset-proof-vector-v1` through the production neutral-IR → Elementor generator. The vector contains one exact core Image URL-only MEDIA reference to a deterministic disposable localhost PNG fixture.
- Bound the asset vector to exact candidate identity, exact WordPress `6.8` + Elementor `4.2.4` TargetProfile, exact reference-review identity digest and exact URL fingerprint. Existing #483 first-proof candidate/profile/template hashes are regression-locked unchanged.
- Added dedicated `elementor-asset-target-proof-evidence-v1` validation and sanitized intake. Exact full pass requires candidate/profile/reference-review bindings, declared/observed environment match, import PASS, target-managed MEDIA creation, exact original-source provenance, render binding to the rewritten target MEDIA URL fingerprint and browser image load PASS.
- Impossible step ordering, malformed fingerprints, stale identities, contradictory PASS claims, unknown fields and authority inflation fail closed. CLI/report surfaces retain fingerprints only and never emit the raw asset URL.
- A first real run proved an important Elementor `4.2.4` behavior: MEDIA `on_import()` rewrites URL-only image input through the import-images pipeline rather than preserving the source URL verbatim. The harness was corrected to serve an importable deterministic `.png` from an isolated localhost fixture server, permit only that exact controlled loopback fetch, verify `_elementor_source_image_hash` provenance, and bind browser render to the rewritten target-managed MEDIA URL fingerprint.
- The P15 real-target workflow now requires both the historical first controlled proof chain and the new exact asset proof to pass on the same controlled environment.
- `ASSET_BOUND_FULL_PASS` is evidence for one exact controlled localhost URL-only candidate only. `assetReferenceClosureClaim=false`, `targetCompatibilityClaim=false`, `productionAcceptance=false` and internal review remain mandatory; no arbitrary-host portability, media upload, attachment-ID portability or P19 expansion is claimed.

## 2026-09-19 — P15 exact responsive container padding overrides

- Opened issue #561 and PR #562 for the fourth bounded responsive-mapping slice after direction, linked-px gap and flex alignment.
- Verified exact Elementor `4.2.4` evidence: Container registers `padding` through `add_responsive_control` with `Controls_Manager::DIMENSIONS`, and official fixtures retain `padding_tablet` / `padding_mobile` dimension objects.
- Added a source-IR + exact base-candidate-bound manifest for explicit tablet/mobile four-side px padding decisions on existing neutral containers.
- Desktop `padding` remains unchanged. Requested breakpoints map only to px DIMENSIONS objects with string top/right/bottom/left values; `isLinked` is derived from side equality, never caller-supplied.
- Caller padding objects are snapshotted before application/reporting. Missing/extra sides, non-finite/out-of-range/negative values, duplicate/non-container/empty/unknown-field/stale/conflicting/authority-inflated mappings fail closed.
- Shared source→generated-container binding is reused; review-bearing source IR or structural drift cannot produce a partial responsive candidate.
- Sanitized summaries omit source content, template JSON and candidate bytes. No unit conversion, margin/width/height/widget-spacing, custom-breakpoint, responsive-closure, compatibility, production or transfer authority is introduced.

## 2026-09-19 — P15 exact responsive container alignment overrides

- Opened issue #559 and PR #560 for the third bounded responsive-mapping slice after container direction and linked-px gap.
- Verified exact Elementor `4.2.4` evidence: flex-container `justify_content` and `align_items` are responsive controls, and Elementor's own container mock exposes the exact tablet/mobile keys plus accepted options.
- Added a source-IR + exact base-candidate-bound manifest for explicit tablet/mobile `alignItems` and `justifyContent` decisions on existing neutral containers.
- Neutral `start` / `end` map only to Elementor `flex-start` / `flex-end`; `center`, `stretch`, `space-between`, `space-around` and `space-evenly` are preserved where accepted by the target control.
- Desktop `flex_align_items` / `flex_justify_content` remain unchanged. Omitted controls/breakpoints remain absent; no responsive inheritance value is synthesized.
- Shared source→generated-container binding from #558 is reused. Review-bearing source IR, stale bindings, duplicates, non-container IDs, empty/invalid/unknown entries, requested-key conflicts and authority inflation fail closed without a partial candidate.
- Sanitized summaries omit source content, template JSON and candidate bytes. No wrap/align-content, padding, custom-breakpoint, widget-alignment, responsive-closure, compatibility, production or transfer authority is introduced.

## 2026-09-19 — P15 exact responsive container gap overrides

- Opened issue #557 and PR #558 for the second bounded responsive-mapping slice after exact container direction.
- Extracted the neutral-source → deterministic generated-container tree binding from the direction resolver into one shared non-authorizing helper, preserving the #556 structural checks.
- Verified exact Elementor `4.2.4` evidence: flex-container `gap` is a responsive GAPS control, and Elementor's own upgrade tests assert `flex_gap_tablet` / `flex_gap_mobile` objects with unit/column/row/isLinked fields.
- Added a source-IR + exact base-candidate-bound manifest for explicit `tabletGapPx` / `mobileGapPx` decisions on existing neutral containers.
- Desktop `flex_gap` remains untouched. Each supplied px value maps only to a linked px GAPS object at the requested default breakpoint; missing breakpoints are not invented.
- Zero and the existing neutral spacing maximum are accepted; duplicate/non-container/empty/non-finite/out-of-range/unknown-field/stale/authority-inflated mappings fail closed.
- Review-bearing source IR, generated-tree binding drift and requested-key conflicts cannot produce a partial responsive candidate.
- Sanitized summaries omit source content, template JSON and candidate bytes. No responsive inference, unit conversion, unlinked row/column gap, additional breakpoint, closure, compatibility, production or transfer authority is introduced.

## 2026-09-19 — P15 exact responsive container direction overrides

- Opened issue #555 and PR #556 for the first bounded responsive-mapping slice after exact text semantics.
- Verified the direction control against official Elementor `4.2.4`: flex-container group field `direction` is responsive, the container registers that group as `flex`, and the accepted values are `row`, `column`, `row-reverse` and `column-reverse`.
- Added a versioned responsive manifest bound to both the exact canonical neutral-IR fingerprint and exact current base-candidate identity so source or generator drift fails closed.
- Existing neutral containers may receive explicit `tabletDirection` and/or `mobileDirection`; desktop `flex_direction` is preserved and only `flex_direction_tablet` / `flex_direction_mobile` are added.
- Nested source containers bind to their deterministic generated container tree; shape drift, duplicate/non-container IDs, empty/invalid mappings, stale bindings and authority inflation reject without a partial candidate.
- Review-bearing source IR is blocked before responsive resolution rather than generating a partial target candidate.
- Sanitized summaries retain only source IDs, direction decisions, candidate/source fingerprints and exact evidence metadata; source content, template JSON and candidate bytes are omitted.
- This remains responsive preparation only: no responsive inference, closure claim, target compatibility, production acceptance, download/transfer authority or additional-breakpoint claim is introduced.

## 2026-09-19 — P15 exact source-bound text semantics

- Opened issue #553 and PR #554 for the first explicit semantic-mapping slice after image-reference resolution.
- Extracted canonical neutral-IR serialization/fingerprinting into a shared `p15-neutral-export-ir-identity-v1` contract; the #552 image resolver delegates to the same fingerprint without changing its source-binding behavior.
- Added a versioned semantic manifest bound to the exact canonical neutral IR. Only explicitly named existing neutral text source IDs may be promoted to native `heading` or `button` nodes.
- No semantic inference is performed from Figma layer names, font size, typography, component names or visual style. Unlisted text remains text and source copy is preserved exactly.
- Heading promotion requires an explicit supported level. Button promotion supports only bounded safe URL/openInNewTab/nofollow fields under the existing neutral URL policy.
- Justified text cannot be silently promoted because Heading/Button alignment does not support `justify`; that mapping fails closed.
- Sanitized semantic summaries expose source IDs, resolved kinds, heading levels and URL fingerprints only; raw source text, raw button URLs, transformed IR and caller-mutated issue messages are omitted.
- Existing generator/readiness paths recognize promoted Heading/Button nodes as documented native mappings while compatibility/production/download authority remains false.

## 2026-09-19 — P15 source-bound image asset resolution

- Opened issue #551 and PR #552 for the first concrete post-proof media mapping gap.
- Added a versioned image-asset resolution manifest bound to a deterministic canonical fingerprint of the exact neutral IR.
- Only existing `IMAGE_ASSET_EXPORT_REQUIRED` review nodes can be resolved, using bounded absolute HTTP(S) URLs without credentials. Stale fingerprints, missing/extra/duplicate resolutions, unsafe URLs and authority-inflated manifests fail closed.
- Resolved nodes become native neutral `image` nodes for the existing Elementor v0.4 generator. No target attachment ID is invented; the generated Elementor MEDIA setting remains URL-only with `id: 0`.
- Unrelated review nodes are preserved, so resolving an image cannot conceal manual/grid/wrap/absolute or other unresolved mapping work.
- Sanitized resolution serialization retains source IDs + URL SHA-256 fingerprints but omits transformed IR and raw asset URLs.
- Existing Elementor asset-reference review deliberately remains `EXTERNAL_ASSET_CLOSURE_REQUIRED` / `NOT_VERIFIED`; no network access, asset upload, asset-closure claim, target-compatibility claim, production acceptance or download authority is introduced.

## 2026-09-19 — P15 exact retained candidate binding

- Opened issue #547 and PR #548 after #546/#545 merged the exact retained TargetProfile reference registry.
- Bound retained #483 proof evidence to candidate identity `sha256:96ffe8a19b0c4d05eccd1e3d28d8b453f41464450ebd6c3f69decc1ab2543f26`, TargetProfile fingerprint `sha256:8c93e6c2c4635f7da845ef737bbce8810bbf4e46334f7496a54b682673a1b676` and template SHA-256 `sha256:bf2c229441f93486af7152f9196c265f09ee9e3cefab67d11ecb6765f583e4ad`.
- Exact reference-profile alignment now requires the retained TargetProfile fingerprint, not only matching version labels.
- A supplied canonical current candidate is compared through the existing candidate-identity contract and reports `EXACT_REFERENCE_CANDIDATE_MATCH` only for the exact retained candidate. A different canonical candidate reports `REFERENCE_CANDIDATE_MISMATCH`, which is explicitly not an incompatibility verdict.
- Plugin-facing output remains sanitized to hashes/status/proof metadata; template/design contents remain absent.
- `environmentObserved=false`, `targetCompatibilityClaim=false`, `productionAcceptance=false`, generation/download authority false and internal review required remain unchanged.
- README now visibly lists #546 merged and #548/#547 candidate binding in the recent P15 sequence, module row, current boundary and immediate execution order.

## 2026-09-19 — P15 retained Elementor reference-proof alignment

- Closed the stale #483 execution gap through merged PR #518: exact head `4f09efda101e5a2771df9bfc3ac8960a43655e96` retained P15 Real Elementor Target Proof run `35403469986`, artifact `10570709987` and digest `sha256:206b703ab8185f1e5b1a83346074accb23cc458b9fdcb94f5eaad0c4752e33aa`.
- The retained runtime was WordPress `6.8` + Elementor `4.2.4` with PHP `8.3.6`, MariaDB `11.4.13`, 256 MB WordPress memory and Chrome `152.0.0.0`; import/editor/render and bounded structure/solid-background/uniform-radius fidelity all passed through qualified/full/full environment/proof/chain intake.
- Opened issue #545 and PR #546 to turn that exact observation into a machine-readable reference-proof registry instead of leaving proof provenance only in issue/PR evidence.
- Added exact declared-profile reference alignment: only the retained WordPress/Elementor/Container/Template JSON profile envelope can report `EXACT_REFERENCE_PROFILE_MATCH`; other declared versions report `NO_EXACT_REFERENCE_PROFILE`, while current-candidate binding remains `NOT_ASSESSED`. Absence of a profile match is explicitly not an incompatibility verdict.
- Exposed the sanitized reference result through the declared TargetProfile preview while preserving `environmentObserved=false`, `targetCompatibilityClaim=false`, `productionAcceptance=false`, generation/download authority false and internal review required.
- Explicitly excluded Atomic-v4, Elementor Pro, third-party addons, responsive mapping, media-asset closure and general version compatibility from the retained proof scope.
- Refreshed current official Elementor data-structure evidence: version `0.4` and modern nested Container/Widget JSON remain documented; this research does not expand runtime authority.
- P15 remains `N/A` progress with one controlled reference proof retained; P16 stays stable and P17-P26 remain frozen during the focused Elementor V1 window.

## 2026-09-12 — P14 adapter callback input isolation

- Opened authoritative issue #229 and focused PR #230 (`fix/p14-adapter-input-isolation-229`) after a fresh post-#226 P14 adapter-boundary audit.
- Confirmed a distinct mutable-reference gap: caller run/plan/confirmation/registry evidence was already stabilized, but accepted candidate/action/plan objects were still passed by reference into runtime adapter callbacks and then reused by later core semantics.
- Added `src/core/p14-adapter-input-snapshot.ts` with known-schema candidate/action/plan copy helpers. Action/plan collections are copied from the already-accepted bounded P14 contract; this does not enumerate arbitrary properties or perform a generic recursive deep clone.
- Hardened the public retained-duplicate adapter boundary so `assessActionEligibility`, `applyRecipe`, `validateCandidate`, `rescoreCandidate`, `retainCandidate` and `discardCandidate` receive fresh detached candidate/action/plan copies as applicable. Scalar source/transaction/prepared-name arguments remain unchanged.
- Callback-side mutation can no longer rewrite later core action expectations, source/candidate correlation, validation/re-score inputs, retention evidence expectations or cleanup receipt identity. Existing adapter-output validation and source-immutability proof remain authoritative.
- Added `tests/p14-adapter-input-isolation.test.ts` covering a two-action successful run where every object-bearing callback mutates its arguments, plus a transform/discard failure path proving cleanup receipt candidate identity remains stable even when callback copies are poisoned.
- Initial implementation/test head `651d4c5f9d8d3e7776eb23b9eafeecb1727498d0` passed CI #952 including typecheck/full tests/builds/contracts, P12 Final Release Artifact #263 and P12 Offline Acceptance #307 on Ubuntu/macOS/Windows.
- README, P14 foundation, PROJECT_STATE and NEXT_ACTIONS are synchronized in the same cycle; final exact-head CI, Integration Readiness, Final Release Artifact, cross-platform Offline Acceptance and clean/current/mergeable verification remain required before PR #230 may merge.
- Input isolation does not sandbox an adapter's actual candidate-side effects and introduces no production safe recipe, real Figma adapter/UI/mutation command, target-compatibility claim or production acceptance.

## 2026-09-12 — P14 safe-recipe registry semantic snapshot hardening

- Opened authoritative issue #226 and focused PR #227 (`fix/p14-registry-semantic-snapshot-226`) after a fresh post-#223 P14 authorization-boundary audit.
- Confirmed a readable-but-stateful registry TOCTOU gap distinct from #198: resource bounds, semantic validation and later recipe authorization/resolution could re-read the same caller-owned registry evidence at different times, allowing bounded readable getters/proxies to change bindings or nested recipe semantics after validation.
- Added `src/core/p14-registry-semantic-snapshot.ts` to capture only the known safe-recipe registry contract into bounded plain evidence through guarded property/index reads after the first registry resource preflight. It does not enumerate arbitrary properties or perform a generic deep clone.
- `assessP14SafeRecipeRegistryEvidence(...)` now performs first resource bounds, semantic capture, a second bounds pass over the plain snapshot, then semantic validation. Evidence that grows oversized after first preflight stays invalid rather than entering authorization semantics; unreadable capture fails closed with bounded diagnostics.
- `validateP14SafeRecipeRegistry(...)`, exact safe-recipe resolution and `authorizeP14PreparationPlan(...)` consume stable plain registry evidence, so caller-owned `bindings`/recipe getters are not re-entered after the registry evidence boundary.
- Existing transaction authority remains unchanged: invalid/unreadable/oversized registry evidence still yields `BLOCKED` + `P14_RECIPE_UNAUTHORIZED` before confirmation, source coordination or adapter access; the production safe-recipe registry remains empty.
- Added `tests/p14-registry-semantic-snapshot.test.ts` covering top-level binding re-entry, nested recipe re-entry, evidence that grows oversized after the first bounds pass, capture-time unreadability and normal exact authorization behavior.
- Initial implementation/test head `4bd44da760d0dc0558b4d7c710bd779d1dd1e534` passed CI #939 including status verification, typecheck, full tests, plugin/CLI builds, release/package/community verification and local Figma import preparation; P12 Final Release Artifact #250 passed; P12 Offline Acceptance #294 passed on Ubuntu/macOS/Windows.
- Exact synchronized PR head `6446c49a6cf5da5d039600f96a0ac3bd03e2b904` passed CI #945, Integration Readiness #299, P12 Final Release Artifact #256 and P12 Offline Acceptance #300 on Ubuntu/macOS/Windows; it had zero unresolved review threads/reviews/comments, remained current with main (`behind_by=0`) and was reported `mergeable=true` by GitHub.
- PR #227 guarded squash-merged as `e5e22a4c556856a7c2ab11dbb94025ee838e0bb4`; issue #226 closed completed. P14 remains runtime-unwired and production safe-recipe authority remains empty.
- No production safe recipe, real Figma adapter/UI/mutation command, target-compatibility claim or production acceptance was introduced.

## 2026-09-12 — P14 nested plan/confirmation semantic snapshot hardening

- Opened authoritative issue #223 and focused PR #224 (`fix/p14-semantic-snapshot-223`) after a fresh post-#216 P14 trust-boundary audit.
- Confirmed a readable-but-stateful TOCTOU gap: first bounds traversal, plan integrity, confirmation validation and later transaction semantics could read the same caller-owned nested plan/confirmation objects at different times, so bounded readable proxy/getter evidence could change after preflight without throwing.
- Added `src/core/p14-semantic-input-snapshot.ts` to capture only the known P14 plan/confirmation contract into plain evidence through guarded, bounded property/index reads after the first resource preflight. It does not enumerate arbitrary properties or perform a generic recursive deep clone.
- Re-runs the existing P14 bounds contract on the plain semantic snapshot before delegation. Evidence that becomes oversized after first preflight preserves the established `P14_INPUT_TOO_LARGE` / `bounds` path; collection capture remains bounded by the existing action/blocker/target/dependency/mutation/bucket limits and total-target budget.
- Core semantics now receive the plain nested plan/confirmation snapshot, so readable stateful caller getters/proxies are not re-entered after the semantic boundary. Unreadable capture continues to use bounded `P14_INTERNAL_INVARIANT_FAILED` / `bounds-evidence` evidence before coordination/adapter access.
- Added `tests/p14-semantic-input-snapshot.test.ts` covering stateful nested action getter re-entry, stateful confirmation getter re-entry, evidence that grows oversized after the first bounds pass, and normal preparation regression.
- Initial head `64168dea7b5c6aea126cc89404221da79973b5bd` passed typecheck and the new focused tests, but Final Release #237 surfaced one existing #216 receipt-correlation regression in `tests/p14-bounds-evidence-boundary.test.ts`: semantic capture failure retained readable source metadata instead of the established `UNKNOWN` / `p14-plan-invalid` second-pass fallback.
- Corrected implementation head `8ec0c14c6301d16b8b9564a5b0d01423147629b5` restored the #216 correlation contract and passed CI #927 including full tests/builds/contracts, P12 Final Release Artifact #238 and P12 Offline Acceptance #282 on Ubuntu/macOS/Windows.
- Exact synchronized PR head `483e4b3f655ee8c99e844fbc9395313db22812f1` passed CI #932, Integration Readiness #289, P12 Final Release Artifact #243 and P12 Offline Acceptance #287 on Ubuntu/macOS/Windows; it had zero unresolved review threads/reviews/comments, remained current with main (`behind_by=0`) and was reported `mergeable=true` by GitHub.
- PR #224 guarded squash-merged as `a84104b459d38b90368e0ef21ec1ac32788cd438`; issue #223 closed completed. P14 remains runtime-unwired and production safe-recipe authority remains empty.
- No production safe recipe, real Figma adapter/UI/mutation command, target-compatibility claim or production acceptance was introduced.

## 2026-09-12 — P14 unreadable nested bounded-input evidence hardening

- Opened authoritative issue #216 and focused PR #221 (`fix/p14-bounds-evidence-216`) for unreadable nested plan/confirmation evidence encountered by the P14 bounded-input preflight.
- Confirmed that top-level run-input snapshotting did not protect nested bounds traversal: throwing getters/proxies inside confirmation, plan source/actions or nested action collections could still reject the public transaction promise during the public preflight or the internal core's second bounds pass.
- Guarded the public `assessP14PreparationInputBounds(...)` traversal and added the existing `P14_INTERNAL_INVARIANT_FAILED` structured refusal at stage `bounds-evidence` with bounded runtime diagnostics.
- Guarded the internal retained-duplicate core bounds traversal independently so evidence that becomes unreadable only on the second pass also fails closed; that internal refusal uses `UNKNOWN` source/run correlation and `p14-plan-invalid` instead of dereferencing hostile plan metadata again.
- Preserved ordinary readable oversized evidence on the existing `P14_INPUT_TOO_LARGE` / `bounds` path and preserved normal readable `PREPARED` behavior. No deep canonical snapshot of readable nested semantics, new status/error code, production recipe authority, real Figma mutation surface, target compatibility or production acceptance was introduced.
- Added `tests/p14-bounds-evidence-boundary.test.ts` covering first-pass hostile confirmation evidence, second-pass plan evidence that becomes unreadable, readable oversized-input regression and normal preparation regression. The core full-file replacement was diff-audited and contained only the intended bounds helper/preflight changes.
- Initial code/test head `7ef0a2b43262024ee1f1df59e658143e4dac2681` passed CI #913 including status verification, typecheck, full tests, plugin/CLI builds and release/package/community checks; P12 Final Release Artifact #224 passed; P12 Offline Acceptance #268 passed on Ubuntu/macOS/Windows.
- Updated the P14 foundation, README, PROJECT_STATE and NEXT_ACTIONS for #216. No real Figma mutation command, production recipe authority, target-compatibility claim or production acceptance was introduced.
- Exact synchronized PR head `33e9a956b1c63aec9623e9c3187449a8569f6236` passed CI #921, Integration Readiness #280, P12 Final Release Artifact #232 and P12 Offline Acceptance #276 on Ubuntu/macOS/Windows; it had zero unresolved review threads/reviews/comments, remained current with main (`behind_by=0`) and was reported `mergeable=true` by GitHub.
- PR #221 guarded squash-merged as `e028c76d520564fde6177269e75c6efa423b0a5b`; issue #216 closed completed. P14 remains runtime-unwired and production safe-recipe authority remains empty.
- Accidental duplicate/placeholder issues #217, #218, #219 and #220 were created during tool routing, immediately closed `not_planned`, and carry no implementation scope. #216 was authoritative.

## 2026-09-12 — P14 top-level run-input runtime-evidence snapshot

- Opened issue #213 and focused PR #214 (`fix/p14-run-input-snapshot-213`) for the remaining public caller-object property-access trust boundary before P14 transaction semantics.
- Confirmed that the public wrapper still read `input.plan` / `input.confirmation` directly and delegated with `...input`, allowing hostile or one-shot top-level getters to reject the transaction promise or change evidence after run-control validation.
- Added a guarded one-shot snapshot for `plan`, `registry`, `coordinator`, `inputBounds`, `confirmation`, `transactionId`, `preparedName`, `allowPreparedWithReview` and `shouldCancel`; the internal core now receives an explicitly constructed plain object rather than re-entering caller getters through object spread.
- Non-object input or an unreadable known top-level property now returns bounded `BLOCKED` + `P14_INTERNAL_INVARIANT_FAILED` evidence at stage `run-input` before coordinator or adapter access. Safely readable plan correlation metadata is retained where possible; unreadable values use bounded fallbacks.
- Kept runtime clock metadata on the separate fail-soft contract: a throwing/malformed `now` property or callback still produces `UNKNOWN` event time rather than becoming transaction authority failure.
- Preserved existing run-control normalization, raw-size `P14_INPUT_TOO_LARGE`, confirmation, registry authorization, coordinator, cancellation and adapter evidence semantics.
- Added `tests/p14-run-input-snapshot.test.ts` covering non-object input, throwing getters across all known top-level properties, hostile `now`, exact one-shot getter reads and normal `PREPARED` regression. Existing run-control tests continue to prove oversized-control behavior.
- Initial code/test head `3d558f9ac58bde1cfebd82b7e3a11d0a1d94c93e` passed CI #901 including status verification, typecheck, full tests, plugin/CLI builds and release/package/community checks; P12 Final Release Artifact #212 passed; P12 Offline Acceptance #256 passed on Ubuntu/macOS/Windows.
- Updated the P14 foundation, README, PROJECT_STATE and NEXT_ACTIONS for #213. No real Figma mutation command, production recipe authority, target-compatibility claim or production acceptance was introduced.
- Exact synchronized PR head `5058b82ad17eb166c1e9445aed6959a07bbe856c` passed CI #907, Integration Readiness #268, P12 Final Release Artifact #218 and P12 Offline Acceptance #262 on Ubuntu/macOS/Windows; it had zero unresolved review threads/reviews/comments, remained current with main (`behind_by=0`) and was reported `mergeable=true` by GitHub.
- PR #214 guarded squash-merged as `f8a983a1ed7d18963e23901996a60f64d55678cd`; issue #213 closed completed. P14 remains runtime-unwired and production safe-recipe authority remains empty.

## 2026-09-12 — P14 runtime eligibility hook property hardening

- Opened issue #210 and focused PR #211 (`fix/p14-runtime-eligibility-hook-210`) for the remaining unreadable optional runtime action-eligibility hook property boundary.
- Audited the sequential transform path and confirmed that `adapter.assessActionEligibility` was read outside the guarded invocation after a prior recipe could already have mutated the candidate; a throwing/proxy-backed getter could therefore escape before structured candidate cleanup.
- Hardened the public retained-duplicate adapter boundary with a guarded optional-hook property: a throwing getter becomes a deferred callable failure consumed by the existing `P14_TRANSFORM_FAILED` / `transform-recheck` catch path, so candidate discard is attempted instead of letting the transaction escape.
- Readable missing/non-function hook values preserve the existing deterministic structured refusal, while valid hooks are invoked with the original adapter as `this` so adapter state/private expectations remain intact.
- Existing cleanup semantics remain authoritative: if candidate discard also fails after unreadable hook access, the receipt becomes `CLEANUP_REQUIRED` with `P14_DISCARD_FAILED`; no new status or error code was added.
- Added `tests/p14-runtime-eligibility-hook-boundary.test.ts` covering throwing getter cleanup, throwing getter plus discard failure, readable non-function behavior and valid-hook regression.
- Initial head `647a390028d0bee294448d96072a3515cf39f14a` exposed an exact-optional adapter-facade type mismatch in CI #886 before tests ran. Follow-up head `4a4cd0c818a4e5a334c80a2edfe175b6cbccb0c3` exposed implicit-any delegate parameters in CI #887, also before tests; both were TypeScript-only boundary corrections with no runtime-scope expansion.
- Corrected implementation head `a85e0d80a2421f126a74cafe7b581abbb5d897a1` passed CI #888 including status verification, typecheck, full tests, plugin/CLI builds and release/package/community checks; P12 Final Release Artifact #199 passed; P12 Offline Acceptance #243 passed on Ubuntu/macOS/Windows.
- Updated the P14 foundation, README, PROJECT_STATE and NEXT_ACTIONS for #210. No real Figma mutation command, production recipe authority, target-compatibility claim or production acceptance was introduced.
- Exact synchronized PR head `57b97950928390e8c07ce82e48f92ddff7fabd4f` passed CI #895, Integration Readiness #257, P12 Final Release Artifact #206 and P12 Offline Acceptance #250 on Ubuntu/macOS/Windows; it had zero unresolved review threads/reviews/comments, remained current with main (`behind_by=0`) and was reported `mergeable=true` by GitHub.
- PR #211 guarded squash-merged as `7f24e57a28941e80d290b9b7dfbdce5fd718e534`; issue #210 closed completed. P14 remains runtime-unwired and production safe-recipe authority remains empty.

## 2026-09-12 — P14 caller run-control runtime-evidence hardening

- Opened issue #207 and focused PR #208 (`fix/p14-run-control-evidence-207`) for the remaining caller-supplied transaction control trust boundary.
- Added `src/core/p14-run-control-evidence.ts` with `assessP14RunControlEvidence(...)` so transaction ID, prepared name, explicit review policy and custom input-bound overrides are validated before confirmation, coordination or adapter access.
- `transactionId` must be a runtime string with a non-whitespace identity and is normalized once before coordinator, adapter and receipt use; supplied `preparedName` must be a string, is normalized once and preserves the established empty/whitespace fallback to `Prepared Duplicate`.
- `allowPreparedWithReview` must be absent or a literal boolean. Truthy non-boolean runtime values can no longer grant the existing `PREPARED_WITH_REVIEW` policy exception.
- Known `inputBounds` fields are read through guarded property access, snapshotted into a plain object and require positive-integer values when supplied. Throwing proxy/getter evidence therefore fails closed instead of escaping the first safety gate.
- Malformed run controls return bounded `BLOCKED` + `P14_INTERNAL_INVARIANT_FAILED` evidence at stage `run-control` before source coordination or adapter access. Valid typed but oversized raw identities preserve the existing `P14_INPUT_TOO_LARGE` bounds outcome.
- Preserved the previous retained-duplicate engine byte-for-byte as internal `src/core/p14-retained-duplicate-transaction-core.ts`; the original public transaction module path is now the hardened run-control boundary.
- Added `tests/p14-run-control-evidence.test.ts` covering throwing bounds getters, malformed control types/values, truthy non-boolean review authorization, normalized runtime identities, explicit boolean review authorization and oversized-control regression semantics.
- Initial implementation head `9e4b0ca8c7abf69d2c7052bcf26f48526e0587dc` passed CI #876 including status verification, typecheck, full tests, plugin/CLI builds and release/package/community checks; P12 Final Release Artifact #187 passed; P12 Offline Acceptance #231 passed on Ubuntu/macOS/Windows.
- Updated the P14 foundation, README, PROJECT_STATE and NEXT_ACTIONS for #207. No real Figma mutation command, production recipe authority, target-compatibility claim or production acceptance was introduced.
- Final synchronized PR head `c3b577bcf09e3f97060cfcba7b76d202e9119019` passed CI #882, Integration Readiness #247, P12 Final Release Artifact #193 and P12 Offline Acceptance #237 on Ubuntu/macOS/Windows; it had zero unresolved review threads/reviews/comments, remained current with main (`behind_by=0`) and was reported `mergeable=true` by GitHub.
- PR #208 guarded squash-merged as `df1e8f33394f13a371c2ff0b97bb6eceb321fd91`; issue #207 closed completed. P14 remains runtime-unwired and production safe-recipe authority remains empty.

## 2026-09-12 — P14 coordinator runtime-evidence and lease-cleanup hardening

- Opened issue #201 and focused PR #205 (`fix/p14-coordinator-runtime-evidence-201`) for the remaining injected source-transaction coordinator trust-boundary gap.
- Added runtime validation for coordinator acquisition evidence: acquisition flag, refusal reason, optional owner identities and acquired lease identities are treated as unknown evidence and bounded before transaction semantics use them.
- Acquired lease evidence must match the exact normalized requested source scope and transaction ID; unreadable/proxy-backed or malformed evidence fails closed before adapter access.
- If malformed evidence still claims `acquired: true`, the transaction makes one bounded best-effort release attempt using the exact expected source/transaction lease identity.
- Coordinator release now succeeds only on literal `true`; `false`, non-boolean runtime evidence or throw is converted to bounded `CLEANUP_REQUIRED` evidence at stage `coordination-release` instead of escaping or being silently ignored.
- Receipt integrity now permits coordinator-release cleanup with truthful retained-candidate/retention evidence when finalization already succeeded, or without candidate evidence when the release problem occurs before a candidate exists.
- Added `tests/p14-coordinator-runtime-evidence.test.ts` covering throwing/unreadable/malformed acquisition, oversized owner identity, claimed-acquired recovery, release false/throw, pre-clone release cleanup, default coordinator success and NO_CHANGES_NEEDED no-lease behavior.
- Initial code/test head `511bf68adbe1859695d7dbe2dea12e974afa024f` passed CI #867 including status verification, typecheck, full tests, plugin/CLI builds and release/package/community checks; P12 Final Release Artifact #178 passed; P12 Offline Acceptance #222 passed on Ubuntu/macOS/Windows.
- Updated the P14 foundation, README, PROJECT_STATE and NEXT_ACTIONS for #201. No distributed lock, real Figma mutation command, production recipe authority, target-compatibility claim or production acceptance was introduced.
- Accidental empty issues #202, #203 and #204 were immediately closed as `not_planned`; they carry no implementation scope and #201 remains authoritative.
- Final synchronized PR head `1f76443e652f5d7c2c3dd9498b33463c1c2e7e03` passed CI #872, Integration Readiness #239, P12 Final Release Artifact #183 and P12 Offline Acceptance #227 on Ubuntu/macOS/Windows; it had zero unresolved review threads/reviews/comments, remained current with main and was reported mergeable by GitHub.
- PR #205 guarded squash-merged as `e80bf4c21b64d6b72714965f4e954759e1c4159d`; issue #201 closed completed. P14 remains runtime-unwired and production safe-recipe authority remains empty.

## 2026-09-12 — P14 safe-recipe registry resource bounding

- Opened issue #198 and focused PR #199 (`fix/p14-registry-bounds-198`) for the remaining safe-recipe registry resource-bound gap before semantic authorization.
- Added `src/core/p14-registry-bounds.ts` with a resource-only `assessP14SafeRecipeRegistryBounds(...)` gate that reuses the existing P14 action/dependency/conflict/mutation/identity limits.
- Safe-recipe registry `bindings`, recipe `sourceRuleIds`, `prerequisites`, `conflictsWith` and `mutationAllowlist` are now count-bounded before semantic item traversal; binding/recipe/profile/order and nested rule/dependency/conflict identities are bounded before authorization validation.
- `validateP14SafeRecipeRegistry(...)` applies the bounds gate first, so direct validation, P13→P14 resolution and runtime plan authorization inherit the same resource contract.
- Oversized registry evidence preserves the existing execution result `BLOCKED` + `P14_RECIPE_UNAUTHORIZED`; no new transaction status/error code or mutation authority was introduced.
- Added `tests/p14-registry-bounds.test.ts` covering exact boundaries, oversized identities, top-level/nested proxy arrays that permit only `.length`, bounded malformed registries, empty production registry preservation, and zero coordinator/adapter access on transaction rejection.
- Initial code/test head `4ebf8328159f6d0d94ba8b606987cb8c0599a66a` passed CI #858, P12 Final Release Artifact #169 and P12 Offline Acceptance #213 on Ubuntu/macOS/Windows.
- Final synchronized PR head `e782a08090a4e158f99da22bf25d8fff60c8c529` passed CI #863, Integration Readiness #231, P12 Final Release Artifact #174 and P12 Offline Acceptance #218 on Ubuntu/macOS/Windows; it had zero unresolved review threads/reviews/comments, remained current with main and was reported mergeable by GitHub.
- PR #199 squash-merged as `80cefcb8b90a85b5e5a8b5ad4e6a0f65ddf6d12b`; issue #198 closed completed. P14 remains runtime-unwired and production recipe authority remains empty.
- Updated the P14 foundation, README, PROJECT_STATE and NEXT_ACTIONS without enabling real Figma mutation, registering a production recipe, or creating target-compatibility/production-acceptance authority.

## 2026-09-12 — P14 runtime clock and event-timestamp evidence hardening

- Opened issue #195 and focused PR #196 (`fix/p14-runtime-clock-evidence-195`) for the remaining untrusted runtime-clock/event-timestamp evidence gap.
- Added `src/core/p14-timestamp-evidence.ts` with a shared strict normalized UTC millisecond timestamp validator, explicit `UNKNOWN` event-time sentinel and fail-safe runtime clock reader.
- P14 preparation confirmation build/validation now reuses the shared normalized UTC validator; confirmation timestamps remain strict reviewed-intent evidence and do not accept `UNKNOWN`.
- Receipt event integrity now accepts only normalized UTC event time or explicit `UNKNOWN`, and rejects oversized/non-canonical/impossible timestamp evidence before `Date.parse(...)`.
- Transaction event construction now treats `now()` as untrusted metadata evidence: throw, non-string, oversized and non-canonical values cannot escape the transaction and are represented as unavailable time rather than fabricated wall-clock evidence.
- Added `tests/p14-timestamp-evidence.test.ts` covering pre-parse length rejection, strict timestamp shapes, hostile clock callbacks, confirmation compatibility, valid-clock preservation and forged receipt timestamps.
- Initial PR head `38ec9c36e44aa1e2431802bc74d8c9bab6a1adbe` passed P12 Offline Acceptance #203 but exposed a test-only TypeScript inference failure in CI #848 / P12 Final Release Artifact #159. The heterogeneous test callbacks were explicitly typed in follow-up commit `4d2b56497d90c58c71293ec9f473260fb9c8cef8`; no production clock logic change was required for that failure.
- Updated `docs/P14_FOUNDATION_IMPLEMENTATION.md`, README, PROJECT_STATE and NEXT_ACTIONS with the timestamp evidence contract. No real Figma mutation command, production recipe authority, target-compatibility claim or acceptance authority was introduced.
- Final synchronized PR head `47cb0b4d2d3c53f7f818af760131cc78737cb5c4` passed CI #854, Integration Readiness #224, P12 Final Release Artifact #165 and P12 Offline Acceptance #209 on Ubuntu/macOS/Windows; it had zero unresolved review threads/reviews/comments, remained current with main and was reported mergeable by GitHub.
- PR #196 squash-merged as `8021874323f5bad6ebf648b0891bc9f6358dd1bf`; issue #195 closed completed. P14 remains runtime-unwired and production recipe authority remains empty.

## 2026-09-12 — P14 receipt envelope and runtime-diagnostic hardening

- Opened issue #192 and focused PR #193 (`fix/p14-receipt-envelope-bounds-192`) for the remaining P14 receipt-envelope/resource-safety gap.
- Added `src/core/p14-receipt-evidence.ts` with shared receipt collection, identity/detail bounding and hostile runtime-error rendering helpers based on the existing P14 safety limits.
- Receipt integrity now count-bounds `appliedActions`, `errors` and `events` from `.length` before item traversal, preventing forged oversized collections from triggering unbounded iteration or status-specific scans.
- Receipt `transactionId`, `p13RunId`, `planDigest`, source node identity and error stage now use the existing P14 identity bound; error detail/recovery and event detail use the existing detail bound.
- Transaction `receiptError(...)` and event construction now emit bounded diagnostics by construction. Adapter and discard exception text is bounded before entering receipt state; hostile exception stringification falls back deterministically instead of escaping the transaction.
- Added `tests/p14-receipt-envelope-bounds.test.ts` covering exact limits, forged oversized top-level evidence, proxy-backed no-traversal collection checks, long adapter/discard exceptions and exception objects whose `toString()` throws.
- Updated `docs/P14_FOUNDATION_IMPLEMENTATION.md` with the bounded receipt-envelope/runtime-diagnostic contract and new safety invariants. No real Figma mutation command, production recipe authority, target-compatibility claim or acceptance authority was introduced.
- Pre-memory-sync PR head `7a031c2f8e2b405e084ae2fbdd677205d9e9c7e7` passed CI #840 including typecheck/full tests/builds/contracts, P12 Final Release Artifact #151, and P12 Offline Acceptance #195 on Ubuntu/macOS/Windows.
- Final synchronized PR head `5b9a02ce3b15ab49a1f281b51494e51bc5eb0e57` passed CI #844, Integration Readiness #217, P12 Final Release Artifact #155 and P12 Offline Acceptance #199 on Ubuntu/macOS/Windows; it had zero unresolved review threads/comments, remained current with main and was reported mergeable by GitHub.
- PR #193 squash-merged as `e54cb44c3dabe6cd2a459f70df917b9422fadddd`; issue #192 closed completed. P14 remains runtime-unwired and production safe-recipe authority remains empty.

## 2026-09-11 — R0 commercial market refresh

- Ran a fresh public-market scan against current UiChemy, Anima, Locofy, Builder.io and first-party Figma product/documentation pages.
- Retained the dated evidence and source URLs in `docs/R0_MARKET_SNAPSHOT_2026-09-11.md`; competitor claims are explicitly market signals rather than target-schema/API authority.
- Confirmed that generic `Figma -> code` generation is heavily commoditized and now overlaps with Figma's own code/agent direction.
- Reinforced the product moat as `Audit -> Target Compatibility -> Target-Ready Duplicate -> declared/native mapping -> artifact/environment validation -> render/round-trip proof -> receipt`.
- Added P15 planning requirement for Elementor/WordPress environment diagnostics with `DECLARED ENVIRONMENT` vs `OBSERVED ENVIRONMENT`; local JSON/ZIP validity cannot imply an unobserved live import.
- Promoted the target capability matrix to a user-facing commercial surface with explicit `NATIVE`, `NATIVE + CSS`, `VISUAL ASSET FALLBACK`, `MANUAL REVIEW` and `UNSUPPORTED` strategies and no silent fallback.
- Reinforced one neutral semantic IR across WordPress/code targets so users are not forced to re-tag/re-prepare the same safe intent for every adapter.
- Retained section-transfer speed as a product requirement while keeping documented artifacts / the versioned WP Builders Bridge ahead of undocumented private clipboard dependencies.
- Added durable decisions D-038 through D-042: verified readiness states are user-facing; Elementor environment truth stays evidence-scoped; shared IR should avoid unnecessary re-tagging; failed/refused generation is non-billable if credits are introduced; exact pricing remains evidence-driven rather than copied from competitors.
- Retained API/MCP/agent access as a later Pro/Agency differentiator after deterministic target contracts are accepted.
- No P13-P26 runtime implementation or acceptance credit was granted. #84 remains the internal P12 gate before implementation starts.

## 2026-09-11 — P12 publisher evidence intake hardening

- Corrected issue #84 body so release #20 / plugin ID `1680034649341961379` is the authoritative publishing candidate and old release #17 is retained only as historical runtime evidence.
- Opened issue #126 to make the final package/publisher/2FA evidence collection deterministic and fail-closed.
- Added `config/p12-publisher-candidate.json` with the exact release #20 source, plugin ID, artifact identity, exact publish ZIP SHA-256, extracted plugin file hashes, manifest contract and required evidence/attestations.
- Added `scripts/p12-publisher-evidence-intake.mjs` and `npm run p12:publisher-evidence`.
- Evidence intake verifies the exact publish ZIP SHA-256 and extracted `code.js`, `manifest.json`, `ui.html` hashes before accepting screenshot evidence.
- Intake rejects missing/empty/oversized/symlinked evidence, wrong or extra package files, manifest contract drift and missing operator confirmations.
- Runtime, Publish/Add-final-details and 2FA screenshots are hashed but never OCRed or machine-interpreted; live facts remain explicit operator attestations.
- Receipt semantics explicitly keep `acceptanceAuthority: false`, `screenshotsAreHashedNotInterpreted: true` and `finalInternalAcceptanceRequiresSeparateReview: true`.
- Added regression tests for the success path, extracted-file tamper, exact ZIP tamper, missing 2FA attestation and manifest semantic mismatch.
- Added `docs/P12_PUBLISHER_EVIDENCE_INTAKE.md` with the exact operator command and fail-closed behavior.
- PR #129 head `6a60ae540fa6fdacca8a30d73edd1ae3c61714e6` passed CI #730, P12 Offline Acceptance #85 and P12 Final Release Artifact #41, had no review/thread blockers, and squash-merged as `cc466367fa0c6fee119d4fb183371af5fb3f04c7`; issue #126 closed completed.
- P12 remains `80%`. The next genuine action is live release #20 runtime/publish/2FA screenshots -> deterministic intake receipt -> final internal exit review. P13 remains blocked.

## 2026-09-11 — Reliability/compatibility audit for P13-P26

- Completed the remaining post-plan housekeeping by merging PR #123 as `d34c026202ae6ecd8f88f71e6056d619578ce56f` after CI #723, Integration Readiness #158, P12 Offline Acceptance #78 and P12 Final Release Artifact #34 passed.
- Re-audited the post-P12 commercial plan against current official Figma, Elementor and WordPress/Gutenberg documentation.
- Added `docs/RELIABILITY_AND_COMPATIBILITY_AUDIT.md` as a new recurring **R1** gate after R0 market/platform research and before major adapter implementation.
- Added the requirement that every adapter use an immutable versioned TargetProfile plus a machine-readable capability descriptor so the UI cannot submit stale/invalid target-option combinations.
- Added strict separation between SOURCE READY, ARTIFACT VALIDATED, IMPORT VERIFIED, RENDER VERIFIED and ROUND-TRIP VERIFIED so local package validation cannot be misrepresented as a real live-site guarantee.
- Hardened Elementor planning around separate v3 Container and v4 Atomic adapter families, explicit Core/Pro overlays, template-vs-ZIP-vs-kit separation, global-reference closure and real target import acceptance.
- Hardened Gutenberg planning around target-version contracts, parse/serialize stability and real editor-open validity checks.
- Added atomic target-package generation: temporary candidate -> validate -> finalize/checksum -> Download/Copy. Failed/cancelled partial artifacts are discarded.
- Added no-silent-fallback policy: native+CSS, visual asset, manual placeholder or unsupported fallbacks must be visible and recorded rather than substituted silently.
- Added a canonical target-export state machine, source staleness fingerprints, deterministic run/receipt identity, cooperative cancel/retry and bounded sequential job orchestration.
- Added structured target error codes and explicit FAILED_RECOVERABLE vs FAILED_BLOCKED outcomes instead of generic-only errors.
- Added generated-framework build matrices with pinned dependency versions; accepted artifacts may not use unbounded `latest` versions.
- Added code-import archive defenses for path traversal, zip bombs, excessive files/nesting and arbitrary JavaScript execution.
- Corrected asset semantics using official Figma APIs: image-fill stored bytes may be exported as `Stored Original`, while crop/mask/effects/layout appearance is a distinct rendered export. Stored bytes are not claimed as upstream-upload provenance.
- Retained raw-font policy: font identity/usage manifest from Figma; raw binaries only when separately user-supplied and license-permitted.
- Kept the Community core offline under `allowedDomains: ["none"]`; the preferred WP Builders Bridge is file/paste import first. Arbitrary direct customer-domain push remains a separately accepted future networked module.
- Added durable decisions D-031 through D-037 and synchronized AGENTS, README, PROJECT_STATE, NEXT_ACTIONS, ROADMAP, AI_NATIVE_PLAN and FEATURE_PLAN.
- First PR #124 attempt exposed a real status-contract failure because R0/R1 used `N/A` while only DEFERRED modules may use `N/A`; corrected the README to mark the gate definitions `100% / DEFINED-RECURRING` while preserving the requirement to execute each gate per adapter.
- PR #124 final head `10b025f62679191ec43dd5afd50e6e69e8e3fcc4` passed CI #726, Integration Readiness #161, P12 Offline Acceptance #81 and P12 Final Release Artifact #37 with no review/thread blockers.
- PR #124 squash-merged the R1 reliability/compatibility plan as `4d38c46c359bd030bf36100f4424760b1380db81`.
- No P13-P26 runtime implementation or acceptance percentage was granted; #84 remains the internal gate before P13 starts.

## 2026-09-11 — Market-researched multi-target commercial alignment

- Expanded the post-P12 roadmap from P13-P21 to P13-P26 around the user-requested sales/client-growth direction.
- Added recurring R0 AI-assisted market/platform research before major evolving target adapters; official platform documentation is preferred for technical format/API claims and competitor claims remain market signals only.
- Added target-ready duplicate preparation so incompatible source designs can be safely prepared for a selected target without destructively rewriting the approved original.
- Added planned native Elementor / Elementor Pro export with compatibility, alignment, widget, responsive, asset and package validation before JSON/ZIP/kit download where the documented target contract supports it.
- Added planned Gutenberg native block/pattern export and selected-section transfer.
- Added HTML/CSS/JS export and static-first code-to-design reconstruction; untrusted JavaScript execution remains disabled by default pending a separately accepted sandbox/companion specification.
- Added a neutral framework adapter platform for React, Next.js, Vue, Nuxt, Svelte/SvelteKit, Angular, Astro and later adapters. NestJS is explicitly treated as optional backend/API scaffolding paired with a front-end adapter rather than a visual renderer.
- Added asset pack planning for raster images, SVG/icons, source-oriented vs rendered/display-size/custom-scale image choices, font family/style/usage manifests and user-supplied licensed raw-font packaging only where technically/legal available.
- Added round-trip target rendering/visual diff, target capability matrix, existing-component bindings, change-only regeneration, optional `WP Builders Bridge`, CMS/dynamic mappings and stronger agency/project workflows.
- Added durable decisions D-023 through D-030 for research, target-ready duplication, versioned adapter validation, documented WordPress transfer, code-import sandboxing, honest asset/font export, framework adapter isolation and round-trip QA.
- Updated issue #119 as the P13-P26 owner. No runtime/plugin feature or acceptance percentage was granted; P13 implementation remains blocked until #84 internal P12 exit genuinely closes.
- Retained the previous detailed history byte-for-byte in `memory-bank/CHANGELOG_ARCHIVE_PRE_MULTI_TARGET.md`.
- PR #122 head `40831f61a07036d233dbf7cad8a5396c0010641f` passed CI #721, Integration Readiness #156, P12 Offline Acceptance #76 and P12 Final Release Artifact #32 with no review/thread blockers.
- PR #122 squash-merged the researched multi-target planning baseline as `ade501fedb8c810b4964eb3dda414c58450e8565`.
- Planning changes do not replace the retained P12 publishing candidate or grant P13-P26 implementation/runtime acceptance.

## Historical archive

Detailed history before this roadmap alignment is retained byte-for-byte in:

`memory-bank/CHANGELOG_ARCHIVE_PRE_MULTI_TARGET.md`