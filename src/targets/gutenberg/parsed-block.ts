export const GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION = 'gutenberg-normalized-parsed-block-v1' as const;
export const GUTENBERG_PARSED_BLOCK_MAX_NODES = 10_000;
export const GUTENBERG_PARSED_BLOCK_MAX_DEPTH = 64;
export const GUTENBERG_PARSED_BLOCK_MAX_NAME_LENGTH = 160;
export const GUTENBERG_PARSED_BLOCK_MAX_INNER_HTML_LENGTH = 1_000_000;
export const GUTENBERG_PARSED_BLOCK_MAX_ATTRIBUTE_DEPTH = 32;
export const GUTENBERG_PARSED_BLOCK_MAX_ATTRIBUTE_VALUES = 50_000;
export const GUTENBERG_PARSED_BLOCK_MAX_ATTRIBUTE_STRING_LENGTH = 64_000;
export const GUTENBERG_PARSED_BLOCK_MAX_ATTRIBUTE_KEY_LENGTH = 512;

export type GutenbergJsonValue =
  | null
  | boolean
  | number
  | string
  | GutenbergJsonValue[]
  | { [key: string]: GutenbergJsonValue };

export interface GutenbergNormalizedParsedBlockV1 {
  blockName: string | null;
  attrs: Record<string, GutenbergJsonValue>;
  innerBlocks: GutenbergNormalizedParsedBlockV1[];
  innerHTML: string;
}

export interface GutenbergNormalizedParsedBlockDocumentV1 {
  schemaVersion: 1;
  contractVersion: typeof GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION;
  blocks: GutenbergNormalizedParsedBlockV1[];
}

export type GutenbergParsedBlockValidationCode =
  | 'P16_DOCUMENT_NOT_OBJECT'
  | 'P16_DOCUMENT_SHAPE_INVALID'
  | 'P16_DOCUMENT_VERSION_INVALID'
  | 'P16_BLOCKS_INVALID'
  | 'P16_BLOCK_NOT_OBJECT'
  | 'P16_BLOCK_SHAPE_INVALID'
  | 'P16_BLOCK_NAME_INVALID'
  | 'P16_NESTED_FREEFORM_UNSUPPORTED'
  | 'P16_ATTRIBUTES_INVALID'
  | 'P16_ATTRIBUTE_KEY_INVALID'
  | 'P16_ATTRIBUTE_VALUE_INVALID'
  | 'P16_ATTRIBUTE_STRING_LIMIT_EXCEEDED'
  | 'P16_ATTRIBUTE_DEPTH_LIMIT_EXCEEDED'
  | 'P16_ATTRIBUTE_VALUE_LIMIT_EXCEEDED'
  | 'P16_INNER_BLOCKS_INVALID'
  | 'P16_INNER_HTML_INVALID'
  | 'P16_INNER_HTML_LIMIT_EXCEEDED'
  | 'P16_BLOCK_LIMIT_EXCEEDED'
  | 'P16_DEPTH_LIMIT_EXCEEDED';

export interface GutenbergParsedBlockValidationIssue {
  code: GutenbergParsedBlockValidationCode;
  path: string;
  message: string;
}

export interface GutenbergParsedBlockValidationResult {
  contractVersion: typeof GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION;
  valid: boolean;
  blockCount: number;
  namedBlockCount: number;
  freeformBlockCount: number;
  blockNames: string[];
  attributeValueCount: number;
  issues: GutenbergParsedBlockValidationIssue[];
}

interface ValidationState {
  issues: GutenbergParsedBlockValidationIssue[];
  blockNames: Set<string>;
  blockCount: number;
  namedBlockCount: number;
  freeformBlockCount: number;
  blockLimitReported: boolean;
  attributeValueCount: number;
  attributeLimitReported: boolean;
}

const DOCUMENT_KEYS = ['schemaVersion', 'contractVersion', 'blocks'] as const;
const BLOCK_KEYS = ['blockName', 'attrs', 'innerBlocks', 'innerHTML'] as const;
const BLOCK_NAME_PATTERN = /^[a-z0-9][a-z0-9-]*\/[a-z0-9][a-z0-9-]*$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (!isRecord(value)) return false;
  const prototype = Object.getPrototypeOf(value) as object | null;
  return prototype === Object.prototype || prototype === null;
}

function hasExactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const actualKeys = Object.keys(value).sort();
  const expectedKeys = [...expected].sort();
  return actualKeys.length === expectedKeys.length
    && actualKeys.every((key, index) => key === expectedKeys[index]);
}

function pushIssue(
  state: ValidationState,
  code: GutenbergParsedBlockValidationCode,
  path: string,
  message: string,
): void {
  state.issues.push({ code, path, message });
}

function validBlockName(value: string): boolean {
  return value.length <= GUTENBERG_PARSED_BLOCK_MAX_NAME_LENGTH
    && BLOCK_NAME_PATTERN.test(value);
}

