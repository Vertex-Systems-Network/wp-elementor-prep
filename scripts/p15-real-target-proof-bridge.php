<?php
/**
 * Plugin Name: P15 Real Elementor Target Proof Bridge
 * Description: Disposable non-authorizing runtime bridge for the bounded P15 target-proof line.
 * Version: 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'P15_PROOF_TITLE', 'P15 First Controlled Target Proof Vector' );
define( 'P15_ASSET_PROOF_TITLE', 'P15 URL-only Image Asset Proof Vector' );

function p15_proof_env_value( $name ) {
    $value = getenv( $name );
    return is_string( $value ) ? $value : '';
}

function p15_target_role() {
    return 'B' === strtoupper( trim( p15_proof_env_value( 'P15_TARGET_ROLE' ) ) ) ? 'B' : 'A';
}

function p15_cross_target_export_path() {
    return p15_proof_env_value( 'P15_CROSS_TARGET_EXPORT_PATH' );
}

function p15_proof_token_ok( $key ) {
    $expected = p15_proof_env_value( 'P15_PROOF_TOKEN' );
    return $expected !== ''
        && isset( $_GET[ $key ] )
        && is_string( $_GET[ $key ] )
        && hash_equals( $expected, sanitize_text_field( wp_unslash( $_GET[ $key ] ) ) );
}

function p15_proof_iso_now() {
    return gmdate( 'Y-m-d\TH:i:s.000\Z' );
}

function p15_asset_fixture_url() {
    return 'http://127.0.0.1:8081/p15-asset-fixture.png';
}

function p15_asset_is_exact_controlled_fixture_url( $host, $url ) {
    $parts = wp_parse_url( (string) $url );
    return is_array( $parts )
        && '127.0.0.1' === (string) $host
        && isset( $parts['scheme'], $parts['host'], $parts['port'], $parts['path'] )
        && 'http' === strtolower( (string) $parts['scheme'] )
        && '127.0.0.1' === (string) $parts['host']
        && 8081 === (int) $parts['port']
        && '/p15-asset-fixture.png' === (string) $parts['path']
        && empty( $parts['query'] )
        && empty( $parts['fragment'] );
}

function p15_asset_is_controlled_cross_target_source_url( $host, $url ) {
    if ( 'B' !== p15_target_role() ) {
        return false;
    }
    $parts = wp_parse_url( (string) $url );
    return is_array( $parts )
        && '127.0.0.1' === (string) $host
        && isset( $parts['scheme'], $parts['host'], $parts['port'], $parts['path'] )
        && 'http' === strtolower( (string) $parts['scheme'] )
        && '127.0.0.1' === (string) $parts['host']
        && 8080 === (int) $parts['port']
        && 0 === strpos( (string) $parts['path'], '/wp-content/uploads/' )
        && empty( $parts['query'] )
        && empty( $parts['fragment'] );
}

function p15_asset_allow_controlled_loopback( $external, $host, $url ) {
    if ( p15_asset_is_exact_controlled_fixture_url( $host, $url )
        || p15_asset_is_controlled_cross_target_source_url( $host, $url ) ) {
        return true;
    }
    return $external;
}
add_filter( 'http_request_host_is_external', 'p15_asset_allow_controlled_loopback', 10, 3 );

function p15_asset_allow_controlled_safe_port( $ports, $host, $url ) {
    if ( p15_asset_is_exact_controlled_fixture_url( $host, $url )
        || p15_asset_is_controlled_cross_target_source_url( $host, $url ) ) {
        $ports = is_array( $ports ) ? $ports : array( 80, 443, 8080 );
        if ( p15_asset_is_exact_controlled_fixture_url( $host, $url )
            && ! in_array( 8081, $ports, true ) ) {
            $ports[] = 8081;
        }
        if ( p15_asset_is_controlled_cross_target_source_url( $host, $url )
            && ! in_array( 8080, $ports, true ) ) {
            $ports[] = 8080;
        }
    }
    return $ports;
}
add_filter( 'http_allowed_safe_ports', 'p15_asset_allow_controlled_safe_port', 10, 3 );

function p15_proof_admin_id() {
    $ids = get_users( array(
        'role' => 'administrator',
        'number' => 1,
        'orderby' => 'ID',
        'order' => 'ASC',
        'fields' => 'ID',
    ) );
    return empty( $ids ) ? 0 : (int) $ids[0];
}

function p15_proof_find_template_id() {
    $ids = get_posts( array(
        'post_type' => 'elementor_library',
        'post_status' => 'any',
        'numberposts' => 10,
        'orderby' => 'ID',
        'order' => 'DESC',
        'title' => P15_PROOF_TITLE,
        'fields' => 'ids',
    ) );
    foreach ( $ids as $id ) {
        if ( 'page' === (string) get_post_meta( $id, '_elementor_template_type', true ) ) {
            return (int) $id;
        }
    }
    return 0;
}

function p15_asset_proof_find_template_id() {
    $ids = get_posts( array(
        'post_type' => 'elementor_library',
        'post_status' => 'any',
        'numberposts' => 10,
        'orderby' => 'ID',
        'order' => 'DESC',
        'title' => P15_ASSET_PROOF_TITLE,
        'fields' => 'ids',
    ) );
    foreach ( $ids as $id ) {
        if ( 'page' === (string) get_post_meta( $id, '_elementor_template_type', true ) ) {
            return (int) $id;
        }
    }
    return 0;
}

function p15_proof_import_once() {
    if ( 'B' === p15_target_role() ) {
        return;
    }
    if ( get_option( 'p15_proof_import_done' ) ) {
        return;
    }

    if ( ! defined( 'ELEMENTOR_VERSION' ) || ! class_exists( '\\Elementor\\Plugin' ) ) {
        update_option( 'p15_proof_import_result', 'ELEMENTOR_NOT_READY', false );
        return;
    }

    if ( '4.2.4' !== (string) ELEMENTOR_VERSION ) {
        update_option( 'p15_proof_import_result', 'ELEMENTOR_VERSION_MISMATCH:' . ELEMENTOR_VERSION, false );
        return;
    }

    $path = p15_proof_env_value( 'P15_VECTOR_PATH' );
    if ( $path === '' || ! is_file( $path ) || ! is_readable( $path ) ) {
        update_option( 'p15_proof_import_result', 'VECTOR_UNAVAILABLE', false );
        return;
    }

    $actual_sha = 'sha256:' . hash_file( 'sha256', $path );
    $expected_sha = p15_proof_env_value( 'P15_TEMPLATE_SHA256' );
    update_option( 'p15_proof_template_sha256', $actual_sha, false );
    if ( $expected_sha !== '' && ! hash_equals( $expected_sha, $actual_sha ) ) {
        update_option( 'p15_proof_import_result', 'VECTOR_SHA256_MISMATCH', false );
        return;
    }

    $existing = p15_proof_find_template_id();
    if ( $existing ) {
        update_option( 'p15_proof_template_id', $existing, false );
        update_option( 'p15_proof_import_result', 'PASS_EXISTING_PAGE_TEMPLATE', false );
        update_option( 'p15_proof_import_done', 1, false );
        return;
    }

    $admin_id = p15_proof_admin_id();
    if ( ! $admin_id ) {
        update_option( 'p15_proof_import_result', 'NO_ADMIN_USER', false );
        return;
    }

    $previous_user = get_current_user_id();
    wp_set_current_user( $admin_id );

    try {
        $source = \Elementor\Plugin::$instance->templates_manager->get_source( 'local' );
        $result = $source->import_template( basename( $path ), $path, 'match_site' );

        if ( is_wp_error( $result ) ) {
            update_option(
                'p15_proof_import_result',
                'FAIL:' . $result->get_error_code() . ':' . $result->get_error_message(),
                false
            );
        } else {
            $template_id = p15_proof_find_template_id();
            if ( $template_id ) {
                update_option( 'p15_proof_template_id', $template_id, false );
                update_option( 'p15_proof_import_result', 'PASS', false );
                update_option( 'p15_proof_import_observed_at', p15_proof_iso_now(), false );
                update_option( 'p15_proof_import_done', 1, false );
            } else {
                update_option( 'p15_proof_import_result', 'FAIL:NO_IMPORTED_TEMPLATE_ID', false );
            }
        }
    } catch ( Throwable $error ) {
        update_option( 'p15_proof_import_result', 'FAIL:EXCEPTION:' . $error->getMessage(), false );
    }

    wp_set_current_user( $previous_user ?: 0 );
}
add_action( 'init', 'p15_proof_import_once', 99 );

function p15_asset_proof_import_once() {
    if ( 'B' === p15_target_role() ) {
        return;
    }
    if ( get_option( 'p15_asset_proof_import_done' ) ) {
        return;
    }

    if ( ! defined( 'ELEMENTOR_VERSION' ) || ! class_exists( '\\Elementor\\Plugin' ) ) {
        update_option( 'p15_asset_proof_import_result', 'ELEMENTOR_NOT_READY', false );
        return;
    }

    if ( '4.2.4' !== (string) ELEMENTOR_VERSION ) {
        update_option( 'p15_asset_proof_import_result', 'ELEMENTOR_VERSION_MISMATCH:' . ELEMENTOR_VERSION, false );
        return;
    }

    $path = p15_proof_env_value( 'P15_ASSET_VECTOR_PATH' );
    if ( $path === '' || ! is_file( $path ) || ! is_readable( $path ) ) {
        update_option( 'p15_asset_proof_import_result', 'VECTOR_UNAVAILABLE', false );
        return;
    }

    $actual_sha = 'sha256:' . hash_file( 'sha256', $path );
    $expected_sha = p15_proof_env_value( 'P15_ASSET_TEMPLATE_SHA256' );
    update_option( 'p15_asset_proof_template_sha256', $actual_sha, false );
    if ( $expected_sha !== '' && ! hash_equals( $expected_sha, $actual_sha ) ) {
        update_option( 'p15_asset_proof_import_result', 'VECTOR_SHA256_MISMATCH', false );
        return;
    }

    $existing = p15_asset_proof_find_template_id();
    if ( $existing ) {
        update_option( 'p15_asset_proof_template_id', $existing, false );
        update_option( 'p15_asset_proof_import_result', 'PASS_EXISTING_PAGE_TEMPLATE', false );
        update_option( 'p15_asset_proof_import_done', 1, false );
        return;
    }

    $admin_id = p15_proof_admin_id();
    if ( ! $admin_id ) {
        update_option( 'p15_asset_proof_import_result', 'NO_ADMIN_USER', false );
        return;
    }

    $previous_user = get_current_user_id();
    wp_set_current_user( $admin_id );

    try {
        $source = \Elementor\Plugin::$instance->templates_manager->get_source( 'local' );
        $result = $source->import_template( basename( $path ), $path, 'match_site' );

        if ( is_wp_error( $result ) ) {
            update_option(
                'p15_asset_proof_import_result',
                'FAIL:' . $result->get_error_code() . ':' . $result->get_error_message(),
                false
            );
        } else {
            $template_id = p15_asset_proof_find_template_id();
            if ( $template_id ) {
                update_option( 'p15_asset_proof_template_id', $template_id, false );
                update_option( 'p15_asset_proof_import_result', 'PASS', false );
                update_option( 'p15_asset_proof_import_observed_at', p15_proof_iso_now(), false );
                update_option( 'p15_asset_proof_import_done', 1, false );
            } else {
                update_option( 'p15_asset_proof_import_result', 'FAIL:NO_IMPORTED_TEMPLATE_ID', false );
            }
        }
    } catch ( Throwable $error ) {
        update_option( 'p15_asset_proof_import_result', 'FAIL:EXCEPTION:' . $error->getMessage(), false );
    }

    wp_set_current_user( $previous_user ?: 0 );
}
add_action( 'init', 'p15_asset_proof_import_once', 100 );

function p15_cross_target_import_once() {
    if ( 'B' !== p15_target_role() || get_option( 'p15_cross_target_import_done' ) ) {
        return;
    }

    if ( ! defined( 'ELEMENTOR_VERSION' ) || ! class_exists( '\\Elementor\\Plugin' ) ) {
        update_option( 'p15_cross_target_import_result', 'ELEMENTOR_NOT_READY', false );
        return;
    }

    if ( '4.2.4' !== (string) ELEMENTOR_VERSION ) {
        update_option( 'p15_cross_target_import_result', 'ELEMENTOR_VERSION_MISMATCH:' . ELEMENTOR_VERSION, false );
        return;
    }

    $path = p15_cross_target_export_path();
    if ( $path === '' || ! is_file( $path ) || ! is_readable( $path ) ) {
        update_option( 'p15_cross_target_import_result', 'EXPORT_UNAVAILABLE', false );
        return;
    }

    $actual_sha = 'sha256:' . hash_file( 'sha256', $path );
    update_option( 'p15_cross_target_export_sha256', $actual_sha, false );

    $existing = p15_asset_proof_find_template_id();
    if ( $existing ) {
        update_option( 'p15_cross_target_template_id', $existing, false );
        update_option( 'p15_cross_target_import_result', 'PASS_EXISTING_PAGE_TEMPLATE', false );
        update_option( 'p15_cross_target_import_done', 1, false );
        return;
    }

    $admin_id = p15_proof_admin_id();
    if ( ! $admin_id ) {
        update_option( 'p15_cross_target_import_result', 'NO_ADMIN_USER', false );
        return;
    }

    $previous_user = get_current_user_id();
    wp_set_current_user( $admin_id );

    try {
        $source = \Elementor\Plugin::$instance->templates_manager->get_source( 'local' );
        $result = $source->import_template( basename( $path ), $path, 'match_site' );

        if ( is_wp_error( $result ) ) {
            update_option(
                'p15_cross_target_import_result',
                'FAIL:' . $result->get_error_code() . ':' . $result->get_error_message(),
                false
            );
        } else {
            $template_id = p15_asset_proof_find_template_id();
            if ( $template_id ) {
                update_option( 'p15_cross_target_template_id', $template_id, false );
                update_option( 'p15_cross_target_import_result', 'PASS', false );
                update_option( 'p15_cross_target_import_observed_at', p15_proof_iso_now(), false );
                update_option( 'p15_cross_target_import_done', 1, false );
            } else {
                update_option( 'p15_cross_target_import_result', 'FAIL:NO_IMPORTED_TEMPLATE_ID', false );
            }
        }
    } catch ( Throwable $error ) {
        update_option( 'p15_cross_target_import_result', 'FAIL:EXCEPTION:' . $error->getMessage(), false );
    }

    wp_set_current_user( $previous_user ?: 0 );
}
add_action( 'init', 'p15_cross_target_import_once', 101 );

function p15_proof_database_observation() {
    global $wpdb;
    $raw = '';
    try {
        $raw = (string) $wpdb->get_var( 'SELECT VERSION()' );
    } catch ( Throwable $error ) {
        $raw = (string) $wpdb->db_version();
    }

    $engine = false !== stripos( $raw, 'mariadb' ) ? 'MARIADB' : 'MYSQL';
    $numeric = '';
    if ( preg_match( '/(\d+(?:\.\d+){1,3})/', $raw, $matches ) ) {
        $numeric = $matches[1];
    }

    return array(
        'engine' => $engine,
        'version' => $numeric,
        'rawVersion' => $raw,
    );
}

function p15_proof_memory_limit_mb() {
    $raw = defined( 'WP_MEMORY_LIMIT' ) ? (string) WP_MEMORY_LIMIT : '';
    if ( function_exists( 'wp_convert_hr_to_bytes' ) ) {
        $bytes = wp_convert_hr_to_bytes( $raw );
        if ( is_int( $bytes ) && $bytes > 0 ) {
            return (int) floor( $bytes / 1048576 );
        }
    }
    return 0;
}

function p15_proof_plugin_observation() {
    if ( ! function_exists( 'get_plugin_data' ) ) {
        require_once ABSPATH . 'wp-admin/includes/plugin.php';
    }

    $active = (array) get_option( 'active_plugins', array() );
    $plugins = array();
    $addon_candidates = array();
    $pro_active = defined( 'ELEMENTOR_PRO_VERSION' );

    foreach ( $active as $basename ) {
        $path = WP_PLUGIN_DIR . '/' . $basename;
        $data = is_file( $path ) ? get_plugin_data( $path, false, false ) : array();
        $name = isset( $data['Name'] ) ? (string) $data['Name'] : $basename;
        $version = isset( $data['Version'] ) ? (string) $data['Version'] : '';
        $description = isset( $data['Description'] ) ? wp_strip_all_tags( (string) $data['Description'] ) : '';

        $plugins[] = array(
            'basename' => $basename,
            'name' => $name,
            'version' => $version,
        );

        if ( 0 === strpos( $basename, 'elementor-pro/' ) ) {
            $pro_active = true;
        }

        if ( 'elementor/elementor.php' !== $basename
            && 'p15-real-target-proof-bridge/p15-real-target-proof-bridge.php' !== $basename
            && false !== stripos( $name . ' ' . $description, 'elementor' ) ) {
            $addon_candidates[] = $basename;
        }
    }

    return array(
        'activePlugins' => $plugins,
        'elementorProActive' => (bool) $pro_active,
        'thirdPartyElementorAddonsActive' => ! empty( $addon_candidates ),
        'elementorAddonCandidates' => $addon_candidates,
    );
}

function p15_proof_site_identity_observation() {
    $database_name = defined( 'DB_NAME' ) ? (string) DB_NAME : '';
    return array(
        'homeUrlFingerprint' => 'sha256:' . hash( 'sha256', untrailingslashit( home_url( '/' ) ) ),
        'databaseNameFingerprint' => $database_name !== '' ? 'sha256:' . hash( 'sha256', $database_name ) : '',
    );
}

function p15_proof_environment_observation() {
    global $wp_version;

    return array(
        'wordpressVersion' => (string) $wp_version,
        'elementorVersion' => defined( 'ELEMENTOR_VERSION' ) ? (string) ELEMENTOR_VERSION : 'UNKNOWN',
        'phpVersion' => PHP_VERSION,
        'database' => p15_proof_database_observation(),
        'wordpressMemoryLimitMb' => p15_proof_memory_limit_mb(),
        'plugins' => p15_proof_plugin_observation(),
    );
}

function p15_template_first_image_url( $path ) {
    if ( $path === '' || ! is_file( $path ) || ! is_readable( $path ) ) {
        return '';
    }
    $raw = file_get_contents( $path );
    $template = is_string( $raw ) ? json_decode( $raw, true ) : null;
    if ( ! is_array( $template ) || empty( $template['content'] ) ) {
        return '';
    }

    $stack = $template['content'];
    while ( ! empty( $stack ) ) {
        $element = array_shift( $stack );
        if ( ! is_array( $element ) ) {
            continue;
        }
        if ( isset( $element['widgetType'] ) && 'image' === $element['widgetType']
            && isset( $element['settings']['image']['url'] )
            && is_string( $element['settings']['image']['url'] ) ) {
            return (string) $element['settings']['image']['url'];
        }
        if ( isset( $element['elements'] ) && is_array( $element['elements'] ) ) {
            foreach ( $element['elements'] as $child ) {
                $stack[] = $child;
            }
        }
    }
    return '';
}

function p15_template_first_image_url_fingerprint( $path ) {
    $url = p15_template_first_image_url( $path );
    return $url !== '' ? 'sha256:' . hash( 'sha256', $url ) : '';
}

function p15_asset_proof_source_fingerprint() {
    return p15_template_first_image_url_fingerprint( p15_proof_env_value( 'P15_ASSET_VECTOR_PATH' ) );
}

function p15_asset_content_integrity_observation( $media_id ) {
    $source_sha = p15_proof_env_value( 'P15_ASSET_FIXTURE_SHA256' );
    $file = $media_id > 0 ? get_attached_file( $media_id, true ) : '';
    $file_exists = is_string( $file ) && $file !== '' && is_file( $file ) && is_readable( $file );
    $target_sha = $file_exists ? hash_file( 'sha256', $file ) : false;
    $mime = $media_id > 0 ? get_post_mime_type( $media_id ) : false;
    $metadata = $media_id > 0 ? wp_get_attachment_metadata( $media_id ) : false;
    $width = is_array( $metadata ) && isset( $metadata['width'] ) ? (int) $metadata['width'] : 0;
    $height = is_array( $metadata ) && isset( $metadata['height'] ) ? (int) $metadata['height'] : 0;
    $target_fingerprint = is_string( $target_sha ) && $target_sha !== ''
        ? 'sha256:' . $target_sha
        : '';

    return array(
        'attachmentPostType' => $media_id > 0 ? (string) get_post_type( $media_id ) : '',
        'fileExists' => $file_exists,
        'sourceFixtureSha256' => $source_sha,
        'targetFileSha256' => $target_fingerprint,
        'contentSha256Matches' => $source_sha !== ''
            && $target_fingerprint !== ''
            && hash_equals( $source_sha, $target_fingerprint ),
        'mimeType' => is_string( $mime ) ? $mime : '',
        'width' => $width,
        'height' => $height,
        'imageDimensionsObserved' => $width > 0 && $height > 0,
    );
}

function p15_asset_proof_imported_media_observation( $template_id ) {
    $empty = array(
        'mediaReferenceFound' => false,
        'mediaIdPresent' => false,
        'mediaUrlFingerprint' => '',
        'sourceUrlFingerprint' => '',
        'sourceProvenanceSha1' => '',
        'sourceProvenanceMatches' => false,
        'targetManagedMediaTargetLocal' => false,
        'contentIntegrity' => p15_asset_content_integrity_observation( 0 ),
    );
    if ( ! $template_id ) {
        return $empty;
    }

    $raw = get_post_meta( $template_id, '_elementor_data', true );
    $data = is_string( $raw ) ? json_decode( $raw, true ) : $raw;
    if ( ! is_array( $data ) ) {
        return $empty;
    }

    $stack = $data;
    while ( ! empty( $stack ) ) {
        $element = array_shift( $stack );
        if ( ! is_array( $element ) ) {
            continue;
        }

        if ( isset( $element['widgetType'] ) && 'image' === $element['widgetType'] ) {
            $image = isset( $element['settings']['image'] ) && is_array( $element['settings']['image'] )
                ? $element['settings']['image']
                : array();
            $media_id = isset( $image['id'] ) ? (int) $image['id'] : 0;
            $media_url = isset( $image['url'] ) && is_string( $image['url'] ) ? $image['url'] : '';
            $source_hash = $media_id > 0
                ? (string) get_post_meta( $media_id, '_elementor_source_image_hash', true )
                : '';
            $home_parts = wp_parse_url( home_url( '/' ) );
            $media_parts = $media_url !== '' ? wp_parse_url( $media_url ) : array();
            $home_port = is_array( $home_parts ) && isset( $home_parts['port'] )
                ? (int) $home_parts['port']
                : ( is_array( $home_parts ) && isset( $home_parts['scheme'] ) && 'https' === strtolower( (string) $home_parts['scheme'] ) ? 443 : 80 );
            $media_port = is_array( $media_parts ) && isset( $media_parts['port'] )
                ? (int) $media_parts['port']
                : ( is_array( $media_parts ) && isset( $media_parts['scheme'] ) && 'https' === strtolower( (string) $media_parts['scheme'] ) ? 443 : 80 );
            return array(
                'mediaReferenceFound' => $media_url !== '',
                'mediaIdPresent' => $media_id > 0,
                'mediaUrlFingerprint' => $media_url !== '' ? 'sha256:' . hash( 'sha256', $media_url ) : '',
                'sourceUrlFingerprint' => p15_asset_proof_source_fingerprint(),
                'sourceProvenanceSha1' => $source_hash,
                'sourceProvenanceMatches' => $source_hash !== ''
                    && hash_equals( sha1( p15_asset_fixture_url() ), $source_hash ),
                'targetManagedMediaTargetLocal' => $media_url !== ''
                    && is_array( $home_parts )
                    && is_array( $media_parts )
                    && isset( $home_parts['host'], $media_parts['host'] )
                    && strtolower( (string) $home_parts['host'] ) === strtolower( (string) $media_parts['host'] )
                    && $home_port === $media_port,
                'contentIntegrity' => p15_asset_content_integrity_observation( $media_id ),
            );
        }

        if ( isset( $element['elements'] ) && is_array( $element['elements'] ) ) {
            foreach ( $element['elements'] as $child ) {
                $stack[] = $child;
            }
        }
    }

    return $empty;
}


function p15_cross_target_imported_media_observation( $template_id ) {
    $observation = p15_asset_proof_imported_media_observation( $template_id );
    $source_url = p15_template_first_image_url( p15_cross_target_export_path() );
    $source_fingerprint = $source_url !== '' ? 'sha256:' . hash( 'sha256', $source_url ) : '';
    $source_sha1 = isset( $observation['sourceProvenanceSha1'] )
        ? (string) $observation['sourceProvenanceSha1']
        : '';

    $observation['sourceUrlFingerprint'] = $source_fingerprint;
    $observation['sourceProvenanceMatches'] = $source_url !== ''
        && $source_sha1 !== ''
        && hash_equals( sha1( $source_url ), $source_sha1 );

    return $observation;
}

function p15_asset_export_prerequisites_pass( $template_id ) {
    $observation = p15_asset_proof_imported_media_observation( $template_id );
    $integrity = isset( $observation['contentIntegrity'] ) && is_array( $observation['contentIntegrity'] )
        ? $observation['contentIntegrity']
        : array();
    $canonical = p15_proof_env_value( 'P15_ASSET_FIXTURE_SHA256' );

    return $template_id > 0
        && get_option( 'p15_asset_proof_import_result', 'NOT_RUN' ) === 'PASS'
        && ! empty( $observation['mediaReferenceFound'] )
        && ! empty( $observation['mediaIdPresent'] )
        && ! empty( $observation['sourceProvenanceMatches'] )
        && ! empty( $observation['targetManagedMediaTargetLocal'] )
        && $canonical !== ''
        && isset( $integrity['sourceFixtureSha256'], $integrity['targetFileSha256'], $integrity['mimeType'], $integrity['width'], $integrity['height'] )
        && hash_equals( $canonical, (string) $integrity['sourceFixtureSha256'] )
        && hash_equals( $canonical, (string) $integrity['targetFileSha256'] )
        && 'image/png' === (string) $integrity['mimeType']
        && (int) $integrity['width'] > 0
        && (int) $integrity['height'] > 0;
}

function p15_proof_template_redirect() {
    $template_id = (int) get_option( 'p15_proof_template_id', 0 );
    $asset_template_id = (int) get_option( 'p15_asset_proof_template_id', 0 );

    if ( p15_proof_token_ok( 'p15_asset_proof_observe' ) ) {
        nocache_headers();
        header( 'Content-Type: application/json; charset=utf-8' );
        echo wp_json_encode(
            array(
                'schema' => 'p15-real-asset-runtime-observation-v1',
                'observedAt' => p15_proof_iso_now(),
                'evidenceReference' => p15_proof_env_value( 'P15_EVIDENCE_REFERENCE' ),
                'environment' => p15_proof_environment_observation(),
                'siteIdentity' => p15_proof_site_identity_observation(),
                'importResult' => get_option( 'p15_asset_proof_import_result', 'NOT_RUN' ),
                'importObservedAt' => get_option( 'p15_asset_proof_import_observed_at', 'NOT_RUN' ),
                'templateId' => $asset_template_id,
                'templateTitle' => $asset_template_id ? get_the_title( $asset_template_id ) : '',
                'templateType' => $asset_template_id ? get_post_meta( $asset_template_id, '_elementor_template_type', true ) : '',
                'templateSha256' => get_option( 'p15_asset_proof_template_sha256', '' ),
                'importedMedia' => p15_asset_proof_imported_media_observation( $asset_template_id ),
                'renderUrl' => home_url( '/?p15_asset_proof_render=' . rawurlencode( p15_proof_env_value( 'P15_PROOF_TOKEN' ) ) ),
            ),
            JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES
        );
        exit;
    }


    if ( 'A' === p15_target_role() && p15_proof_token_ok( 'p15_asset_proof_export' ) ) {
        if ( ! $asset_template_id || ! p15_asset_export_prerequisites_pass( $asset_template_id ) ) {
            status_header( 409 );
            exit( 'P15 asset export prerequisites are not satisfied.' );
        }

        $admin_id = p15_proof_admin_id();
        if ( ! $admin_id ) {
            status_header( 409 );
            exit( 'P15 administrator unavailable.' );
        }
        wp_set_current_user( $admin_id );
        $source = \Elementor\Plugin::$instance->templates_manager->get_source( 'local' );
        $source->export_template( $asset_template_id );
        exit;
    }

    if ( 'B' === p15_target_role() && p15_proof_token_ok( 'p15_cross_target_observe' ) ) {
        $cross_template_id = (int) get_option( 'p15_cross_target_template_id', 0 );
        nocache_headers();
        header( 'Content-Type: application/json; charset=utf-8' );
        echo wp_json_encode(
            array(
                'schema' => 'p15-cross-target-media-runtime-observation-v1',
                'observedAt' => p15_proof_iso_now(),
                'evidenceReference' => p15_proof_env_value( 'P15_EVIDENCE_REFERENCE' ),
                'environment' => p15_proof_environment_observation(),
                'siteIdentity' => p15_proof_site_identity_observation(),
                'importResult' => get_option( 'p15_cross_target_import_result', 'NOT_RUN' ),
                'importObservedAt' => get_option( 'p15_cross_target_import_observed_at', 'NOT_RUN' ),
                'templateId' => $cross_template_id,
                'templateTitle' => $cross_template_id ? get_the_title( $cross_template_id ) : '',
                'templateType' => $cross_template_id ? get_post_meta( $cross_template_id, '_elementor_template_type', true ) : '',
                'exportedTemplateSha256' => get_option( 'p15_cross_target_export_sha256', '' ),
                'importedMedia' => p15_cross_target_imported_media_observation( $cross_template_id ),
                'renderUrl' => home_url( '/?p15_cross_target_render=' . rawurlencode( p15_proof_env_value( 'P15_PROOF_TOKEN' ) ) ),
            ),
            JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES
        );
        exit;
    }

    if ( 'B' === p15_target_role() && p15_proof_token_ok( 'p15_cross_target_render' ) ) {
        $cross_template_id = (int) get_option( 'p15_cross_target_template_id', 0 );
        if ( ! $cross_template_id || ! class_exists( '\\Elementor\\Plugin' ) ) {
            status_header( 409 );
            exit( 'P15 cross-target render unavailable.' );
        }

        $content = \Elementor\Plugin::$instance->frontend->get_builder_content_for_display( $cross_template_id, true );
        nocache_headers();
        ?><!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>P15 Cross-Target Managed Media Render</title>
<?php wp_head(); ?>
</head>
<body>
<main id="p15-cross-target-root"><?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></main>
<?php wp_footer(); ?>
</body>
</html><?php
        exit;
    }

    if ( p15_proof_token_ok( 'p15_asset_proof_render' ) ) {
        if ( ! $asset_template_id || ! class_exists( '\\Elementor\\Plugin' ) ) {
            status_header( 409 );
            exit( 'P15 asset render unavailable.' );
        }

        $content = \Elementor\Plugin::$instance->frontend->get_builder_content_for_display( $asset_template_id, true );
        nocache_headers();
        ?><!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>P15 URL-only Image Asset Render</title>
<?php wp_head(); ?>
</head>
<body>
<main id="p15-asset-proof-root"><?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></main>
<?php wp_footer(); ?>
</body>
</html><?php
        exit;
    }

    if ( p15_proof_token_ok( 'p15_proof_observe' ) ) {
        nocache_headers();
        header( 'Content-Type: application/json; charset=utf-8' );
        echo wp_json_encode(
            array(
                'schema' => 'p15-real-runtime-observation-v1',
                'observedAt' => p15_proof_iso_now(),
                'evidenceReference' => p15_proof_env_value( 'P15_EVIDENCE_REFERENCE' ),
                'environment' => p15_proof_environment_observation(),
                'importResult' => get_option( 'p15_proof_import_result', 'NOT_RUN' ),
                'importObservedAt' => get_option( 'p15_proof_import_observed_at', 'NOT_RUN' ),
                'templateId' => $template_id,
                'templateTitle' => $template_id ? get_the_title( $template_id ) : '',
                'templateType' => $template_id ? get_post_meta( $template_id, '_elementor_template_type', true ) : '',
                'templateSha256' => get_option( 'p15_proof_template_sha256', '' ),
                'renderUrl' => home_url( '/?p15_proof_render=' . rawurlencode( p15_proof_env_value( 'P15_PROOF_TOKEN' ) ) ),
                'editorLoginUrl' => home_url( '/?p15_proof_login=' . rawurlencode( p15_proof_env_value( 'P15_PROOF_TOKEN' ) ) ),
                'editorUrl' => admin_url( 'post.php?post=' . $template_id . '&action=elementor' ),
            ),
            JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES
        );
        exit;
    }

    if ( p15_proof_token_ok( 'p15_proof_login' ) ) {
        if ( ! $template_id ) {
            status_header( 409 );
            exit( 'P15 template unavailable.' );
        }

        $admin_id = p15_proof_admin_id();
        if ( ! $admin_id ) {
            status_header( 409 );
            exit( 'P15 administrator unavailable.' );
        }

        wp_set_current_user( $admin_id );
        wp_set_auth_cookie( $admin_id, false, is_ssl() );
        wp_safe_redirect( admin_url( 'post.php?post=' . $template_id . '&action=elementor' ) );
        exit;
    }

    if ( p15_proof_token_ok( 'p15_proof_render' ) ) {
        if ( ! $template_id || ! class_exists( '\\Elementor\\Plugin' ) ) {
            status_header( 409 );
            exit( 'P15 render unavailable.' );
        }

        $content = \Elementor\Plugin::$instance->frontend->get_builder_content_for_display( $template_id, true );
        nocache_headers();
        ?><!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>P15 Real Target Render</title>
<?php wp_head(); ?>
</head>
<body>
<main id="p15-proof-root"><?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></main>
<?php wp_footer(); ?>
</body>
</html><?php
        exit;
    }
}
add_action( 'template_redirect', 'p15_proof_template_redirect', 0 );
