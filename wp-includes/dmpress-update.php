<?php
/**
 * DMPress update channel.
 *
 * WordPress's core self-update is disabled in DMPress (see wp_version_check() in
 * wp-includes/update.php): $wp_version is pinned to 7.0 for plugin
 * compatibility, so the wordpress.org channel would offer — and install — stock
 * WordPress over the fork.
 *
 * This is a separate channel, keyed on $dmpress_version, that checks a signed
 * manifest published with each DMPress release and, when a newer version is
 * available, populates the standard `update_core` transient so the existing
 * Dashboard → Updates screen and the WP_Upgrader engine handle the rest.
 *
 * Nothing here contacts api.wordpress.org.
 *
 * Security model: releases are Ed25519-signed. The public key ships in this
 * file; the private key is held only by the release maintainer. An update is
 * verified with WordPress's own verify_file_signature() before it is applied
 * (see the 'upgrader_pre_download' filter below), so a spoofed or tampered
 * package cannot be installed. If no public key is configured the channel is
 * dormant — it never offers an update it could not verify.
 *
 * @package DMPress
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * URL of the release manifest.
 *
 * Defaults to the stable "latest release asset" redirect on GitHub Releases.
 * Override with the DMPRESS_UPDATE_MANIFEST_URL constant (e.g. for staging).
 */
if ( ! defined( 'DMPRESS_UPDATE_MANIFEST_URL' ) ) {
	define( 'DMPRESS_UPDATE_MANIFEST_URL', 'https://github.com/gerharddt/dmpress/releases/latest/download/dmpress-update.json' );
}

/**
 * Base64-encoded Ed25519 public key that release packages are signed with.
 *
 * Public by nature; safe to ship. Generate a keypair with bin/dmpress-keygen.php,
 * keep the private key secret and out of the repository, and paste the public
 * key here. While this is empty the update channel is dormant.
 */
if ( ! defined( 'DMPRESS_UPDATE_PUBLIC_KEY' ) ) {
	define( 'DMPRESS_UPDATE_PUBLIC_KEY', 'w4oXQvCY1Y+t1iK7ppdJ8G0vqfq1IsugTK9N1bdw/uA=' );
}

/**
 * Name of the cron event that runs the manifest check.
 */
const DMPRESS_UPDATE_CRON_HOOK = 'dmpress_update_check';

/**
 * Option storing the timestamp of the last manifest check, for throttling.
 */
const DMPRESS_UPDATE_LAST_CHECK_OPTION = 'dmpress_update_last_check';

/**
 * Whether the update channel is configured (a public key is present).
 *
 * @since DMPress 1.0.0
 *
 * @return bool
 */
function dmpress_update_enabled() {
	return '' !== trim( (string) DMPRESS_UPDATE_PUBLIC_KEY );
}

/**
 * Adds the DMPress release public key to the trusted signing keys.
 *
 * verify_file_signature() checks a package against every key returned here, so
 * this is all that is needed to teach core's verifier about DMPress packages.
 *
 * @since DMPress 1.0.0
 *
 * @param string[] $keys Trusted keys.
 * @return string[]
 */
function dmpress_update_trusted_keys( $keys ) {
	if ( dmpress_update_enabled() ) {
		$keys[] = trim( (string) DMPRESS_UPDATE_PUBLIC_KEY );
	}

	return $keys;
}
add_filter( 'wp_trusted_keys', 'dmpress_update_trusted_keys' );

/**
 * Fetches and decodes the release manifest.
 *
 * @since DMPress 1.0.0
 *
 * @return array|WP_Error Manifest data, or WP_Error on failure.
 */
function dmpress_update_fetch_manifest() {
	$response = wp_remote_get(
		DMPRESS_UPDATE_MANIFEST_URL,
		array(
			'timeout'    => 10,
			'sslverify'  => true,
			'user-agent' => 'DMPress/' . $GLOBALS['dmpress_version'] . '; ' . home_url( '/' ),
		)
	);

	if ( is_wp_error( $response ) ) {
		return $response;
	}

	if ( 200 !== (int) wp_remote_retrieve_response_code( $response ) ) {
		return new WP_Error( 'dmpress_update_http', 'Unexpected response fetching the update manifest.' );
	}

	$data = json_decode( wp_remote_retrieve_body( $response ), true );

	if ( ! is_array( $data ) || empty( $data['version'] ) || empty( $data['download_url'] ) ) {
		return new WP_Error( 'dmpress_update_manifest', 'The update manifest is missing or malformed.' );
	}

	return $data;
}

