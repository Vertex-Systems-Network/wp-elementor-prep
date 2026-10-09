import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as boxShadow from '../src/targets/elementor/container-box-shadow-resolution';
import * as transition from '../src/targets/elementor/container-hover-transition-composition';
import * as linear from '../src/targets/elementor/container-linear-gradient-composition';
import * as radial from '../src/targets/elementor/container-radial-gradient-composition';
import { bindP15NeutralSourceToGeneratedContainers, cloneP15ReadyElementorTemplate } from '../src/targets/elementor/responsive-container-binding';
import type { P15NeutralExportDocumentV1 } from '../src/targets/elementor/neutral-export-ir';
import type { ElementorTemplateV04 } from '../src/targets/elementor/template-v04';
import { buildCorpus, type FamilyCorpusSpec, type GoldenCase } from './golden/m1-container-family-corpus';

/**
 * Write equivalence for the compact container compositions moved onto the engine (recovery M1.5c):
 * box shadow and hover transition. The linear/radial gradient baselines are kept as the "before"
 * record for their target repair (M1.5e), which deliberately changes their writes.
 *
 * The original compositions had their own ad-hoc result shapes (bare string issues, no counts, and
 * for radial a stale candidate), so the engine versions publish the standard engine result under a
 * new result version. What must not change is what they write: the baseline records, per case,
 * whether the original accepted it and the exact settings it produced on every bound container.
 * The engine versions must accept the same cases (except the documented differences below) and
 * produce identical settings, with a candidate that always matches the template.
 */
type Family = { id: string; spec: FamilyCorpusSpec; resolve: (s: unknown, m: unknown) => Record<string, unknown>; accepted: readonly string[] };

const shadowValue = { horizontal: -10, vertical: 10, blur: 20, spread: -5, color: '#123456', position: 'outline' };

const FAMILIES: Family[] = [
  {
    id: 'container-box-shadow',
    spec: { manifestVersion: boxShadow.P15_CONTAINER_BOX_SHADOW_MANIFEST_VERSION, extraFlags: ['styleInferencePerformed'],
      tabletValid: { normal: shadowValue }, mobileValid: { hover: { ...shadowValue, position: 'inset', blur: 0 } },
      invalidValues: [{ normal: { ...shadowValue, blur: -1 } }, { normal: { ...shadowValue, horizontal: 1.5 } }, { hover: { ...shadowValue, color: '#ABCDEF' } },
        { hover: { ...shadowValue, position: 'outset' } }, { normal: { horizontal: 1 } }, { normal: { ...shadowValue, extra: 1 } }, { normal: null }] },
    resolve: boxShadow.resolveP15ContainerBoxShadows as never,
    accepted: ['RESOLVED', 'NO_OVERRIDES', 'CONTAINER_BOX_SHADOWS_RESOLVED', 'NO_CONTAINER_BOX_SHADOW_OVERRIDES'],
  },
  {
    id: 'container-hover-transition',
    spec: { manifestVersion: transition.P15_ELEMENTOR_CONTAINER_HOVER_TRANSITION_MANIFEST_VERSION, extraFlags: ['transitionInferencePerformed'],
      tabletValid: { backgroundHover: 0, overlayHover: 1.5, borderHover: 3 }, mobileValid: { borderHover: 0.1 },
      invalidValues: [{ backgroundHover: 1.01 }, { overlayHover: -0.1 }, { borderHover: 3.1 }, { backgroundHover: '1' }, { backgroundHover: null }] },
    resolve: transition.resolveP15ElementorContainerHoverTransitions as never,
    accepted: ['RESOLVED', 'CONTAINER_HOVER_TRANSITIONS_RESOLVED', 'NO_CONTAINER_HOVER_TRANSITION_OVERRIDES'],
  },
];

/**
 * Cases whose acceptance deliberately differs from the original, with the reason. An empty entry
 * list is a valid no-op (`NO_*_OVERRIDES`) on the engine rather than an invalid manifest.
 */
const ACCEPTANCE_CHANGES: Readonly<Record<string, string>> = {
  'container-hover-transition/no-overrides': 'empty entry list is a no-op, not an invalid manifest',
};

