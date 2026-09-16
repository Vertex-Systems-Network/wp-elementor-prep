import { extendP15LocalTemplateDownloadUi } from './p15-local-template-download-ui.mjs';
import { buildSecureUi } from './ui-security-contract.mjs';

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
  'id="p15-preview"',
  'id="p15-download"',
  'id="p15-profile"',
  'id="p15-wp-version"',
  'id="p15-elementor-version"',
  'maxlength="64"',
  'id="plan"',
  'id="validate"',
  'id="selftest"',
  'id="batch"',
  "post('p15-elementor-preview-request')",
  "message.type === 'p15-elementor-preview-result'",
  'P15 ELEMENTOR LOCAL PREVIEW',
  'Target-Ready mapping readiness',
  'CATEGORICAL MAPPING READINESS · NOT TARGET COMPATIBILITY',
  'Compatibility coverage:',
  'NATIVE_WITH_REVIEW',
  'CONVERTIBLE',
  'FALLBACK',
  'UNSUPPORTED',
  'UNKNOWN',
  'targetCompatibilityClaim=false · productionAcceptance=false · downloadEnabled=false · importValidationStatus=NOT_RUN',
  'targetCompatibilityClaim=false · productionAcceptance=false · importValidationStatus=NOT_RUN · targetEnvironmentValidationStatus=NOT_RUN · downloadEnabled=false',
  "post('p15-elementor-local-template-download-request')",
  "message.type === 'p15-elementor-local-template-download-result'",
  "message.type === 'p15-elementor-local-template-download-unavailable'",
  'LOCAL ARTIFACT VALIDATED',
  'TARGET IMPORT NOT VERIFIED',
  'LOCAL ARTIFACT GATE DID NOT PASS',
  'downloadText(receipt.fileName, templateJson',
  "post('p15-elementor-target-profile-request'",
  "message.type === 'p15-elementor-target-profile-result'",
  "message.type === 'p15-elementor-target-profile-unavailable'",
  'Declared TargetProfile compatibility',
  'DECLARED METADATA ALIGNMENT ONLY',
  'referenceClosureStatus=',
  'targetEnvironmentValidationStatus=',
  'environmentObserved=false',
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
  'MAX_PIXEL_PNG_BYTES',
  'MAX_PIXEL_DIMENSION',
  'boundedPngBytes',
  'isSafeValidationId',
  'isSafeChannelTolerance',
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
  'P14 Runtime Review Packet',
  'reviewPacketJson',
  'p14-guided-prepare-review.json',
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
  const extendedDevelopmentUi = extendP15LocalTemplateDownloadUi(developmentUi);
  let releaseUi = buildSecureUi(extendedDevelopmentUi).replace(/\r\n/g, '\n');

  releaseUi = requireReplacement(
    releaseUi,
    '<div class="sub">Audit + P13 Build-Ready + read-only P14 Guided Prepare + read-only P15 Elementor preview + P3 validator + P5 Safe Fix + P7 batch queue</div>',
    '<div class="sub">Audit + actionable backlog + Elementor preview + locally validated Elementor JSON download + visual validation + safety-gated Safe Fix + sequential batch preparation</div>',
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
    /\n    document\.getElementById\('p14-preview'\)\.addEventListener\('click', \(\) => \{[\s\S]*?\n    \}\);\n    document\.getElementById\('p15-preview'\)/,
    "\n    document.getElementById('p15-preview')",
    'development-only P14 preview click handler',
  );
  releaseUi = requireRegexReplacement(
    releaseUi,
    /\n    function renderP14PlanPreview\(message\) \{[\s\S]*?\n    \}\n\n    function renderP15ElementorPreview\(message\) \{/,
    '\n    function renderP15ElementorPreview(message) {',
    'development-only P14 preview renderer',
  );
  releaseUi = requireRegexReplacement(
    releaseUi,
    /\n      if \(message\.type === 'p14-plan-preview-result'\) \{[\s\S]*?\n      if \(message\.type === 'p15-elementor-preview-result'\) \{/,
    "\n      if (message.type === 'p15-elementor-preview-result') {",
    'development-only P14 preview message handlers',
  );
  releaseUi = requireReplacement(
    releaseUi,
    '<div id="root" class="empty">Select one Frame to audit/preview, two Frames to compare, or multiple Frames for P7 batch processing.</div>',
    '<div id="root" class="empty">Select one Frame to audit, inspect/download locally validated Elementor JSON, or prepare safely; select two Frames to compare or multiple Frames for sequential batch preparation.</div>',
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
