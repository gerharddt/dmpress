<?php
/**
 * Themes administration panel.
 *
 * DMPress themes are metadata only: a theme is a folder containing a
 * `theme.json` manifest (name, version, and optionally description/author).
 * There is nothing to preview or edit, so this screen simply lists the
 * installed themes and lets one be activated. Activating a theme deactivates
 * whichever theme was previously active.
 *
 * @package DMPress
 * @subpackage Administration
 */

/** DMPress Administration Bootstrap */
require_once __DIR__ . '/admin.php';

if ( ! current_user_can( 'switch_themes' ) && ! current_user_can( 'edit_theme_options' ) ) {
	wp_die(
		'<h1>' . __( 'You need a higher level of permission.' ) . '</h1>' .
		'<p>' . __( 'Sorry, you are not allowed to edit theme options on this site.' ) . '</p>',
		403
	);
}

// Activating a theme is the only action this screen performs.
if ( current_user_can( 'switch_themes' ) && isset( $_GET['action'] ) && 'activate' === $_GET['action'] ) {
	check_admin_referer( 'switch-theme_' . $_GET['stylesheet'] );

	$theme = wp_get_theme( $_GET['stylesheet'] );

	if ( ! $theme->exists() || ! $theme->is_allowed() ) {
		wp_die(
			'<h1>' . __( 'An error occurred.' ) . '</h1>' .
			'<p>' . __( 'The requested theme does not exist.' ) . '</p>',
			403
		);
	}

	switch_theme( $theme->get_stylesheet() );
	wp_redirect( admin_url( 'themes.php?activated=true' ) );
	exit;
}

// Used in the HTML title tag.
$title       = __( 'Themes' );
$parent_file = 'themes.php';

require_once ABSPATH . 'wp-admin/admin-header.php';

$dmpress_current_stylesheet = get_stylesheet();
$dmpress_themes             = wp_get_themes();
?>
<div class="wrap">
	<h1 class="wp-heading-inline"><?php esc_html_e( 'Themes' ); ?>
		<span class="title-count theme-count"><?php echo count( $dmpress_themes ); ?></span>
	</h1>

	<hr class="wp-header-end">

	<?php if ( isset( $_GET['activated'] ) ) : ?>
		<?php
		wp_admin_notice(
			__( 'Theme activated.' ),
			array(
				'type'        => 'success',
				'dismissible' => true,
			)
		);
		?>
	<?php endif; ?>

	<p class="description">
		<?php esc_html_e( 'A theme provides the name and version reported by this site. Only one theme is active at a time — activating a theme deactivates the current one.' ); ?>
	</p>

	<style>
		.dmpress-theme-list { margin: 1.5em 0 0; max-width: 52rem; }
		.dmpress-theme { display: flex; align-items: flex-start; justify-content: space-between; gap: 1.5rem;
			background: #fff; border: 1px solid #c3c4c7; border-radius: 4px; padding: 1rem 1.25rem; margin-bottom: .75rem; }
		.dmpress-theme.is-active { border-left: 4px solid #2271b1; }
		.dmpress-theme-info { min-width: 0; }
		.dmpress-theme-name { margin: 0 0 .25rem; font-size: 1.05rem; }
		.dmpress-theme-meta { margin: 0 0 .35rem; color: #50575e; font-size: 12px; }
		.dmpress-theme-desc { margin: 0; color: #50575e; }
		.dmpress-theme-actions { flex: 0 0 auto; padding-top: .15rem; }
		.dmpress-theme-active-label { color: #2271b1; font-weight: 600; }
	</style>

	<div class="dmpress-theme-list">
		<?php foreach ( $dmpress_themes as $dmpress_stylesheet => $dmpress_theme ) : ?>
			<?php
			if ( ! $dmpress_theme->is_allowed() ) {
				continue;
			}

			$dmpress_is_active  = ( $dmpress_stylesheet === $dmpress_current_stylesheet );
			$dmpress_name       = $dmpress_theme->display( 'Name', false, true );
			$dmpress_version    = $dmpress_theme->display( 'Version', false, true );
			$dmpress_author     = $dmpress_theme->display( 'Author', false, true );
			$dmpress_desc       = $dmpress_theme->display( 'Description', false, true );
			$dmpress_activate   = wp_nonce_url(
				admin_url( 'themes.php?action=activate&amp;stylesheet=' . urlencode( $dmpress_stylesheet ) ),
				'switch-theme_' . $dmpress_stylesheet
			);
			?>
			<div class="dmpress-theme<?php echo $dmpress_is_active ? ' is-active' : ''; ?>">
				<div class="dmpress-theme-info">
					<h2 class="dmpress-theme-name">
						<?php echo esc_html( $dmpress_name ? $dmpress_name : $dmpress_stylesheet ); ?>
					</h2>
					<p class="dmpress-theme-meta">
						<?php
						$dmpress_meta = array();

						if ( $dmpress_version ) {
							/* translators: %s: Theme version. */
							$dmpress_meta[] = sprintf( __( 'Version %s' ), $dmpress_version );
						}

						if ( $dmpress_author ) {
							/* translators: %s: Theme author. */
							$dmpress_meta[] = sprintf( __( 'By %s' ), wp_strip_all_tags( $dmpress_author ) );
						}

						$dmpress_meta[] = sprintf( '<code>%s</code>', esc_html( $dmpress_stylesheet ) );

						echo wp_kses_post( implode( ' &middot; ', $dmpress_meta ) );
						?>
					</p>
					<?php if ( $dmpress_desc ) : ?>
						<p class="dmpress-theme-desc"><?php echo wp_kses_post( $dmpress_desc ); ?></p>
					<?php endif; ?>
				</div>
				<div class="dmpress-theme-actions">
					<?php if ( $dmpress_is_active ) : ?>
						<span class="dmpress-theme-active-label"><?php esc_html_e( 'Active' ); ?></span>
					<?php elseif ( current_user_can( 'switch_themes' ) ) : ?>
						<a href="<?php echo esc_url( $dmpress_activate ); ?>" class="button button-primary">
							<?php esc_html_e( 'Activate' ); ?>
						</a>
					<?php endif; ?>
				</div>
			</div>
		<?php endforeach; ?>
	</div>
</div>
<?php
require_once ABSPATH . 'wp-admin/admin-footer.php';
