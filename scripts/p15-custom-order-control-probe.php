<?php
/**
 * Capture only registered Flex Item order control metadata from an actual Elementor 4.2.4 runtime.
 * This probe does not assert saved template serialization or editor-generated values.
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

$container = \Elementor\Plugin::$instance->elements_manager->get_element_types('container');
if (!$container) {
    fwrite(STDERR, "Container element is unavailable.\n");
    exit(2);
}
$controls = $container->get_controls();
$stack = $container->get_stack();
$styleControls = isset($stack['style_controls']) && is_array($stack['style_controls'])
    ? $stack['style_controls']
    : [];
$keys = [
    '_flex_order',
    '_flex_order_tablet',
    '_flex_order_mobile',
    '_flex_order_custom',
    '_flex_order_custom_tablet',
    '_flex_order_custom_mobile',
];
$observed = [];
foreach ($keys as $key) {
    $control = $controls[$key] ?? null;
    $observed[$key] = is_array($control)
        ? [
            'registered' => true,
            'type' => $control['type'] ?? null,
            'responsive' => $control['responsive'] ?? null,
            'condition' => $control['condition'] ?? null,
            'default' => $control['default'] ?? null,
            'options' => $control['options'] ?? null,
        ]
        : ['registered' => false];
}
$report = [
    'schema' => 'p15-elementor-424-flex-item-order-control-observation-v1',
    'elementorVersion' => ELEMENTOR_VERSION,
    'source' => 'runtime-container-get_controls',
    'controlCount' => count($controls),
    'registeredControlKeys' => array_keys($controls),
    'styleControlCount' => count($styleControls),
    'registeredStyleControlKeys' => array_keys($styleControls),
    'registeredFlexKeys' => array_values(array_filter(
        array_keys($controls),
        static function ($key) { return strpos((string) $key, 'flex') !== false || strpos((string) $key, 'order') !== false; }
    )),
    'controls' => $observed,
    'savedTemplateSerializationObserved' => false,
    'editorValueObserved' => false,
    'targetCompatibilityClaim' => false,
    'productionAcceptance' => false,
];

$out = $argv[1] ?? '';
if (!is_string($out) || $out === '') {
    fwrite(STDERR, "Output path is required.\n");
    exit(2);
}
$encoded = json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR) . "\n";
if (file_put_contents($out, $encoded) === false) {
    fwrite(STDERR, "Could not write control observation.\n");
    exit(2);
}
if (count($controls) === 0) {
    fwrite(STDERR, "Container returned no controls.\n");
    exit(1);
}
