import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';

function requireReplace(text, search, replacement, label) {
  if (!text.includes(search)) throw new Error(`P7 resolver anchor missing: ${label}`);
  return text.replace(search, replacement);
}

function branchFile(path) {
  return execFileSync('git', ['show', `origin/feat/p7-batch-queue-core:${path}`], { encoding: 'utf8' });
}

function extract(source, start, end) {
  const from = source.indexOf(start);
  if (from < 0) throw new Error(`P7 branch extraction start missing: ${start}`);
  const to = source.indexOf(end, from);
  if (to < 0) throw new Error(`P7 branch extraction end missing: ${end}`);
  return source.slice(from, to);
}

async function rewrite(path, transform) {
  const before = await readFile(path, 'utf8');
  const after = transform(before);
  if (/^(<<<<<<<|=======|>>>>>>>)/m.test(after)) throw new Error(`${path} still contains conflict markers.`);
  await writeFile(path, after, 'utf8');
}

await rewrite('manifest.template.json', (text) => requireReplace(
  text,
  '    { "name": "Developer: P5 Runtime Evidence", "command": "p5-runtime-evidence" }',
  '    { "name": "Developer: P5 Runtime Evidence", "command": "p5-runtime-evidence" },\n    { "name": "Developer: P7 Runtime Evidence", "command": "p7-runtime-evidence" }',
  'manifest P5 runtime evidence command',
));

await rewrite('scripts/build.mjs', (text) => {
  let next = requireReplace(
    text,
    "const provenanceDefines = {\n  __P5_SOURCE_SHA__: JSON.stringify(sourceSha),\n  __P5_GITHUB_RUN_ID__: JSON.stringify(githubRunId),\n  __P5_GITHUB_RUN_NUMBER__: JSON.stringify(githubRunNumber),\n};",
    "const provenanceDefines = {\n  __P5_SOURCE_SHA__: JSON.stringify(sourceSha),\n  __P5_GITHUB_RUN_ID__: JSON.stringify(githubRunId),\n  __P5_GITHUB_RUN_NUMBER__: JSON.stringify(githubRunNumber),\n};\nconst p7BuildDefines = {\n  __WPEP_BUILD_SOURCE_SHA__: JSON.stringify(sourceSha),\n  __WPEP_BUILD_RUN_ID__: JSON.stringify(githubRunId),\n  __WPEP_BUILD_RUN_NUMBER__: JSON.stringify(githubRunNumber),\n};",
    'P5 provenance defines',
  );
  next = requireReplace(
    next,
    "    ...provenanceDefines,\n    __PLUGIN_VERSION__: JSON.stringify(packageJson.version),",
    "    ...provenanceDefines,\n    ...p7BuildDefines,\n    __PLUGIN_VERSION__: JSON.stringify(packageJson.version),",
    'plugin define block',
  );
  if (!next.includes("outfile: 'dist/verify-p7-closure.mjs'")) {
    const anchor = "await cp('src/ui/ui.html', 'dist/ui.html');";
    const verifier = `await build({\n  entryPoints: ['src/tools/verify-p7-closure.ts'],\n  bundle: true,\n  outfile: 'dist/verify-p7-closure.mjs',\n  platform: 'node',\n  target: 'node20',\n  format: 'esm',\n  minify: false,\n  define: { ...provenanceDefines, ...p7BuildDefines },\n});\n\n`;
    next = requireReplace(next, anchor, `${verifier}${anchor}`, 'build ui copy');
  }
  return next;
});

await rewrite('scripts/build-release.mjs', (text) => {
  let next = text;
  const defineAnchor = "    __P5_GITHUB_RUN_NUMBER__: JSON.stringify(githubRunNumber),\n  },";
  if (!next.includes('__WPEP_BUILD_SOURCE_SHA__')) {
    next = requireReplace(
      next,
      defineAnchor,
      "    __P5_GITHUB_RUN_NUMBER__: JSON.stringify(githubRunNumber),\n    __WPEP_BUILD_SOURCE_SHA__: JSON.stringify(sourceSha),\n    __WPEP_BUILD_RUN_ID__: JSON.stringify(githubRunId),\n    __WPEP_BUILD_RUN_NUMBER__: JSON.stringify(githubRunNumber),\n  },",
      'release P5 defines',
    );
  }
  return next;
});

