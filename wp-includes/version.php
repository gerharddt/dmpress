<?php
/**
 * DMPress Version
 *
 * Contains version information for the current DMPress release.
 * DMPress is a fork of WordPress 7.0 focused on data management.
 *
 * @package DMPress
 * @since 1.0.0
 */

/**
 * The WordPress compatibility version string.
 *
 * DMPress is a fork of WordPress 7.0 and keeps reporting that version
 * internally so the plugin ecosystem keeps working: plugin "Requires at
 * least" headers, `is_wp_version_compatible()`, the wordpress.org plugin
 * and theme APIs, and WP-CLI all compare against this value. The DMPress
 * product version is `$dmpress_version` below — use that for display.
 *
 * @global string $wp_version
 */
$wp_version = '7.0';

/**
 * The DMPress product version string, used for display and cache busting of
 * DMPress-specific assets. Not used for plugin compatibility checks.
 *
 * Semantic versioning with a pre-release suffix while in beta. **Bump this on
 * every published release/push** (e.g. 1.0.0-beta.1 → 1.0.0-beta.2 → 1.0.0).
 * Leave `$wp_version` above alone — that is the WordPress compatibility
 * version the plugin ecosystem depends on.
 *
 * @global string $dmpress_version
 */
$dmpress_version = '1.0.0-beta.38';

/**
 * Holds the WordPress DB revision, increments when changes are made to the WordPress DB schema.
 *
 * @global int $wp_db_version
 */
$wp_db_version = 61833;

/**
 * Holds the TinyMCE version.
 *
 * @global string $tinymce_version
 */
$tinymce_version = '49110-20250317';

/**
 * Holds the minimum required PHP version.
 *
 * @global string $required_php_version
 */
$required_php_version = '7.4';

/**
 * Holds the names of required PHP extensions.
 *
 * @global string[] $required_php_extensions
 */
$required_php_extensions = array(
	'json',
	'hash',
);

/**
 * Holds the minimum required MySQL version.
 *
 * @global string $required_mysql_version
 */
$required_mysql_version = '5.5.5';
