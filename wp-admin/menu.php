<?php
/**
 * Build Administration Menu.
 *
 * @package WordPress
 * @subpackage Administration
 */

// Don't load directly.
if ( ! defined( 'ABSPATH' ) ) {
	die( '-1' );
}

/**
 * Constructs the admin menu.
 *
 * The elements in the array are:
 *     0: Menu item name.
 *     1: Minimum level or capability required.
 *     2: The URL of the item's file.
 *     3: Page title.
 *     4: Classes.
 *     5: ID.
 *     6: Icon for top level menu.
 *
 * @global array $menu
 */

$menu[2] = array( __( 'Dashboard' ), 'read', 'index.php', '', 'menu-top menu-top-first menu-icon-dashboard', 'menu-dashboard', 'dashicons-dashboard' );

$submenu['index.php'][0] = array( __( 'Home' ), 'read', 'index.php' );

if ( is_multisite() ) {
	$submenu['index.php'][5] = array( __( 'My Sites' ), 'read', 'my-sites.php' );
}

if ( ! is_multisite() || current_user_can( 'update_core' ) ) {
	$update_data = wp_get_update_data();
}

if ( ! is_multisite() ) {
	if ( current_user_can( 'update_core' ) ) {
		$capability = 'update_core';
	} elseif ( current_user_can( 'update_plugins' ) ) {
		$capability = 'update_plugins';
	} elseif ( current_user_can( 'update_themes' ) ) {
		$capability = 'update_themes';
	} else {
		$capability = 'update_languages';
	}

	$submenu['index.php'][10] = array(
		sprintf(
			/* translators: %s: Number of pending updates. */
			__( 'Updates %s' ),
			sprintf(
				'<span class="update-plugins count-%s"><span class="update-count">%s</span></span>',
				$update_data['counts']['total'],
				number_format_i18n( $update_data['counts']['total'] )
			)
		),
		$capability,
		'update-core.php',
	);

	unset( $capability );
}

$menu[4] = array( '', 'read', 'separator1', '', 'wp-menu-separator' );

// $menu[5] = Posts.

$menu[10] = array( __( 'Media' ), 'upload_files', 'upload.php', '', 'menu-top menu-icon-media', 'menu-media', 'dashicons-admin-media' );

	$submenu['upload.php'][5]  = array( _x( 'Library', 'media library menu item' ), 'upload_files', 'upload.php' );
	$submenu['upload.php'][10] = array( __( 'Add Media File' ), 'upload_files', 'media-new.php' );
	$submenu_index             = 15;

foreach ( get_taxonomies_for_attachments( 'objects' ) as $taxonomy ) {
	if ( ! $taxonomy->show_ui || ! $taxonomy->show_in_menu ) {
			continue;
	}

	$submenu['upload.php'][ $submenu_index++ ] = array( esc_attr( $taxonomy->labels->menu_name ), $taxonomy->cap->manage_terms, 'edit-tags.php?taxonomy=' . $taxonomy->name . '&amp;post_type=attachment' );
}

	unset( $taxonomy, $submenu_index );

$menu[15] = array( __( 'Links' ), 'manage_links', 'link-manager.php', '', 'menu-top menu-icon-links', 'menu-links', 'dashicons-admin-links' );

	$submenu['link-manager.php'][5]  = array( _x( 'All Links', 'admin menu' ), 'manage_links', 'link-manager.php' );
	$submenu['link-manager.php'][10] = array( __( 'Add Link' ), 'manage_links', 'link-add.php' );
	$submenu['link-manager.php'][15] = array( __( 'Link Categories' ), 'manage_categories', 'edit-tags.php?taxonomy=link_category' );

// $menu[20] = Pages.

/*
 * DMPress: there is no global top-level Comments menu. Comments are a
 * per-post-type feature — a "Comments" submenu is added below each post type
 * that supports comments (toggled via the Content-Type Builder). See the
 * post type menu loop below.
 */

$_wp_last_object_menu = 25; // The index of the last top-level menu in the object menu group.

