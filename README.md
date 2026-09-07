# WP Elementor Prep

AI-free Figma structure auditor and safe-prep engine for WordPress Elementor.

## Goal

Take an approved desktop Figma design and make its internal layout Elementor-ready **without visually redesigning it**. The long-term workflow is:

`Figma selection -> Audit -> Confidence classification -> Safe Fix -> Visual/geometry validation -> Report -> optional Elementor export`

The plugin is intentionally deterministic. It must not depend on Figma AI, OpenAI, Claude, or any other generative service for its core audit/refactor pipeline.

## Current phase

**Phase 1: Audit-Only MVP**

The repository now starts with planning, architecture, memory-bank, and an initial read-only scanner/scoring implementation. No destructive transformations are enabled yet.

## Core principles

- Original design is the visual source of truth.
- Never guess when confidence is low.
- Audit first; mutate only after the audit engine is proven.
- Candidate/validate/commit transactions for future fixes.
- Elementor-native output: containers, nested containers, widgets, gap, padding, sizing, minimal absolute positioning.
- No external network dependency in the core plugin.
- Memory-bank is mandatory and must be updated with every meaningful development session.

## Development

```bash
npm install
npm run build
npm test
```

Then register/import the development plugin in Figma using the generated `dist/manifest.json` after setting a valid plugin ID in `.env` or `FIGMA_PLUGIN_ID`.

## Project docs

- `docs/AI_NATIVE_PLAN.md`
- `docs/DEEP_AUDIT.md`
- `docs/FEATURE_PLAN.md`
- `docs/PRE_DEVELOPMENT_PLAN.md`
- `docs/ARCHITECTURE.md`
- `docs/ELEMENTOR_RULES.md`
- `memory-bank/` — canonical project state for humans and AI agents

## Golden fixture

The first reference design is the Marcus Vane desktop page that contains a broad mix of patterns: hero, two-column about, cards, metrics, timeline/journey, carousel/media, milestones, and footer. It is used as a **golden audit fixture**, not as hard-coded product logic.
