import { buildP15ResponsiveHarnessFixture, buildP15RoundTripHarnessReport, fail } from './p15-responsive-harness-lib';

/** Entry point; see `p15-responsive-harness-lib.ts` (recovery M4.6). */
const [command, flag, value] = process.argv.slice(2);
if (command === 'fixture' && flag === '--out-dir' && value && !value.startsWith('--')) await buildP15ResponsiveHarnessFixture(value);
else if (command === 'round-trip-report' && flag === '--out-dir' && value && !value.startsWith('--')) await buildP15RoundTripHarnessReport(value);
else fail('Usage: fixture --out-dir <dir> | round-trip-report --out-dir <dir>');
