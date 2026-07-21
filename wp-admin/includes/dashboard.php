<?php
/**
 * WordPress Dashboard Widget Administration Screen API
 *
 * @package WordPress
 * @subpackage Administration
 */

/**
 * Registers dashboard widgets.
 *
 * Handles POST data, sets up filters.
 *
 * @since 2.5.0
 *
 * @global array $wp_registered_widgets
 * @global array $wp_registered_widget_controls
 * @global callable[] $wp_dashboard_control_callbacks
 */
function wp_dashboard_setup() {
	global $wp_registered_widgets, $wp_registered_widget_controls, $wp_dashboard_control_callbacks;

	$screen = get_current_screen();

	/* Register Widgets and Controls */
	$wp_dashboard_control_callbacks = array();

	// Browser version
	$check_browser = wp_check_browser_version();

	if ( $check_browser && $check_browser['upgrade'] ) {
		add_filter( 'postbox_classes_dashboard_dashboard_browser_nag', 'dashboard_browser_nag_class' );

		if ( $check_browser['insecure'] ) {
			wp_add_dashboard_widget( 'dashboard_browser_nag', __( 'You are using an insecure browser!' ), 'wp_dashboard_browser_nag' );
		} else {
			wp_add_dashboard_widget( 'dashboard_browser_nag', __( 'Your browser is out of date!' ), 'wp_dashboard_browser_nag' );
		}
	}

	// PHP Version.
	$check_php = wp_check_php_version();

	if ( $check_php && current_user_can( 'update_php' ) ) {
		// If "not acceptable" the widget will be shown.
		if ( isset( $check_php['is_acceptable'] ) && ! $check_php['is_acceptable'] ) {
			add_filter( 'postbox_classes_dashboard_dashboard_php_nag', 'dashboard_php_nag_class' );

			if ( $check_php['is_lower_than_future_minimum'] ) {
				wp_add_dashboard_widget( 'dashboard_php_nag', __( 'PHP Update Required' ), 'wp_dashboard_php_nag' );
			} else {
				wp_add_dashboard_widget( 'dashboard_php_nag', __( 'PHP Update Recommended' ), 'wp_dashboard_php_nag' );
			}
		}
	}

	// Right Now.
	if ( is_blog_admin() && current_user_can( 'edit_posts' ) ) {
		wp_add_dashboard_widget( 'dashboard_right_now', __( 'At a Glance' ), 'wp_dashboard_right_now' );
	}

	if ( is_network_admin() ) {
		wp_add_dashboard_widget( 'network_dashboard_right_now', __( 'Right Now' ), 'wp_network_dashboard_right_now' );
	}

	// Activity Widget.
	if ( is_blog_admin() ) {
		wp_add_dashboard_widget( 'dashboard_activity', __( 'Activity' ), 'wp_dashboard_site_activity' );
	}

	if ( is_network_admin() ) {

		/**
		 * Fires after core widgets for the Network Admin dashboard have been registered.
		 *
		 * @since 3.1.0
		 */
		do_action( 'wp_network_dashboard_setup' );

		/**
		 * Filters the list of widgets to load for the Network Admin dashboard.
		 *
		 * @since 3.1.0
		 *
		 * @param string[] $dashboard_widgets An array of dashboard widget IDs.
		 */
		$dashboard_widgets = apply_filters( 'wp_network_dashboard_widgets', array() );
	} elseif ( is_user_admin() ) {

		/**
		 * Fires after core widgets for the User Admin dashboard have been registered.
		 *
		 * @since 3.1.0
		 */
		do_action( 'wp_user_dashboard_setup' );

		/**
		 * Filters the list of widgets to load for the User Admin dashboard.
		 *
		 * @since 3.1.0
		 *
		 * @param string[] $dashboard_widgets An array of dashboard widget IDs.
		 */
		$dashboard_widgets = apply_filters( 'wp_user_dashboard_widgets', array() );
	} else {

		/**
		 * Fires after core widgets for the admin dashboard have been registered.
		 *
		 * @since 2.5.0
		 */
		do_action( 'wp_dashboard_setup' );

		/**
		 * Filters the list of widgets to load for the admin dashboard.
		 *
		 * @since 2.5.0
		 *
		 * @param string[] $dashboard_widgets An array of dashboard widget IDs.
		 */
		$dashboard_widgets = apply_filters( 'wp_dashboard_widgets', array() );
	}

	foreach ( $dashboard_widgets as $widget_id ) {
		$name = empty( $wp_registered_widgets[ $widget_id ]['all_link'] ) ? $wp_registered_widgets[ $widget_id ]['name'] : $wp_registered_widgets[ $widget_id ]['name'] . " <a href='{$wp_registered_widgets[$widget_id]['all_link']}' class='edit-box open-box'>" . __( 'View all' ) . '</a>';
		wp_add_dashboard_widget( $widget_id, $name, $wp_registered_widgets[ $widget_id ]['callback'], $wp_registered_widget_controls[ $widget_id ]['callback'] );
	}

	if ( 'POST' === $_SERVER['REQUEST_METHOD'] && isset( $_POST['widget_id'] ) ) {
		check_admin_referer( 'edit-dashboard-widget_' . $_POST['widget_id'], 'dashboard-widget-nonce' );
		ob_start(); // Hack - but the same hack wp-admin/widgets.php uses.
		wp_dashboard_trigger_widget_control( $_POST['widget_id'] );
		ob_end_clean();
		wp_redirect( remove_query_arg( 'edit' ) );
		exit;
	}

	/** This action is documented in wp-admin/includes/meta-boxes.php */
	do_action( 'do_meta_boxes', $screen->id, 'normal', '' );

	/** This action is documented in wp-admin/includes/meta-boxes.php */
	do_action( 'do_meta_boxes', $screen->id, 'side', '' );
}

/**
 * Adds a new dashboard widget.
 *
 * @since 2.7.0
 * @since 5.6.0 The `$context` and `$priority` parameters were added.
 *
 * @global callable[] $wp_dashboard_control_callbacks
 *
 * @param string   $widget_id        Widget ID  (used in the 'id' attribute for the widget).
 * @param string   $widget_name      Title of the widget.
 * @param callable $callback         Function that fills the widget with the desired content.
 *                                   The function should echo its output.
 * @param callable $control_callback Optional. Function that outputs controls for the widget. Default null.
 * @param array    $callback_args    Optional. Data that should be set as the $args property of the widget array
 *                                   (which is the second parameter passed to your callback). Default null.
 * @param string   $context          Optional. The context within the screen where the box should display.
 *                                   Accepts 'normal', 'side', 'column3', or 'column4'. Default 'normal'.
 * @param string   $priority         Optional. The priority within the context where the box should show.
 *                                   Accepts 'high', 'core', 'default', or 'low'. Default 'core'.
 */
