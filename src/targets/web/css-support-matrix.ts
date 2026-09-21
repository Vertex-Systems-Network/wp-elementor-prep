export const P17_CSS_SUPPORT_MATRIX_VERSION = 'p17-css-support-matrix-v1' as const;
export const P17_CSS_SUPPORT_MATRIX_MAX_ENTRIES = 128;

export const P17_CSS_SUPPORT_STATUSES = [
  'SUPPORTED',
  'SUPPORTED_WITH_REVIEW',
  'RENDER_ONLY',
  'FALLBACK',
  'UNSUPPORTED',
  'UNKNOWN',
] as const;

export type P17CssSupportStatus = typeof P17_CSS_SUPPORT_STATUSES[number];

export const P17_CSS_SUPPORT_BASIS = [
  'MERGED_IMPLEMENTATION',
  'SPEC_POLICY_ONLY',
] as const;

export type P17CssSupportBasis = typeof P17_CSS_SUPPORT_BASIS[number];

export const P17_CSS_SUPPORT_CATEGORIES = [
  'LAYOUT',
  'SIZING',
  'SPACING',
  'TYPOGRAPHY',
  'COLOR_BACKGROUND_BORDER',
  'SHADOW',
  'OVERFLOW',
  'TRANSFORM',
  'OPACITY',
  'MEDIA',
  'RESPONSIVE',
  'VARIABLES',
  'PSEUDO_CONTENT',
  'EFFECTS',
  'ANIMATION',
  'SELECTORS',
  'WRITING_MODE',
  'FONT',
] as const;

export type P17CssSupportCategory = typeof P17_CSS_SUPPORT_CATEGORIES[number];

export interface P17CssSupportAxis {
  status: P17CssSupportStatus;
  basis: P17CssSupportBasis;
}

export interface P17CssSupportEntryV1 {
  featureId: string;
  category: P17CssSupportCategory;
  designToWeb: P17CssSupportAxis;
  staticImport: P17CssSupportAxis;
  webToFigma: P17CssSupportAxis;
  noteCode: string;
}

export interface P17CssSupportMatrixV1 {
  schemaVersion: 1;
  matrixVersion: typeof P17_CSS_SUPPORT_MATRIX_VERSION;
  authority: {
    javascriptExecution: false;
    networkAccess: false;
    browserFidelityClaim: false;
    reconstructionAcceptance: false;
    productionAcceptance: false;
  };
  entries: readonly P17CssSupportEntryV1[];
}

export type P17CssSupportMatrixValidationCode =
  | 'P17_CSS_MATRIX_NOT_OBJECT'
  | 'P17_CSS_MATRIX_KEYS_UNSUPPORTED'
  | 'P17_CSS_MATRIX_SCHEMA_UNSUPPORTED'
  | 'P17_CSS_MATRIX_VERSION_UNSUPPORTED'
  | 'P17_CSS_MATRIX_AUTHORITY_INVALID'
  | 'P17_CSS_MATRIX_ENTRIES_INVALID'
  | 'P17_CSS_MATRIX_ENTRY_LIMIT_EXCEEDED'
  | 'P17_CSS_MATRIX_ENTRY_NOT_OBJECT'
  | 'P17_CSS_MATRIX_ENTRY_KEYS_UNSUPPORTED'
  | 'P17_CSS_MATRIX_FEATURE_ID_INVALID'
  | 'P17_CSS_MATRIX_DUPLICATE_FEATURE_ID'
  | 'P17_CSS_MATRIX_ORDER_INVALID'
  | 'P17_CSS_MATRIX_CATEGORY_INVALID'
  | 'P17_CSS_MATRIX_AXIS_INVALID'
  | 'P17_CSS_MATRIX_STATUS_INVALID'
  | 'P17_CSS_MATRIX_BASIS_INVALID'
  | 'P17_CSS_MATRIX_NOTE_CODE_INVALID';

export interface P17CssSupportMatrixValidationIssue {
  code: P17CssSupportMatrixValidationCode;
  path: string;
  message: string;
}

export interface P17CssSupportMatrixValidationResult {
  valid: boolean;
  entryCount: number;
  issues: P17CssSupportMatrixValidationIssue[];
}

function axis(status: P17CssSupportStatus, basis: P17CssSupportBasis): P17CssSupportAxis {
  return Object.freeze({ status, basis });
}

const implemented = (status: P17CssSupportStatus): P17CssSupportAxis =>
  axis(status, 'MERGED_IMPLEMENTATION');
const policy = (status: P17CssSupportStatus): P17CssSupportAxis =>
  axis(status, 'SPEC_POLICY_ONLY');
