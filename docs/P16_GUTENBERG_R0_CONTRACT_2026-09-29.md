# P16 Gutenberg R0 contract — 2026-09-29

Status: RESEARCH REFRESH / OFFLINE CONTRACT ONLY / AUTHENTICATED TARGET VALIDATION PENDING

This record defines the bounded Gutenberg target contract for the existing P16 candidate path. It does not claim that an exported artifact has been accepted by a real WordPress editor or site.

## Official observations

| Surface | Official contract | Consequence |
|---|---|---|
| Block serialization | WordPress provides a native block serialization specification and default parser for serialized post content. | Candidate output must be serialized block markup, then parsed and re-serialized deterministically before it can be considered structurally valid. |
| Block editor model | The Block Editor composes content from modular blocks and renders registered blocks through editor components. | A flat HTML export is not equivalent to native Gutenberg output; unsupported structure must remain REVIEW rather than silently flattening. |
| Patterns | Patterns are predefined groups of blocks intended for insertion and later customization. | A pattern export is a reusable candidate artifact, not proof of editor import or production rendering. |
| REST API | The REST API is the interface for JSON-based WordPress site operations and supports authenticated requests. | Any create/update/import or media operation requires a real authenticated target receipt; offline manifests cannot grant target authority. |
| Authentication | Cookie authentication uses logged-in dashboard cookies and nonces; other methods may be supplied by supported plugins. | The plugin core must not invent credentials or imply that caller-supplied metadata is live authentication evidence. |

## Bounded offline matrix

| Check | Offline status | Required live evidence |
|---|---|---|
| Supported core block mapping | Candidate/REVIEW | Real editor parse and render on pinned WordPress target |
| Serialized block grammar | Can be validated locally | Target editor accepts without invalid-block warning |
| Pattern JSON envelope | Can be schema-checked | Pattern is registered/imported and editable in target |
| Heading/paragraph/button/image semantics | Candidate mapping only | Native block tree and rendered semantics verified |
| Unsupported/custom blocks | BLOCKED or REVIEW | Explicit target-specific adapter decision |
| Media references | Manifest-only | Target-managed attachments and browser image load |
| REST create/update | DISABLED offline | Authenticated receipt with endpoint, user scope and response |
| Visual parity | NOT_RUN | Calibrated comparison against the source frame |
| Production acceptance | NOT_RUN | Separate release decision |

## Safety boundaries

- The deterministic Figma core remains network-free.
- No private Gutenberg clipboard format is reverse-engineered.
- No target mutation occurs from the offline candidate path.
- Invalid or unsupported structures fail closed or remain REVIEW.
- Caller-provided WordPress URLs, IDs or authentication metadata are not evidence of a live target.
- A valid parser round-trip is structural evidence only; it is not editor, browser, media or visual acceptance.

## Required next evidence

1. Pin a supported WordPress/Gutenberg target version and record the environment.
2. Import the candidate serialized blocks or pattern through a real authenticated target.
3. Retain parser/editor warnings, block tree, saved content, rendered URL and browser observations.
4. Verify target-managed image attachments and actual browser image loads.
5. Compare the rendered target against the source frame using a calibrated visual procedure.
6. Keep the internal decision separate from P16 implementation completeness and P12/P27 release gates.

## Sources

- Block Editor Handbook: https://developer.wordpress.org/block-editor/
- Serialization parser: https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-serialization-default-parser/
- Serialization specification: https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-serialization-spec-parser/
- Patterns: https://developer.wordpress.org/block-editor/reference-guides/block-api/block-patterns/
- REST API Handbook: https://developer.wordpress.org/rest-api/
- REST authentication: https://developer.wordpress.org/rest-api/using-the-rest-api/authentication/
