import {
  serializeP13RuntimeEvidenceJson,
  type P13RuntimeEvidenceBundle,
} from './p13-runtime-evidence';

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

export function buildP13RuntimeEvidenceViewerHtml(bundle: P13RuntimeEvidenceBundle | null): string {
  const content = bundle
    ? `
      <div class="hero">
        <div class="title">P13 Runtime Evidence</div>
        <div class="status">${bundle.traceableBuild ? 'TRACEABLE CI BUILD' : 'LOCAL / UNTRACEABLE BUILD'}</div>
        <div class="meta">This evidence has no mutation or release acceptance authority.</div>
      </div>
      <div class="grid">
        ${metric('Build-Ready score', bundle.buildReady.score.score ?? '—')}
        ${metric('Build-Ready status', bundle.buildReady.score.status)}
        ${metric('Responsive risk', bundle.buildReady.responsiveRisk.level)}
        ${metric('responsive HIGH', bundle.buildReady.responsiveRisk.highRiskCount)}
        ${metric('coverage', `${Math.round(bundle.buildReady.coverage.overallCoverage * 100)}%`)}
        ${metric('blockers', bundle.buildReady.score.blockerCount)}
        ${metric('audit v1', `${bundle.audit.score} / ${bundle.audit.status}`)}
        ${metric('frame', bundle.context.frameName)}
        ${metric('file key', bundle.context.fileKey)}
        ${metric('page', bundle.context.pageName)}
        ${metric('source SHA', bundle.build.sourceSha)}
        ${metric('Actions run', `${bundle.build.runNumber} (${bundle.build.runId})`)}
        ${metric('Build-Ready run', bundle.buildReady.runId)}
        ${metric('captured at', bundle.capturedAt)}
      </div>
      <button id="copy-evidence">Copy P13 runtime evidence JSON</button>
      <pre id="evidence-json">${escapeHtml(serializeP13RuntimeEvidenceJson(bundle))}</pre>`
    : `<div class="empty">No valid persisted P13 runtime evidence is available yet. Run Audit on exactly one Frame first.</div>`;

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
:root { font-family: Inter, system-ui, sans-serif; color-scheme: light dark; }
body { margin: 0; padding: 16px; background: var(--figma-color-bg); color: var(--figma-color-text); }
.hero, .empty { border: 1px solid var(--figma-color-border); border-radius: 8px; padding: 12px; margin-bottom: 12px; }
.title { font-size: 14px; font-weight: 700; }
.status { font-size: 10px; font-weight: 700; margin-top: 5px; }
.meta { font-size: 10px; opacity: .75; margin-top: 5px; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
.metric { border: 1px solid var(--figma-color-border); border-radius: 6px; padding: 8px; }
.metric strong { display: block; font-size: 11px; word-break: break-all; }
.metric span { display: block; font-size: 9px; opacity: .7; margin-top: 3px; }
button { width: 100%; padding: 9px 10px; border-radius: 6px; border: 1px solid var(--figma-color-border); background: var(--figma-color-bg-secondary); color: var(--figma-color-text); font-weight: 600; cursor: pointer; margin: 4px 0 8px; }
pre { margin: 0; padding: 10px; border: 1px solid var(--figma-color-border); border-radius: 6px; white-space: pre-wrap; word-break: break-word; font-size: 9px; max-height: 440px; overflow: auto; }
</style>
</head>
<body>
${content}
<script>
const button = document.getElementById('copy-evidence');
if (button) button.addEventListener('click', async () => {
  const node = document.getElementById('evidence-json');
  const text = node ? (node.textContent || '') : '';
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
});
</script>
</body>
</html>`;
}
