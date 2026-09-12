import { readFile } from 'node:fs/promises';
import { assertRegistrySchemaReferences } from './status-schema-contract.mjs';

const readme = await readFile('README.md', 'utf8');
const registry = JSON.parse(await readFile('config/runtime-artifacts.json', 'utf8'));
const statusDocuments = {
  'README.md': readme,
  'memory-bank/PROJECT_STATE.md': await readFile('memory-bank/PROJECT_STATE.md', 'utf8'),
  'memory-bank/ROADMAP.md': await readFile('memory-bank/ROADMAP.md', 'utf8'),
  'memory-bank/NEXT_ACTIONS.md': await readFile('memory-bank/NEXT_ACTIONS.md', 'utf8')
};

const schemaTag = assertRegistrySchemaReferences(registry.schemaVersion, statusDocuments);

const overallTruth = '**Overall progress is intentionally not collapsed into one synthetic percentage.**';
const requiredFragments = [
  '### Module-wise progress',
  '| Module | Status | Progress | Progress Bar | Blocker / Next |',
  overallTruth,
  '**Open PR/MR:**',
  'P27 Final production release + publisher/runtime evidence',
];

for (const fragment of requiredFragments) {
  if (!readme.includes(fragment)) {
    throw new Error(`README progress contract missing required fragment: ${fragment}`);
  }
}

const staleFragments = [
  'P13-P26 runtime implementation remains 0%',
  'runtime implementation blocked by #84 internal exit',
  'PREFLIGHT FROZEN / IMPLEMENTATION BLOCKED',
];
for (const fragment of staleFragments) {
  if (readme.includes(fragment)) {
    throw new Error(`README still contains stale roadmap/progress truth: ${fragment}`);
  }
}

const moduleSection = readme.match(
  /### Module-wise progress\n\n([\s\S]*?)\n\n\*\*Overall progress is intentionally not collapsed into one synthetic percentage\.\*\*/,
)?.[1];

if (!moduleSection) {
  throw new Error('Unable to locate README module-wise progress table.');
}

const rows = moduleSection
  .split('\n')
  .filter((line) => line.startsWith('|') && !line.includes('---'))
  .slice(1)
  .map((line) => line.split('|').slice(1, -1).map((cell) => cell.trim()));

if (rows.length < 27) {
  throw new Error(`Expected the full P0-P27/R0/R1 module table, found only ${rows.length} rows.`);
}

const requiredModules = [
  'AI-native', 'P0–P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10', 'P11', 'P12',
  'R0', 'R1', 'P13', 'P14', 'P15', 'P16', 'P17', 'P18', 'P19', 'P20', 'P21',
  'P22', 'P23', 'P24', 'P25', 'P26', 'P27',
];
for (const moduleName of requiredModules) {
  if (!rows.some(([module]) => module?.includes(moduleName))) {
    throw new Error(`README progress table is missing required module row: ${moduleName}`);
  }
}

for (const row of rows) {
  if (row.length !== 5) {
    throw new Error(`Malformed README module progress row: ${JSON.stringify(row)}`);
  }

  const [module, status, progress, bar, next] = row;
  if (!module || !status || !next) {
    throw new Error(`README module progress row contains an empty required cell: ${module || '<unknown>'}`);
  }

  const isPercent = /^(?:100|[0-9]{1,2})%(?: (?:impl|exec))?$/.test(progress);
  const isNonDenominated = progress === 'N/A';
  if (!isPercent && !isNonDenominated) {
    throw new Error(`Invalid progress value for ${module}: ${progress}`);
  }

  const isProgressBar = /^`[█░]{10}`$/.test(bar);
  const isNonDenominatedBar = /^`─{10}`$/.test(bar);
  if (!isProgressBar && !isNonDenominatedBar) {
    throw new Error(`Progress bar for ${module} must contain exactly 10 cells: ${bar}`);
  }

  if (isNonDenominated && !status.includes('DEFERRED') && !status.includes('IN PROGRESS')) {
    throw new Error(`N/A progress is valid only for deferred or actively non-denominated scope: ${module}`);
  }
  if (isNonDenominated && !isNonDenominatedBar) {
    throw new Error(`N/A progress must use the non-denominated bar for ${module}.`);
  }
}

function requireRow(moduleToken, expected) {
  const row = rows.find(([module]) => module?.includes(moduleToken));
  if (!row) throw new Error(`Missing required row for ${moduleToken}.`);
  const [, status, progress, , next] = row;
  if (expected.status && !status.includes(expected.status)) {
    throw new Error(`${moduleToken} status is stale: ${status}`);
  }
  if (expected.progress && progress !== expected.progress) {
    throw new Error(`${moduleToken} progress is stale: ${progress}`);
  }
  if (expected.next && !next.includes(expected.next)) {
    throw new Error(`${moduleToken} next/blocker truth is stale: ${next}`);
  }
}

requireRow('P12', { status: 'IN PROGRESS', progress: '80%' });
requireRow('P13', {
  status: 'IMPLEMENTATION COMPLETE / RUNTIME ACCEPTANCE PENDING',
  progress: '100% impl',
  next: '#159',
});
requireRow('P14', {
  status: 'CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED',
  progress: 'N/A',
  next: 'production registry remains empty',
});
requireRow('P27', {
  status: 'GATE DEFINED / EXECUTION DEFERRED',
  progress: '0% exec',
  next: '#84',
});

console.log(
  `README progress contract PASS: ${rows.length} stage-separated modules, no synthetic overall percentage, runtime registry ${schemaTag}.`,
);
