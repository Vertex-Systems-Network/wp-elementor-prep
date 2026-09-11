import { readFile, writeFile } from 'node:fs/promises';

const path = 'src/plugin/main.ts';
let source = await readFile(path, 'utf8');

function replaceOnce(label, before, after) {
  const first = source.indexOf(before);
  if (first < 0) throw new Error(`${label}: expected source block not found`);
  if (source.indexOf(before, first + before.length) >= 0) throw new Error(`${label}: expected source block is not unique`);
  source = source.slice(0, first) + after + source.slice(first + before.length);
}

if (source.includes("from './p13-runtime-evidence'")) {
  throw new Error('P13 runtime wiring already appears in main.ts; refusing duplicate patch');
}

replaceOnce(
  'imports',
  "import { buildP7RuntimeEvidenceViewerHtml } from './p7-runtime-evidence-viewer';\n",
  "import { buildP7RuntimeEvidenceViewerHtml } from './p7-runtime-evidence-viewer';\n"
    + "import { buildP13RuntimeEvidenceBundle } from './p13-runtime-evidence';\n"
    + "import {\n"
    + "  loadLatestP13RuntimeEvidence,\n"
    + "  persistP13RuntimeEvidenceBestEffort,\n"
    + "} from './p13-runtime-evidence-storage';\n"
    + "import { buildP13RuntimeEvidenceViewerHtml } from './p13-runtime-evidence-viewer';\n",
);

replaceOnce(
  'audit persistence',
  "    await figma.clientStorage.setAsync(storageKey, backlog);\n    if (sequence !== auditSequence) return;\n\n    figma.ui.postMessage({\n",
  "    await figma.clientStorage.setAsync(storageKey, backlog);\n"
    + "    if (sequence !== auditSequence) return;\n\n"
    + "    const p13RuntimeEvidence = buildP13RuntimeEvidenceBundle({\n"
    + "      pluginVersion: PLUGIN_VERSION,\n"
    + "      build: P7_BUILD_IDENTITY,\n"
    + "      context: {\n"
    + "        fileKey,\n"
    + "        pageId,\n"
    + "        pageName,\n"
    + "        frameId: selected.id,\n"
    + "        frameName: selected.name,\n"
    + "      },\n"
    + "      audit: report,\n"
    + "      buildReady,\n"
    + "      capturedAt: report.generatedAt,\n"
    + "    });\n"
    + "    const p13RuntimeEvidencePersistence = await persistP13RuntimeEvidenceBestEffort(\n"
    + "      figma.clientStorage,\n"
    + "      p13RuntimeEvidence,\n"
    + "    );\n"
    + "    if (sequence !== auditSequence) return;\n\n"
    + "    figma.ui.postMessage({\n",
);

replaceOnce(
  'audit message',
  "      backlogMarkdown: serializeBacklogMarkdown(backlog),\n    });\n",
  "      backlogMarkdown: serializeBacklogMarkdown(backlog),\n"
    + "      p13RuntimeEvidencePersisted: p13RuntimeEvidencePersistence.persisted,\n"
    + "      p13RuntimeEvidencePersistence,\n"
    + "    });\n",
);

replaceOnce(
  'viewer function',
  "async function runRuntimeEvidenceViewer(): Promise<void> {\n",
  "async function runP13RuntimeEvidenceViewer(): Promise<void> {\n"
    + "  const evidence = await loadLatestP13RuntimeEvidence(figma.clientStorage);\n"
    + "  figma.showUI(buildP13RuntimeEvidenceViewerHtml(evidence), {\n"
    + "    width: 540,\n"
    + "    height: 720,\n"
    + "    themeColors: true,\n"
    + "  });\n\n"
    + "  if (!evidence) {\n"
    + "    figma.notify('No valid persisted P13 runtime evidence is available yet. Run Audit on one Frame first.');\n"
    + "    return;\n"
    + "  }\n"
    + "  const eligibility = evidence.traceableBuild && evidence.realFigmaContext\n"
    + "    ? 'parity candidate ready'\n"
    + "    : 'inspection only';\n"
    + "  figma.notify(`P13 runtime evidence loaded: ${evidence.buildReady.score.score ?? '—'} / ${evidence.buildReady.score.status} · ${eligibility}.`);\n"
    + "}\n\n"
    + "async function runRuntimeEvidenceViewer(): Promise<void> {\n",
);

replaceOnce(
  'command dispatch',
  "} else if (figma.command === 'p7-runtime-evidence') {\n  void runP7RuntimeEvidenceInspector();\n} else {\n",
  "} else if (figma.command === 'p7-runtime-evidence') {\n"
    + "  void runP7RuntimeEvidenceInspector();\n"
    + "} else if (figma.command === 'p13-runtime-evidence') {\n"
    + "  void runP13RuntimeEvidenceViewer();\n"
    + "} else {\n",
);

await writeFile(path, source, 'utf8');
