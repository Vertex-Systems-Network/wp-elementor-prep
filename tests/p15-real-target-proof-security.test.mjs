import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const browser = readFileSync('scripts/p15-real-target-proof-browser.mjs', 'utf8');
const bridge = readFileSync('scripts/p15-real-target-proof-bridge.php', 'utf8');
const workflow = readFileSync('.github/workflows/p15-real-target-proof.yml', 'utf8');

describe('P15 real-target proof security boundary', () => {
  it('sends proof tokens only to the exact disposable loopback origins', () => {
    expect(browser).toContain('function controlledLoopbackBaseUrl');
    expect(browser).toContain("controlledLoopbackBaseUrl('P15_BASE_URL', required('P15_BASE_URL'), 8080)");
    expect(browser).toContain("controlledLoopbackBaseUrl('P15_SECOND_BASE_URL', required('P15_SECOND_BASE_URL'), 8082)");
    expect(browser).toContain("url.hostname !== '127.0.0.1'");
    expect(browser).toContain("url.protocol !== 'http:'");
    expect(browser).not.toContain('page.goto(server.editorLoginUrl');
    expect(browser).not.toContain('page.goto(server.renderUrl');
    expect(browser).not.toContain('page.goto(assetServer.renderUrl');
    expect(browser).not.toContain('page.goto(destinationServer.renderUrl');
  });

  it('does not reflect proof-token-bearing navigation URLs into retained bridge observations', () => {
    expect(bridge).not.toMatch(/['"]renderUrl['"]\s*=>/);
    expect(bridge).not.toMatch(/['"]editorLoginUrl['"]\s*=>/);
    expect(bridge).toContain("'editorUrl' => admin_url(");
  });

  it('masks the generated proof token before persisting it into the Actions environment', () => {
    const generateIndex = workflow.indexOf('P15_PROOF_TOKEN_VALUE="$(openssl rand -hex 24)"');
    const maskIndex = workflow.indexOf('echo "::add-mask::$P15_PROOF_TOKEN_VALUE"');
    const persistIndex = workflow.indexOf('echo "P15_PROOF_TOKEN=$P15_PROOF_TOKEN_VALUE" >> "$GITHUB_ENV"');
    expect(generateIndex).toBeGreaterThan(-1);
    expect(maskIndex).toBeGreaterThan(generateIndex);
    expect(persistIndex).toBeGreaterThan(maskIndex);
    expect(workflow).not.toContain('echo "P15_PROOF_TOKEN=$(openssl rand -hex 24)" >> "$GITHUB_ENV"');
  });

  it('redacts the exact ephemeral proof token before artifact upload and fails if it remains', () => {
    const sanitizeIndex = workflow.indexOf('- name: Sanitize retained proof diagnostics');
    const uploadIndex = workflow.indexOf('uses: actions/upload-artifact@');
    expect(sanitizeIndex).toBeGreaterThan(-1);
    expect(uploadIndex).toBeGreaterThan(sanitizeIndex);
    expect(workflow).toContain('[REDACTED_P15_PROOF_TOKEN]');
    expect(workflow).toContain('if path.is_file() and token in path.read_bytes()');
    expect(workflow).toContain('raise SystemExit(1)');
  });
});
