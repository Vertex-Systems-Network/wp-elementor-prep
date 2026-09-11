from pathlib import Path

TX = Path('src/core/p14-retained-duplicate-transaction.ts')
RECEIPT = Path('src/core/p14-preparation-receipt.ts')


def replace_exact(path: Path, old: str, new: str, count: int = 1):
    text = path.read_text()
    actual = text.count(old)
    if actual != count:
        raise SystemExit(f'{path}: expected {count} copies of anchor, found {actual}')
    path.write_text(text.replace(old, new, count))

replace_exact(
    TX,
    "import { assessP14ValidationProfileCoverage } from './p14-validation-profile-coverage';",
    "import { assessP14ValidationProfileCoverage } from './p14-validation-profile-coverage';\nimport { validateP14RescoreEvidence } from './p14-rescore-evidence';",
)

OLD_RESCORE = """  events.push(event(now, 'RESCORING'));
  let rescore;
  try {
    rescore = await adapter.rescoreCandidate(candidate, plan);
  } catch (error) {
    const discardError = await discardCandidate(adapter, candidate);
    const result = cleanupOutcome({
      plan,
      transactionId: input.transactionId,
      beforeFingerprint,
      afterFingerprint: unknownFingerprint,
      candidate,
      appliedActions,
      events,
      now,
      primaryError: receiptError('P14_RESCORE_FAILED', 'rescore', messageOf(error)),
      discardError,
    });
    return { ...result, validation };
  }

  if (rescore.introducedBlockerOrHighCount > 0 || rescore.blockerCount < 0 || rescore.highRiskCount < 0) {
    const discardError = await discardCandidate(adapter, candidate);
    const result = cleanupOutcome({
      plan,
      transactionId: input.transactionId,
      beforeFingerprint,
      afterFingerprint: unknownFingerprint,
      candidate,
      appliedActions,
      events,
      now,
      primaryError: receiptError('P14_VALIDATION_FAILED', 'rescore', 'Preparation introduced a new HIGH/BLOCKER finding or produced invalid risk counts.'),
      discardError,
    });
    return { ...result, validation, rescore };
  }
"""
NEW_RESCORE = """  events.push(event(now, 'RESCORING'));
  let rescore;
  try {
    const rawRescore: unknown = await adapter.rescoreCandidate(candidate, plan);
    const evidence = validateP14RescoreEvidence(rawRescore);
    if (!evidence.valid || !evidence.value) {
      throw new Error(`Candidate re-score evidence is invalid: ${evidence.failures.join(' | ')}`);
    }
    rescore = evidence.value;
  } catch (error) {
    const discardError = await discardCandidate(adapter, candidate);
    const result = cleanupOutcome({
      plan,
      transactionId: input.transactionId,
      beforeFingerprint,
      afterFingerprint: unknownFingerprint,
      candidate,
      appliedActions,
      events,
      now,
      primaryError: receiptError('P14_RESCORE_FAILED', 'rescore', messageOf(error)),
      discardError,
    });
    return { ...result, validation };
  }

  if (rescore.introducedBlockerOrHighCount > 0) {
    const discardError = await discardCandidate(adapter, candidate);
    const result = cleanupOutcome({
      plan,
      transactionId: input.transactionId,
      beforeFingerprint,
      afterFingerprint: unknownFingerprint,
      candidate,
      appliedActions,
      events,
      now,
      primaryError: receiptError('P14_VALIDATION_FAILED', 'rescore', 'Preparation introduced a new HIGH/BLOCKER finding.'),
      discardError,
    });
    return { ...result, validation, rescore };
  }
"""
replace_exact(TX, OLD_RESCORE, NEW_RESCORE)

replace_exact(
    RECEIPT,
    "import { DEFAULT_P14_INPUT_BOUNDS } from './p14-input-bounds';",
    "import { DEFAULT_P14_INPUT_BOUNDS } from './p14-input-bounds';\nimport { validateP14RescoreEvidence } from './p14-rescore-evidence';",
)

OLD_RECEIPT_RESCORE = """  if (value.rescore !== undefined) {
    if (!isRecord(value.rescore)
      || !nonEmptyString(value.rescore.runId)
      || typeof value.rescore.status !== 'string'
      || !Number.isFinite(value.rescore.score)
      || !finiteNonNegative(value.rescore.blockerCount)
      || !finiteNonNegative(value.rescore.highRiskCount)
      || !finiteNonNegative(value.rescore.introducedBlockerOrHighCount)
      || typeof value.rescore.reviewRequired !== 'boolean') {
      failures.push('rescore is malformed.');
    }
  }
"""
NEW_RECEIPT_RESCORE = """  if (value.rescore !== undefined) {
    const rescoreIntegrity = validateP14RescoreEvidence(value.rescore);
    if (!rescoreIntegrity.valid) {
      failures.push('rescore is malformed or outside the accepted scored P13 evidence domain.');
    }
  }
"""
replace_exact(RECEIPT, OLD_RECEIPT_RESCORE, NEW_RECEIPT_RESCORE)