function wp_add_dashboard_widget( $widget_id, $widget_name, $callback, $control_callback = null, $callback_args = null, $context = 'normal', $priority = 'core' ) {
	global $wp_dashboard_control_callbacks;

	$screen = get_current_screen();

	$private_callback_args = array( '__widget_basename' => $widget_name );

	if ( is_null( $callback_args ) ) {
		$callback_args = $private_callback_args;
	} elseif ( is_array( $callback_args ) ) {
		$callback_args = array_merge( $callback_args, $private_callback_args );
	}

	if ( $control_callback && is_callable( $control_callback ) && current_user_can( 'edit_dashboard' ) ) {
		$wp_dashboard_control_callbacks[ $widget_id ] = $control_callback;

		if ( isset( $_GET['edit'] ) && $widget_id === $_GET['edit'] ) {
			list($url)    = explode( '#', add_query_arg( 'edit', false ), 2 );
			$widget_name .= ' <span class="postbox-title-action"><a href="' . esc_url( $url ) . '">' . __( 'Cancel' ) . '</a></span>';
			$callback     = '_wp_dashboard_control_callback';
		} else {
			list($url)    = explode( '#', add_query_arg( 'edit', $widget_id ), 2 );
			$widget_name .= ' <span class="postbox-title-action"><a href="' . esc_url( "$url#$widget_id" ) . '" class="edit-box open-box">' . __( 'Configure' ) . '</a></span>';
		}
	}

	$side_widgets = array();

	if ( in_array( $widget_id, $side_widgets, true ) ) {
		$context = 'side';
	}

	$high_priority_widgets = array( 'dashboard_browser_nag', 'dashboard_php_nag' );

	if ( in_array( $widget_id, $high_priority_widgets, true ) ) {
		$priority = 'high';
	}

	if ( empty( $context ) ) {
		$context = 'normal';
	}

	if ( empty( $priority ) ) {
		$priority = 'core';
	}

	add_meta_box( $widget_id, $widget_name, $callback, $screen, $context, $priority, $callback_args );
}

/**
 * Outputs controls for the current dashboard widget.
 *
 * @access private
 * @since 2.7.0
 *
 * @param mixed $dashboard
 * @param array $meta_box
 */
function _wp_dashboard_control_callback( $dashboard, $meta_box ) {
	echo '<form method="post" class="dashboard-widget-control-form wp-clearfix">';
	wp_dashboard_trigger_widget_control( $meta_box['id'] );
	wp_nonce_field( 'edit-dashboard-widget_' . $meta_box['id'], 'dashboard-widget-nonce' );
	echo '<input type="hidden" name="widget_id" value="' . esc_attr( $meta_box['id'] ) . '" />';
	submit_button( __( 'Save Changes' ) );
	echo '</form>';
}

/**
 * Displays the dashboard.
 *
 * @since 2.5.0
 */
function wp_dashboard() {
	$screen      = get_current_screen();
	$columns     = absint( $screen->get_columns() );
	$columns_css = '';

	if ( $columns ) {
		$columns_css = " columns-$columns";
	}
	?>
<div id="dashboard-widgets" class="metabox-holder<?php echo $columns_css; ?>">
	<div id="postbox-container-1" class="postbox-container">
	<?php do_meta_boxes( $screen->id, 'normal', '' ); ?>
	</div>
	<div id="postbox-container-2" class="postbox-container">
	<?php do_meta_boxes( $screen->id, 'side', '' ); ?>
	</div>
	<div id="postbox-container-3" class="postbox-container">
	<?php do_meta_boxes( $screen->id, 'column3', '' ); ?>
	</div>
	<div id="postbox-container-4" class="postbox-container">
	<?php do_meta_boxes( $screen->id, 'column4', '' ); ?>
	</div>
</div>

	<?php
	wp_nonce_field( 'closedpostboxes', 'closedpostboxesnonce', false );
	wp_nonce_field( 'meta-box-order', 'meta-box-order-nonce', false );
}

//
// Dashboard Widgets.
//

/**
 * Dashboard widget that displays some basic stats about the site.
 *
 * Formerly 'Right Now'. A streamlined 'At a Glance' as of 3.8.
 *
 * @since 2.7.0
 */
