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
			'post-formats',
		),
		'taxonomies'            => array( 'category', 'post_tag' ),
		'labels'                => array(
			'name'          => __( 'Posts' ),
			'singular_name' => __( 'Post' ),
		),
	);
}

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