const unknown = (): P17CssSupportAxis => policy('UNKNOWN');

function entry(
  featureId: string,
  category: P17CssSupportCategory,
  designToWeb: P17CssSupportAxis,
  noteCode: string,
): P17CssSupportEntryV1 {
  return Object.freeze({
    featureId,
    category,
    designToWeb,
    staticImport: unknown(),
    webToFigma: unknown(),
    noteCode,
  });
}

const entries: readonly P17CssSupportEntryV1[] = Object.freeze([
  entry('advanced.selectors', 'SELECTORS', policy('UNSUPPORTED'), 'OWNED_STATIC_PARSER_NOT_IMPLEMENTED'),
  entry('animation.transitions', 'ANIMATION', policy('UNSUPPORTED'), 'NO_ACTIVE_RUNTIME_BEHAVIOR'),
  entry('background.color', 'COLOR_BACKGROUND_BORDER', implemented('SUPPORTED'), 'NEUTRAL_STYLE_BACKGROUND_COLOR'),
  entry('border.basic', 'COLOR_BACKGROUND_BORDER', policy('UNSUPPORTED'), 'NEUTRAL_IR_BORDER_NOT_MODELED'),
  entry('border.radius', 'COLOR_BACKGROUND_BORDER', implemented('SUPPORTED'), 'NEUTRAL_STYLE_CORNER_RADIUS'),
  entry('color.text', 'COLOR_BACKGROUND_BORDER', implemented('SUPPORTED'), 'NEUTRAL_STYLE_TEXT_COLOR'),
  entry('container.queries', 'RESPONSIVE', policy('UNSUPPORTED'), 'NO_CONTAINER_QUERY_GENERATION'),
  entry('css.variables', 'VARIABLES', policy('UNSUPPORTED'), 'TOKEN_VARIABLE_EMISSION_NOT_IMPLEMENTED'),
  entry('filter.blend-mask-clip', 'EFFECTS', policy('UNSUPPORTED'), 'ADVANCED_EFFECTS_NOT_MODELED'),
  entry('font.custom', 'FONT', policy('UNSUPPORTED'), 'RAW_FONT_PACKAGING_NOT_IMPLEMENTED'),
  entry('grid.layout', 'LAYOUT', implemented('SUPPORTED'), 'NEUTRAL_GRID_BOUNDED_COLUMNS'),
  entry('layout.block-flow', 'LAYOUT', implemented('SUPPORTED'), 'NEUTRAL_FLOW_LAYOUT'),
  entry('layout.flex', 'LAYOUT', implemented('SUPPORTED'), 'NEUTRAL_FLEX_LAYOUT'),
  entry('layout.inline', 'LAYOUT', implemented('SUPPORTED_WITH_REVIEW'), 'INLINE_TEXT_SPAN_ONLY'),
  entry('media.queries', 'RESPONSIVE', policy('UNSUPPORTED'), 'RESPONSIVE_MEDIA_QUERY_GENERATION_NOT_IMPLEMENTED'),
  entry('object.fit-position', 'MEDIA', policy('UNSUPPORTED'), 'IMAGE_FIT_POSITION_NOT_MODELED'),
  entry('opacity', 'OPACITY', policy('UNSUPPORTED'), 'OPACITY_NOT_MODELED'),
  entry('overflow', 'OVERFLOW', policy('UNSUPPORTED'), 'OVERFLOW_NOT_MODELED'),
  entry('positioning', 'LAYOUT', policy('UNSUPPORTED'), 'POSITIONED_LAYOUT_NOT_MODELED'),
  entry('pseudo.generated-content', 'PSEUDO_CONTENT', policy('UNSUPPORTED'), 'PSEUDO_CONTENT_NOT_MODELED'),
  entry('shadow.box-text', 'SHADOW', policy('UNSUPPORTED'), 'SHADOWS_NOT_MODELED'),
  entry('sizing.basic', 'SIZING', implemented('SUPPORTED_WITH_REVIEW'), 'IMAGE_DIMENSIONS_ONLY'),
  entry('spacing.gap', 'SPACING', implemented('SUPPORTED'), 'NEUTRAL_FLEX_GRID_GAP'),
  entry('spacing.margin', 'SPACING', policy('UNSUPPORTED'), 'MARGIN_NOT_MODELED'),
  entry('spacing.padding', 'SPACING', implemented('SUPPORTED'), 'NEUTRAL_STYLE_PADDING'),
  entry('transform.bounded', 'TRANSFORM', policy('UNSUPPORTED'), 'TRANSFORMS_NOT_MODELED'),
  entry('typography.basic', 'TYPOGRAPHY', implemented('SUPPORTED_WITH_REVIEW'), 'SEMANTIC_TEXT_COLOR_ALIGNMENT_ONLY'),
  entry('writing.logical-modes', 'WRITING_MODE', policy('UNSUPPORTED'), 'WRITING_MODES_NOT_MODELED'),
]);

