# Releasing DMPress

This is the maintainer runbook for publishing a DMPress version. It is the single
source of truth for the release process — keep it in the repo so it can never go
missing.

DMPress does **not** use the wordpress.org update channel. It has its own,
described in the "Core self-update" section of [DMPRESS-CHANGES.md](DMPRESS-CHANGES.md)
and implemented in [`wp-includes/dmpress-update.php`](wp-includes/dmpress-update.php).
Installs check a signed manifest twice a day and offer **Dashboard → Updates →
"Update to version X"**; nothing installs until an admin clicks.

Everything is **Ed25519-signed**. The channel is **dormant** — it offers nothing —
until the one-time setup below is done.

---

## One-time setup

Do this once, ever.

### 1. Generate the signing keypair

```bash
php bin/dmpress-keygen.php
```

It prints a **public** key and a **private** key.

### 2. Install the public key

Paste the public key into the `DMPRESS_UPDATE_PUBLIC_KEY` constant in
[`wp-includes/dmpress-update.php`](wp-includes/dmpress-update.php), commit, and push.
The public key is safe to commit.

### 3. Store the private key as a GitHub secret

In the GitHub repo: **Settings → Secrets and variables → Actions → New repository
secret**, named exactly:

```
DMPRESS_SIGNING_KEY
```

Paste the private key as its value.

> **The private key is the crown jewel.** Anyone who holds it can push code to
> every DMPress install. It must live **only** in GitHub Secrets (and, ideally, a
> backup in a password manager / secrets vault). Never commit it, never paste it
> into the codebase, never send it to anyone, never store it in plain files on a
> laptop. If it leaks, treat it as a security incident: generate a new pair, ship
> the new public key in an update, and stop using the old one.

### 4. Make the repo (or its releases) public

Installs download release assets **without authenticating**. If the repository is
private, GitHub requires auth to fetch release assets and updates will fail. Make
the repo public, or at minimum ensure its releases are publicly downloadable.

---

## Publishing a release

Once the setup above is done, every release is three git commands.

### 1. Bump the version and commit

Edit `$dmpress_version` in [`wp-includes/version.php`](wp-includes/version.php).
Use semantic versioning; pre-release suffixes are ordered correctly
(`1.0.0-beta.48 < 1.0.0-beta.49 < 1.0.0 < 1.0.1`).

```bash
git commit -am "Release 1.0.0-beta.49"
git push
```

### 2. Tag it — the tag must match `$dmpress_version` exactly

```bash
git tag v1.0.0-beta.49
```

The tag is the version with a leading `v`. If it disagrees with
`$dmpress_version`, the workflow fails before building.

### 3. Push the tag

```bash
git push origin v1.0.0-beta.49
```

That's it. Pushing the tag triggers
[`.github/workflows/release.yml`](.github/workflows/release.yml), which:

1. checks the tag matches `$dmpress_version` and the signing secret is present;
2. packages the tagged commit (`git archive` under a `dmpress/` prefix — tracked
   files only, so `wp-config.php`, uploads, the `/front` build and dev-only paths
   are excluded automatically);
3. signs the zip with the `DMPRESS_SIGNING_KEY` secret;
4. creates a GitHub Release with three assets: `dmpress-<version>.zip`, its
   `.sig`, and `dmpress-update.json`.

Installs pick it up on their next check (within ~12 hours), or immediately if an
admin loads **Dashboard → Updates**.

---

## Before you trust it: test on a throwaway install

Signing stops a **tampered** package. It does **not** stop a **bad-but-validly
signed** one — a broken release will install cleanly, and the updater's rollback
only covers a *failed* copy, not a bad release. So for the first real release, and
any release you are unsure about:

1. Point a **disposable** second install at the new release.
2. Click **Update now**, let it apply, and confirm the site still works and reports
   the new `$dmpress_version`.
3. Only then consider it good for real sites.

This is why updates are **manual-apply only** — a bad release cannot silently reach
every install at once.

---

## Building by hand (fallback)

If you ever need to build without GitHub Actions:

```bash
DMPRESS_SIGNING_KEY="$(cat /path/to/private.key)" bin/build-release.sh
```

This produces the same three files in `build/`. Create the GitHub Release and
upload them yourself — the manifest **must** be attached as `dmpress-update.json`
so the stable "latest" URL resolves to it.

---

## Rotating the signing key

If the private key is lost or compromised:

1. Generate a new pair (`php bin/dmpress-keygen.php`).
2. Ship the **new public key** in `DMPRESS_UPDATE_PUBLIC_KEY` in a normal release,
   signed with the **old** key (so existing installs, which still trust the old
   key, accept the update that teaches them the new one).
3. Replace the `DMPRESS_SIGNING_KEY` secret with the new private key.
4. Sign all subsequent releases with the new key.

Installs that skip the transition release will need a manual re-install, so
rotate deliberately and announce it.
