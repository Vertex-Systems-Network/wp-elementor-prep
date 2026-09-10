import { assessP6PreservationRefusalAcceptance } from './p6-refusal-acceptance';
import type { P6PreservationRefusalEvidenceBundle } from './p6-refusal-evidence';

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

export function buildP6PreservationRefusalEvidenceViewerHtml(
  evidence: P6PreservationRefusalEvidenceBundle,
): string {
  const acceptance = assessP6PreservationRefusalAcceptance(evidence);
  const preserveCount = evidence.plans.filter((plan) => plan.decision === 'PRESERVE').length;
  const reviewCount = evidence.plans.filter((plan) => plan.decision === 'REVIEW').length;
  const json = JSON.stringify({
    schemaVersion: 2,
    acceptance,
    evidence,
  }, null, 2);

  const planRows = evidence.plans.map((plan) => `
    <div class="plan">
      <strong>${escapeHtml(plan.decision)} · ${escapeHtml(plan.pattern)}</strong>
      <div>${escapeHtml(plan.targetNodeName)} · confidence ${escapeHtml(plan.confidence)}</div>
      <div>${escapeHtml(plan.reasonCode)} · preserve nodes ${escapeHtml(plan.preserveNodeIds.length)}</div>
    </div>`).join('');

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
:root { font-family: Inter, system-ui, sans-serif; color-scheme: light dark; }
body { margin: 0; padding: 16px; background: var(--figma-color-bg); color: var(--figma-color-text); }
.hero, .acceptance { border: 1px solid var(--figma-color-border); border-radius: 8px; padding: 12px; margin-bottom: 12px; }
.title { font-size: 14px; font-weight: 700; }
.meta { font-size: 10px; opacity: .75; margin-top: 5px; word-break: break-word; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
.metric, .plan { border: 1px solid var(--figma-color-border); border-radius: 6px; padding: 8px; }
.metric strong, .plan strong { display: block; font-size: 12px; word-break: break-word; }
.metric span, .plan div { display: block; font-size: 9px; opacity: .75; margin-top: 3px; }
.plans { display: grid; gap: 6px; margin: 12px 0; }
.warnings { border: 1px solid var(--figma-color-border-danger, var(--figma-color-border)); border-radius: 6px; padding: 8px; margin: 12px 0; font-size: 10px; line-height: 1.4; }
button { width: 100%; padding: 9px 10px; border-radius: 6px; border: 1px solid var(--figma-color-border); background: var(--figma-color-bg-secondary); color: var(--figma-color-text); font-weight: 600; cursor: pointer; margin: 12px 0 8px; }
pre { margin: 0; padding: 10px; border: 1px solid var(--figma-color-border); border-radius: 6px; white-space: pre-wrap; word-break: break-word; font-size: 9px; max-height: 300px; overflow: auto; }
</style>
</head>
<body>
<div class="acceptance">
  <div class="title">Preservation refusal acceptance: ${acceptance.accepted ? 'PASS' : 'FAIL'}</div>
  ${acceptance.failures.length ? `<div class="warnings">${acceptance.failures.map((failure) => `<div>${escapeHtml(failure)}</div>`).join('')}</div>` : ''}
</div>
<div class="hero">
  <div class="title">P6 Preservation Refusal Evidence</div>
  <div class="meta">Frame: ${escapeHtml(evidence.frame.name)} · ${escapeHtml(evidence.frame.id)}</div>
  <div class="meta">Captured: ${escapeHtml(evidence.capturedAt)}</div>
  <div class="meta">Build: ${escapeHtml(evidence.build.sourceSha)} · Actions #${escapeHtml(evidence.build.runNumber)} · run ${escapeHtml(evidence.build.runId)}</div>
  <div class="meta">P5 proof build: ${escapeHtml(evidence.p5RuntimeProofBuild?.sourceSha ?? 'not available')}</div>
  <div class="meta">Reason: ${escapeHtml(evidence.reason ?? '—')}</div>
</div>
<div class="grid">
  ${metric('outcome', evidence.outcomeStatus)}
  ${metric('build source SHA', evidence.build.sourceSha)}
  ${metric('Actions run #', evidence.build.runNumber)}
  ${metric('Actions run ID', evidence.build.runId)}
  ${metric('total plans', evidence.totalPlanCount)}
  ${metric('PRESERVE plans', preserveCount)}
  ${metric('REVIEW plans', reviewCount)}
  ${metric('plans truncated', evidence.plansTruncated)}
  ${metric('P5 proof', evidence.p5RuntimeProofPassedAt ?? 'not available')}
</div>
<div class="plans">${planRows}</div>
<button id="copy">Copy refusal acceptance bundle</button>
<pre id="json">${escapeHtml(json)}</pre>
<script>
const copy = document.getElementById('copy');
if (copy) copy.addEventListener('click', async () => {
  const jsonNode = document.getElementById('json');
  if (!jsonNode) return;
  const text = jsonNode.textContent || '';
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
    copy.textContent = 'Copied';
  } catch {
    copy.textContent = 'Copy failed — select JSON below';
  }
});
</script>
</body>
</html>`;
}
