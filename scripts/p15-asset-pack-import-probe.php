<?php
/**
 * Recovery M3.6b asset-pack import probe for exact WordPress 6.8 + Elementor 4.2.4.
 *
 *   upload <packDir> <expectation.json> <uploads.json>
 *     Sideloads every asset path the pack template references into the Media Library and records
 *     { "assets/...": { "id": <attachment id>, "url": <attachment URL> } }. Each attachment gets
 *     `_elementor_source_image_hash = sha1(url)`, the meta Elementor 4.2.4 writes on images it imports itself
 *     (includes/template-library/classes/class-import-images.php blob 379eb9092ec251ba23ffaf050b98089393654b53,
 *     get_saved_image), so the relinked template import reuses the attachment instead of re-downloading it.
 *   import <relinkedTemplate.json> <outDir>
 *     Imports the relinked template through Elementor's local source and checks that every saved image /
 *     background_image reference kept its attachment id and URL.
 *
 * Source values are authored by the harness; no editor-generated serialization or compatibility claim follows.
 */
declare(strict_types=1);

$root = getenv('P15_WP_ROOT');
if (!is_string($root) || $root === '') {
    fwrite(STDERR, "P15_WP_ROOT is required.\n");
    exit(2);
}
require $root . '/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';
require_once ABSPATH . 'wp-admin/includes/image.php';
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

$mode = $argv[1] ?? '';
if ($mode === 'upload') {
    $packDir = realpath($argv[2] ?? '');
    $expectation = json_decode((string) file_get_contents($argv[3] ?? ''), true, 16, JSON_THROW_ON_ERROR);
    $outPath = $argv[4] ?? '';
    if ($packDir === false || !is_array($expectation['referencedAssetPaths'] ?? null) || $outPath === '') {
        fwrite(STDERR, "Pack directory, expectation and output path are required.\n");
        exit(2);
    }
    $uploads = [];
    foreach ($expectation['referencedAssetPaths'] as $assetPath) {
        if (!is_string($assetPath) || !preg_match('#^assets/[A-Za-z0-9@-]{1,80}\.(png|jpg|gif|webp)$#', $assetPath)) {
            fwrite(STDERR, "Unsupported asset path.\n");
            exit(2);
        }
        $source = $packDir . '/' . $assetPath;
        if (!is_file($source)) {
            fwrite(STDERR, "Missing pack asset: $assetPath\n");
            exit(1);
        }
        $tmp = wp_tempnam(basename($assetPath));
        copy($source, $tmp);
        $id = media_handle_sideload(['name' => basename($assetPath), 'tmp_name' => $tmp], 0);
        if (is_wp_error($id)) {
            fwrite(STDERR, "Sideload failed for $assetPath: " . $id->get_error_code() . "\n");
            exit(1);
        }
        $url = wp_get_attachment_url((int) $id);
        update_post_meta((int) $id, '_elementor_source_image_hash', sha1((string) $url));
        $uploads[$assetPath] = ['id' => (int) $id, 'url' => (string) $url];
    }
    file_put_contents($outPath, json_encode($uploads, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR) . "\n");
    echo json_encode(['uploaded' => count($uploads)]) . "\n";
    exit(0);
}

if ($mode !== 'import') {
    fwrite(STDERR, "Mode must be upload or import.\n");
    exit(2);
}
$templatePath = $argv[2] ?? '';
$outDir = $argv[3] ?? '';
if (!is_file($templatePath) || !is_dir($outDir)) {
    fwrite(STDERR, "Relinked template and output directory are required.\n");
    exit(2);
}
$source = \Elementor\Plugin::$instance->templates_manager->get_source('local');
$result = $source->import_template('p15-asset-pack-template.json', $templatePath, 'match_site');
if (is_wp_error($result)) {
    fwrite(STDERR, "Elementor import failed: " . $result->get_error_code() . "\n");
    exit(1);
}
$templateId = (int) ($result[0]['template_id'] ?? 0);
if ($templateId <= 0) {
    fwrite(STDERR, "Elementor import returned no template ID.\n");
    exit(1);
}
update_option('p15_asset_pack_template_id', $templateId, false);
$raw = get_post_meta($templateId, '_elementor_data', true);
$saved = is_string($raw) ? json_decode($raw, true, 512, JSON_THROW_ON_ERROR) : $raw;
$expected = json_decode((string) file_get_contents($templatePath), true, 512, JSON_THROW_ON_ERROR);
$collect = static function ($nodes, array &$out) use (&$collect): void {
    foreach ((array) $nodes as $node) {
        if (!is_array($node)) {
            continue;
        }
        foreach (['image', 'background_image'] as $key) {
            if (isset($node['settings'][$key]['url'])) {
                $out[] = ['key' => $key, 'id' => (int) ($node['settings'][$key]['id'] ?? 0), 'url' => (string) $node['settings'][$key]['url']];
            }
        }
        $collect($node['elements'] ?? [], $out);
    }
};
$savedMedia = [];
$expectedMedia = [];
$collect($saved, $savedMedia);
$collect($expected['content'] ?? [], $expectedMedia);
$report = [
    'schema' => 'p15-asset-pack-import-observation-v1',
    'templateId' => $templateId,
    'expectedMedia' => $expectedMedia,
    'savedMedia' => $savedMedia,
    'mediaPreserved' => $savedMedia === $expectedMedia && count($savedMedia) > 0,
    'sourceValuesAuthoredByHarness' => true,
    'targetCompatibilityClaim' => false,
    'productionAcceptance' => false,
];
file_put_contents($outDir . '/asset-pack-import-observation.json', json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR) . "\n");
// The full observation is also printed, so the job log shows exactly what Elementor saved (no URLs carry the token).
echo json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n";
exit($report['mediaPreserved'] ? 0 : 1);
