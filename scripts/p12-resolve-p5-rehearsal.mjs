import { readFile, writeFile } from 'node:fs/promises';

const CONFLICT = /<<<<<<< HEAD\n([\s\S]*?)=======\n([\s\S]*?)>>>>>>> origin\/feat\/p5-safe-recipes\n/g;

function resolveConflicts(text, resolver) {
  let index = 0;
  return text.replace(CONFLICT, (_match, ours, theirs) => resolver(index++, ours, theirs));
}

function assertClean(path, text) {
  if (/^(<<<<<<<|=======|>>>>>>>)/m.test(text)) {
    throw new Error(`${path} still contains conflict markers.`);
  }
}

async function rewrite(path, transform) {
  const before = await readFile(path, 'utf8');
  const after = transform(before);
  assertClean(path, after);
  await writeFile(path, after, 'utf8');
}

await rewrite('package.json', (text) => resolveConflicts(text, (_index, ours) => ours));
await rewrite('scripts/prepare-figma-import.mjs', (text) => resolveConflicts(text, (_index, ours) => ours));

await rewrite('scripts/build.mjs', (text) => resolveConflicts(text, (index, ours) => {
  if (index === 0) {
    return `  define: {\n    ...provenanceDefines,\n    __PLUGIN_VERSION__: JSON.stringify(packageJson.version),\n  },\n});\n\nawait build({\n  entryPoints: ['src/tools/verify-p5-evidence.ts'],\n  bundle: true,\n  outfile: 'dist/verify-p5-evidence.mjs',\n  platform: 'node',\n  target: 'node20',\n  format: 'esm',\n  minify: false,\n  define: provenanceDefines,\n`;
  }
  if (index === 1) {
    return 'console.log(`Built dist/ ${packageJson.version} with plugin id ${pluginId}; source ${sourceSha}; Actions run ${githubRunNumber}/${githubRunId}`);\n';
  }
  return ours;
}));

await rewrite('src/plugin/main.ts', (text) => {
  const regionStart = text.indexOf('<<<<<<< HEAD\nfunction isBacklogDocument');
  const regionEnd = text.indexOf('  const fileKey = ', regionStart);
  if (regionStart < 0 || regionEnd < 0) throw new Error('Unable to locate main.ts audit/P5 conflict region.');

  const bridge = `function isBacklogDocument(value: unknown): value is BacklogDocument {\n  if (typeof value !== 'object' || value === null) return false;\n  const candidate = value as { schemaVersion?: unknown; items?: unknown; summary?: unknown };\n  return candidate.schemaVersion === 1\n    && Array.isArray(candidate.items)\n    && typeof candidate.summary === 'object'\n    && candidate.summary !== null;\n}\n\nfunction backlogStorageKey(fileKey: string, pageId: string, frameId: string): string {\n  return \`${'${BACKLOG_STORAGE_PREFIX}:${fileKey}:${pageId}:${frameId}'}\`;\n}\n\nfunction beginExclusiveP5Operation(operation: P5ExclusiveOperation, errorType: 'validation-error' | 'safe-fix-error'): boolean {\n  if (p5OperationInFlight) {\n    postError(\`Another P5 operation (${'${p5OperationInFlight}'}) is still running. Wait for it to finish before starting ${'${operation}'}.\`, errorType);\n    return false;\n  }\n  p5OperationInFlight = operation;\n  return true;\n}\n\nfunction endExclusiveP5Operation(operation: P5ExclusiveOperation): void {\n  if (p5OperationInFlight === operation) p5OperationInFlight = null;\n}\n\nfunction selectedFrame(): FrameNode | null {\n  const selection = figma.currentPage.selection;\n  if (selection.length !== 1) return null;\n  const selected = selection[0];\n  return selected?.type === 'FRAME' ? selected : null;\n}\n\nasync function runtimeProofState(): Promise<{ valid: boolean; passedAt: string | null }> {\n  const stored = await figma.clientStorage.getAsync(P5_RUNTIME_PROOF_STORAGE_KEY);\n  if (!isValidP5RuntimeProof(stored, RUNTIME_BUILD)) return { valid: false, passedAt: null };\n  return { valid: true, passedAt: stored.passedAt };\n}\n\nasync function runAudit(sequence: number): Promise<void> {\n  const page = figma.currentPage;\n  const selection = page.selection;\n\n  if (selection.length !== 1) {\n    if (sequence === auditSequence) postError('Select exactly one desktop frame to audit.');\n    return;\n  }\n\n  const selected = selection[0];\n  if (!selected || selected.type !== 'FRAME') {\n    if (sequence === auditSequence) postError('Audit currently supports one selected Figma Frame.');\n    return;\n  }\n\n`;

  let merged = `${text.slice(0, regionStart)}${bridge}${text.slice(regionEnd)}`;
  merged = resolveConflicts(merged, (index, ours, theirs) => {
    if (index === 0) {
      const backlogImports = ours
        .split('\n')
        .filter((line) => !line.includes("./integrity-snapshot") && !line.includes("../core/validator") && !line.includes('ValidationReport'))
        .join('\n');
      return `${backlogImports}${theirs}`;
    }
    if (index === 1) {
      return `const PLUGIN_VERSION = __PLUGIN_VERSION__;\nconst RUNTIME_BUILD = currentP5RuntimeBuildIdentity();\nconst BACKLOG_STORAGE_PREFIX = 'p9-backlog-v1';\nlet auditSequence = 0;\n`;
    }
    if (index === 2) {
      return `if (figma.command === 'p5-runtime-self-test') {\n  void runRuntimeSelfTest();\n} else if (figma.command === 'p5-runtime-evidence') {\n  void runRuntimeEvidenceViewer();\n} else {\n  switch (figma.command) {\n    case 'audit':\n    case 'export-report':\n      startAudit();\n      break;\n    case 'validate':\n      startValidation();\n      break;\n    case 'open':\n    default:\n      if (figma.currentPage.selection.length === 1) startAudit();\n      break;\n  }\n`;
    }
    return `${ours}${theirs}`;
  });
  return merged;
});

