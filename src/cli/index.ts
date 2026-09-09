import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { buildAuditReport } from '../core/scoring';
import { generateBacklog, serializeBacklogJson, serializeBacklogMarkdown, type BacklogDocument } from '../core/backlog';
import { serializeAuditReportJson, serializeAuditReportMarkdown } from '../core/report-serialization';
import type { AuditReport } from '../core/types';
import {
  CanonicalSnapshotSourceAdapter,
  FigmaRestSourceAdapter,
  SourceAdapterError,
  parseFigmaUrl,
  type CanonicalSnapshot,
} from './source-adapters';

const ENGINE_VERSION = '0.1.0-alpha.1';
const DEFAULT_OUT_DIR = 'elementor-prep-output';

type FailOn = 'none' | 'warning' | 'error';

interface ParsedArgs {
  values: Map<string, string>;
  flags: Set<string>;
  positionals: string[];
}

class CliError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly exitCode = 2,
  ) {
    super(message);
    this.name = 'CliError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseArgs(argv: string[]): ParsedArgs {
  const values = new Map<string, string>();
  const flags = new Set<string>();
  const positionals: string[] = [];
  const booleanFlags = new Set(['help', 'summary-only']);

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]!;
    if (!token.startsWith('--')) {
      positionals.push(token);
      continue;
    }

    const equals = token.indexOf('=');
    const rawKey = equals >= 0 ? token.slice(2, equals) : token.slice(2);
    if (!rawKey) throw new CliError('INVALID_ARGUMENT', 'Empty option name.');

    if (booleanFlags.has(rawKey)) {
      if (equals >= 0) throw new CliError('INVALID_ARGUMENT', `--${rawKey} does not take a value.`);
      flags.add(rawKey);
      continue;
    }

    const inlineValue = equals >= 0 ? token.slice(equals + 1) : undefined;
    const nextValue = inlineValue ?? argv[index + 1];
    if (!nextValue || (inlineValue === undefined && nextValue.startsWith('--'))) {
      throw new CliError('MISSING_ARGUMENT_VALUE', `--${rawKey} requires a value.`);
    }
    values.set(rawKey, nextValue);
    if (inlineValue === undefined) index += 1;
  }

  return { values, flags, positionals };
}

function option(args: ParsedArgs, name: string): string | undefined {
  return args.values.get(name);
}

function requiredOption(args: ParsedArgs, name: string): string {
  const value = option(args, name);
  if (!value) throw new CliError('MISSING_REQUIRED_OPTION', `Missing required --${name}.`);
  return value;
}

function parseFailOn(args: ParsedArgs): FailOn {
  const value = option(args, 'fail-on') ?? 'none';
  if (value !== 'none' && value !== 'warning' && value !== 'error') {
    throw new CliError('INVALID_FAIL_ON', '--fail-on must be none, warning, or error.');
  }
  return value;
}

function assertNoUnexpectedPositionals(args: ParsedArgs): void {
  if (args.positionals.length > 0) {
    throw new CliError('UNEXPECTED_ARGUMENT', `Unexpected positional arguments: ${args.positionals.join(' ')}`);
  }
}

function readAuth(args: ParsedArgs): { token: string; authMode: 'personal' | 'oauth' } {
  const requested = option(args, 'auth');
  if (requested && requested !== 'personal' && requested !== 'oauth') {
    throw new CliError('INVALID_AUTH_MODE', '--auth must be personal or oauth.');
  }

  const authMode: 'personal' | 'oauth' = requested === 'oauth'
    ? 'oauth'
    : requested === 'personal'
      ? 'personal'
      : process.env.FIGMA_TOKEN
        ? 'personal'
        : process.env.FIGMA_OAUTH_TOKEN
          ? 'oauth'
          : 'personal';
  const envName = option(args, 'token-env') ?? (authMode === 'oauth' ? 'FIGMA_OAUTH_TOKEN' : 'FIGMA_TOKEN');
  const token = process.env[envName];
  if (!token) {
    throw new CliError(
      'FIGMA_TOKEN_MISSING',
      `Missing Figma credential in environment variable ${envName}. Tokens are read from the environment and are never written to reports.`,
      3,
    );
  }
  return { token, authMode };
}

function parseBacklogDocument(value: unknown): BacklogDocument {
  if (!isRecord(value) || value.schemaVersion !== 1 || !Array.isArray(value.items) || !isRecord(value.summary)) {
    throw new CliError('INVALID_BACKLOG_JSON', 'Previous backlog must be a schemaVersion 1 backlog document.');
  }
  return value as unknown as BacklogDocument;
}

