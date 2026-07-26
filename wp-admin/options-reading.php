<?php
/**
 * Reading settings administration panel.
 *
 * @package WordPress
 * @subpackage Administration
 */

/** WordPress Administration Bootstrap */
require_once __DIR__ . '/admin.php';

if ( ! current_user_can( 'manage_options' ) ) {
	wp_die( __( 'Sorry, you are not allowed to manage options for this site.' ) );
}

// Used in the HTML title tag.
$title       = __( 'Reading Settings' );
$parent_file = 'options-general.php';

add_action( 'admin_head', 'options_reading_add_js' );

get_current_screen()->add_help_tab(
	array(
		'id'      => 'overview',
		'title'   => __( 'Overview' ),
		'content' => '<p>' . __( 'This screen contains the settings that affect the display of your content.' ) . '</p>' .
			'<p>' . sprintf(
				/* translators: %s: URL to the Content-Type Builder. */
				__( 'You can choose what&#8217;s displayed on the homepage of your site: your latest posts, or a fixed entry from any content type. The choice is published to your front end over the REST API. Create and publish entries in the <a href="%s">Content-Type Builder</a> to make them selectable.' ),
				esc_url( admin_url( 'edit.php?post_type=acf-field-group' ) )
			) . '</p>' .
			'<p>' . sprintf(
				/* translators: %s: Documentation URL. */
				__( 'You can also control the display of your content in RSS feeds, including the maximum number of posts to display and whether to show full text or an excerpt. <a href="%s">Learn more about feeds</a>.' ),
				__( 'https://developer.wordpress.org/advanced-administration/wordpress/feeds/' )
			) . '</p>' .
			'<p>' . __( 'You must click the Save Changes button at the bottom of the screen for new settings to take effect.' ) . '</p>',
	)
);

get_current_screen()->add_help_tab(
	array(
		'id'      => 'site-visibility',
		'title'   => has_action( 'blog_privacy_selector' ) ? __( 'Site visibility' ) : __( 'Search engine visibility' ),
		'content' => '<p>' . __( 'You can choose whether or not your site will be crawled by robots, ping services, and spiders. If you want those services to ignore your site, click the checkbox next to &#8220;Discourage search engines from indexing this site&#8221; and click the Save Changes button at the bottom of the screen.' ) . '</p>' .
			'<p>' . __( 'Note that even when set to discourage search engines, your site is still visible on the web and not all search engines adhere to this directive.' ) . '</p>' .
			'<p>' . __( 'When this setting is in effect, a reminder is shown in the At a Glance box of the Dashboard that says, &#8220;Search engines discouraged&#8221;, to remind you that you have directed search engines to not crawl your site.' ) . '</p>',
	)
);

get_current_screen()->set_help_sidebar(
	'<p><strong>' . __( 'For more information:' ) . '</strong></p>' .
	'<p>' . __( '<a href="https://wordpress.org/documentation/article/settings-reading-screen/">Documentation on Reading Settings</a>' ) . '</p>' .
	'<p>' . __( '<a href="https://wordpress.org/support/forums/">Support forums</a>' ) . '</p>'
);

require_once ABSPATH . 'wp-admin/admin-header.php';
?>

<div class="wrap">
<h1><?php echo esc_html( $title ); ?></h1>

<form method="post" action="options.php">
<?php
settings_fields( 'reading' );

if ( ! is_utf8_charset() ) {
	add_settings_field( 'blog_charset', __( 'Encoding for pages and feeds' ), 'options_reading_blog_charset', 'reading', 'default', array( 'label_for' => 'blog_charset' ) );
}
?>

<?php
/*
 * DMPress: the homepage selector is not tied to the (removed) 'page' post type.
 * It offers any published entry from a public content type, and the choice is
 * published to the headless front end over REST at dmpress/v1/front-page (see
 * wp-includes/dmpress-front.php). show_on_front keeps its core values — 'posts'
 * for the latest-posts listing, 'page' for a fixed entry — so anything that
 * already checks those keeps working; only the pool of selectable entries
 * differs. The two IDs are stored in the same page_on_front / page_for_posts
 * options as before.
 */
$dmpress_front_entries = get_posts(
	array(
		'post_type'   => array_values(
			array_diff(
				get_post_types( array( 'public' => true ), 'names' ),
				array( 'attachment' )
			)
		),
		'post_status' => 'publish',
		'numberposts' => 200,
		'orderby'     => 'title',
		'order'       => 'ASC',
	)
);

