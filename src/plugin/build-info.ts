import type { P7RuntimeBuildIdentity } from '../core/batch-runtime-evidence';

declare const __WPEP_BUILD_SOURCE_SHA__: string;
declare const __WPEP_BUILD_RUN_ID__: string;
declare const __WPEP_BUILD_RUN_NUMBER__: string;

function injected(value: string, fallback: string): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

/**
 * Build identity compiled directly into the plugin bundle. Local builds deliberately use `local`
 * placeholders; real runtime acceptance requires a traceable GitHub Actions identity.
 */
export const P7_BUILD_IDENTITY: P7RuntimeBuildIdentity = {
  sourceSha: injected(
    typeof __WPEP_BUILD_SOURCE_SHA__ !== 'undefined' ? __WPEP_BUILD_SOURCE_SHA__ : '',
    'local',
  ),
  runId: injected(
    typeof __WPEP_BUILD_RUN_ID__ !== 'undefined' ? __WPEP_BUILD_RUN_ID__ : '',
    'local',
  ),
  runNumber: injected(
    typeof __WPEP_BUILD_RUN_NUMBER__ !== 'undefined' ? __WPEP_BUILD_RUN_NUMBER__ : '',
    'local',
  ),
};