function wp_dashboard_right_now() {
	?>
	<div class="main">
	<ul>
	<?php
	// Posts and Pages. DMPress: 'page' only appears if a page type is registered
	// (e.g. recreated via the Content-Type Builder).
	$glance_post_types = array_values( array_filter( array( 'post', 'page' ), 'post_type_exists' ) );
	foreach ( $glance_post_types as $post_type ) {
		$num_posts = wp_count_posts( $post_type );

		if ( $num_posts && $num_posts->publish ) {
			if ( 'post' === $post_type ) {
				/* translators: %s: Number of posts. */
				$text = _n( '%s Published post', '%s Published posts', $num_posts->publish );
			} else {
				/* translators: %s: Number of pages. */
				$text = _n( '%s Published page', '%s Published pages', $num_posts->publish );
			}

			$text             = sprintf( $text, number_format_i18n( $num_posts->publish ) );
			$post_type_object = get_post_type_object( $post_type );

			if ( $post_type_object && current_user_can( $post_type_object->cap->edit_posts ) ) {
				$url = add_query_arg(
					array(
						'post_status' => 'publish',
						'post_type'   => $post_type,
					),
					admin_url( 'edit.php' )
				);
				printf( '<li class="%1$s-count"><a href="%2$s">%3$s</a></li>', $post_type, esc_url( $url ), esc_html( $text ) );
			} else {
				printf( '<li class="%1$s-count"><span>%2$s</span></li>', $post_type, $text );
			}
		}
	}

	// Comments.
	$num_comm = wp_count_comments();

	if ( $num_comm && ( $num_comm->approved || $num_comm->moderated ) ) {
		/* translators: %s: Number of comments. */
		$text = sprintf( _n( '%s Comment', '%s Comments', $num_comm->approved ), number_format_i18n( $num_comm->approved ) );
		?>
		<li class="comment-count">
			<a href="edit-comments.php"><?php echo $text; ?></a>
		</li>
		<?php
		$moderated_comments_count_i18n = number_format_i18n( $num_comm->moderated );
		/* translators: %s: Number of comments. */
		$text = sprintf( _n( '%s Comment in moderation', '%s Comments in moderation', $num_comm->moderated ), $moderated_comments_count_i18n );
		?>
		<li class="comment-mod-count<?php echo ! $num_comm->moderated ? ' hidden' : ''; ?>">
			<a href="edit-comments.php?comment_status=moderated" class="comments-in-moderation-text"><?php echo $text; ?></a>
		</li>
		<?php
	}

	/**
	 * Filters the array of extra elements to list in the 'At a Glance'
	 * dashboard widget.
	 *
	 * Prior to 3.8.0, the widget was named 'Right Now'. Each element
	 * is wrapped in list-item tags on output.
	 *
	 * @since 3.8.0
	 *
	 * @param string[] $items Array of extra 'At a Glance' widget items.
	 */
	$elements = apply_filters( 'dashboard_glance_items', array() );

	if ( $elements ) {
		echo '<li>' . implode( "</li>\n<li>", $elements ) . "</li>\n";
	}

	?>
	</ul>
	<?php
	update_right_now_message();

	// Check if search engines are asked not to index this site.
	if ( ! is_network_admin() && ! is_user_admin()
		&& current_user_can( 'manage_options' ) && ! get_option( 'blog_public' )
	) {

		/**
		 * Filters the link title attribute for the 'Search engines discouraged'
		 * message displayed in the 'At a Glance' dashboard widget.
		 *
		 * Prior to 3.8.0, the widget was named 'Right Now'.
		 *
		 * @since 3.0.0
		 * @since 4.5.0 The default for `$title` was updated to an empty string.
		 *
		 * @param string $title Default attribute text.
		 */
		$title = apply_filters( 'privacy_on_link_title', '' );

		/**
		 * Filters the link label for the 'Search engines discouraged' message
		 * displayed in the 'At a Glance' dashboard widget.
		 *
		 * Prior to 3.8.0, the widget was named 'Right Now'.
		 *
		 * @since 3.0.0
		 *
		 * @param string $content Default text.
		 */
		$content = apply_filters( 'privacy_on_link_text', __( 'Search engines discouraged' ) );

		$title_attr = '' === $title ? '' : " title='$title'";

		echo "<p class='search-engines-info'><a href='options-reading.php'$title_attr>$content</a></p>";
	}
	?>
	</div>
	<?php
	/*
	 * activity_box_end has a core action, but only prints content when multisite.
	 * Using an output buffer is the only way to really check if anything's displayed here.
	 */
	ob_start();

	/**
	 * Fires at the end of the 'At a Glance' dashboard widget.
	 *
	 * Prior to 3.8.0, the widget was named 'Right Now'.
	 *
	 * @since 2.5.0
	 */
	do_action( 'rightnow_end' );

	/**
	 * Fires at the end of the 'At a Glance' dashboard widget.
	 *
	 * Prior to 3.8.0, the widget was named 'Right Now'.
	 *
	 * @since 2.0.0
	 */
	do_action( 'activity_box_end' );

	$actions = ob_get_clean();

	if ( ! empty( $actions ) ) :
		?>
	<div class="sub">
		<?php echo $actions; ?>
	</div>
		<?php
	endif;
}

/**
 * @since 3.1.0
 */
function wp_network_dashboard_right_now() {
	$actions = array();

	if ( current_user_can( 'create_sites' ) ) {
		$actions['create-site'] = '<a href="' . network_admin_url( 'site-new.php' ) . '">' . __( 'Create a New Site' ) . '</a>';
	}
	if ( current_user_can( 'create_users' ) ) {
		$actions['create-user'] = '<a href="' . network_admin_url( 'user-new.php' ) . '">' . __( 'Create a New User' ) . '</a>';
	}

	$c_users = get_user_count();
	$c_blogs = get_blog_count();

	/* translators: %s: Number of users on the network. */
	$user_text = sprintf( _n( '%s user', '%s users', $c_users ), number_format_i18n( $c_users ) );
	/* translators: %s: Number of sites on the network. */
	$blog_text = sprintf( _n( '%s site', '%s sites', $c_blogs ), number_format_i18n( $c_blogs ) );

	/* translators: 1: Text indicating the number of sites on the network, 2: Text indicating the number of users on the network. */
	$sentence = sprintf( __( 'You have %1$s and %2$s.' ), $blog_text, $user_text );

	if ( $actions ) {
		echo '<ul class="subsubsub">';
		foreach ( $actions as $class => $action ) {
			$actions[ $class ] = "\t<li class='$class'>$action";
		}
		echo implode( " |</li>\n", $actions ) . "</li>\n";
		echo '</ul>';
	}
	?>
	<br class="clear" />

	<p class="youhave"><?php echo $sentence; ?></p>


	<?php
		/**
		 * Fires in the Network Admin 'Right Now' dashboard widget
		 * just before the user and site search form fields.
		 *
		 * @since MU (3.0.0)
		 */
		do_action( 'wpmuadminresult' );
	?>

	<form action="<?php echo esc_url( network_admin_url( 'users.php' ) ); ?>" method="get">
		<p>
			<label class="screen-reader-text" for="search-users">
				<?php
				/* translators: Hidden accessibility text. */
				_e( 'Search Users' );
				?>
			</label>
			<input type="search" name="s" value="" size="30" autocomplete="off" id="search-users" />
			<?php submit_button( __( 'Search Users' ), '', false, false, array( 'id' => 'submit_users' ) ); ?>
		</p>
	</form>

	<form action="<?php echo esc_url( network_admin_url( 'sites.php' ) ); ?>" method="get">
		<p>
			<label class="screen-reader-text" for="search-sites">
				<?php
				/* translators: Hidden accessibility text. */
				_e( 'Search Sites' );
				?>
			</label>
			<input type="search" name="s" value="" size="30" autocomplete="off" id="search-sites" />
			<?php submit_button( __( 'Search Sites' ), '', false, false, array( 'id' => 'submit_sites' ) ); ?>
		</p>
	</form>
	<?php
	/**
	 * Fires at the end of the 'Right Now' widget in the Network Admin dashboard.
	 *
	 * @since MU (3.0.0)
	 */
	do_action( 'mu_rightnow_end' );

	/**
	 * Fires at the end of the 'Right Now' widget in the Network Admin dashboard.
	 *
	 * @since MU (3.0.0)
	 */
	do_action( 'mu_activity_box_end' );
}

/**
 * Outputs a row for the Recent Comments widget.
 *
 * @access private
 * @since 2.7.0
 *
 * @global WP_Comment $comment Global comment object.
 *
 * @param WP_Comment $comment   The current comment.
 * @param bool       $show_date Optional. Whether to display the date.
 */
