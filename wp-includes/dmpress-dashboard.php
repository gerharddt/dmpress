<?php
/**
 * DMPress dashboard widgets.
 *
 * WordPress's stock "At a Glance" widget was removed because it hard-coded the
 * post/page/comment counts of content types DMPress no longer registers by
 * default. This restores an equivalent built around DMPress's model: it lists
 * the *active* content types — whatever is registered through the Content-Type
 * Builder — with their published counts, each linking to the filtered list
 * screen, followed by the running DMPress version and active theme.
 *
 * @package DMPress
 * @since 1.0.0
 */

/**
 * Registers DMPress dashboard widgets.
 *
 * Runs on `wp_dashboard_setup`, which only fires in the admin, so no separate
 * admin guard is needed.
 *
 * @since DMPress 1.0.0
 *
 * @return void
 */
function dmpress_register_dashboard_widgets() {
	wp_add_dashboard_widget(
		'dashboard_right_now',
		__( 'At a Glance' ),
		'dmpress_dashboard_at_a_glance'
	);
}
add_action( 'wp_dashboard_setup', 'dmpress_register_dashboard_widgets' );

/**
 * Returns the content types shown in the At a Glance widget.
 *
 * Only *active* content types the current user can edit are included: a type
 * deactivated in the Content-Type Builder is not registered at all, so it never
 * reaches this list. The Content-Type Builder's own storage types (`acf-*`) and
 * attachments are excluded — they are configuration and media, not content.
 *
 * @since DMPress 1.0.0
 *
 * @return WP_Post_Type[] Post type objects to display.
 */
function dmpress_at_a_glance_post_types() {
	$out = array();

	foreach ( get_post_types( array( 'show_ui' => true ), 'objects' ) as $type ) {
		if ( 'attachment' === $type->name || str_starts_with( $type->name, 'acf-' ) ) {
			continue;
		}

		if ( ! current_user_can( $type->cap->edit_posts ) ) {
			continue;
		}

		$out[] = $type;
	}

	return $out;
}

/**
 * Renders the DMPress "At a Glance" dashboard widget.
 *
 * @since DMPress 1.0.0
 *
 * @return void
 */
function dmpress_dashboard_at_a_glance() {
	echo '<div class="main">';
	echo '<ul>';

	foreach ( dmpress_at_a_glance_post_types() as $type ) {
		$counts    = wp_count_posts( $type->name );
		$published = isset( $counts->publish ) ? (int) $counts->publish : 0;
		$label     = ( 1 === $published ) ? $type->labels->singular_name : $type->labels->name;

		$text = sprintf(
			/* translators: 1: Number of published entries, 2: Content type label. */
			__( '%1$s Published %2$s' ),
			number_format_i18n( $published ),
			$label
		);

		$icon = ( is_string( $type->menu_icon ) && str_starts_with( $type->menu_icon, 'dashicons-' ) )
			? $type->menu_icon
			: 'dashicons-admin-post';

		$url = add_query_arg(
			array(
				'post_status' => 'publish',
				'post_type'   => $type->name,
			),
			admin_url( 'edit.php' )
		);

		printf(
			'<li><a href="%1$s"><span class="dashicons %2$s" style="vertical-align:text-bottom;margin-right:4px;" aria-hidden="true"></span>%3$s</a></li>',
			esc_url( $url ),
			esc_attr( $icon ),
			esc_html( $text )
		);
	}

	echo '</ul>';

	// Footer: the running DMPress version and active theme.
	$version    = isset( $GLOBALS['dmpress_version'] ) ? (string) $GLOBALS['dmpress_version'] : '';
	$theme      = wp_get_theme();
	$theme_name = $theme->exists() ? $theme->display( 'Name' ) : '';

	if ( '' !== $theme_name ) {
		if ( current_user_can( 'switch_themes' ) ) {
			$theme_html = sprintf( '<a href="%1$s">%2$s</a>', esc_url( admin_url( 'themes.php' ) ), esc_html( $theme_name ) );
		} else {
			$theme_html = esc_html( $theme_name );
		}

		printf(
			'<p id="dmpress-version">' . esc_html(
				/* translators: 1: DMPress version, 2: Active theme name (linked). */
				__( 'DMPress %1$s running %2$s theme.' )
			) . '</p>',
			esc_html( $version ),
			$theme_html // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built above with esc_url()/esc_html().
		);
	} elseif ( '' !== $version ) {
		/* translators: %s: DMPress version. */
		printf( '<p id="dmpress-version">' . esc_html__( 'DMPress %s' ) . '</p>', esc_html( $version ) );
	}

	// Related info: search-engine visibility, which a headless install still honours.
	if ( current_user_can( 'manage_options' ) && '0' === (string) get_option( 'blog_public' ) ) {
		printf(
			'<p class="search-engines-info"><a href="%1$s">%2$s</a></p>',
			esc_url( admin_url( 'options-reading.php' ) ),
			esc_html__( 'Search engines discouraged' )
		);
	}

	echo '</div>';

	/*
	 * Preserve the extension points plugins hook onto the At a Glance widget, so
	 * add-ons that appended their own counts keep working.
	 */
	do_action( 'rightnow_end' );
	do_action( 'activity_box_end' );
}