$post_types = (array) get_post_types(
	array(
		'show_ui'      => true,
		'_builtin'     => false,
		'show_in_menu' => true,
	)
);
/*
 * DMPress: no post type is hard-coded as built-in. 'page' was removed entirely and
 * 'post' ships as a deletable Content-Type Builder entry, so it is only treated as
 * a leading menu item while it is actually registered.
 *
 * Because 'post' is registered by the Content-Type Builder it reports
 * `_builtin => false`, which means it also matches the query above. Dedupe the
 * merged list so it is not rendered twice; array_unique() keeps the first
 * occurrence, i.e. the $builtin one that gets the tidy edit.php URLs.
 */
$builtin    = post_type_exists( 'post' ) ? array( 'post' ) : array();

foreach ( array_unique( array_merge( $builtin, $post_types ) ) as $post_type ) {
	$post_type_obj = get_post_type_object( $post_type );

	// Check if it should be a submenu.
	if ( true !== $post_type_obj->show_in_menu ) {
		continue;
	}

	$post_type_menu_position = is_int( $post_type_obj->menu_position )
		? $post_type_obj->menu_position
		: ++$_wp_last_object_menu; // If we're to use $_wp_last_object_menu, increment it first.
	$post_type_for_id        = sanitize_html_class( $post_type );

	$menu_icon = 'dashicons-admin-post';
	if ( is_string( $post_type_obj->menu_icon ) ) {
		// Special handling for an empty div.wp-menu-image, data:image/svg+xml, and Dashicons.
		if ( 'none' === $post_type_obj->menu_icon || 'div' === $post_type_obj->menu_icon
			|| str_starts_with( $post_type_obj->menu_icon, 'data:image/svg+xml;base64,' )
			|| str_starts_with( $post_type_obj->menu_icon, 'dashicons-' )
		) {
			$menu_icon = $post_type_obj->menu_icon;
		} else {
			$menu_icon = esc_url( $post_type_obj->menu_icon );
		}
	} elseif ( in_array( $post_type, $builtin, true ) ) {
		$menu_icon = 'dashicons-admin-' . $post_type;
	}

	$menu_class = 'menu-top menu-icon-' . $post_type_for_id;
	// 'post' special case.
	if ( 'post' === $post_type ) {
		$menu_class    .= ' open-if-no-js';
		$post_type_file = 'edit.php';
		$post_new_file  = 'post-new.php';
		$edit_tags_file = 'edit-tags.php?taxonomy=%s';
	} else {
		$post_type_file = "edit.php?post_type=$post_type";
		$post_new_file  = "post-new.php?post_type=$post_type";
		$edit_tags_file = "edit-tags.php?taxonomy=%s&amp;post_type=$post_type";
	}

	if ( in_array( $post_type, $builtin, true ) ) {
		$post_type_menu_id = 'menu-' . $post_type_for_id . 's';
	} else {
		$post_type_menu_id = 'menu-posts-' . $post_type_for_id;
	}

	/*
	 * If $post_type_menu_position is already populated or will be populated
	 * by a hard-coded value below, increment the position.
	 */
	$core_menu_positions = array( 59, 60, 65, 70, 75, 80, 85, 99 );
	while ( isset( $menu[ $post_type_menu_position ] ) || in_array( $post_type_menu_position, $core_menu_positions, true ) ) {
		++$post_type_menu_position;
	}

	$menu[ $post_type_menu_position ] = array( esc_attr( $post_type_obj->labels->menu_name ), $post_type_obj->cap->edit_posts, $post_type_file, '', $menu_class, $post_type_menu_id, $menu_icon );
	$submenu[ $post_type_file ][5]    = array( $post_type_obj->labels->all_items, $post_type_obj->cap->edit_posts, $post_type_file );
	$submenu[ $post_type_file ][10]   = array( $post_type_obj->labels->add_new_item, $post_type_obj->cap->create_posts, $post_new_file );

	$submenu_index = 15;

	foreach ( get_taxonomies( array(), 'objects' ) as $taxonomy ) {
		if ( ! $taxonomy->show_ui || ! $taxonomy->show_in_menu || ! in_array( $post_type, (array) $taxonomy->object_type, true ) ) {
			continue;
		}

		$submenu[ $post_type_file ][ $submenu_index++ ] = array( esc_attr( $taxonomy->labels->menu_name ), $taxonomy->cap->manage_terms, sprintf( $edit_tags_file, $taxonomy->name ) );
	}

	/*
	 * DMPress: add a Comments submenu to this post type when it supports
	 * comments (e.g. enabled via the Content-Type Builder). The list is scoped
	 * to this post type via ?post_type=.
	 */
	if ( post_type_supports( $post_type, 'comments' ) ) {
		/**
		 * Filters the label of the per-post-type Comments submenu item.
		 *
		 * Allows the "Comments" menu label to be renamed, either globally or
		 * for a specific post type.
		 *
		 * @since DMPress 1.0.0
		 *
		 * @param string $label     The menu label. Default 'Comments'.
		 * @param string $post_type The post type the Comments submenu belongs to.
		 */
		$comments_label = apply_filters( 'dmpress_comments_menu_label', __( 'Comments' ), $post_type );

		$submenu[ $post_type_file ][ $submenu_index++ ] = array(
			esc_attr( $comments_label ),
			$post_type_obj->cap->edit_posts,
			'edit-comments.php?post_type=' . $post_type,
		);
	}
}

