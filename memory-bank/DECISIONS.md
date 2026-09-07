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

Reason: Elementor supports modern nested containers and is evolving atomic elements; exporter schema changes must not destabilize core audit logic.

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
