function requireReplacement(source, from, to, label) {
  if (!source.includes(from)) {
    throw new Error(`P15 local-download UI contract drifted: missing ${label}.`);
  }
  return source.replace(from, to);
}

const BUTTON_SOURCE = `      <button id="p15-preview">Preview Elementor</button>
      <button id="plan">Preview safe fixes</button>`;

const BUTTON_EXTENDED = `      <button id="p15-preview">Preview Elementor</button>
      <button id="p15-download">Download Elementor JSON</button>
      <button id="p15-asset-pack">Download asset pack</button>
      <button id="plan">Preview safe fixes</button>`;

const CLICK_SOURCE = `    document.getElementById('p15-preview').addEventListener('click', () => {
      root.className = 'empty';
      root.textContent = 'Inspecting the selected Frame through the bounded read-only P15 Elementor path…';
      exportPanel.hidden = true;
      post('p15-elementor-preview-request', { optionBankId: selectedOptionBankId });
    });
    document.getElementById('p15-profile').addEventListener('click', () => {`;

const CLICK_EXTENDED = `    document.getElementById('p15-preview').addEventListener('click', () => {
      root.className = 'empty';
      root.textContent = 'Inspecting the selected Frame through the bounded read-only P15 Elementor path…';
      exportPanel.hidden = true;
      post('p15-elementor-preview-request', { optionBankId: selectedOptionBankId });
    });
    document.getElementById('p15-download').addEventListener('click', () => {
      root.className = 'empty';
      root.textContent = 'Re-reading the current selected Frame and building a fresh locally validated Elementor Template JSON…';
      exportPanel.hidden = true;
      post('p15-elementor-local-template-download-request', { optionBankId: selectedOptionBankId });
    });
    document.getElementById('p15-asset-pack').addEventListener('click', () => {
      root.className = 'empty';
      root.textContent = 'Re-reading the current selected Frame and building a fresh Elementor asset pack (template, assets, manifest, IMPORT.md)…';
      exportPanel.hidden = true;
      post('p15-elementor-asset-pack-request');
    });
    document.getElementById('p15-profile').addEventListener('click', () => {`;

const RENDERER_SOURCE = `    function renderP15TargetProfilePreview(message) {`;

