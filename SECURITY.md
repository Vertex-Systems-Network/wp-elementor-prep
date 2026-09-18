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

## Disclosure

Please allow maintainers time to reproduce, patch, test, and release a fix before publishing technical exploit details.
