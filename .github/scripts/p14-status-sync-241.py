from pathlib import Path
import re
import subprocess

BASE = '9e86dd4e10dd282758bcdbb177841a0117b179ae'


def read(path: str) -> str:
    return Path(path).read_text(encoding='utf-8')


def write(path: str, text: str) -> None:
    Path(path).write_text(text, encoding='utf-8')


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected exactly 1 match, found {count}')
    return text.replace(old, new, 1)


def replace_line_prefix(text: str, prefix: str, replacement: str, label: str) -> str:
    lines = text.splitlines()
    matches = [i for i, line in enumerate(lines) if line.startswith(prefix)]
    if len(matches) != 1:
        raise SystemExit(f'{label}: expected exactly 1 line prefix match, found {len(matches)}')
    i = matches[0]
    lines[i:i + 1] = replacement.splitlines()
    return '\n'.join(lines) + ('\n' if text.endswith('\n') else '')


# README.md
path = 'README.md'
text = read(path)
text = replace_once(
    text,
    '- `#237` — post-#236 P14 repository-status synchronization before the next focused pure-core safety audit.',
    '- `#241` — post-#240 P14 repository-status synchronization before the next focused pure-core safety audit.',
    'README open issue',
)
text = replace_once(
    text,
    'Integration Readiness is path-filtered for the code-only diff and will run on the #237 status synchronization branch. Issue #235 closed completed. Issue #126 is also closed completed.',
    'Integration Readiness was path-filtered for that code-only diff; post-merge status synchronization #237 / PR #238 passed CI #974, Integration Readiness #319, P12 Final Release Artifact #284 and P12 Offline Acceptance #328 at exact head `48804348e6244b043c7c76ceca5181d15704592f`, then guarded squash-merged as `2966bae643cd7d9ac972bc60da1688b8fed575e2`. Issues #235 and #237 closed completed. PR #240 then completed #239 receipt-integrity semantic snapshot hardening and guarded squash-merged as `9e86dd4e10dd282758bcdbb177841a0117b179ae` after exact head `9a01555ab95b595151c47d401a0ba3e771c240d9` passed CI #976, P12 Final Release Artifact #287 and P12 Offline Acceptance #331; Integration Readiness is path-filtered for the code-only diff and will run on the #241 status synchronization branch. Issue #239 closed completed. Issue #126 is also closed completed.',
    'README merge history',
)
text = replace_once(
    text,
    'None of these slices changes P14 authority. Post-#236 repository status synchronization is tracked by #237 before the next focused P14 pure-core safety audit.',
    'The #237 / PR #238 synchronization records the coordinator-evidence cycle on the canonical status surfaces; the merged #239 / PR #240 slice snapshots receipt-integrity top-level and receipt-owned nested semantic evidence before reuse, detaches bounded receipt collections through guarded copy, and makes PREPARED/PREPARED_WITH_REVIEW consume accepted validation/re-score evidence rather than re-reading original stateful objects. Revoked or unreadable receipt evidence now fails closed at the integrity boundary. None of these slices changes P14 authority. Post-#240 repository status synchronization is tracked by #241 before the next focused P14 pure-core safety audit.',
    'README P14 narrative',
)
text = replace_once(
    text,
    'Complete #237 post-#236 status synchronization, then run the next focused P14 pure-core safety-gap audit; production registry remains empty; #159 required before real Figma mutation exposure',
    'Complete #241 post-#240 status synchronization, then run the next focused P14 pure-core safety-gap audit; production registry remains empty; #159 required before real Figma mutation exposure',
    'README P14 table',
)
text = replace_once(
    text,
    '1. complete #237 post-#236 repository-status synchronization, then run the next focused P14 pure-core safety-gap audit while real Figma mutation remains unwired and the production recipe registry remains empty;',
    '1. complete #241 post-#240 repository-status synchronization, then run the next focused P14 pure-core safety-gap audit while real Figma mutation remains unwired and the production recipe registry remains empty;',
    'README execution order',
)
write(path, text)

