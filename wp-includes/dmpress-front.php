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
	}
}
add_action( 'admin_init', 'dmpress_maybe_write_front_pointer' );
