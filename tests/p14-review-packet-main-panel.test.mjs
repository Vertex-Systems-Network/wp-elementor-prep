import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { buildReleaseUi } from '../scripts/release-ui-contract.mjs';

const [ui, main, releaseContract] = await Promise.all([
  readFile(new URL('../src/ui/ui.html', import.meta.url), 'utf8'),
  readFile(new URL('../src/plugin/main.ts', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/release-ui-contract.mjs', import.meta.url), 'utf8'),
]);
const generatedReleaseUi = buildReleaseUi(ui);

describe('P14 runtime review packet main-panel contract', () => {
  it('builds the packet only after the existing exact context/freshness gates', () => {
    expect(main).toContain("from './p14-review-packet'");
    expect(main).toContain('const freshness = assessP14PreviewFreshness(');
    expect(main).toContain('if (!freshness.valid)');
    expect(main).toContain('const preview = buildP14PlanPreview(evidence.buildReady, sourceTree)');
    expect(main).toContain('const reviewPacket = buildP14ReviewPacket({');
    expect(main).toContain('pluginVersion: PLUGIN_VERSION');
    expect(main).toContain('runtimeBuild: P7_BUILD_IDENTITY');
    expect(main).toContain('reviewPacketJson: serializeP14ReviewPacketJson(reviewPacket)');
    expect(main).toContain('context: { ...evidence.context }');
  });

  it('shows exact non-authorizing review provenance next to the separate R6 confirmation boundary', () => {
    expect(ui).toContain('P14 Runtime Review Packet');
    expect(ui).toContain('DETERMINISTIC READ-ONLY REVIEW PACKET');
    expect(ui).toContain('reviewPacket.context.pageId');
    expect(ui).toContain('reviewPacket.context.frameId');
    expect(ui).toContain('reviewPacket.runtime.build.sourceSha');
    expect(ui).toContain('reviewPacket.p13Identity.analyzerVersion');
    expect(ui).toContain('id="exportP14ReviewPacket"');
    expect(ui).toContain('p14-guided-prepare-review.json');
    expect(ui).toContain('acceptanceAuthority=false · targetCompatibilityClaim=false · mutationEnabled=false · confirmationEnabled=false');
    expect(ui).toContain("post('p14-guided-prepare-confirm-request')");
    expect(ui).toContain('Confirm & create prepared duplicate');
    expect(ui).not.toContain("post('p14-confirmation-request')");
  });

  it('forbids all review-packet surfaces from the publishable release UI', () => {
    expect(releaseContract).toContain("'P14 Runtime Review Packet'");
    expect(releaseContract).toContain("'reviewPacketJson'");
    expect(releaseContract).toContain("'p14-guided-prepare-review.json'");
    expect(generatedReleaseUi).not.toContain('P14 Runtime Review Packet');
    expect(generatedReleaseUi).not.toContain('reviewPacketJson');
    expect(generatedReleaseUi).not.toContain('p14-guided-prepare-review.json');
    expect(generatedReleaseUi).not.toContain('exportP14ReviewPacket');
    expect(generatedReleaseUi).not.toContain('p14-guided-prepare-confirm-request');
    expect(generatedReleaseUi).not.toContain('Confirm & create prepared duplicate');
  });
});
