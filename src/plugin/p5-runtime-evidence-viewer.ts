import type { P5RuntimeEvidenceBundle } from './p5-runtime-evidence';

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

export function buildP5RuntimeEvidenceViewerHtml(evidence: P5RuntimeEvidenceBundle): string {
  const result = evidence.calibration;
  const json = JSON.stringify(evidence, null, 2);
  const status = evidence.acceptance.accepted && evidence.runtimeProofPassedAt ? 'PASS' : 'FAIL';
  return `<!doctype html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><style>
:root { font-family: Inter, system-ui, sans-serif; color-scheme: light dark; }
body { margin: 0; padding: 16px; background: var(--figma-color-bg); color: var(--figma-color-text); }
.hero { border: 1px solid var(--figma-color-border); border-radius: 8px; padding: 12px; margin-bottom: 12px; }
.title { font-size: 14px; font-weight: 700; }.meta { font-size: 10px; opacity: .75; margin-top: 5px; word-break: break-word; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }.metric { border: 1px solid var(--figma-color-border); border-radius: 6px; padding: 8px; }
.metric strong { display: block; font-size: 12px; }.metric span { display: block; font-size: 9px; opacity: .7; margin-top: 3px; }
.failures { border: 1px solid var(--figma-color-border-danger, var(--figma-color-border)); border-radius: 6px; padding: 8px; margin: 12px 0; font-size: 10px; line-height: 1.4; }
button { width: 100%; padding: 9px 10px; border-radius: 6px; border: 1px solid var(--figma-color-border); background: var(--figma-color-bg-secondary); color: var(--figma-color-text); font-weight: 600; cursor: pointer; margin: 12px 0 8px; }
pre { margin: 0; padding: 10px; border: 1px solid var(--figma-color-border); border-radius: 6px; white-space: pre-wrap; word-break: break-word; font-size: 9px; max-height: 340px; overflow: auto; }
</style></head><body>
<div class="hero"><div class="title">P5 Compiled Runtime Acceptance</div><div class="meta">Acceptance: ${escapeHtml(status)}</div><div class="meta">Captured: ${escapeHtml(evidence.capturedAt)}</div><div class="meta">Plugin: ${escapeHtml(evidence.pluginVersion)} · gate ${escapeHtml(evidence.runtimeGateVersion)}</div><div class="meta">Proof minted: ${escapeHtml(evidence.runtimeProofPassedAt ?? 'no')}</div></div>
<div class="grid">${metric('overall self-test', result.passed ? 'PASS' : 'FAIL')}${metric('leftovers', result.leftovers)}${metric('forced reject', result.forcedReject.validationRejected ? 'REJECTED' : 'NOT REJECTED')}${metric('forced reject pixels %', result.forcedReject.changedPixelPct ?? '—')}${metric('restore Full P3', result.passRestore.validationPassed ? 'PASS' : 'FAIL')}${metric('restore pixels %', result.passRestore.changedPixelPct ?? '—')}${metric('restore checkpoint', result.passRestore.checkpointCleared ? 'CLEARED' : 'PENDING')}${metric('finalize Full P3', result.passFinalize.validationPassed ? 'PASS' : 'FAIL')}${metric('finalize pixels %', result.passFinalize.changedPixelPct ?? '—')}${metric('finalize checkpoint', result.passFinalize.checkpointCleared ? 'CLEARED' : 'PENDING')}</div>
${evidence.acceptance.failures.length ? `<div class="failures">${evidence.acceptance.failures.map((failure) => `<div>${escapeHtml(failure)}</div>`).join('')}</div>` : ''}
<button id="copy">Copy bounded acceptance JSON</button><pre id="json">${escapeHtml(json)}</pre>
<script>const copy=document.getElementById('copy');if(copy)copy.addEventListener('click',async()=>{const jsonNode=document.getElementById('json');if(!jsonNode)return;const text=jsonNode.textContent||'';try{if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(text);}else{const area=document.createElement('textarea');area.value=text;document.body.appendChild(area);area.select();document.execCommand('copy');area.remove();}copy.textContent='Copied';}catch{copy.textContent='Copy failed — select JSON below';}});</script></body></html>`;
}
