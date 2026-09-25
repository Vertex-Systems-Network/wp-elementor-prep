import { readFile } from 'node:fs/promises';
import { assertRegistrySchemaReferences } from './status-schema-contract.mjs';

const readme = await readFile('README.md', 'utf8');
const p14Qualification = await readFile('src/core/p14-vertical-stack-qualification.ts', 'utf8');
const p14RegistrySource = await readFile('src/core/p14-safe-recipe-registry.ts', 'utf8');
const p15ResponsiveFullWidthSource = await readFile('src/targets/elementor/responsive-full-width-resolution.ts', 'utf8');
const p15ResponsiveHoverBorderRadiusSource = await readFile('src/targets/elementor/responsive-hover-border-radius-resolution.ts', 'utf8');
const p15ResponsiveFlexItemAlignSelfSource = await readFile('src/targets/elementor/responsive-flex-item-align-self-resolution.ts', 'utf8');
const p15ResponsiveFlexItemFactorsSource = await readFile('src/targets/elementor/responsive-flex-item-factors-resolution.ts', 'utf8');
const p15ResponsiveFlexItemOrderPresetSource = await readFile('src/targets/elementor/responsive-flex-item-order-preset-resolution.ts', 'utf8');
const p15ContainerOverflowSource = await readFile('src/targets/elementor/container-overflow-resolution.ts', 'utf8');
const p15ContainerSemanticHtmlTagSource = await readFile('src/targets/elementor/container-semantic-html-tag-resolution.ts', 'utf8');
const p15HeadingTextColorSource = await readFile('src/targets/elementor/heading-text-color-resolution.ts', 'utf8');
const p15TextEditorTextColorSource = await readFile('src/targets/elementor/text-editor-text-color-resolution.ts', 'utf8');
const p15ButtonTextColorSource = await readFile('src/targets/elementor/button-text-color-resolution.ts', 'utf8');
const p15ButtonBackgroundColorSource = await readFile('src/targets/elementor/button-background-color-resolution.ts', 'utf8');
const p15ButtonHoverTextColorSource = await readFile('src/targets/elementor/button-hover-text-color-resolution.ts', 'utf8');
const p15ButtonHoverBackgroundColorSource = await readFile('src/targets/elementor/button-hover-background-color-resolution.ts', 'utf8');
const p15ButtonHoverBorderColorSource = await readFile('src/targets/elementor/button-hover-border-color-resolution.ts', 'utf8');
const p15ButtonHoverInteractionSource = await readFile('src/targets/elementor/button-hover-interaction-resolution.ts', 'utf8');
const p15ButtonBorderStyleSource = await readFile('src/targets/elementor/button-border-style-resolution.ts', 'utf8');
const p15ButtonVisualDepthRadiusSource = await readFile('src/targets/elementor/button-visual-depth-radius-resolution.ts', 'utf8');
const p15ButtonTypographyBasicsSource = await readFile('src/targets/elementor/button-typography-basics-resolution.ts', 'utf8');
const p15ButtonResponsivePaddingSource = await readFile('src/targets/elementor/button-responsive-padding-resolution.ts', 'utf8');
const registry = JSON.parse(await readFile('config/runtime-artifacts.json', 'utf8'));
const statusDocuments = {
  'README.md': readme,
  'memory-bank/PROJECT_STATE.md': await readFile('memory-bank/PROJECT_STATE.md', 'utf8'),
  'memory-bank/ROADMAP.md': await readFile('memory-bank/ROADMAP.md', 'utf8'),
  'memory-bank/NEXT_ACTIONS.md': await readFile('memory-bank/NEXT_ACTIONS.md', 'utf8')
};

const schemaTag = assertRegistrySchemaReferences(registry.schemaVersion, statusDocuments);

const overallTruth = '**Overall progress is intentionally not collapsed into one synthetic percentage.**';
const requiredFragments = [
  '### Module-wise progress',
  '| Module | Status | Progress | Progress Bar | Blocker / Next |',
  overallTruth,
  '**Open PR/MR:**',
  '**Progress sync policy:**',
  'P27 Final production release + publisher/runtime evidence',
];

for (const fragment of requiredFragments) {
  if (!readme.includes(fragment)) {
    throw new Error(`README progress contract missing required fragment: ${fragment}`);
  }
}

const staleFragments = [
  'P13-P26 runtime implementation remains 0%',
  'runtime implementation blocked by #84 internal exit',
  'PREFLIGHT FROZEN / IMPLEMENTATION BLOCKED',
];
for (const fragment of staleFragments) {
  if (readme.includes(fragment)) {
    throw new Error(`README still contains stale roadmap/progress truth: ${fragment}`);
  }
}

const moduleSection = readme.match(
  /### Module-wise progress\n\n([\s\S]*?)\n\n\*\*Overall progress is intentionally not collapsed into one synthetic percentage\.\*\*/,
)?.[1];

if (!moduleSection) {
  throw new Error('Unable to locate README module-wise progress table.');
}

const rows = moduleSection
  .split('\n')
  .filter((line) => line.startsWith('|') && !line.includes('---'))
  .slice(1)
  .map((line) => line.split('|').slice(1, -1).map((cell) => cell.trim()));

if (rows.length < 27) {
  throw new Error(`Expected the full P0-P27/R0/R1 module table, found only ${rows.length} rows.`);
}