/**
 * Checks the manifest and populates the `update_core` transient.
 *
 * Builds the same object shape the Dashboard → Updates screen and Core_Upgrader
 * already consume. Only `packages->full` is set: this deliberately forces
 * Core_Upgrader down its "full" download branch and avoids every $wp_version
 * comparison in class-core-upgrader.php (which would otherwise misbehave, since
 * $wp_version is frozen at 7.0).
 *
 * @since DMPress 1.0.0
 *
 * @param bool $force Bypass the throttle and check immediately.
 * @return void
 */
function dmpress_update_check( $force = false ) {
	// Dormant until a signing key is configured — never offer an unverifiable update.
	if ( ! dmpress_update_enabled() ) {
		return;
	}

	if ( ! $force ) {
		$last = (int) get_option( DMPRESS_UPDATE_LAST_CHECK_OPTION, 0 );

		// Throttle opportunistic checks to twice a day, matching core's cadence.
		if ( $last && ( time() - $last ) < 12 * HOUR_IN_SECONDS ) {
			return;
		}
	}

	update_option( DMPRESS_UPDATE_LAST_CHECK_OPTION, time() );

	$manifest = dmpress_update_fetch_manifest();

	if ( is_wp_error( $manifest ) ) {
		return;
	}

	$current = (string) $GLOBALS['dmpress_version'];
	$latest  = (string) $manifest['version'];

	$transient                  = new stdClass();
	$transient->last_checked    = time();
	$transient->version_checked = $current;
	$transient->updates         = array();

	// Only advertise an update when the manifest is genuinely newer.
	if ( version_compare( $latest, $current, '>' ) ) {
		$packages          = new stdClass();
		$packages->full    = esc_url_raw( $manifest['download_url'] );
		$packages->partial = false;
		$packages->new_bundled  = false;
		$packages->no_content   = false;
		$packages->rollback     = false;

		$update                        = new stdClass();
		$update->response              = 'upgrade';
		$update->current               = $latest;
		$update->version               = $latest;
		$update->locale                = 'en_US';
		$update->php_version           = isset( $manifest['requires_php'] ) ? (string) $manifest['requires_php'] : '7.4';
		$update->mysql_version         = isset( $manifest['requires_mysql'] ) ? (string) $manifest['requires_mysql'] : '5.5.5';
		$update->packages              = $packages;
		// DMPress-specific: where the detached signature for the package lives.
		$update->dmpress_signature_url = isset( $manifest['signature_url'] ) ? esc_url_raw( $manifest['signature_url'] ) : '';
		$update->dmpress_notes_url     = isset( $manifest['notes_url'] ) ? esc_url_raw( $manifest['notes_url'] ) : '';

		$transient->updates[] = $update;
	}

	set_site_transient( 'update_core', $transient );
}
/*
 * The scheduled check forces past the throttle: it is the authoritative
 * twice-daily check, and running it against a ~12 hour throttle would let the
 * two cadences drift into each other and silently skip checks.
 */
add_action(
	DMPRESS_UPDATE_CRON_HOOK,
	static function () {
		dmpress_update_check( true );
	}
);

/**
 * Runs an opportunistic, throttled check on admin page loads.
 *
 * @since DMPress 1.0.0
 *
 * @return void
 */