unset( $post_type, $post_type_obj, $post_type_for_id, $post_type_menu_position, $menu_icon, $submenu_index, $taxonomy, $post_new_file );

/*
 * DMPress: highlight the correct per-post-type Comments submenu item when
 * viewing edit-comments.php scoped to a post type. The top-level parent is
 * resolved automatically via $typenow; this marks the submenu item active.
 */
add_filter(
	'submenu_file',
	static function ( $submenu_file ) {
		global $pagenow, $typenow;

		if ( 'edit-comments.php' === $pagenow && ! empty( $typenow ) && post_type_supports( $typenow, 'comments' ) ) {
			return 'edit-comments.php?post_type=' . $typenow;
		}

		return $submenu_file;
	}
);

$menu[59] = array( '', 'read', 'separator2', '', 'wp-menu-separator' );


/*
 * DMPress: consolidated "Admin" menu.
 *
 * Settings, Tools, Users and the Content-Type Builder (Secure Custom Fields)
 * live under a single top-level menu. The top-level capability is 'read' so
 * every user can still reach their Profile; each item enforces its own
 * capability, mirroring the capabilities of the former separate menus.
 */
$menu[70] = array( __( 'Admin' ), 'read', 'options-general.php', '', 'menu-top menu-icon-settings', 'menu-admin', 'dashicons-admin-generic' );

	// Settings.
	/*
	 * DMPress: this hidden first row exists only to pin the parent slug.
	 *
	 * wp-admin/includes/menu.php re-parents a top-level menu onto its FIRST
	 * submenu item whenever the two slugs differ, moving the whole submenu to a
	 * new key and orphaning anything added later (such as the Content-Type
	 * Builder, registered on admin_menu at priority 11). Keeping an anchor row
	 * with slug 'options-general.php' at index 0 means the groups below can be
	 * reordered freely without tripping that.
	 */
	$submenu['options-general.php'][0] = array( '', 'read', 'options-general.php', '', 'dmp-menu-anchor' );

	// Content Types (see the late admin_menu hook below for the builder item).
	$submenu['options-general.php'][2] = array( __( 'Content Types' ), 'read', 'edit.php?post_type=acf-field-group#dmp-group-content-types', '', 'dmp-menu-heading' );

	// Settings.
	$submenu['options-general.php'][40] = array( __( 'Settings' ), 'manage_options', 'options-general.php#dmp-group-settings', '', 'dmp-menu-heading' );
	$submenu['options-general.php'][41] = array( _x( 'General', 'settings screen' ), 'manage_options', 'options-general.php' );
	$submenu['options-general.php'][42] = array( __( 'Writing' ), 'manage_options', 'options-writing.php' );
	$submenu['options-general.php'][43] = array( __( 'Reading' ), 'manage_options', 'options-reading.php' );
	$submenu['options-general.php'][44] = array( __( 'Discussion' ), 'manage_options', 'options-discussion.php' );
	$submenu['options-general.php'][45] = array( __( 'Media' ), 'manage_options', 'options-media.php' );
	$submenu['options-general.php'][46] = array( __( 'Permalinks' ), 'manage_options', 'options-permalink.php' );