const requiredModules = [
  'AI-native', 'P0–P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10', 'P11', 'P12',
  'R0', 'R1', 'P13', 'P14', 'P15', 'P16', 'P17', 'P18', 'P19', 'P20', 'P21',
  'P22', 'P23', 'P24', 'P25', 'P26', 'P27',
];
for (const moduleName of requiredModules) {
  if (!rows.some(([module]) => module?.includes(moduleName))) {
    throw new Error(`README progress table is missing required module row: ${moduleName}`);
  }
}

for (const row of rows) {
  if (row.length !== 5) {
    throw new Error(`Malformed README module progress row: ${JSON.stringify(row)}`);
  }

  const [module, status, progress, bar, next] = row;
  if (!module || !status || !next) {
    throw new Error(`README module progress row contains an empty required cell: ${module || '<unknown>'}`);
  }

  const isPercent = /^(?:100|[0-9]{1,2})%(?: (?:impl|exec))?$/.test(progress);
  const isNonDenominated = progress === 'N/A';
  if (!isPercent && !isNonDenominated) {
    throw new Error(`Invalid progress value for ${module}: ${progress}`);
  }

  const isProgressBar = /^`[█░]{10}`$/.test(bar);
  const isNonDenominatedBar = /^`─{10}`$/.test(bar);
  if (!isProgressBar && !isNonDenominatedBar) {
    throw new Error(`Progress bar for ${module} must contain exactly 10 cells: ${bar}`);
  }

  if (isNonDenominated && !status.includes('DEFERRED') && !status.includes('IN PROGRESS')) {
    throw new Error(`N/A progress is valid only for deferred or actively non-denominated scope: ${module}`);
  }
  if (isNonDenominated && !isNonDenominatedBar) {
    throw new Error(`N/A progress must use the non-denominated bar for ${module}.`);
  }
}

function requireRow(moduleToken, expected) {
  const row = rows.find(([module]) => module?.includes(moduleToken));
  if (!row) throw new Error(`Missing required row for ${moduleToken}.`);
  const [, status, progress, , next] = row;
  if (expected.status && !status.includes(expected.status)) {
    throw new Error(`${moduleToken} status is stale: ${status}`);
  }
  if (expected.progress && progress !== expected.progress) {
    throw new Error(`${moduleToken} progress is stale: ${progress}`);
  }
  if (expected.next && !next.includes(expected.next)) {
    throw new Error(`${moduleToken} next/blocker truth is stale: ${next}`);
  }
}

requireRow('P12', { status: 'IN PROGRESS', progress: '80%' });
requireRow('P13', {
  status: 'IMPLEMENTATION COMPLETE / RUNTIME ACCEPTANCE PENDING',
  progress: '100% impl',
  next: '#159',
});
requireRow('P14', {
  status: 'IMPLEMENTATION COMPLETE / INTERNAL CONFIRMATION ACTIVATION / PRODUCTION ACCEPTANCE PENDING',
  progress: '100% impl',
  next: 'publishable release activation disabled',
});
requireRow('P15', {
  status: 'CORE FOUNDATION IN PROGRESS / CONTROLLED TARGET PROOF RETAINED',
  progress: 'N/A',
  next: '#733 terminally finalizes merged #731/#732 state before the next bounded P15 Fast Batch',
});
requireRow('P27', {
  status: 'GATE DEFINED / EXECUTION DEFERRED',
  progress: '0% exec',
  next: '#84',
});

if (!p14Qualification.includes('runtimeAdapterImplemented: true')) {
  throw new Error('P14 qualification no longer records runtimeAdapterImplemented=true; README P14 progress contract must be revised in the same material mutation.');
}
if (!p14Qualification.includes('blockers: VERTICAL_STACK_BLOCKERS') || !p14Qualification.includes('Object.freeze([] satisfies P14RecipeQualificationBlocker[])')) {
  throw new Error('P14 qualification no longer records an empty bounded-implementation blocker set; README P14 progress contract must be revised.');
}
if (!p14Qualification.includes('productionRegistryBound: true')) {
  throw new Error('P14 qualification no longer records productionRegistryBound=true; README P14 progress contract must be revised.');
}
if (!p14Qualification.includes('runtimeMutationEnabled: true') || !p14Qualification.includes('confirmationEnabled: true')) {
  throw new Error('P14 internal runtime/confirmation activation is not reflected in qualification; README P14 progress is stale.');
}
if (!p14RegistrySource.includes('createP14VerticalStackProductionRecipe()')) {
  throw new Error('P14 production registry exact vertical-stack binding is missing; README P14 progress is stale.');
}
if (!readme.includes('P14 implementation progress is 100% (6/6 bounded slices implemented)')) {
  throw new Error('README P14 bounded-slice implementation progress explanation is stale or missing.');
}
const devBuild = await readFile('scripts/build.mjs', 'utf8');
const releaseBuild = await readFile('scripts/build-release.mjs', 'utf8');
if (!devBuild.includes("__P14_INTERNAL_ACTIVATION__: 'true'") || !releaseBuild.includes("__P14_INTERNAL_ACTIVATION__: 'false'")) {
  throw new Error('P14 internal activation build split is missing; development must enable it and publishable release must hard-disable it.');
}

