// src/plugin/p5-runtime-build-identity.ts
var P5_RUNTIME_BUILD_IDENTITY = Object.freeze({
  sourceSha: "2b0dcd668066d5194401a9d4e4400ef3d5a000a8",
  runId: "34463779753",
  runNumber: "1"
});
function currentP5RuntimeBuildIdentity() {
  return { ...P5_RUNTIME_BUILD_IDENTITY };
}

// src/core/p5-runtime-gate.ts
var P5_RUNTIME_GATE_VERSION = "p5-runtime-proof-v3";
function isTraceableP5RuntimeBuildIdentity(value) {
  if (typeof value !== "object" || value === null) return false;
  const build = value;
  return typeof build.sourceSha === "string" && /^[0-9a-f]{40}$/i.test(build.sourceSha) && typeof build.runId === "string" && /^[1-9][0-9]*$/.test(build.runId) && typeof build.runNumber === "string" && /^[1-9][0-9]*$/.test(build.runNumber);
}
function sameP5RuntimeBuildIdentity(left, right) {
  return left.sourceSha === right.sourceSha && left.runId === right.runId && left.runNumber === right.runNumber;
}
function isValidP5RuntimeProof(value, expectedBuild) {
  if (typeof value !== "object" || value === null) return false;
  const proof = value;
  if (proof.schemaVersion !== 1 || proof.gateVersion !== P5_RUNTIME_GATE_VERSION || typeof proof.passedAt !== "string" || proof.passedAt.length === 0 || !isTraceableP5RuntimeBuildIdentity(proof.build)) {
    return false;
  }
  if (expectedBuild !== void 0) {
    if (!isTraceableP5RuntimeBuildIdentity(expectedBuild)) return false;
    if (!sameP5RuntimeBuildIdentity(proof.build, expectedBuild)) return false;
  }
  return true;
}

// src/plugin/p5-runtime-acceptance.ts
function requireCondition(failures, condition, message) {
  if (!condition) failures.push(message);
}
function hasPixelValue(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}
function assessP5RuntimeAcceptance(result) {
  const failures = [];
  requireCondition(failures, result.schemaVersion === 1, "Unsupported P5 runtime evidence schema.");
  requireCondition(failures, result.passed === true, "P5 runtime self-test did not report overall PASS.");
  requireCondition(failures, result.forcedReject.validationRejected, "Forced-reject validation was not rejected.");
  requireCondition(failures, result.forcedReject.pixelEvidenceReturned, "Forced-reject path returned no rendered-pixel evidence.");
  requireCondition(failures, hasPixelValue(result.forcedReject.changedPixelPct), "Forced-reject path has no valid changed-pixel percentage.");
  requireCondition(failures, result.forcedReject.candidateDeleted, "Forced-reject candidate was not deleted.");
  requireCondition(failures, result.forcedReject.originalUntouched, "Forced-reject original was not preserved exactly.");
  requireCondition(failures, result.passRestore.validationPassed, "Restore path Full P3 validation did not pass.");
  requireCondition(failures, result.passRestore.pixelEvidenceReturned, "Restore path returned no rendered-pixel evidence.");
  requireCondition(failures, hasPixelValue(result.passRestore.changedPixelPct), "Restore path has no valid changed-pixel percentage.");
  requireCondition(failures, result.passRestore.committed, "Restore path did not commit the validated candidate.");
  requireCondition(failures, result.passRestore.restored, "Restore path did not restore the retained approved original.");
  requireCondition(failures, result.passRestore.checkpointCleared, "Restore path left a checkpoint pending.");
  requireCondition(failures, result.passFinalize.validationPassed, "Finalize path Full P3 validation did not pass.");
  requireCondition(failures, result.passFinalize.pixelEvidenceReturned, "Finalize path returned no rendered-pixel evidence.");
  requireCondition(failures, hasPixelValue(result.passFinalize.changedPixelPct), "Finalize path has no valid changed-pixel percentage.");
  requireCondition(failures, result.passFinalize.committed, "Finalize path did not commit the validated candidate.");
  requireCondition(failures, result.passFinalize.finalized, "Finalize path did not finalize the checkpoint.");
  requireCondition(failures, result.passFinalize.candidateRetained, "Finalize path did not retain the committed candidate.");
  requireCondition(failures, result.passFinalize.originalDiscarded, "Finalize path did not discard the retained previous original.");
  requireCondition(failures, result.passFinalize.checkpointCleared, "Finalize path left a checkpoint pending.");
  requireCondition(failures, result.leftovers === 0, `Runtime calibration left ${result.leftovers} temporary node(s).`);
  return { accepted: failures.length === 0, failures };
}