// Tools.
	$submenu['options-general.php'][50] = array( __( 'Tools' ), 'edit_posts', 'tools.php#dmp-group-tools', '', 'dmp-menu-heading' );
	$submenu['options-general.php'][51] = array( __( 'Available Tools' ), 'edit_posts', 'tools.php' );
	$submenu['options-general.php'][52] = array( __( 'Import' ), 'import', 'import.php' );
	$submenu['options-general.php'][53] = array( __( 'Export' ), 'export', 'export.php' );
	$submenu['options-general.php'][54] = array( __( 'Export Personal Data' ), 'export_others_personal_data', 'export-personal-data.php' );
	$submenu['options-general.php'][55] = array( __( 'Erase Personal Data' ), 'erase_others_personal_data', 'erase-personal-data.php' );
if ( is_multisite() && ! is_main_site() && '1' !== get_site()->deleted ) {
	$submenu['options-general.php'][56] = array( __( 'Delete Site' ), 'delete_site', 'ms-delete-site.php' );
}
if ( ! is_multisite() && defined( 'WP_ALLOW_MULTISITE' ) && WP_ALLOW_MULTISITE ) {
	$submenu['options-general.php'][57] = array( __( 'Network Setup' ), 'setup_network', 'network.php' );
}

	// Users.
	$submenu['options-general.php'][30] = array( __( 'Users' ), 'read', 'users.php#dmp-group-users', '', 'dmp-menu-heading' );
	$submenu['options-general.php'][31] = array( __( 'All Users' ), 'list_users', 'users.php' );
	/*
	 * DMPress: no "Add User" item. user-new.php keeps working — it is reached
	 * from the "Add New User" button on the Users screen and by direct URL, and
	 * enforces its own capability checks.
	 */
	$submenu['options-general.php'][32] = array( __( 'Profile' ), 'read', 'profile.php' );

// Appearance.
$appearance_capability = current_user_can( 'switch_themes' ) ? 'switch_themes' : 'edit_theme_options';

$count = '';
if ( ! is_multisite() && current_user_can( 'update_themes' ) ) {
	if ( ! isset( $update_data ) ) {
		$update_data = wp_get_update_data();
	}

	$count = sprintf(
		'<span class="update-plugins count-%s"><span class="theme-count">%s</span></span>',
		$update_data['counts']['themes'],
		number_format_i18n( $update_data['counts']['themes'] )
	);
}

	$submenu['options-general.php'][10] = array( __( 'Appearance' ), $appearance_capability, 'themes.php#dmp-group-appearance', '', 'dmp-menu-heading' );
	/* translators: %s: Number of available theme updates. */
	$submenu['options-general.php'][11] = array( sprintf( __( 'Themes %s' ), $count ), $appearance_capability, 'themes.php' );

/*
 * DMPress: the Customizer and the Theme File Editor are not listed under
 * Appearance. The front end is headless, so there is no rendered site for the
 * Customizer to preview, and themes are metadata-only (a theme.json manifest)
 * so there are no template files to edit. The Header and Background items are
 * Customizer entry points and are omitted for the same reason.
 */

if ( current_theme_supports( 'menus' ) || current_theme_supports( 'widgets' ) ) {
	$submenu['options-general.php'][12] = array( __( 'Menus' ), 'edit_theme_options', 'nav-menus.php' );
}

unset( $appearance_capability );

