<?php
/**
 * Controlled import/export probe for Elementor 4.2.4 custom Flex Item order.
 * Input values are authored by this script; no editor-generated serialization claim follows.
 */
declare(strict_types=1);

$root = getenv('P15_WP_ROOT');
if (!is_string($root) || $root === '') {
    fwrite(STDERR, "P15_WP_ROOT is required.\n");
    exit(2);
}
require $root . '/wp-load.php';
if (!defined('ELEMENTOR_VERSION') || ELEMENTOR_VERSION !== '4.2.4') {
    fwrite(STDERR, "Exact Elementor 4.2.4 is required.\n");
    exit(2);
}

$admins = get_users(['role' => 'administrator', 'number' => 1, 'fields' => 'ID']);
if (!$admins) {
    fwrite(STDERR, "Local proof administrator is unavailable.\n");
    exit(2);
}
wp_set_current_user((int) $admins[0]);
$source = \Elementor\Plugin::$instance->templates_manager->get_source('local');

$mode = $argv[1] ?? '';
if ($mode === 'export') {
    $id = filter_var($argv[2] ?? null, FILTER_VALIDATE_INT);
    if (!$id || get_post_type($id) !== 'elementor_library') {
        fwrite(STDERR, "Valid local template ID is required.\n");
        exit(2);
    }
    $source->export_template($id); // Elementor emits JSON and exits.
    exit(2);
}
if ($mode !== 'import') {
    fwrite(STDERR, "Mode must be import or export.\n");
    exit(2);
}
$outDir = $argv[2] ?? '';
$vectorPath = getenv('P15_VECTOR_PATH');
if (!is_string($outDir) || $outDir === '' || !is_dir($outDir)
    || !is_string($vectorPath) || !is_file($vectorPath)) {
    fwrite(STDERR, "Existing output directory and canonical vector are required.\n");
    exit(2);
}

$sourceData = json_decode((string) file_get_contents($vectorPath), true, 512, JSON_THROW_ON_ERROR);
if (!is_array($sourceData) || !isset($sourceData['content'][0])
    || ($sourceData['content'][0]['elType'] ?? null) !== 'container') {
    fwrite(STDERR, "Canonical vector has no root Container.\n");
    exit(2);
}
$sourceData['title'] = 'P15 Custom Order Target Roundtrip Probe';
$sourceData['content'][0]['settings']['flex_direction'] = 'column';
$cases = [
    ['id' => 'c0150001', 'tablet' => 2, 'mobile' => -2, 'title' => 'Custom Order One'],
    ['id' => 'c0150002', 'tablet' => 1, 'mobile' => 0, 'title' => 'Custom Order Two'],
];
foreach ($cases as $case) {
    $sourceData['content'][0]['elements'][] = [
        'id' => $case['id'],
        'elType' => 'container',
        'isInner' => true,
        'settings' => [
            '_flex_order_tablet' => 'custom',
            '_flex_order_custom_tablet' => $case['tablet'],
            '_flex_order_mobile' => 'custom',
            '_flex_order_custom_mobile' => $case['mobile'],
        ],
        'elements' => [[
            'id' => substr($case['id'], 0, 7) . 'a',
            'elType' => 'widget',
            'widgetType' => 'heading',
            'isInner' => false,
            'settings' => ['title' => $case['title'], 'header_size' => 'h3'],
            'elements' => [],
        ]],
    ];
}
$inputPath = $outDir . '/custom-order-input.json';
file_put_contents(
    $inputPath,
    json_encode($sourceData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR) . "\n"
);
$result = $source->import_template(basename($inputPath), $inputPath, 'match_site');
if (is_wp_error($result)) {
    fwrite(STDERR, "Elementor import failed: " . $result->get_error_code() . "\n");
    exit(1);
}
$templateId = (int) ($result[0]['template_id'] ?? 0);
if ($templateId <= 0) {
    fwrite(STDERR, "Elementor import returned no template ID.\n");
    exit(1);
}
update_option('p15_custom_order_template_id', $templateId, false);
$raw = get_post_meta($templateId, '_elementor_data', true);
$saved = is_string($raw) ? json_decode($raw, true, 512, JSON_THROW_ON_ERROR) : $raw;
if (!is_array($saved)) {
    fwrite(STDERR, "Elementor saved data is invalid.\n");
    exit(1);
}
$observed = [];
$containers = [];
$walk = static function ($nodes) use (&$walk, &$observed, &$containers, $cases): void {
    foreach ($nodes as $node) {
        if (!is_array($node)) {
            continue;
        }
        if (($node['elType'] ?? null) === 'container') {
            $settings = $node['settings'] ?? [];
            $snapshot = [
                'id' => $node['id'] ?? null,
                'tabletOrder' => $settings['_flex_order_tablet'] ?? null,
                'tabletCustom' => $settings['_flex_order_custom_tablet'] ?? null,
                'mobileOrder' => $settings['_flex_order_mobile'] ?? null,
                'mobileCustom' => $settings['_flex_order_custom_mobile'] ?? null,
            ];
            $containers[] = $snapshot;
            foreach ($cases as $case) {
                foreach (($node['elements'] ?? []) as $child) {
                    if (($child['widgetType'] ?? null) === 'heading'
                        && ($child['settings']['title'] ?? null) === $case['title']) {
                        $observed[$case['title']] = $snapshot;
                    }
                }
            }
        }
        if (isset($node['elements']) && is_array($node['elements'])) {
            $walk($node['elements']);
        }
    }
};
$walk($saved);
$matches = count($observed) === count($cases);
foreach ($cases as $case) {
    $actual = $observed[$case['title']] ?? null;
    $matches = $matches && $actual !== null
        && $actual['tabletOrder'] === 'custom'
        && $actual['tabletCustom'] === $case['tablet']
        && $actual['mobileOrder'] === 'custom'
        && $actual['mobileCustom'] === $case['mobile'];
}
$report = [
    'schema' => 'p15-elementor-424-custom-order-roundtrip-v1',
    'elementorVersion' => ELEMENTOR_VERSION,
    'templateId' => $templateId,
    'inputSha256' => 'sha256:' . hash_file('sha256', $inputPath),
    'authoredCases' => $cases,
    'savedSettings' => $observed,
    'containerSnapshots' => $containers,
    'savedSettingsMatchInput' => $matches,
    'editorValueObserved' => false,
    'editorGeneratedSerializationClaim' => false,
    'targetCompatibilityClaim' => false,
    'productionAcceptance' => false,
];
file_put_contents(
    $outDir . '/custom-order-import-observation.json',
    json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR) . "\n"
);
if (!$matches) {
    fwrite(STDERR, "Target saved settings differ from authored input.\n");
    exit(1);
}
