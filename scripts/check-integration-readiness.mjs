import { spawnSync } from 'node:child_process';
import { appendFile } from 'node:fs/promises';

const TRACKS = [
  {
    name: 'P5 → main',
    base: 'origin/main',
    head: 'origin/feat/p5-safe-recipes',
  },
  {
    name: 'P6 → P5',
    base: 'origin/feat/p5-safe-recipes',
    head: 'origin/feat/p6-advanced-structures',
  },
  {
    name: 'P7 → P5',
    base: 'origin/feat/p5-safe-recipes',
    head: 'origin/feat/p7-batch-queue-core',
  },
];

const argv = new Set(process.argv.slice(2));
const outputJson = argv.has('--json');
const writeGitHubSummary = argv.has('--github-summary');
const strict = argv.has('--strict');

function git(args) {
  return spawnSync('git', args, {
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  });
}

function resolveRef(ref) {
  const result = git(['rev-parse', '--verify', ref]);
  if (result.status !== 0) {
    throw new Error(`Unable to resolve ${ref}: ${(result.stderr || result.stdout).trim()}`);
  }
  return result.stdout.trim();
}

function shortSha(sha) {
  return sha.slice(0, 12);
}

function isDocumentationPath(path) {
  return (
    path === 'README.md' ||
    path === 'CONTRIBUTING.md' ||
    path === 'CHANGELOG.md' ||
    path.startsWith('docs/') ||
    path.startsWith('memory-bank/')
  );
}

function parseConflictPaths(stdout) {
  const tokens = stdout.split('\0').filter(Boolean);
  return tokens.length > 1 ? tokens.slice(1) : [];
}

function inspectTrack(track) {
  try {
    const baseSha = resolveRef(track.base);
    const headSha = resolveRef(track.head);
    const result = git([
      'merge-tree',
      '--write-tree',
      '--name-only',
      '--no-messages',
      '-z',
      track.base,
      track.head,
    ]);

    if (result.status === 0) {
      return {
        ...track,
        baseSha,
        headSha,
        status: 'CLEAN',
        conflictPaths: [],
      };
    }

    if (result.status === 1) {
      const conflictPaths = parseConflictPaths(result.stdout);
      const docsOnly = conflictPaths.length > 0 && conflictPaths.every(isDocumentationPath);
      return {
        ...track,
        baseSha,
        headSha,
        status: docsOnly ? 'DOCS_ONLY_CONFLICT' : 'CODE_CONFLICT',
        conflictPaths,
      };
    }

    return {
      ...track,
      baseSha,
      headSha,
      status: 'ERROR',
      conflictPaths: [],
      error: (result.stderr || result.stdout || `git merge-tree exited ${result.status}`).trim(),
    };
  } catch (error) {
    return {
      ...track,
      status: 'ERROR',
      conflictPaths: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function renderMarkdown(results) {
  const lines = [
    '## Integration readiness',
    '',
    '> Read-only merge simulation using `git merge-tree --write-tree`; no branch, index, or working-tree mutation.',
    '',
    '| Track | Base | Head | Result | Conflicts |',
    '|---|---|---|---|---|',
  ];

  for (const result of results) {
    const base = result.baseSha ? `\`${shortSha(result.baseSha)}\`` : 'n/a';
    const head = result.headSha ? `\`${shortSha(result.headSha)}\`` : 'n/a';
    const conflicts = result.conflictPaths.length
      ? result.conflictPaths.map((path) => `\`${path}\``).join('<br>')
      : result.error
        ? `\`${result.error.replaceAll('|', '\\|')}\``
        : '—';
    lines.push(`| ${result.name} | ${base} | ${head} | **${result.status}** | ${conflicts} |`);
  }

  lines.push('', 'Status meanings:');
  lines.push('- `CLEAN`: Git can merge the refs without conflicts.');
  lines.push('- `DOCS_ONLY_CONFLICT`: all reported conflicted paths are documentation/status files.');
  lines.push('- `CODE_CONFLICT`: at least one conflicted path is runtime, build, test, workflow, or other non-documentation code.');
  lines.push('- `ERROR`: the simulation could not be completed.');
  lines.push('', '`--strict` exits non-zero for `CODE_CONFLICT` or `ERROR`; default reporting mode never mutates refs and does not fail merely because an expected integration conflict exists.');
  return `${lines.join('\n')}\n`;
}

const results = TRACKS.map(inspectTrack);
const markdown = renderMarkdown(results);

if (outputJson) {
  process.stdout.write(`${JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2)}\n`);
} else {
  process.stdout.write(markdown);
}

if (writeGitHubSummary && process.env.GITHUB_STEP_SUMMARY) {
  await appendFile(process.env.GITHUB_STEP_SUMMARY, markdown, 'utf8');
}

if (strict && results.some((result) => result.status === 'CODE_CONFLICT' || result.status === 'ERROR')) {
  process.exitCode = 1;
}
