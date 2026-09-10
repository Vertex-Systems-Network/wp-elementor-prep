import { assessP6PositiveCalibrationAcceptance } from './p6-runtime-acceptance';
import type { P6RuntimeEvidenceBundle } from './p6-runtime-evidence';

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

export function buildP6RuntimeEvidenceViewerHtml(evidence: P6RuntimeEvidenceBundle): string {
  const calibration = evidence.calibration;
  const validation = calibration?.validation ?? null;
  const plan = evidence.plan;
  const assessment = assessP6PositiveCalibrationAcceptance(evidence);
  const json = JSON.stringify(evidence, null, 2);

  const warnings: string[] = [];
  if (calibration?.leftoverCandidateRisk) warnings.push('Candidate cleanup risk is present; inspect the Figma document before continuing.');
  if (calibration?.productionCommitAttempted !== false) warnings.push('Unexpected production-commit evidence value.');
  if (evidence.outcomeStatus === 'COMPLETED' && calibration === null) warnings.push('Completed outcome has no calibration summary.');
  warnings.push(...assessment.failures.map((failure) => `Acceptance: ${failure}`));

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
:root { font-family: Inter, system-ui, sans-serif; color-scheme: light dark; }
body { margin: 0; padding: 16px; background: var(--figma-color-bg); color: var(--figma-color-text); }
.hero { border: 1px solid var(--figma-color-border); border-radius: 8px; padding: 12px; margin-bottom: 12px; }
.title { font-size: 14px; font-weight: 700; }
.meta { font-size: 10px; opacity: .75; margin-top: 5px; word-break: break-word; }
.acceptance { font-size: 18px; font-weight: 800; margin-top: 8px; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
.metric { border: 1px solid var(--figma-color-border); border-radius: 6px; padding: 8px; }
.metric strong { display: block; font-size: 12px; word-break: break-word; }
.metric span { display: block; font-size: 9px; opacity: .7; margin-top: 3px; }
.warnings { border: 1px solid var(--figma-color-border-danger, var(--figma-color-border)); border-radius: 6px; padding: 8px; margin: 12px 0; font-size: 10px; line-height: 1.4; }
button { width: 100%; padding: 9px 10px; border-radius: 6px; border: 1px solid var(--figma-color-border); background: var(--figma-color-bg-secondary); color: var(--figma-color-text); font-weight: 600; cursor: pointer; margin: 12px 0 8px; }
pre { margin: 0; padding: 10px; border: 1px solid var(--figma-color-border); border-radius: 6px; white-space: pre-wrap; word-break: break-word; font-size: 9px; max-height: 340px; overflow: auto; }
</style>
</head>
<body>
<div class="hero">
  <div class="title">P6 Clone Calibration Evidence</div>
  <div class="acceptance">Acceptance ${assessment.accepted ? 'PASS' : 'FAIL'}</div>
  <div class="meta">Frame: ${escapeHtml(evidence.frame.name)} · ${escapeHtml(evidence.frame.id)}</div>
  <div class="meta">Captured: ${escapeHtml(evidence.capturedAt)}</div>
  <div class="meta">Build: ${escapeHtml(evidence.build.sourceSha)} · Actions #${escapeHtml(evidence.build.runNumber)} · run ${escapeHtml(evidence.build.runId)}</div>
  <div class="meta">P5 gate: ${escapeHtml(evidence.p5RuntimeGateVersion)} · proof ${escapeHtml(evidence.p5RuntimeProofPassedAt ?? 'not available')}</div>
  <div class="meta">P5 proof build: ${escapeHtml(evidence.p5RuntimeProofBuild?.sourceSha ?? 'not available')}</div>
  <div class="meta">This acceptance covers the positive page-flow calibration only; separate real image-bearing/refusal scenarios are still required by the P6 tracker.</div>
</div>
<div class="grid">
  ${metric('acceptance', assessment.accepted ? 'PASS' : 'FAIL')}
  ${metric('build source SHA', evidence.build.sourceSha)}
  ${metric('Actions run #', evidence.build.runNumber)}
  ${metric('Actions run ID', evidence.build.runId)}
  ${metric('outcome', evidence.outcomeStatus)}
  ${metric('plan', plan?.recipe ?? '—')}
  ${metric('plan confidence', plan?.confidence ?? '—')}
  ${metric('calibration status', calibration?.status ?? '—')}
  ${metric('production commit attempted', calibration?.productionCommitAttempted ?? false)}
  ${metric('leftover risk', calibration?.leftoverCandidateRisk ?? false)}
  ${metric('Full P3', validation ? (validation.passed ? 'PASS' : 'FAIL') : '—')}
  ${metric('changed pixels %', validation?.changedPixelPct ?? '—')}
  ${metric('mean channel Δ', validation?.meanChannelDelta ?? '—')}
  ${metric('max channel Δ', validation?.maxChannelDelta ?? '—')}
</div>
${evidence.reason ? `<div class="meta">Reason: ${escapeHtml(evidence.reason)}</div>` : ''}
${warnings.length ? `<div class="warnings">${warnings.map((warning) => `<div>${escapeHtml(warning)}</div>`).join('')}</div>` : ''}
<button id="copy">Copy bounded JSON</button>
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