const p15FullWidthRequiredFragments = [
  "elementorVersion: '4.2.4'",
  "containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0'",
  "controlsStackSourceBlobSha: '00b280e518b89925c8f85a059b34136177ff3d4d'",
  "conditionRequiredValue: 'full'",
  "desktopSettingKey: 'width'",
  "tabletSettingKey: 'width_tablet'",
  "mobileSettingKey: 'width_mobile'",
  "raw.contentWidthMode !== 'full'",
  "target.settings[P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_EVIDENCE.conditionControlName] = 'full'",
];
for (const fragment of p15FullWidthRequiredFragments) {
  if (!p15ResponsiveFullWidthSource.includes(fragment)) {
    throw new Error(`P15 #659 merged responsive full-width contract is stale or missing: ${fragment}`);
  }
}
if (!readme.includes('### Completed P15 #659 verification')
  || !readme.includes('PR #660 exact head')
  || !readme.includes('Issue #659 is closed completed')
  || !readme.includes('`content_width=full`')) {
  throw new Error('README P15 #659 / PR #660 merged responsive full-width truth is stale or missing.');
}


const p15HoverBorderRadiusRequiredFragments = [
  "elementorVersion: '4.2.4'",
  "containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0'",
  "controlsStackSourceBlobSha: '00b280e518b89925c8f85a059b34136177ff3d4d'",
  "dimensionsSourceBlobSha: '7de34809d407e5fa208935b77a6b6648c72d3c5d'",
  "controlName: 'border_radius_hover'",
  "desktopSettingKey: 'border_radius_hover'",
  "tabletSettingKey: 'border_radius_hover_tablet'",
  "mobileSettingKey: 'border_radius_hover_mobile'",
  "P15_ELEMENTOR_RESPONSIVE_HOVER_BORDER_RADIUS_EVIDENCE.tabletSettingKey",
  "P15_ELEMENTOR_RESPONSIVE_HOVER_BORDER_RADIUS_EVIDENCE.mobileSettingKey",
];
for (const fragment of p15HoverBorderRadiusRequiredFragments) {
  if (!p15ResponsiveHoverBorderRadiusSource.includes(fragment)) {
    throw new Error(`P15 #663 responsive hover border-radius contract is stale or missing: ${fragment}`);
  }
}
if (!readme.includes('### Completed P15 #663 / PR #664 verification')
  || !readme.includes('5100c664cddf8fa28c7ed259d20ea7600f2a48b8')
  || !readme.includes('15b2825e45cad543fc1950ecdcc361131043113d')
  || !readme.includes('Issue #663 is closed completed')
  || !readme.includes('`border_radius_hover_tablet`')
  || !readme.includes('`border_radius_hover_mobile`')) {
  throw new Error('README P15 #663 / PR #664 merged hover border-radius truth is stale or missing.');
}

const p15FlexItemAlignSelfRequiredFragments = [
  "elementorVersion: '4.2.4'",
  "elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d'",
  "containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0'",
  "flexItemSourceBlobSha: 'dc95ad439d8f9acfd5eefb1d129da67d9ff9c13a'",
  "qunitFixtureBlobSha: 'f06c5f60afa8fbef34ed922af419284cece09692'",
  "groupName: '_flex'",
  "controlName: 'align_self'",
  "desktopSettingKey: '_flex_align_self'",
  "tabletSettingKey: '_flex_align_self_tablet'",
  "mobileSettingKey: '_flex_align_self_mobile'",
  "mapAlignSelf(resolution.tabletAlignSelf)",
  "mapAlignSelf(resolution.mobileAlignSelf)",
];
for (const fragment of p15FlexItemAlignSelfRequiredFragments) {
  if (!p15ResponsiveFlexItemAlignSelfSource.includes(fragment)) {
    throw new Error(`P15 #665 responsive flex-item align-self contract is stale or missing: ${fragment}`);
  }
}
if (!readme.includes('### Completed P15 #665 / PR #666 verification')
  || !readme.includes('5e975dcbb2142c29c58cc6c3851cb80b8a97e58f')
  || !readme.includes('e2839d8e32dab4a29db908f1ba1a1710579219af')
  || !readme.includes('Issue #665 is closed completed')
  || !readme.includes('`_flex_align_self_tablet`')
  || !readme.includes('`_flex_align_self_mobile`')) {
  throw new Error('README P15 #665 / PR #666 merged flex-item align-self truth is stale or missing.');
}

const p15FlexItemFactorsRequiredFragments = [
  "elementorVersion: '4.2.4'",
  "elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d'",
  "containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0'",
  "flexItemSourceBlobSha: 'dc95ad439d8f9acfd5eefb1d129da67d9ff9c13a'",
  "qunitFixtureBlobSha: 'f06c5f60afa8fbef34ed922af419284cece09692'",
  "growControlName: 'grow'",
  "shrinkControlName: 'shrink'",
  "tabletGrowSettingKey: '_flex_grow_tablet'",
  "mobileGrowSettingKey: '_flex_grow_mobile'",
  "tabletShrinkSettingKey: '_flex_shrink_tablet'",
  "mobileShrinkSettingKey: '_flex_shrink_mobile'",
  "acceptedFactors: [0, 1] as const",
  "validBinaryFactor",
];
for (const fragment of p15FlexItemFactorsRequiredFragments) {
  if (!p15ResponsiveFlexItemFactorsSource.includes(fragment)) {
    throw new Error(`P15 #667 responsive flex-item factor contract is stale or missing: ${fragment}`);
  }
}
if (!readme.includes('### Completed P15 #667 / PR #668 verification')
  || !readme.includes('c50627b66674d3b2d07dff23996e641742351646')
  || !readme.includes('0ce4d23aa7cd9b7ecb5c7ed0003952e465da041f')
  || !readme.includes('Issue #667 is closed completed')
  || !readme.includes('`_flex_grow_tablet`')
  || !readme.includes('`_flex_grow_mobile`')
  || !readme.includes('`_flex_shrink_tablet`')
  || !readme.includes('`_flex_shrink_mobile`')) {
  throw new Error('README P15 #667 / PR #668 merged flex-item factor truth is stale or missing.');
}

