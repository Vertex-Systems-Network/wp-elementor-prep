import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const bridge = readFileSync('scripts/p15-real-target-proof-bridge.php', 'utf8');
const browser = readFileSync('scripts/p15-real-target-proof-browser.mjs', 'utf8');
const workflow = readFileSync('.github/workflows/p15-real-target-proof.yml', 'utf8');

describe('P15 proof bearer-token security', () => {
  it('keeps the bearer secret out of URLs and transports it via a request header', () => {
    expect(bridge).toContain("$_SERVER['HTTP_X_P15_PROOF_TOKEN']");
    expect(bridge).toContain("hash_equals( $expected, $provided )");
    expect(bridge).toContain("'1' === $action");
    expect(bridge).not.toContain("sanitize_text_field( wp_unslash( $_GET[ $key ] ) )");

    expect(browser).toContain("'x-p15-proof-token': token");
    expect(browser).toContain("headers: { 'X-P15-Proof-Token': token }");
    expect(browser).toContain("return baseUrl + '/?' + key + '=1';");
    expect(browser).toContain('async function gotoProof(page, url, token, options)');
    expect(browser).not.toContain('extraHTTPHeaders');
    expect(browser).not.toMatch(/proofUrl\([^\n]*token/);

    expect(workflow).toContain('-H "X-P15-Proof-Token: $P15_PROOF_TOKEN"');
    expect(workflow).not.toMatch(/\?p15_[^\s"']*=\$P15_PROOF_TOKEN/);
  });
});