function dmpress_update_maybe_check() {
	if ( ! dmpress_update_enabled() || ! current_user_can( 'update_core' ) ) {
		return;
	}

	/*
	 * The "Check again" link on the updates screen sets force-check=1, which
	 * core routes to wp_version_check() — a no-op in DMPress. Honour it here, or
	 * the link would appear to work while the throttle silently ignored it.
	 */
	$force = ! empty( $_GET['force-check'] ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended

	dmpress_update_check( $force );
}
add_action( 'admin_init', 'dmpress_update_maybe_check' );

/**
 * Schedules the twice-daily manifest check.
 *
 * The wordpress.org core check (wp_version_check) stays unscheduled; this is its
 * DMPress replacement and runs only when the channel is configured.
 *
 * @since DMPress 1.0.0
 *
 * @return void
 */
function dmpress_update_schedule() {
	if ( ! dmpress_update_enabled() ) {
		// Clear a previously scheduled event if the key was later removed.
		$timestamp = wp_next_scheduled( DMPRESS_UPDATE_CRON_HOOK );
		if ( $timestamp ) {
			wp_unschedule_event( $timestamp, DMPRESS_UPDATE_CRON_HOOK );
		}
		return;
	}

	if ( ! wp_next_scheduled( DMPRESS_UPDATE_CRON_HOOK ) && ! wp_installing() ) {
		wp_schedule_event( time(), 'twicedaily', DMPRESS_UPDATE_CRON_HOOK );
	}
}
add_action( 'init', 'dmpress_update_schedule' );

/**
 * Verifies a DMPress package's signature before it is applied.
 *
 * Core_Upgrader downloads with signature checking hard-disabled, so this hook —
 * documented as a way to "short-circuit the download and return that value
 * instead" — is where DMPress enforces signing. For the DMPress package it
 * downloads the zip and its detached signature, verifies with core's own
 * verify_file_signature() (Ed25519, against the trusted key added above), and
 * returns the verified local file, or a WP_Error that aborts the update.
 *
 * @since DMPress 1.0.0
 *
 * @param bool|WP_Error|string $reply    Short-circuit value.
 * @param string               $package  The package URL being downloaded.
 * @param WP_Upgrader          $upgrader The upgrader instance.
 * @return bool|WP_Error|string
 */
function dmpress_update_verify_package( $reply, $package, $upgrader ) {
	// Let anything already short-circuited, or non-URL local files, pass through.
	if ( false !== $reply || ! preg_match( '#^https?://#i', (string) $package ) ) {
		return $reply;
	}

	$update = dmpress_update_find_by_package( $package );

	// Not our package — leave WordPress's normal handling untouched.
	if ( ! $update ) {
		return $reply;
	}

	if ( empty( $update->dmpress_signature_url ) ) {
		return new WP_Error(
			'dmpress_update_no_signature',
			__( 'This DMPress update cannot be installed because it is not signed.' )
		);
	}

	require_once ABSPATH . 'wp-admin/includes/file.php';

	// Download the package itself.
	$download = download_url( $package, 300 );

	if ( is_wp_error( $download ) ) {
		return $download;
	}

	// Download the detached signature.
	$sig_response = wp_remote_get( $update->dmpress_signature_url, array( 'timeout' => 30 ) );

	if ( is_wp_error( $sig_response ) || 200 !== (int) wp_remote_retrieve_response_code( $sig_response ) ) {
		wp_delete_file( $download );
		return new WP_Error(
			'dmpress_update_signature_fetch',
			__( 'The DMPress update signature could not be downloaded, so the update was not applied.' )
		);
	}

	$signature = trim( wp_remote_retrieve_body( $sig_response ) );

	// Verify with core's Ed25519 verifier against the trusted DMPress key.
	$verified = verify_file_signature( $download, array( $signature ), basename( $package ) );

	if ( true !== $verified ) {
		wp_delete_file( $download );

		return new WP_Error(
			'dmpress_update_signature_invalid',
			__( 'The DMPress update could not be verified and was not applied. The download may be corrupt or tampered with.' )
		);
	}

	return $download;
}
add_filter( 'upgrader_pre_download', 'dmpress_update_verify_package', 10, 3 );

/**
 * Finds the pending update whose full package matches a URL.
 *
 * @since DMPress 1.0.0
 *
 * @param string $package Package URL.
 * @return object|false
 */
function dmpress_update_find_by_package( $package ) {
	$transient = get_site_transient( 'update_core' );

	if ( ! isset( $transient->updates ) || ! is_array( $transient->updates ) ) {
		return false;
	}

	foreach ( $transient->updates as $update ) {
		if ( isset( $update->packages->full ) && $update->packages->full === $package ) {
			return $update;
		}
	}

	return false;
}