# docs/P14_FOUNDATION_IMPLEMENTATION.md
path = 'docs/P14_FOUNDATION_IMPLEMENTATION.md'
text = read(path)
text = replace_once(
    text,
    'Foundation issues: #163, #165, #169, #171, #173, #175, #177, #179, #181, #184, #186, #188, #190, #192, #195, #198, #201, #207, #210, #213, #216, #223, #226, #229, #231, #235  ',
    'Foundation issues: #163, #165, #169, #171, #173, #175, #177, #179, #181, #184, #186, #188, #190, #192, #195, #198, #201, #207, #210, #213, #216, #223, #226, #229, #231, #235, #239  ',
    'P14 foundation issue list',
)
text = replace_once(
    text,
    'bounded injected-coordinator runtime evidence/lease cleanup, and one-shot coordinator acquisition/refusal semantic snapshots.',
    'bounded injected-coordinator runtime evidence/lease cleanup, one-shot coordinator acquisition/refusal semantic snapshots, and fail-closed receipt-integrity semantic snapshots with detached bounded receipt collections.',
    'P14 foundation summary',
)
anchor = '## Bounded input preflight\n'
receipt_section = '''## Receipt-integrity semantic snapshot\n\nP14 preparation receipts are evidence, not authority, and their validator must not assume that a typed receipt is a stable plain object. The #239/#240 hardening slice captures the known receipt-integrity top-level fields through guarded one-shot reads before semantic validation. Readable stateful getters therefore cannot present one status, terminal state, source reference or optional evidence object during an early check and a different value later in the same validation.\n\nReceipt-owned `appliedActions`, `errors` and `events` collections are inspected through fail-closed array checks, a one-shot bounded length read and guarded index reads into a plain array. Oversized collections still fail from length before item traversal, while revoked/unreadable arrays fail closed rather than throwing through the integrity API. Source, candidate, error and event fields that integrity logic itself reuses are also captured into plain known-schema records before later correlation/status checks.\n\nValidation and re-score evidence retain their dedicated validators. Once those validators accept and detach their known schemas, PREPARED/PREPARED_WITH_REVIEW invariants consume those accepted values directly instead of re-reading the original validation/re-score objects. This preserves ordinary valid receipt semantics while closing readable-stateful and revoked-proxy ambiguity. It adds no recipe, mutation, target-compatibility, host-identity or production-acceptance authority.\n\n'''
text = replace_once(text, anchor, receipt_section + anchor, 'P14 receipt semantic snapshot section')
write(path, text)

# memory-bank/PROJECT_STATE.md
path = 'memory-bank/PROJECT_STATE.md'
text = read(path)
text = replace_line_prefix(
    text,
    '- #237 — post-#236 P14 repository-status synchronization:',
    '- #241 — post-#240 P14 repository-status synchronization: **ACTIVE** on branch `docs/p14-post-240-status-241`. Canonical README, P14 foundation and memory-bank state are being aligned to the verified #238/#240 merges before the next focused pure-core safety audit.\n- #239 — P14 receipt-integrity semantic snapshot hardening: **COMPLETED** through PR #240; issue closed automatically by guarded squash merge `9e86dd4e10dd282758bcdbb177841a0117b179ae`.\n- #237 — post-#236 P14 repository-status synchronization: **COMPLETED** through PR #238; guarded squash-merged as `2966bae643cd7d9ac972bc60da1688b8fed575e2` after exact synchronized head `48804348e6244b043c7c76ceca5181d15704592f` passed all required gates.',
    'PROJECT_STATE issue queue',
)
text = replace_line_prefix(
    text,
    '- Current repository main is `',
    '- Current repository main is `9e86dd4e10dd282758bcdbb177841a0117b179ae`, the guarded squash merge of PR #240.',
    'PROJECT_STATE main',
)
text = replace_line_prefix(
    text,
    '- Branch `docs/p14-post-236-status-237`',
    '- Branch `docs/p14-post-240-status-241` is the active canonical status synchronization tracked by #241; it must trigger and pass CI, Integration Readiness, P12 Final Release Artifact and P12 Offline Acceptance before guarded merge.\n- PR #238 (`docs/p14-post-236-status-237`) completed the post-#236 canonical status synchronization and guarded squash-merged as `2966bae643cd7d9ac972bc60da1688b8fed575e2`. Exact head `48804348e6244b043c7c76ceca5181d15704592f` passed CI #974, Integration Readiness #319, P12 Final Release Artifact #284 and P12 Offline Acceptance #328.',
    'PROJECT_STATE active sync',
)
marker = '- PR #236 exact head `497b1385b55ca8343d82be04da02de0595228efd` passed CI #972'
if marker not in text:
    raise SystemExit('PROJECT_STATE PR236 insertion marker missing')
insert = (
    '- PR #240 exact head `9a01555ab95b595151c47d401a0ba3e771c240d9` passed CI #976, P12 Final Release Artifact #287 and P12 Offline Acceptance #331; it had zero review threads, was current with main and mergeable before guarded squash merge `9e86dd4e10dd282758bcdbb177841a0117b179ae`. Integration Readiness did not run on this code-only PR because its pull-request trigger is path-filtered.\n'
    '- PR #240 snapshots known receipt-integrity top-level fields once, copies bounded receipt-owned collections through guarded array/length/index reads, detaches source/candidate/error/event fields before reuse, and makes PREPARED/PREPARED_WITH_REVIEW consume accepted validation/re-score evidence instead of re-reading original stateful objects. Revoked/unreadable receipt evidence fails closed. No production recipe, real Figma mutation, target-compatibility or production-acceptance authority was added.\n'
)
text = text.replace(marker, insert + marker, 1)
write(path, text)

# memory-bank/NEXT_ACTIONS.md
path = 'memory-bank/NEXT_ACTIONS.md'
text = read(path)
pattern = re.compile(r'### #237 — post-#236 P14 repository status synchronization\n.*?(?=### #235 — P14 coordinator acquisition/refusal semantic snapshot)', re.S)
matches = list(pattern.finditer(text))
if len(matches) != 1:
    raise SystemExit(f'NEXT_ACTIONS #237 section: expected 1 match, found {len(matches)}')
