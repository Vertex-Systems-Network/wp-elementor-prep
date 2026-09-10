import type { P6ClosureInspection } from './p6-closure-inspector';

function escapeHtml(value: unknown): string {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function metric(label: string, value: unknown): string {
  return `<div class="metric"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>`;
}

export function buildP6ClosureViewerHtml(inspection: P6ClosureInspection): string {
  const { acceptance, currentBuild } = inspection;
  const failures = acceptance.failures.length
    ? `<div class="warnings">${acceptance.failures.map((failure) => `<div>${escapeHtml(failure)}</div>`).join('')}</div>`
    : '';

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
:root { font-family: Inter, system-ui, sans-serif; color-scheme: light dark; }
body { margin: 0; padding: 16px; background: var(--figma-color-bg); color: var(--figma-color-text); }
.card { border: 1px solid var(--figma-color-border); border-radius: 8px; padding: 12px; margin-bottom: 12px; }
.title { font-size: 14px; font-weight: 700; }
.meta { font-size: 10px; opacity: .75; margin-top: 5px; word-break: break-word; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
.metric { border: 1px solid var(--figma-color-border); border-radius: 6px; padding: 8px; }
.metric strong { display: block; font-size: 12px; word-break: break-all; }
.metric span { display: block; font-size: 9px; opacity: .7; margin-top: 3px; }
.warnings { border: 1px solid var(--figma-color-border-danger, var(--figma-color-border)); border-radius: 6px; padding: 8px; margin: 12px 0; font-size: 10px; line-height: 1.4; }
button { width: 100%; padding: 9px 10px; border-radius: 6px; border: 1px solid var(--figma-color-border); background: var(--figma-color-bg-secondary); color: var(--figma-color-text); font-weight: 600; cursor: pointer; margin: 12px 0 8px; }
pre { margin: 0; padding: 10px; border: 1px solid var(--figma-color-border); border-radius: 6px; white-space: pre-wrap; word-break: break-word; font-size: 9px; max-height: 420px; overflow: auto; }
</style>
</head>
<body>
<div class="card">
  <div class="title">P6 Closure acceptance: ${acceptance.accepted ? 'PASS' : 'FAIL'}</div>
  <div class="meta">Closure requires an image-bearing positive clone calibration plus preservation-refusal evidence from this exact CI-built artifact.</div>
  <div class="grid">
    ${metric('current build traceable', acceptance.currentBuildTraceable ? 'yes' : 'no')}
    ${metric('positive evidence', acceptance.positiveAvailable ? 'available' : 'missing')}
    ${metric('positive acceptance', acceptance.positiveAccepted ? 'PASS' : 'FAIL')}
    ${metric('image-bearing positive evidence', acceptance.imageBearingPositiveEvidence ? 'yes' : 'no')}
    ${metric('positive current-build match', acceptance.positiveMatchesCurrentBuild ? 'yes' : 'no')}
    ${metric('refusal evidence', acceptance.refusalAvailable ? 'available' : 'missing')}
    ${metric('refusal acceptance', acceptance.refusalAccepted ? 'PASS' : 'FAIL')}
    ${metric('refusal current-build match', acceptance.refusalMatchesCurrentBuild ? 'yes' : 'no')}
  </div>
  ${failures}
</div>
<div class="card">
  <div class="title">Current compiled build</div>
  <div class="meta">Source SHA: ${escapeHtml(currentBuild.sourceSha)}</div>
  <div class="meta">Actions run #: ${escapeHtml(currentBuild.runNumber)}</div>
  <div class="meta">Actions run id: ${escapeHtml(currentBuild.runId)}</div>
</div>
<button id="copy-closure">Copy P6 closure bundle</button>
<pre id="closure-json">${escapeHtml(inspection.json)}</pre>
<script>
const button = document.getElementById('copy-closure');
const node = document.getElementById('closure-json');
if (button && node) button.addEventListener('click', async () => {
  const text = node.textContent || '';
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) await navigator.clipboard.writeText(text);
    else {
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
});
</script>
</body>
</html>`;
}