// Show the content-type name alongside each entry only when more than one type
// can appear, so a single-type site stays uncluttered.
$dmpress_front_show_type = count(
	array_diff( get_post_types( array( 'public' => true ), 'names' ), array( 'attachment' ) )
) > 1;

/**
 * Builds a <select> of eligible front-page entries.
 *
 * @param string $name      Field name.
 * @param int    $selected  Currently selected entry ID.
 * @param array  $entries   Eligible WP_Post objects.
 * @param bool   $show_type Whether to append the content type to each label.
 * @return string Select HTML.
 */
$dmpress_front_dropdown = static function ( $name, $selected, $entries, $show_type ) {
	$html  = '<select name="' . esc_attr( $name ) . '" id="' . esc_attr( $name ) . '">';
	$html .= '<option value="0">' . esc_html__( '&mdash; Select &mdash;' ) . '</option>';

	foreach ( $entries as $entry ) {
		$label = '' !== $entry->post_title ? $entry->post_title : sprintf( __( '(no title) #%d' ), $entry->ID );
		$type  = get_post_type_object( $entry->post_type );

		if ( $show_type && $type ) {
			$label .= ' — ' . $type->labels->singular_name;
		}

		$html .= sprintf(
			'<option value="%d"%s>%s</option>',
			$entry->ID,
			selected( (int) $selected, $entry->ID, false ),
			esc_html( $label )
		);
	}

	$html .= '</select>';
	return $html;
};

// A fixed-entry homepage with no chosen entry falls back to the posts listing.
if ( 'page' === get_option( 'show_on_front' ) && ! get_option( 'page_on_front' ) && ! get_option( 'page_for_posts' ) ) {
	update_option( 'show_on_front', 'posts' );
}

$your_homepage_displays_title = __( 'Your homepage displays' );
?>
<table class="form-table" role="presentation">
<tr>
<th scope="row"><?php echo $your_homepage_displays_title; ?></th>
<td id="front-static-pages"><fieldset>
	<legend class="screen-reader-text"><span><?php echo $your_homepage_displays_title; ?></span></legend>
	<p><label>
		<input name="show_on_front" type="radio" value="posts" <?php checked( 'posts', get_option( 'show_on_front' ) ); ?> />
		<?php // DMPress: on a headless install "posts" means no fixed homepage entry is chosen, not a rendered latest-posts page. ?>
		<?php _e( 'Not set (default)' ); ?>
	</label>
	</p>
	<p><label>
		<input name="show_on_front" type="radio" value="page" <?php checked( 'page', get_option( 'show_on_front' ) ); ?> <?php disabled( empty( $dmpress_front_entries ) ); ?> />
		<?php _e( 'A fixed entry (select below)' ); ?>
	</label>
	</p>
<?php if ( empty( $dmpress_front_entries ) ) : ?>
	<p class="description">
		<?php
		printf(
			/* translators: %s: URL to the Content-Type Builder. */
			__( 'No published entries yet. Create a content type and publish an entry in the <a href="%s">Content-Type Builder</a>, then it can be set as your homepage.' ),
			esc_url( admin_url( 'edit.php?post_type=acf-field-group' ) )
		);
		?>
	</p>
<?php else : ?>
<ul>
	<li><label for="page_on_front">
	<?php
	printf(
		/* translators: %s: Select field to choose the front page. */
		__( 'Homepage: %s' ),
		$dmpress_front_dropdown( 'page_on_front', (int) get_option( 'page_on_front' ), $dmpress_front_entries, $dmpress_front_show_type )
	);
	?>
</label></li>
</ul>
	<?php
	/*
	 * DMPress: the "Posts page" field is hidden. page_for_posts is in the
	 * 'reading' allow-list, and options.php clears any allow-listed option that
	 * is absent from the POST, so the stored value is round-tripped through a
	 * hidden input rather than dropped from the allow-list — nothing is wiped on
	 * save, and the value stays available to the headless front-page REST
	 * contract (dmpress/v1/front-page). The old "should not be the same entry"
	 * warning is gone with the field, as it compared two now-single choices.
	 */
	?>
	<input type="hidden" name="page_for_posts" value="<?php echo (int) get_option( 'page_for_posts' ); ?>" />
