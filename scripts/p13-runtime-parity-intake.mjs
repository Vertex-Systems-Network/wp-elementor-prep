import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

function fail(message, exitCode = 2) {
  process.stderr.write(`P13_RUNTIME_PARITY_FAILED: ${message}\n`);
  process.exit(exitCode);
}

function parseArgs(argv) {
  const values = new Map();
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token?.startsWith('--')) fail(`Unexpected argument: ${token ?? ''}`);
    const equals = token.indexOf('=');
    const key = equals >= 0 ? token.slice(2, equals) : token.slice(2);
    const value = equals >= 0 ? token.slice(equals + 1) : argv[++index];
    if (!key || !value || value.startsWith('--')) fail(`--${key} requires a value.`);
    values.set(key, value);
  }
  return values;
}

function required(values, key) {
  const value = values.get(key);
  if (!value) fail(`Missing required --${key}.`);
  return value;
}

async function readJson(path) {
  let raw;
  try {
    raw = await readFile(resolve(path), 'utf8');
  } catch (error) {
    fail(`Unable to read ${path}: ${error instanceof Error ? error.message : String(error)}`);
  }
  try {
    return { raw, value: JSON.parse(raw) };
  } catch {
    fail(`${path} is not valid JSON.`);
  }
}

function sha256(raw) {
  return createHash('sha256').update(raw).digest('hex');
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function traceableBuild(build) {
  return isRecord(build)
    && /^[0-9a-f]{40}$/i.test(String(build.sourceSha ?? ''))
    && /^\d+$/.test(String(build.runId ?? ''))
    && /^\d+$/.test(String(build.runNumber ?? ''));
}

function validateEvidence(evidence) {
  if (!isRecord(evidence) || evidence.schemaVersion !== 1) fail('Plugin evidence must use schemaVersion 1.');
  if (evidence.acceptanceAuthority !== false) fail('Plugin evidence must explicitly carry acceptanceAuthority=false.');
  if (!isRecord(evidence.buildReady)
    || evidence.buildReady.schemaVersion !== 1
    || evidence.buildReady.buildReadyScoreVersion !== 2
    || evidence.buildReady.responsiveRiskVersion !== 1) {
    fail('Plugin evidence does not contain a valid Build-Ready v2 / Responsive Risk v1 report.');
  }
  if (!isRecord(evidence.context) || typeof evidence.context.frameId !== 'string' || typeof evidence.context.frameName !== 'string') {
    fail('Plugin evidence runtime context is missing.');
  }
  if (!isRecord(evidence.buildReady.source)
    || evidence.buildReady.source.rootId !== evidence.context.frameId
    || evidence.buildReady.source.rootName !== evidence.context.frameName) {
    fail('Plugin evidence frame context does not match Build-Ready source identity.');
  }
  const traceable = traceableBuild(evidence.build);
  if (evidence.traceableBuild !== traceable) fail('Plugin evidence traceableBuild flag contradicts build identity.');
  if (typeof evidence.buildReadyJson !== 'string') fail('Plugin evidence buildReadyJson is missing.');
  let embedded;
  try { embedded = JSON.parse(evidence.buildReadyJson); } catch { fail('Plugin evidence buildReadyJson is invalid JSON.'); }
  if (JSON.stringify(embedded) !== JSON.stringify(evidence.buildReady)) {
    fail('Plugin evidence buildReadyJson contradicts the embedded Build-Ready report.');
  }
  return traceable;
}

function validateCli(cli) {
  if (!isRecord(cli)
    || cli.schemaVersion !== 1
    || cli.buildReadyScoreVersion !== 2
    || cli.responsiveRiskVersion !== 1
    || typeof cli.runId !== 'string'
    || !isRecord(cli.source)) {
    fail('CLI report is not a Build-Ready v2 / Responsive Risk v1 report.');
  }
}

function normalize(report) {
  const value = JSON.parse(JSON.stringify(report));
  delete value.generatedAt;
  return value;
}

function collect(plugin, cli, path, output, limit = 50) {
  if (output.length >= limit || Object.is(plugin, cli)) return;
  if (Array.isArray(plugin) || Array.isArray(cli)) {
    if (!Array.isArray(plugin) || !Array.isArray(cli)) {
      output.push({ path, plugin, cli });
      return;
    }
    if (plugin.length !== cli.length) output.push({ path: `${path}.length`, plugin: plugin.length, cli: cli.length });
    const length = Math.min(plugin.length, cli.length);
    for (let i = 0; i < length && output.length < limit; i += 1) collect(plugin[i], cli[i], `${path}[${i}]`, output, limit);
    return;
  }
  if (isRecord(plugin) || isRecord(cli)) {
    if (!isRecord(plugin) || !isRecord(cli)) {
      output.push({ path, plugin, cli });
      return;
    }
    const keys = [...new Set([...Object.keys(plugin), ...Object.keys(cli)])].sort();
    for (const key of keys) {
      if (output.length >= limit) break;
      const childPath = path ? `${path}.${key}` : key;
      if (!(key in plugin) || !(key in cli)) output.push({ path: childPath, plugin: plugin[key], cli: cli[key] });
      else collect(plugin[key], cli[key], childPath, output, limit);
    }
    return;
  }
  output.push({ path, plugin, cli });
}

const args = parseArgs(process.argv.slice(2));
const pluginPath = required(args, 'plugin-evidence');
const cliPath = required(args, 'cli-report');
const outPath = resolve(args.get('out') ?? 'dist-p13/p13-runtime-parity-receipt.json');
const pluginFile = await readJson(pluginPath);
const cliFile = await readJson(cliPath);
const traceable = validateEvidence(pluginFile.value);
validateCli(cliFile.value);

const pluginReport = pluginFile.value.buildReady;
const cliReport = cliFile.value;
const mismatches = [];
collect(normalize(pluginReport), normalize(cliReport), 'buildReady', mismatches);
const sameRunIdentity = pluginReport.runId === cliReport.runId
  && pluginReport.source.structuralHash === cliReport.source.structuralHash
  && pluginReport.source.configHash === cliReport.source.configHash;
if (!sameRunIdentity) {
  mismatches.unshift({
    path: 'buildReady.runIdentity',
    plugin: {
      runId: pluginReport.runId,
      structuralHash: pluginReport.source.structuralHash,
      configHash: pluginReport.source.configHash,
    },
    cli: {
      runId: cliReport.runId,
      structuralHash: cliReport.source.structuralHash,
      configHash: cliReport.source.configHash,
    },
  });
}

const receipt = {
  schemaVersion: 1,
  gate: 'p13-runtime-plugin-cli-parity',
  acceptanceAuthority: false,
  productionAcceptance: false,
  p12FinalGateRequired: true,
  pluginEvidence: {
    sha256: sha256(pluginFile.raw),
    traceableBuild: traceable,
    sourceSha: pluginFile.value.build?.sourceSha ?? null,
    runId: pluginFile.value.build?.runId ?? null,
    runNumber: pluginFile.value.build?.runNumber ?? null,
    fileKey: pluginFile.value.context?.fileKey ?? null,
    pageId: pluginFile.value.context?.pageId ?? null,
    frameId: pluginFile.value.context?.frameId ?? null,
    buildReadyRunId: pluginReport.runId,
  },
  cliReport: {
    sha256: sha256(cliFile.raw),
    buildReadyRunId: cliReport.runId,
  },
  sameRunIdentity,
  mismatchCount: mismatches.length,
  mismatches,
  parityCandidateAccepted: traceable && sameRunIdentity && mismatches.length === 0,
};

await mkdir(dirname(outPath), { recursive: true });
await writeFile(outPath, `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
process.stdout.write(`${JSON.stringify({ out: outPath, parityCandidateAccepted: receipt.parityCandidateAccepted, mismatchCount: receipt.mismatchCount }, null, 2)}\n`);
process.exitCode = receipt.parityCandidateAccepted ? 0 : 2;