const p15FlexItemOrderPresetRequiredFragments = [
  "elementorVersion: '4.2.4'",
  "elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d'",
  "containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0'",
  "flexItemSourceBlobSha: 'dc95ad439d8f9acfd5eefb1d129da67d9ff9c13a'",
  "qunitFixtureBlobSha: 'f06c5f60afa8fbef34ed922af419284cece09692'",
  "controlName: 'order'",
  "tabletSettingKey: '_flex_order_tablet'",
  "mobileSettingKey: '_flex_order_mobile'",
  "startTargetValue: -99999",
  "endTargetValue: 99999",
  "mapOrderPreset(resolution.tabletOrderPreset)",
  "mapOrderPreset(resolution.mobileOrderPreset)",
];
for (const fragment of p15FlexItemOrderPresetRequiredFragments) {
  if (!p15ResponsiveFlexItemOrderPresetSource.includes(fragment)) {
    throw new Error(`P15 #669 responsive flex-item order preset contract is stale or missing: ${fragment}`);
  }
}
if (!readme.includes('### Completed P15 #669 / PR #670 verification')
  || !readme.includes('e244b3a2b8209d48429f454d7eaf0e4c0dd31e64')
  || !readme.includes('687bb2105ce1c407ee4977582cefc354556e0325')
  || !readme.includes('Issue #669 is closed completed')
  || !readme.includes('`_flex_order_tablet`')
  || !readme.includes('`_flex_order_mobile`')) {
  throw new Error('README P15 #669 / PR #670 merged flex-item order preset truth is stale or missing.');
}

const p15ContainerOverflowRequiredFragments = [
  "elementorVersion: '4.2.4'",
  "elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d'",
  "containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0'",
  "frontendContainerStylesSourceBlobSha: 'd6c65cb86810634c55c8b9e65aef8e9b9ef439e8'",
  "controlName: 'overflow'",
  "settingKey: 'overflow'",
  "defaultCssVariableValue: 'visible'",
  "acceptedValues: ['hidden', 'auto'] as const",
  "validOverflow",
  "target.settings[P15_ELEMENTOR_CONTAINER_OVERFLOW_EVIDENCE.settingKey] = resolution.overflow",
];
for (const fragment of p15ContainerOverflowRequiredFragments) {
  if (!p15ContainerOverflowSource.includes(fragment)) {
    throw new Error(`P15 #671 Container overflow contract is stale or missing: ${fragment}`);
  }
}
if (!readme.includes('### Completed P15 #671 / PR #672 verification')
  || !readme.includes('6454ac8ea0ef6070345a6b104513353274f3e661')
  || !readme.includes('1f8b8ed3dab7b37c7fc58169ac5d001b3c2d5deb')
  || !readme.includes('Issue #671 is closed completed')
  || !readme.includes('`overflow`')
  || !readme.includes('`hidden | auto`')) {
  throw new Error('README P15 #671 / PR #672 merged Container overflow truth is stale or missing.');
}

const p15ContainerSemanticHtmlTagRequiredFragments = [
  "elementorVersion: '4.2.4'",
  "elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d'",
  "containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0'",
  "controlName: 'html_tag'",
  "settingKey: 'html_tag'",
  "defaultTag: 'div'",
  "linkedTag: 'a'",
  "acceptedTags: ['header', 'footer', 'main', 'article', 'section', 'aside', 'nav'] as const",
  "validSemanticHtmlTag",
  "target.settings[P15_ELEMENTOR_CONTAINER_SEMANTIC_HTML_TAG_EVIDENCE.settingKey] = resolution.htmlTag",
];
for (const fragment of p15ContainerSemanticHtmlTagRequiredFragments) {
  if (!p15ContainerSemanticHtmlTagSource.includes(fragment)) {
    throw new Error(`P15 #673 Container semantic HTML tag contract is stale or missing: ${fragment}`);
  }
}
if (!readme.includes('### Completed P15 #673 / PR #674 verification')
  || !readme.includes('8c54239d33f687dd9730fc54174da115149f8d49')
  || !readme.includes('424964452fa1b0d7055103116fd19260ef856393')
  || !readme.includes('Issue #673 is closed completed')
  || !readme.includes('`html_tag`')
  || !readme.includes('`header | footer | main | article | section | aside | nav`')) {
  throw new Error('README P15 #673 / PR #674 merged semantic HTML tag truth is stale or missing.');
}

const p15HeadingTextColorRequiredFragments = [
  "elementorVersion: '4.2.4'",
  "elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d'",
  "headingSourceBlobSha: '5b193f958ba34d8d4a24d165a9114f9bc3ef2561'",
  "controlName: 'title_color'",
  "settingKey: 'title_color'",
  "hoverControlName: 'title_hover_color'",
  "acceptedColorPattern: '^#[0-9a-f]{6}$'",
  "validColor",
  "target.settings[P15_ELEMENTOR_HEADING_TEXT_COLOR_EVIDENCE.settingKey] = resolution.color",
  "colorInferencePerformed: false",
];
for (const fragment of p15HeadingTextColorRequiredFragments) {
  if (!p15HeadingTextColorSource.includes(fragment)) {
    throw new Error(`P15 #675 Heading text color contract is stale or missing: ${fragment}`);
  }
}
if (!readme.includes('### Completed P15 #675 / PR #676 verification')
  || !readme.includes('5d40e176aabf09d320c840ef0fd966997c07af83')
  || !readme.includes('1ab21408bcf32c21bdcae7ca4c6b407a0670241f')
  || !readme.includes('Issue #675 is closed completed')
  || !readme.includes('`title_color`')
  || !readme.includes('lowercase six-digit hex')) {
  throw new Error('README P15 #675 / PR #676 merged Heading text color truth is stale or missing.');
}

