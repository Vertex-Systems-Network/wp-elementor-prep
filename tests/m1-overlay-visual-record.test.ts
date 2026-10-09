import { writeFileSync } from 'node:fs';
import { it } from 'vitest';
import * as overlay from '../src/targets/elementor/container-overlay-visual-composition';
import { bindP15NeutralSourceToGeneratedContainers } from '../src/targets/elementor/responsive-container-binding';
import type { P15NeutralExportDocumentV1 } from '../src/targets/elementor/neutral-export-ir';
import { buildCorpus } from './golden/m1-container-family-corpus';

const OVERLAY_VISUAL_SPEC = {
  manifestVersion: overlay.P15_ELEMENTOR_CONTAINER_OVERLAY_VISUAL_MANIFEST_VERSION,
  tabletValid: { blendMode: 'multiply', normal: { blur: 2, brightness: 150 } },
  mobileValid: { hover: { hue: 90, saturate: 50 } },
  invalidValues: [{ blendMode: 'difference' }, { normal: { blur: 11 } }, { hover: { contrast: -1 } }, { normal: { opacity: 1 } }, { normal: null }, { normal: {} }],
};

it('records the v1 overlay visual write baseline', () => {
  if (process.env.GOLDEN_WRITE !== '1') return;
  const records = buildCorpus(OVERLAY_VISUAL_SPEC).map((testCase) => {
    const result = overlay.resolveP15ElementorContainerOverlayVisuals(testCase.source, testCase.manifest);
    const accepted = result.status === 'RESOLVED';
    const settings = accepted ? Object.fromEntries([...bindP15NeutralSourceToGeneratedContainers(testCase.source as P15NeutralExportDocumentV1, result.template).containers]
      .map(([id, node]) => [id, node.settings]).sort(([a], [b]) => String(a).localeCompare(String(b)))) : null;
    return JSON.parse(JSON.stringify({ name: testCase.name, accepted, settings }));
  });
  writeFileSync('tests/golden/m1-container-overlay-visual-writes.golden.json', `${JSON.stringify(records, null, 1)}\n`);
});