function _wp_dashboard_recent_comments_row( &$comment, $show_date = true ) {
	$GLOBALS['comment'] = clone $comment;

	if ( $comment->comment_post_ID > 0 ) {
		$comment_post_title = _draft_or_post_title( $comment->comment_post_ID );
		$comment_post_url   = get_the_permalink( $comment->comment_post_ID );
		$comment_post_link  = '<a href="' . esc_url( $comment_post_url ) . '">' . $comment_post_title . '</a>';
	} else {
		$comment_post_link = '';
	}

	$actions_string = '';
	if ( current_user_can( 'edit_comment', $comment->comment_ID ) ) {
		// Pre-order it: Approve | Reply | Edit | Spam | Trash.
		$actions = array(
			'approve'   => '',
			'unapprove' => '',
			'reply'     => '',
			'edit'      => '',
			'spam'      => '',
			'trash'     => '',
			'delete'    => '',
			'view'      => '',
		);

		$approve_nonce = esc_html( '_wpnonce=' . wp_create_nonce( 'approve-comment_' . $comment->comment_ID ) );
		$del_nonce     = esc_html( '_wpnonce=' . wp_create_nonce( 'delete-comment_' . $comment->comment_ID ) );

		$action_string = 'comment.php?action=%s&p=' . $comment->comment_post_ID . '&c=' . $comment->comment_ID . '&%s';

		$approve_url   = sprintf( $action_string, 'approvecomment', $approve_nonce );
		$unapprove_url = sprintf( $action_string, 'unapprovecomment', $approve_nonce );
		$spam_url      = sprintf( $action_string, 'spamcomment', $del_nonce );
		$trash_url     = sprintf( $action_string, 'trashcomment', $del_nonce );
		$delete_url    = sprintf( $action_string, 'deletecomment', $del_nonce );

		$actions['approve'] = sprintf(
			'<a href="%s" data-wp-lists="%s" class="vim-a aria-button-if-js" aria-label="%s">%s</a>',
			esc_url( $approve_url ),
			"dim:the-comment-list:comment-{$comment->comment_ID}:unapproved:e7e7d3:e7e7d3:new=approved",
			esc_attr__( 'Approve this comment' ),
			__( 'Approve' )
		);

		$actions['unapprove'] = sprintf(
			'<a href="%s" data-wp-lists="%s" class="vim-u aria-button-if-js" aria-label="%s">%s</a>',
			esc_url( $unapprove_url ),
			"dim:the-comment-list:comment-{$comment->comment_ID}:unapproved:e7e7d3:e7e7d3:new=unapproved",
			esc_attr__( 'Unapprove this comment' ),
			__( 'Unapprove' )
		);

		$actions['edit'] = sprintf(
			'<a href="%s" aria-label="%s">%s</a>',
			"comment.php?action=editcomment&amp;c={$comment->comment_ID}",
			esc_attr__( 'Edit this comment' ),
			__( 'Edit' )
		);

		$actions['reply'] = sprintf(
			'<button type="button" onclick="window.commentReply && commentReply.open(\'%s\',\'%s\');" class="vim-r button-link hide-if-no-js" aria-label="%s">%s</button>',
			$comment->comment_ID,
			$comment->comment_post_ID,
			esc_attr__( 'Reply to this comment' ),
			/* translators: Comment reply button text. */
			_x( 'Reply', 'verb' )
		);

		$actions['spam'] = sprintf(
			'<a href="%s" data-wp-lists="%s" class="vim-s vim-destructive aria-button-if-js" aria-label="%s">%s</a>',
			esc_url( $spam_url ),
			"delete:the-comment-list:comment-{$comment->comment_ID}::spam=1",
			esc_attr__( 'Mark this comment as spam' ),
			/* translators: "Mark as spam" link. */
			_x( 'Spam', 'verb' )
		);

		if ( ! EMPTY_TRASH_DAYS ) {
			$actions['delete'] = sprintf(
				'<a href="%s" data-wp-lists="%s" class="delete vim-d vim-destructive aria-button-if-js" aria-label="%s">%s</a>',
				esc_url( $delete_url ),
				"delete:the-comment-list:comment-{$comment->comment_ID}::trash=1",
				esc_attr__( 'Delete this comment permanently' ),
				__( 'Delete Permanently' )
			);
		} else {
			$actions['trash'] = sprintf(
				'<a href="%s" data-wp-lists="%s" class="delete vim-d vim-destructive aria-button-if-js" aria-label="%s">%s</a>',
				esc_url( $trash_url ),
				"delete:the-comment-list:comment-{$comment->comment_ID}::trash=1",
				esc_attr__( 'Move this comment to the Trash' ),
				_x( 'Trash', 'verb' )
			);
		}

		$actions['view'] = sprintf(
			'<a class="comment-link" href="%s" aria-label="%s">%s</a>',
			esc_url( get_comment_link( $comment ) ),
			esc_attr__( 'View this comment' ),
			__( 'View' )
		);

		/** This filter is documented in wp-admin/includes/class-wp-comments-list-table.php */
		$actions = apply_filters( 'comment_row_actions', array_filter( $actions ), $comment );

		$i = 0;

		foreach ( $actions as $action => $link ) {
			++$i;

			if ( ( ( 'approve' === $action || 'unapprove' === $action ) && 2 === $i )
				|| 1 === $i
			) {
				$separator = '';
			} else {
				$separator = ' | ';
			}

			// Reply and quickedit need a hide-if-no-js span.
			if ( 'reply' === $action || 'quickedit' === $action ) {
				$action .= ' hide-if-no-js';
			}

			if ( 'view' === $action && '1' !== $comment->comment_approved ) {
				$action .= ' hidden';
			}

			$actions_string .= "<span class='$action'>{$separator}{$link}</span>";
		}
	}
	?>

		<li id="comment-<?php echo $comment->comment_ID; ?>" <?php comment_class( array( 'comment-item', wp_get_comment_status( $comment ) ), $comment ); ?>>

			<?php
			$comment_row_class = '';

			if ( get_option( 'show_avatars' ) ) {
				echo get_avatar( $comment, 50, 'mystery' );
				$comment_row_class .= ' has-avatar';
			}
			?>

			<?php if ( ! $comment->comment_type || 'comment' === $comment->comment_type ) : ?>

			<div class="dashboard-comment-wrap has-row-actions <?php echo $comment_row_class; ?>">
			<p class="comment-meta">
				<?php
				// Comments might not have a post they relate to, e.g. programmatically created ones.
				if ( $comment_post_link ) {
					printf(
						/* translators: 1: Comment author, 2: Post link, 3: Notification if the comment is pending. */
						__( 'From %1$s on %2$s %3$s' ),
						'<cite class="comment-author">' . get_comment_author_link( $comment ) . '</cite>',
						$comment_post_link,
						'<span class="approve">' . __( '[Pending]' ) . '</span>'
					);
				} else {
					printf(
						/* translators: 1: Comment author, 2: Notification if the comment is pending. */
						__( 'From %1$s %2$s' ),
						'<cite class="comment-author">' . get_comment_author_link( $comment ) . '</cite>',
						'<span class="approve">' . __( '[Pending]' ) . '</span>'
					);
				}
				?>
			</p>

				<?php
			else :
				switch ( $comment->comment_type ) {
					case 'pingback':
						$type = __( 'Pingback' );
						break;
					case 'trackback':
						$type = __( 'Trackback' );
						break;
					default:
						$type = ucwords( $comment->comment_type );
				}
				$type = esc_html( $type );
				?>
			<div class="dashboard-comment-wrap has-row-actions">
			<p class="comment-meta">
				<?php
				// Pingbacks, Trackbacks or custom comment types might not have a post they relate to, e.g. programmatically created ones.
				if ( $comment_post_link ) {
					printf(
						/* translators: 1: Type of comment, 2: Post link, 3: Notification if the comment is pending. */
						_x( '%1$s on %2$s %3$s', 'dashboard' ),
						"<strong>$type</strong>",
						$comment_post_link,
						'<span class="approve">' . __( '[Pending]' ) . '</span>'
					);
				} else {
					printf(
						/* translators: 1: Type of comment, 2: Notification if the comment is pending. */
						_x( '%1$s %2$s', 'dashboard' ),
						"<strong>$type</strong>",
						'<span class="approve">' . __( '[Pending]' ) . '</span>'
					);
				}
				?>
			</p>
			<p class="comment-author"><?php comment_author_link( $comment ); ?></p>

			<?php endif; // comment_type ?>
			<blockquote><p><?php comment_excerpt( $comment ); ?></p></blockquote>
			<?php if ( $actions_string ) : ?>
			<p class="row-actions"><?php echo $actions_string; ?></p>
			<?php endif; ?>
			</div>
		</li>
	<?php
	$GLOBALS['comment'] = null;
}