function settingsOf(source: unknown, template: ElementorTemplateV04 | null): Record<string, unknown> | null {
  if (!template) return null;
  const binding = bindP15NeutralSourceToGeneratedContainers(source as P15NeutralExportDocumentV1, template);
  return Object.fromEntries([...binding.containers].map(([id, node]) => [id, node.settings]).sort(([a], [b]) => String(a).localeCompare(String(b))));
}

function writeRecord(family: Family, testCase: GoldenCase) {
  const result = family.resolve(testCase.source, testCase.manifest);
  const accepted = family.accepted.includes(result.status as string);
  const template = (result.template ?? null) as ElementorTemplateV04 | null;
  const candidate = (result.candidate ?? null) as { status: string; templateJson: string | null } | null;
  const candidateMatchesTemplate = template !== null && candidate !== null && candidate.status === 'READY_FOR_TARGET_IMPORT_VALIDATION'
    && JSON.stringify(cloneP15ReadyElementorTemplate(candidate as never)) === JSON.stringify(template);
  return JSON.parse(JSON.stringify({ name: testCase.name, accepted, settings: accepted ? settingsOf(testCase.source, template) : null, candidateMatchesTemplate }));
}

describe('recovery M1.5c — container composition write equivalence', () => {
  for (const family of FAMILIES) {
    it(`${family.id} accepts the same cases and writes identical settings as the original composition`, () => {
      const path = `tests/golden/m1-${family.id}-writes.golden.json`;
      const records = buildCorpus(family.spec).map((testCase) => writeRecord(family, testCase));
      if (process.env.GOLDEN_WRITE === '1') writeFileSync(path, `${JSON.stringify(records, null, 1)}\n`);
      expect(existsSync(path)).toBe(true);
      const golden = JSON.parse(readFileSync(path, 'utf8')) as Array<ReturnType<typeof writeRecord>>;
      expect(records.map((record) => record.name)).toEqual(golden.map((record) => record.name));
      records.forEach((record, index) => {
        const original = golden[index]!;
        const key = `${family.id}/${record.name}`;
        if (ACCEPTANCE_CHANGES[key]) {
          expect(record.accepted, key).toBe(!original.accepted);
          return;
        }
        expect(record.accepted, key).toBe(original.accepted);
        if (record.accepted) {
          expect(record.settings, key).toEqual(original.settings);
          expect(record.candidateMatchesTemplate, key).toBe(true);
        }
      });
    });
  }
});

/**
 * Container gradient target repair (recovery M1.5e): the v2 writes must be exactly the v1 writes with
 * Elementor's slider encoding (`{ unit, size, sizes: [] }`) for stops and angles; every acceptance
 * change is listed with its reason.
 */
const linearValue = { colorA: '#ff0000', colorB: '#0000ff', stopA: 0, stopB: 100, angleDeg: 45, tabletStopA: 10, tabletStopB: 90, mobileAngleDeg: 360 };
const radialValue = { colorA: '#ff0000', colorB: '#0000ff', stopA: 20, stopB: 80, position: 'top left', mobileStopA: 0, mobileStopB: 5 };
const GRADIENTS: Family[] = [
  {
    id: 'container-linear-gradient',
    spec: { manifestVersion: linear.P15_ELEMENTOR_CONTAINER_LINEAR_GRADIENT_MANIFEST_VERSION, extraFlags: ['gradientInferencePerformed'],
      tabletValid: { normal: linearValue }, mobileValid: { hover: { colorA: '#000000', colorB: '#ffffff', stopA: 50, stopB: 50, mobileStopA: 5, tabletAngleDeg: 0 } },
      invalidValues: [{ normal: { ...linearValue, stopA: 101 } }, { normal: { ...linearValue, angleDeg: 361 } }, { hover: { ...linearValue, colorA: '#FF0000' } },
        { normal: { colorA: '#ff0000', colorB: '#0000ff', stopA: 0 } }, { normal: { ...linearValue, position: 'top left' } }, { normal: null }, { hover: { ...linearValue, tabletStopA: -1 } }] },
    resolve: linear.resolveP15ElementorContainerLinearGradients as never,
    accepted: ['CONTAINER_LINEAR_GRADIENTS_RESOLVED', 'NO_CONTAINER_LINEAR_GRADIENT_OVERRIDES'],
  },
  {
    id: 'container-radial-gradient',
    spec: { manifestVersion: radial.P15_ELEMENTOR_CONTAINER_RADIAL_GRADIENT_MANIFEST_VERSION, extraFlags: ['gradientInferencePerformed'],
      tabletValid: { normal: radialValue }, mobileValid: { hover: { ...radialValue, position: 'bottom right', tabletStopA: 30 } },
      invalidValues: [{ normal: { ...radialValue, position: 'middle' } }, { normal: { ...radialValue, stopB: 101 } }, { hover: { ...radialValue, colorB: 'blue' } },
        { normal: { ...radialValue, angleDeg: 10 } }, { normal: { colorA: '#ff0000', colorB: '#0000ff', stopA: 0, stopB: 1 } }, { normal: null }] },
    resolve: radial.resolveP15ElementorContainerRadialGradients as never,
    accepted: ['CONTAINER_RADIAL_GRADIENTS_RESOLVED', 'NO_CONTAINER_RADIAL_GRADIENT_OVERRIDES'],
  },
];