replacement = '''### #241 — post-#240 P14 repository status synchronization\n\nClassification: **ACTIVE / branch prepared**.\n\nBranch `docs/p14-post-240-status-241` synchronizes canonical repository truth after the verified #237/#238 and #239/#240 cycles without expanding runtime scope:\n\n1. record #237 / PR #238 as completed at guarded merge `2966bae643cd7d9ac972bc60da1688b8fed575e2`, exact head `48804348e6244b043c7c76ceca5181d15704592f`, CI #974, Integration Readiness #319, P12 Final Release Artifact #284 and P12 Offline Acceptance #328;\n2. record #239 / PR #240 as completed at guarded merge `9e86dd4e10dd282758bcdbb177841a0117b179ae`, exact head `9a01555ab95b595151c47d401a0ba3e771c240d9`, CI #976, P12 Final Release Artifact #287 and P12 Offline Acceptance #331;\n3. explicitly preserve the truth that Integration Readiness did not run on code-only PR #240 because its pull-request trigger is path-filtered;\n4. record the receipt-integrity one-shot top-level/nested semantic snapshot boundary, detached bounded receipt collections and accepted validation/re-score reuse;\n5. synchronize README, `docs/P14_FOUNDATION_IMPLEMENTATION.md`, `memory-bank/PROJECT_STATE.md` and this queue only;\n6. keep production safe-recipe authority empty and real Figma mutation/runtime wiring absent;\n7. after this sync closes, run a fresh focused P14 pure-core safety-gap audit rather than exposing real Figma mutation.\n\nThe synchronization branch must remain current with main, review-clean and gate-clean before guarded merge.\n\n### #239 — P14 receipt-integrity semantic snapshot\n\nClassification: **COMPLETED / merged through PR #240**.\n\nPR #240 (`fix/p14-receipt-semantic-snapshot-239`) closes a distinct integrity-validation boundary without changing recipe or target authority:\n\n1. known receipt-integrity top-level fields are captured through guarded one-shot reads before semantic validation;\n2. `appliedActions`, `errors` and `events` are bounded and copied through safe array inspection, a one-shot length read and guarded index reads rather than retaining the original source array/proxy;\n3. source, candidate, error and event fields that receipt integrity reuses are detached into plain known-schema records;\n4. accepted validation and re-score evidence is reused by PREPARED/PREPARED_WITH_REVIEW invariants instead of re-reading original nested stateful objects;\n5. revoked/unreadable top-level, collection and nested receipt evidence fails closed rather than throwing through the integrity API;\n6. ordinary valid receipt semantics and existing oversized-envelope behavior remain intact;\n7. no production recipe, real Figma mutation, target compatibility or production acceptance authority is introduced.\n\nExact head `9a01555ab95b595151c47d401a0ba3e771c240d9` passed CI #976, P12 Final Release Artifact #287 and P12 Offline Acceptance #331. The PR had zero review threads, was current with main and mergeable, then guarded squash-merged as `9e86dd4e10dd282758bcdbb177841a0117b179ae`; issue #239 closed completed. Integration Readiness was correctly absent from the code-only PR and is delegated to #241 status synchronization.\n\n### #237 — post-#236 P14 repository status synchronization\n\nClassification: **COMPLETED / merged through PR #238**.\n\nPR #238 (`docs/p14-post-236-status-237`) synchronized canonical repository truth after #234/#236, exercised the path-filtered Integration Readiness gate, and advanced the immediate P14 action to the next focused pure-core safety-gap audit. Exact head `48804348e6244b043c7c76ceca5181d15704592f` passed CI #974, Integration Readiness #319, P12 Final Release Artifact #284 and P12 Offline Acceptance #328, then guarded squash-merged as `2966bae643cd7d9ac972bc60da1688b8fed575e2`; issue #237 closed completed.\n\n'''
text = text[:matches[0].start()] + replacement + text[matches[0].end():]
write(path, text)

# Remove one-shot helpers; their net diff against BASE must be zero.
subprocess.run([
    'git', 'rm', '-f',
    '.github/workflows/p14-status-sync-241.yml',
    '.github/scripts/p14-status-sync-241.py',
], check=True)

changed = subprocess.check_output(['git', 'diff', '--name-only', BASE], text=True).splitlines()
expected = sorted([
    'README.md',
    'docs/P14_FOUNDATION_IMPLEMENTATION.md',
    'memory-bank/NEXT_ACTIONS.md',
    'memory-bank/PROJECT_STATE.md',
])
if sorted(changed) != expected:
    raise SystemExit(f'Unexpected net changed-file set: {changed!r}; expected {expected!r}')

subprocess.run(['git', 'config', 'user.name', 'github-actions[bot]'], check=True)
subprocess.run(['git', 'config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com'], check=True)
subprocess.run(['git', 'add', *expected], check=True)
subprocess.run(['git', 'commit', '-m', 'Docs: synchronize P14 status after receipt integrity hardening'], check=True)
subprocess.run(['git', 'push', 'origin', 'HEAD:docs/p14-post-240-status-241'], check=True)
