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
    """import { assessP14ValidationProfileCoverage } from './p14-validation-profile-coverage';\nimport { validateP14RescoreEvidence } from './p14-rescore-evidence';\n""",
    """import { assessP14ValidationProfileCoverage } from './p14-validation-profile-coverage';\nimport {\n  validateP14ValidationEvidence,\n  type P14BoundedValidationEvidence,\n} from './p14-validation-evidence';\nimport { validateP14RescoreEvidence } from './p14-rescore-evidence';\n""",
)

replace_exact(
    TX,
    """function isRecord(value: unknown): value is Record<string, unknown> {\n  return typeof value === 'object' && value !== null && !Array.isArray(value);\n}\n\nfunction isP14ValidationSummary(value: unknown): value is P14ValidationSummary {\n  if (!isRecord(value)\n    || typeof value.passed !== 'boolean'\n    || !Array.isArray(value.profileIdsRun)\n    || !Array.isArray(value.checks)) {\n    return false;\n  }\n  return value.checks.every((check) => isRecord(check)\n    && typeof check.id === 'string'\n    && check.id.length > 0\n    && typeof check.passed === 'boolean'\n    && typeof check.required === 'boolean'\n    && (check.detail === undefined || typeof check.detail === 'string'));\n}\n\n\n""",
    "",
)

replace_exact(
    TX,
    """  events.push(event(now, 'VALIDATING'));\n  let validation: P14ValidationSummary;\n  try {\n    const rawValidation: unknown = await adapter.validateCandidate(candidate, plan);\n    if (!isP14ValidationSummary(rawValidation)) {\n      throw new Error('Validation adapter returned malformed evidence.');\n    }\n    validation = rawValidation;\n  } catch (error) {\n    const discardError = await discardCandidate(adapter, candidate);\n    return cleanupOutcome({\n      plan,\n      transactionId: input.transactionId,\n      beforeFingerprint,\n      afterFingerprint: unknownFingerprint,\n      candidate,\n      appliedActions,\n      events,\n      now,\n      primaryError: receiptError('P14_VALIDATION_FAILED', 'validate', `Validation crashed: ${messageOf(error)}`),\n      discardError,\n    });\n  }\n\n  const profileCoverage = assessP14ValidationProfileCoverage(plan, validation.profileIdsRun);\n  validation = { ...validation, profileIdsRun: profileCoverage.observedProfileIds };\n""",
    """  events.push(event(now, 'VALIDATING'));\n  let validationEvidence: P14BoundedValidationEvidence;\n  try {\n    const rawValidation: unknown = await adapter.validateCandidate(candidate, plan);\n    const evidence = validateP14ValidationEvidence(rawValidation);\n    if (!evidence.valid || !evidence.value) {\n      throw new Error(`Validation adapter returned malformed evidence: ${evidence.failures.join(' | ')}`);\n    }\n    validationEvidence = evidence.value;\n  } catch (error) {\n    const discardError = await discardCandidate(adapter, candidate);\n    return cleanupOutcome({\n      plan,\n      transactionId: input.transactionId,\n      beforeFingerprint,\n      afterFingerprint: unknownFingerprint,\n      candidate,\n      appliedActions,\n      events,\n      now,\n      primaryError: receiptError('P14_VALIDATION_FAILED', 'validate', `Validation crashed: ${messageOf(error)}`),\n      discardError,\n    });\n  }\n\n  const profileCoverage = assessP14ValidationProfileCoverage(plan, validationEvidence.profileIdsRun);\n  const validation: P14ValidationSummary = {\n    passed: validationEvidence.passed,\n    profileIdsRun: profileCoverage.observedProfileIds,\n    checks: validationEvidence.checks,\n  };\n""",
)

replace_exact(
    RECEIPT,
    """import { validateP14RescoreEvidence } from './p14-rescore-evidence';\n""",
    """import { validateP14RescoreEvidence } from './p14-rescore-evidence';\nimport { validateP14ValidationEvidence } from './p14-validation-evidence';\n""",
)

replace_exact(
    RECEIPT,
    """  if (value.validation !== undefined) {\n    if (!isRecord(value.validation)\n      || typeof value.validation.passed !== 'boolean'\n      || !Array.isArray(value.validation.profileIdsRun)\n      || !Array.isArray(value.validation.checks)) {\n      failures.push('validation is malformed.');\n    } else {\n      if (value.validation.profileIdsRun.length > DEFAULT_P14_INPUT_BOUNDS.maxActions) {\n        failures.push('validation.profileIdsRun exceeds the bounded profile count.');\n      } else {\n        const profileIds = value.validation.profileIdsRun as unknown[];\n        if (profileIds.some((profileId) => !nonEmptyString(profileId)\n          || String(profileId).length > DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength)) {\n          failures.push('validation.profileIdsRun contains an invalid or oversized profile ID.');\n        }\n        if (new Set(profileIds).size !== profileIds.length) {\n          failures.push('validation.profileIdsRun contains duplicate profile IDs.');\n        }\n      }\n      for (const [index, check] of value.validation.checks.entries()) {\n        if (!isRecord(check)\n          || !nonEmptyString(check.id)\n          || typeof check.passed !== 'boolean'\n          || typeof check.required !== 'boolean'\n          || (check.detail !== undefined && typeof check.detail !== 'string')) {\n          failures.push(`validation.checks[${index}] is malformed.`);\n        }\n      }\n      if (value.validation.passed) {\n        const failedRequired = value.validation.checks.some((check) => isRecord(check) && check.required === true && check.passed !== true);\n        if (failedRequired) failures.push('validation.passed contradicts a failed required check.');\n      }\n    }\n  }\n""",
    """  if (value.validation !== undefined) {\n    const validationEvidence = validateP14ValidationEvidence(value.validation);\n    if (!validationEvidence.valid || !validationEvidence.value) {\n      failures.push(...validationEvidence.failures);\n    } else {\n      const boundedValidation = validationEvidence.value;\n      if (boundedValidation.profileIdsRun.length > DEFAULT_P14_INPUT_BOUNDS.maxActions) {\n        failures.push('validation.profileIdsRun exceeds the bounded profile count.');\n      } else {\n        const profileIds = boundedValidation.profileIdsRun;\n        if (profileIds.some((profileId) => !nonEmptyString(profileId)\n          || String(profileId).length > DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength)) {\n          failures.push('validation.profileIdsRun contains an invalid or oversized profile ID.');\n        }\n        if (new Set(profileIds).size !== profileIds.length) {\n          failures.push('validation.profileIdsRun contains duplicate profile IDs.');\n        }\n      }\n      if (boundedValidation.passed) {\n        const failedRequired = boundedValidation.checks.some((check) => check.required && !check.passed);\n        if (failedRequired) failures.push('validation.passed contradicts a failed required check.');\n      }\n    }\n  }\n""",
)
