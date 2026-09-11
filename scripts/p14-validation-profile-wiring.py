from pathlib import Path

TYPES = Path('src/core/p14-preparation-types.ts')
TX = Path('src/core/p14-retained-duplicate-transaction.ts')
RECEIPT = Path('src/core/p14-preparation-receipt.ts')
RETAINED = Path('tests/p14-retained-duplicate.test.ts')
INTEGRITY = Path('tests/p14-integrity.test.ts')
COORD = Path('tests/p14-transaction-coordinator.test.ts')
CONFIRM_TX = Path('tests/p14-confirmation-transaction.test.ts')
BOUNDS_TEST = Path('tests/p14-input-bounds.test.ts')
PLAN_AUTH = Path('tests/p14-plan-authorization.test.ts')


def replace_exact(path: Path, old: str, new: str, count: int = 1):
    text = path.read_text()
    actual = text.count(old)
    if actual != count:
        raise SystemExit(f'{path}: expected {count} copies of anchor, found {actual}')
    path.write_text(text.replace(old, new, count))

replace_exact(
    TYPES,
    "export interface P14ValidationSummary {\n  passed: boolean;\n  checks: P14ValidationCheck[];\n}",
    "export interface P14ValidationSummary {\n  passed: boolean;\n  /** Bounded evidence of validation profiles that actually ran for this candidate. */\n  profileIdsRun: string[];\n  checks: P14ValidationCheck[];\n}",
)

replace_exact(
    TX,
    "import { validateP14PreparationConfirmation } from './p14-preparation-confirmation';",
    "import { validateP14PreparationConfirmation } from './p14-preparation-confirmation';\nimport { assessP14ValidationProfileCoverage } from './p14-validation-profile-coverage';",
)

OLD_VALIDATION = """  const requiredChecksPass = validation.checks.filter((check) => check.required).every((check) => check.passed);
  if (!validation.passed || !requiredChecksPass) {
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
      primaryError: receiptError('P14_VALIDATION_FAILED', 'validate', 'Candidate failed one or more mandatory validators.'),
      discardError,
    });
    return { ...result, validation };
  }
"""
NEW_VALIDATION = """  const profileCoverage = assessP14ValidationProfileCoverage(plan, validation.profileIdsRun);
  validation = { ...validation, profileIdsRun: profileCoverage.observedProfileIds };
  const requiredChecksPass = Array.isArray(validation.checks)
    && validation.checks.filter((check) => check.required).every((check) => check.passed);
  if (!profileCoverage.valid || !validation.passed || !requiredChecksPass) {
    const discardError = await discardCandidate(adapter, candidate);
    const profileDetail = profileCoverage.valid
      ? ''
      : ` Validation profile coverage failed: ${profileCoverage.failures.join(' | ')}`;
    const result = cleanupOutcome({
      plan,
      transactionId: input.transactionId,
      beforeFingerprint,
      afterFingerprint: unknownFingerprint,
      candidate,
      appliedActions,
      events,
      now,
      primaryError: receiptError(
        'P14_VALIDATION_FAILED',
        'validate',
        `Candidate failed one or more mandatory validators.${profileDetail}`,
      ),
      discardError,
    });
    return { ...result, validation };
  }
"""
replace_exact(TX, OLD_VALIDATION, NEW_VALIDATION)

replace_exact(
    RECEIPT,
    "import {\n  P14_PREPARATION_ENGINE_VERSION,",
    "import { DEFAULT_P14_INPUT_BOUNDS } from './p14-input-bounds';\nimport {\n  P14_PREPARATION_ENGINE_VERSION,",
)

