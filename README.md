# DMPress

**A content and data management platform.**

DMPress is a fork of **WordPress 7.0**, re-focused as a **headless, data-management CMS**. The block editor (Gutenberg) has been removed entirely in favour of a leaner core built around structured content and data.

> **Status:** `1.0.0-beta.17` — pre-release. Not yet recommended for production.

---

## What's different

| | WordPress 7.0 | DMPress |
|---|---|---|
| Editor | Block editor (Gutenberg) | Classic editor only |
| Front end | Server-rendered by core | **Headless** — `index.php` boots the CMS only for REST requests |
| Themes | `style.css` + PHP templates | A single `theme.json` manifest (name + version) |
| Content types | `post` and `page` hard-coded | Defined in the **Content-Type Builder**; both are deletable |
| Taxonomies | `category` and `post_tag` hard-coded | Content-Type Builder entries; can be renamed, disabled or removed |
| Custom fields | Plugin territory | Built in — part of the **Content-Type Builder** |
| Admin menu | Flat top-level items | Consolidated **Admin** menu with grouped headings |
| Comments | Global sidebar item | Per-post-type submenu, enabled per type |

Also removed: Site Health, the Settings → Privacy and Connectors sections, the Customizer and Theme File Editor menu entries, the dashboard content widgets, and core self-update.

The full, itemised record of every change relative to stock WordPress 7.0 is in **[DMPRESS-CHANGES.md](DMPRESS-CHANGES.md)**.

## Plugin compatibility

DMPress keeps the `wp` namespace throughout — internally, in hooks, and on the REST API — so the existing plugin ecosystem continues to work. Core carries two version numbers:

- `$wp_version` stays at **`7.0`** — what plugins check via `Requires at least`, and what wordpress.org APIs and WP-CLI see.
- `$dmpress_version` (**`1.0.0-beta.17`**) is the product version shown to users.

Plugins that depend on the block editor will not function, but they load without fatal errors: an inert block API shim (`wp-includes/block-compat.php`) keeps `register_block_type()`, `has_blocks()`, `parse_blocks()` and friends callable as no-ops.

## Requirements

**Minimum**

- PHP 7.4 or greater
- MySQL 5.5.5 or greater

**Recommended**

- PHP 8.3 or greater
- MySQL 8.0+ or MariaDB 10.6+
- The Apache [`mod_rewrite`](https://httpd.apache.org/docs/2.2/mod/mod_rewrite.html) module
- HTTPS

## Installation

1. Unzip the package into an empty directory and upload everything.
2. Open `wp-admin/install.php` in your browser. It will walk you through creating a `wp-config.php` with your database connection details.
   - If that does not work on your host, copy `wp-config-sample.php` to `wp-config.php`, fill in your database details by hand, upload it, and reopen `wp-admin/install.php`.
3. The installer creates the tables your site needs. If it errors, re-check `wp-config.php` and try again.
4. **If you did not choose a password, note the one you are given.** If you did not choose a username, it is `admin`.
5. Sign in at `wp-login.php` with those credentials.

`wp-config.php` holds your database credentials and security keys — it is gitignored and must never be committed.

## Documentation

- **[DMPRESS-CHANGES.md](DMPRESS-CHANGES.md)** — everything removed from WordPress, everything added by DMPress, third-party components, and the known consequences of each decision.
- **[CREDITS.md](CREDITS.md)** — attribution for WordPress, Secure Custom Fields, and every bundled library.

## License & credits

DMPress is free software, released under the terms of the **GPL (GNU General Public License) version 2 or, at your option, any later version**. See [license.txt](license.txt).

DMPress is a derivative work of [WordPress](https://wordpress.org/), which is itself the official continuation of b2/cafélog. All original WordPress copyrights remain with their respective authors. DMPress also bundles [Secure Custom Fields](https://wordpress.org/plugins/secure-custom-fields/) (GPL). Full attribution is in [CREDITS.md](CREDITS.md); the changes DMPress makes to WordPress are recorded in [DMPRESS-CHANGES.md](DMPRESS-CHANGES.md), as required by GPL §2(a).

**Trademark notice:** "WordPress" is a registered trademark of the [WordPress Foundation](https://wordpressfoundation.org/). DMPress is an independent fork and is not affiliated with, sponsored by, or endorsed by the WordPress Foundation, Automattic, or the WordPress project.