const p15TextEditorTextColorRequiredFragments = [
  "elementorVersion: '4.2.4'",
  "elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d'",
  "textEditorSourceBlobSha: '72ff868493a3c0f27c6305794ffcff9cf217c9ea'",
  "controlName: 'text_color'",
  "settingKey: 'text_color'",
  "linkControlName: 'link_color'",
  "acceptedColorPattern:",
  "^#[0-9a-f]{6}$",
  "validColor",
  "settings.editor !== expectedTextEditorHtml(node.text)",
  "target.settings[P15_ELEMENTOR_TEXT_EDITOR_TEXT_COLOR_EVIDENCE.settingKey] = resolution.color",
  "colorInferencePerformed: false",
];
for (const fragment of p15TextEditorTextColorRequiredFragments) {
  if (!p15TextEditorTextColorSource.includes(fragment)) {
    throw new Error(`P15 #677 Text Editor text color contract is stale or missing: ${fragment}`);
  }
}
if (!readme.includes('### Completed P15 #677 / PR #678 verification')
  || !readme.includes('94ee08c1a8039ea8496483419a747b2ddd637c8a')
  || !readme.includes('9ef893af8417706ef8904d1b879b91d498012e16')
  || !readme.includes('Issue #677 is closed completed')
  || !readme.includes('`text_color`')) {
  throw new Error('README P15 #677 / PR #678 merged Text Editor text color truth is stale or missing.');
}

const p15ButtonTextColorRequiredFragments = [
  "elementorVersion: '4.2.4'",
  "elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d'",
  "buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5'",
  "controlName: 'button_text_color'",
  "settingKey: 'button_text_color'",
  "hoverControlName: 'hover_color'",
  "backgroundGroupName: 'background'",
  "acceptedColorPattern:",
  "^#[0-9a-f]{6}$",
  "settings.text !== node.text",
  "function expectedButtonLink",
  "target.settings[P15_ELEMENTOR_BUTTON_TEXT_COLOR_EVIDENCE.settingKey] = resolution.color",
  "colorInferencePerformed: false",
];
for (const fragment of p15ButtonTextColorRequiredFragments) {
  if (!p15ButtonTextColorSource.includes(fragment)) {
    throw new Error(`P15 #679 Button text color contract is stale or missing: ${fragment}`);
  }
}
if (!readme.includes('### Current P15 post-PR #680 state')
  || !readme.includes('Issue #679 / PR #680 is merged and closed.')
  || !readme.includes('`button_text_color`')
  || !readme.includes('lowercase six-digit hex')
  || !readme.includes('hover/background mutation and broader inference remain out of scope')) {
  throw new Error('README P15 #679 / PR #680 merged Button text color truth is stale or missing.');
}

const p15ButtonBackgroundColorRequiredFragments = [
  "elementorVersion: '4.2.4'",
  "elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d'",
  "buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5'",
  "backgroundGroupControlSourceBlobSha: 'ac8e1a510ec663f3f428c9f564dc2c5b727435e1'",
  "groupName: 'background'",
  "backgroundTypeSettingKey: 'background_background'",
  "backgroundColorSettingKey: 'background_color'",
  "hoverGroupName: 'button_background_hover'",
  "acceptedBackgroundType: 'classic'",
  "^#[0-9a-f]{6}$",
  "P15_ELEMENTOR_BUTTON_BACKGROUND_COLOR_EVIDENCE.backgroundTypeSettingKey",
  "P15_ELEMENTOR_BUTTON_BACKGROUND_COLOR_EVIDENCE.backgroundColorSettingKey",
];
for (const fragment of p15ButtonBackgroundColorRequiredFragments) {
  if (!p15ButtonBackgroundColorSource.includes(fragment)) {
    throw new Error(`P15 #701 Button normal classic background-color contract is stale or missing: ${fragment}`);
  }
}
if (!readme.includes('### Completed P15 #701 implementation')
  || !readme.includes('Callback-safe syntax repair produced exact head')
  || !readme.includes('`background_background=classic`')
  || !readme.includes('`background_color`')
  || !readme.includes('gradients, hover background, global tokens and broader authority remain excluded')) {
  throw new Error('README P15 #701 / PR #702 Button normal classic background-color truth is stale or missing.');
}

const p15ButtonHoverTextColorRequiredFragments = [
  "elementorVersion: '4.2.4'",
  "elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d'",
  "buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5'",
  "hoverTabName: 'tab_button_hover'",
  "controlName: 'hover_color'",
  "settingKey: 'hover_color'",
  "normalTextControlName: 'button_text_color'",
  "normalBackgroundGroupName: 'background'",
  "hoverBackgroundGroupName: 'button_background_hover'",
  "P15_ELEMENTOR_BUTTON_HOVER_TEXT_COLOR_EVIDENCE.settingKey",
  "^#[0-9a-f]{6}$",
];
for (const fragment of p15ButtonHoverTextColorRequiredFragments) {
  if (!p15ButtonHoverTextColorSource.includes(fragment)) {
    throw new Error(`P15 #703 Button hover text-color contract is stale or missing: ${fragment}`);
  }
}
if (!readme.includes('### Completed P15 #703 implementation')
  || !readme.includes('final exact head `39ce33bff3a7914466b00c11932aaa8118f56336`')
  || !readme.includes('Issue #703 closed completed')
  || !readme.includes('`hover_color`')
  || !readme.includes('hover background and broader compatibility/production/download authority remain excluded')) {
  throw new Error('README P15 #703 / PR #704 merged Button hover text-color truth is stale or missing.');
}

