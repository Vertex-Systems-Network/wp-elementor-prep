# Changelog

All notable release-facing changes to WP Builders Prepare are recorded here.

The project separates implementation completion from final runtime/release acceptance. Entries may describe repository-ready capabilities while external Figma account/API/install/Community review gates remain open.

## [0.1.0-alpha.1] - 2026-09-10

### Added
- Deterministic Figma structure audit and P3 integrity validation surfaces.
- Actionable ERROR / WARNING / INFO / IMPROVEMENT backlog generation with deterministic IDs, lifecycle/delta tracking and JSON/Markdown exports.
- npm/Node CLI for official Figma REST URL/file-key input and canonical snapshot input.
- Explicit fail-closed `UNSUPPORTED_FIG_LOCAL_FILE` behavior for raw proprietary `.fig` input.
- Production-accepted P5 Safe Fix with local build safety gate, reversible checkpoint and mandatory visual validation.
- Production-accepted P6 advanced-structure analysis and conservative page-flow planning/refusal behavior.
- Production-accepted P7 bounded sequential batch queue with checkpoint handling, retry/resume and cooperative cancellation.
- Normal-user release UI for audit/backlog, validation, Safe Fix, build safety check and sequential batch preparation.
- Audit report and backlog JSON/Markdown exports from the plugin UI.
- Deterministic Figma release package builder with plugin-ID/source-SHA provenance and SHA-256 file pins.
- Release package verification, Community metadata readiness checks, privacy/network disclosure and distribution guidance.
- Filled Community publishable metadata plus final 128×128 icon, 1920×1080 thumbnail and three 1920×1080 carousel images.
- P12 final-release workflow for exact real-plugin-ID/source-SHA packaging, byte-reproducibility verification and deterministic release attestation.

### Safety
- Release plugin remains offline through `networkAccess.allowedDomains: ["none"]`.
- Developer-only P5/P6/P7 evidence and calibration commands are excluded from the normal release menu/UI.
- Safe Fix and batch mutation remain locked until the local build safety check passes for the compiled build.
- Release output paths that overlap repository/source/dependency locations are rejected before destructive cleanup.
- Final release attestation rejects fixture packages, plugin-ID drift, source-SHA drift and Community/release name mismatch.

### Runtime acceptance completed
- P5 compiled-runtime closure accepted from the retained real Figma development-plugin artifact and merged to `main`.
- P6 image-bearing positive plus preservation-refusal closure accepted and merged to `main`.
- P7 64-Frame sequential stress plus active cooperative cancellation closure accepted and merged to `main`.
- Linux/macOS/Windows P12 offline acceptance passes for CLI execution, deterministic outputs and release reproducibility mechanics.

### Validation pending
- Real plugin backlog/report export quality on the final integrated release line.
- Real credentialed Figma REST CLI execution, auth/error behavior and plugin/CLI parity.
- Final normal installed/private plugin flow using the exact integrated release package.
- Publisher/account eligibility confirmation and actual Figma Community submission, review and approval.
