<?php
/**
 * DMPress default content types.
 *
 * DMPress does not hard-code content types into core. The familiar "Posts" type
 * ships as a *default entry in the Content-Type Builder* (Secure Custom Fields)
 * rather than as a built-in, so administrators can edit or delete it like any
 * other content type.
 *
 * The seed runs exactly once, guarded by an option. If an administrator deletes
 * the Posts type it stays deleted — this file will not recreate it.
 *
 * @package DMPress
 * @since 1.0.0
 */

/**
 * Name of the option recording that the default content types have been seeded.
 */
const DMPRESS_DEFAULT_CONTENT_TYPES_OPTION = 'dmpress_default_content_types_seeded';

/**
 * Name of the option recording that the default taxonomies have been seeded.
 *
 * Tracked separately from the post type above so that installs created before
 * the taxonomies were split out of core still receive them once.
 */
const DMPRESS_DEFAULT_TAXONOMIES_OPTION = 'dmpress_default_taxonomies_seeded';

/**
 * Returns the definition of the default "Posts" content type.
 *
 * Mirrors the feature set the built-in WordPress 'post' type had, including the
 * category and post tag taxonomies.
 *
 * @since DMPress 1.0.0
 *
 * @return array Content-Type Builder post type definition.
 */
function dmpress_default_post_content_type() {
	return array(
		'title'                 => __( 'Posts' ),
		'post_type'             => 'post',
		'active'                => 1,
		'public'                => true,
		'hierarchical'          => false,
		'show_ui'               => true,
		'show_in_menu'          => true,
		'show_in_rest'          => true,
		'rest_base'             => 'posts',
		'menu_position'         => 5,
		'menu_icon'             => 'dashicons-admin-post',
		'has_archive'           => false,
		'query_var'             => 'none',
		'delete_with_user'      => true,
		'supports'              => array(
			'title',
			'editor',
			'author',
			'thumbnail',
			'excerpt',
			'trackbacks',
			'custom-fields',
			'comments',
			'revisions',
		),
		'taxonomies'            => array( 'category', 'post_tag' ),
		'labels'                => array(
			'name'          => __( 'Posts' ),
			'singular_name' => __( 'Post' ),
		),
	);
}

/**
 * Returns the definitions of the default taxonomies.
 *
 * Mirrors the 'category' and 'post_tag' taxonomies WordPress used to register in
 * core, attached to the default Posts type. Because they are Content-Type
 * Builder entries, an administrator can rename them, deactivate them, detach
 * them from Posts, or delete them outright.
 *
 * The capabilities match the ones core used, so existing role assignments and
 * any plugin that checks `manage_categories` keep working.
 *
 * @since DMPress 1.0.0
 *
 * @return array[] List of Content-Type Builder taxonomy definitions.
 */
function dmpress_default_taxonomies() {
	return array(
		array(
			'title'                 => __( 'Categories' ),
			'taxonomy'              => 'category',
			'object_type'           => array( 'post' ),
			'active'                => 1,
			'public'                => true,
			'hierarchical'          => true,
			'show_ui'               => true,
			'show_in_menu'          => true,
			'show_admin_column'     => true,
			'show_in_rest'          => true,
			'rest_base'             => 'categories',
			'rest_controller_class' => 'WP_REST_Terms_Controller',
			'query_var'             => 'category_name',
			'capabilities'          => array(
				'manage_terms' => 'manage_categories',
				'edit_terms'   => 'edit_categories',
				'delete_terms' => 'delete_categories',
				'assign_terms' => 'assign_categories',
			),
			'labels'                => array(
				'name'          => __( 'Categories' ),
				'singular_name' => __( 'Category' ),
			),
		),
		array(
			'title'                 => __( 'Tags' ),
			'taxonomy'              => 'post_tag',
			'object_type'           => array( 'post' ),
			'active'                => 1,
			'public'                => true,
			'hierarchical'          => false,
			'show_ui'               => true,
			'show_in_menu'          => true,
			'show_admin_column'     => true,
			'show_in_rest'          => true,
			'rest_base'             => 'tags',
			'rest_controller_class' => 'WP_REST_Terms_Controller',
			'query_var'             => 'tag',
			'capabilities'          => array(
				'manage_terms' => 'manage_post_tags',
				'edit_terms'   => 'edit_post_tags',
				'delete_terms' => 'delete_post_tags',
				'assign_terms' => 'assign_post_tags',
			),
			'labels'                => array(
				'name'          => __( 'Tags' ),
				'singular_name' => __( 'Tag' ),
			),
		),
	);
}

/**
 * Seeds the default taxonomies into the Content-Type Builder, once.
 *
 * Guarded by its own option so that an install predating the taxonomy split
 * still receives them. As with the post type, a deleted taxonomy stays deleted.
 *
 * @since DMPress 1.0.0
 *
 * @return void
 */
