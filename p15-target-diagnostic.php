<?php
/**
 * Plugin Name: P15 Target Diagnostic Probe
 * Description: Disposable diagnostics for issue #483. No acceptance authority.
 * Version: 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

define( 'P15_DIAG_TOKEN', 'p15-483-diag-20260917-b9f2a1d4c8e70356' );
define( 'P15_DIAG_TITLE', 'P15 First Controlled Target Proof Vector' );

function p15_diag_token_ok() {
    return isset( $_GET['p15_diag'] )
        && is_string( $_GET['p15_diag'] )
        && hash_equals( P15_DIAG_TOKEN, sanitize_text_field( wp_unslash( $_GET['p15_diag'] ) ) );
}

function p15_diag_template_id() {
    $ids = get_posts( array(
        'post_type' => 'elementor_library',
        'post_status' => 'any',
        'numberposts' => 1,
        'orderby' => 'ID',
        'order' => 'DESC',
        'title' => P15_DIAG_TITLE,
        'fields' => 'ids',
    ) );
    return empty( $ids ) ? 0 : (int) $ids[0];
}

function p15_diag_css_content( $post_id ) {
    if ( class_exists( '\\Elementor\\Core\\Files\\CSS\\Post' ) ) {
        try {
            $css = new \Elementor\Core\Files\CSS\Post( $post_id );
            $css->update();
        } catch ( Throwable $e ) {
            // Continue with retained file if present.
        }
    }
    $upload = wp_upload_dir();
    $path = trailingslashit( $upload['basedir'] ) . 'elementor/css/post-' . $post_id . '.css';
    if ( ! is_file( $path ) || ! is_readable( $path ) ) {
        return array( 'path' => $path, 'exists' => false, 'content' => '' );
    }
    $content = file_get_contents( $path );
    return array(
        'path' => $path,
        'exists' => true,
        'content' => false === $content ? '' : $content,
    );
}

function p15_diag_document_info( $post_id ) {
    $out = array( 'class' => '', 'name' => '', 'settings' => null );
    if ( ! class_exists( '\\Elementor\\Plugin' ) ) { return $out; }
    try {
        $document = \Elementor\Plugin::$instance->documents->get( $post_id );
        if ( $document ) {
            $out['class'] = get_class( $document );
            if ( method_exists( $document, 'get_name' ) ) { $out['name'] = (string) $document->get_name(); }
            if ( method_exists( $document, 'get_settings' ) ) { $out['settings'] = $document->get_settings(); }
        }
    } catch ( Throwable $e ) {
        $out['error'] = $e->getMessage();
    }
    return $out;
}

function p15_diag_experiments() {
    $out = array();
    if ( ! class_exists( '\\Elementor\\Plugin' ) ) { return $out; }
    try {
        if ( isset( \Elementor\Plugin::$instance->experiments ) ) {
            foreach ( array( 'container', 'e_dom_optimization', 'optimized_dom_output' ) as $feature ) {
                try {
                    $out[ $feature ] = \Elementor\Plugin::$instance->experiments->is_feature_active( $feature );
                } catch ( Throwable $e ) {
                    $out[ $feature ] = 'ERROR:' . $e->getMessage();
                }
            }
        }
    } catch ( Throwable $e ) {
        $out['error'] = $e->getMessage();
    }
    return $out;
}

function p15_diag_template_redirect() {
    if ( ! p15_diag_token_ok() ) { return; }
    $post_id = p15_diag_template_id();
    nocache_headers();
    header( 'Content-Type: application/json; charset=utf-8' );
    if ( ! $post_id ) {
        status_header( 409 );
        echo wp_json_encode( array( 'error' => 'TEMPLATE_NOT_FOUND' ) );
        exit;
    }

    $raw_data = get_post_meta( $post_id, '_elementor_data', true );
    $decoded = is_string( $raw_data ) ? json_decode( $raw_data, true ) : $raw_data;
    $root = is_array( $decoded ) && isset( $decoded[0] ) && is_array( $decoded[0] ) ? $decoded[0] : null;
    $html = '';
    if ( class_exists( '\\Elementor\\Plugin' ) ) {
        try {
            $html = \Elementor\Plugin::$instance->frontend->get_builder_content_for_display( $post_id, true );
        } catch ( Throwable $e ) {
            $html = 'ERROR:' . $e->getMessage();
        }
    }

    $meta_keys = array(
        '_elementor_template_type',
        '_elementor_edit_mode',
        '_elementor_version',
        '_elementor_page_settings',
        '_elementor_css',
    );
    $meta = array();
    foreach ( $meta_keys as $key ) {
        $meta[ $key ] = get_post_meta( $post_id, $key, true );
    }

    $css = p15_diag_css_content( $post_id );
    echo wp_json_encode( array(
        'schema' => 'p15-target-diagnostic-v1',
        'postId' => $post_id,
        'title' => get_the_title( $post_id ),
        'postStatus' => get_post_status( $post_id ),
        'meta' => $meta,
        'root' => $root,
        'rawElementorData' => $raw_data,
        'document' => p15_diag_document_info( $post_id ),
        'experiments' => p15_diag_experiments(),
        'renderedHtml' => $html,
        'css' => $css,
    ), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES );
    exit;
}
add_action( 'template_redirect', 'p15_diag_template_redirect', 1 );
