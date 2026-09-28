#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { access } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const failures = [];
const load = async (relative) => {
  try { return JSON.parse(await readFile(resolve(root, relative), 'utf8')); }
  catch (error) { failures.push(relative + ': ' + error.message); return null; }
};
const policyContractFiles = [
  'config/ai/agent-catalog.json',
  'config/security/trust-policy.json',
  'config/security/control-plane-policy.json',
  'config/quality/quality-policy.json',
  'config/design/design-assurance.json',
  'config/data/data-governance.json',
  'config/release/release-policy.json',
  'config/architecture/decision-records.json',
  'config/risk/risk-register.json',
  'config/operations/runbooks-and-drills.json',
  'config/integrations/project-management.json',
  'config/integrations/sync-authority.json',
  'config/traceability/requirements-traceability.json',
  'config/consent/consent-requests.json',
  'config/testing/reference-e2e-matrix.json',
  'config/protocol/blueprint-completion.json'
];
const requiredFiles = [
  'AGENTS.md',
  '.ai/state/PROTOCOL.md',
  '.ai/state/CURRENT-STATE.yaml',
  '.ai/state/LAST-CHECKPOINT.md',
  '.ai/state/DETERMINISTIC-CLAIMS.yaml',
  '.ai/state/COORDINATION-QUEUE.yaml',
  '.ai/state/RUNNER-BENCHMARK.yaml',
  'memory-bank/PROJECT_STATE.md',
  'memory-bank/NEXT_ACTIONS.md',
  'memory-bank/DECISIONS.md',
  'memory-bank/ROADMAP.md',
  'config/protocol/instance.json',
  'config/protocol/anpos-adoption.json',
  '.ai/manifest.json'
];
for (const path of requiredFiles) {
  try { await access(resolve(root, path)); } catch { failures.push('missing required adoption file: ' + path); }
}
for (const path of policyContractFiles) {
  const policy = await load(path);
  if (policy && typeof policy.status !== 'string') failures.push(path + ': status is required');
}
const manifest = await load('.ai/manifest.json');
const instance = await load('config/protocol/instance.json');
const adoption = await load('config/protocol/anpos-adoption.json');
const completion = await load('config/protocol/blueprint-completion.json');
if (manifest) {
  if (manifest.protocol !== 'ANPOS') failures.push('manifest.protocol must be ANPOS');
  if (manifest.adoption_mode !== 'child_adoption_foundation') failures.push('manifest.adoption_mode is invalid');
  if (!Array.isArray(manifest.common) || !manifest.common.includes('config/protocol/anpos-adoption.json')) failures.push('manifest.common must route adoption matrix');
  const rolePaths = Object.values(manifest.roles ?? {}).flat();
  for (const path of [...manifest.common, ...rolePaths]) {
    try { await access(resolve(root, path)); } catch { failures.push('manifest routes missing file: ' + path); }
  }
}
if (instance) {
  if (instance.instance_status !== 'active_project') failures.push('instance_status must be active_project');
  if (instance.repository !== 'Vertex-Systems-Network/wp-elementor-prep') failures.push('instance repository mismatch');
  if (instance.source_protocol_version !== '1.4.0') failures.push('source protocol version mismatch');
  if (instance.bootstrap_completed !== false) failures.push('bootstrap_completed must remain false until canonical bootstrap is actually executed');
}
if (adoption) {
  if (adoption.status !== 'FOUNDATION_APPLIED_FULL_CERTIFICATION_PENDING') failures.push('adoption status must remain explicit');
  if (adoption.authority !== false) failures.push('adoption authority must remain false');
  const groups = adoption.requirement_groups ?? [];
  const ids = groups.flatMap((group) => group.requirement_ids ?? []);
  const unique = new Set(ids);
  if (ids.length !== 96 || unique.size !== 96 || Math.min(...ids) !== 1 || Math.max(...ids) !== 96) failures.push('requirement groups must cover each ID 1-96 exactly once');
  const allowed = new Set(adoption.status_vocabulary ?? []);
  for (const group of groups) if (!allowed.has(group.status)) failures.push('unknown status in ' + group.id);
  if (groups.some((group) => !Array.isArray(group.evidence) || !group.evidence.length || !group.next)) failures.push('every requirement group needs evidence and next action');
}
if (completion) {
  if (completion.status !== 'child_adoption_contract_map' || completion.authority !== false) failures.push('blueprint completion map must remain non-authoritative');
  const requirements = completion.requirements ?? [];
  const ids = requirements.map((entry) => entry.requirement_id);
  const expected = Array.from({ length: 96 }, (_, index) => 'REQ-' + String(index + 1).padStart(2, '0'));
  if (ids.length !== 96 || ids.some((id, index) => id !== expected[index])) failures.push('blueprint completion map must cover REQ-01..REQ-96 in order');
  if (requirements.some((entry) => !entry.domain || !Array.isArray(entry.machine_controls) || !Array.isArray(entry.verification_refs))) failures.push('blueprint completion entries require domain, controls and verification refs');
}
if (failures.length) {
  console.error(JSON.stringify({ status: 'INVALID', failures }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({
  status: 'VALID',
  protocol: 'ANPOS',
  repository: 'Vertex-Systems-Network/wp-elementor-prep',
  adoptionStatus: 'FOUNDATION_APPLIED_FULL_CERTIFICATION_PENDING',
  requirementCoverage: '1-96',
  authority: false,
  preservedAuthority: ['network-free Figma core', 'evidence-bound target gates', 'P19 frozen']
}, null, 2));
