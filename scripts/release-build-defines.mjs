/**
 * Compile-time identifiers the plugin bundle reads through `typeof X !== 'undefined'` guards.
 * A publishable bundle must have every one of them resolved; an unresolved identifier silently
 * degrades the build to a `local` identity (Safe Fix / batch never unlock) or drops a gate.
 */
export const PLUGIN_BUILD_DEFINE_NAMES = Object.freeze([
  '__PLUGIN_VERSION__',
  '__P5_SOURCE_SHA__',
  '__P5_GITHUB_RUN_ID__',
  '__P5_GITHUB_RUN_NUMBER__',
  '__WPEP_BUILD_SOURCE_SHA__',
  '__WPEP_BUILD_RUN_ID__',
  '__WPEP_BUILD_RUN_NUMBER__',
  '__P14_INTERNAL_ACTIVATION__',
]);

export function releasePluginBuildDefines({ pluginVersion, sourceSha, runId, runNumber }) {
  return {
    __PLUGIN_VERSION__: JSON.stringify(pluginVersion),
    __P5_SOURCE_SHA__: JSON.stringify(sourceSha),
    __P5_GITHUB_RUN_ID__: JSON.stringify(runId),
    __P5_GITHUB_RUN_NUMBER__: JSON.stringify(runNumber),
    __WPEP_BUILD_SOURCE_SHA__: JSON.stringify(sourceSha),
    __WPEP_BUILD_RUN_ID__: JSON.stringify(runId),
    __WPEP_BUILD_RUN_NUMBER__: JSON.stringify(runNumber),
  };
}

export function assertNoUnresolvedPluginBuildDefines(code, label = 'plugin bundle') {
  const unresolved = PLUGIN_BUILD_DEFINE_NAMES.filter((name) => code.includes(name));
  if (unresolved.length > 0) {
    throw new Error(`Release build contract drifted: unresolved build define(s) in ${label}: ${unresolved.join(', ')}`);
  }
  return code;
}
