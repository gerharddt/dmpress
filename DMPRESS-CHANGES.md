# DMPress — Fork Change Log

DMPress is a fork of **WordPress 7.0** re-focused as a **headless, data-management CMS**.
This document logs everything that has been changed relative to stock WordPress 7.0, grouped by:

1. [Removed from WordPress](#1-removed-from-wordpress)
2. [Added by DMPress (us)](#2-added-by-dmpress-us)
3. [Third-party components](#3-third-party-components)
4. [Modified / rebranded core](#4-modified--rebranded-core)
5. [Upstream WordPress fixes ported](#5-upstream-wordpress-fixes-ported)
6. [Known consequences & decisions](#6-known-consequences--decisions)

> **Baseline:** stock WordPress 7.0. **Product version:** DMPress 1.0.0-beta.2 (pre-release).
> Internally `$wp_version` remains `7.0` for plugin/API compatibility; `$dmpress_version` (`1.0.0-beta.2`) is the product version shown to users.

---

## 1. Removed from WordPress

### Block editor (Gutenberg) — removed in full
The entire block editor and its runtime were deleted from core (~22 MB):

- **PHP:** `wp-includes/blocks/`, `block-editor.php`, `block-patterns*`, `block-supports/`, block templates & the Site Editor, `class-wp-block*` classes, block bindings, the block-based widgets editor.
- **Global styles / theme.json engine:** `class-wp-theme-json*`, `global-styles-and-settings.php`, the style engine, duotone.
- **Typography / Fonts:** `fonts/`, `fonts.php`, the Font Library screen.
- **Interactivity API:** `wp-includes/interactivity-api/`.
- **REST controllers (14):** blocks, block-types, block-renderer, block-directory, block-patterns, pattern-directory, global-styles (+ revisions), templates (+ revisions/autosaves), navigation-fallback, font families/faces/collections, edit-site export, URL-details.
- **Admin screens:** `edit-form-blocks.php`, `site-editor.php`, `widgets-form-blocks.php`, `font-library.php`, the WP 7 command palette.
- **JS/CSS:** ~30 editor JavaScript packages (`block-editor`, `block-library`, `editor`, `edit-post`, `edit-site`, etc.) and their stylesheets.
- **Result:** the **Classic editor** is the only editor; `use_block_editor_for_post_type()` returns `false`.

### Built-in post types — removed from core
Neither of WordPress's built-in content types is hard-coded in DMPress any more; content types are data, managed in the Content-Type Builder.

- **`page`** — no longer registered at all. Page-related **functions** (`is_page()`, `get_pages()`, page-attributes, front-page options) are retained so the type degrades gracefully and can be **recreated on demand via the Content-Type Builder**.
- **`post`** — no longer registered by core. It now ships as a **default Content-Type Builder entry** instead (see [§2](#2-added-by-dmpress-us)), so administrators can edit or delete it like any other content type. Core no longer treats any post type as `_builtin`.

### Server-rendered front end — removed (headless)
DMPress does not render any front-end HTML from core. Front-end requests no longer boot WordPress at all (see [§2](#2-added-by-dmpress-us)). Consequently these front-end surfaces no longer serve from core: theme template rendering, feeds, XML sitemaps, robots/favicon output, oEmbed HTML, post preview, Customizer live-preview.

### Theme template system — reduced to metadata
Themes no longer contain templates or `style.css`. The default `dmsone` theme was reduced to a single `theme.json` manifest. (Core's now-inert front-end template functions were left in place to avoid breaking plugins; they are never invoked.)

### Dashboard clutter — removed
- Welcome/"Get started" banner
- **WordPress Events and News** widget
- **Quick Draft** widget
- (Related help-tab text and the `post-quickdraft-save` handler were removed too.)

### Site Health — removed
The Site Health feature is gone in its entirety:

- **Screens:** `wp-admin/site-health.php` and `wp-admin/site-health-info.php`.
- **Classes:** `WP_Site_Health`, `WP_Site_Health_Auto_Updates`, `WP_Debug_Data`.
- **REST:** the `wp-site-health/v1` namespace and its controller.
- **Dashboard:** the "Site Health Status" widget.
- **Admin menu:** the Site Health item (and its critical-issue counter) under Tools.
- **AJAX:** the five `health-check-*` handlers and their entries in the admin-ajax action lists.
- **Capability:** the `view_site_health_checks` grant filter (`wp_maybe_grant_site_health_caps`).
- **Cron:** the weekly `wp_site_health_scheduled_check` event is no longer registered.
- **Assets:** `site-health` JS/CSS (all variants) and their registrations.

### Customizer & Theme File Editor — removed from the admin menu
Neither is meaningful in DMPress, so they are no longer listed under **Appearance**:

- **Customize** — the front end is headless, so there is no rendered site for the Customizer to preview.
- **Theme File Editor** — themes are metadata-only (a `theme.json` manifest), so there are no template files to edit.
- The **Header** and **Background** items were removed too: both are Customizer entry points (`customize.php?autofocus=…`).
- The **Customize** link was also removed from the admin bar (`wp_admin_bar_customize_menu`) so the two surfaces stay consistent.

Appearance now contains **Themes** (plus **Menus** when a theme declares menu/widget support). The underlying `customize.php` and `theme-editor.php` screens still exist and remain reachable by direct URL — only the menu entries were removed.

### Global Comments menu — removed
The top-level **Comments** sidebar item was removed. Comments are now a per-post-type submenu (see [§2](#2-added-by-dmpress-us)).

### Core self-update — disabled
`wp_version_check()` is a no-op so the wordpress.org update channel can never overwrite the fork.

### Dead code — removed
- `wp-includes/collaboration.php` + `collaboration/` (unwired real-time-collaboration feature; also removed upstream in WP 7.0.2).

---

## 2. Added by DMPress (us)

### Headless front controller — `index.php` (rewritten)
- REST API requests (`?rest_route=…` or `/wp-json/…`) boot the CMS and serve only the API.
- **All other front-end requests return an instant response with zero WordPress boot** (~11 ms vs ~50 ms full boot on the dev server).
- Serves `front/index.html` if present (drop-in point for a headless SPA build), otherwise a minimal placeholder pointing at the REST API.
- REST prefix overridable via the `DMPRESS_REST_PREFIX` constant.

### `theme.json` theme system
- **`wp-includes/class-wp-theme.php`** — new `parse_theme_json_headers()`; a theme is valid with only a `theme.json` manifest (`name`, `version`, optional `description`/`author`/…), no `style.css` or templates.
- **`wp-includes/theme.php`** — `validate_current_theme()` accepts metadata-only themes.
- Themes are just `theme.json` (+ optional `screenshot.png`) and remain selectable/switchable under **Appearance → Themes**.
- **`wp-content/themes/dmsone/theme.json`** — the default theme, now metadata-only.

### Block API compatibility shim — `wp-includes/block-compat.php` (new)
Inert, no-op implementations of the public block API (`register_block_type`, `register_block_pattern`, `has_blocks`, `do_blocks`, `parse_blocks`, `WP_Block_Type`, `WP_Block_Type_Registry`, …) so third-party plugins that register blocks install and run without fatal errors.

### Consolidated **Admin** menu — `wp-admin/menu.php`
- A single top-level **Admin** menu replaces the separate Settings, Tools, Users, Appearance, and Plugins top-levels, plus the Content-Type Builder.
- Grouped with dim **heading rows** (`dms-menu-heading`, styled in `wp-admin/css/admin-menu*.css`): Settings · Tools · Users · Appearance · Plugins · Content Types.
- Legacy parents (`tools.php`, `users.php`, `themes.php`, `plugins.php`, …) are remapped so third-party submenu registrations group in automatically.

### Comments as a per-post-type feature — `wp-admin/menu.php`
- A **Comments** submenu is added under any post type that supports comments (toggled via the Content-Type Builder), scoped with `edit-comments.php?post_type=<type>`.
- The label is renamable via the `dmpress_comments_menu_label` filter (globally or per post type).

### Dual-version scheme — `wp-includes/version.php`
- `$wp_version = '7.0'` (compatibility: plugin `Requires at least`, wordpress.org APIs, WP-CLI). **Never** set this to the DMPress version — doing so breaks plugin installation.
- `$dmpress_version = '1.0.0-beta.2'` (product version shown in generator tags, admin footer, dashboard).

**Release process:** bump `$dmpress_version` on every published release/push — `1.0.0-beta.1` → `1.0.0-beta.2` → … → `1.0.0` — and record what changed in this file.

### Default content types — `wp-includes/dmpress-content-types.php` (new)
- Seeds **"Posts"** as a default Content-Type Builder entry on the first admin request, so the familiar Posts type is present out of the box without being hard-coded in core.
- Ships with the same feature set the old built-in had: title, editor, author, featured image, excerpt, trackbacks, custom fields, comments, revisions, post formats — and the **`category` + `post_tag` taxonomies** assigned, so Categories and Tags appear under Posts as before.
- The seed is **one-time**, guarded by the `dmpress_default_content_types_seeded` option: if an administrator deletes the Posts type it stays deleted and is never resurrected.
- Because it is an ordinary Content-Type Builder entry, its labels, supports (including **comments**), taxonomies and REST settings are all editable in the admin.

### Content-Type Builder freed to define `page` and `post`
- Removed `'page'` and `'post'` from SCF's reserved-terms list so those keys can be used for Content-Type Builder post types. (`post__in`, `post_type`, `post_format`, `pagename` etc. remain reserved.)

---

## 3. Third-party components

### Secure Custom Fields (SCF) — integrated into core
- **Source:** Secure Custom Fields 6.9.1, WordPress.org (the open-source ACF fork). GPL.
- **Location:** moved from `wp-content/plugins/secure-custom-fields/` into **`wp-includes/scf/`** (~25 MB) and loaded from `wp-settings.php` on every request — it is now a core component, not an optional plugin.
- **Role in DMPress:** it *is* the **Content-Type Builder** — the UI for creating post types, taxonomies, options pages, and custom fields.
- **Fork adjustments:** asset URL patched to `includes_url('scf/')`; `ACF_PATH`/`ACF_BASENAME` defined in `wp-settings.php`; uninstall hook removed; guards added where SCF's (inert) block layer called the removed block system.
- **Copyright:** all original SCF/ACF and WordPress copyrights remain with their authors; DMPress ships under GPL as a derivative work.

*(No other third-party code was added. The plugins directory is otherwise empty.)*

---

## 4. Modified / rebranded core

### WordPress → DMPress branding
- `readme.html` rewritten; login screen ("Powered by DMPress", logo links to the site home); admin `<title>` tags; admin footer; dashboard greeting; installer / upgrade / setup-config screens.
- Generator meta + RSS tags → `DMPress <version>`.
- HTTP User-Agent → `WordPress/7.0; DMPress/1.0; <url>` (keeps a WP-compatible token so services still recognise it).
- Default outgoing-mail sender name → `DMPress`.
- **Admin branding sweep** — ~300 user-facing strings across the admin rebranded WordPress → DMPress, plus `wp-config-sample.php` and the `setup-config.php` install flow. The admin bar's **"About WordPress" logo menu** (and its wordpress.org / Documentation / Support / Feedback links) was removed entirely, along with the WordPress marketing pages it linked to — `about.php`, `credits.php`, `freedoms.php`, `contribute.php` (plus their network/user wrappers) — which described block-editor features DMPress no longer ships. Dangling links to those pages were cleaned up.

  Two categories of "WordPress" are **intentionally retained** because changing them would make the software lie: references to **wordpress.org services** (the plugin/theme directories, the salt-key service, update APIs) and **WordPress-version compatibility messages** (plugins declare `Requires at least` against a WordPress version — which is exactly what `$wp_version` reports).
- **Default install content** (`wp-admin/includes/upgrade.php`) — the sample "Hello world!" post now reads "Welcome to DMPress…", and the accompanying sample comment is authored by "A DMPress Commenter" with a neutral e-mail and no author URL (was "A WordPress Commenter" linking to wordpress.org). The dormant sample-page copy was rebranded too. All of this default content was additionally **stripped of Gutenberg block markup** (`<!-- wp:paragraph -->` etc.), which would otherwise appear as literal comments in the classic editor now that the block editor is gone.
- **Project naming.** The product was briefly named "DMSPress" during early development and was renamed to **DMPress**. The rename covers display strings, documentation, and all code identifiers: `$dmpress_version`, `dmpress_is_rest_request()`, `DMPRESS_REST_PREFIX`, `_dmpress_is_ctb_screen()`, the public `dmpress_comments_menu_label` filter, and `@package DMPress` tags.

### Database table prefix
- The default table prefix is **`dmp_`** (set in `wp-config-sample.php`, so fresh installs use it).
- Existing installs migrating from the earlier `dmsp_` prefix must rename the tables **and** the prefixed keys that WordPress stores inside its data — `{prefix}user_roles` in `options`, and `{prefix}capabilities` / `{prefix}user_level` / `{prefix}dashboard_quick_press_last_post_id` in `usermeta`. Renaming tables without moving those keys silently strips every user of their roles and capabilities.
- Note that the MySQL **database name** is independent of the table prefix and is not changed by this.

### Ecosystem compatibility preserved (intentionally *not* changed)
- The `wp` namespace is untouched: REST stays `wp/v2`, all `wp_*` functions/hooks/classes keep their names, `window.wp.*` JS globals ship for retained packages.
- Installing/activating plugins from wordpress.org works (verified with Classic Editor and WP Crontrol).

---

## 5. Upstream WordPress fixes ported

Security and bug fixes from the two point releases after the fork (**7.0.1**, **7.0.2**) that land in code DMPress still ships:

- **`kses.php`** — `safecss_filter_attr()` decodes `style` attributes before filtering / re-encodes after (XSS hardening). *Security.*
- **`class-wp-query.php`** — `author__not_in` sanitised via `wp_parse_id_list()` (SQL-injection hardening). *Security.*
- **`rest-api/class-wp-rest-server.php` + `rest-api.php`** — nested-dispatch guard; batch error alignment. *Security/stability.*
- **`media.php` + `embed.php`** — `wp_get_attachment_image_src()` strict return + caller guards (PHP 8 fatal hardening).
- **`formatting.php`** — emoji-detection script hooks the admin footer correctly.

Cosmetic UI-only changes (the WP 7.0.1 "compact button" CSS refresh) and Gutenberg changes were intentionally **not** ported.

---

## 6. Known consequences & decisions

- **Headless preview:** post Preview / "View" and the Customizer live-preview no longer render from core; a headless front-end app handles these via REST.
- **Feeds / sitemaps / robots / oEmbed HTML:** no longer served by core (front end is headless).
- **Privacy Policy page management:** inert without a `page` type; recreate `page` via the Content-Type Builder to use it.
- **Posts comments are now admin-controlled:** because Posts is a Content-Type Builder entry, its `comments` support is a checkbox in the admin. It ships enabled (so Posts shows a Comments submenu out of the box) and can simply be unchecked — this supersedes the earlier note that changing it required a code edit.
- **Deleting the Posts type:** supported, and core tolerates it (menus, dashboard, admin bar, XML-RPC and Press This are all guarded). The one visible edge is that a bare `wp-admin/edit.php` URL then shows WordPress's standard "Invalid post type." notice, since that screen defaults to `post`.
- **Seeded types register on the next request:** the default Posts entry is written during `admin_init`, so it is registered from the following request onward (one page load on a brand-new install).
- **Inert front-end template code:** core's template-loader / template-hierarchy / `get_header`/`get_footer` etc. remain in the tree but are never invoked; they can be pruned later (low risk/reward, left for safety).
- **No Site Health diagnostics:** the status checks and the "Info" tab (the copy-paste debug report often requested in support) are gone with Site Health. Server/environment details must be gathered another way. Plugins that registered `site_status_test` checks simply have nothing to hook into; they do not error.
- **WP-CLI:** works against the compatibility version, but cannot reach the database in this particular dev environment (CLI-PHP limitation, not a fork issue).
