'use strict';
/**
 * Recovery M8.3 Gutenberg validity gate. Pinned to the WordPress 6.9 package set (every `@wordpress/*` package at its
 * `wp-6.9` dist-tag through `overrides`; see docs/R0_GUTENBERG_WP69_2026-10-17.md).
 *
 *   node validate.cjs check <markup.html>...      → JSON report; exit 1 unless every file is VALID
 *   node validate.cjs canonical <tree.json>       → core's own serialisation of a {name, attributes, innerBlocks} tree
 *
 * VALID means: every block in the parsed tree is a registered core block, `isValid` without a deprecation migration,
 * and `serialize(parse(markup))` equals the input byte for byte. Anything else is INVALID (BLOCKED for export).
 */
const { readFileSync } = require('node:fs');
const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
for (const key of Object.getOwnPropertyNames(dom.window)) {
  if (!(key in globalThis)) {
    try { globalThis[key] = dom.window[key]; } catch { /* read-only global */ }
  }
}
globalThis.window = dom.window;
globalThis.document = dom.window.document;

const messages = [];
for (const level of ['log', 'info', 'warn', 'error']) console[level] = (...args) => messages.push(args.map(String).join(' '));
const blocks = require('@wordpress/blocks');
require('@wordpress/block-library').registerCoreBlocks();
const out = (value) => process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);

function walk(list, issues, path) {
  list.forEach((block, index) => {
    const at = `${path}[${index}]`;
    if (!block.name || block.name === 'core/missing' || block.name === 'core/freeform') issues.push(`${at}: unregistered or freeform block`);
    else if (!block.isValid) issues.push(`${at} ${block.name}: invalid`);
    walk(block.innerBlocks || [], issues, `${at}.inner`);
  });
}

const [command, ...files] = process.argv.slice(2);
if (command === 'check' && files.length > 0) {
  const results = files.map((file) => {
    const markup = readFileSync(file, 'utf8');
    messages.length = 0;
    const parsed = blocks.parse(markup);
    const issues = [];
    walk(parsed, issues, '$');
    const reserialized = blocks.serialize(parsed);
    if (reserialized !== markup) issues.push('serialize(parse(markup)) differs from the input');
    if (messages.some((message) => /Updated Block|Block validation/.test(message))) issues.push('core applied a deprecation migration or reported a validation problem');
    return { file, status: issues.length === 0 ? 'VALID' : 'INVALID', blockCount: parsed.length, issues, messages: messages.slice(0, 10) };
  });
  out({ schema: 'p16-gutenberg-validity-v1', wordpress: '6.9', blocks: require('@wordpress/blocks/package.json').version,
    blockLibrary: require('@wordpress/block-library/package.json').version, results });
  process.exitCode = results.every((result) => result.status === 'VALID') ? 0 : 1;
} else if (command === 'canonical' && files.length === 1) {
  const build = (node) => blocks.createBlock(node.name, node.attributes || {}, (node.innerBlocks || []).map(build));
  const tree = JSON.parse(readFileSync(files[0], 'utf8'));
  process.stdout.write(blocks.serialize((Array.isArray(tree) ? tree : [tree]).map(build)));
} else {
  process.stderr.write('Usage: validate.cjs check <markup>... | canonical <tree.json>\n');
  process.exitCode = 2;
}