function dmpress_seed_default_taxonomies() {
	// Already seeded (or deliberately removed by an administrator).
	if ( get_option( DMPRESS_DEFAULT_TAXONOMIES_OPTION ) ) {
		return;
	}

	// The Content-Type Builder must be available to store the definitions.
	if ( ! function_exists( 'acf_update_internal_post_type' ) || ! function_exists( 'acf_get_internal_post_type_posts' ) ) {
		return;
	}

	// Collect the taxonomy keys already defined so none are duplicated.
	$existing = array();
	foreach ( (array) acf_get_internal_post_type_posts( 'acf-taxonomy' ) as $taxonomy ) {
		if ( isset( $taxonomy['taxonomy'] ) ) {
			$existing[] = $taxonomy['taxonomy'];
		}
	}

	foreach ( dmpress_default_taxonomies() as $taxonomy ) {
		if ( ! in_array( $taxonomy['taxonomy'], $existing, true ) ) {
			acf_update_internal_post_type( $taxonomy, 'acf-taxonomy' );
		}
	}

	update_option( DMPRESS_DEFAULT_TAXONOMIES_OPTION, 1 );
}
add_action( 'admin_init', 'dmpress_seed_default_taxonomies' );

/**
 * Seeds the default content types into the Content-Type Builder, once.
 *
 * Runs on the first admin request after installation. The option guard means a
 * deleted content type is never resurrected.
 *
 * @since DMPress 1.0.0
 *
 * @return void
 */
function dmpress_seed_default_content_types() {
	// Already seeded (or deliberately removed by an administrator).
	if ( get_option( DMPRESS_DEFAULT_CONTENT_TYPES_OPTION ) ) {
		return;
	}

	// The Content-Type Builder must be available to store the definition.
	if ( ! function_exists( 'acf_update_internal_post_type' ) || ! function_exists( 'acf_get_internal_post_type_posts' ) ) {
		return;
	}

	// Never duplicate an existing definition for the same post type key.
	$exists = false;
	foreach ( (array) acf_get_internal_post_type_posts( 'acf-post-type' ) as $existing ) {
		if ( isset( $existing['post_type'] ) && 'post' === $existing['post_type'] ) {
			$exists = true;
			break;
		}
	}

	if ( ! $exists ) {
		acf_update_internal_post_type( dmpress_default_post_content_type(), 'acf-post-type' );
	}

	update_option( DMPRESS_DEFAULT_CONTENT_TYPES_OPTION, 1 );
}
add_action( 'admin_init', 'dmpress_seed_default_content_types' );

/**
 * Name of the option recording that legacy leftovers have been cleaned up.
 */
const DMPRESS_CLEANUP_OPTION = 'dmpress_cleanup_done';

/**
 * Removes data left behind by features DMPress has since removed.
 *
 * Runs once per install. New installs never create these in the first place;
 * this exists so sites created by an earlier build converge on the same state.
 *
 * @since DMPress 1.0.0
 *
 * @return void
 */
function dmpress_cleanup_removed_feature_data() {
	if ( get_option( DMPRESS_CLEANUP_OPTION ) ) {
		return;
	}

	/*
	 * SCF's Site Health collector is no longer started (see
	 * wp-includes/scf/secure-custom-fields.php). Drop the data it gathered for
	 * the removed Site Health screen, and its weekly refresh event.
	 */
	delete_option( 'acf_site_health' );

	$scheduled = wp_next_scheduled( 'acf_update_site_health_data' );
	if ( $scheduled ) {
		wp_unschedule_event( $scheduled, 'acf_update_site_health_data' );
	}

	/*
	 * The wordpress.org core check stays unscheduled (wp_version_check() is a
	 * no-op). The DMPress update channel now owns the 'update_core' transient
	 * (see wp-includes/dmpress-update.php), so it is not deleted here — only the
	 * stale wordpress.org version-check cron event is cleared.
	 */
	$version_check = wp_next_scheduled( 'wp_version_check' );
	if ( $version_check ) {
		wp_unschedule_event( $version_check, 'wp_version_check' );
	}

	update_option( DMPRESS_CLEANUP_OPTION, 1 );
}
add_action( 'admin_init', 'dmpress_cleanup_removed_feature_data' );

/**
 * Enables navigation menu support.
 *
 * Menus are a structured content object in DMPress — the `nav_menu` taxonomy
 * and its items, exposed over REST (`wp/v2/menus`, `wp/v2/menu-items`) for a
 * headless front end to consume. The admin screen `nav-menus.php` hard-requires
 * `current_theme_supports( 'menus' )`, so it is enabled here rather than left to
 * a theme — DMPress themes are metadata-only and declare nothing.
 *
 * This registers menu *management*, not theme menu *locations*: there is no
 * rendered site, so menus are addressed by id or slug through the API.
 *
 * @since DMPress 1.0.0
 *
 * @return void
 */
function dmpress_enable_menu_support() {
	add_theme_support( 'menus' );
}
add_action( 'after_setup_theme', 'dmpress_enable_menu_support' );