const p15ButtonHoverBackgroundColorRequiredFragments = [
  "elementorVersion: '4.2.4'",
  "elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d'",
  "buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5'",
  "backgroundGroupControlSourceBlobSha: 'ac8e1a510ec663f3f428c9f564dc2c5b727435e1'",
  "groupName: 'button_background_hover'",
  "backgroundTypeSettingKey: 'button_background_hover_background'",
  "backgroundColorSettingKey: 'button_background_hover_color'",
  "hoverTextColorControlName: 'hover_color'",
  "normalTextColorControlName: 'button_text_color'",
  "normalBackgroundGroupName: 'background'",
  "selector: '{{WRAPPER}} .elementor-button:hover, {{WRAPPER}} .elementor-button:focus'",
  "acceptedBackgroundType: 'classic'",
  "^#[0-9a-f]{6}$",
  "P15_ELEMENTOR_BUTTON_HOVER_BACKGROUND_COLOR_EVIDENCE.backgroundTypeSettingKey",
  "P15_ELEMENTOR_BUTTON_HOVER_BACKGROUND_COLOR_EVIDENCE.backgroundColorSettingKey",
];
for (const fragment of p15ButtonHoverBackgroundColorRequiredFragments) {
  if (!p15ButtonHoverBackgroundColorSource.includes(fragment)) {
    throw new Error(`P15 #705 Button hover classic background-color contract is stale or missing: ${fragment}`);
  }
}
if (!readme.includes('### Completed P15 #705 implementation')
  || !readme.includes('exact head `34f1714da4d09dfe35cc66bddb99e934ea2645f2`')
  || !readme.includes('Issue #705 closed completed')
  || !readme.includes('`button_background_hover_background=classic`')
  || !readme.includes('`button_background_hover_color`')
  || !readme.includes('hover text, normal styling and broader authority remain excluded')) {
  throw new Error('README P15 #705 / PR #706 merged Button hover classic background-color truth is stale or missing.');
}

const p15ButtonHoverBorderColorRequiredFragments = [
  "elementorVersion: '4.2.4'",
  "elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d'",
  "buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5'",
  "hoverTabName: 'tab_button_hover'",
  "controlName: 'button_hover_border_color'",
  "settingKey: 'button_hover_border_color'",
  "hoverTextColorControlName: 'hover_color'",
  "hoverBackgroundGroupName: 'button_background_hover'",
  "hoverBoxShadowGroupName: 'button_hover_box_shadow'",
  "transitionControlName: 'button_hover_transition_duration'",
  "hoverAnimationControlName: 'hover_animation'",
  "normalBorderGroupName: 'border'",
  "buttonSelector: '{{WRAPPER}} .elementor-button:hover, {{WRAPPER}} .elementor-button:focus'",
  "cssProperty: 'border-color'",
  "^#[0-9a-f]{6}$",
  "P15_ELEMENTOR_BUTTON_HOVER_BORDER_COLOR_EVIDENCE.settingKey",
];
for (const fragment of p15ButtonHoverBorderColorRequiredFragments) {
  if (!p15ButtonHoverBorderColorSource.includes(fragment)) {
    throw new Error(`P15 #707 Button hover border-color contract is stale or missing: ${fragment}`);
  }
}
if (!readme.includes('### Completed P15 #707 implementation')
  || !readme.includes('Exact head `0fe42e9393c46815fc8d44ceb9c02d84468ea341`')
  || !readme.includes('Issue #707 closed completed')) {
  throw new Error('README P15 #707 / PR #708 merged Button hover border-color truth is stale or missing.');
}

const p15ButtonHoverInteractionRequiredFragments = [
  "elementorVersion: '4.2.4'",
  "buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5'",
  "groupBaseSourceBlobSha: '6117c06b286dbec336eefe63475c747e2fda0234'",
  "boxShadowGroupSourceBlobSha: '1c068c900db0ff2593089028d67fb6d897dbaa33'",
  "boxShadowControlSourceBlobSha: 'e55cf9af34db5cc3e73dc295cd9f35b437da6fa7'",
  "hoverAnimationControlSourceBlobSha: '157399fddae46264f07654bc178373a2c1050c4e'",
  "boxShadowSettingKey: 'button_hover_box_shadow_box_shadow'",
  "transitionSettingKey: 'button_hover_transition_duration'",
  "animationSettingKey: 'hover_animation'",
  "transitionSecondsMax: 10",
  "targetCompatibilityClaim: false",
  "productionAcceptance: false",
  "downloadEnabled: false",
];
for (const fragment of p15ButtonHoverInteractionRequiredFragments) {
  if (!p15ButtonHoverInteractionSource.includes(fragment)) {
    throw new Error(`P15 #709 Fast Batch hover interaction contract is stale or missing: ${fragment}`);
  }
}
if (!readme.includes('### Completed P15 Fast Batch #709 implementation')
  || !readme.includes('Final exact head `e019e903531b1d7db270df7aefe5b79851b801e9`')
  || !readme.includes('Issue #709 closed completed')) {
  throw new Error('README P15 #709 / PR #710 merged Fast Batch truth is stale or missing.');
}