export const P17_CSS_SUPPORT_MATRIX_V1: P17CssSupportMatrixV1 = Object.freeze({
  schemaVersion: 1,
  matrixVersion: P17_CSS_SUPPORT_MATRIX_VERSION,
  authority: Object.freeze({
    javascriptExecution: false,
    networkAccess: false,
    browserFidelityClaim: false,
    reconstructionAcceptance: false,
    productionAcceptance: false,
  }),
  entries,
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const canonicalExpected = [...expected].sort();
  return actual.length === canonicalExpected.length
    && actual.every((key, index) => key === canonicalExpected[index]);
}

function issue(
  issues: P17CssSupportMatrixValidationIssue[],
  code: P17CssSupportMatrixValidationCode,
  path: string,
  message: string,
): void {
  issues.push({ code, path, message });
}

function validateAxis(
  value: unknown,
  path: string,
  issues: P17CssSupportMatrixValidationIssue[],
): void {
  if (!isRecord(value) || !exactKeys(value, ['status', 'basis'])) {
    issue(issues, 'P17_CSS_MATRIX_AXIS_INVALID', path, 'Support axis must contain only status and basis.');
    return;
  }
  if (!P17_CSS_SUPPORT_STATUSES.includes(value.status as P17CssSupportStatus)) {
    issue(issues, 'P17_CSS_MATRIX_STATUS_INVALID', `${path}.status`, 'Support status is unsupported.');
  }
  if (!P17_CSS_SUPPORT_BASIS.includes(value.basis as P17CssSupportBasis)) {
    issue(issues, 'P17_CSS_MATRIX_BASIS_INVALID', `${path}.basis`, 'Support basis is unsupported.');
  }
}

export function validateP17CssSupportMatrix(value: unknown): P17CssSupportMatrixValidationResult {
  const issues: P17CssSupportMatrixValidationIssue[] = [];
  let entryCount = 0;

  if (!isRecord(value)) {
    issue(issues, 'P17_CSS_MATRIX_NOT_OBJECT', '$', 'CSS support matrix must be an object.');
    return { valid: false, entryCount, issues };
  }

  if (!exactKeys(value, ['schemaVersion', 'matrixVersion', 'authority', 'entries'])) {
    issue(issues, 'P17_CSS_MATRIX_KEYS_UNSUPPORTED', '$', 'CSS support matrix contains missing or unsupported top-level keys.');
  }
  if (value.schemaVersion !== 1) {
    issue(issues, 'P17_CSS_MATRIX_SCHEMA_UNSUPPORTED', '$.schemaVersion', 'schemaVersion must be 1.');
  }
  if (value.matrixVersion !== P17_CSS_SUPPORT_MATRIX_VERSION) {
    issue(
      issues,
      'P17_CSS_MATRIX_VERSION_UNSUPPORTED',
      '$.matrixVersion',
      `matrixVersion must be ${P17_CSS_SUPPORT_MATRIX_VERSION}.`,
    );
  }

  const authority = value.authority;
  if (!isRecord(authority)
    || !exactKeys(authority, [
      'javascriptExecution',
      'networkAccess',
      'browserFidelityClaim',
      'reconstructionAcceptance',
      'productionAcceptance',
    ])
    || authority.javascriptExecution !== false
    || authority.networkAccess !== false
    || authority.browserFidelityClaim !== false
    || authority.reconstructionAcceptance !== false
    || authority.productionAcceptance !== false) {
    issue(
      issues,
      'P17_CSS_MATRIX_AUTHORITY_INVALID',
      '$.authority',
      'CSS support metadata must carry only explicit false authority flags.',
    );
  }

  if (!Array.isArray(value.entries)) {
    issue(issues, 'P17_CSS_MATRIX_ENTRIES_INVALID', '$.entries', 'entries must be an array.');
    return { valid: false, entryCount, issues };
  }

  entryCount = value.entries.length;
  if (entryCount > P17_CSS_SUPPORT_MATRIX_MAX_ENTRIES) {
    issue(
      issues,
      'P17_CSS_MATRIX_ENTRY_LIMIT_EXCEEDED',
      '$.entries',
      `entries exceeds the ${P17_CSS_SUPPORT_MATRIX_MAX_ENTRIES}-entry bound.`,
    );
  }

  const ids = new Set<string>();
  let previousId: string | null = null;

  for (let index = 0; index < Math.min(entryCount, P17_CSS_SUPPORT_MATRIX_MAX_ENTRIES); index += 1) {
    const current = value.entries[index];
    const path = `$.entries[${index}]`;
    if (!isRecord(current)) {
      issue(issues, 'P17_CSS_MATRIX_ENTRY_NOT_OBJECT', path, 'Matrix entry must be an object.');
      continue;
    }
    if (!exactKeys(current, [
      'featureId',
      'category',
      'designToWeb',
      'staticImport',
      'webToFigma',
      'noteCode',
    ])) {
      issue(issues, 'P17_CSS_MATRIX_ENTRY_KEYS_UNSUPPORTED', path, 'Matrix entry contains missing or unsupported keys.');
    }

    const featureId = current.featureId;
    if (typeof featureId !== 'string'
      || featureId.length === 0
      || featureId.length > 128
      || !/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/.test(featureId)) {
      issue(issues, 'P17_CSS_MATRIX_FEATURE_ID_INVALID', `${path}.featureId`, 'featureId must be a bounded canonical lowercase identifier.');
    } else {
      if (ids.has(featureId)) {
        issue(issues, 'P17_CSS_MATRIX_DUPLICATE_FEATURE_ID', `${path}.featureId`, `Duplicate featureId: ${featureId}.`);
      }
      ids.add(featureId);
      if (previousId !== null && previousId.localeCompare(featureId) >= 0) {
        issue(issues, 'P17_CSS_MATRIX_ORDER_INVALID', `${path}.featureId`, 'Entries must be strictly sorted by featureId.');
      }
      previousId = featureId;
    }

    if (!P17_CSS_SUPPORT_CATEGORIES.includes(current.category as P17CssSupportCategory)) {
      issue(issues, 'P17_CSS_MATRIX_CATEGORY_INVALID', `${path}.category`, 'CSS support category is unsupported.');
    }

    validateAxis(current.designToWeb, `${path}.designToWeb`, issues);
    validateAxis(current.staticImport, `${path}.staticImport`, issues);
    validateAxis(current.webToFigma, `${path}.webToFigma`, issues);

    if (typeof current.noteCode !== 'string'
      || current.noteCode.length === 0
      || current.noteCode.length > 128
      || !/^[A-Z0-9_]+$/.test(current.noteCode)) {
      issue(issues, 'P17_CSS_MATRIX_NOTE_CODE_INVALID', `${path}.noteCode`, 'noteCode must be a bounded uppercase identifier.');
    }
  }

  return {
    valid: issues.length === 0,
    entryCount,
    issues,
  };
}

function canonicalAxis(value: P17CssSupportAxis): Record<string, string> {
  return {
    status: value.status,
    basis: value.basis,
  };
}

function canonicalEntry(value: P17CssSupportEntryV1): Record<string, unknown> {
  return {
    featureId: value.featureId,
    category: value.category,
    designToWeb: canonicalAxis(value.designToWeb),
    staticImport: canonicalAxis(value.staticImport),
    webToFigma: canonicalAxis(value.webToFigma),
    noteCode: value.noteCode,
  };
}

export function serializeP17CssSupportMatrix(matrix: P17CssSupportMatrixV1): string {
  const validation = validateP17CssSupportMatrix(matrix);
  if (!validation.valid) {
    const first = validation.issues[0];
    if (!first) throw new Error('Invalid P17 CSS support matrix without diagnostic.');
    throw new Error(`Invalid P17 CSS support matrix: ${first.code} at ${first.path}: ${first.message}`);
  }

  return `${JSON.stringify({
    schemaVersion: matrix.schemaVersion,
    matrixVersion: matrix.matrixVersion,
    authority: {
      javascriptExecution: matrix.authority.javascriptExecution,
      networkAccess: matrix.authority.networkAccess,
      browserFidelityClaim: matrix.authority.browserFidelityClaim,
      reconstructionAcceptance: matrix.authority.reconstructionAcceptance,
      productionAcceptance: matrix.authority.productionAcceptance,
    },
    entries: matrix.entries.map(canonicalEntry),
  }, null, 2)}\n`;
}

export function getP17CssSupportFeature(featureId: string): P17CssSupportEntryV1 | null {
  return P17_CSS_SUPPORT_MATRIX_V1.entries.find((item) => item.featureId === featureId) ?? null;
}