/**
 * Outputs the Activity widget.
 *
 * Callback function for {@see 'dashboard_activity'}.
 *
 * @since 3.8.0
 */
function wp_dashboard_site_activity() {

	echo '<div id="activity-widget">';

	$future_posts = wp_dashboard_recent_posts(
		array(
			'max'    => 5,
			'status' => 'future',
			'order'  => 'ASC',
			'title'  => __( 'Publishing Soon' ),
			'id'     => 'future-posts',
		)
	);
	$recent_posts = wp_dashboard_recent_posts(
		array(
			'max'    => 5,
			'status' => 'publish',
			'order'  => 'DESC',
			'title'  => __( 'Recently Published' ),
			'id'     => 'published-posts',
		)
	);

	$recent_comments = wp_dashboard_recent_comments();

	if ( ! $future_posts && ! $recent_posts && ! $recent_comments ) {
		echo '<div class="no-activity">';
		echo '<p>' . __( 'No activity yet!' ) . '</p>';
		echo '</div>';
	}

	echo '</div>';
}

/**
 * Generates Publishing Soon and Recently Published sections.
 *
 * @since 3.8.0
 *
 * @param array $args {
 *     An array of query and display arguments.
 *
 *     @type int    $max     Number of posts to display.
 *     @type string $status  Post status.
 *     @type string $order   Designates ascending ('ASC') or descending ('DESC') order.
 *     @type string $title   Section title.
 *     @type string $id      The container id.
 * }
 * @return bool False if no posts were found. True otherwise.
 */
function wp_dashboard_recent_posts( $args ) {
	$query_args = array(
		'post_type'      => 'post',
		'post_status'    => $args['status'],
		'orderby'        => 'date',
		'order'          => $args['order'],
		'posts_per_page' => (int) $args['max'],
		'no_found_rows'  => true,
		'cache_results'  => true,
		'perm'           => ( 'future' === $args['status'] ) ? 'editable' : 'readable',
	);

	/**
	 * Filters the query arguments used for the Recent Posts widget.
	 *
	 * @since 4.2.0
	 *
	 * @param array $query_args The arguments passed to WP_Query to produce the list of posts.
	 */
	$query_args = apply_filters( 'dashboard_recent_posts_query_args', $query_args );

	$posts = new WP_Query( $query_args );

	if ( $posts->have_posts() ) {

		echo '<div id="' . $args['id'] . '" class="activity-block">';

		echo '<h3>' . $args['title'] . '</h3>';

		echo '<ul>';

		$today    = current_time( 'Y-m-d' );
		$tomorrow = current_datetime()->modify( '+1 day' )->format( 'Y-m-d' );
		$year     = current_time( 'Y' );

		while ( $posts->have_posts() ) {
			$posts->the_post();

			$time = get_the_time( 'U' );

			if ( ! is_int( $time ) ) {
				/* translators: Date and time format for recent posts on the dashboard, from a different calendar year, see https://www.php.net/manual/datetime.format.php */
				$date = get_the_date( __( 'M jS Y' ) );
			} elseif ( gmdate( 'Y-m-d', $time ) === $today ) {
				$date = __( 'Today' );
			} elseif ( gmdate( 'Y-m-d', $time ) === $tomorrow ) {
				$date = __( 'Tomorrow' );
			} elseif ( gmdate( 'Y', $time ) !== $year ) {
				/* translators: Date and time format for recent posts on the dashboard, from a different calendar year, see https://www.php.net/manual/datetime.format.php */
				$date = date_i18n( __( 'M jS Y' ), $time );
			} else {
				/* translators: Date and time format for recent posts on the dashboard, see https://www.php.net/manual/datetime.format.php */
				$date = date_i18n( __( 'M jS' ), $time );
			}

			// Use the post edit link for those who can edit, the permalink otherwise.
			$recent_post_link = current_user_can( 'edit_post', get_the_ID() ) ? get_edit_post_link() : get_permalink();

			$draft_or_post_title = _draft_or_post_title();
			printf(
				'<li><span>%1$s</span> <a href="%2$s" aria-label="%3$s">%4$s</a></li>',
				/* translators: 1: Relative date, 2: Time. */
				sprintf( _x( '%1$s, %2$s', 'dashboard' ), $date, get_the_time() ),
				$recent_post_link,
				/* translators: %s: Post title. */
				esc_attr( sprintf( __( 'Edit &#8220;%s&#8221;' ), $draft_or_post_title ) ),
				$draft_or_post_title
			);
		}

		echo '</ul>';
		echo '</div>';

	} else {
		return false;
	}

	wp_reset_postdata();

	return true;
}

