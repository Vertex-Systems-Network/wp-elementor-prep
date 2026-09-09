# Privacy and data handling

Last updated: 2026-09-10

## Figma plugin release

The normal Figma plugin release is designed to operate offline.

Its release manifest declares:

```json
"networkAccess": {
  "allowedDomains": ["none"]
}
```

That means the release plugin is not permitted to make external network requests through the Figma Plugin API runtime.

The plugin analyzes document structure that the user explicitly opens/selects in Figma. Audit/backlog results may be retained through Figma `clientStorage` so the plugin can calculate run-to-run backlog changes. Report/backlog files are exported only when the user chooses the relevant export action.

The plugin does not intentionally transmit Figma document content, audit data, backlog data, or credentials to Pella, Vertex Systems Network, OpenAI, or another external service as part of the classic-plugin runtime.

## npm/Node CLI

The P10 npm/Node CLI is a separate local command-line surface. When the user chooses Figma cloud input, the CLI contacts the official Figma REST API using a credential supplied through an environment variable. Credentials are used for the request and are not intentionally serialized into audit reports, canonical snapshots, or backlog outputs.

Offline canonical-snapshot CLI input does not require Figma network access.

## Generative AI

The deterministic audit/scoring/backlog core does not require an external generative-AI model.

## Retention and deletion

Plugin-local backlog history is controlled by the plugin through Figma `clientStorage`. Exported files are controlled by the user in their local filesystem. The project does not define a remote server-side retention database for the classic-plugin runtime.

A user-facing clear-history control may be added if final P12 validation determines it is needed for the intended Community release experience.

## Support and policy ownership

Before Community submission, the publisher must add a real support contact to `community/listing.template.json` (or the Figma publishing modal), review this disclosure against the final integrated build, and obtain any legal review required for the intended distribution jurisdiction. This repository document is a technical disclosure, not legal advice.
