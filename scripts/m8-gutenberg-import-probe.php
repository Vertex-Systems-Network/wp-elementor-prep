<?php
/**
 * Recovery M8.5 import probe (disposable WordPress only). Usage:
 *   P16_WP_ROOT=<wp> php scripts/m8-gutenberg-import-probe.php <out-dir> <markup.html>...
 * For each golden markup file: server-side parse_blocks/serialize_blocks round trip (must be byte-exact), then insert a
 * published page whose post_content is exactly the markup. Writes gutenberg-import-observation.json.
 */
$root = getenv( 'P16_WP_ROOT' );
$out  = $argv[1] ?? '';
$files = array_slice( $argv, 2 );
if ( ! $root || ! $out || ! $files ) {
	fwrite( STDERR, "Usage: P16_WP_ROOT=<wp> php m8-gutenberg-import-probe.php <out-dir> <markup>...\n" );
	exit( 2 );
}
require $root . '/wp-load.php';

$observation = array(
	'schema'                   => 'p16-gutenberg-import-observation-v1',
	'wordpressVersion'         => get_bloginfo( 'version' ),
	'targetCompatibilityClaim' => false,
	'pages'                    => array(),
	'pass'                     => false,
);
$admin = get_users( array( 'role' => 'administrator', 'number' => 1 ) );
wp_set_current_user( $admin ? $admin[0]->ID : 0 );
foreach ( $files as $file ) {
	$markup = file_get_contents( $file );
	$parsed = parse_blocks( $markup );
	$names  = array();
	$walk   = function ( $blocks ) use ( &$walk, &$names ) {
		foreach ( $blocks as $block ) {
			if ( null !== $block['blockName'] ) {
				$names[] = $block['blockName'];
			}
			$walk( $block['innerBlocks'] );
		}
	};
	$walk( $parsed );
	$registry   = WP_Block_Type_Registry::get_instance();
	$unknown    = array_values( array_unique( array_filter( $names, function ( $name ) use ( $registry ) { return ! $registry->is_registered( $name ); } ) ) );
	$roundtrip  = serialize_blocks( $parsed ) === $markup;
	$post_id    = wp_insert_post( array( 'post_type' => 'page', 'post_status' => 'publish', 'post_title' => basename( $file ), 'post_content' => wp_slash( $markup ) ), true );
	$stored     = is_wp_error( $post_id ) ? null : get_post_field( 'post_content', $post_id, 'raw' );
	$observation['pages'][] = array(
		'file'                 => basename( $file ),
		'postId'               => is_wp_error( $post_id ) ? null : $post_id,
		'permalink'            => is_wp_error( $post_id ) ? null : get_permalink( $post_id ),
		'blockNames'           => array_values( array_unique( $names ) ),
		'unregisteredBlocks'   => $unknown,
		'serverRoundTrip'      => $roundtrip,
		'storedContentExact'   => $stored === $markup,
	);
}
$observation['pass'] = count( $observation['pages'] ) === count( $files ) && array_reduce(
	$observation['pages'],
	function ( $ok, $page ) { return $ok && $page['postId'] && ! $page['unregisteredBlocks'] && $page['serverRoundTrip'] && $page['storedContentExact']; },
	true
);
file_put_contents( rtrim( $out, '/' ) . '/gutenberg-import-observation.json', wp_json_encode( $observation, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES ) . "\n" );
exit( $observation['pass'] ? 0 : 1 );