const RENDERER_EXTENDED = `    function renderP15LocalTemplateDownload(message) {
      const result = message.result;
      if (!result || typeof result !== 'object') {
        root.className = 'empty';
        root.textContent = 'Elementor Template JSON download was refused because the result envelope is invalid.';
        return;
      }

      const authority = result.authority || {};
      const receipt = result.receipt;
      const reasons = Array.isArray(result.blockReasonCodes) ? result.blockReasonCodes : [];
      const fileNameValid = receipt
        && typeof receipt.fileName === 'string'
        && /^wp-builders-elementor-[0-9a-f]{16}\\.json$/.test(receipt.fileName);
      const safeAuthority = authority.fileDownload === true
        && authority.figmaMutation === false
        && authority.networkAccess === false
        && authority.wordpressConnection === false
        && authority.targetImport === false
        && authority.sectionTransfer === false
        && authority.targetCompatibilityClaim === false
        && authority.productionAcceptance === false
        && authority.importValidationStatus === 'NOT_RUN'
        && authority.targetEnvironmentValidationStatus === 'NOT_RUN'
        && authority.environmentObserved === false;
      const downloadable = result.status === 'LOCAL_ARTIFACT_VALIDATED'
        && reasons.length === 0
        && receipt
        && receipt.localValidationStatus === 'PASS'
        && receipt.targetCompatibilityClaim === false
        && receipt.productionAcceptance === false
        && receipt.importValidationStatus === 'NOT_RUN'
        && receipt.targetEnvironmentValidationStatus === 'NOT_RUN'
        && receipt.environmentObserved === false
        && fileNameValid
        && safeAuthority
        && typeof result.templateJson === 'string'
        && result.templateJson.length > 0;

      if (!downloadable) {
        result.templateJson = null;
        root.className = '';
        root.innerHTML = \`
          <div class="hero">
            <div class="score">DOWNLOAD BLOCKED</div>
            <div class="status">LOCAL ARTIFACT GATE DID NOT PASS</div>
            <div class="meta">No Elementor Template JSON was exposed. Target compatibility/import/editor/render remain unverified.</div>
          </div>
          \${reasons.length ? \`<div class="sectionTitle">Block reasons</div>\${reasons.map((reason) => \`<div class="row"><div class="name">\${escapeHtml(reason)}</div></div>\`).join('')}\` : '<div class="empty">The result failed the bounded download-authority contract.</div>'}\`;
        return;
      }

      const templateJson = result.templateJson;
      result.templateJson = null;
      downloadText(receipt.fileName, templateJson, 'application/json;charset=utf-8');
      root.className = '';
      root.innerHTML = \`
        <div class="hero">
          <div class="score">LOCAL ARTIFACT VALIDATED</div>
          <div class="status">TARGET IMPORT NOT VERIFIED</div>
          <div class="meta">Downloaded \${escapeHtml(receipt.fileName)} after fresh selected-Frame extraction, generation and local candidate revalidation.</div>
          <div class="meta">No WordPress/Elementor connection, target observation, import/editor/render verification, section transfer or Figma mutation occurred.</div>
          <div class="fingerprint">Artifact: \${escapeHtml(receipt.artifactFingerprint)}</div>
          <div class="fingerprint">Candidate: \${escapeHtml(receipt.candidateFingerprint)}</div>
        </div>\`;
    }

    function renderP15AssetPack(message) {
      const result = message.result;
      const label = result && result.label;
      const downloadable = result
        && result.version === 'p15-elementor-asset-pack-download-v1'
        && result.status === 'PACK_READY'
        && (label === 'LOCAL CANDIDATE' || label === 'REVIEW REQUIRED')
        && result.targetImportReady === false
        && typeof result.fileName === 'string'
        && /^[a-z0-9-]{1,60}-elementor-pack\\.zip$/.test(result.fileName)
        && result.bytes instanceof Uint8Array
        && result.bytes.length > 0;
      if (!downloadable) {
        if (result) result.bytes = null;
        root.className = '';
        root.innerHTML = \`
          <div class="hero">
            <div class="score">ASSET PACK BLOCKED</div>
            <div class="status">NO PACK WAS EXPOSED</div>
            <div class="meta">\${escapeHtml((result && result.blockReason) || 'The result failed the asset-pack download contract.')}</div>
          </div>\`;
        return;
      }

      const bytes = result.bytes;
      result.bytes = null;
      const blob = new Blob([bytes], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = result.fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 0);
      const reviews = Array.isArray(result.reviews) ? result.reviews : [];
      const reviewCount = Number.isSafeInteger(result.reviewCount) ? result.reviewCount : reviews.length;
      root.className = '';
      root.innerHTML = \`
        <div class="hero">
          <div class="score">\${escapeHtml(label)}</div>
          <div class="status">NOT READY FOR IMPORT</div>
          <div class="meta">Downloaded \${escapeHtml(result.fileName)}: template.json, \${escapeHtml(String(result.assetCount))} asset(s), manifest.json and IMPORT.md.</div>
          <div class="meta">Upload every asset to the Media Library and relink it as IMPORT.md describes before importing. Target import, editor and render remain unverified.</div>
        </div>
        <div class="sectionTitle">Review items (\${escapeHtml(String(reviewCount))})</div>
        \${reviews.length ? reviews.map((review) => \`<div class="row"><div class="name">\${escapeHtml(review.reasonCode)}</div><div class="meta">\${escapeHtml(review.detail)}</div></div>\`).join('') : '<div class="empty">No review items.</div>'}
        \${reviewCount > reviews.length ? \`<div class="meta">\${escapeHtml(String(reviewCount - reviews.length))} more in manifest.json.</div>\` : ''}\`;
    }

    function renderP15TargetProfilePreview(message) {`;

const MESSAGE_SOURCE = `      if (message.type === 'p15-elementor-target-profile-result') {`;

const MESSAGE_EXTENDED = `      if (message.type === 'p15-elementor-local-template-download-result') {
        exportPanel.hidden = true;
        renderP15LocalTemplateDownload(message);
        return;
      }

      if (message.type === 'p15-elementor-local-template-download-unavailable') {
        exportPanel.hidden = true;
        root.className = 'empty';
        root.textContent = message.message || 'P15 local Elementor Template JSON download is unavailable for the current selection.';
        return;
      }

      if (message.type === 'p15-elementor-asset-pack-result') {
        exportPanel.hidden = true;
        renderP15AssetPack(message);
        return;
      }

      if (message.type === 'p15-elementor-asset-pack-unavailable') {
        exportPanel.hidden = true;
        root.className = 'empty';
        root.textContent = message.message || 'Elementor asset pack is unavailable for the current selection.';
        return;
      }

      if (message.type === 'p15-elementor-target-profile-result') {`;

export function extendP15LocalTemplateDownloadUi(source) {
  let extended = source.replace(/\r\n/g, '\n');
  extended = requireReplacement(extended, BUTTON_SOURCE, BUTTON_EXTENDED, 'P15 action buttons');
  extended = requireReplacement(extended, CLICK_SOURCE, CLICK_EXTENDED, 'P15 preview click handler');
  extended = requireReplacement(extended, RENDERER_SOURCE, RENDERER_EXTENDED, 'P15 target-profile renderer anchor');
  extended = requireReplacement(extended, MESSAGE_SOURCE, MESSAGE_EXTENDED, 'P15 target-profile result handler anchor');
  return extended;
}
