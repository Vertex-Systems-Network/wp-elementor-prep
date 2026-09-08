import type { P5RuntimeBuildIdentity } from '../core/p5-runtime-gate';

declare const __P5_SOURCE_SHA__: string;
declare const __P5_GITHUB_RUN_ID__: string;
declare const __P5_GITHUB_RUN_NUMBER__: string;

/** Build identity compiled directly into the development plugin bundle. */
export const P5_RUNTIME_BUILD_IDENTITY: Readonly<P5RuntimeBuildIdentity> = Object.freeze({
  sourceSha: __P5_SOURCE_SHA__,
  runId: __P5_GITHUB_RUN_ID__,
  runNumber: __P5_GITHUB_RUN_NUMBER__,
});

export function currentP5RuntimeBuildIdentity(): P5RuntimeBuildIdentity {
  return { ...P5_RUNTIME_BUILD_IDENTITY };
}
