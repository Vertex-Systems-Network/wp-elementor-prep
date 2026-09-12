import {
  serializeP13RuntimeEvidenceJson,
  type P13RuntimeEvidenceBundle,
} from './p13-runtime-evidence';
import {
  buildP14PlanPreview,
  serializeP14PlanPreviewJson,
  type P14PlanPreviewV1,
} from './p14-plan-preview';

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

function eligibility(bundle: P13RuntimeEvidenceBundle): string {
  if (bundle.traceableBuild && bundle.realFigmaContext) return 'PARITY CANDIDATE READY';
  if (!bundle.traceableBuild && !bundle.realFigmaContext) return 'LOCAL / UNTRACEABLE BUILD + FILE';
  if (!bundle.traceableBuild) return 'REAL FIGMA FILE · UNTRACEABLE BUILD';
  return 'TRACEABLE BUILD · LOCAL FILE';
}

function renderP14ActionGroups(preview: P14PlanPreviewV1): string {
  if (!preview.plan) {
    const failures = preview.handoff.failures.length > 0
      ? preview.handoff.failures.map((failure) => `<li>${escapeHtml(failure)}</li>`).join('')
      : '<li>P13 evidence could not produce a P14 preparation plan.</li>';
    return `<div class="empty"><strong>P14 plan unavailable.</strong><ul>${failures}</ul></div>`;
  }

  const groups = [
    ['ELIGIBLE', 'Eligible changes'],
    ['NOOP', 'Already correct / no-op'],
    ['REVIEW', 'Review only'],
    ['REFUSED', 'Unsupported / refused'],
  ] as const;

  const groupHtml = groups.map(([decision, label]) => {
    const actions = preview.plan!.actions.filter((action) => action.decision === decision);
    if (actions.length === 0) return '';
    const rows = actions.map((action) => `
      <div class="actionRow">
        <div class="rowHead">
          <strong>${escapeHtml(action.recipeId ?? action.sourceRuleId)}</strong>
          <span>${escapeHtml(action.decision)} · ${action.confidence}%</span>
        </div>
        <div class="meta">${escapeHtml(action.sourceRuleId)}@${action.sourceRuleVersion} · ${action.targetNodeIds.length} target node(s)</div>
        ${action.mutationAllowlist.length > 0 ? `<div class="meta">Allowed fields: ${escapeHtml(action.mutationAllowlist.join(', '))}</div>` : ''}
        ${action.refusalCode ? `<div class="warning">${escapeHtml(action.refusalCode)}</div>` : ''}
      </div>`).join('');
    return `<div class="section"><div class="sectionTitle">${label} · ${actions.length}</div>${rows}</div>`;
  }).join('');

  const blockers = preview.plan.blockers.length > 0
    ? `<div class="section"><div class="sectionTitle">Blockers · ${preview.plan.blockers.length}</div>${preview.plan.blockers.map((blocker) => `
        <div class="actionRow">
          <div class="rowHead"><strong>${escapeHtml(blocker.code)}</strong><span>BLOCKED</span></div>
          <div class="warning">${escapeHtml(blocker.detail)}</div>
        </div>`).join('')}</div>`
    : '';

  return `${groupHtml}${blockers}`;
}

function renderP14Preview(bundle: P13RuntimeEvidenceBundle): string {
  const preview = buildP14PlanPreview(bundle.buildReady);
  const locked = !preview.mutationEnabled && !preview.confirmationEnabled;
  return `
    <div class="hero p14Hero">
      <div class="title">P14 Guided Prepare Preview</div>
      <div class="status">${escapeHtml(preview.summary.status)} · ${locked ? 'READ-ONLY / LOCKED' : 'UNEXPECTED AUTHORITY'}</div>
      <div class="meta">Target-neutral preparation plan derived from the exact persisted P13 Build-Ready evidence. This preview cannot confirm or mutate anything.</div>
      <div class="meta">acceptanceAuthority=false · targetCompatibilityClaim=false · mutationEnabled=false · confirmationEnabled=false</div>
    </div>
    <div class="grid">
      ${metric('total actions', preview.summary.totalActions)}
      ${metric('eligible', preview.summary.eligible)}
      ${metric('no-op', preview.summary.noOp)}
      ${metric('review', preview.summary.review)}
      ${metric('refused', preview.summary.refused)}
      ${metric('blockers', preview.summary.blockers)}
      ${metric('safe candidates handed off', preview.handoff.acceptedCandidateCount)}
      ${metric('review-only handed off', preview.handoff.reviewOnlyCount)}
      ${metric('registry valid', preview.handoff.registryValid ? 'yes' : 'no')}
      ${metric('plan digest', preview.plan?.planDigest ?? '—')}
    </div>
    ${renderP14ActionGroups(preview)}
    <button id="copy-p14-preview">Copy P14 plan preview JSON</button>
    <pre id="p14-preview-json">${escapeHtml(serializeP14PlanPreviewJson(preview))}</pre>`;
}

