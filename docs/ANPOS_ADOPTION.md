# ANPOS child adoption

Status: **FOUNDATION APPLIED / FULL REQUIREMENT CERTIFICATION PENDING**  
Source protocol: [ANPOS 1.4.0](https://github.com/Vertex-Systems-Network/ai-native-project-operating-system)  
Repository: `Vertex-Systems-Network/wp-elementor-prep`

## What was applied

This repository now has a project-specific ANPOS routing and applicability layer:

- `.ai/manifest.json` routes agents to the existing state/memory/evidence surfaces.
- `config/protocol/instance.json` declares this repository as an active project derived from the ANPOS source.
- `config/protocol/anpos-adoption.json` maps Requirements 1–96 to evidence-backed statuses and next actions.
- `scripts/validate-anpos-adoption.mjs` validates the adoption metadata, exact requirement coverage and route integrity.
- `npm run anpos:validate` and Integration Readiness execute the validator.

## What was deliberately not copied

The canonical ANPOS repository is an inert reusable source and contains vendor-only or capability-dependent blueprints. This project does **not** copy or activate:

- `commercial-service/`, Marketplace billing, entitlements, webhook secrets or deployment credentials;
- a PM provider, OAuth connection, agent pool or provider privacy claims;
- Supervisor leases, CAS/fencing, privileged consent callbacks or repository-admin rule writes;
- production, target compatibility, publishing or Marketplace authority.

Those capabilities stay unavailable until their own implementation, authorization and runtime evidence exist.

## Preservation contract

The adoption layer does not alter the Figma plugin's network-free contract, P15–P18 target/evidence authority, existing memory-bank history, or P19 freeze. The matrix records partial/planned/not-applicable requirements instead of promoting policy presence or CI success into implementation or production acceptance.

## Validation

Run:

```sh
npm run anpos:validate
```

A successful result means the adoption metadata is internally consistent. It does not certify the full ANPOS protocol, external integrations, production runtime or any target adapter.


## Applicable policy contracts

The adoption layer also carries inactive-by-default machine contracts for agent selection, trust/control-plane boundaries, quality gates, design evidence, data handling, release assurance, architecture decisions, risk, operations, PM selection/sync authority, consent requests and reference E2E scenarios. These files define safe defaults and evidence requirements; they do not connect providers, grant agent identity, enable privileged mutation or certify production.
