# P15 First Controlled Elementor Target-Proof Vector

Status: **operator-input preparation only / non-authorizing**.

This document defines the reproducible input vector intended for the first genuine controlled Elementor target observation tracked by issue #483. It does not contain or imply WordPress/Elementor runtime evidence.

## Generate or verify the exact vector

```bash
npm run p15:elementor-first-proof-vector -- \
  --out-dir dist-p15/p15-elementor-first-proof-vector-v1
```

Behavior is fail closed:

- if the output directory does not exist, the command builds the vector through the accepted production neutral-IR -> Elementor v3 generator path and stages the five files before committing the directory;
- if the directory already exists, every expected file must match the freshly rebuilt vector byte-for-byte;
- missing, unexpected or drifted files are rejected and are not overwritten;
- duplicate CLI options are rejected.

## Frozen vector contents

The vector intentionally exercises only already accepted bounded P15 behavior:

- one Elementor Container generated from `p15-neutral-export-ir-v2`;
- one heading and one text-editor child;
- opaque solid background `#336699`;
- uniform `12px` radius;
- no image/widget asset dependency;
- no review node;
- Container/Template JSON path only;
- Atomic elements remain unsupported.

The immutable declared TargetProfile records the frozen first-proof target selected from the 2026-09-16 R0 boundary:

- WordPress `6.8.0`;
- Elementor `4.2.4`;
- architecture `CONTAINER`;
- output mode `TEMPLATE_JSON`;
- Atomic elements `UNSUPPORTED`.

These are **declared target versions**, not observed environment facts. The real environment packet for #483 must record what is actually observed and must not rewrite those observations to match this profile.

## Files and operator use

The generated directory contains exactly:

- `neutral-ir.json` — deterministic source vector for local reproduction;
- `candidate.json` — canonical candidate envelope used by P15 proof/intake binding;
- `target-profile.json` — immutable declared TargetProfile used by proof binding;
- `template.json` — exact Elementor Template Library JSON to import during the controlled target observation;
- `manifest.json` — vector version, generator version, candidate identity, TargetProfile fingerprint, exact file SHA-256 values and explicit non-authority flags.

For #483, import **`template.json`** through Elementor Template Library JSON. Retain **`candidate.json`** and **`target-profile.json`** unchanged for standalone proof intake and the combined environment/proof-chain intake.

## Required authority boundary

Local vector generation or verification means only that the operator inputs are deterministic and internally consistent.

The manifest therefore remains explicit:

- `candidateStatus=READY_FOR_TARGET_IMPORT_VALIDATION`;
- `importValidationStatus=NOT_RUN`;
- `targetEnvironmentObserved=false`;
- `importObserved=false`;
- `editorObserved=false`;
- `renderObserved=false`;
- `acceptanceAuthority=false`;
- `targetCompatibilityClaim=false`;
- `productionAcceptance=false`;
- `internalReviewRequired=true`.

Do not convert local generation, exact hashes, CI success, or byte-for-byte verification into an Elementor import/render claim.

## #483 controlled target procedure

After generating/verifying the vector:

1. capture the genuine controlled WordPress/Elementor environment and run `p15:elementor-target-environment-intake`;
2. proceed only under the accepted #483 environment rules;
3. import the exact generated `template.json` through Elementor Template Library JSON;
4. record the real import result;
5. only after import PASS, record editor-open; only after editor-open PASS, record render/preview;
6. observe only the bounded fidelity slice: structure, solid background, uniform radius;
7. build genuine `elementor-target-proof-evidence-v1` using the exact candidate identity, TargetProfile fingerprint and durable evidence/run reference;
8. run `p15:elementor-target-proof-intake` with the exact `candidate.json` and `target-profile.json`;
9. run `p15:elementor-target-proof-chain-intake` with the exact candidate/profile/environment/proof set;
10. retain all vector files, environment/proof inputs, reports, fingerprints and evidence reference together;
11. perform separate internal review before changing any P15 authority/status.

A successful Container/template observation never establishes Atomic-v4 support or production acceptance.
