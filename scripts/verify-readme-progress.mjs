import { readFile } from 'node:fs/promises';

const readme = await readFile('README.md', 'utf8');

const requiredFragments = [
  '### Module-wise progress',
  '| Module | Status | Progress | Progress Bar | Blocker / Next |',
  '**Overall active project progress:**',
  '**Open PR/MR:**',
];

for (const fragment of requiredFragments) {
  if (!readme.includes(fragment)) {
    throw new Error(`README progress contract missing required fragment: ${fragment}`);
  }
}

const moduleSection = readme.match(
  /### Module-wise progress\n\n([\s\S]*?)\n\n\*\*Overall active project progress:\*\*/,
)?.[1];

if (!moduleSection) {
  throw new Error('Unable to locate README module-wise progress table.');
}

const rows = moduleSection
  .split('\n')
  .filter((line) => line.startsWith('|') && !line.includes('---'))
  .slice(1)
  .map((line) => line.split('|').slice(1, -1).map((cell) => cell.trim()));

if (rows.length < 5) {
  throw new Error(`Expected at least 5 module progress rows, found ${rows.length}.`);
}

const requiredModules = ['AI-native', 'P0–P4', 'P5', 'P6', 'P7', 'P8'];
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

  const isPercent = /^(?:100|[0-9]{1,2})%$/.test(progress);
  const isDeferred = progress === 'N/A';
  if (!isPercent && !isDeferred) {
    throw new Error(`Invalid progress value for ${module}: ${progress}`);
  }

  const isProgressBar = /^`[█░]{10}`$/.test(bar);
  const isDeferredBar = /^`─{10}`$/.test(bar);
  if (!isProgressBar && !isDeferredBar) {
    throw new Error(`Progress bar for ${module} must contain exactly 10 cells: ${bar}`);
  }

  if (isDeferred && !status.includes('DEFERRED')) {
    throw new Error(`N/A progress is only valid for a DEFERRED module: ${module}`);
  }
}

const overall = readme.match(/\*\*Overall active project progress:\*\*\s+`([█░]{10})\s+(\d{1,3})%`/);
if (!overall) {
  throw new Error('Overall project progress must use a 10-cell bar followed by a numeric percentage.');
}

const overallPercent = Number(overall[2]);
if (!Number.isInteger(overallPercent) || overallPercent < 0 || overallPercent > 100) {
  throw new Error(`Overall project progress is outside 0–100: ${overall[2]}`);
}

console.log(`README progress contract PASS: ${rows.length} modules, overall ${overallPercent}%.`);
