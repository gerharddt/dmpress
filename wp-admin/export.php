<?php
/**
 * WordPress Export Administration Screen
 *
 * @package WordPress
 * @subpackage Administration
 */

/** Load WordPress Bootstrap */
require_once __DIR__ . '/admin.php';

if ( ! current_user_can( 'export' ) ) {
	wp_die( __( 'Sorry, you are not allowed to export the content of this site.' ) );
}

/** Load WordPress export API */
require_once ABSPATH . 'wp-admin/includes/export.php';

// Used in the HTML title tag.
$title = __( 'Export' );

/**
 * Display JavaScript on the page.
 *
 * @since 3.5.0
 */
function export_add_js() {
	?>
<script>
	jQuery( function($) {
		var form = $('#export-filters'),
			filters = form.find('.export-filters');
		filters.hide();
		form.find('input:radio').on( 'change', function() {
			filters.slideUp('fast');
			switch ( $(this).val() ) {
				case 'attachment': $('#attachment-filters').slideDown(); break;
				case 'posts': $('#post-filters').slideDown(); break;
			}
		});
	} );
</script>
	<?php
}
add_action( 'admin_head', 'export_add_js' );

get_current_screen()->add_help_tab(
	array(
		'id'      => 'overview',
		'title'   => __( 'Overview' ),
		'content' => '<p>' . __( 'You can export a file of your site&#8217;s content in order to import it into another installation or platform. The export file will be an XML file format called WXR. Your content, comments, custom fields and terms can be included. You can narrow the export with the dropdown filters, limiting it by author, date range by month, or publishing status.' ) . '</p>' .
			'<p>' . __( 'Once generated, your WXR file can be imported by another DMPress site or by another blogging platform able to access this format.' ) . '</p>',
	)
);

get_current_screen()->set_help_sidebar(
	'<p><strong>' . __( 'For more information:' ) . '</strong></p>' .
	'<p>' . __( '<a href="https://wordpress.org/documentation/article/tools-export-screen/">Documentation on Export</a>' ) . '</p>' .
	'<p>' . __( '<a href="https://wordpress.org/support/forums/">Support forums</a>' ) . '</p>'
);

// If the 'download' URL parameter is set, a WXR export file is baked and returned.
if ( isset( $_GET['download'] ) ) {
	$args = array();

	if ( ! isset( $_GET['content'] ) || 'all' === $_GET['content'] ) {
		$args['content'] = 'all';
	} elseif ( 'posts' === $_GET['content'] ) {
		$args['content'] = 'post';

		if ( $_GET['cat'] ) {
			$args['category'] = (int) $_GET['cat'];
		}

		if ( $_GET['post_author'] ) {
			$args['author'] = (int) $_GET['post_author'];
		}

		if ( $_GET['post_start_date'] || $_GET['post_end_date'] ) {
			$args['start_date'] = $_GET['post_start_date'];
			$args['end_date']   = $_GET['post_end_date'];
		}

		if ( $_GET['post_status'] ) {
			$args['status'] = $_GET['post_status'];
		}
	} elseif ( 'attachment' === $_GET['content'] ) {
		$args['content'] = 'attachment';

		if ( $_GET['attachment_start_date'] || $_GET['attachment_end_date'] ) {
			$args['start_date'] = $_GET['attachment_start_date'];
			$args['end_date']   = $_GET['attachment_end_date'];
		}
	} else {
		$args['content'] = $_GET['content'];
	}

	/**
	 * Filters the export args.
	 *
	 * @since 3.5.0
	 *
	 * @param array $args The arguments to send to the exporter.
	 */
	$args = apply_filters( 'export_args', $args );

	export_wp( $args );
	die();
}

require_once ABSPATH . 'wp-admin/admin-header.php';

/**
 * Creates the date options fields for exporting a given post type.
 *
 * @since 3.1.0
 *
 * @global wpdb      $wpdb      WordPress database abstraction object.
 * @global WP_Locale $wp_locale WordPress date and time locale object.
 *
 * @param string $post_type The post type. Default 'post'.
 */
function export_date_options( $post_type = 'post' ) {
	global $wpdb, $wp_locale;

	$months = $wpdb->get_results(
		$wpdb->prepare(
			"SELECT DISTINCT YEAR( post_date ) AS year, MONTH( post_date ) AS month
			FROM $wpdb->posts
			WHERE post_type = %s AND post_status != 'auto-draft'
			ORDER BY post_date DESC",
			$post_type
		)
	);

	$month_count = count( $months );
	if ( ! $month_count || ( 1 === $month_count && 0 === (int) $months[0]->month ) ) {
		return;
	}

	foreach ( $months as $date ) {
		if ( 0 === (int) $date->year ) {
			continue;
		}

		$month = zeroise( $date->month, 2 );

		printf(
			'<option value="%1$s">%2$s</option>',
			esc_attr( $date->year . '-' . $month ),
			$wp_locale->get_month( $month ) . ' ' . $date->year
		);
	}
}
?>

<div class="wrap">
<h1><?php echo esc_html( $title ); ?></h1>

<p><?php _e( 'When you click the button below DMPress will create an XML file for you to save to your computer.' ); ?></p>
<p><?php _e( 'This format, which is called DMPress eXtended RSS or WXR, will contain your content, comments, custom fields and terms.' ); ?></p>
<p><?php _e( 'Once you&#8217;ve saved the download file, you can use the Import function in another DMPress installation to import the content from this site.' ); ?></p>