function parseAuditReport(value: unknown): AuditReport {
  if (
    !isRecord(value)
    || value.schemaVersion !== 1
    || typeof value.generatedAt !== 'string'
    || !isRecord(value.root)
    || !isRecord(value.stats)
    || !Array.isArray(value.findings)
    || !Array.isArray(value.sections)
  ) {
    throw new CliError('INVALID_AUDIT_REPORT', 'Audit input must be a schemaVersion 1 audit report.');
  }
  return value as unknown as AuditReport;
}

async function readJsonFile(path: string, code: string): Promise<unknown> {
  let raw: string;
  try {
    raw = await readFile(resolve(path), 'utf8');
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new CliError(code, `Unable to read ${path}: ${detail}`);
  }
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new CliError(code, `${path} is not valid JSON.`);
  }
}

async function previousBacklog(args: ParsedArgs): Promise<BacklogDocument | null> {
  const path = option(args, 'previous-backlog');
  if (!path) return null;
  return parseBacklogDocument(await readJsonFile(path, 'PREVIOUS_BACKLOG_READ_FAILED'));
}

function backlogContext(snapshot: CanonicalSnapshot): {
  fileKey?: string;
  pageId?: string;
  pageName?: string;
} {
  return {
    ...(snapshot.source.fileKey ? { fileKey: snapshot.source.fileKey } : {}),
    ...(snapshot.source.pageId ? { pageId: snapshot.source.pageId } : {}),
    ...(snapshot.source.pageName ? { pageName: snapshot.source.pageName } : {}),
  };
}

function thresholdExit(backlog: BacklogDocument, failOn: FailOn): number {
  if (failOn === 'none') return 0;
  if (backlog.summary.byCategory.ERROR > 0) return 10;
  if (failOn === 'warning' && backlog.summary.byCategory.WARNING > 0) return 10;
  return 0;
}

function summaryPayload(report: AuditReport, backlog: BacklogDocument): Record<string, unknown> {
  return {
    score: report.score,
    status: report.status,
    root: report.root,
    findings: {
      errors: backlog.summary.byCategory.ERROR,
      warnings: backlog.summary.byCategory.WARNING,
      info: backlog.summary.byCategory.INFO,
      improvements: backlog.summary.byCategory.IMPROVEMENT,
      active: backlog.summary.active,
    },
    delta: backlog.summary.byDelta,
  };
}