const p15ButtonBorderStyleRequiredFragments = [
  "elementorVersion: '4.2.4'",
  "buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5'",
  "groupBaseSourceBlobSha: '6117c06b286dbec336eefe63475c747e2fda0234'",
  "borderGroupSourceBlobSha: 'eac53e6b1014a985d1d17f90a4044cfb0c6c33c5'",
  "dimensionsControlSourceBlobSha: '7de34809d407e5fa208935b77a6b6648c72d3c5d'",
  "controlsStackSourceBlobSha: '00b280e518b89925c8f85a059b34136177ff3d4d'",
  "borderTypeSettingKey: 'border_border'",
  "borderWidthSettingKey: 'border_width'",
  "borderColorSettingKey: 'border_color'",
  "borderWidthTabletSettingKey: 'border_width_tablet'",
  "borderWidthMobileSettingKey: 'border_width_mobile'",
  "P15_ELEMENTOR_BUTTON_BORDER_WIDTH_MAX_PX = 100",
  "targetCompatibilityClaim: false",
  "productionAcceptance: false",
  "downloadEnabled: false",
];
for (const fragment of p15ButtonBorderStyleRequiredFragments) {
  if (!p15ButtonBorderStyleSource.includes(fragment)) {
    throw new Error(`P15 #711 Fast Batch Button border contract is stale or missing: ${fragment}`);
  }
}
if (!readme.includes('### Completed P15 Fast Batch #711 implementation')
  || !readme.includes('Final exact head `56607e9a5c42071167cd84aa9d82eefef74c4a3e`')
  || !readme.includes('Issue #711 closed completed')) {
  throw new Error('README P15 #711 / PR #712 merged Button border Fast Batch truth is stale or missing.');
}

const p15ButtonVisualDepthRadiusRequiredFragments = [
  "elementorVersion: '4.2.4'",
  "buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5'",
  "groupBaseSourceBlobSha: '6117c06b286dbec336eefe63475c747e2fda0234'",
  "textShadowGroupSourceBlobSha: 'd587b60ada0e4303e8168b334354c8c04fcccd84'",
  "textShadowControlSourceBlobSha: 'c6d9615d280e20de8356a90351f95d8a36c18d2f'",
  "boxShadowGroupSourceBlobSha: '1c068c900db0ff2593089028d67fb6d897dbaa33'",
  "boxShadowControlSourceBlobSha: 'e55cf9af34db5cc3e73dc295cd9f35b437da6fa7'",
  "dimensionsControlSourceBlobSha: '7de34809d407e5fa208935b77a6b6648c72d3c5d'",
  "controlsStackSourceBlobSha: '00b280e518b89925c8f85a059b34136177ff3d4d'",
  "textShadowSettingKey: 'text_shadow_text_shadow'",
  "boxShadowSettingKey: 'button_box_shadow_box_shadow'",
  "borderRadiusDesktopSettingKey: 'border_radius'",
  "borderRadiusTabletSettingKey: 'border_radius_tablet'",
  "borderRadiusMobileSettingKey: 'border_radius_mobile'",
  "radiusMaxPx: P15_NEUTRAL_EXPORT_MAX_RADIUS_PX",
  "targetCompatibilityClaim: false",
  "productionAcceptance: false",
  "downloadEnabled: false",
];
for (const fragment of p15ButtonVisualDepthRadiusRequiredFragments) {
  if (!p15ButtonVisualDepthRadiusSource.includes(fragment)) {
    throw new Error(`P15 #713 Fast Batch Button visual-depth/radius contract is stale or missing: ${fragment}`);
  }
}
if (!readme.includes('### Completed P15 Fast Batch #713 implementation')
  || !readme.includes('Repaired final exact head `4e2cc76a309d99c8c37b73402bcd8f1f5050715d`')
  || !readme.includes('Expected-head merge produced main `f25acc0e0f1d9dc1220c20856c2a1f3d20b71b3c`; Issue #713 closed completed.')
  || !readme.includes('PR #716 repaired exact head `ac5e676867b6755382af598b9695852ed8689c2c` passed all seven required gates with 0 unresolved review threads and merged as main `d99695e8e1183f152a01a308251d2f02f086e67f`; Issue #715 closed completed.')
  || !readme.includes('`text_shadow_text_shadow`')
  || !readme.includes('`button_box_shadow_box_shadow`')
  || !readme.includes('`border_radius_tablet`')
  || !readme.includes('production acceptance and download authority remain false/out of scope')) {
  throw new Error('README P15 #713 / PR #714 merged Button visual-depth/radius Fast Batch truth is stale or missing.');
}

