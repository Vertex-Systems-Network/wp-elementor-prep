#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { realpath, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map((arg) => { const [key, ...rest] = arg.replace(/^--/, '').split('='); return [key, rest.join('=')]; }));
if (!args.reference || !args['ir-hash'] || !args.out) throw new Error('Usage: node scripts/p18-reference-evidence-intake.mjs --reference=/path/reference.png --ir-hash=<64-hex> --out=dist-p18/reference-receipt.json');
if (!/^[a-f0-9]{64}$/.test(args['ir-hash'])) throw new Error('--ir-hash must be a lowercase SHA-256 hex digest.');
const input = resolve(args.reference); const output = resolve(args.out);
if (await realpath(input) === await realpath(output).catch(() => '')) throw new Error('--out must not overwrite the reference input.');
const bytes = await readFile(input);
if (bytes.length === 0) throw new Error('Reference must be a non-empty file.');
if (bytes.length < 24 || bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error('Reference must be a PNG image.');
const screenshotSha256 = createHash('sha256').update(bytes).digest('hex');
const receipt = {
  schemaVersion: 1,
  gate: 'p18-reference-evidence-intake-v1',
  status: 'REFERENCE_READY',
  irSha256: args['ir-hash'],
  screenshotSha256,
  byteLength: bytes.length,
  viewport: args.viewport ?? null,
  visualComparison: 'NOT_RUN',
  productionAcceptance: false,
  notes: ['Reference identity is verified; this receipt does not claim visual parity.', 'Pass it to the P18 runtime proof with P18_REFERENCE_SCREENSHOT and P18_REFERENCE_IR_SHA256.'],
};
await writeFile(output, JSON.stringify(receipt, null, 2) + '\n');
console.log(JSON.stringify({ out: output, status: receipt.status, screenshotSha256, irSha256: receipt.irSha256 }, null, 2));
