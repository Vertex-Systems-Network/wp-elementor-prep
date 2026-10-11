import { buildP15HarnessFixture, fail, relinkP15HarnessPack } from './p15-asset-pack-harness-lib';

/** Entry point; see `p15-asset-pack-harness-lib.ts` (recovery M3.6b). */
function option(argv: string[], name: string): string {
  const index = argv.indexOf(`--${name}`);
  const value = index >= 0 ? argv[index + 1] : undefined;
  if (!value || value.startsWith('--')) fail(`--${name} is required.`);
  return value;
}

const [command, ...rest] = process.argv.slice(2);
if (command === 'fixture') await buildP15HarnessFixture(option(rest, 'out-dir'));
else if (command === 'relink') await relinkP15HarnessPack(option(rest, 'pack-dir'), option(rest, 'uploads'), option(rest, 'out'));
else fail('Usage: fixture --out-dir <dir> | relink --pack-dir <dir> --uploads <json> --out <template.json>');
