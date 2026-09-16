# Next Actions

Last updated: 2026-09-16

Runtime artifact preflight requires `config/runtime-artifacts.json` schema-v3 and must fail closed on stale or mismatched registered artifacts.

## Execution mode — focused Elementor V1 release train

Prioritize one coherent Elementor commercial V1. Keep P16 stable unless a concrete shared blocker appears, and keep P17-P26 frozen during this window.

Use focused typecheck/tests/builds while iterating. Before merge, the exact PR head must pass the repository's full CI / P12 Final Release Artifact / P12 Offline Acceptance gates. Canonical docs synchronize once per behavior-changing release train rather than in separate ceremonial docs PRs.

## Authority boundaries that must remain true

- P12 — **IN PROGRESS / 80%**; historical publishing authority remains Final Release Artifact #20 from source `5f12b1d28146d5c2af815cc9f83eb30431dce4b5`, plugin ID `1680034649341961379`.
- P13 — **IMPLEMENTATION COMPLETE / RUNTIME ACCEPTANCE PENDING**; #159 requires genuine Figma Desktop evidence.
- P14 — **CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED**; `PRODUCTION_P14_SAFE_RECIPE_REGISTRY` remains empty.
- P15 — **CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED**.
- P16 — **CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED**.
- P17-P26 — **PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED**.
- P27 — **GATE DEFINED / EXECUTION DEFERRED** under #182.
- #287 remains repository-admin branch/ruleset enforcement work.

Never promote local artifact validation, declared profile alignment, mapping readiness, caller-supplied evidence or CI success into real target compatibility/import/render/production authority.

## Current P15 release train — issue #477 / PR #478

PR #478 implements an explicit fresh local Elementor Template JSON download path on top of the accepted P15 generator/readiness foundation.

Initial implementation head `4367068e4b967f01315a5fa0a04156f94079a2aa` passed:

- CI #1266;
- P12 Final Release Artifact #577;
- P12 Offline Acceptance #621.

The canonical docs commit moves the PR head, so these are implementation-feedback proofs only. Final exact-head gates must pass again before merge.

Accepted behavior for this train:

- every download request reads exactly one **current** selected Frame;
- extraction, mapping readiness and generation rerun from scratch on each request;
- no preview/client-storage/cached artifact is reused;
- eligibility requires valid/review-free extraction, mapping status exactly `READY`, no blockers/review items, generation `GENERATED_LOCAL_CANDIDATE`, candidate `READY_FOR_TARGET_IMPORT_VALIDATION`;
- the template is rebuilt through the existing candidate validator immediately before exposure and must match the generation candidate exactly;
- success exposes only the immediate Template JSON plus a sanitized deterministic receipt;
- filename is hash-derived and does not expose frame names/source copy;
- blocked/REVIEW/UNKNOWN/UNSUPPORTED/mismatch states expose no artifact;
- normal preview and declared TargetProfile reports remain non-download/sanitized surfaces;
- release UI displays **LOCAL ARTIFACT VALIDATED** and **TARGET IMPORT NOT VERIFIED**.

For this local-download result only, `fileDownload=true` is permitted after the fresh local validation gate. It does **not** change:

- `targetCompatibilityClaim=false`;
- `productionAcceptance=false`;
- `importValidationStatus=NOT_RUN`;
- `targetEnvironmentValidationStatus=NOT_RUN`;
- `environmentObserved=false`;
- no WordPress/Elementor connection/network;
- no target import/editor/render execution;
- no section/clipboard transfer;
- no Figma mutation.

### Immediate action

Run final diff audit and full exact-head CI / Final / Offline gates on PR #478 after this canonical docs sync. Merge only if all required checks pass on the same head.

## Next P15 slice — minimum deterministic visual fidelity

After #478 merges, create one bounded issue/release train for a small high-value mapping pack. Start only with Figma facts that map unambiguously to documented Elementor v3 controls, for example:

- simple solid container background color;
- bounded uniform border radius;
- basic text font size;
- basic font weight;
- text color;
- line height;
- basic width/min-height where current source facts are unambiguous.

Rules:

- extend the neutral IR rather than embedding Figma/Elementor-specific control names across layers;
- no semantic guessing from node/layer names;
- mixed fills, effects, unresolved variables, complex typography or unsupported target controls remain REVIEW;
- do not invent responsive/tablet/mobile behavior;
- deterministic mappings require focused serializer/extractor/readiness tests;
- the explicit download gate must continue failing closed if new supported facts cannot be serialized/revalidated safely.

## Following slice — one real Elementor import proof

After the minimum fidelity pack is stable, use a controlled real Elementor environment to import a known generated V1 fixture and retain genuine import/editor/render observations through the existing P15 evidence chain.

Only evidence actually retained may change import/target/production states. Local JSON validity alone is never enough.

## Parallel operator/runtime evidence

When the required real environment/operator is available, these can proceed independently without blocking safe P15 code work:

- #159 — genuine Figma Desktop P13 runtime/parity evidence + separate internal review;
- #84/#182 — remaining P12 package/publisher/account/2FA/final-exit evidence.

Do not fabricate either from CI/repository metadata.

## AI-native speed rules

- one acceptance objective -> one focused release train;
- parallelize only across non-overlapping ownership;
- isolate new controllers/adapters where practical instead of repeatedly editing shared hotspots;
- focused verification during iteration;
- full exact-head gates at merge;
- one canonical status sync per behavior-changing train;
- no synthetic overall percentage;
- no synthetic runtime/target/external evidence.
