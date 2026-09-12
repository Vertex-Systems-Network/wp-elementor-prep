function requireReplacement(source, from, to, label) {
  if (!source.includes(from)) {
    throw new Error(`Release UI contract drifted: missing ${label}.`);
  }
  return source.replace(from, to);
}

function requireRegexReplacement(source, pattern, to, label) {
  if (!pattern.test(source)) {
    throw new Error(`Release UI contract drifted: missing ${label}.`);
  }
  return source.replace(pattern, to);
}

const REQUIRED_PRODUCTION_TOKENS = [
  'id="audit"',
  'id="plan"',
  'id="validate"',
  'id="selftest"',
  'id="batch"',
  "post('safe-plan-request')",
  "post('safe-fix-apply-request'",
  "post('safe-fix-restore-request')",
  "post('safe-fix-finalize-request')",
  "post('runtime-calibration-request')",
  "post('batch-start-request')",
  "post('batch-cancel-request')",
  "post('batch-resume-request')",
  "post('batch-checkpoint-finalize-request')",
  "post('batch-checkpoint-restore-request')",
  'Run safety check',
  'SAFE FIX PREVIEW',
  'SAFE FIX RESULT',
  'BATCH PREP',
];

const FORBIDDEN_DEVELOPER_TOKENS = [
  'Developer:',
  'p5-runtime-evidence',
  'p6-page-flow-calibration',
  'p6-runtime-evidence',
  'p7-runtime-evidence',
  'p14-plan-preview-request',
  'Preview Guided Prepare',
  'P14 GUIDED PREPARE PREVIEW',
  'P5 COMPILED RUNTIME SELF-TEST',
  '>Runtime self-test<',
];

export function assertReleaseUiCapabilities(source) {
  for (const token of REQUIRED_PRODUCTION_TOKENS) {
    if (!source.includes(token)) {
      throw new Error(`Release UI contract drifted: required production token is missing: ${token}`);
    }
  }
  for (const token of FORBIDDEN_DEVELOPER_TOKENS) {
    if (source.includes(token)) {
      throw new Error(`Release UI contract drifted: developer-only token leaked into publishable UI: ${token}`);
    }
  }
  return source;
}

export function buildReleaseUi(developmentUi) {
  let releaseUi = developmentUi.replace(/\r\n/g, '\n');

  releaseUi = requireReplacement(
    releaseUi,
    '<div class="sub">Audit + P13 Build-Ready + read-only P14 Guided Prepare preview + P3 validator + P5 Safe Fix + P7 batch queue</div>',
    '<div class="sub">Audit + actionable backlog + visual validation + safety-gated Safe Fix + sequential batch preparation</div>',
    'development UI subtitle',
  );
  releaseUi = requireRegexReplacement(
    releaseUi,
    /      <button id="p14-preview">Preview Guided Prepare<\/button>\n/,
    '',
    'development-only P14 preview button',
  );
  releaseUi = requireRegexReplacement(
    releaseUi,
    /\n    document\.getElementById\('p14-preview'\)\.addEventListener\('click', \(\) => \{[\s\S]*?\n    \}\);\n    document\.getElementById\('plan'\)/,
    "\n    document.getElementById('plan')",
    'development-only P14 preview click handler',
  );
  releaseUi = requireRegexReplacement(
    releaseUi,
    /\n    function renderP14PlanPreview\(message\) \{[\s\S]*?\n    \}\n\n    function renderSafePlan\(message\) \{/,
    '\n    function renderSafePlan(message) {',
    'development-only P14 preview renderer',
  );
  releaseUi = requireRegexReplacement(
    releaseUi,
    /\n      if \(message\.type === 'p14-plan-preview-result'\) \{[\s\S]*?\n      if \(message\.type === 'safe-plan-result'\) \{/,
    "\n      if (message.type === 'safe-plan-result') {",
    'development-only P14 preview message handlers',
  );
  releaseUi = requireReplacement(
    releaseUi,
    '<div id="root" class="empty">Select one Frame to audit/preview, two Frames to compare, or multiple Frames for P7 batch processing.</div>',
    '<div id="root" class="empty">Select one Frame to audit or prepare safely, two Frames to compare, or multiple Frames for sequential batch preparation.</div>',
    'development UI initial guidance',
  );
  releaseUi = requireReplacement(
    releaseUi,
    '<button id="selftest">Runtime self-test</button>',
    '<button id="selftest">Run safety check</button>',
    'runtime self-test button',
  );
  releaseUi = requireReplacement(
    releaseUi,
    "root.textContent = 'Running disposable compiled P5 → P3 pixel broker → P4 self-test…';",
    "root.textContent = 'Running local build safety check before Safe Fix or batch preparation can unlock…';",
    'safety-check click copy',
  );
  releaseUi = requireReplacement(
    releaseUi,
    "root.textContent = 'Running disposable compiled P5 → FullFrameValidator → UI pixel broker → P4 self-test…';",
    "root.textContent = 'Running local build safety check with full visual validation…';",
    'safety-check progress copy',
  );
  releaseUi = requireReplacement(
    releaseUi,
    "'Compiled runtime proof: NOT PASSED — run Runtime self-test before mutation can unlock.'",
    "'Safety check: NOT PASSED — run the safety check before Safe Fix or batch preparation can unlock.'",
    'locked safety-check guidance',
  );
  releaseUi = requireReplacement(
    releaseUi,
    '<div class="status">P5 SAFE FIX PREVIEW</div>',
    '<div class="status">SAFE FIX PREVIEW</div>',
    'Safe Fix preview heading',
  );
  releaseUi = requireReplacement(
    releaseUi,
    '<div class="status">P5 SAFE FIX RESULT</div>',
    '<div class="status">SAFE FIX RESULT</div>',
    'Safe Fix result heading',
  );
  releaseUi = requireReplacement(
    releaseUi,
    '<div class="status">P5 COMPILED RUNTIME SELF-TEST</div>',
    '<div class="status">BUILD SAFETY CHECK</div>',
    'runtime acceptance heading',
  );
  releaseUi = requireReplacement(
    releaseUi,
    '<div class="status">P7 CHECKPOINT PAUSE</div>',
    '<div class="status">BATCH CHECKPOINT</div>',
    'batch checkpoint heading',
  );
  releaseUi = requireReplacement(
    releaseUi,
    '<div class="status">P7 BATCH · ${escapeHtml(state.status)}</div>',
    '<div class="status">BATCH PREP · ${escapeHtml(state.status)}</div>',
    'batch status heading',
  );
  releaseUi = requireReplacement(
    releaseUi,
    "root.textContent = 'Preparing selected Frames for bounded sequential P7 processing…';",
    "root.textContent = 'Preparing selected Frames for bounded sequential processing…';",
    'batch start copy',
  );
  releaseUi = requireReplacement(
    releaseUi,
    "root.textContent = 'Resuming bounded P7 queue…';",
    "root.textContent = 'Resuming bounded sequential queue…';",
    'batch resume copy',
  );
  releaseUi = requireReplacement(
    releaseUi,
    "root.textContent = 'Re-auditing the committed Frame and finalizing the P7 checkpoint…';",
    "root.textContent = 'Re-auditing the committed Frame and finalizing the batch checkpoint…';",
    'batch finalize copy',
  );

  return assertReleaseUiCapabilities(releaseUi);
}