// Plugins.
$count = '';
if ( ! is_multisite() && current_user_can( 'update_plugins' ) ) {
	if ( ! isset( $update_data ) ) {
		$update_data = wp_get_update_data();
	}
	$count = sprintf(
		'<span class="update-plugins count-%s"><span class="plugin-count">%s</span></span>',
		$update_data['counts']['plugins'],
		number_format_i18n( $update_data['counts']['plugins'] )
	);
}

	$submenu['options-general.php'][20] = array( __( 'Plugins' ), 'activate_plugins', 'plugins.php#dmp-group-plugins', '', 'dmp-menu-heading' );
	/* translators: %s: Number of available plugin updates. */
	// DMPress: labelled "All Plugins", matching "All Users" in the group above.
	$submenu['options-general.php'][21] = array( sprintf( __( 'All Plugins %s' ), $count ), 'activate_plugins', 'plugins.php' );

if ( ! is_multisite() ) {
	/*
	 * DMPress: no "Add Plugin" item. plugin-install.php keeps working — it is
	 * reached from the "Add New Plugin" button on the Plugins screen and by
	 * direct URL, and enforces its own capability checks.
	 */
	$submenu['options-general.php'][22] = array( __( 'Plugin File Editor' ), 'edit_plugins', 'plugin-editor.php' );
}

unset( $update_data );

// Highlight the Admin menu for pages that report their legacy parents.
$_wp_real_parent_file['tools.php']   = 'options-general.php';
$_wp_real_parent_file['users.php']   = 'options-general.php';
$_wp_real_parent_file['profile.php'] = 'options-general.php';
$_wp_real_parent_file['themes.php']  = 'options-general.php';
$_wp_real_parent_file['plugins.php'] = 'options-general.php';

/*
 * DMPress: relocate Secure Custom Fields under the Admin menu as a single
 * "Content-Type Builder" entry. SCF registers its own top-level menu on
 * 'admin_menu' at default priority, so this runs just after it. SCF's
 * internal screens (Post Types, Taxonomies, Tools, ...) remain registered
 * under the hidden SCF parent, which keeps SCF's own header navigation
 * intact; the filters below light up the Admin menu on those screens.
 */
add_action(
	'admin_menu',
	static function () {
		global $submenu;

		if ( ! function_exists( 'acf_get_setting' ) || ! acf_get_setting( 'show_admin' ) ) {
			return;
		}

		remove_menu_page( 'edit.php?post_type=acf-field-group' );

		/*
		 * The group heading is registered up front so the ordering does not
		 * depend on this late hook; only the builder link is added here, and
		 * the heading is re-registered with the builder's own capability.
		 */
		$submenu['options-general.php'][2] = array( __( 'Content Types' ), acf_get_setting( 'capability' ), 'edit.php?post_type=acf-field-group#dmp-group-content-types', '', 'dmp-menu-heading' );
		$submenu['options-general.php'][3] = array( __( 'Content-Type Builder' ), acf_get_setting( 'capability' ), 'edit.php?post_type=acf-field-group' );
	},
	11
);

/**
 * Determines whether the current admin screen belongs to the
 * Content-Type Builder (Secure Custom Fields).
 *
 * @return bool True on SCF screens.
 */
function _dmpress_is_ctb_screen() {
	global $typenow, $plugin_page;

	return ( is_string( $typenow ) && str_starts_with( $typenow, 'acf-' ) )
		|| ( is_string( $plugin_page ) && preg_match( '/^(acf|scf)-/', $plugin_page ) );
}

add_filter(
	'parent_file',
	static function ( $parent_file ) {
		if ( _dmpress_is_ctb_screen() ) {
			return 'options-general.php';
		}
		return $parent_file;
	}
);

/*
 * get_admin_page_parent() re-derives the parent from $submenu after the
 * 'parent_file' filter has run and would land on SCF's hidden parent slug.
 * Registering the real-parent remap late — after every add_submenu_page()
 * call has completed — points it at the Admin menu without re-parenting
 * SCF's own submenu registrations.
 */
