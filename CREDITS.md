# DMPress — Credits & Licensing

DMPress is a fork of **WordPress**, redistributed under the same license. This file
records the licensing and attribution of DMPress and every upstream component it
includes, so the project can be shared and redistributed in compliance with those licenses.

---

## DMPress license

DMPress is free software released under the **GNU General Public License, version 2
or (at your option) any later version (GPL-2.0-or-later)** — the same license as
WordPress. The full license text is in [`license.txt`](license.txt).

Modifications made by DMPress relative to WordPress 7.0 are documented in
[`DMPRESS-CHANGES.md`](DMPRESS-CHANGES.md), which serves as the record of changes
required by GPL-2.0 §2(a).

DMPress fork © 2026 Ninjas For Hire. Licensed GPL-2.0-or-later.

---

## Based on WordPress

DMPress is a derivative work of **WordPress** (https://wordpress.org/), the web
publishing software, which is itself the official continuation of b2/cafélog.

- **Copyright:** © 2003–2026 the WordPress contributors and the WordPress Foundation.
- **License:** GPL-2.0-or-later. The WordPress copyright notice and license are
  retained unchanged in [`license.txt`](license.txt).
- All original WordPress copyright notices are preserved throughout the source tree.

**Trademark notice.** "WordPress" is a registered trademark of the **WordPress
Foundation**, and "WooCommerce", "WordPress.com" and related marks belong to their
respective owners. DMPress is an **independent fork** and is **not affiliated with,
sponsored by, or endorsed by** the WordPress Foundation, Automattic, or the WordPress
project. References to "WordPress" in this project are factual references to the
upstream software (nominative use) and do not imply any endorsement. The WordPress
name and logo are not used as the branding of this project.

**Project artwork.** The DMPress logo (`wp-admin/images/dmpress-logo.svg`) is the
project's own mark, supplied by the DMPress authors. It replaces the WordPress logo
on the login, registration, lost-password, setup and install screens. The unused
WordPress logo files (`w-logo-gray.png`, `wordpress-logo.png`, `wordpress-logo.svg`,
`wordpress-logo-gray.svg`, `about-release-logo.svg`) were removed from the tree
rather than shipped unused, so that no WordPress trademark artwork is distributed as
part of DMPress branding.

---

## Third-party component integrated into core

### Secure Custom Fields (SCF)

DMPress bundles **Secure Custom Fields 6.9.1** (the WordPress.org open-source fork of
Advanced Custom Fields) inside the core tree at [`wp-includes/scf/`](wp-includes/scf/),
where it provides the **Content-Type Builder** (post types, taxonomies, options pages,
and custom fields).

- **Source:** https://wordpress.org/plugins/secure-custom-fields/ (WordPress.org).
- **Copyright:** © the Secure Custom Fields / Advanced Custom Fields contributors.
- **License:** GPL-2.0-or-later — retained unchanged in
  [`wp-includes/scf/license.txt`](wp-includes/scf/license.txt); see also
  [`wp-includes/scf/readme.txt`](wp-includes/scf/readme.txt).
- SCF bundles its own dependencies under `wp-includes/scf/vendor/`, each retaining its
  own license (e.g. `justinrainbow/json-schema`, MIT).
- DMPress adjustments to SCF (asset paths, load point, block-layer guards) are
  documented in `DMPRESS-CHANGES.md`.

---

## Libraries bundled by WordPress

WordPress ships a number of third-party libraries, all under GPL-compatible licenses.
DMPress redistributes them unchanged, with their original license notices retained
in-place within the source tree. The notable ones still included are:

| Library | Location | License |
|---|---|---|
| jQuery, jQuery UI, jQuery Migrate | `wp-includes/js/jquery/` | MIT |
| Backbone.js, Underscore.js | `wp-includes/js/` | MIT |
| Plupload | `wp-includes/js/plupload/` | GPL-2.0 |
| MediaElement.js | `wp-includes/js/mediaelement/` | MIT |
| CodeMirror | `wp-includes/js/codemirror/` | MIT |
| Masonry / imagesLoaded | `wp-includes/js/` | MIT |
| clipboard.js, hoverIntent, etc. | `wp-includes/js/` | MIT |
| Twemoji (code / graphics) | `wp-includes/js/` | MIT / CC-BY 4.0 |
| PHPMailer | `wp-includes/PHPMailer/` | LGPL-2.1 |
| SimplePie | `wp-includes/SimplePie/` | BSD-3-Clause |
| Requests | `wp-includes/Requests/` | ISC |
| getID3 | `wp-includes/ID3/` | GPL-2.0-or-later |
| Text_Diff (PEAR) | `wp-includes/Text/Diff/` | LGPL-2.1 |
| sodium_compat | `wp-includes/sodium_compat/` | ISC |
| Dashicons | `wp-includes/css/dashicons*`, fonts | GPL-2.0 |

This list highlights the major components; every bundled library keeps its own
`LICENSE` file and/or in-file license header inside the source tree, which is the
authoritative source for each. Components that WordPress bundled solely for the block
editor were removed with the block editor (see `DMPRESS-CHANGES.md`) and are not
distributed by DMPress.

---

## Redistributing DMPress

When you distribute DMPress or a modified version:

1. Keep [`license.txt`](license.txt) and all retained copyright/license notices intact.
2. Keep this `CREDITS.md`, `DMPRESS-CHANGES.md`, and `wp-includes/scf/license.txt`.
3. If you modify DMPress further, note your changes (append to `DMPRESS-CHANGES.md`
   or keep your own change record) to satisfy GPL-2.0 §2(a).
4. Do not use the "WordPress" name or logo as your project's branding, and do not
   imply endorsement by the WordPress Foundation or Automattic.
5. Make the corresponding source available under GPL-2.0-or-later, as the license
   requires.
