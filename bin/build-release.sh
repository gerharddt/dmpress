#!/usr/bin/env bash
#
# Build and sign a DMPress release package.
#
# Produces, in build/:
#   dmpress-<version>.zip       the release, with everything under dmpress/
#   dmpress-<version>.zip.sig   the detached Ed25519 signature (base64)
#   dmpress-update.json         the manifest installs check
#
# Upload all three to a GitHub Release. The manifest's download/signature URLs
# assume the GitHub Releases layout for this repo; adjust REPO/BASE_URL if that
# changes.
#
# The private signing key is read from the DMPRESS_SIGNING_KEY environment
# variable (base64, from bin/dmpress-keygen.php). It is never written to disk by
# this script and must never be committed.
#
# Usage:
#   DMPRESS_SIGNING_KEY="$(cat /path/to/private.key)" bin/build-release.sh
#
set -euo pipefail

REPO="gerharddt/dmpress"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BUILD="$ROOT/build"

cd "$ROOT"

# --- version, read straight from the source of truth -------------------------
VERSION="$(php -r 'require "wp-includes/version.php"; echo $dmpress_version;')"
if [ -z "$VERSION" ]; then
	echo "Could not read \$dmpress_version from wp-includes/version.php" >&2
	exit 1
fi

TAG="v$VERSION"
ZIP_NAME="dmpress-$VERSION.zip"
ZIP="$BUILD/$ZIP_NAME"
SIG="$ZIP.sig"
MANIFEST="$BUILD/dmpress-update.json"
BASE_URL="https://github.com/$REPO/releases/download/$TAG"

if [ -z "${DMPRESS_SIGNING_KEY:-}" ]; then
	echo "DMPRESS_SIGNING_KEY is not set — cannot sign the release." >&2
	echo "Generate a key once with: php bin/dmpress-keygen.php" >&2
	exit 1
fi

mkdir -p "$BUILD"
rm -f "$ZIP" "$SIG" "$MANIFEST"

# --- package: tracked files only, under a dmpress/ prefix --------------------
# git archive emits only committed, tracked files, so wp-config.php, uploads,
# the /front build and other gitignored paths are excluded automatically.
# .gitattributes 'export-ignore' drops dev-only paths (bin/, .claude/, etc.).
echo "Packaging $ZIP_NAME from $(git rev-parse --short HEAD)…"
git archive --format=zip --prefix=dmpress/ -o "$ZIP" HEAD

# --- sign: over the raw sha384 hash, matching verify_file_signature() --------
echo "Signing…"
php -r '
	$zip = $argv[1];
	$key = base64_decode(getenv("DMPRESS_SIGNING_KEY"));
	if (strlen($key) !== SODIUM_CRYPTO_SIGN_SECRETKEYBYTES) {
		fwrite(STDERR, "DMPRESS_SIGNING_KEY is not a valid Ed25519 secret key.\n");
		exit(1);
	}
	// WordPress verifies the signature against the raw sha384 hash of the file.
	$hash = hash_file("sha384", $zip, true);
	$sig  = sodium_crypto_sign_detached($hash, $key);
	file_put_contents($argv[2], base64_encode($sig));
' "$ZIP" "$SIG"

# --- manifest ----------------------------------------------------------------
REQUIRES_PHP="7.4"
RELEASED="$(date -u +%Y-%m-%d)"

cat > "$MANIFEST" <<JSON
{
	"version": "$VERSION",
	"download_url": "$BASE_URL/$ZIP_NAME",
	"signature_url": "$BASE_URL/$ZIP_NAME.sig",
	"requires_php": "$REQUIRES_PHP",
	"released": "$RELEASED",
	"notes_url": "https://github.com/$REPO/releases/tag/$TAG"
}
JSON

echo
echo "Built:"
echo "  $ZIP"
echo "  $SIG"
echo "  $MANIFEST"
echo
echo "Next:"
echo "  1. Tag the release:   git tag $TAG && git push origin $TAG"
echo "  2. Create a GitHub Release for $TAG and attach all three files above."
echo "     The manifest must be attached as 'dmpress-update.json' so the stable"
echo "     'latest' URL resolves to it."
