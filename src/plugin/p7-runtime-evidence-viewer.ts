import type { P7RuntimeEvidenceInspection } from './p7-runtime-evidence-inspector';

function escapeHtml(value: unknown): string {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function metric(label: string, value: unknown): string {
  return `<div class="metric"><strong>${escapeHtml(value ?? '—')}</strong><span>${escapeHtml(label)}</span></div>`;
}

function closureBlock(inspection: P7RuntimeEvidenceInspection): string {
  const closure = inspection.closure;
  const failures = closure.failures.length
    ? `<div class="warnings">${closure.failures.map((failure) => `<div>${escapeHtml(failure)}</div>`).join('')}</div>`
    : '';

  return `
    <div class="closure">
      <div class="title">Closure acceptance: ${closure.accepted ? 'PASS' : 'FAIL'}</div>
      <div class="grid acceptance-grid">
        ${metric('P5 exact-build prerequisite', closure.p5PrerequisiteValid ? 'PASS' : 'FAIL')}
        ${metric('P5 proof passed at', closure.p5ProofPassedAt ?? 'missing')}
        ${metric('current build traceable', closure.currentBuildTraceable ? 'yes' : 'no')}
        ${metric('runtime evidence = current build', closure.runtimeEvidenceMatchesCurrentBuild ? 'yes' : 'no')}
      </div>
      ${failures}
      <button id="copy-closure">Copy closure bundle</button>
      <pre id="closure-json">${escapeHtml(inspection.closureJson)}</pre>
    </div>`;
}

function acceptanceBlock(inspection: P7RuntimeEvidenceInspection): string {
  const acceptance = inspection.acceptance;
  const failures = acceptance.failures.length
    ? `<div class="warnings">${acceptance.failures.map((failure) => `<div>${escapeHtml(failure)}</div>`).join('')}</div>`
    : '';

  return `
    <div class="acceptance">
      <div class="title">Runtime acceptance: ${acceptance.accepted ? 'PASS' : 'FAIL'}</div>
      <div class="grid acceptance-grid">
        ${metric('60+ completed stress evidence', acceptance.stressEvidenceAvailable ? 'available' : 'missing')}
        ${metric('active-frame cancellation evidence', acceptance.cancellationEvidenceAvailable ? 'available' : 'missing')}
      </div>
      ${failures}
      <button id="copy-acceptance">Copy runtime acceptance bundle</button>
      <pre id="acceptance-json">${escapeHtml(inspection.acceptanceJson)}</pre>
    </div>`;
}

export function buildP7RuntimeEvidenceViewerHtml(inspection: P7RuntimeEvidenceInspection): string {
  const closure = closureBlock(inspection);
  const acceptance = acceptanceBlock(inspection);
  const content = inspection.status === 'EMPTY'
    ? `${closure}${acceptance}<div class="empty">${escapeHtml(inspection.message)}</div>`
    : `
      ${closure}
      ${acceptance}
      <div class="hero">
        <div class="title">Persisted P7 Runtime Evidence</div>
        <div class="meta">Run key: ${escapeHtml(inspection.summary.runKey)}</div>
        <div class="meta">Started: ${escapeHtml(inspection.summary.startedAt)}</div>
      </div>
      <div class="grid">
        ${metric('build source SHA', inspection.summary.buildSourceSha)}
        ${metric('Actions run #', inspection.summary.buildRunNumber)}
        ${metric('Actions run id', inspection.summary.buildRunId)}
        ${metric('final status', inspection.summary.finalStatus)}
        ${metric('finished / total', `${inspection.summary.finalFinishedCount ?? '—'} / ${inspection.summary.finalTotalCount ?? '—'}`)}
        ${metric('elapsed ms', inspection.summary.elapsedMs)}
        ${metric('processor ms', inspection.summary.totalProcessorMs)}
        ${metric('recorded attempts', inspection.summary.recordedAttemptCount)}
        ${metric('max concurrency', inspection.summary.maxConcurrentProcessors)}
        ${metric('checkpoint pauses', inspection.summary.checkpointPauseCount)}
        ${metric('checkpoint resolutions', inspection.summary.checkpointResolutionCount)}
        ${metric('memory samples', inspection.summary.memorySampleCount)}
        ${metric('sample-point heap peak', inspection.summary.observedPeakUsedJsHeapBytesAtSamplePoints)}
      </div>
      <div class="meta">Memory sampling: ${inspection.summary.memorySamplingSupported ? 'supported' : 'unsupported in this runtime'}</div>
      <div class="meta">Cancellation: ${inspection.summary.cancellationRequested ? (inspection.summary.cancellationSettled ? 'requested + settled' : 'requested, not yet settled') : 'not requested'}</div>
      ${inspection.warnings.length ? `<div class="warnings">${inspection.warnings.map((warning) => `<div>${escapeHtml(warning)}</div>`).join('')}</div>` : ''}
      <button id="copy-latest">Copy latest bounded JSON</button>
      <pre id="latest-json">${escapeHtml(inspection.json)}</pre>`;

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
:root { font-family: Inter, system-ui, sans-serif; color-scheme: light dark; }
body { margin: 0; padding: 16px; background: var(--figma-color-bg); color: var(--figma-color-text); }
.hero, .empty, .acceptance, .closure { border: 1px solid var(--figma-color-border); border-radius: 8px; padding: 12px; margin-bottom: 12px; }
.title { font-size: 14px; font-weight: 700; }
.meta { font-size: 10px; opacity: .75; margin-top: 5px; word-break: break-word; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
.acceptance-grid { margin-top: 10px; margin-bottom: 0; }
.metric { border: 1px solid var(--figma-color-border); border-radius: 6px; padding: 8px; }
.metric strong { display: block; font-size: 12px; word-break: break-all; }
.metric span { display: block; font-size: 9px; opacity: .7; margin-top: 3px; }
.warnings { border: 1px solid var(--figma-color-border-danger, var(--figma-color-border)); border-radius: 6px; padding: 8px; margin: 12px 0; font-size: 10px; line-height: 1.4; }
button { width: 100%; padding: 9px 10px; border-radius: 6px; border: 1px solid var(--figma-color-border); background: var(--figma-color-bg-secondary); color: var(--figma-color-text); font-weight: 600; cursor: pointer; margin: 12px 0 8px; }
pre { margin: 0; padding: 10px; border: 1px solid var(--figma-color-border); border-radius: 6px; white-space: pre-wrap; word-break: break-word; font-size: 9px; max-height: 360px; overflow: auto; }
#closure-json, #acceptance-json { max-height: 240px; }
</style>
</head>
<body>
${content}
<script>
async function copyText(buttonId, textId) {
  const button = document.getElementById(buttonId);
  const node = document.getElementById(textId);
  if (!button || !node) return;
  const text = node.textContent || '';
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const area = document.createElement('textarea');
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    button.textContent = 'Copied';
  } catch {
    button.textContent = 'Copy failed — select JSON below';
  }
}
const closureCopy = document.getElementById('copy-closure');
if (closureCopy) closureCopy.addEventListener('click', () => copyText('copy-closure', 'closure-json'));
const acceptanceCopy = document.getElementById('copy-acceptance');
if (acceptanceCopy) acceptanceCopy.addEventListener('click', () => copyText('copy-acceptance', 'acceptance-json'));
const latestCopy = document.getElementById('copy-latest');
if (latestCopy) latestCopy.addEventListener('click', () => copyText('copy-latest', 'latest-json'));
</script>
</body>
</html>`;
}
