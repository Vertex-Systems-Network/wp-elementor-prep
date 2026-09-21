import { computeBuildReadyStructuralHash } from './build-ready';
import { DEFAULT_P14_INPUT_BOUNDS } from './p14-input-bounds';
import type { AuditNode } from './types';

export const P14_CANDIDATE_TARGET_ADDRESS_SCHEMA_VERSION = 1 as const;
export const P14_CANDIDATE_TARGET_ADDRESS_MAX_DEPTH = 128 as const;
export const P14_CANDIDATE_TARGET_ADDRESS_MAX_VISITED_NODES = 10000 as const;

export interface P14CandidateTargetAddressV1 {
  schemaVersion: typeof P14_CANDIDATE_TARGET_ADDRESS_SCHEMA_VERSION;
  sourceRootNodeId: string;
  sourceRootFingerprint: string;
  sourceRootCloneStableFingerprint: string;
  sourceTargetNodeId: string;
  sourceTargetCloneStableFingerprint: string;
  childIndexPath: number[];
}

export interface P14CandidateTargetAddressDerivation {
  valid: boolean;
  failures: string[];
  addresses: P14CandidateTargetAddressV1[];
}

export interface P14CandidateTargetResolution {
  valid: boolean;
  failures: string[];
  resolved: Array<{
    address: P14CandidateTargetAddressV1;
    candidateNode: AuditNode;
  }>;
}

function fnv1a(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function round(value: number, digits = 4): number {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}

/**
 * Clone-stable structural witness. Node IDs are deliberately excluded because Figma clone
 * descendants receive new identities; all mutation-relevant audited structure remains included.
 */
function cloneStableNode(node: AuditNode): unknown {
  return {
    name: node.name,
    type: node.type,
    geometry: [
      round(node.geometry.x),
      round(node.geometry.y),
      round(node.geometry.width),
      round(node.geometry.height),
    ],
    layoutMode: node.layoutMode,
    auto: node.isAutoLayout,
    container: node.isContainer,
    text: node.isText,
    image: node.isImageLike,
    generic: node.isGenericName,
    textLength: node.textLength,
    textAutoResize: node.textAutoResize,
    absolute: node.absolutePositioned,
    clips: node.clipsContent,
    opacity: round(node.opacity),
    visible: node.visible,
    children: node.children.map(cloneStableNode),
  };
}

export function computeP14CloneStableNodeFingerprint(node: AuditNode): string {
  return `p14-clone-${fnv1a(JSON.stringify(cloneStableNode(node)))}`;
}

function boundedIdentity(value: unknown): value is string {
  return typeof value === 'string'
    && value.length > 0
    && value.length <= DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength;
}

function validPath(path: unknown): path is number[] {
  return Array.isArray(path)
    && path.length <= P14_CANDIDATE_TARGET_ADDRESS_MAX_DEPTH
    && path.every((index) => Number.isSafeInteger(index) && index >= 0);
}

function pathKey(path: number[]): string {
  return path.join('/');
}

export function compareP14CandidateTargetAddresses(
  left: P14CandidateTargetAddressV1,
  right: P14CandidateTargetAddressV1,
): number {
  return left.sourceTargetNodeId.localeCompare(right.sourceTargetNodeId)
    || pathKey(left.childIndexPath).localeCompare(pathKey(right.childIndexPath));
}

export function canonicalizeP14CandidateTargetAddresses(
  addresses: readonly P14CandidateTargetAddressV1[],
): P14CandidateTargetAddressV1[] {
  return addresses.map((address) => ({
    schemaVersion: address.schemaVersion,
    sourceRootNodeId: address.sourceRootNodeId,
    sourceRootFingerprint: address.sourceRootFingerprint,
    sourceRootCloneStableFingerprint: address.sourceRootCloneStableFingerprint,
    sourceTargetNodeId: address.sourceTargetNodeId,
    sourceTargetCloneStableFingerprint: address.sourceTargetCloneStableFingerprint,
    childIndexPath: [...address.childIndexPath],
  })).sort(compareP14CandidateTargetAddresses);
}

export function validateP14CandidateTargetAddress(
  value: unknown,
): { valid: boolean; failures: string[] } {
  const failures: string[] = [];
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return { valid: false, failures: ['P14 candidate target address must be an object.'] };
  }
  const address = value as Record<string, unknown>;
  if (address.schemaVersion !== P14_CANDIDATE_TARGET_ADDRESS_SCHEMA_VERSION) {
    failures.push('Unsupported P14 candidate target address schema version.');
  }
  for (const key of [
    'sourceRootNodeId',
    'sourceRootFingerprint',
    'sourceRootCloneStableFingerprint',
    'sourceTargetNodeId',
    'sourceTargetCloneStableFingerprint',
  ] as const) {
    if (!boundedIdentity(address[key])) failures.push(`P14 candidate target address ${key} is missing or oversized.`);
  }
  if (!validPath(address.childIndexPath)) {
    failures.push('P14 candidate target address childIndexPath is invalid or exceeds the bounded depth.');
  }
  return { valid: failures.length === 0, failures };
}