await rewrite('src/ui/ui.html', (text) => resolveConflicts(text, (index, ours, theirs) => {
  if (index === 0) return `${ours}${theirs}`;
  if (index === 1) {
    return '    <div class="sub">Audit + actionable backlog + P3 validator + compiled-runtime-gated P5 Safe Fix</div>\n    <div id="root" class="empty">Select one Frame to audit/preview, or two Frames to compare original vs candidate.</div>\n';
  }
  if (index === 2) {
    return `    const exportPanel = document.getElementById('export-panel');\n    let latestAuditJson = '';\n    let latestAuditMarkdown = '';\n    let latestBacklogJson = '';\n    let latestBacklogMarkdown = '';\n\n    function post(type, extra = {}) {\n      parent.postMessage({ pluginMessage: { type, ...extra } }, '*');\n    }\n\n    document.getElementById('audit').addEventListener('click', () => post('audit-request'));\n    document.getElementById('plan').addEventListener('click', () => {\n      root.className = 'empty';\n      root.textContent = 'Classifying conservative P5 Safe Fix eligibility…';\n      exportPanel.hidden = true;\n      post('safe-plan-request');\n`;
  }
  if (index === 3) {
    return `      exportPanel.hidden = true;\n      post('validation-request');\n    });\n    document.getElementById('selftest').addEventListener('click', () => {\n      root.className = 'empty';\n      root.textContent = 'Running disposable compiled P5 → P3 pixel broker → P4 self-test…';\n      exportPanel.hidden = true;\n      post('runtime-calibration-request');\n`;
  }
  if (index === 4) {
    const oursPrefix = ours.slice(0, ours.lastIndexOf('    function renderAudit(report, backlog) {'));
    const theirsPrefix = theirs.slice(0, theirs.lastIndexOf('    function renderAudit(report) {'));
    return `${oursPrefix}${theirsPrefix}    function renderAudit(report, backlog) {\n`;
  }
  return `${ours}${theirs}`;
}));

await rewrite('scripts/build-release.mjs', (text) => {
  let next = text.replace(
    "const sourceSha = requireSourceSha(\n  args.values.get('source-sha') ?? process.env.SOURCE_SHA ?? process.env.GITHUB_SHA,\n  fixture,\n);",
    "const sourceSha = requireSourceSha(\n  args.values.get('source-sha') ?? process.env.SOURCE_SHA ?? process.env.GITHUB_SHA,\n  fixture,\n);\nconst githubRunId = process.env.GITHUB_RUN_ID ?? 'local';\nconst githubRunNumber = process.env.GITHUB_RUN_NUMBER ?? 'local';",
  );
  next = next.replace(
    "  define: {\n    __PLUGIN_VERSION__: JSON.stringify(packageJson.version),\n  },",
    "  define: {\n    __PLUGIN_VERSION__: JSON.stringify(packageJson.version),\n    __P5_SOURCE_SHA__: JSON.stringify(sourceSha),\n    __P5_GITHUB_RUN_ID__: JSON.stringify(githubRunId),\n    __P5_GITHUB_RUN_NUMBER__: JSON.stringify(githubRunNumber),\n  },",
  );
  next = next.replace("await cp('src/ui/ui.html', resolve(pluginDir, 'ui.html'));", "await cp('src/ui/release-ui.html', resolve(pluginDir, 'ui.html'));");
  if (next === text) throw new Error('build-release.mjs P5 integration patch made no changes.');
  return next;
});

console.log('P12 P5 integration rehearsal conflict resolution applied.');
