import { extname, resolve } from 'node:path';
import {
  readBoundedContainedFile,
  readBoundedContainedJsonFile,
} from './security-io.mjs';

const PROJECT_ROOT = resolve('.');
const MAX_COMMUNITY_ASSET_BYTES = 32 * 1024 * 1024;

function fail(message) {
  throw new Error(`Community readiness verification failed: ${message}`);
}

function isContact(value) {
  return typeof value === 'string' && (value.includes('@') || /^https:\/\//.test(value));
}

async function readPngDimensions(path) {
  if (typeof path !== 'string' || extname(path).toLowerCase() !== '.png') {
    fail(`final Community asset must be PNG: ${String(path)}.`);
  }

  let file;
  try {
    file = await readBoundedContainedFile(PROJECT_ROOT, path, {
      label: `Community asset ${path}`,
      maxBytes: MAX_COMMUNITY_ASSET_BYTES,
      allowAbsolute: false,
    });
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
  }

  const bytes = file.bytes;
  if (bytes.length < 24 || bytes.toString('hex', 0, 8) !== '89504e470d0a1a0a' || bytes.toString('ascii', 12, 16) !== 'IHDR') {
    fail(`invalid PNG asset: ${path}.`);
  }
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  };
}

async function requirePngSize(path, width, height, label) {
  const actual = await readPngDimensions(path);
  if (actual.width !== width || actual.height !== height) {
    fail(`${label} must be exactly ${width}×${height}; got ${actual.width}×${actual.height}.`);
  }
}

const args = process.argv.slice(2);
const templateMode = args.includes('--template');
const publishableMode = args.includes('--publishable');
if (templateMode === publishableMode) {
  fail('choose exactly one of --template or --publishable.');
}
const path = args.find((value) => !value.startsWith('--')) ?? 'community/listing.template.json';

let listing;
try {
  listing = (await readBoundedContainedJsonFile(PROJECT_ROOT, path, {
    label: 'Community listing',
    maxBytes: 4 * 1024 * 1024,
    allowAbsolute: true,
  })).value;
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}

if (!listing || typeof listing !== 'object' || Array.isArray(listing)) fail('Community listing root must be an object.');
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

try {
  await readBoundedContainedFile(PROJECT_ROOT, listing.privacyPolicy, {
    label: 'Community privacy policy',
    maxBytes: 4 * 1024 * 1024,
    allowAbsolute: false,
  });
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}

let releaseManifest;
try {
  releaseManifest = (await readBoundedContainedJsonFile(PROJECT_ROOT, 'manifest.release.template.json', {
    label: 'release manifest template',
    maxBytes: 4 * 1024 * 1024,
  })).value;
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
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
if (!listing.assets?.icon || typeof listing.assets.icon.path !== 'string') fail('final icon path is required.');
if (!listing.assets?.thumbnail || typeof listing.assets.thumbnail.path !== 'string') fail('final thumbnail path is required.');

await requirePngSize(listing.assets.icon.path, 128, 128, 'Community icon');
await requirePngSize(listing.assets.thumbnail.path, 1920, 1080, 'Community thumbnail');

const carouselPaths = listing.assets?.carousel?.paths;
if (!Array.isArray(carouselPaths) || carouselPaths.length < 3 || carouselPaths.length > 9) {
  fail('publishable Community carousel must contain 3–9 final assets.');
}
if (listing.assets.carousel.recommendedWidth !== 1920 || listing.assets.carousel.recommendedHeight !== 1080) {
  fail('carousel recommendation must remain 1920×1080.');
}
for (const carouselPath of carouselPaths) {
  await requirePngSize(carouselPath, 1920, 1080, `Community carousel asset ${carouselPath}`);
}

console.log(`Community readiness metadata + assets PASS for target: ${listing.publishTarget}`);
console.log(`Category: ${listing.category}`);
console.log(`Assets: 1 icon + 1 thumbnail + ${carouselPaths.length} carousel images`);
