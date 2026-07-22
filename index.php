<?php
/**
 * DMPress headless front controller.
 *
 * DMPress is a headless CMS: the public front end is fully decoupled from the
 * back end. Front-end page views are NOT rendered by the CMS and do not boot
 * WordPress at all, so they return instantly. Content is consumed exclusively
 * through the REST API (or other headless data methods provided by plugins).
 *
 * Request routing handled here:
 *   - REST API requests boot the CMS to serve the API and nothing else.
 *   - Every other front-end request returns an instant, WP-free response.
 *
 * The back end (wp-admin, wp-login.php, wp-cron.php, etc.) has its own entry
 * points and is unaffected by this file.
 *
 * @package DMPress
 */

/**
 * Determines whether the current request targets the REST API.
 *
 * REST requests reach this front controller either as `?rest_route=…` or,
 * when pretty permalinks rewrite `/<prefix>/…`, as a `rest_route` query var.
 * As a fallback we also match the REST prefix directly on the request path,
 * in case the web server forwards `/<prefix>/` without rewriting.
 *
 * @return bool True for REST API requests.
 */
function dmpress_is_rest_request() {
	if ( isset( $_GET['rest_route'] ) ) {
		return true;
	}

	// Default REST prefix is 'wp-json'; overridable for custom setups.
	$prefix = defined( 'DMPRESS_REST_PREFIX' ) ? DMPRESS_REST_PREFIX : 'wp-json';
	$prefix = '/' . trim( (string) $prefix, '/' );

	$path = isset( $_SERVER['REQUEST_URI'] ) ? (string) $_SERVER['REQUEST_URI'] : '';
	$path = '/' . ltrim( (string) parse_url( $path, PHP_URL_PATH ), '/' );

	return $path === $prefix || str_starts_with( $path, $prefix . '/' );
}

/*
 * Not configured yet? Hand off to WordPress.
 *
 * Without this, a site with no wp-config.php would be served the headless
 * placeholder below and the installer would be unreachable from the site root.
 * wp-load.php performs its own config lookup and redirects to
 * wp-admin/setup-config.php, so the whole setup flow is delegated to it.
 *
 * The condition mirrors wp-load.php exactly: the config may sit in this
 * directory, or one level up when that parent is not itself a WordPress root.
 */
$dmpress_has_config = file_exists( __DIR__ . '/wp-config.php' )
	|| ( @file_exists( dirname( __DIR__ ) . '/wp-config.php' ) && ! @file_exists( dirname( __DIR__ ) . '/wp-settings.php' ) );

if ( ! $dmpress_has_config ) {
	require __DIR__ . '/wp-load.php';
	return;
}

if ( dmpress_is_rest_request() ) {
	/*
	 * Boot the CMS only to serve the REST API. WP_USE_THEMES is false so the
	 * template loader never renders anything; the REST dispatch serves the
	 * response and exits during request parsing, before any front-end output.
	 */
	define( 'WP_USE_THEMES', false );
	require __DIR__ . '/wp-blog-header.php';
	return;
}

/**
 * Resolves the active theme's front-end entry file.
 *
 * The active theme is read from the pointer file written by
 * wp-includes/dmpress-front.php, so no database connection (and therefore no
 * WordPress boot) is needed here. The resolved path is confirmed to sit inside
 * the themes directory before it is served, so a tampered pointer cannot be
 * used to read files elsewhere on disk.
 *
 * @return string|false Absolute path to the entry file, or false.
 */
function dmpress_theme_front_entry() {
	$pointer = __DIR__ . '/wp-content/dmpress-front.json';

	if ( ! is_readable( $pointer ) ) {
		return false;
	}

	$data = json_decode( (string) file_get_contents( $pointer ), true );

	if ( ! is_array( $data ) || empty( $data['directory'] ) ) {
		return false;
	}

	$entry       = realpath( $data['directory'] . '/index.html' );
	$themes_root = realpath( __DIR__ . '/wp-content/themes' );

	if ( ! $entry || ! $themes_root || ! str_starts_with( $entry, $themes_root . DIRECTORY_SEPARATOR ) ) {
		return false;
	}

	return $entry;
}

/*
 * Headless front end. No WordPress is loaded.
 *
 * Entry file resolution, in order:
 *   1. The active theme's index.html — themes own the front end, so switching
 *      a theme in the admin switches what visitors see.
 *   2. `front/index.html` — a deployed application build, for setups that do
 *      not express the front end as a theme.
 *   3. A minimal placeholder pointing at the REST API.
 *
 * `{{THEME_URI}}` in a theme's index.html is replaced with the theme's public
 * URL, so its own assets can be referenced without hard-coding the theme slug.
 */
$dmpress_theme_entry = dmpress_theme_front_entry();
if ( $dmpress_theme_entry ) {
	$dmpress_theme_uri = '/wp-content/themes/' . rawurlencode( basename( dirname( $dmpress_theme_entry ) ) );

	header( 'Content-Type: text/html; charset=UTF-8' );
	echo str_replace( '{{THEME_URI}}', $dmpress_theme_uri, (string) file_get_contents( $dmpress_theme_entry ) );
	return;
}

$dmpress_front_entry = __DIR__ . '/front/index.html';
if ( is_readable( $dmpress_front_entry ) ) {
	header( 'Content-Type: text/html; charset=UTF-8' );
	readfile( $dmpress_front_entry );
	return;
}

header( 'Content-Type: text/html; charset=UTF-8' );
header( 'X-Robots-Tag: noindex, nofollow', true );
?><!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="robots" content="noindex, nofollow">
	<title>DMPress — Headless Backend</title>
	<style>
		body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f6f7f7; color: #1e1e1e; display: flex; min-height: 100vh; margin: 0; align-items: center; justify-content: center; }
		main { max-width: 34rem; padding: 2rem; text-align: center; }
		h1 { font-size: 1.5rem; margin: 0 0 .5rem; }
		p { line-height: 1.6; color: #50575e; }
		code { background: #e0e0e0; padding: .15em .4em; border-radius: 3px; font-size: .95em; }
		a { color: #3858e9; }
	</style>
</head>
<body>
	<main>
		<h1>DMPress</h1>
		<p>This is a headless CMS backend. There is no server-rendered front end.</p>
		<p>Content is available through the REST API at <code>/wp-json/</code>, and the admin area is at <code>/wp-admin/</code>.</p>
	</main>
</body>
</html>