OLD_RECEIPT_VALIDATION = """  if (value.validation !== undefined) {
    if (!isRecord(value.validation) || typeof value.validation.passed !== 'boolean' || !Array.isArray(value.validation.checks)) {
      failures.push('validation is malformed.');
    } else {
      for (const [index, check] of value.validation.checks.entries()) {
"""
NEW_RECEIPT_VALIDATION = """  if (value.validation !== undefined) {
    if (!isRecord(value.validation)
      || typeof value.validation.passed !== 'boolean'
      || !Array.isArray(value.validation.profileIdsRun)
      || !Array.isArray(value.validation.checks)) {
      failures.push('validation is malformed.');
    } else {
      if (value.validation.profileIdsRun.length > DEFAULT_P14_INPUT_BOUNDS.maxActions) {
        failures.push('validation.profileIdsRun exceeds the bounded profile count.');
      } else {
        const profileIds = value.validation.profileIdsRun as unknown[];
        if (profileIds.some((profileId) => !nonEmptyString(profileId)
          || String(profileId).length > DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength)) {
          failures.push('validation.profileIdsRun contains an invalid or oversized profile ID.');
        }
        if (new Set(profileIds).size !== profileIds.length) {
          failures.push('validation.profileIdsRun contains duplicate profile IDs.');
        }
      }
      for (const [index, check] of value.validation.checks.entries()) {
"""
replace_exact(RECEIPT, OLD_RECEIPT_VALIDATION, NEW_RECEIPT_VALIDATION)

replace_exact(
    RECEIPT,
    "    if (!isRecord(value.validation) || value.validation.passed !== true) failures.push(`${status} requires passing validation.`);",
    "    if (!isRecord(value.validation) || value.validation.passed !== true) failures.push(`${status} requires passing validation.`);\n    else if (!Array.isArray(value.validation.profileIdsRun) || value.validation.profileIdsRun.length === 0) {\n      failures.push(`${status} requires validation-profile execution evidence.`);\n    }",
)

replace_exact(
    RETAINED,
    "  validation: P14ValidationSummary = {\n    passed: true,\n    checks: [",
    "  validation: P14ValidationSummary = {\n    passed: true,\n    profileIdsRun: ['P14_STRUCTURAL_PRESERVATION_V1', 'P14_TEXT_GEOMETRY_V1'],\n    checks: [",
)
replace_exact(
    RETAINED,
    "    validationAdapter.validation = {\n      passed: false,\n      checks:",
    "    validationAdapter.validation = {\n      passed: false,\n      profileIdsRun: ['P14_STRUCTURAL_PRESERVATION_V1', 'P14_TEXT_GEOMETRY_V1'],\n      checks:",
)

replace_exact(
    INTEGRITY,
    "    return { passed: true, checks: [{ id: 'required', passed: true, required: true }] };",
    "    return {\n      passed: true,\n      profileIdsRun: ['P14_VALIDATE_PARENT', 'P14_VALIDATE_CHILD'],\n      checks: [{ id: 'required', passed: true, required: true }],\n    };",
)

replace_exact(
    COORD,
    "    return { passed: true, checks: [{ id: 'required', passed: true, required: true }] };",
    "    return {\n      passed: true,\n      profileIdsRun: ['P14_SYNTHETIC_COORDINATOR_VALIDATE'],\n      checks: [{ id: 'required', passed: true, required: true }],\n    };",
)

replace_exact(
    CONFIRM_TX,
    "    return { passed: true, checks: [{ id: 'required', passed: true, required: true }] };",
    "    return {\n      passed: true,\n      profileIdsRun: ['P14_SYNTHETIC_CONFIRM_TX_VALIDATE'],\n      checks: [{ id: 'required', passed: true, required: true }],\n    };",
)

replace_exact(
    BOUNDS_TEST,
    "    return { passed: true, checks: [{ id: 'required', passed: true, required: true }] };",
    "    return {\n      passed: true,\n      profileIdsRun: ['P14_SYNTHETIC_BOUNDS_VALIDATE'],\n      checks: [{ id: 'required', passed: true, required: true }],\n    };",
)

replace_exact(
    PLAN_AUTH,
    "    return { passed: true, checks: [{ id: 'required', passed: true, required: true }] };",
    "    return {\n      passed: true,\n      profileIdsRun: ['P14_SYNTHETIC_AUTH_VALIDATE'],\n      checks: [{ id: 'required', passed: true, required: true }],\n    };",
)
