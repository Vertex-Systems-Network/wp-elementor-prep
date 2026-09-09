# Changelog

All notable release-facing changes to WP Elementor Prep are recorded here.

The project separates implementation completion from final runtime/release acceptance. Entries may describe implemented capabilities that still require P12 integrated validation before production acceptance.

## [0.1.0-alpha.1] - 2026-09-10

### Added
- Deterministic Figma structure audit and P3 integrity validation surfaces.
- Actionable ERROR / WARNING / INFO / IMPROVEMENT backlog generation with deterministic IDs, lifecycle/delta tracking and JSON/Markdown exports.
- npm/Node CLI for official Figma REST URL/file-key input and canonical snapshot input.
- Explicit fail-closed `UNSUPPORTED_FIG_LOCAL_FILE` behavior for raw proprietary `.fig` input.
- Normal-plugin release manifest/menu layer for capabilities currently integrated on `main`.
- Audit report and backlog JSON/Markdown exports from the plugin UI.
- Deterministic Figma release package builder with plugin-ID/source-SHA provenance and SHA-256 file pins.
- Release package verification, Community metadata readiness checks, privacy/network disclosure and distribution guidance.

### Safety
- Release plugin remains offline through `networkAccess.allowedDomains: ["none"]`.
- Developer-only evidence/self-test commands are excluded from the normal release menu.
- Release output paths that overlap repository/source/dependency locations are rejected before destructive cleanup.
- Safe Fix/Prep, advanced structures and batch capabilities are not exposed by the current normal release menu until their final integrated P12 line exists.

### Validation pending
- Real Figma plugin install/run acceptance.
- P5/P6/P7 final integrated runtime closure.
- Real credentialed Figma CLI execution and plugin/CLI parity.
- Windows/macOS CLI path validation.
- Filled Community metadata, final visual assets, actual submission readiness and Figma review.
