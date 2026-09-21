import { describe, expect, it } from 'vitest';
import {
  P17_CSS_SUPPORT_CATEGORIES,
  P17_CSS_SUPPORT_MATRIX_V1,
  P17_CSS_SUPPORT_MATRIX_VERSION,
  P17_CSS_SUPPORT_STATUSES,
  getP17CssSupportFeature,
  serializeP17CssSupportMatrix,
  validateP17CssSupportMatrix,
  type P17CssSupportMatrixV1,
} from '../src/targets/web/css-support-matrix';

function clone(): P17CssSupportMatrixV1 {
  return JSON.parse(JSON.stringify(P17_CSS_SUPPORT_MATRIX_V1)) as P17CssSupportMatrixV1;
}

describe('P17 machine-readable CSS support matrix', () => {
  it('publishes a valid deterministic v1 matrix with unique sorted feature IDs', () => {
    const validation = validateP17CssSupportMatrix(P17_CSS_SUPPORT_MATRIX_V1);
    const ids = P17_CSS_SUPPORT_MATRIX_V1.entries.map((entry) => entry.featureId);

    expect(P17_CSS_SUPPORT_MATRIX_VERSION).toBe('p17-css-support-matrix-v1');
    expect(validation.valid).toBe(true);
    expect(validation.entryCount).toBe(P17_CSS_SUPPORT_MATRIX_V1.entries.length);
    expect(ids).toEqual([...ids].sort());
    expect(new Set(ids).size).toBe(ids.length);
    expect(Object.isFrozen(P17_CSS_SUPPORT_MATRIX_V1)).toBe(true);
    expect(Object.isFrozen(P17_CSS_SUPPORT_MATRIX_V1.authority)).toBe(true);
    expect(Object.isFrozen(P17_CSS_SUPPORT_MATRIX_V1.entries)).toBe(true);
  });

  it('covers every initial P17 CSS support category with explicit status metadata', () => {
    const categories = new Set(P17_CSS_SUPPORT_MATRIX_V1.entries.map((entry) => entry.category));
    for (const category of P17_CSS_SUPPORT_CATEGORIES) {
      expect(categories.has(category), category).toBe(true);
    }

    for (const entry of P17_CSS_SUPPORT_MATRIX_V1.entries) {
      expect(P17_CSS_SUPPORT_STATUSES).toContain(entry.designToWeb.status);
      expect(P17_CSS_SUPPORT_STATUSES).toContain(entry.staticImport.status);
      expect(P17_CSS_SUPPORT_STATUSES).toContain(entry.webToFigma.status);
      expect(entry.noteCode).toMatch(/^[A-Z0-9_]+$/);
    }
  });

  it('marks only merged design-to-web capabilities as implemented and keeps unwired import/reconstruction unknown', () => {
    expect(getP17CssSupportFeature('layout.block-flow')?.designToWeb).toEqual({
      status: 'SUPPORTED',
      basis: 'MERGED_IMPLEMENTATION',
    });
    expect(getP17CssSupportFeature('layout.flex')?.designToWeb).toEqual({
      status: 'SUPPORTED',
      basis: 'MERGED_IMPLEMENTATION',
    });
    expect(getP17CssSupportFeature('grid.layout')?.designToWeb).toEqual({
      status: 'SUPPORTED',
      basis: 'MERGED_IMPLEMENTATION',
    });
    expect(getP17CssSupportFeature('spacing.padding')?.designToWeb.status).toBe('SUPPORTED');
    expect(getP17CssSupportFeature('spacing.gap')?.designToWeb.status).toBe('SUPPORTED');
    expect(getP17CssSupportFeature('typography.basic')?.designToWeb.status).toBe('SUPPORTED_WITH_REVIEW');
    expect(getP17CssSupportFeature('media.queries')?.designToWeb.status).toBe('UNSUPPORTED');

    for (const entry of P17_CSS_SUPPORT_MATRIX_V1.entries) {
      expect(entry.staticImport).toEqual({ status: 'UNKNOWN', basis: 'SPEC_POLICY_ONLY' });
      expect(entry.webToFigma).toEqual({ status: 'UNKNOWN', basis: 'SPEC_POLICY_ONLY' });
    }
  });

  it('keeps all execution, network, fidelity, reconstruction and production authority false', () => {
    expect(P17_CSS_SUPPORT_MATRIX_V1.authority).toEqual({
      javascriptExecution: false,
      networkAccess: false,
      browserFidelityClaim: false,
      reconstructionAcceptance: false,
      productionAcceptance: false,
    });

    const serialized = serializeP17CssSupportMatrix(P17_CSS_SUPPORT_MATRIX_V1);
    expect(serialized).toContain('"javascriptExecution": false');
    expect(serialized).toContain('"networkAccess": false');
    expect(serialized).toContain('"browserFidelityClaim": false');
    expect(serialized).toContain('"reconstructionAcceptance": false');
    expect(serialized).toContain('"productionAcceptance": false');
    expect(serialized).not.toContain('"javascriptExecution": true');
    expect(serialized).not.toContain('"networkAccess": true');
  });

  it('fails closed on authority escalation, duplicate/unsorted IDs and unsupported statuses', () => {
    const authority = clone() as unknown as Record<string, unknown>;
    (authority.authority as Record<string, unknown>).networkAccess = true;
    let validation = validateP17CssSupportMatrix(authority);
    expect(validation.valid).toBe(false);
    expect(validation.issues.map((item) => item.code)).toContain('P17_CSS_MATRIX_AUTHORITY_INVALID');

    const duplicate = clone() as unknown as Record<string, unknown>;
    const duplicateEntries = duplicate.entries as Array<Record<string, unknown>>;
    duplicateEntries[1]!.featureId = duplicateEntries[0]!.featureId;
    validation = validateP17CssSupportMatrix(duplicate);
    expect(validation.valid).toBe(false);
    expect(validation.issues.map((item) => item.code)).toContain('P17_CSS_MATRIX_DUPLICATE_FEATURE_ID');

    const unsorted = clone() as unknown as Record<string, unknown>;
    const unsortedEntries = unsorted.entries as Array<Record<string, unknown>>;
    [unsortedEntries[0], unsortedEntries[1]] = [unsortedEntries[1]!, unsortedEntries[0]!];
    validation = validateP17CssSupportMatrix(unsorted);
    expect(validation.valid).toBe(false);
    expect(validation.issues.map((item) => item.code)).toContain('P17_CSS_MATRIX_ORDER_INVALID');

    const status = clone() as unknown as Record<string, unknown>;
    const statusEntries = status.entries as Array<Record<string, unknown>>;
    (statusEntries[0]!.designToWeb as Record<string, unknown>).status = 'MAGICALLY_SUPPORTED';
    validation = validateP17CssSupportMatrix(status);
    expect(validation.valid).toBe(false);
    expect(validation.issues.map((item) => item.code)).toContain('P17_CSS_MATRIX_STATUS_INVALID');
  });

  it('serializes canonically independent of object-key insertion order and provides bounded lookup', () => {
    const canonical = serializeP17CssSupportMatrix(P17_CSS_SUPPORT_MATRIX_V1);
    const reordered = {
      entries: clone().entries.map((entry) => ({
        noteCode: entry.noteCode,
        webToFigma: { basis: entry.webToFigma.basis, status: entry.webToFigma.status },
        staticImport: { basis: entry.staticImport.basis, status: entry.staticImport.status },
        designToWeb: { basis: entry.designToWeb.basis, status: entry.designToWeb.status },
        category: entry.category,
        featureId: entry.featureId,
      })),
      authority: {
        productionAcceptance: false,
        reconstructionAcceptance: false,
        browserFidelityClaim: false,
        networkAccess: false,
        javascriptExecution: false,
      },
      matrixVersion: P17_CSS_SUPPORT_MATRIX_VERSION,
      schemaVersion: 1,
    } as P17CssSupportMatrixV1;

    expect(validateP17CssSupportMatrix(reordered).valid).toBe(true);
    expect(serializeP17CssSupportMatrix(reordered)).toBe(canonical);
    expect(getP17CssSupportFeature('layout.flex')?.featureId).toBe('layout.flex');
    expect(getP17CssSupportFeature('does.not.exist')).toBeNull();
  });
});
