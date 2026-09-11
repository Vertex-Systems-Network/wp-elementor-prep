# P12 Publisher Evidence Intake

Status: active support tooling for issue #84  
Owner issue: #126 (subtask of #84); package-preflight follow-up: #148; screenshot-integrity follow-up: #151

## Purpose

The final P12 internal release exit depends on a small set of live Figma Desktop/account observations that repository CI cannot fabricate:

1. the exact authoritative release #20 publish ZIP is the package being used;
2. that exact package opens/runs in Figma Desktop;
3. the live Publish flow accepts the generated Figma plugin ID;
4. the intended publisher identity / Community target / support contact / no-network disclosure are visible;
5. the account has the required 2FA state.

`scripts/p12-publisher-evidence-intake.mjs` supports two deliberately separate steps:

- **package-only preflight** — verifies the pinned release #20 ZIP, extracted files and manifest before Figma Desktop is opened;
- **final evidence intake** — verifies the same package again, validates that each supplied screenshot is a supported image file, requires three distinct screenshot byte streams, hashes them, and requires explicit operator attestations.

Neither step interprets screenshot pixels, runs OCR, infers account state, submits the plugin, or grants acceptance by itself.

The exact candidate is pinned in `config/p12-publisher-candidate.json`.

## Exact authoritative candidate

- plugin: `WP Builders Prepare`
- package version: `0.1.0-alpha.1`
- Figma plugin ID: `1680034649341961379`
- source SHA: `5f12b1d28146d5c2af815cc9f83eb30431dce4b5`
- Final Release Artifact: `wp-builders-prepare-final-release-20`, ID `10179286885`
- authoritative release bundle SHA-256: `698d6620dac85af4bd1dba9c402bccc74192072da9af2a1031060903eeeb606f`
- exact three-file publish ZIP SHA-256: `1ccfa457d4ae4145cf36b748f7758187ef3092503c270a46f28e03675878a066`

The extracted three-file directory must contain exactly:

- `code.js`
- `manifest.json`
- `ui.html`

Their SHA-256 values are pinned in the candidate config.

## Step 1 — package-only preflight

Run this **before** opening Figma Desktop. It proves only that the operator is holding the exact pinned release #20 publish ZIP and matching extracted package.

```bash
npm run p12:publisher-preflight -- \
  --package-zip=/absolute/path/WP-Builders-Prepare-Final-Publish-ID-1680034649341961379.zip \
  --package-dir=/absolute/path/extracted-publish-package \
  --out=dist-p12/p12-publisher-package-preflight.json
```

The preflight receipt includes:

- exact candidate identity;
- ZIP SHA-256 and size;
- extracted `code.js`, `manifest.json`, and `ui.html` hashes/sizes;
- validated manifest name/ID/API/editor/document-access/network contract;
- `packagePreflightComplete: true`;
- `evidenceBundleComplete: false`;
- `runtimeEvidenceCollected: false`;
- `acceptanceAuthority: false`.

Preflight mode rejects runtime screenshot and operator-confirmation arguments. This prevents a package-only receipt from being mistaken for live Figma evidence.

A package preflight PASS grants **zero P12 progress credit**. It only reduces the chance of capturing live screenshots against the wrong package.

## Required screenshots for final intake

Keep three separate regular image files:

1. `runtime` — exact release #20 plugin visibly open/running in Figma Desktop on the known acceptance design/frame.
2. `publish` — Publish → Add final details with no `Invalid ID in manifest.json` error, intended Publish-as identity, Community target, support contact, and `No network access` visible.
3. `twofa` — Figma account/security UI showing the required 2FA state enabled.

Each screenshot must contain actual **PNG, JPEG, or WebP** bytes. The tool detects the format from the file signature rather than trusting the filename extension. The three evidence roles must also have three different SHA-256 hashes, so one image cannot be reused to satisfy multiple evidence slots.

The final intake records the detected image format, filename, size and SHA-256 for each screenshot. It still does **not** interpret the screenshot contents. The operator must explicitly confirm the observed facts through command flags, and a separate human/internal review remains mandatory.

## Step 2 — final evidence intake

From the repository root:

```bash
npm run p12:publisher-evidence -- \
  --package-zip=/absolute/path/WP-Builders-Prepare-Final-Publish-ID-1680034649341961379.zip \
  --package-dir=/absolute/path/extracted-publish-package \
  --runtime-screenshot=/absolute/path/runtime.png \
  --publish-screenshot=/absolute/path/publish-final-details.png \
  --twofa-screenshot=/absolute/path/twofa-enabled.png \
  --confirm-exact-package-opened=yes \
  --confirm-valid-manifest-id=yes \
  --confirm-publisher-identity=yes \
  --confirm-community-target=yes \
  --confirm-support-contact=yes \
  --confirm-no-network-access=yes \
  --confirm-twofa-enabled=yes \
  --out=dist-p12/p12-publisher-evidence-receipt.json
```

On PowerShell, use one line or PowerShell backticks instead of shell backslashes.

## Fail-closed behavior

The package preflight and final intake both fail when any of these package conditions is true:

- the exact publish ZIP is missing, empty, oversized, symlinked, or has the wrong SHA-256;
- any extracted plugin file is missing, extra, symlinked, empty, or has the wrong SHA-256;
- manifest name/ID/API/editor/document-access/network contract does not match the pinned release #20 candidate.

The final evidence intake additionally fails when:

- any required screenshot is missing, empty, oversized, or symlinked;
- any screenshot does not contain PNG, JPEG, or WebP bytes by file signature;
- two or more required evidence roles use identical screenshot bytes / SHA-256 values;
- any required explicit operator confirmation is absent or not `yes`.

A generated final evidence receipt contains:

- candidate release identity;
- exact ZIP and extracted-file hashes;
- manifest contract;
- screenshot filenames, sizes, detected image formats and SHA-256 values;
- explicit operator attestations;
- `packagePreflightComplete: true`;
- `acceptanceAuthority: false`;
- `screenshotsAreFormatValidatedAndHashedNotInterpreted: true`;
- `screenshotsMustBeDistinct: true`;
- `finalInternalAcceptanceRequiresSeparateReview: true`.

## What neither receipt proves

Neither receipt deliberately claims:

- Figma approved the Community listing;
- the plugin is currently public;
- a paid Community plan is enabled;
- seller/Stripe eligibility;
- screenshots were machine-interpreted;
- P12 is automatically 100%.

Image signature validation proves only that the supplied evidence files are supported image formats. It does not prove what the screenshots visually show; that remains a human-review fact.

After a complete final evidence receipt exists, #84 still requires a human/internal review of the retained screenshots and receipt before marking `P12 = 100% / INTERNAL RELEASE ACCEPTED`.

Actual Figma Community review/approval remains an external state.