function validateAttributeValue(
  value: unknown,
  path: string,
  depth: number,
  state: ValidationState,
  activeObjects: WeakSet<object>,
): void {
  if (state.attributeValueCount >= GUTENBERG_PARSED_BLOCK_MAX_ATTRIBUTE_VALUES) {
    if (!state.attributeLimitReported) {
      state.attributeLimitReported = true;
      pushIssue(
        state,
        'P16_ATTRIBUTE_VALUE_LIMIT_EXCEEDED',
        path,
        `Attribute data contains more than ${GUTENBERG_PARSED_BLOCK_MAX_ATTRIBUTE_VALUES} bounded JSON values.`,
      );
    }
    return;
  }

  state.attributeValueCount += 1;

  if (depth > GUTENBERG_PARSED_BLOCK_MAX_ATTRIBUTE_DEPTH) {
    pushIssue(
      state,
      'P16_ATTRIBUTE_DEPTH_LIMIT_EXCEEDED',
      path,
      `Attribute nesting exceeds the bounded depth of ${GUTENBERG_PARSED_BLOCK_MAX_ATTRIBUTE_DEPTH}.`,
    );
    return;
  }

  if (value === null || typeof value === 'boolean') return;

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      pushIssue(state, 'P16_ATTRIBUTE_VALUE_INVALID', path, 'Attribute numbers must be finite JSON numbers.');
    }
    return;
  }

  if (typeof value === 'string') {
    if (value.length > GUTENBERG_PARSED_BLOCK_MAX_ATTRIBUTE_STRING_LENGTH) {
      pushIssue(
        state,
        'P16_ATTRIBUTE_STRING_LIMIT_EXCEEDED',
        path,
        `Attribute strings must not exceed ${GUTENBERG_PARSED_BLOCK_MAX_ATTRIBUTE_STRING_LENGTH} characters.`,
      );
    }
    return;
  }

  if (typeof value !== 'object' || value === null) {
    pushIssue(
      state,
      'P16_ATTRIBUTE_VALUE_INVALID',
      path,
      'Attributes must contain JSON-compatible null, boolean, finite number, string, array, or plain-object values only.',
    );
    return;
  }

  if (activeObjects.has(value)) {
    pushIssue(state, 'P16_ATTRIBUTE_VALUE_INVALID', path, 'Cyclic attribute values are not accepted.');
    return;
  }

  activeObjects.add(value);
  try {
    if (Array.isArray(value)) {
      for (let index = 0; index < value.length; index += 1) {
        validateAttributeValue(value[index], `${path}[${index}]`, depth + 1, state, activeObjects);
        if (state.attributeLimitReported) break;
      }
      return;
    }

    if (!isPlainRecord(value)) {
      pushIssue(state, 'P16_ATTRIBUTE_VALUE_INVALID', path, 'Attribute objects must be plain JSON objects.');
      return;
    }

    const keys = Object.keys(value).sort();
    for (const key of keys) {
      if (key.length === 0 || key.length > GUTENBERG_PARSED_BLOCK_MAX_ATTRIBUTE_KEY_LENGTH) {
        pushIssue(
          state,
          'P16_ATTRIBUTE_KEY_INVALID',
          `${path}.${key}`,
          `Attribute keys must be non-empty and at most ${GUTENBERG_PARSED_BLOCK_MAX_ATTRIBUTE_KEY_LENGTH} characters.`,
        );
        continue;
      }
      validateAttributeValue(value[key], `${path}.${key}`, depth + 1, state, activeObjects);
      if (state.attributeLimitReported) break;
    }
  } finally {
    activeObjects.delete(value);
  }
}

function validateAttributes(value: unknown, path: string, state: ValidationState): void {
  if (!isPlainRecord(value)) {
    pushIssue(state, 'P16_ATTRIBUTES_INVALID', path, 'attrs must be a plain JSON object.');
    return;
  }
  validateAttributeValue(value, path, 1, state, new WeakSet<object>());
}

