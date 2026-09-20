# Security Policy

## Supported version

Security fixes target the current `main` branch and the latest repository release candidate. Historical development artifacts are not independently supported once superseded.

## Reporting a vulnerability

Please do not publish exploit details, credentials, private design data, access tokens, or customer information in a public issue.

If GitHub shows **Security → Report a vulnerability** for this repository, use that private reporting channel. If private vulnerability reporting is unavailable, open a minimal public issue that contains no exploit details or secrets and ask the maintainers for a private contact path.

Include, where safe:

- affected commit/version;
- affected file or component;
- impact and prerequisites;
- minimal reproduction steps with non-sensitive fixture data;
- suggested mitigation, if known.

## Repository security boundaries

The Figma Community core is intentionally offline and keeps `networkAccess.allowedDomains=["none"]`. Credentials used by the CLI are read from environment variables and must not be written to reports or committed to the repository.

Generated target artifacts, CI success, local validation, and AI analysis do not by themselves grant runtime, import, compatibility, mutation, or production authority. Runtime evidence must follow the repository's retained evidence contracts.

Disposable controlled-target proof credentials are ephemeral security material. The P15 proof browser may send its token only to the exact loopback origins declared by the proof harness, bridge observations must not reflect token-bearing navigation URLs, and retained proof artifacts/logs must be sanitized and verified token-free before upload.

## AI-specific security reports

The current deterministic core must not silently gain connected-model authority or provider credential handling. Treat the following as security-relevant and report them through the same private vulnerability path:

- prompt injection that can cross from design text, imported content, research material, or other untrusted data into trusted instructions;
- secret or credential exposure to an AI/model request, log, artifact, report, or user-visible output;
- AI authority escalation that can mark compatibility, validation, mutation, release, entitlement, or production state as accepted without the deterministic gate;
- unauthorized tool execution, including mutation, export, publish, deploy, shell/code execution, or secret-retrieval actions triggered by model output;
- provider/network changes that bypass the accepted allowlist, consent, privacy, or redaction boundary;
- arbitrary AI-generated executable code being inserted into an accepted artifact without a separately reviewed sandbox/build/security/QA contract.

P26 AI assistance remains non-authoritative by design. Untrusted project or research content must remain data rather than system/tool instructions, and any future connected AI implementation requires explicit security/privacy/network review before the offline-core contract changes.

## Disclosure

Please allow maintainers time to reproduce, patch, test, and release a fix before publishing technical exploit details.
