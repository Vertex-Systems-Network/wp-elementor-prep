# P12 Publisher Evidence Intake

Status: active support tooling for issue #84  
Owner issue: #126 (subtask of #84)

## Purpose

The final P12 internal release exit depends on a small set of live Figma Desktop/account observations that repository CI cannot fabricate:

1. the exact authoritative release #20 publish ZIP is the package being used;
2. that exact package opens/runs in Figma Desktop;
3. the live Publish flow accepts the generated Figma plugin ID;
4. the intended publisher identity / Community target / support contact / no-network disclosure are visible;
5. the account has the required 2FA state.

`scripts/p12-publisher-evidence-intake.mjs` makes this evidence collection deterministic and fail-closed. It does **not** inspect screenshot pixels, run OCR, infer account state, submit the plugin, or grant acceptance by itself.

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

## Required screenshots

Keep three separate regular image files:

1. `runtime` — exact release #20 plugin visibly open/running in Figma Desktop on the known acceptance design/frame.
2. `publish` — Publish → Add final details with no `Invalid ID in manifest.json` error, intended Publish-as identity, Community target, support contact, and `No network access` visible.
3. `twofa` — Figma account/security UI showing the required 2FA state enabled.

The intake tool hashes these files but does not interpret their content. The operator must explicitly confirm the observed facts through command flags. This prevents a hash-only receipt from pretending it proved something that was never visually checked.

## Command

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

The intake fails when any of these conditions is true:

- the exact publish ZIP is missing, empty, oversized, symlinked, or has the wrong SHA-256;
- any extracted plugin file is missing, extra, symlinked, empty, or has the wrong SHA-256;
- manifest name/ID/API/editor/document-access/network contract does not match the pinned release #20 candidate;
- any required screenshot is missing, empty, oversized, or symlinked;
- any required explicit operator confirmation is absent or not `yes`.

A generated receipt contains:

- candidate release identity;
- exact ZIP and extracted-file hashes;
- manifest contract;
- screenshot filenames, sizes and SHA-256 values;
- explicit operator attestations;
- `acceptanceAuthority: false`;
- `finalInternalAcceptanceRequiresSeparateReview: true`.

## What the receipt does not prove

The receipt deliberately does not claim:

- Figma approved the Community listing;
- the plugin is currently public;
- a paid Community plan is enabled;
- seller/Stripe eligibility;
- screenshots were machine-interpreted;
- P12 is automatically 100%.

After a complete receipt exists, #84 still requires a human/internal review of the retained screenshots and receipt before marking `P12 = 100% / INTERNAL RELEASE ACCEPTED`.

Actual Figma Community review/approval remains an external state.
