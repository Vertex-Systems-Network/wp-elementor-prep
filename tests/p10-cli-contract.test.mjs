import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const packageJson = JSON.parse(readFileSync(fileURLToPath(new URL('../package.json', import.meta.url)), 'utf8'));
const cli = readFileSync(fileURLToPath(new URL('../src/cli/index.ts', import.meta.url)), 'utf8');
const adapters = readFileSync(fileURLToPath(new URL('../src/cli/source-adapters.ts', import.meta.url)), 'utf8');
const runner = readFileSync(fileURLToPath(new URL('../scripts/run-cli.mjs', import.meta.url)), 'utf8');

describe('P10 npm CLI contract', () => {
  it('exposes all three required npm commands plus a reproducible CLI build', () => {
    expect(packageJson.scripts['audit:figma']).toBe('node scripts/run-cli.mjs audit:figma');
    expect(packageJson.scripts['audit:snapshot']).toBe('node scripts/run-cli.mjs audit:snapshot');
    expect(packageJson.scripts['backlog:generate']).toBe('node scripts/run-cli.mjs backlog:generate');
    expect(packageJson.scripts['build:cli']).toBe('node scripts/build-cli.mjs');
  });

  it('uses the shared deterministic core instead of reimplementing audit/backlog logic', () => {
    expect(cli).toContain("buildAuditReport(snapshot.root");
    expect(cli).toContain('generateBacklog(report');
    expect(cli).toContain('serializeAuditReportJson');
    expect(cli).toContain('serializeBacklogJson');
  });

  it('reads Figma credentials only from environment variables and does not expose a --token option', () => {
    expect(cli).toContain('process.env[envName]');
    expect(cli).toContain('FIGMA_TOKEN');
    expect(cli).toContain('FIGMA_OAUTH_TOKEN');
    expect(cli).not.toContain("option(args, 'token')");
    expect(cli).not.toContain("requiredOption(args, 'token')");
  });

  it('pins explicit raw .fig refusal and official REST endpoints', () => {
    expect(adapters).toContain('UNSUPPORTED_FIG_LOCAL_FILE');
    expect(adapters).toContain('https://api.figma.com/v1/files/');
    expect(adapters).toContain("'X-Figma-Token'");
    expect(adapters).toContain('Authorization: `Bearer ${token}`');
  });

  it('supports summary-only and CI fail thresholds without treating them as final product acceptance', () => {
    expect(cli).toContain("booleanFlags = new Set(['help', 'summary-only'])");
    expect(cli).toContain("--fail-on must be none, warning, or error");
    expect(cli).toContain('return 10');
  });

  it('builds the TypeScript CLI in a temporary directory for cross-platform npm invocation', () => {
    expect(runner).toContain("mkdtemp(join(tmpdir(), 'wp-elementor-prep-cli-')");
    expect(runner).toContain("target: 'node20'");
    expect(runner).toContain('windowsHide: true');
    expect(runner).toContain('await rm(dir, { recursive: true, force: true })');
  });
});