function validateBlock(
  value: unknown,
  path: string,
  depth: number,
  topLevel: boolean,
  state: ValidationState,
): void {
  if (depth > GUTENBERG_PARSED_BLOCK_MAX_DEPTH) {
    pushIssue(
      state,
      'P16_DEPTH_LIMIT_EXCEEDED',
      path,
      `Block nesting exceeds the bounded depth of ${GUTENBERG_PARSED_BLOCK_MAX_DEPTH}.`,
    );
    return;
  }

  if (state.blockCount >= GUTENBERG_PARSED_BLOCK_MAX_NODES) {
    if (!state.blockLimitReported) {
      state.blockLimitReported = true;
      pushIssue(
        state,
        'P16_BLOCK_LIMIT_EXCEEDED',
        path,
        `Document contains more than ${GUTENBERG_PARSED_BLOCK_MAX_NODES} normalized block nodes.`,
      );
    }
    return;
  }

  state.blockCount += 1;

  if (!isRecord(value)) {
    pushIssue(state, 'P16_BLOCK_NOT_OBJECT', path, 'Normalized parsed blocks must be objects.');
    return;
  }

  if (!hasExactKeys(value, BLOCK_KEYS)) {
    pushIssue(
      state,
      'P16_BLOCK_SHAPE_INVALID',
      path,
      'Normalized parsed blocks must contain exactly blockName, attrs, innerBlocks, and innerHTML.',
    );
  }

  const blockName = value.blockName;
  if (blockName === null) {
    state.freeformBlockCount += 1;
    if (!topLevel) {
      pushIssue(
        state,
        'P16_NESTED_FREEFORM_UNSUPPORTED',
        `${path}.blockName`,
        'This normalized contract accepts blockName=null only for top-level/freeform non-block content.',
      );
    }
  } else if (typeof blockName === 'string' && validBlockName(blockName)) {
    state.namedBlockCount += 1;
    state.blockNames.add(blockName);
  } else {
    pushIssue(
      state,
      'P16_BLOCK_NAME_INVALID',
      `${path}.blockName`,
      'Named blocks must use a bounded lowercase namespace/name identifier; top-level freeform content may use null.',
    );
  }

  validateAttributes(value.attrs, `${path}.attrs`, state);

  const innerHTML = value.innerHTML;
  if (typeof innerHTML !== 'string') {
    pushIssue(state, 'P16_INNER_HTML_INVALID', `${path}.innerHTML`, 'innerHTML must be a string.');
  } else if (innerHTML.length > GUTENBERG_PARSED_BLOCK_MAX_INNER_HTML_LENGTH) {
    pushIssue(
      state,
      'P16_INNER_HTML_LIMIT_EXCEEDED',
      `${path}.innerHTML`,
      `innerHTML must not exceed ${GUTENBERG_PARSED_BLOCK_MAX_INNER_HTML_LENGTH} characters per node.`,
    );
  }

  const innerBlocks = value.innerBlocks;
  if (!Array.isArray(innerBlocks)) {
    pushIssue(state, 'P16_INNER_BLOCKS_INVALID', `${path}.innerBlocks`, 'innerBlocks must be an array.');
    return;
  }

  for (let index = 0; index < innerBlocks.length; index += 1) {
    validateBlock(innerBlocks[index], `${path}.innerBlocks[${index}]`, depth + 1, false, state);
    if (state.blockLimitReported) break;
  }
}

/**
 * Validate an untrusted value against the repository-owned P16 normalized parsed-block contract.
 *
 * This intentionally models a bounded subset of WordPress parsed-block concepts for offline review.
 * It is not the raw `parse_blocks()` return type because WordPress also exposes `innerContent`, and it
 * does not prove WordPress serialization, editor validity, rendering behavior, or target compatibility.
 */
export function validateGutenbergNormalizedParsedBlockDocument(
  value: unknown,
): GutenbergParsedBlockValidationResult {
  const state: ValidationState = {
    issues: [],
    blockNames: new Set<string>(),
    blockCount: 0,
    namedBlockCount: 0,
    freeformBlockCount: 0,
    blockLimitReported: false,
    attributeValueCount: 0,
    attributeLimitReported: false,
  };

  if (!isRecord(value)) {
    pushIssue(state, 'P16_DOCUMENT_NOT_OBJECT', '$', 'Normalized Gutenberg parsed-block document must be an object.');
  } else {
    if (!hasExactKeys(value, DOCUMENT_KEYS)) {
      pushIssue(
        state,
        'P16_DOCUMENT_SHAPE_INVALID',
        '$',
        'Normalized document must contain exactly schemaVersion, contractVersion, and blocks.',
      );
    }

    if (value.schemaVersion !== 1 || value.contractVersion !== GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION) {
      pushIssue(
        state,
        'P16_DOCUMENT_VERSION_INVALID',
        '$.contractVersion',
        `This validator accepts ${GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION} with schemaVersion 1 only.`,
      );
    }

    if (!Array.isArray(value.blocks)) {
      pushIssue(state, 'P16_BLOCKS_INVALID', '$.blocks', 'blocks must be an array.');
    } else {
      for (let index = 0; index < value.blocks.length; index += 1) {
        validateBlock(value.blocks[index], `$.blocks[${index}]`, 1, true, state);
        if (state.blockLimitReported) break;
      }
    }
  }

  return {
    contractVersion: GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION,
    valid: state.issues.length === 0,
    blockCount: state.blockCount,
    namedBlockCount: state.namedBlockCount,
    freeformBlockCount: state.freeformBlockCount,
    blockNames: [...state.blockNames].sort(),
    attributeValueCount: state.attributeValueCount,
    issues: state.issues,
  };
}

/** Serialize only the repository-owned normalized JSON envelope, never raw Gutenberg post-content markup. */
export function serializeGutenbergNormalizedParsedBlockDocument(
  document: GutenbergNormalizedParsedBlockDocumentV1,
): string {
  const validation = validateGutenbergNormalizedParsedBlockDocument(document);
  if (!validation.valid) {
    const first = validation.issues[0];
    if (!first) {
      throw new Error('Invalid normalized Gutenberg parsed-block document: validation failed without a diagnostic.');
    }
    throw new Error(
      `Invalid normalized Gutenberg parsed-block document: ${first.code} at ${first.path}: ${first.message}`,
    );
  }
  return `${JSON.stringify(document, null, 2)}\n`;
}