add_action(
	'admin_menu',
	static function () {
		global $_wp_real_parent_file, $_registered_pages, $submenu;

		$ctb_parent = 'edit.php?post_type=acf-field-group';

		/*
		 * Resolve the hooknames SCF registered its plugin pages under
		 * (e.g. scf_page_acf-tools) before the remap below changes what
		 * get_plugin_page_hookname() resolves to.
		 */
		$ctb_pages = array();
		if ( ! empty( $submenu[ $ctb_parent ] ) ) {
			foreach ( $submenu[ $ctb_parent ] as $item ) {
				if ( false === strpos( $item[2], '.php' ) ) {
					$ctb_pages[ $item[2] ] = get_plugin_page_hookname( $item[2], $ctb_parent );
				}
			}
		}

		$_wp_real_parent_file[ $ctb_parent ] = 'options-general.php';

		/*
		 * Access checks and dispatch now derive remapped hooknames (e.g.
		 * settings_page_acf-tools). Register those aliases and forward
		 * their render and load actions to the hooks SCF attached to.
		 */
		foreach ( $ctb_pages as $slug => $real_hookname ) {
			$alias_hookname = get_plugin_page_hookname( $slug, $ctb_parent );

			if ( $alias_hookname === $real_hookname ) {
				continue;
			}

			$_registered_pages[ $alias_hookname ] = true;

			add_action(
				$alias_hookname,
				static function () use ( $real_hookname ) {
					do_action( $real_hookname );
				}
			);
			add_action(
				'load-' . $alias_hookname,
				static function () use ( $real_hookname ) {
					do_action( 'load-' . $real_hookname );
				}
			);
		}
	},
	9999
);

/*
 * DMPress: order the Admin submenu by its index keys.
 *
 * WordPress never sorts submenu arrays — the uksort() in
 * wp-admin/includes/menu.php applies to top-level menus only, so submenu items
 * render in the order they happen to be registered. That leaves anything added
 * on a later hook (the Content-Type Builder, third-party pages) stuck at the
 * end regardless of its index. Sorting once, after every hook has run, makes
 * the index numbers assigned above mean what they appear to mean.
 *
 * This is safe with respect to the parent-slug re-parenting described at the
 * anchor row: that loop runs before 'admin_menu' fires, so it has already seen
 * the anchor as the first item.
 */
add_action(
	'admin_menu',
	static function () {
		global $submenu;

		if ( ! empty( $submenu['options-general.php'] ) ) {
			ksort( $submenu['options-general.php'], SORT_NUMERIC );
		}
	},
	99999
);

add_filter(
	'submenu_file',
	static function ( $submenu_file ) {
		if ( _dmpress_is_ctb_screen() ) {
			return 'edit.php?post_type=acf-field-group';
		}
		return $submenu_file;
	}
);

$_wp_last_utility_menu = 80; // The index of the last top-level menu in the utility menu group.

$menu[99] = array( '', 'read', 'separator-last', '', 'wp-menu-separator' );

// Back-compat for old top-levels.
$_wp_real_parent_file['post.php']       = 'edit.php';
$_wp_real_parent_file['post-new.php']   = 'edit.php';
$_wp_real_parent_file['edit-pages.php'] = 'edit.php?post_type=page';
$_wp_real_parent_file['page-new.php']   = 'edit.php?post_type=page';
$_wp_real_parent_file['wpmu-admin.php'] = 'tools.php';
$_wp_real_parent_file['ms-admin.php']   = 'tools.php';

// Ensure backward compatibility.
$compat = array(
	'index'           => 'dashboard',
	'edit'            => 'posts',
	'post'            => 'posts',
	'upload'          => 'media',
	'link-manager'    => 'links',
	'edit-pages'      => 'pages',
	'page'            => 'pages',
	'edit-comments'   => 'comments',
	'options-general' => 'settings',
	'themes'          => 'appearance',
);

require_once ABSPATH . 'wp-admin/includes/menu.php';
