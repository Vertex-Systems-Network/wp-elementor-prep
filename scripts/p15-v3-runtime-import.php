<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit( 20 );
}

if ( ! defined( 'ELEMENTOR_VERSION' ) || ELEMENTOR_VERSION !== '4.2.4' ) {
    fwrite( STDERR, 'P15_IMPORT_ERROR: Elementor 4.2.4 is not active.' . PHP_EOL );
    exit( 21 );
}

$template_path = getenv( 'P15_TEMPLATE_PATH' );
$template_id_file = getenv( 'P15_TEMPLATE_ID_FILE' );
$import_at_file = getenv( 'P15_IMPORT_AT_FILE' );

if ( ! $template_path || ! is_file( $template_path ) || ! $template_id_file || ! $import_at_file ) {
    fwrite( STDERR, 'P15_IMPORT_ERROR: required runtime paths are missing.' . PHP_EOL );
    exit( 22 );
}

$admin = get_user_by( 'login', 'p15admin' );
if ( ! $admin ) {
    fwrite( STDERR, 'P15_IMPORT_ERROR: administrator account missing.' . PHP_EOL );
    exit( 23 );
}

wp_set_current_user( (int) $admin->ID );

try {
    $source = \Elementor\Plugin::$instance->templates_manager->get_source( 'local' );
    $result = $source->import_template( basename( $template_path ), $template_path, 'match_site' );

    if ( is_wp_error( $result ) ) {
        fwrite(
            STDERR,
            'P15_IMPORT_ERROR: ' . $result->get_error_code() . ': ' . $result->get_error_message() . PHP_EOL
        );
        exit( 24 );
    }

    $ids = get_posts( array(
        'post_type' => 'elementor_library',
        'post_status' => 'any',
        'numberposts' => 5,
        'orderby' => 'ID',
        'order' => 'DESC',
        'title' => 'P15 First Controlled Target Proof Vector',
        'fields' => 'ids',
    ) );

    if ( empty( $ids ) ) {
        fwrite( STDERR, 'P15_IMPORT_ERROR: imported template post was not found.' . PHP_EOL );
        exit( 25 );
    }

    $template_id = (int) $ids[0];
    update_option( 'p15_runtime_template_id', $template_id, false );

    file_put_contents( $template_id_file, (string) $template_id, LOCK_EX );
    file_put_contents( $import_at_file, gmdate( 'Y-m-d\TH:i:s.000\Z' ), LOCK_EX );

    echo wp_json_encode( array(
        'status' => 'PASS',
        'templateId' => $template_id,
        'elementorVersion' => ELEMENTOR_VERSION,
    ), JSON_UNESCAPED_SLASHES ) . PHP_EOL;
} catch ( Throwable $e ) {
    fwrite( STDERR, 'P15_IMPORT_ERROR: exception: ' . $e->getMessage() . PHP_EOL );
    exit( 26 );
}