export function deriveP14CandidateTargetAddresses(input: {
  sourceRoot: AuditNode;
  expectedSourceRootNodeId: string;
  expectedSourceRootFingerprint: string;
  sourceTargetNodeIds: string[];
}): P14CandidateTargetAddressDerivation {
  const failures: string[] = [];
  if (!boundedIdentity(input.expectedSourceRootNodeId)
    || !boundedIdentity(input.expectedSourceRootFingerprint)) {
    return {
      valid: false,
      failures: ['P14 candidate target addressing requires bounded source root identity/fingerprint.'],
      addresses: [],
    };
  }
  if (input.sourceRoot.id !== input.expectedSourceRootNodeId) {
    failures.push('P14 candidate target source root ID does not match the reviewed P13 source root.');
  }
  const actualFingerprint = computeBuildReadyStructuralHash(input.sourceRoot);
  if (actualFingerprint !== input.expectedSourceRootFingerprint) {
    failures.push('P14 candidate target source tree does not match the reviewed P13 structural fingerprint.');
  }
  if (input.sourceTargetNodeIds.length === 0
    || input.sourceTargetNodeIds.length > DEFAULT_P14_INPUT_BOUNDS.maxTargetsPerAction) {
    failures.push('P14 candidate target addressing requires a bounded non-empty target set.');
  }
  if (input.sourceTargetNodeIds.some((nodeId) => !boundedIdentity(nodeId))) {
    failures.push('P14 candidate target addressing contains an invalid or oversized source target ID.');
  }
  if (new Set(input.sourceTargetNodeIds).size !== input.sourceTargetNodeIds.length) {
    failures.push('P14 candidate target addressing contains duplicate source target IDs.');
  }
  if (failures.length > 0) return { valid: false, failures, addresses: [] };

  const requested = new Set(input.sourceTargetNodeIds);
  const matches = new Map<string, Array<{ node: AuditNode; path: number[] }>>();
  const stack: Array<{ node: AuditNode; path: number[] }> = [{ node: input.sourceRoot, path: [] }];
  let visited = 0;

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;
    visited += 1;
    if (visited > P14_CANDIDATE_TARGET_ADDRESS_MAX_VISITED_NODES) {
      failures.push('P14 candidate target source traversal exceeds the bounded node limit.');
      break;
    }
    if (current.path.length > P14_CANDIDATE_TARGET_ADDRESS_MAX_DEPTH) {
      failures.push('P14 candidate target source traversal exceeds the bounded path depth.');
      break;
    }
    if (requested.has(current.node.id)) {
      const group = matches.get(current.node.id) ?? [];
      group.push(current);
      matches.set(current.node.id, group);
    }
    for (let index = current.node.children.length - 1; index >= 0; index -= 1) {
      const child = current.node.children[index];
      if (!child) continue;
      stack.push({ node: child, path: [...current.path, index] });
    }
  }

  const addresses: P14CandidateTargetAddressV1[] = [];
  const sourceRootCloneStableFingerprint = computeP14CloneStableNodeFingerprint(input.sourceRoot);
  for (const sourceTargetNodeId of [...requested].sort((a, b) => a.localeCompare(b))) {
    const group = matches.get(sourceTargetNodeId) ?? [];
    if (group.length === 0) {
      failures.push(`P14 candidate target source node ${sourceTargetNodeId} was not found in the reviewed source tree.`);
      continue;
    }
    if (group.length !== 1) {
      failures.push(`P14 candidate target source node ${sourceTargetNodeId} is ambiguous in the reviewed source tree.`);
      continue;
    }
    const match = group[0];
    if (!match) continue;
    addresses.push({
      schemaVersion: P14_CANDIDATE_TARGET_ADDRESS_SCHEMA_VERSION,
      sourceRootNodeId: input.expectedSourceRootNodeId,
      sourceRootFingerprint: input.expectedSourceRootFingerprint,
      sourceRootCloneStableFingerprint,
      sourceTargetNodeId,
      sourceTargetCloneStableFingerprint: computeP14CloneStableNodeFingerprint(match.node),
      childIndexPath: [...match.path],
    });
  }

  const duplicatePaths = new Set<string>();
  for (const address of addresses) {
    const key = pathKey(address.childIndexPath);
    if (duplicatePaths.has(key)) {
      failures.push('P14 candidate target addressing resolves multiple source targets to the same child-index path.');
      break;
    }
    duplicatePaths.add(key);
  }

  return {
    valid: failures.length === 0 && addresses.length === requested.size,
    failures,
    addresses: canonicalizeP14CandidateTargetAddresses(addresses),
  };
}

