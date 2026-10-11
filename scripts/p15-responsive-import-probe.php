<?php
/**
 * Recovery M4.6 responsive import probe for exact WordPress 6.8 + Elementor 4.2.4.
 *
 *   php p15-responsive-import-probe.php <responsive-template.json> <outDir>
 *
 * Imports the merged three-breakpoint template through Elementor's local source, stores its id for the render route,
 * and checks that every `_tablet` / `_mobile` / `hide_*` / `_flex_order*` setting the harness wrote survived the import.
 * Source values are authored by the harness; no editor-generated serialization or compatibility claim follows.
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

$templatePath = $argv[1] ?? '';
$outDir = $argv[2] ?? '';
if (!is_file($templatePath) || !is_dir($outDir)) {
    fwrite(STDERR, "Template and output directory are required.\n");
    exit(2);
}
$source = \Elementor\Plugin::$instance->templates_manager->get_source('local');
$result = $source->import_template('p15-responsive-template.json', $templatePath, 'match_site');
if (is_wp_error($result)) {
    fwrite(STDERR, "Elementor import failed: " . $result->get_error_code() . "\n");
    exit(1);
}
$templateId = (int) ($result[0]['template_id'] ?? 0);
if ($templateId <= 0) {
    fwrite(STDERR, "Elementor import returned no template ID.\n");
    exit(1);
}
update_option('p15_responsive_template_id', $templateId, false);
$raw = get_post_meta($templateId, '_elementor_data', true);
$saved = is_string($raw) ? json_decode($raw, true, 512, JSON_THROW_ON_ERROR) : $raw;
$expected = json_decode((string) file_get_contents($templatePath), true, 512, JSON_THROW_ON_ERROR);
$responsive = static function ($nodes, array &$out) use (&$responsive): void {
    foreach ((array) $nodes as $node) {
        if (!is_array($node)) {
            continue;
        }
        foreach ((array) ($node['settings'] ?? []) as $key => $value) {
            if (preg_match('/(_tablet|_mobile)$|^hide_(desktop|tablet|mobile)$/', (string) $key)) {
                $out[(string) ($node['id'] ?? '') . '.' . $key] = $value;
            }
        }
        $responsive($node['elements'] ?? [], $out);
    }
};
$savedKeys = [];
$expectedKeys = [];
$responsive($saved, $savedKeys);
$responsive($expected['content'] ?? [], $expectedKeys);
ksort($savedKeys);
ksort($expectedKeys);
$report = [
    'schema' => 'p15-responsive-import-observation-v1',
    'templateId' => $templateId,
    'expectedResponsiveSettings' => count($expectedKeys),
    'missing' => array_values(array_diff(array_keys($expectedKeys), array_keys($savedKeys))),
    'changed' => array_values(array_filter(array_keys($expectedKeys), static fn($key) => isset($savedKeys[$key]) && $savedKeys[$key] != $expectedKeys[$key])),
    'sourceValuesAuthoredByHarness' => true,
    'targetCompatibilityClaim' => false,
    'productionAcceptance' => false,
];
$report['responsivePreserved'] = $report['expectedResponsiveSettings'] > 0 && $report['missing'] === [] && $report['changed'] === [];
file_put_contents($outDir . '/responsive-import-observation.json', json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR) . "\n");
echo json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n";
exit($report['responsivePreserved'] ? 0 : 1);
