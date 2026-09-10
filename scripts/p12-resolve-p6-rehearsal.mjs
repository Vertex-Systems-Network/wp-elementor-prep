import { readFile, writeFile } from 'node:fs/promises';

function requireReplace(text, search, replacement, label) {
  if (!text.includes(search)) throw new Error(`P6 resolver anchor missing: ${label}`);
  return text.replace(search, replacement);
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
  '    { "name": "Developer: P5 Runtime Evidence", "command": "p5-runtime-evidence" },\n    { "name": "Developer: P6 Page-Flow Clone Calibration", "command": "p6-page-flow-calibration" },\n    { "name": "Developer: P6 Runtime Evidence", "command": "p6-runtime-evidence" }',
  'manifest P5 runtime evidence command',
));

await rewrite('scripts/build.mjs', (text) => {
  const anchor = "await cp('src/ui/ui.html', 'dist/ui.html');";
  const verifier = `await build({\n  entryPoints: ['src/tools/verify-p6-closure.ts'],\n  bundle: true,\n  outfile: 'dist/verify-p6-closure.mjs',\n  platform: 'node',\n  target: 'node20',\n  format: 'esm',\n  minify: false,\n  define: provenanceDefines,\n});\n\n`;
  if (text.includes("outfile: 'dist/verify-p6-closure.mjs'")) return text;
  return requireReplace(text, anchor, `${verifier}${anchor}`, 'build ui copy');
});

