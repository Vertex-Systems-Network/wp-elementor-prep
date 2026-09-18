<?php
/**
 * Plugin Name: P15 V3 Runtime Render Probe
 * Description: Disposable non-authorizing frontend render endpoint for issue #483 evidence.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

add_action( 'template_redirect', function () {
    if ( ! isset( $_GET['p15_runtime_probe'] ) || '1' !== (string) $_GET['p15_runtime_probe'] ) {
        return;
    }

    $template_id = (int) get_option( 'p15_runtime_template_id', 0 );
    if ( ! $template_id || ! class_exists( '\\Elementor\\Plugin' ) ) {
        status_header( 409 );
        echo 'P15_RUNTIME_PROBE_UNAVAILABLE';
        exit;
    }

    nocache_headers();

    // Render before wp_head() so Elementor can enqueue the generated post CSS.
    $content = \Elementor\Plugin::$instance->frontend->get_builder_content_for_display( $template_id, true );

    ?><!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>P15 V3 Runtime Render Probe</title>
<?php wp_head(); ?>
<style>
body{margin:32px;font-family:system-ui,sans-serif}
#p15-runtime-root{max-width:1200px;margin:0 auto}
</style>
</head>
<body>
<main id="p15-runtime-root"><?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></main>
<?php wp_footer(); ?>
</body>
</html><?php
    exit;
}, 0 );