/**
 * Show Comments section.
 *
 * @since 3.8.0
 *
 * @param int $total_items Optional. Number of comments to query. Default 5.
 * @return bool False if no comments were found. True otherwise.
 */
function wp_dashboard_recent_comments( $total_items = 5 ) {
	// Select all comment types and filter out spam later for better query performance.
	$comments = array();

	$comments_query = array(
		'number' => $total_items * 5,
		'offset' => 0,
	);

	if ( ! current_user_can( 'edit_posts' ) ) {
		$comments_query['status'] = 'approve';
	}

	$comments_count = 0;
	do {
		$possible = get_comments( $comments_query );

		if ( empty( $possible ) || ! is_array( $possible ) ) {
			break;
		}

		foreach ( $possible as $comment ) {
			if ( ! current_user_can( 'edit_post', $comment->comment_post_ID )
				&& ( post_password_required( $comment->comment_post_ID )
					|| ! current_user_can( 'read_post', $comment->comment_post_ID ) )
			) {
				// The user has no access to the post and thus cannot see the comments.
				continue;
			}

			$comments[]     = $comment;
			$comments_count = count( $comments );

			if ( $comments_count === $total_items ) {
				break 2;
			}
		}

		$comments_query['offset'] += $comments_query['number'];
		$comments_query['number']  = $total_items * 10;
	} while ( $comments_count < $total_items );

	if ( $comments ) {
		echo '<div id="latest-comments" class="activity-block table-view-list">';
		echo '<h3>' . __( 'Recent Comments' ) . '</h3>';

		echo '<ul id="the-comment-list" data-wp-lists="list:comment">';
		foreach ( $comments as $comment ) {
			_wp_dashboard_recent_comments_row( $comment );
		}
		echo '</ul>';

		if ( current_user_can( 'edit_posts' ) ) {
			echo '<h3 class="screen-reader-text">' .
				/* translators: Hidden accessibility text. */
				__( 'View more comments' ) .
			'</h3>';
			_get_list_table( 'WP_Comments_List_Table' )->views();
		}

		wp_comment_reply( -1, false, 'dashboard', false );
		wp_comment_trashnotice();

		echo '</div>';
	} else {
		return false;
	}
	return true;
}

/**
 * Display generic dashboard RSS widget feed.
 *
 * @since 2.5.0
 *
 * @param string $widget_id
 */
function wp_dashboard_rss_output( $widget_id ) {
	$widgets = get_option( 'dashboard_widget_options' );
	echo '<div class="rss-widget">';
	wp_widget_rss_output( $widgets[ $widget_id ] );
	echo '</div>';
}

/**
 * Checks to see if all of the feed url in $check_urls are cached.
 *
 * If $check_urls is empty, look for the rss feed url found in the dashboard
 * widget options of $widget_id. If cached, call $callback, a function that
 * echoes out output for this widget. If not cache, echo a "Loading..." stub
 * which is later replaced by Ajax call (see top of /wp-admin/index.php)
 *
 * @since 2.5.0
 * @since 5.3.0 Formalized the existing and already documented `...$args` parameter
 *              by adding it to the function signature.
 *
 * @param string   $widget_id  The widget ID.
 * @param callable $callback   The callback function used to display each feed.
 * @param array    $check_urls RSS feeds.
 * @param mixed    ...$args    Optional additional parameters to pass to the callback function.
 * @return bool True on success, false on failure.
 */
function wp_dashboard_cached_rss_widget( $widget_id, $callback, $check_urls = array(), ...$args ) {
	$doing_ajax = wp_doing_ajax();
	$loading    = '<p class="widget-loading hide-if-no-js">' . __( 'Loading&hellip;' ) . '</p>';
	$loading   .= wp_get_admin_notice(
		__( 'This widget requires JavaScript.' ),
		array(
			'type'               => 'error',
			'additional_classes' => array( 'inline', 'hide-if-js' ),
		)
	);

	if ( empty( $check_urls ) ) {
		$widgets = get_option( 'dashboard_widget_options' );

		if ( empty( $widgets[ $widget_id ]['url'] ) && ! $doing_ajax ) {
			echo $loading;
			return false;
		}

		$check_urls = array( $widgets[ $widget_id ]['url'] );
	}

	$locale    = get_user_locale();
	$cache_key = 'dash_v2_' . md5( $widget_id . '_' . $locale );
	$output    = get_transient( $cache_key );

	if ( false !== $output ) {
		echo $output;
		return true;
	}

	if ( ! $doing_ajax ) {
		echo $loading;
		return false;
	}

	if ( $callback && is_callable( $callback ) ) {
		array_unshift( $args, $widget_id, $check_urls );
		ob_start();
		call_user_func_array( $callback, $args );
		// Default lifetime in cache of 12 hours (same as the feeds).
		set_transient( $cache_key, ob_get_flush(), 12 * HOUR_IN_SECONDS );
	}

	return true;
}

//
// Dashboard Widgets Controls.
//

/**
 * Calls widget control callback.
 *
 * @since 2.5.0
 *
 * @global callable[] $wp_dashboard_control_callbacks
 *
 * @param int|false $widget_control_id Optional. Registered widget ID. Default false.
 */
function wp_dashboard_trigger_widget_control( $widget_control_id = false ) {
	global $wp_dashboard_control_callbacks;

	if ( is_scalar( $widget_control_id ) && $widget_control_id
		&& isset( $wp_dashboard_control_callbacks[ $widget_control_id ] )
		&& is_callable( $wp_dashboard_control_callbacks[ $widget_control_id ] )
	) {
		call_user_func(
			$wp_dashboard_control_callbacks[ $widget_control_id ],
			'',
			array(
				'id'       => $widget_control_id,
				'callback' => $wp_dashboard_control_callbacks[ $widget_control_id ],
			)
		);
	}
}

/**
 * Sets up the RSS dashboard widget control and $args to be used as input to wp_widget_rss_form().
 *
 * Handles POST data from RSS-type widgets.
 *
 * @since 2.5.0
 *
 * @param string $widget_id
 * @param array  $form_inputs
 */
