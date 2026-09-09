import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

function fail(message) {
  throw new Error(`Community readiness verification failed: ${message}`);
}

function isContact(value) {
  return typeof value === 'string' && (value.includes('@') || /^https:\/\//.test(value));
}

const args = process.argv.slice(2);
const templateMode = args.includes('--template');
const publishableMode = args.includes('--publishable');
if (templateMode === publishableMode) {
  fail('choose exactly one of --template or --publishable.');
}
const path = args.find((value) => !value.startsWith('--')) ?? 'community/listing.template.json';
const listing = JSON.parse(await readFile(resolve(path), 'utf8'));

if (listing.schemaVersion !== 1) fail('unsupported listing schemaVersion.');
for (const field of ['name', 'tagline', 'description']) {
  if (typeof listing[field] !== 'string' || listing[field].trim().length < 8) fail(`${field} is missing or too short.`);
}
if (!Array.isArray(listing.tags) || listing.tags.length < 1 || listing.tags.length > 5) fail('tags must contain 1–5 values.');
if (listing.reviewRequiredForCommunity !== true) fail('Community review requirement must remain explicit.');
if (listing.twoFactorAuthenticationRequiredBeforePublishing !== true) fail('2FA publishing requirement must remain explicit.');
if (listing.assets?.icon?.recommendedWidth !== 128 || listing.assets?.icon?.recommendedHeight !== 128) {
  fail('icon recommendation must remain 128×128.');
}
if (listing.assets?.thumbnail?.recommendedWidth !== 1920 || listing.assets?.thumbnail?.recommendedHeight !== 1080) {
  fail('thumbnail recommendation must remain 1920×1080.');
}
if (listing.assets?.carousel?.maxItems !== 9) fail('carousel maxItems must remain 9.');

await access(resolve(listing.privacyPolicy));
const releaseManifest = JSON.parse(await readFile('manifest.release.template.json', 'utf8'));
if (releaseManifest.networkAccess?.allowedDomains?.length !== 1 || releaseManifest.networkAccess.allowedDomains[0] !== 'none') {
  fail('release plugin network declaration must remain offline.');
}

const unresolved = JSON.stringify(listing).match(/__[A-Z0-9_]+__/g) ?? [];
if (templateMode) {
  const expected = new Set([
    '__SELECT_IN_FIGMA_PUBLISH_MODAL__',
    '__REQUIRED_BEFORE_PUBLISH__',
    '__COMMUNITY_OR_ORGANIZATION__',
    '__ADD_FINAL_ICON_BEFORE_PUBLISH__',
    '__ADD_FINAL_THUMBNAIL_BEFORE_PUBLISH__',
  ]);
  if (unresolved.length !== expected.size || unresolved.some((value) => !expected.has(value))) {
    fail(`template placeholders changed unexpectedly: ${unresolved.join(', ')}.`);
  }
  console.log('Community readiness template PASS: required human/publisher fields remain explicit.');
  process.exit(0);
}

if (unresolved.length > 0) fail(`publishable listing contains unresolved placeholders: ${unresolved.join(', ')}.`);
if (!isContact(listing.supportContact)) fail('supportContact must be a real email address or https URL.');
if (typeof listing.category !== 'string' || listing.category.trim().length === 0) fail('category is required.');
if (listing.publishTarget !== 'Community' && listing.publishTarget !== 'Organization') fail('publishTarget must be Community or Organization.');
for (const asset of [listing.assets?.icon, listing.assets?.thumbnail]) {
  if (!asset || typeof asset.path !== 'string') fail('final icon and thumbnail paths are required.');
  await access(resolve(asset.path));
}
for (const carouselPath of listing.assets?.carousel?.paths ?? []) await access(resolve(carouselPath));

console.log(`Community readiness metadata PASS for target: ${listing.publishTarget}`);
