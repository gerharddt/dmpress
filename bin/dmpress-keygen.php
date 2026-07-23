<?php
/**
 * DMPress release signing key generator.
 *
 * Run this ONCE to create the Ed25519 keypair used to sign release packages:
 *
 *     php bin/dmpress-keygen.php
 *
 * It prints two things:
 *
 *   1. A PUBLIC key — paste it into the DMPRESS_UPDATE_PUBLIC_KEY constant in
 *      wp-includes/dmpress-update.php (or define it in wp-config.php). It is
 *      public by nature and safe to commit.
 *
 *   2. A PRIVATE key — this signs your releases. Treat it like a password:
 *      store it somewhere secret (a password manager or a secrets vault),
 *      NEVER commit it, and never paste it into the codebase. Anyone who holds
 *      it can push code to every DMPress install. If it leaks, generate a new
 *      pair, ship the new public key in an update, and stop using the old one.
 *
 * The keys are compatible with WordPress's own verify_file_signature()
 * (Ed25519 via libsodium), which is what DMPress uses to check updates.
 *
 * @package DMPress
 */

if ( 'cli' !== PHP_SAPI ) {
	fwrite( STDERR, "This script must be run from the command line.\n" );
	exit( 1 );
}

if ( ! function_exists( 'sodium_crypto_sign_keypair' ) ) {
	// Fall back to the bundled sodium_compat polyfill if native sodium is absent.
	$compat = __DIR__ . '/../wp-includes/sodium_compat/autoload.php';

	if ( is_readable( $compat ) ) {
		require_once $compat;
	}
}

if ( ! function_exists( 'sodium_crypto_sign_keypair' ) ) {
	fwrite( STDERR, "libsodium is not available and the bundled polyfill could not be loaded.\n" );
	exit( 1 );
}

$keypair     = sodium_crypto_sign_keypair();
$secret_key  = sodium_crypto_sign_secretkey( $keypair );
$public_key  = sodium_crypto_sign_publickey( $keypair );

echo "DMPress release signing keypair\n";
echo "===============================\n\n";

echo "PUBLIC KEY  (commit this — paste into DMPRESS_UPDATE_PUBLIC_KEY):\n";
echo base64_encode( $public_key ) . "\n\n";

echo "PRIVATE KEY (KEEP SECRET — never commit; store in a vault):\n";
echo base64_encode( $secret_key ) . "\n\n";

echo "Next steps:\n";
echo "  1. Put the public key in wp-includes/dmpress-update.php.\n";
echo "  2. Store the private key somewhere secret; pass it to bin/build-release.sh\n";
echo "     at release time via the DMPRESS_SIGNING_KEY environment variable.\n";
