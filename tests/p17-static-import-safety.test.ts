import { describe, expect, it } from 'vitest';
import {
  P17_STATIC_IMPORT_MAX_CSS_FILE_BYTES,
  P17_STATIC_IMPORT_MAX_HTML_BYTES,
  P17_STATIC_IMPORT_MAX_STYLE_FILES,
  P17_STATIC_IMPORT_POLICY_VERSION,
  scanP17StaticImportSafety,
  validateP17StaticImportSource,
} from '../src/targets/web/static-import-safety';
import type { P17StaticImportSourceV1 } from '../src/targets/web/static-import-safety';

function fixture(): P17StaticImportSourceV1 {
  return {
    schemaVersion: 1,
    policyVersion: P17_STATIC_IMPORT_POLICY_VERSION,
    html: {
      path: 'index.html',
      content: '<!doctype html><html><head></head><body><main><h1>Hello</h1><p>Static content.</p></main></body></html>',
    },
    styles: [
      {
        path: 'styles.css',
        content: 'body{margin:0}main{display:flex;flex-direction:column;gap:16px}',
      },
    ],
  };
}

function codes(value: ReturnType<typeof scanP17StaticImportSafety>): string[] {
  return value.diagnostics.map((diagnostic) => diagnostic.code);
}

describe('P17 static HTML/CSS import safety preflight', () => {
  it('allows a bounded inert source to progress only to the future static parser', () => {
    const result = scanP17StaticImportSafety(fixture());

    expect(result.status).toBe('CLEAR_FOR_STATIC_PARSER');
    expect(result.validation.valid).toBe(true);
    expect(result.diagnostics).toEqual([]);
    expect(result.parserAcceptance).toBe(false);
    expect(result.sanitizedHtml).toBeNull();
    expect(result.sanitizedCss).toBeNull();
    expect(result.activeRenderAllowed).toBe(false);
    expect(result.javascriptExecutionAllowed).toBe(false);
    expect(result.networkAccessAllowed).toBe(false);
    expect(result.reconstructionAllowed).toBe(false);
    expect(result.productionAcceptance).toBe(false);
    expect(result.receipt.htmlSha256).toMatch(/^[0-9a-f]{64}$/);
    expect(result.receipt.styleFiles).toEqual([
      {
        path: 'styles.css',
        sha256: expect.stringMatching(/^[0-9a-f]{64}$/),
      },
    ]);
    expect(result.receipt.sourceSha256).toMatch(/^[0-9a-f]{64}$/);
  });

  it('blocks script elements, inline handlers, embedded documents, forms, base and meta refresh', () => {
    const value = fixture();
    value.html.content = `
      <base href="https://evil.example/">
      <meta http-equiv="refresh" content="0;url=https://evil.example/">
      <script src="evil.js"></script>
      <button onclick="alert(1)">Run</button>
      <iframe src="frame.html"></iframe>
      <object data="payload"></object>
      <embed src="payload">
      <form action="/submit"><input name="x"></form>
    `;

    const result = scanP17StaticImportSafety(value);

    expect(result.status).toBe('BLOCKED');
    expect(codes(result)).toEqual(expect.arrayContaining([
      'P17_IMPORT_BASE_ELEMENT_BLOCKED',
      'P17_IMPORT_EMBEDDED_DOCUMENT_BLOCKED',
      'P17_IMPORT_FORM_SURFACE_BLOCKED',
      'P17_IMPORT_INLINE_EVENT_HANDLER_BLOCKED',
      'P17_IMPORT_META_REFRESH_BLOCKED',
      'P17_IMPORT_SCRIPT_ELEMENT_BLOCKED',
    ]));
    expect(result.activeRenderAllowed).toBe(false);
    expect(result.javascriptExecutionAllowed).toBe(false);
  });

  it('blocks executable URL schemes even without script elements', () => {
    const value = fixture();
    value.html.content = `
      <a href="javascript:alert(1)">bad</a>
      <img src="data:text/html,<script>alert(1)</script>" alt="">
      <form action="vbscript:msgbox(1)"></form>
    `;

    const result = scanP17StaticImportSafety(value);
    expect(result.status).toBe('BLOCKED');
    expect(codes(result)).toContain('P17_IMPORT_EXECUTABLE_URL_BLOCKED');
    expect(result.javascriptExecutionAllowed).toBe(false);
  });

  it('blocks remote auto-fetching resources while leaving ordinary external anchor navigation non-authorizing', () => {
    const value = fixture();
    value.html.content = `
      <a href="https://example.com/docs">ordinary link</a>
      <img src="https://cdn.example.com/a.png" alt="">
      <link rel="stylesheet" href="//cdn.example.com/site.css">
      <video poster="http://cdn.example.com/poster.jpg"></video>
    `;

    const result = scanP17StaticImportSafety(value);
    expect(result.status).toBe('BLOCKED');
    expect(codes(result)).toContain('P17_IMPORT_REMOTE_RESOURCE_BLOCKED');
    expect(result.networkAccessAllowed).toBe(false);
  });

  it('blocks CSS imports, remote URLs and legacy executable CSS surfaces', () => {
    const value = fixture();
    value.styles[0]!.content = `
      @import "https://cdn.example.com/base.css";
      .hero{background:url(https://cdn.example.com/a.png)}
      .legacy{behavior:url(legacy.htc)}
      .old{width:expression(alert(1))}
    `;

    const result = scanP17StaticImportSafety(value);
    expect(result.status).toBe('BLOCKED');
    expect(codes(result)).toEqual(expect.arrayContaining([
      'P17_IMPORT_CSS_IMPORT_BLOCKED',
      'P17_IMPORT_CSS_EXECUTABLE_SURFACE_BLOCKED',
      'P17_IMPORT_REMOTE_RESOURCE_BLOCKED',
    ]));
  });

  it('scans style attributes and style blocks without creating an active DOM', () => {
    const value = fixture();
    value.html.content = `
      <div style="background:url(https://cdn.example.com/x.png)">x</div>
      <style>.x{background:url(data:image/png;base64,AA==)}</style>
    `;

    const result = scanP17StaticImportSafety(value);
    expect(result.status).toBe('BLOCKED');
    expect(codes(result)).toContain('P17_IMPORT_REMOTE_RESOURCE_BLOCKED');
    expect(codes(result)).toContain('P17_IMPORT_DATA_RESOURCE_REVIEW');
    expect(result.activeRenderAllowed).toBe(false);
  });

  it('marks unresolved local/data/root resources as review without claiming package closure', () => {
    const value = fixture();
    value.html.content = `
      <img src="images/local.png" alt="">
      <img src="/root/image.png" alt="">
      <img src="data:image/png;base64,AA==" alt="">
    `;
    value.styles[0]!.content = '.hero{background:url(assets/hero.png)}';

    const result = scanP17StaticImportSafety(value);
    expect(result.status).toBe('REVIEW_REQUIRED');
    expect(codes(result)).toEqual(expect.arrayContaining([
      'P17_IMPORT_DATA_RESOURCE_REVIEW',
      'P17_IMPORT_LOCAL_RESOURCE_REVIEW',
      'P17_IMPORT_ROOT_RESOURCE_REVIEW',
    ]));
    expect(result.parserAcceptance).toBe(false);
    expect(result.reconstructionAllowed).toBe(false);
  });

  it('blocks traversal-shaped resource references before package resolution exists', () => {
    const value = fixture();
    value.html.content = '<img src="../secret.png" alt="">';
    value.styles[0]!.content = '.x{background:url(../../secret.png)}';

    const result = scanP17StaticImportSafety(value);
    expect(result.status).toBe('BLOCKED');
    expect(codes(result)).toContain('P17_IMPORT_RESOURCE_TRAVERSAL_BLOCKED');
  });

  it('rejects unsafe source paths and case-colliding duplicate files', () => {
    const unsafe = fixture();
    unsafe.html.path = '../index.html';
    let validation = validateP17StaticImportSource(unsafe);
    expect(validation.valid).toBe(false);
    expect(validation.issues.map((issue) => issue.code)).toContain('P17_IMPORT_PATH_INVALID');

    const duplicate = fixture();
    duplicate.styles = [
      { path: 'CSS/site.css', content: 'a{}' },
      { path: 'css/SITE.CSS', content: 'b{}' },
    ];
    validation = validateP17StaticImportSource(duplicate);
    expect(validation.valid).toBe(false);
    expect(validation.issues.map((issue) => issue.code)).toContain('P17_IMPORT_DUPLICATE_PATH');
  });

  it('rejects HTML, per-file CSS and style-file-count limits before scanning', () => {
    const htmlOversize = fixture();
    htmlOversize.html.content = 'a'.repeat(P17_STATIC_IMPORT_MAX_HTML_BYTES + 1);
    let result = scanP17StaticImportSafety(htmlOversize);
    expect(result.status).toBe('REJECTED_INVALID_INPUT');
    expect(result.validation.issues.map((issue) => issue.code)).toContain('P17_IMPORT_HTML_BYTE_LIMIT_EXCEEDED');

    const cssOversize = fixture();
    cssOversize.styles[0]!.content = 'a'.repeat(P17_STATIC_IMPORT_MAX_CSS_FILE_BYTES + 1);
    result = scanP17StaticImportSafety(cssOversize);
    expect(result.status).toBe('REJECTED_INVALID_INPUT');
    expect(result.validation.issues.map((issue) => issue.code)).toContain('P17_IMPORT_CSS_FILE_BYTE_LIMIT_EXCEEDED');

    const manyFiles = fixture();
    manyFiles.styles = Array.from(
      { length: P17_STATIC_IMPORT_MAX_STYLE_FILES + 1 },
      (_, index) => ({ path: `styles/s${index}.css`, content: '.x{}' }),
    );
    result = scanP17StaticImportSafety(manyFiles);
    expect(result.status).toBe('REJECTED_INVALID_INPUT');
    expect(result.validation.issues.map((issue) => issue.code)).toContain('P17_IMPORT_STYLE_FILE_LIMIT_EXCEEDED');
  });

  it('keeps diagnostics content-free and deterministic', () => {
    const value = fixture();
    const secretMarker = 'PRIVATE_CONTENT_MUST_NOT_APPEAR';
    value.html.content = `<script>${secretMarker}</script><img src="https://evil.example/${secretMarker}.png">`;

    const first = scanP17StaticImportSafety(value);
    const second = scanP17StaticImportSafety(value);

    expect(first.diagnostics).toEqual(second.diagnostics);
    expect(JSON.stringify(first.diagnostics)).not.toContain(secretMarker);
    expect(first.receipt).toEqual(second.receipt);
  });

  it('canonicalizes source receipt identity across style-file input order', () => {
    const firstInput = fixture();
    firstInput.styles = [
      { path: 'a.css', content: 'a{display:block}' },
      { path: 'b.css', content: 'b{display:flex}' },
    ];
    const secondInput = fixture();
    secondInput.styles = [...firstInput.styles].reverse();

    const first = scanP17StaticImportSafety(firstInput);
    const second = scanP17StaticImportSafety(secondInput);

    expect(first.receipt.sourceSha256).toBe(second.receipt.sourceSha256);
    expect(first.receipt.styleFiles).toEqual(second.receipt.styleFiles);
  });
});
