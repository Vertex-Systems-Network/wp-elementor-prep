# P11 Figma plugin release and distribution

This document defines the production/distribution layer for the classic Figma plugin. P11 prepares the package; P12 performs the final manual/runtime/release acceptance.

## Release architecture

Development and release manifests are intentionally separate:

- `manifest.template.json` — local development/import template;
- `manifest.release.template.json` — normal-user release manifest with an explicit user menu and no developer-only commands.

Both remain Figma Design classic-plugin manifests with `documentAccess: "dynamic-page"` and offline `networkAccess.allowedDomains: ["none"]`.

The release manifest currently exposes only capabilities implemented on current `main`:

- Open WP Builders Prepear;
- Audit & Backlog;
- Compare Two Frames;
- Audit & Export Report.

P5/P6/P7 Safe Fix, advanced structures and batch processing are deliberately **not** exposed in the current release manifest because those feature heads are still waiting for the final P12 integration/validation sequence. When that integrated code lands, the release menu may be extended only after the command implementation is present and P12 validates it.

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

The builder fails if the plugin ID or source SHA is missing/invalid. The verifier fails on:

- placeholder/mismatched plugin ID;
- unexpected runtime files;
- release menu drift;
- developer-command leakage;
- network-access drift;
- package-version drift;
- source-SHA format errors;
- runtime SHA-256 mismatch;
- non-byte-exact `SHA256SUMS.txt`;
- fixture package used as publishable.

CI uses an explicitly marked fixture build only to verify packaging mechanics. A fixture is not a publishable artifact.

## Normal-user command surface

Figma's manifest `menu` commands are dispatched through `figma.command`.

- `open` opens the UI and, when one Frame is already selected, performs the normal audit flow.
- `audit` audits one selected Frame and generates the backlog.
- `validate` compares exactly two selected Frames using the existing P3 integrity/rendered-pixel path.
- `export-report` runs the audit path so audit/backlog JSON and Markdown become available in the export panel.

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

Then import `dist-local-sibling/manifest.json` through Figma Desktop development-plugin tooling.

Never use a nested output under the source artifact.

## Private organization distribution

Figma currently supports internal plugins for Organization and Enterprise plans. A publisher can choose the Organization publishing target so the plugin is available internally without Community review. Organization permissions and publisher eligibility still apply.

Before an internal publish:

1. build and verify the exact release package;
2. complete P12 runtime acceptance for the integrated build;
3. fill the real support contact and final listing metadata;
4. review the privacy/network disclosure;
5. publish from Figma Desktop using the intended organization profile.

## Community publication

Community publication is **not** automatic. Figma requires submission from the desktop app and reviews classic plugins before listing them publicly.

Current official references used by this repository:

- Manifest: https://developers.figma.com/docs/plugins/manifest/
- Classic Community publishing: https://help.figma.com/hc/en-us/articles/360042293394-Publish-classic-plugins-to-the-Figma-Community
- Review guidelines: https://help.figma.com/hc/en-us/articles/360039958914-Plugin-and-widget-review-guidelines
- Internal organization plugins: https://help.figma.com/hc/en-us/articles/4404228629655-Create-internal-plugins-for-an-organization

At submission time, re-check those pages because publishing requirements can change.

Figma's current publishing flow requires a support contact and Community submissions go through review. Figma also expects plugins to be thoroughly tested, accurately described, secure, and based on official Plugin APIs.

## Community metadata template

`community/listing.template.json` provides a machine-checkable draft containing:

- name;
- tagline;
- accurate current capability description;
- up to five tags;
- category placeholder to select in the live Figma publishing modal;
- support-contact placeholder;
- Community-vs-Organization target placeholder;
- privacy-policy path;
- final icon/thumbnail placeholders;
- carousel list;
- review and 2FA requirements.

Validate the repository template:

```bash
npm run community:verify
```

Before publishing, create a filled copy and run:

```bash
node scripts/verify-community-readiness.mjs /path/to/filled-listing.json --publishable
```

Publishable mode rejects unresolved placeholders, missing support contact, missing final icon/thumbnail files, missing category and invalid publishing target.

## Visual listing assets

The repository intentionally does not invent final brand artwork. The metadata template records the current recommended preparation sizes used by Figma's publishing guidance:

- icon: 128 × 128 px;
- thumbnail: 1920 × 1080 px;
- optional carousel: up to 9 images/videos.

Final visual assets are a publisher/brand deliverable and must be supplied before P12 Community-readiness sign-off.

## Privacy and network declaration

The release manifest is offline: `allowedDomains: ["none"]`.

Technical disclosure: `docs/PRIVACY.md`.

The final publisher remains responsible for legal review and any privacy/security disclosures required for the actual release.

## Versioning and updates

- `package.json` is the canonical software version.
- development and release builds compile the plugin version from that package value.
- `CHANGELOG.md` records release-facing changes.
- `RELEASE_INFO.json` binds package version + real Figma plugin ID + source SHA + runtime file hashes.
- material Community updates may be subject to Figma re-review.

## P12 boundary

P11 implementation is complete when release packaging, verification, command/export surface, distribution documentation and Community readiness templates are merged and CI-clean.

P12 still must validate:

- exact final integrated release build;
- local development import;
- normal installed/private plugin flow;
- final P5/P6/P7 integration/runtime behavior;
- P9 report/backlog exports;
- P10 plugin/CLI parity;
- filled Community listing + real support contact + final visual assets;
- final release package provenance;
- actual submission readiness.

Do not describe the plugin as Community-approved or production-accepted before those gates pass.