const UNPAIRED = 'a tablet/mobile stop without its pair is refused (Elementor stores both stops per breakpoint)';
const GRADIENT_ACCEPTANCE_CHANGES: Readonly<Record<string, string>> = {
  'container-linear-gradient/mobile-only': UNPAIRED,
  'container-linear-gradient/both-two-containers-unsorted': UNPAIRED,
  'container-linear-gradient/no-overrides': 'empty entry list is a no-op, not an invalid manifest',
  'container-radial-gradient/mobile-only': UNPAIRED,
  'container-radial-gradient/both-two-containers-unsorted': UNPAIRED,
  'container-radial-gradient/no-overrides': 'empty entry list is a no-op, not an invalid manifest',
  'container-radial-gradient/entry-unknown-key': 'unknown entry keys are refused (v1 radial dropped them silently)',
};

const STOP_KEY = /_(?:color|color_b)_stop(?:_tablet|_mobile)?$/;
const ANGLE_KEY = /_gradient_angle(?:_tablet|_mobile)?$/;
/** The documented v1 → v2 encoding change: bare stop numbers and `{ size, unit }` angles become sliders. */
function sliderEncoded(settings: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!settings) return null;
  return Object.fromEntries(Object.entries(settings).map(([id, node]) => [id, Object.fromEntries(Object.entries(node as Record<string, unknown>).map(([key, value]) => {
    if (STOP_KEY.test(key) && typeof value === 'number') return [key, { unit: '%', size: value, sizes: [] }];
    if (ANGLE_KEY.test(key) && value !== null && typeof value === 'object') return [key, { unit: 'deg', size: (value as { size: number }).size, sizes: [] }];
    return [key, value];
  }))]));
}

describe('recovery M1.5e — container gradient target repair against the v1 write baseline', () => {
  for (const family of GRADIENTS) {
    it(`${family.id} v2 writes are exactly the v1 writes with slider encoding`, () => {
      const golden = JSON.parse(readFileSync(`tests/golden/m1-${family.id}-writes.golden.json`, 'utf8')) as Array<ReturnType<typeof writeRecord>>;
      const records = buildCorpus(family.spec).map((testCase) => writeRecord(family, testCase));
      expect(records.map((record) => record.name)).toEqual(golden.map((record) => record.name));
      let compared = 0;
      records.forEach((record, index) => {
        const original = golden[index]!;
        const key = `${family.id}/${record.name}`;
        if (GRADIENT_ACCEPTANCE_CHANGES[key]) {
          expect(record.accepted, key).toBe(!original.accepted);
          return;
        }
        expect(record.accepted, key).toBe(original.accepted);
        if (!record.accepted) return;
        expect(record.settings, key).toEqual(sliderEncoded(original.settings));
        expect(record.candidateMatchesTemplate, key).toBe(true);
        compared += 1;
      });
      expect(compared).toBeGreaterThan(0);
    });
  }
});