function wp_dashboard_rss_control( $widget_id, $form_inputs = array() ) {
	$widget_options = get_option( 'dashboard_widget_options' );

	if ( ! $widget_options ) {
		$widget_options = array();
	}

	if ( ! isset( $widget_options[ $widget_id ] ) ) {
		$widget_options[ $widget_id ] = array();
	}

	$number = 1; // Hack to use wp_widget_rss_form().

	$widget_options[ $widget_id ]['number'] = $number;

	if ( 'POST' === $_SERVER['REQUEST_METHOD'] && isset( $_POST['widget-rss'][ $number ] ) ) {
		$_POST['widget-rss'][ $number ]         = wp_unslash( $_POST['widget-rss'][ $number ] );
		$widget_options[ $widget_id ]           = wp_widget_rss_process( $_POST['widget-rss'][ $number ] );
		$widget_options[ $widget_id ]['number'] = $number;

		// Title is optional. If black, fill it if possible.
		if ( ! $widget_options[ $widget_id ]['title'] && isset( $_POST['widget-rss'][ $number ]['title'] ) ) {
			$rss = fetch_feed( $widget_options[ $widget_id ]['url'] );
			if ( is_wp_error( $rss ) ) {
				$widget_options[ $widget_id ]['title'] = htmlentities( __( 'Unknown Feed' ) );
			} else {
				$widget_options[ $widget_id ]['title'] = htmlentities( strip_tags( $rss->get_title() ) );
				$rss->__destruct();
				unset( $rss );
			}
		}

		update_option( 'dashboard_widget_options', $widget_options, false );

		$locale    = get_user_locale();
		$cache_key = 'dash_v2_' . md5( $widget_id . '_' . $locale );
		delete_transient( $cache_key );
	}

	wp_widget_rss_form( $widget_options[ $widget_id ], $form_inputs );
}


/**
 * Displays file upload quota on dashboard.
 *
 * Runs on the {@see 'activity_box_end'} hook in wp_dashboard_right_now().
 *
 * @since 3.0.0
 *
 * @return true|void True if not multisite, user can't upload files, or the space check option is disabled.
 */
function wp_dashboard_quota() {
	if ( ! is_multisite() || ! current_user_can( 'upload_files' )
		|| get_site_option( 'upload_space_check_disabled' )
	) {
		return true;
	}

	$quota = get_space_allowed();
	$used  = get_space_used();

	if ( $used > $quota ) {
		$percentused = '100';
	} else {
		$percentused = ( $used / $quota ) * 100;
	}

	$used_class  = ( $percentused >= 70 ) ? ' warning' : '';
	$used        = round( $used, 2 );
	$percentused = number_format( $percentused );

	?>
	<h3 class="mu-storage"><?php _e( 'Storage Space' ); ?></h3>
	<div class="mu-storage">
	<ul>
		<li class="storage-count">
			<?php
			$text = sprintf(
				/* translators: %s: Number of megabytes. */
				__( '%s MB Space Allowed' ),
				number_format_i18n( $quota )
			);
			printf(
				'<a href="%1$s">%2$s<span class="screen-reader-text"> (%3$s)</span></a>',
				esc_url( admin_url( 'upload.php' ) ),
				$text,
				/* translators: Hidden accessibility text. */
				__( 'Manage Uploads' )
			);
			?>
		</li><li class="storage-count <?php echo $used_class; ?>">
			<?php
			$text = sprintf(
				/* translators: 1: Number of megabytes, 2: Percentage. */
				__( '%1$s MB (%2$s%%) Space Used' ),
				number_format_i18n( $used, 2 ),
				$percentused
			);
			printf(
				'<a href="%1$s" class="musublink">%2$s<span class="screen-reader-text"> (%3$s)</span></a>',
				esc_url( admin_url( 'upload.php' ) ),
				$text,
				/* translators: Hidden accessibility text. */
				__( 'Manage Uploads' )
			);
			?>
		</li>
	</ul>
	</div>
	<?php
}

/**
 * Displays the browser update nag.
 *
 * @since 3.2.0
 * @since 5.8.0 Added a special message for Internet Explorer users.
 *
 * @global bool $is_IE
 */
function wp_dashboard_browser_nag() {
	global $is_IE;

	$notice   = '';
	$response = wp_check_browser_version();

	if ( $response ) {
		if ( $is_IE ) {
			$msg = __( 'Internet Explorer does not give you the best DMPress experience. Switch to Microsoft Edge, or another more modern browser to get the most from your site.' );
		} elseif ( $response['insecure'] ) {
			$msg = sprintf(
				/* translators: %s: Browser name and link. */
				__( "It looks like you're using an insecure version of %s. Using an outdated browser makes your computer unsafe. For the best DMPress experience, please update your browser." ),
				sprintf( '<a href="%s">%s</a>', esc_url( $response['update_url'] ), esc_html( $response['name'] ) )
			);
		} else {
			$msg = sprintf(
				/* translators: %s: Browser name and link. */
				__( "It looks like you're using an old version of %s. For the best DMPress experience, please update your browser." ),
				sprintf( '<a href="%s">%s</a>', esc_url( $response['update_url'] ), esc_html( $response['name'] ) )
			);
		}

		$browser_nag_class = '';
		if ( ! empty( $response['img_src'] ) ) {
			$img_src = ( is_ssl() && ! empty( $response['img_src_ssl'] ) ) ? $response['img_src_ssl'] : $response['img_src'];

			$notice           .= '<div class="alignright browser-icon"><img src="' . esc_url( $img_src ) . '" alt="" /></div>';
			$browser_nag_class = ' has-browser-icon';
		}
		$notice .= "<p class='browser-update-nag{$browser_nag_class}'>{$msg}</p>";

		$browsehappy = 'https://browsehappy.com/';
		$locale      = get_user_locale();
		if ( 'en_US' !== $locale ) {
			$browsehappy = add_query_arg( 'locale', $locale, $browsehappy );
		}

		if ( $is_IE ) {
			$msg_browsehappy = sprintf(
				/* translators: %s: Browse Happy URL. */
				__( 'Learn how to <a href="%s" class="update-browser-link">browse happy</a>' ),
				esc_url( $browsehappy )
			);
		} else {
			$msg_browsehappy = sprintf(
				/* translators: 1: Browser update URL, 2: Browser name, 3: Browse Happy URL. */
				__( '<a href="%1$s" class="update-browser-link">Update %2$s</a> or learn how to <a href="%3$s" class="browse-happy-link">browse happy</a>' ),
				esc_attr( $response['update_url'] ),
				esc_html( $response['name'] ),
				esc_url( $browsehappy )
			);
		}

		$notice .= '<p>' . $msg_browsehappy . '</p>';
		$notice .= '<p class="hide-if-no-js"><a href="" class="dismiss" aria-label="' . esc_attr__( 'Dismiss the browser warning panel' ) . '">' . __( 'Dismiss' ) . '</a></p>';
		$notice .= '<div class="clear"></div>';
	}

	/**
	 * Filters the notice output for the 'Browse Happy' nag meta box.
	 *
	 * @since 3.2.0
	 *
	 * @param string      $notice   The notice content.
	 * @param array|false $response An array containing web browser information, or
	 *                              false on failure. See wp_check_browser_version().
	 */
	echo apply_filters( 'browse-happy-notice', $notice, $response ); // phpcs:ignore WordPress.NamingConventions.ValidHookName.UseUnderscores
}