// src/plugin/p5-runtime-evidence-storage.ts
function objectValue(value) {
  return value && typeof value === "object" ? value : null;
}
function pixelValue(value) {
  return value === null || typeof value === "number" && Number.isFinite(value) && value >= 0;
}
function booleanFields(value, names) {
  return names.every((name) => typeof value[name] === "boolean");
}
function isBuildIdentity(value) {
  const build = objectValue(value);
  return Boolean(
    build && typeof build.sourceSha === "string" && typeof build.runId === "string" && typeof build.runNumber === "string"
  );
}
function isCalibrationResult(value) {
  const calibration = objectValue(value);
  if (!calibration) return false;
  const forcedReject = objectValue(calibration.forcedReject);
  const passRestore = objectValue(calibration.passRestore);
  const passFinalize = objectValue(calibration.passFinalize);
  if (!forcedReject || !passRestore || !passFinalize) return false;
  return calibration.schemaVersion === 1 && typeof calibration.passed === "boolean" && typeof calibration.leftovers === "number" && Number.isInteger(calibration.leftovers) && calibration.leftovers >= 0 && typeof forcedReject.state === "string" && booleanFields(forcedReject, [
    "validationRejected",
    "pixelEvidenceReturned",
    "candidateDeleted",
    "originalUntouched"
  ]) && pixelValue(forcedReject.changedPixelPct) && typeof passRestore.state === "string" && booleanFields(passRestore, [
    "validationPassed",
    "pixelEvidenceReturned",
    "committed",
    "restored",
    "checkpointCleared"
  ]) && pixelValue(passRestore.changedPixelPct) && typeof passFinalize.state === "string" && booleanFields(passFinalize, [
    "validationPassed",
    "pixelEvidenceReturned",
    "committed",
    "finalized",
    "candidateRetained",
    "originalDiscarded",
    "checkpointCleared"
  ]) && pixelValue(passFinalize.changedPixelPct);
}
function isP5RuntimeEvidenceBundle(value) {
  const candidate = objectValue(value);
  if (!candidate) return false;
  const acceptance = objectValue(candidate.acceptance);
  if (!acceptance || typeof acceptance.accepted !== "boolean" || !Array.isArray(acceptance.failures)) return false;
  if (!acceptance.failures.every((failure) => typeof failure === "string")) return false;
  const proofTimestampValid = acceptance.accepted ? typeof candidate.runtimeProofPassedAt === "string" : candidate.runtimeProofPassedAt === null;
  return candidate.schemaVersion === 2 && typeof candidate.capturedAt === "string" && typeof candidate.pluginVersion === "string" && typeof candidate.runtimeGateVersion === "string" && isBuildIdentity(candidate.build) && proofTimestampValid && isCalibrationResult(candidate.calibration);
}

// src/plugin/p5-runtime-evidence-verifier.ts
function sameFailures(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}
function validIsoTimestamp(value) {
  return value.length > 0 && Number.isFinite(Date.parse(value));
}
function verifyP5RuntimeEvidence(value, expectedBuild) {
  const failures = [];
  if (!isP5RuntimeEvidenceBundle(value)) {
    return { accepted: false, failures: ["Malformed or unsupported P5 runtime evidence bundle."] };
  }
  if (value.runtimeGateVersion !== P5_RUNTIME_GATE_VERSION) {
    failures.push(`Runtime gate mismatch: expected ${P5_RUNTIME_GATE_VERSION}, got ${value.runtimeGateVersion}.`);
  }
  if (!isTraceableP5RuntimeBuildIdentity(value.build)) {
    failures.push("Evidence build provenance is not a traceable CI artifact.");
  }
  if (expectedBuild !== void 0) {
    if (!isTraceableP5RuntimeBuildIdentity(expectedBuild)) {
      failures.push("Offline verifier artifact is not bound to a traceable CI build.");
    } else if (!sameP5RuntimeBuildIdentity(value.build, expectedBuild)) {
      failures.push("Evidence was captured by a different build than this offline verifier artifact.");
    }
  }
  const capturedAtValid = validIsoTimestamp(value.capturedAt);
  if (!capturedAtValid) failures.push("Evidence capturedAt is not a valid timestamp.");
  if (!value.pluginVersion) failures.push("Evidence pluginVersion is empty.");
  const recomputed = assessP5RuntimeAcceptance(value.calibration);
  if (!recomputed.accepted) failures.push(...recomputed.failures);
  if (value.acceptance.accepted !== recomputed.accepted || !sameFailures(value.acceptance.failures, recomputed.failures)) {
    failures.push("Stored acceptance verdict does not match the canonical recomputed assessment.");
  }
  if (recomputed.accepted) {
    if (value.runtimeProofPassedAt === null || !validIsoTimestamp(value.runtimeProofPassedAt)) {
      failures.push("Accepted evidence has no valid runtime proof timestamp.");
    } else {
      const reconstructedProof = {
        schemaVersion: 1,
        gateVersion: value.runtimeGateVersion,
        passedAt: value.runtimeProofPassedAt,
        build: { ...value.build }
      };
      const proofExpectedBuild = expectedBuild ?? value.build;
      if (!isValidP5RuntimeProof(reconstructedProof, proofExpectedBuild)) {
        failures.push("Accepted evidence does not reconstruct a valid exact-build P5 runtime proof.");
      }
      if (capturedAtValid && Date.parse(value.runtimeProofPassedAt) > Date.parse(value.capturedAt)) {
        failures.push("Runtime proof timestamp is later than evidence capture timestamp.");
      }
    }
  } else if (value.runtimeProofPassedAt !== null) {
    failures.push("Rejected evidence must not retain a runtime proof timestamp.");
  }
  return { accepted: failures.length === 0, failures };
}

// src/tools/verify-p5-evidence.ts
var input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  input += chunk;
});
process.stdin.on("end", () => {
  try {
    const parsed = JSON.parse(input);
    const verification = verifyP5RuntimeEvidence(parsed, currentP5RuntimeBuildIdentity());
    process.stdout.write(`${JSON.stringify(verification, null, 2)}
`);
    process.exitCode = verification.accepted ? 0 : 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Invalid JSON input: ${message}
`);
    process.exitCode = 2;
  }
});