export function resolveP14CandidateTargetAddresses(input: {
  candidateRoot: AuditNode;
  expectedSourceRootNodeId: string;
  expectedSourceRootFingerprint: string;
  addresses: readonly P14CandidateTargetAddressV1[];
}): P14CandidateTargetResolution {
  const failures: string[] = [];
  const resolved: P14CandidateTargetResolution['resolved'] = [];
  if (input.candidateRoot.id === input.expectedSourceRootNodeId) {
    failures.push('P14 candidate target resolution refused the approved source root identity as a candidate root.');
  }
  if (input.addresses.length === 0
    || input.addresses.length > DEFAULT_P14_INPUT_BOUNDS.maxTargetsPerAction) {
    failures.push('P14 candidate target resolution requires a bounded non-empty address set.');
  }

  const allAddressShapesValid = input.addresses.every(
    (address) => validateP14CandidateTargetAddress(address).valid,
  );
  if (allAddressShapesValid) {
    const canonical = canonicalizeP14CandidateTargetAddresses(input.addresses);
    if (JSON.stringify(canonical) !== JSON.stringify(input.addresses)) {
      failures.push('P14 candidate target addresses are not canonically ordered.');
    }
  }

  const sourceTargetIds = new Set<string>();
  const pathKeys = new Set<string>();
  for (const address of input.addresses) {
    const validation = validateP14CandidateTargetAddress(address);
    failures.push(...validation.failures);
    if (!validation.valid) continue;
    if (address.sourceRootNodeId !== input.expectedSourceRootNodeId
      || address.sourceRootFingerprint !== input.expectedSourceRootFingerprint) {
      failures.push('P14 candidate target address is bound to a different reviewed source root.');
      continue;
    }
    if (sourceTargetIds.has(address.sourceTargetNodeId)) {
      failures.push(`P14 candidate target address duplicates source target ${address.sourceTargetNodeId}.`);
      continue;
    }
    sourceTargetIds.add(address.sourceTargetNodeId);
    const key = pathKey(address.childIndexPath);
    if (pathKeys.has(key)) {
      failures.push('P14 candidate target addresses contain a duplicate child-index path.');
      continue;
    }
    pathKeys.add(key);

    if (computeP14CloneStableNodeFingerprint(input.candidateRoot)
      !== address.sourceRootCloneStableFingerprint) {
      failures.push('P14 candidate root structure drifted from the reviewed source clone contract.');
      continue;
    }

    let current: AuditNode | undefined = input.candidateRoot;
    for (const childIndex of address.childIndexPath) {
      current = current.children[childIndex];
      if (!current) break;
    }
    if (!current) {
      failures.push(`P14 candidate target path for ${address.sourceTargetNodeId} no longer resolves.`);
      continue;
    }
    if (current.id === address.sourceTargetNodeId || current.id === input.expectedSourceRootNodeId) {
      failures.push('P14 candidate target resolution refused a source-tree identity as mutation authority.');
      continue;
    }
    if (computeP14CloneStableNodeFingerprint(current)
      !== address.sourceTargetCloneStableFingerprint) {
      failures.push(`P14 candidate target path for ${address.sourceTargetNodeId} resolves to structurally stale evidence.`);
      continue;
    }
    resolved.push({ address, candidateNode: current });
  }

  const candidateIds = resolved.map((item) => item.candidateNode.id);
  if (new Set(candidateIds).size !== candidateIds.length) {
    failures.push('P14 candidate target resolution produced duplicate candidate node identities.');
  }

  return {
    valid: failures.length === 0 && resolved.length === input.addresses.length,
    failures,
    resolved,
  };
}