const p7Main = branchFile('src/plugin/main.ts');
const p7BatchFunctions = extract(p7Main, 'async function runCurrentP7Batch', 'figma.ui.onmessage =');
const p7Inspector = extract(p7Main, 'async function runP7RuntimeEvidenceInspector', 'function postBatchState');
const p7PostBatch = extract(p7Main, 'function postBatchState', 'async function validateFullP3');

await rewrite('src/plugin/main.ts', (text) => {
  let next = text;

  next = requireReplace(
    next,
    "import { detectPatterns } from '../core/classification';",
    "import {\n  requestBatchCancel,\n  resumeBatchQueue,\n  summarizeBatchQueue,\n  type BatchQueueState,\n} from '../core/batch-queue';\nimport { detectPatterns } from '../core/classification';",
    'classification import',
  );
  next = requireReplace(
    next,
    "import { FullFrameValidator } from './full-frame-validator';",
    "import { P7_BUILD_IDENTITY } from './build-info';\nimport { FullFrameValidator } from './full-frame-validator';\nimport {\n  createDefaultFigmaP7MetadataStore,\n  persistP7DurableSuccesses,\n  prepareP7BatchQueue,\n  runFigmaP7BatchLifecycle,\n} from './p7-batch-lifecycle';\nimport {\n  finalizeP7BatchCheckpointAfterReaudit,\n  restoreP7BatchCheckpoint,\n} from './p7-checkpoint-resolution';\nimport {\n  clearP7P5BuildProofReceipt,\n  readP7P5BuildProofState,\n  syncP7P5BuildProofReceipt,\n} from './p7-p5-build-proof';\nimport { inspectLatestP7RuntimeEvidence } from './p7-runtime-evidence-inspector';\nimport { buildP7RuntimeEvidenceViewerHtml } from './p7-runtime-evidence-viewer';",
    'FullFrameValidator import',
  );

  next = requireReplace(
    next,
    "type P5ExclusiveOperation = 'runtime-self-test' | 'safe-fix-apply' | 'safe-fix-restore' | 'safe-fix-finalize';\nlet p5OperationInFlight: P5ExclusiveOperation | null = null;",
    "type P5ExclusiveOperation = 'runtime-self-test' | 'safe-fix-apply' | 'safe-fix-restore' | 'safe-fix-finalize' | 'batch-run' | 'batch-checkpoint';\nlet p5OperationInFlight: P5ExclusiveOperation | null = null;\nlet p7BatchState: BatchQueueState | null = null;\nlet p7CancelRequested = false;\nconst p7Metadata = createDefaultFigmaP7MetadataStore();",
    'exclusive operation declarations',
  );

  next = requireReplace(
    next,
    "  type: 'audit-error' | 'validation-error' | 'safe-fix-error' = 'audit-error',",
    "  type: 'audit-error' | 'validation-error' | 'safe-fix-error' | 'batch-error' = 'audit-error',",
    'postError type',
  );
  next = requireReplace(
    next,
    "function beginExclusiveP5Operation(operation: P5ExclusiveOperation, errorType: 'validation-error' | 'safe-fix-error'): boolean {",
    "function beginExclusiveP5Operation(operation: P5ExclusiveOperation, errorType: 'validation-error' | 'safe-fix-error' | 'batch-error'): boolean {",
    'exclusive operation error type',
  );

  const selectedFrameFn = `function selectedFrame(): FrameNode | null {\n  const selection = figma.currentPage.selection;\n  if (selection.length !== 1) return null;\n  const selected = selection[0];\n  return selected?.type === 'FRAME' ? selected : null;\n}\n`;
  const batchSelection = `\nfunction selectedBatchFrames(): FrameNode[] | null {\n  const selection = figma.currentPage.selection;\n  if (selection.length < 1 || selection.some((node) => node.type !== 'FRAME')) return null;\n  return selection as readonly FrameNode[] as FrameNode[];\n}\n`;
  next = requireReplace(next, selectedFrameFn, `${selectedFrameFn}${batchSelection}`, 'selectedFrame');

  next = requireReplace(
    next,
    "async function runtimeProofState(): Promise<{ valid: boolean; passedAt: string | null }> {\n  const stored = await figma.clientStorage.getAsync(P5_RUNTIME_PROOF_STORAGE_KEY);\n  if (!isValidP5RuntimeProof(stored, RUNTIME_BUILD)) return { valid: false, passedAt: null };\n  return { valid: true, passedAt: stored.passedAt };\n}",
    "async function runtimeProofState(): Promise<{ valid: boolean; passedAt: string | null }> {\n  const [stored, p7State] = await Promise.all([\n    figma.clientStorage.getAsync(P5_RUNTIME_PROOF_STORAGE_KEY),\n    readP7P5BuildProofState(figma.clientStorage, P7_BUILD_IDENTITY),\n  ]);\n  if (!isValidP5RuntimeProof(stored, RUNTIME_BUILD) || !p7State.valid || p7State.passedAt !== stored.passedAt) {\n    return { valid: false, passedAt: null };\n  }\n  return { valid: true, passedAt: stored.passedAt };\n}",
    'runtimeProofState',
  );

  next = requireReplace(
    next,
    "async function runRuntimeEvidenceViewer(): Promise<void> {",
    `${p7Inspector}\nasync function runRuntimeEvidenceViewer(): Promise<void> {`,
    'runtime evidence viewer',
  );
  next = requireReplace(
    next,
    "async function runSafeFixApply(message: { targetNodeId: string; recipe: SafeRecipeKind }): Promise<void> {",
    `${p7PostBatch}\nasync function validateFullP3(before: FrameNode, after: FrameNode) {\n  const validation = await fullFrameValidator.validate(before, after);\n  return validation.report;\n}\n\nasync function runSafeFixApply(message: { targetNodeId: string; recipe: SafeRecipeKind }): Promise<void> {`,
    'safe fix apply',
  );

  next = requireReplace(
    next,
    "    const acceptance = await updateP5RuntimeProofFromCalibration(figma.clientStorage, result, RUNTIME_BUILD);\n    const proof = await runtimeProofState();",
    "    const acceptance = await updateP5RuntimeProofFromCalibration(figma.clientStorage, result, RUNTIME_BUILD);\n    const storedProof = await figma.clientStorage.getAsync(P5_RUNTIME_PROOF_STORAGE_KEY);\n    const receiptReady = acceptance.accepted\n      ? await syncP7P5BuildProofReceipt(figma.clientStorage, storedProof, P7_BUILD_IDENTITY)\n      : false;\n    if (!receiptReady) await clearP7P5BuildProofReceipt(figma.clientStorage);\n    const proof = await runtimeProofState();",
    'runtime proof update',
  );
  next = requireReplace(
    next,
    "    await figma.clientStorage.deleteAsync(P5_RUNTIME_PROOF_STORAGE_KEY);",
    "    await Promise.all([\n      figma.clientStorage.deleteAsync(P5_RUNTIME_PROOF_STORAGE_KEY),\n      clearP7P5BuildProofReceipt(figma.clientStorage),\n    ]);",
    'runtime self-test cleanup',
  );
  next = next.replace(
    "'Safe Fix mutation is locked until Developer: P5 Runtime Self-Test passes in this exact CI-built plugin artifact.'",
    "'Safe Fix mutation is locked until the current build-bound P5 proof and exact-build P7 receipt both pass.'",
  );

  if (!next.includes('async function runCurrentP7Batch')) {
    const adaptedBatch = p7BatchFunctions
      .replaceAll('ExclusiveOperation', 'P5ExclusiveOperation')
      .replaceAll('beginExclusiveOperation', 'beginExclusiveP5Operation')
      .replaceAll('endExclusiveOperation', 'endExclusiveP5Operation');
    next = requireReplace(next, 'figma.ui.onmessage = async (message: unknown) => {', `${adaptedBatch}\nfigma.ui.onmessage = async (message: unknown) => {`, 'ui message handler');
  }

  next = requireReplace(
    next,
    "  if (type === 'validation-request') {",
    "  if (type === 'batch-start-request') {\n    await runP7BatchStart();\n    return;\n  }\n\n  if (type === 'batch-cancel-request') {\n    runP7BatchCancel();\n    return;\n  }\n\n  if (type === 'batch-resume-request') {\n    await runP7BatchResume();\n    return;\n  }\n\n  if (type === 'batch-checkpoint-finalize-request') {\n    await runP7BatchCheckpointFinalize();\n    return;\n  }\n\n  if (type === 'batch-checkpoint-restore-request') {\n    await runP7BatchCheckpointRestore();\n    return;\n  }\n\n  if (type === 'validation-request') {",
    'validation request handler',
  );

  next = requireReplace(
    next,
    "figma.on('selectionchange', () => {\n  const sequence = ++auditSequence;\n  if (figma.currentPage.selection.length === 1) void runAudit(sequence);\n});",
    "figma.on('selectionchange', () => {\n  const sequence = ++auditSequence;\n  if (p5OperationInFlight === 'batch-run' || p7BatchState?.status === 'PAUSED') return;\n  if (figma.currentPage.selection.length === 1) void runAudit(sequence);\n});",
    'selection change handler',
  );

  next = requireReplace(
    next,
    "} else if (figma.command === 'p5-runtime-evidence') {\n  void runRuntimeEvidenceViewer();\n} else {",
    "} else if (figma.command === 'p5-runtime-evidence') {\n  void runRuntimeEvidenceViewer();\n} else if (figma.command === 'p7-runtime-evidence') {\n  void runP7RuntimeEvidenceInspector();\n} else {",
    'developer command chain',
  );

  return next;
});

