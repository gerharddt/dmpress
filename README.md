# DMPress

**A content and data management platform.**

DMPress is a fork of **WordPress 7.0**, re-focused as a **headless, data-management CMS**. The block editor (Gutenberg) has been removed entirely in favour of a leaner core built around structured content and data.

> **Status:** `1.0.0-beta.46` — pre-release. Not yet recommended for production.

---

## What's different

| | WordPress 7.0 | DMPress |
|---|---|---|
| Editor | Block editor (Gutenberg) | Classic editor only |
| Front end | Server-rendered by core | **Headless** — the active theme's `index.html` is served with no WordPress boot; content comes from REST |
| Themes | `style.css` + PHP templates, parent/child | A `theme.json` manifest plus an `index.html` front end; no child themes |
| Content types | `post` and `page` hard-coded | Defined in the **Content-Type Builder**; both are deletable |
| Taxonomies | `category` and `post_tag` hard-coded | Content-Type Builder entries; can be renamed, disabled or removed |
| Custom fields | Plugin territory | Built in — part of the **Content-Type Builder** |
| Admin menu | Flat top-level items | Consolidated **Admin** menu with grouped headings |
| Comments | Global sidebar item | Per-post-type submenu, enabled per type |

Also removed: Site Health, the Settings → Privacy and Connectors sections, the Customizer and Theme File Editor menu entries, the dashboard content widgets, and core self-update.

The full, itemised record of every change relative to stock WordPress 7.0 is in **[DMPRESS-CHANGES.md](DMPRESS-CHANGES.md)**.

## Scope and release policy

DMPress aims to be **boring to upgrade**. WordPress ships major releases several times a year, each one broadening what the platform does. DMPress deliberately does the opposite: the scope — a headless CMS for structured content and data — is settled, and staying inside it is the point.

In practice:

- **Security and stability come first.** Security fixes and real bugs are the reason a release happens, and they ship as soon as they can be verified.
- **Releases are infrequent by design.** Fewer and smaller releases mean fewer regressions, less to re-test, and less reason to postpone an update. An upgrade you can apply without studying the changelog is the goal.
- **New features are the exception, not the rhythm.** Capabilities outside the project's scope will usually be declined even when they are good ideas — good ideas are not scarce, but a small and predictable surface is. Anything specific to one site belongs in a plugin, and the plugin API is kept intact precisely so that remains a real option.
- **Nothing is ripped out casually either.** Churn in either direction costs the people running the software.

This is a default, not a doctrine. If the ground genuinely moves — a shift in the market, a change in PHP or the browser platform, a new technology that changes what a CMS has to be — the scope gets reconsidered openly rather than quietly extended. The bar for that is "this changes what the software needs to be", not "this would be nice to have".

## Plugin compatibility

DMPress keeps the `wp` namespace throughout — internally, in hooks, and on the REST API — so the existing plugin ecosystem continues to work. Core carries two version numbers:

- `$wp_version` stays at **`7.0`** — what plugins check via `Requires at least`, and what wordpress.org APIs and WP-CLI see.
- `$dmpress_version` (**`1.0.0-beta.46`**) is the product version shown to users.

Plugins that depend on the block editor will not function, but they load without fatal errors: an inert block API shim (`wp-includes/block-compat.php`) keeps `register_block_type()`, `has_blocks()`, `parse_blocks()` and friends callable as no-ops.

## Permalinks and the front end

DMPress renders no HTML, so the permalink structure is not about page rendering — it is the **URL contract** between the CMS and your front end. The structure is published in every REST `link` field; your theme routes on those URLs.

Any path that is not a real file is served the active theme's `index.html`, so the front end can use real URLs and own its routing. Unknown paths answer `200` with the app shell, and the front end renders its own "not found".

A fresh install sets `/%postname%/` after verifying the web server routes unknown paths to `index.php`. Apache is configured automatically via `.htaccess`. **Nginx needs this manually:**

```nginx
location / {
    try_files $uri $uri/ /index.php?$args;
}
```

Without it, only `/` resolves and `/wp-json/` will 404 (REST still works at `?rest_route=`).

The **Plain** structure is supported too — the front end then routes on query strings rather than paths. The bundled starter theme handles both automatically.

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

## No warranty and limitation of liability

**DMPress is provided free of charge, "AS IS", without warranty of any kind.** This is not incidental — it is a condition of the GPL under which the software is distributed, and it applies to the original authors and to anyone who modifies or redistributes it.

In the words of the licence itself ([LICENSE](LICENSE), sections 11 and 12):

> BECAUSE THE PROGRAM IS LICENSED FREE OF CHARGE, THERE IS NO WARRANTY FOR THE PROGRAM, TO THE EXTENT PERMITTED BY APPLICABLE LAW. … THE ENTIRE RISK AS TO THE QUALITY AND PERFORMANCE OF THE PROGRAM IS WITH YOU.

> IN NO EVENT … WILL ANY COPYRIGHT HOLDER, OR ANY OTHER PARTY WHO MAY MODIFY AND/OR REDISTRIBUTE THE PROGRAM AS PERMITTED ABOVE, BE LIABLE TO YOU FOR DAMAGES, INCLUDING ANY GENERAL, SPECIAL, INCIDENTAL OR CONSEQUENTIAL DAMAGES ARISING OUT OF THE USE OR INABILITY TO USE THE PROGRAM (INCLUDING BUT NOT LIMITED TO LOSS OF DATA OR DATA BEING RENDERED INACCURATE OR LOSSES SUSTAINED BY YOU OR THIRD PARTIES …), EVEN IF SUCH HOLDER OR OTHER PARTY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.

In plain terms: **you run DMPress at your own risk.** Neither the authors nor any contributor is liable for lost data, downtime, lost revenue, or any other loss or harm arising from its use or from being unable to use it. Take your own backups, test before deploying, and satisfy yourself that it is fit for your purpose.

Note the licence's own qualifier — *"to the extent permitted by applicable law"*. Some jurisdictions do not allow certain liabilities to be excluded, so the practical effect of these clauses depends on where you are. Nothing here is legal advice.

This is a **pre-release** (see the status at the top of this file) and is not yet recommended for production use.
