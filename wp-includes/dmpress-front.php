<?php
/**
 * DMPress front-end pointer.
 *
 * The headless front controller (index.php) serves the active theme's
 * front-end entry file without booting WordPress. Resolving the active theme
 * normally means reading the `stylesheet` option, which would require a
 * database connection and undo the whole point of the headless front end.
 *
 * Instead the active theme's directory is cached in a small pointer file that
 * index.php can read directly. It is rewritten whenever the theme changes.
 *
 * @package DMPress
 * @since 1.0.0
 */

/**
 * Absolute path of the pointer file read by index.php.
 */
const DMPRESS_FRONT_POINTER = WP_CONTENT_DIR . '/dmpress-front.json';

/**
 * Writes the pointer file for the active theme.
 *
 * Silently does nothing when the location is not writable — index.php falls
 * back to `front/index.html` and then to its built-in placeholder, so a
 * read-only wp-content degrades rather than breaking.
 *
 * @since DMPress 1.0.0
 *
 * @return bool True when the pointer was written.
 */
function dmpress_write_front_pointer() {
	$directory = get_stylesheet_directory();

	$pointer = wp_json_encode(
		array(
			'theme'     => get_stylesheet(),
			'directory' => $directory,
			// Whether search engines are welcome; index.php cannot read options.
			'public'    => (int) ( '1' === (string) get_option( 'blog_public' ) ),
			'site_path' => wp_parse_url( home_url( '/' ), PHP_URL_PATH ),
			'updated'   => time(),
		)
	);

	if ( ! $pointer ) {
		return false;
	}

	return (bool) @file_put_contents( DMPRESS_FRONT_POINTER, $pointer, LOCK_EX );
}

/**
 * Refreshes the pointer when the active theme changes.
 *
 * @since DMPress 1.0.0
 *
 * @return void
 */
function dmpress_refresh_front_pointer() {
	dmpress_write_front_pointer();
}
add_action( 'switch_theme', 'dmpress_refresh_front_pointer' );

/*
 * Write the pointer as part of installation.
 *
 * Without this the file first appears on the initial admin request, so a
 * freshly installed site served the built-in placeholder to visitors until
 * someone happened to open wp-admin.
 */
add_action( 'wp_install', 'dmpress_refresh_front_pointer' );

/*
 * The pointer also carries the search-engine visibility setting, so rewrite it
 * whenever that changes rather than waiting for a theme switch.
 */
add_action( 'update_option_blog_public', 'dmpress_refresh_front_pointer' );
add_action( 'add_option_blog_public', 'dmpress_refresh_front_pointer' );

/**
 * Writes the pointer on the first admin request that finds it missing.
 *
 * Covers fresh installs and any case where the file was deleted, without
 * paying a filesystem write on every request.
 *
 * @since DMPress 1.0.0
 *
 * @return void
 */
function dmpress_maybe_write_front_pointer() {
	if ( ! file_exists( DMPRESS_FRONT_POINTER ) ) {
		dmpress_write_front_pointer();
		return;
	}

	/*
	 * Refresh a pointer written before 'public' was recorded, so an existing
	 * install starts honouring the setting without needing a theme switch.
	 */
	$data = json_decode( (string) @file_get_contents( DMPRESS_FRONT_POINTER ), true );

	if ( ! is_array( $data ) || ! array_key_exists( 'public', $data ) ) {
		dmpress_write_front_pointer();
	}
}
add_action( 'admin_init', 'dmpress_maybe_write_front_pointer' );
