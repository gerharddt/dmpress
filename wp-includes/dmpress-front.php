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

/**
 * Resolves a front-page entry to the shape the front end consumes.
 *
 * @since DMPress 1.0.0
 *
 * @param int $entry_id Post ID, or 0.
 * @return array|null { id, type, slug, link, title } or null.
 */
function dmpress_front_entry( $entry_id ) {
	$entry_id = (int) $entry_id;

	if ( ! $entry_id ) {
		return null;
	}

	$post = get_post( $entry_id );

	if ( ! $post || 'publish' !== $post->post_status ) {
		return null;
	}

	return array(
		'id'    => $post->ID,
		'type'  => $post->post_type,
		'slug'  => $post->post_name,
		'link'  => get_permalink( $post ),
		'title' => get_the_title( $post ),
	);
}

/**
 * Registers the public front-page contract endpoint.
 *
 * The headless front end has no way to read Settings → Reading (the core
 * settings endpoint requires manage_options). This exposes just the home-page
 * choice, read-only and unauthenticated, so the front end can decide what to
 * render at "/": the latest-posts listing, or a specific published entry.
 *
 * GET wp-json/dmpress/v1/front-page →
 *   { "show": "posts"|"entry",
 *     "home":       { id, type, slug, link, title } | null,
 *     "posts_page": { id, type, slug, link, title } | null }
 *
 * @since DMPress 1.0.0
 *
 * @return void
 */
function dmpress_register_front_page_route() {
	register_rest_route(
		'dmpress/v1',
		'/front-page',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'permission_callback' => '__return_true',
			'callback'            => static function () {
				$home       = dmpress_front_entry( get_option( 'page_on_front' ) );
				$show_entry = ( 'page' === get_option( 'show_on_front' ) ) && $home;

				return array(
					'show'       => $show_entry ? 'entry' : 'posts',
					'home'       => $show_entry ? $home : null,
					'posts_page' => dmpress_front_entry( get_option( 'page_for_posts' ) ),
				);
			},
		)
	);
}
add_action( 'rest_api_init', 'dmpress_register_front_page_route' );
