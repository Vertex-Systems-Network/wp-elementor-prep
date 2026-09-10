# P11 Figma plugin release and distribution

This document defines the production/distribution layer for the classic Figma plugin. P11 prepared the packaging system; P12 performs the final integrated release acceptance and the remaining real Figma account/API/install/Community checks.

## Release architecture

Development and release manifests are intentionally separate:

- `manifest.template.json` — local development/import template;
- `manifest.release.template.json` — normal-user release manifest with an explicit user menu and no developer-only evidence/calibration commands.

Both remain Figma Design classic-plugin manifests with `documentAccess: "dynamic-page"` and offline `networkAccess.allowedDomains: ["none"]`.

The current publishable release line includes the capabilities already production-accepted through retained P5/P6/P7 runtime closure:

- Open WP Builders Prepare;
- Audit & Backlog;
- Compare Two Frames;
- Audit & Export Report;
- integrated Safe Fix preview/apply/restore/finalize behind the local build safety check;
- advanced-structure analysis/conservative planning in the normal audit/prep flow;
- bounded sequential multi-Frame batch preparation with checkpoint and cooperative-cancellation behavior.

Developer-only commands such as P5/P6/P7 evidence viewers, runtime calibration and closure helpers remain excluded from the normal release menu/UI.

## Build a publishable package

A real release build requires two pieces of provenance that the repository will not invent:

1. the Figma plugin ID assigned by Figma;
2. the exact full Git source SHA being packaged.

Example:

```bash
FIGMA_PLUGIN_ID="<real-numeric-plugin-id>" \
SOURCE_SHA="<40-character-git-sha>" \
npm run build:release

npm run verify:release
```

Output:

```text
dist-release/
  plugin/
    manifest.json
    code.js
    ui.html
  RELEASE_INFO.json
  SHA256SUMS.txt
```

`plugin/` intentionally contains only the runtime files referenced by the release manifest. Provenance lives beside the plugin folder, not inside it.

The builder/verifier fail closed on placeholder or mismatched plugin ID, unexpected runtime files, release-menu drift, developer-command leakage, network-access drift, package-version drift, source-SHA format errors, runtime SHA-256 mismatch, non-byte-exact `SHA256SUMS.txt`, or fixture packages presented as publishable.

## P12 authoritative final-release workflow

`.github/workflows/p12-final-release.yml` binds the accepted integrated release line to the real development-plugin identity already observed in Figma (`1679803102348456572`) and the exact GitHub source SHA for the workflow run.

For every PR it validates the final-release contract. On `main` it additionally uploads an authoritative retained bundle after all of the following pass:

- repository/status/type/test checks;
- release-contract verification;
- publishable Community-metadata verification;
- two independent real-ID release builds from the same source/run identity;
- byte-for-byte reproducibility comparison;
- release-package verification for both builds;
- deterministic `FINAL_RELEASE_ATTESTATION.json` generation;
- bundle SHA-256 manifest generation.

The uploaded bundle contains the pristine release package plus the filled Community listing/assets and attestation. This proves package identity/provenance/reproducibility; it does **not** prove publisher eligibility, installed/private-plugin behavior, credentialed REST behavior or Community approval.

## Normal-user command surface

Figma's manifest `menu` commands are dispatched through `figma.command`.

- `open` opens the integrated UI and, when one Frame is already selected, performs the normal audit flow.
- `audit` audits one selected Frame and generates the actionable backlog.
- `validate` compares exactly two selected Frames using the P3 integrity/rendered-pixel path.
- `export-report` runs the audit path so audit/backlog JSON and Markdown become available in the export panel.

The integrated UI additionally exposes the accepted Safe Fix/build-safety/batch controls without adding developer-only manifest commands.

The UI exports:

- `audit-report.json`;
- `audit-report.md`;
- `backlog.json`;
- `backlog.md`.

## Local development import

Development import remains separate from the release package:

