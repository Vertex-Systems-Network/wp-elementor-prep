# Decisions

## D-001 — Core runtime is AI-free
Date: 2026-09-07  
Status: ACCEPTED

Core audit/refactor correctness must not depend on generative AI, external model APIs, or token/credit availability.

Reason: the primary use case involves many pages and requires repeatability, cost control and deterministic behavior.

## D-002 — Audit before mutation
Date: 2026-09-07  
Status: ACCEPTED

No recipe may auto-fix a layout before the plugin can detect, score and explain that pattern read-only.

## D-003 — Conservative confidence model
Date: 2026-09-07  
Status: ACCEPTED

Low-confidence ambiguity produces REVIEW, not a guessed transformation.

## D-004 — Candidate transaction model
Date: 2026-09-07  
Status: ACCEPTED

Future transformations operate on cloned candidates and are committed only after validation. Failure discards the candidate and preserves the working section.

## D-005 — Visual design is authoritative
Date: 2026-09-07  
Status: ACCEPTED

The plugin may improve structure but may not redesign typography, imagery, color, content or visual composition merely to make Auto Layout easier.

## D-006 — Neutral internal model
Date: 2026-09-07  
Status: ACCEPTED

The Figma scanner/classifier uses a neutral semantic layout model. Any future Elementor JSON exporter is isolated behind versioned adapters.

## D-007 — Selected-frame MVP
Date: 2026-09-07  
Status: ACCEPTED

Version 0.1 processes one selected desktop frame. Multi-page scanning is postponed until single-frame accuracy/performance is proven.

## D-008 — Offline manifest
Date: 2026-09-07  
Status: ACCEPTED

Core plugin manifest uses dynamic page access and no network domains.

## D-009 — Memory-bank is mandatory
Date: 2026-09-07  
Status: ACCEPTED

Project status, decisions, roadmap, next actions and changelog must be persisted in-repo so future humans/AI agents can resume without relying on prior chat context.

## D-010 — Separate geometry, semantics and visual roles
Date: 2026-09-07  
Status: ACCEPTED

A geometric layout classification (for example `horizontal-row` or `grid`) is not the same thing as a semantic interpretation (`footer-columns`, `repeated-cards`, `timeline-chapter`) or a preservation role (`background-layer`, `absolute-overlay`).

Reason: future Auto-Fix must know both how content is arranged and which visual elements must not be normalized into ordinary flow.

## D-011 — Specific pattern wins on the same target
Date: 2026-09-07  
Status: ACCEPTED

When one target satisfies multiple geometric classifiers, report the most specific valid interpretation rather than redundant generic ones. Current specificity order is carousel track > grid > two-column > horizontal row > vertical stack.

Reason: a carousel track is also a row geometrically, but exposing both as competing repair targets creates noise and increases mutation risk.

## D-012 — Issues-first, PR/MR-second development lifecycle
Date: 2026-09-08  
Status: ACCEPTED

Every meaningful AI/developer work cycle must process repository work in this order:

1. inspect and process open Issues,
2. inspect/fix/merge eligible Pull Requests or Merge Requests,
3. only then start new roadmap development.

At the end of every meaningful work batch, the root README must be updated with evidence-based module-wise progress percentages, visual progress bars, blockers/next work, and an overall progress bar. The memory-bank must also be synchronized.

Reason: existing defects and integration work should not be bypassed by new feature development, and repository state must remain immediately understandable to future agents without relying on chat history.

Runtime/manual evidence gates remain authoritative; the workflow must never fabricate evidence simply to close an issue or merge a branch.

## D-013 — Backlog is a first-class product output
Date: 2026-09-10  
Status: ACCEPTED

Audit/prep findings must be convertible into a deterministic structured backlog with `ERROR`, `WARNING`, `INFO`, and `IMPROVEMENT` categories.

Each backlog item should be traceable, deduplicatable, lifecycle-aware, and actionable. Unsafe/ambiguous findings should become backlog work rather than guessed mutations.

Reason: the product must support continuous improvement across many Figma files, not only one-off audit reports.

## D-014 — Plugin and CLI share one deterministic core
Date: 2026-09-10  
Status: ACCEPTED

The normal Figma plugin and npm/Node CLI must share scanner/classifier/scoring/backlog logic. Input acquisition is isolated behind source adapters.

Initial CLI source adapters:
- official Figma REST API for cloud URL/file key;
- canonical versioned snapshot/package files for path-based/offline use.

A proprietary raw `.fig` file must not be reverse-engineered through an undocumented parser. Until a supported bridge exists, raw `.fig` path input fails clearly rather than guessing.

Reason: one core prevents plugin/CLI drift and preserves deterministic behavior while allowing different input surfaces.

## D-015 — Product ships as a normal Figma plugin
Date: 2026-09-10  
Status: ACCEPTED

The release plan must include production plugin packaging/distribution, not only development-plugin import.

The same core should support:
- local development import;
- private/team/organization distribution where applicable;
- a Community-ready release package and submission checklist.

Community publication itself remains subject to Figma review and is not assumed to be automatic.

## D-016 — Final manual/runtime acceptance is batched in P12
Date: 2026-09-10  
Status: ACCEPTED

Current project direction is to finish planned implementation before performing manual/runtime/end-to-end product testing.

Until P12:
- implementation may continue;
- production safety locks and provenance rules remain in place;
- no real Figma evidence may be fabricated;
- implementation-complete must not be confused with production-accepted;
- automated repository checks, if they run, are implementation safeguards only and do not count as final product acceptance.

P12 is the final integrated validation phase covering P5/P6/P7 plus backlog, CLI/source adapters, plugin distribution and release-package behavior.

Reason: manual Figma/runtime testing is currently unavailable and should be batched once implementation scope is complete instead of repeatedly blocking development.