async function writeAuditOutputs(
  report: AuditReport,
  backlog: BacklogDocument,
  args: ParsedArgs,
  snapshot?: CanonicalSnapshot,
): Promise<void> {
  if (args.flags.has('summary-only')) {
    process.stdout.write(`${JSON.stringify(summaryPayload(report, backlog), null, 2)}\n`);
    return;
  }

  const outDir = resolve(option(args, 'out') ?? DEFAULT_OUT_DIR);
  await mkdir(outDir, { recursive: true });
  const writes: Array<Promise<void>> = [
    writeFile(resolve(outDir, 'audit-report.json'), serializeAuditReportJson(report), 'utf8'),
    writeFile(resolve(outDir, 'audit-report.md'), serializeAuditReportMarkdown(report), 'utf8'),
    writeFile(resolve(outDir, 'backlog.json'), serializeBacklogJson(backlog), 'utf8'),
    writeFile(resolve(outDir, 'backlog.md'), serializeBacklogMarkdown(backlog), 'utf8'),
  ];
  if (snapshot) {
    writes.push(writeFile(resolve(outDir, 'source-snapshot.json'), `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8'));
  }
  await Promise.all(writes);
  process.stdout.write(`${JSON.stringify({ outDir, ...summaryPayload(report, backlog) }, null, 2)}\n`);
}

async function runSnapshotAudit(snapshot: CanonicalSnapshot, args: ParsedArgs, emitSnapshot: boolean): Promise<number> {
  const report = buildAuditReport(snapshot.root, ENGINE_VERSION, snapshot.capturedAt);
  const previous = await previousBacklog(args);
  const backlog = generateBacklog(report, {
    context: backlogContext(snapshot),
    ...(previous ? { previous } : {}),
  });
  await writeAuditOutputs(report, backlog, args, emitSnapshot ? snapshot : undefined);
  return thresholdExit(backlog, parseFailOn(args));
}

async function auditFigma(args: ParsedArgs): Promise<number> {
  assertNoUnexpectedPositionals(args);
  const url = option(args, 'url');
  const explicitFileKey = option(args, 'file-key');
  if ((url && explicitFileKey) || (!url && !explicitFileKey)) {
    throw new CliError('FIGMA_SOURCE_REQUIRED', 'Provide exactly one of --url or --file-key.');
  }

  const fromUrl = url ? parseFigmaUrl(url) : null;
  const fileKey = explicitFileKey ?? fromUrl!.fileKey;
  const explicitNodeId = option(args, 'node-id');
  if (explicitNodeId && fromUrl?.nodeId && explicitNodeId !== fromUrl.nodeId) {
    throw new CliError('CONFLICTING_NODE_ID', '--node-id conflicts with the node-id embedded in the Figma URL.');
  }
  const nodeId = explicitNodeId ?? fromUrl?.nodeId;
  const auth = readAuth(args);
  const adapter = new FigmaRestSourceAdapter();
  const snapshot = await adapter.load({
    fileKey,
    token: auth.token,
    authMode: auth.authMode,
    ...(nodeId ? { nodeId } : {}),
  });
  return runSnapshotAudit(snapshot, args, true);
}

async function auditSnapshot(args: ParsedArgs): Promise<number> {
  assertNoUnexpectedPositionals(args);
  const input = requiredOption(args, 'input');
  const adapter = new CanonicalSnapshotSourceAdapter();
  const snapshot = await adapter.load(input);
  return runSnapshotAudit(snapshot, args, false);
}

async function generateBacklogCommand(args: ParsedArgs): Promise<number> {
  assertNoUnexpectedPositionals(args);
  const input = requiredOption(args, 'input');
  const report = parseAuditReport(await readJsonFile(input, 'AUDIT_REPORT_READ_FAILED'));
  const previous = await previousBacklog(args);
  const backlog = generateBacklog(report, previous ? { previous } : {});

  if (args.flags.has('summary-only')) {
    process.stdout.write(`${JSON.stringify(backlog.summary, null, 2)}\n`);
  } else {
    const outDir = resolve(option(args, 'out') ?? DEFAULT_OUT_DIR);
    await mkdir(outDir, { recursive: true });
    await Promise.all([
      writeFile(resolve(outDir, 'backlog.json'), serializeBacklogJson(backlog), 'utf8'),
      writeFile(resolve(outDir, 'backlog.md'), serializeBacklogMarkdown(backlog), 'utf8'),
    ]);
    process.stdout.write(`${JSON.stringify({ outDir, summary: backlog.summary }, null, 2)}\n`);
  }
  return thresholdExit(backlog, parseFailOn(args));
}

function usage(): string {
  return `wp-elementor-prep CLI\n\nCommands:\n  audit:figma     --url <figma-url> | --file-key <key> [--node-id <id>]\n  audit:snapshot  --input <canonical-snapshot.json>\n  backlog:generate --input <audit-report.json>\n\nCommon options:\n  --out <dir>                 Output directory (default: ${DEFAULT_OUT_DIR})\n  --previous-backlog <file>   Previous schema-v1 backlog for delta calculation\n  --summary-only              Print machine-readable summary only; write no files\n  --fail-on <none|warning|error>  Return exit 10 when the threshold is met\n\nFigma auth options:\n  --auth <personal|oauth>     Personal token uses FIGMA_TOKEN; OAuth uses FIGMA_OAUTH_TOKEN\n  --token-env <ENV_NAME>      Override the credential environment variable name\n\nRaw .fig files are intentionally unsupported. Use official Figma URL/file-key input or canonical snapshot JSON.\n`;
}

async function main(): Promise<void> {
  const [command, ...rest] = process.argv.slice(2);
  if (!command || command === '--help' || command === 'help') {
    process.stdout.write(usage());
    return;
  }

  const args = parseArgs(rest);
  if (args.flags.has('help')) {
    process.stdout.write(usage());
    return;
  }

  let exitCode: number;
  if (command === 'audit:figma') exitCode = await auditFigma(args);
  else if (command === 'audit:snapshot') exitCode = await auditSnapshot(args);
  else if (command === 'backlog:generate') exitCode = await generateBacklogCommand(args);
  else throw new CliError('UNKNOWN_COMMAND', `Unknown command: ${command}.`);

  process.exitCode = exitCode;
}

main().catch((error: unknown) => {
  if (error instanceof SourceAdapterError || error instanceof CliError) {
    process.stderr.write(`${error.code}: ${error.message}\n`);
    process.exitCode = error.exitCode;
    return;
  }
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`UNEXPECTED_CLI_ERROR: ${message}\n`);
  process.exitCode = 1;
});