/**
 * Adds an additional class to the browser nag if the current version is insecure.
 *
 * @since 3.2.0
 *
 * @param string[] $classes Array of meta box classes.
 * @return string[] Modified array of meta box classes.
 */
function dashboard_browser_nag_class( $classes ) {
	$response = wp_check_browser_version();

	if ( $response && $response['insecure'] ) {
		$classes[] = 'browser-insecure';
	}

	return $classes;
}

/**
 * Checks if the user needs a browser update.
 *
 * @since 3.2.0
 *
 * @return array|false Array of browser data on success, false on failure.
 */
function wp_check_browser_version() {
	if ( empty( $_SERVER['HTTP_USER_AGENT'] ) ) {
		return false;
	}

	$key = md5( $_SERVER['HTTP_USER_AGENT'] );

	$response = get_site_transient( 'browser_' . $key );

	if ( false === $response ) {
		$url     = 'http://api.wordpress.org/core/browse-happy/1.1/';
		$options = array(
			'body'       => array( 'useragent' => $_SERVER['HTTP_USER_AGENT'] ),
			'user-agent' => 'WordPress/' . wp_get_wp_version() . '; ' . home_url( '/' ),
		);

		if ( wp_http_supports( array( 'ssl' ) ) ) {
			$url = set_url_scheme( $url, 'https' );
		}

		$response = wp_remote_post( $url, $options );

		if ( is_wp_error( $response ) || 200 !== wp_remote_retrieve_response_code( $response ) ) {
			return false;
		}

		/**
		 * Response should be an array with:
		 *  'platform' - string - A user-friendly platform name, if it can be determined
		 *  'name' - string - A user-friendly browser name
		 *  'version' - string - The version of the browser the user is using
		 *  'current_version' - string - The most recent version of the browser
		 *  'upgrade' - boolean - Whether the browser needs an upgrade
		 *  'insecure' - boolean - Whether the browser is deemed insecure
		 *  'update_url' - string - The url to visit to upgrade
		 *  'img_src' - string - An image representing the browser
		 *  'img_src_ssl' - string - An image (over SSL) representing the browser
		 */
		$response = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( ! is_array( $response ) ) {
			return false;
		}

		set_site_transient( 'browser_' . $key, $response, WEEK_IN_SECONDS );
	}

	return $response;
}

/**
 * Displays the PHP update nag.
 *
 * @since 5.1.0
 */
function wp_dashboard_php_nag() {
	$response = wp_check_php_version();

	if ( ! $response ) {
		return;
	}

	if ( isset( $response['is_secure'] ) && ! $response['is_secure'] ) {
		// The `is_secure` array key name doesn't actually imply this is a secure version of PHP. It only means it receives security updates.

		if ( $response['is_lower_than_future_minimum'] ) {
			$message = sprintf(
				/* translators: %s: The server PHP version. */
				__( 'Your site is running on an outdated version of PHP (%s), which does not receive security updates and soon will not be supported by DMPress. Ensure that PHP is updated on your server as soon as possible. Otherwise you will not be able to upgrade DMPress.' ),
				PHP_VERSION
			);
		} else {
			$message = sprintf(
				/* translators: %s: The server PHP version. */
				__( 'Your site is running on an outdated version of PHP (%s), which does not receive security updates. It should be updated.' ),
				PHP_VERSION
			);
		}
	} elseif ( $response['is_lower_than_future_minimum'] ) {
		$message = sprintf(
			/* translators: %s: The server PHP version. */
			__( 'Your site is running on an outdated version of PHP (%s), which soon will not be supported by DMPress. Ensure that PHP is updated on your server as soon as possible. Otherwise you will not be able to upgrade DMPress.' ),
			PHP_VERSION
		);
	} else {
		$message = sprintf(
			/* translators: %s: The server PHP version. */
			__( 'Your site is running on an outdated version of PHP (%s), which should be updated.' ),
			PHP_VERSION
		);
	}
	?>
	<p class="bigger-bolder-text"><?php echo $message; ?></p>

	<p><?php _e( 'What is PHP and how does it affect my site?' ); ?></p>
	<p>
		<?php _e( 'PHP is one of the programming languages used to build DMPress. Newer versions of PHP receive regular security updates and may increase your site&#8217;s performance.' ); ?>
		<?php
		if ( ! empty( $response['recommended_version'] ) ) {
			printf(
				/* translators: %s: The minimum recommended PHP version. */
				__( 'The minimum recommended version of PHP is %s.' ),
				$response['recommended_version']
			);
		}
		?>
	</p>

	<p class="button-container">
		<?php
		printf(
			'<a class="button button-primary" href="%1$s" target="_blank">%2$s<span class="screen-reader-text"> %3$s</span><span aria-hidden="true" class="dashicons dashicons-external"></span></a>',
			esc_url( wp_get_update_php_url() ),
			__( 'Learn more about updating PHP' ),
			/* translators: Hidden accessibility text. */
			__( '(opens in a new tab)' )
		);
		?>
	</p>
	<?php

	wp_update_php_annotation();
	wp_direct_php_update_button();
}

/**
 * Adds an additional class to the PHP nag if the current version is insecure.
 *
 * @since 5.1.0
 *
 * @param string[] $classes Array of meta box classes.
 * @return string[] Modified array of meta box classes.
 */
function dashboard_php_nag_class( $classes ) {
	$response = wp_check_php_version();

	if ( ! $response ) {
		return $classes;
	}

	if ( isset( $response['is_secure'] ) && ! $response['is_secure'] ) {
		$classes[] = 'php-no-security-updates';
	} elseif ( $response['is_lower_than_future_minimum'] ) {
		$classes[] = 'php-version-lower-than-future-minimum';
	}

	return $classes;
}

/**
 * Outputs empty dashboard widget to be populated by JS later.
 *
 * Usable by plugins.
 *
 * @since 2.5.0
 */
function wp_dashboard_empty() {}