<h2><?php _e( 'Choose what to export' ); ?></h2>
<form method="get" id="export-filters">
<fieldset>
<legend class="screen-reader-text">
	<?php
	/* translators: Hidden accessibility text. */
	_e( 'Content to export' );
	?>
</legend>
<input type="hidden" name="download" value="true" />
<p><label><input type="radio" name="content" value="all" checked="checked" aria-describedby="all-content-desc" /> <?php _e( 'All content' ); ?></label></p>
<p class="description" id="all-content-desc"><?php _e( 'This will contain all of your content, comments, custom fields, terms and navigation menus.' ); ?></p>

<?php
/*
 * DMPress: 'post' is a deletable Content-Type Builder entry, so this block —
 * which offers the richer category/author/date/status filters — only renders
 * while the type exists. The loop over custom post types below skips 'post' so
 * it is not offered twice.
 */
if ( post_type_exists( 'post' ) ) :
	?>
<p><label><input type="radio" name="content" value="posts" /> <?php _ex( 'Posts', 'post type general name' ); ?></label></p>
<ul id="post-filters" class="export-filters">
	<?php // DMPress: the category taxonomy is optional and may be deactivated. ?>
	<?php if ( taxonomy_exists( 'category' ) ) : ?>
	<li>
		<label><span class="label-responsive"><?php _e( 'Categories:' ); ?></span>
		<?php wp_dropdown_categories( array( 'show_option_all' => __( 'All' ) ) ); ?>
		</label>
	</li>
	<?php endif; ?>
	<li>
		<label><span class="label-responsive"><?php _e( 'Authors:' ); ?></span>
		<?php
		$authors = $wpdb->get_col( "SELECT DISTINCT post_author FROM {$wpdb->posts} WHERE post_type = 'post'" );
		wp_dropdown_users(
			array(
				'include'         => $authors,
				'name'            => 'post_author',
				'multi'           => true,
				'show_option_all' => __( 'All' ),
				'show'            => 'display_name_with_login',
			)
		);
		?>
		</label>
	</li>
	<li>
		<fieldset>
		<legend class="screen-reader-text">
			<?php
			/* translators: Hidden accessibility text. */
			_e( 'Date range:' )
			?>
		</legend>
		<label for="post-start-date" class="label-responsive"><?php _e( 'Start date:' ); ?></label>
		<select name="post_start_date" id="post-start-date">
			<option value="0"><?php _e( '&mdash; Select &mdash;' ); ?></option>
			<?php export_date_options(); ?>
		</select>
		<label for="post-end-date" class="label-responsive"><?php _e( 'End date:' ); ?></label>
		<select name="post_end_date" id="post-end-date">
			<option value="0"><?php _e( '&mdash; Select &mdash;' ); ?></option>
			<?php export_date_options(); ?>
		</select>
		</fieldset>
	</li>
	<li>
		<label for="post-status" class="label-responsive"><?php _e( 'Status:' ); ?></label>
		<select name="post_status" id="post-status">
			<option value="0"><?php _e( 'All' ); ?></option>
			<?php
			$post_statuses = get_post_stati( array( 'internal' => false ), 'objects' );
			foreach ( $post_statuses as $status ) :
				?>
			<option value="<?php echo esc_attr( $status->name ); ?>"><?php echo esc_html( $status->label ); ?></option>
			<?php endforeach; ?>
		</select>
	</li>
</ul>

<?php endif; // post_type_exists( 'post' ) ?>

<?php
/*
 * DMPress: there is no hard-coded Pages block — the 'page' type was removed
 * from core. If an administrator recreates it in the Content-Type Builder it
 * appears in the list below like any other content type.
 */
foreach ( get_post_types(
	array(
		'_builtin'   => false,
		'can_export' => true,
	),
	'objects'
) as $post_type ) :
	// DMPress: 'post' has its own block above, with filters; do not repeat it.
	if ( 'post' === $post_type->name ) {
		continue;
	}
	?>
<p><label><input type="radio" name="content" value="<?php echo esc_attr( $post_type->name ); ?>" /> <?php echo esc_html( $post_type->label ); ?></label></p>
<?php endforeach; ?>

<p><label><input type="radio" name="content" value="attachment" /> <?php _e( 'Media' ); ?></label></p>
<ul id="attachment-filters" class="export-filters">
	<li>
		<fieldset>
		<legend class="screen-reader-text">
			<?php
			/* translators: Hidden accessibility text. */
			_e( 'Date range:' );
			?>
		</legend>
		<label for="attachment-start-date" class="label-responsive"><?php _e( 'Start date:' ); ?></label>
		<select name="attachment_start_date" id="attachment-start-date">
			<option value="0"><?php _e( '&mdash; Select &mdash;' ); ?></option>
			<?php export_date_options( 'attachment' ); ?>
		</select>
		<label for="attachment-end-date" class="label-responsive"><?php _e( 'End date:' ); ?></label>
		<select name="attachment_end_date" id="attachment-end-date">
			<option value="0"><?php _e( '&mdash; Select &mdash;' ); ?></option>
			<?php export_date_options( 'attachment' ); ?>
		</select>
		</fieldset>
	</li>
</ul>

</fieldset>
<?php
/**
 * Fires at the end of the export filters form.
 *
 * @since 3.5.0
 */
do_action( 'export_filters' );
?>

<?php submit_button( __( 'Download Export File' ) ); ?>
</form>
</div>

<?php require_once ABSPATH . 'wp-admin/admin-footer.php'; ?>