export function buildP13RuntimeEvidenceViewerHtml(bundle: P13RuntimeEvidenceBundle | null): string {
  const content = bundle
    ? `
      <div class="hero">
        <div class="title">P13 Runtime Evidence</div>
        <div class="status">${eligibility(bundle)}</div>
        <div class="meta">This evidence is read-only and has no mutation, production acceptance, publish or release authority.</div>
      </div>
      <div class="grid">
        ${metric('Build-Ready score', bundle.buildReady.score.score ?? '—')}
        ${metric('Build-Ready status', bundle.buildReady.score.status)}
        ${metric('Responsive risk', bundle.buildReady.responsiveRisk.level)}
        ${metric('responsive HIGH', bundle.buildReady.responsiveRisk.highRiskCount)}
        ${metric('coverage', `${Math.round(bundle.buildReady.coverage.overallCoverage * 100)}%`)}
        ${metric('blockers', bundle.buildReady.score.blockerCount)}
        ${metric('audit v1', `${bundle.audit.score} / ${bundle.audit.status}`)}
        ${metric('real Figma context', bundle.realFigmaContext ? 'yes' : 'no')}
        ${metric('traceable CI build', bundle.traceableBuild ? 'yes' : 'no')}
        ${metric('frame', bundle.context.frameName)}
        ${metric('file key', bundle.context.fileKey)}
        ${metric('page', bundle.context.pageName)}
        ${metric('source SHA', bundle.build.sourceSha)}
        ${metric('Actions run', `${bundle.build.runNumber} (${bundle.build.runId})`)}
        ${metric('Build-Ready run', bundle.buildReady.runId)}
        ${metric('captured at', bundle.capturedAt)}
      </div>
      <button id="copy-evidence">Copy P13 runtime evidence JSON</button>
      <pre id="evidence-json">${escapeHtml(serializeP13RuntimeEvidenceJson(bundle))}</pre>
      <div class="divider"></div>
      ${renderP14Preview(bundle)}`
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
.p14Hero { margin-top: 14px; }
.title { font-size: 14px; font-weight: 700; }
.status { font-size: 10px; font-weight: 700; margin-top: 5px; }
.meta { font-size: 10px; opacity: .75; margin-top: 5px; }
.warning { font-size: 10px; margin-top: 5px; line-height: 1.35; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
.metric { border: 1px solid var(--figma-color-border); border-radius: 6px; padding: 8px; }
.metric strong { display: block; font-size: 11px; word-break: break-all; }
.metric span { display: block; font-size: 9px; opacity: .7; margin-top: 3px; }
.section { margin: 12px 0; }
.sectionTitle { font-size: 11px; font-weight: 700; margin-bottom: 4px; }
.actionRow { border-top: 1px solid var(--figma-color-border); padding: 8px 0; }
.rowHead { display: flex; justify-content: space-between; gap: 8px; align-items: baseline; font-size: 10px; }
.rowHead span { opacity: .75; white-space: nowrap; }
.divider { border-top: 1px solid var(--figma-color-border); margin: 16px 0; }
button { width: 100%; padding: 9px 10px; border-radius: 6px; border: 1px solid var(--figma-color-border); background: var(--figma-color-bg-secondary); color: var(--figma-color-text); font-weight: 600; cursor: pointer; margin: 4px 0 8px; }
pre { margin: 0; padding: 10px; border: 1px solid var(--figma-color-border); border-radius: 6px; white-space: pre-wrap; word-break: break-word; font-size: 9px; max-height: 440px; overflow: auto; }
ul { margin: 8px 0 0; padding-left: 18px; }
</style>
</head>
<body>
${content}
<script>
async function copyText(buttonId, nodeId) {
  const button = document.getElementById(buttonId);
  const node = document.getElementById(nodeId);
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
const evidenceButton = document.getElementById('copy-evidence');
if (evidenceButton) evidenceButton.addEventListener('click', () => void copyText('copy-evidence', 'evidence-json'));
const p14Button = document.getElementById('copy-p14-preview');
if (p14Button) p14Button.addEventListener('click', () => void copyText('copy-p14-preview', 'p14-preview-json'));
</script>
</body>
</html>`;
}