const p7Ui = branchFile('src/ui/ui.html');
const batchUiFunctions = extract(p7Ui, '    function bindBatchActions()', '    window.onmessage = async (event) => {');

await rewrite('src/ui/ui.html', (text) => {
  let next = text;
  next = requireReplace(
    next,
    '    .smallButton { font-size: 10px; padding: 7px 8px; }',
    '    .smallButton { font-size: 10px; padding: 7px 8px; }\n    #batch { grid-column: 1 / -1; }',
    'smallButton style',
  );
  next = requireReplace(
    next,
    '    .checkpoint { border: 1px solid var(--figma-color-border); border-radius: 8px; padding: 10px; margin: 10px 0; }',
    '    .checkpoint { border: 1px solid var(--figma-color-border); border-radius: 8px; padding: 10px; margin: 10px 0; }\n    .progressTrack { height: 6px; border-radius: 999px; overflow: hidden; background: var(--figma-color-bg-secondary); margin-top: 10px; }\n    .progressFill { height: 100%; background: var(--figma-color-text); opacity: .72; }',
    'checkpoint style',
  );
  next = next.replace(
    'Audit + actionable backlog + P3 validator + compiled-runtime-gated P5 Safe Fix',
    'Audit + actionable backlog + P3 validator + compiled-runtime-gated P5 Safe Fix + P7 batch queue',
  );
  next = next.replace(
    'Select one Frame to audit/preview, or two Frames to compare original vs candidate.',
    'Select one Frame to audit/preview, two Frames to compare, or multiple Frames for P7 batch processing.',
  );
  next = requireReplace(
    next,
    '      <button id="selftest">Runtime self-test</button>',
    '      <button id="selftest">Runtime self-test</button>\n      <button id="batch">Run selected batch</button>',
    'selftest button',
  );
  next = requireReplace(
    next,
    "    document.getElementById('selftest').addEventListener('click', () => {",
    "    document.getElementById('batch').addEventListener('click', () => {\n      root.className = 'empty';\n      root.textContent = 'Preparing selected Frames for bounded sequential P7 processing…';\n      exportPanel.hidden = true;\n      post('batch-start-request');\n    });\n    document.getElementById('selftest').addEventListener('click', () => {",
    'selftest listener',
  );
  if (!next.includes('function bindBatchActions()')) {
    next = requireReplace(next, '    window.onmessage = async (event) => {', `${batchUiFunctions}\n    window.onmessage = async (event) => {`, 'window message handler');
  }
  next = requireReplace(
    next,
    "      if (message.type === 'audit-error' || message.type === 'validation-error' || message.type === 'safe-fix-error') {",
    "      if (message.type === 'audit-error' || message.type === 'validation-error' || message.type === 'safe-fix-error' || message.type === 'batch-error') {",
    'UI error handler',
  );
  next = requireReplace(
    next,
    "      if (message.type === 'runtime-calibration-started') {",
    "      if (message.type === 'batch-state') {\n        exportPanel.hidden = true;\n        renderBatch(message);\n        return;\n      }\n\n      if (message.type === 'runtime-calibration-started') {",
    'runtime calibration handler',
  );
  return next;
});

console.log('P12 P7 integration rehearsal conflict resolution applied.');