const p15ButtonTypographyBasicsRequiredFragments = [
  "elementorVersion: '4.2.4'",
  "elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d'",
  "buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5'",
  "typographyGroupSourceBlobSha: 'eea951b6331bd84c80e24b7fb6ab249e5c4c41a1'",
  "groupBaseSourceBlobSha: '6117c06b286dbec336eefe63475c747e2fda0234'",
  "starterSettingKey: 'typography_typography'",
  "starterValue: 'custom'",
  "fontWeightSettingKey: 'typography_font_weight'",
  "textTransformSettingKey: 'typography_text_transform'",
  "fontStyleSettingKey: 'typography_font_style'",
  "targetCompatibilityClaim: false",
  "productionAcceptance: false",
  "downloadEnabled: false",
];
for (const fragment of p15ButtonTypographyBasicsRequiredFragments) {
  if (!p15ButtonTypographyBasicsSource.includes(fragment)) {
    throw new Error(`P15 #717 Button typography basics contract is stale or missing: ${fragment}`);
  }
}
const p15ButtonResponsivePaddingRequiredFragments = [
  "elementorVersion: '4.2.4'",
  "elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d'",
  "buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5'",
  "dimensionsControlSourceBlobSha: '7de34809d407e5fa208935b77a6b6648c72d3c5d'",
  "controlsStackSourceBlobSha: '00b280e518b89925c8f85a059b34136177ff3d4d'",
  "controlName: 'text_padding'",
  "desktopSettingKey: 'text_padding'",
  "tabletSettingKey: 'text_padding_tablet'",
  "mobileSettingKey: 'text_padding_mobile'",
  "maxPx: P15_NEUTRAL_EXPORT_MAX_SPACING_PX",
  "targetCompatibilityClaim: false",
  "productionAcceptance: false",
  "downloadEnabled: false",
];
for (const fragment of p15ButtonResponsivePaddingRequiredFragments) {
  if (!p15ButtonResponsivePaddingSource.includes(fragment)) {
    throw new Error(`P15 #731 Button responsive padding contract is stale or missing: ${fragment}`);
  }
}
if (!readme.includes('### Completed P15 Fast Batch #731 / PR #732 implementation')
  || !readme.includes('Issue #731 / PR #732 completed three tightly-related Elementor 4.2.4 Button responsive padding capabilities')
  || !readme.includes('`text_padding`')
  || !readme.includes('`text_padding_tablet`')
  || !readme.includes('`text_padding_mobile`')
  || !readme.includes('finite values remain bounded to `0..4096`')
  || !readme.includes('Final exact head `8ba3ec30501bc2e6f8627d33b5c878eda6f173f0` passed all seven required gates with 0 unresolved review threads.')
  || !readme.includes('Expected-head merge produced main `d0404cfc13745f6a13f13581d8e793deefad62d5`; Issue #731 closed completed.')
  || !readme.includes('Issue #733 / PR #734 is transport-only terminal finalization.')) {
  throw new Error('README P15 #731 / PR #732 merged Button responsive padding Fast Batch truth is stale or missing.');
}

if (!readme.includes('### Completed P15 Fast Batch #727 / PR #728 implementation')
  || !readme.includes('Issue #727 / PR #728 completed four tightly-related Elementor 4.2.4 Button responsive typography capabilities')
  || !readme.includes('`typography_font_size_tablet/mobile`')
  || !readme.includes('`typography_line_height_tablet/mobile`')
  || !readme.includes('`typography_letter_spacing_tablet/mobile`')
  || !readme.includes('`typography_word_spacing_tablet/mobile`')
  || !readme.includes('Repaired exact head `98a65b5f043deea9fc2945326eeacef2be51752a` passed all seven required gates with 0 unresolved review threads.')
  || !readme.includes('Expected-head merge produced main `ceb64cfdd8a989a01ec671eb235598bdec68596f`; Issue #727 closed completed.')
  || !readme.includes('Issue #729 / PR #730 is transport-only terminal finalization.')) {
  throw new Error('README P15 #727 / PR #728 merged responsive typography Fast Batch truth is stale or missing.');
}

if (!readme.includes('### Completed P15 Fast Batch #723 / PR #724 implementation')
  || !readme.includes('Issue #723 / PR #724 completed five tightly-related Elementor 4.2.4 Button typography metrics')
  || !readme.includes('`typography_font_family`')
  || !readme.includes('`typography_font_size`')
  || !readme.includes('`typography_line_height`')
  || !readme.includes('`typography_letter_spacing`')
  || !readme.includes('`typography_word_spacing`')
  || !readme.includes('Expected-head merge produced main `c887ab4d1e39fe8ca0a2898580ba0757cedd5c90`; Issue #723 closed.')) {
  throw new Error('README P15 #723 Button typography metrics Fast Batch truth is stale or missing.');
}

if (!readme.includes('### Completed P15 Fast Batch #717 / PR #718 implementation')
  || !readme.includes('Issue #717 / PR #718 owns three tightly-related Elementor 4.2.4 Button typography capabilities')
  || !readme.includes('`typography_font_weight`')
  || !readme.includes('`typography_text_transform`')
  || !readme.includes('`typography_font_style`')
  || !readme.includes('Final exact head `747ce4312c7723e00235143510e1fc3d394aae7c` passed all seven required gates with 0 unresolved review threads.')
  || !readme.includes('Expected-head merge produced main `1cd8181cf863353c3f5e4bab7b1270156067b288`; Issue #717 closed completed.')
  || !readme.includes('PR #720 exact head `243e0aa91f7613e644bb98d6116c0ecc8aa28e0d` passed all seven required gates with 0 unresolved review threads and expected-head merge produced main `f3384739609ea68e9141f7488e924e20e5ac9d6b`; Issue #719 closed completed.')
  || !readme.includes('Canonical AI-native state is now `IDLE_READY_NEXT_P15_BATCH` with no active canonical Issue/PR.')
  || !readme.includes('Issue #721 is transport-only terminal finalization.')) {
  throw new Error('README P15 #717 Button typography basics Fast Batch truth is stale or missing.');
}

console.log(
  `README progress contract PASS: ${rows.length} stage-separated modules, no synthetic overall percentage, runtime registry ${schemaTag}.`,
);