<?php endif; ?>
</fieldset></td>
</tr>
<tr>
<th scope="row"><label for="posts_per_page"><?php _e( 'Blog pages show at most' ); ?></label></th>
<td>
<input name="posts_per_page" type="number" step="1" min="1" id="posts_per_page" value="<?php form_option( 'posts_per_page' ); ?>" class="small-text" /> <?php _e( 'posts' ); ?>
</td>
</tr>
<tr>
<th scope="row"><label for="posts_per_rss"><?php _e( 'Syndication feeds show the most recent' ); ?></label></th>
<td><input name="posts_per_rss" type="number" step="1" min="1" id="posts_per_rss" value="<?php form_option( 'posts_per_rss' ); ?>" class="small-text" /> <?php _e( 'items' ); ?></td>
</tr>

<?php $rss_use_excerpt_title = __( 'For each post in a feed, include' ); ?>
<tr>
<th scope="row"><?php echo $rss_use_excerpt_title; ?> </th>
<td><fieldset>
	<legend class="screen-reader-text"><span><?php echo $rss_use_excerpt_title; ?></span></legend>
	<p>
		<label><input name="rss_use_excerpt" type="radio" value="0" <?php checked( 0, get_option( 'rss_use_excerpt' ) ); ?>	/> <?php _e( 'Full text' ); ?></label><br />
		<label><input name="rss_use_excerpt" type="radio" value="1" <?php checked( 1, get_option( 'rss_use_excerpt' ) ); ?> /> <?php _e( 'Excerpt' ); ?></label>
	</p>
	<p class="description">
		<?php
		printf(
			/* translators: %s: Documentation URL. */
			__( 'Your theme determines how content is displayed in browsers. <a href="%s">Learn more about feeds</a>.' ),
			__( 'https://developer.wordpress.org/advanced-administration/wordpress/feeds/' )
		);
		?>
	</p>
</fieldset></td>
</tr>

<?php $blog_privacy_selector_title = has_action( 'blog_privacy_selector' ) ? __( 'Site visibility' ) : __( 'Search engine visibility' ); ?>
<tr class="option-site-visibility">
<th scope="row"><?php echo $blog_privacy_selector_title; ?> </th>
<td><fieldset>
	<legend class="screen-reader-text"><span><?php echo $blog_privacy_selector_title; ?></span></legend>
<?php if ( has_action( 'blog_privacy_selector' ) ) : ?>
	<input id="blog-public" type="radio" name="blog_public" value="1" <?php checked( '1', get_option( 'blog_public' ) ); ?> />
	<label for="blog-public"><?php _e( 'Allow search engines to index this site' ); ?></label><br />
	<input id="blog-norobots" type="radio" name="blog_public" value="0" <?php checked( '0', get_option( 'blog_public' ) ); ?> />
	<label for="blog-norobots"><?php _e( 'Discourage search engines from indexing this site' ); ?></label>
	<p class="description"><?php _e( 'Note: Neither of these options blocks access to your site &mdash; it is up to search engines to honor your request.' ); ?></p>
	<?php
	/**
	 * Enables the legacy 'Site visibility' privacy options.
	 *
	 * By default the privacy options form displays a single checkbox to 'discourage' search
	 * engines from indexing the site. Hooking to this action serves a dual purpose:
	 *
	 * 1. Disable the single checkbox in favor of a multiple-choice list of radio buttons.
	 * 2. Open the door to adding additional radio button choices to the list.
	 *
	 * Hooking to this action also converts the 'Search engine visibility' heading to the more
	 * open-ended 'Site visibility' heading.
	 *
	 * @since 2.1.0
	 */
	do_action( 'blog_privacy_selector' );
	?>
<?php else : ?>
	<label for="blog_public"><input name="blog_public" type="checkbox" id="blog_public" value="0" <?php checked( '0', get_option( 'blog_public' ) ); ?> />
	<?php _e( 'Discourage search engines from indexing this site' ); ?></label>
	<p class="description"><?php _e( 'It is up to search engines to honor this request.' ); ?></p>
<?php endif; ?>
</fieldset></td>
</tr>

<?php do_settings_fields( 'reading', 'default' ); ?>
</table>

<?php do_settings_sections( 'reading' ); ?>

<?php submit_button(); ?>
</form>
</div>
<?php require_once ABSPATH . 'wp-admin/admin-footer.php'; ?>