```bash
npm run build
npm run prepare:figma-import -- <actual-development-plugin-id> dist dist-local-sibling
```

Then import `dist-local-sibling/manifest.json` through Figma Desktop development-plugin tooling. Never use a nested output under the source artifact.

P5, P6 and P7 runtime acceptance was completed against retained exact CI-built development-plugin artifacts. P12 still requires a final normal installed/private-plugin flow check for the final integrated release package; that observation cannot be inferred from repository CI.

## Private organization distribution

Figma supports internal/private organization plugin distribution subject to the publisher's plan, permissions and eligibility. Before an internal publish:

1. build and verify the exact release package;
2. retain the final package provenance/attestation;
3. complete the final normal installed/private-plugin flow;
4. review the privacy/network disclosure;
5. publish from Figma Desktop using the intended eligible organization/account.

## Community publication

Community publication is **not** automatic. Submission must be performed through the appropriate Figma publishing flow and is subject to Figma review. Re-check Figma's current publishing requirements immediately before submission because they may change.

Current official references used by this repository:

- Manifest: https://developers.figma.com/docs/plugins/manifest/
- Classic Community publishing: https://help.figma.com/hc/en-us/articles/360042293394-Publish-classic-plugins-to-the-Figma-Community
- Review guidelines: https://help.figma.com/hc/en-us/articles/360039958914-Plugin-and-widget-review-guidelines
- Internal organization plugins: https://help.figma.com/hc/en-us/articles/4404228629655-Create-internal-plugins-for-an-organization

Figma's live publishing flow remains the authority for publisher identity, category availability, support-contact requirements, 2FA, review and approval.

## Community metadata and assets

`community/listing.template.json` remains the machine-checkable human/publisher template. `community/listing.publishable.json` is the filled release candidate currently tracked for Community submission.

The publishable listing includes:

- final product name/tagline/description;
- `Software development` category candidate;
- support contact via the repository issue tracker;
- `Community` publish target;
- privacy-policy path;
- final icon/thumbnail/carousel asset paths;
- explicit review and 2FA requirements.

Validate both states with:

```bash
npm run community:verify
npm run community:verify:publishable
```

Publishable verification rejects unresolved placeholders, missing support contact/category/target, missing files, invalid PNG signatures/dimensions and an invalid carousel count.

The final in-repository visual set is:

- `community/assets/icon.png` — 128 × 128;
- `community/assets/thumbnail.png` — 1920 × 1080;
- `community/assets/carousel-01-audit.png` — 1920 × 1080;
- `community/assets/carousel-02-safe-fix.png` — 1920 × 1080;
- `community/assets/carousel-03-batch.png` — 1920 × 1080.

These files satisfy the repository's Community asset contract. Actual live-category acceptance and final visual approval remain part of the Figma submission/review process.

## Privacy and network declaration

The release manifest is offline: `allowedDomains: ["none"]`.

Technical disclosure: `docs/PRIVACY.md`.

The final publisher remains responsible for legal review and any privacy/security disclosures required for the actual release.

## Versioning and updates

- `package.json` is the canonical software version.
- development and release builds compile the plugin version from that package value.
- `CHANGELOG.md` records release-facing changes.
- `RELEASE_INFO.json` binds package version + real Figma plugin ID + source SHA + runtime file hashes.
- `FINAL_RELEASE_ATTESTATION.json` additionally binds the release package to the filled Community listing/assets.
- material Community updates may be subject to Figma re-review.

## P12 boundary

Repository-side final release packaging/Community metadata can be proven by CI, but P12 still requires genuine external observations for:

- real plugin backlog/report export quality on the final integrated line;
- real credentialed Figma REST URL/file-key CLI execution;
- real API auth/error behavior and plugin/CLI parity;
- final normal installed/private-plugin flow;
- intended publisher/account eligibility;
- actual Figma Community submission/review/approval.

Do not describe the plugin as Community-approved or P12=100% until every required real-world gate above has passed.