await rewrite('src/plugin/main.ts', (text) => {
  let next = text;

  next = requireReplace(
    next,
    '  P5_RUNTIME_PROOF_STORAGE_KEY,\n} from \'../core/p5-runtime-gate\';',
    '  P5_RUNTIME_PROOF_STORAGE_KEY,\n  type P5RuntimeBuildIdentity,\n} from \'../core/p5-runtime-gate\';',
    'P5 runtime gate import',
  );

  next = requireReplace(
    next,
    "import { buildP5RuntimeEvidenceViewerHtml } from './p5-runtime-evidence-viewer';",
    "import { buildP5RuntimeEvidenceViewerHtml } from './p5-runtime-evidence-viewer';\nimport { inspectP6ClosureEvidence } from './p6-closure-inspector';\nimport { persistP6ClosureEvidenceBestEffort } from './p6-closure-evidence-storage';\nimport { buildP6ClosureViewerHtml } from './p6-closure-viewer';\nimport { runP6DeveloperPageFlowCalibration } from './p6-developer-calibration';\nimport { buildP6DeveloperEvidenceView } from './p6-developer-evidence-view';",
    'P5 evidence viewer import',
  );

  next = requireReplace(
    next,
    "type P5ExclusiveOperation = 'runtime-self-test' | 'safe-fix-apply' | 'safe-fix-restore' | 'safe-fix-finalize';",
    "type P5ExclusiveOperation = 'runtime-self-test' | 'safe-fix-apply' | 'safe-fix-restore' | 'safe-fix-finalize' | 'p6-page-flow-calibration';",
    'exclusive operation type',
  );

  next = requireReplace(
    next,
    "async function runtimeProofState(): Promise<{ valid: boolean; passedAt: string | null }> {\n  const stored = await figma.clientStorage.getAsync(P5_RUNTIME_PROOF_STORAGE_KEY);\n  if (!isValidP5RuntimeProof(stored, RUNTIME_BUILD)) return { valid: false, passedAt: null };\n  return { valid: true, passedAt: stored.passedAt };\n}",
    "async function runtimeProofState(): Promise<{ valid: boolean; passedAt: string | null; build: P5RuntimeBuildIdentity | null }> {\n  const stored = await figma.clientStorage.getAsync(P5_RUNTIME_PROOF_STORAGE_KEY);\n  if (!isValidP5RuntimeProof(stored, RUNTIME_BUILD)) return { valid: false, passedAt: null, build: null };\n  return { valid: true, passedAt: stored.passedAt, build: { ...stored.build } };\n}",
    'runtimeProofState',
  );

  const runtimeViewer = `async function runRuntimeEvidenceViewer(): Promise<void> {\n  const evidence = await loadLatestP5RuntimeEvidence(figma.clientStorage);\n  if (!evidence) {\n    figma.notify('No valid persisted P5 runtime acceptance evidence is available.');\n    return;\n  }\n  figma.showUI(buildP5RuntimeEvidenceViewerHtml(evidence), {\n    width: 520,\n    height: 700,\n    themeColors: true,\n  });\n}\n`;

  const p6Functions = `\nasync function runP6ClosureEvidenceViewer(): Promise<void> {\n  const inspection = await inspectP6ClosureEvidence(figma.clientStorage, RUNTIME_BUILD);\n  figma.showUI(buildP6ClosureViewerHtml(inspection), {\n    width: 520,\n    height: 720,\n    themeColors: true,\n  });\n}\n\nasync function runP6PageFlowDeveloperCalibration(): Promise<void> {\n  const selected = selectedFrame();\n  if (!selected) {\n    postError('Select exactly one page Frame before running P6 page-flow clone calibration.', 'validation-error');\n    return;\n  }\n\n  const operation: P5ExclusiveOperation = 'p6-page-flow-calibration';\n  if (!beginExclusiveP5Operation(operation, 'validation-error')) return;\n\n  figma.ui.postMessage({\n    type: 'p6-page-flow-calibration-started',\n    frameId: selected.id,\n    frameName: selected.name,\n    runtimeBuild: { ...RUNTIME_BUILD },\n  });\n\n  try {\n    const proof = await runtimeProofState();\n    const outcome = await runP6DeveloperPageFlowCalibration(selected, {\n      runtimeProofValid: async () => proof.valid,\n      hasPendingCheckpoint: hasPendingSafeFixCheckpoint,\n      validateFullP3: async (before, after) => {\n        const validation = await fullFrameValidator.validate(before, after);\n        return validation.report;\n      },\n    });\n\n    const evidenceView = buildP6DeveloperEvidenceView({\n      pluginVersion: PLUGIN_VERSION,\n      build: RUNTIME_BUILD,\n      p5RuntimeProofPassedAt: proof.passedAt,\n      p5RuntimeProofBuild: proof.build,\n      frame: selected,\n      outcome,\n    });\n    const closureEvidencePersisted = await persistP6ClosureEvidenceBestEffort(figma.clientStorage, evidenceView);\n\n    figma.ui.postMessage({\n      type: 'p6-page-flow-calibration-result',\n      outcome,\n      evidenceKind: evidenceView.kind,\n      evidence: evidenceView.evidence,\n      closureEvidencePersisted,\n      runtimeBuild: { ...RUNTIME_BUILD },\n    });\n\n    figma.showUI(evidenceView.html, { width: 520, height: 700, themeColors: true });\n\n    if (outcome.status === 'BLOCKED') {\n      figma.notify(\`P6 clone calibration blocked: ${'${outcome.reason}'}\`);\n      return;\n    }\n    if (outcome.status === 'NO_CANDIDATE') {\n      figma.notify(closureEvidencePersisted\n        ? 'P6 preservation/refusal acceptance passed and was retained for closure review.'\n        : 'P6 clone calibration did not run; preservation/refusal evidence is open for review.');\n      return;\n    }\n\n    const result = outcome.result;\n    if (result.leftoverCandidateRisk) {\n      postError(\`P6 clone calibration cleanup failed. Inspect candidate ${'${result.candidateNodeId ?? \'unknown\'}'} before continuing.\`, 'validation-error');\n      return;\n    }\n    if (result.status === 'PASSED') {\n      figma.notify(closureEvidencePersisted\n        ? 'P6 page-flow clone calibration passed Full P3; accepted evidence retained for closure review.'\n        : 'P6 page-flow clone calibration passed Full P3; candidate was discarded.');\n    } else if (result.status === 'REJECTED') {\n      figma.notify('P6 page-flow clone calibration was rejected by Full P3; candidate was discarded.');\n    } else {\n      figma.notify(\`P6 page-flow clone calibration ended ${'${result.status.toLowerCase()}'}; no production commit was attempted.\`);\n    }\n  } catch (error) {\n    const message = error instanceof Error ? error.message : String(error);\n    postError(\`P6 page-flow clone calibration failed: ${'${message}'}\`, 'validation-error');\n  } finally {\n    endExclusiveP5Operation(operation);\n  }\n}\n`;

  if (!next.includes('async function runP6ClosureEvidenceViewer')) {
    next = requireReplace(next, runtimeViewer, `${runtimeViewer}${p6Functions}`, 'P5 runtime evidence viewer function');
  }

  next = requireReplace(
    next,
    "  if (type === 'validation-pixel-result') {",
    "  if (type === 'p6-page-flow-calibration-request') {\n    await runP6PageFlowDeveloperCalibration();\n    return;\n  }\n\n  if (type === 'p6-runtime-evidence-request') {\n    await runP6ClosureEvidenceViewer();\n    return;\n  }\n\n  if (type === 'validation-pixel-result') {",
    'validation pixel handler',
  );

  next = requireReplace(
    next,
    "} else if (figma.command === 'p5-runtime-evidence') {\n  void runRuntimeEvidenceViewer();\n} else {",
    "} else if (figma.command === 'p5-runtime-evidence') {\n  void runRuntimeEvidenceViewer();\n} else if (figma.command === 'p6-page-flow-calibration') {\n  void runP6PageFlowDeveloperCalibration();\n} else if (figma.command === 'p6-runtime-evidence') {\n  void runP6ClosureEvidenceViewer();\n} else {",
    'developer command chain',
  );

  return next;
});

console.log('P12 P6 integration rehearsal conflict resolution applied.');
