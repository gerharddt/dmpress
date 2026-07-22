# DMPress — Fork Change Log

DMPress is a fork of **WordPress 7.0** re-focused as a **headless, data-management CMS**.
This document logs everything that has been changed relative to stock WordPress 7.0, grouped by:

1. [Removed from WordPress](#1-removed-from-wordpress)
2. [Added by DMPress (us)](#2-added-by-dmpress-us)
3. [Third-party components](#3-third-party-components)
4. [Modified / rebranded core](#4-modified--rebranded-core)
5. [Upstream WordPress fixes ported](#5-upstream-wordpress-fixes-ported)
6. [Known consequences & decisions](#6-known-consequences--decisions)

> **Baseline:** stock WordPress 7.0. **Product version:** DMPress 1.0.0-beta.20 (pre-release).
> Internally `$wp_version` remains `7.0` for plugin/API compatibility; `$dmpress_version` (`1.0.0-beta.20`) is the product version shown to users.

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

### Built-in taxonomies — removed from core
`category` and `post_tag` are no longer registered by `create_initial_taxonomies()`. Like `post`, they ship as **default Content-Type Builder entries** (see [§2](#2-added-by-dmpress-us)), so Categories and Tags can be renamed, deactivated, detached from Posts, or deleted outright.

Everything else stays: the taxonomy API, the `terms`/`term_taxonomy`/`term_relationships` tables, the `category_name`/`tag` query vars, the `manage_categories` / `manage_post_tags` capabilities, and the `categories`/`tags` REST bases. Only the hard-coded registration is gone, so code asking for these taxonomies must check `taxonomy_exists()` / `is_object_in_taxonomy()` first — core already did so nearly everywhere, including the categories drop-down on the posts list table.

Two screens needed guarding:

- **Settings → Writing:** the *Default Post Category* row is hidden when the `category` taxonomy is not registered (it would otherwise render an empty drop-down).
- **`edit-tags.php`:** an unregistered taxonomy now returns **"Invalid taxonomy." (404)** instead of a bare 500, matching the `edit.php` / `post-new.php` handling.

### Server-rendered front end — removed (headless)
DMPress does not render any front-end HTML from core. Front-end requests no longer boot WordPress at all (see [§2](#2-added-by-dmpress-us)). Consequently these front-end surfaces no longer serve from core: theme template rendering, feeds, XML sitemaps, robots/favicon output, oEmbed HTML, post preview, Customizer live-preview.

### Theme template system — reduced to metadata
Themes no longer contain templates or `style.css`. The default `dmpone` theme was reduced to a single `theme.json` manifest. (Core's now-inert front-end template functions were left in place to avoid breaking plugins; they are never invoked.)

### Dashboard widgets — removed
The dashboard now ships with no content widgets at all:

- Welcome/"Get started" banner
- **WordPress Events and News** widget
- **Quick Draft** widget (and the `post-quickdraft-save` handler)
- **At a Glance** (`wp_dashboard_right_now`) — plus `wp_dashboard_quota`, which only ran on the `activity_box_end` hook that this widget fired
- **Activity** (`wp_dashboard_site_activity`) — plus its helpers `wp_dashboard_recent_posts`, `wp_dashboard_recent_comments` and `_wp_dashboard_recent_comments_row`, and the `mode=dashboard` branch of the comment-reply AJAX handler that only the Activity widget used
- Related help-tab text was removed alongside each widget.

Only the conditional browser/PHP upgrade nags remain, and the dashboard API (`wp_add_dashboard_widget()`, the RSS widget helpers, the `wp_dashboard_setup` hook) is untouched so plugins can still add their own widgets.

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

### Privacy (Settings → Privacy) — removed
The Privacy settings feature is gone in its entirety:

- **Screens:** `wp-admin/options-privacy.php` (Settings → Privacy), `wp-admin/privacy-policy-guide.php` (the Policy Guide tab) and `wp-admin/privacy.php` (the "Privacy Policy" about-page tab).
- **Class:** `WP_Privacy_Policy_Content` and its `wp-admin/includes/class-wp-privacy-policy-content.php` file, plus the unconditional `require` of it in `wp-admin/includes/admin.php`.
- **Hooks:** the four `WP_Privacy_Policy_Content` callbacks in `admin-filters.php` (`text_change_check`, `notice`, `add_suggested_content`, `_policy_page_updated`) — so the "your privacy policy has changed" admin notice is gone too.
- **Admin menu:** the **Privacy** item under Settings.
- **Install:** the privacy-policy page that a fresh install used to create (already moot — the `page` type was removed).
- **Legacy redirect:** `tools.php`'s redirect to the old Policy Guide tab.
- **Help text:** the Policy-Guide links in the Export/Erase Personal Data screens.

Kept deliberately:

- `wp_add_privacy_policy_content()` remains as a **documented no-op**. It is a public plugin API called directly by many plugins; deleting it would fatal them, so it now accepts and discards the suggested text.
- The **Tools → Export Personal Data** and **Tools → Erase Personal Data** screens and the whole personal-data request workflow are untouched. They are GDPR request tooling under *Tools*, not part of the Settings → Privacy section.
- `get_privacy_policy_url()`, `is_privacy_policy()`, the `wp_page_for_privacy_policy` option and the `manage_privacy_options` capability all remain, so plugins and the new-user email templates that reference them keep working. Without a `page` type the option is simply always `0`.

### Discussion settings — three items removed
Gone from Settings → Discussion:

- **Comment Pagination** — the whole row (`page_comments`, `comments_per_page`, `default_comments_page`, `comment_order`). Comment paging is a front-end rendering concern, and DMPress has no front end.
- **"Attempt to notify any blogs linked to from the post"** (`default_pingback_flag`).
- **"Allow link notifications from other blogs (pingbacks and trackbacks) on new posts"** (`default_ping_status`).

All six options were also removed from `$allowed_options['discussion']`, and the `register_setting( 'discussion', 'default_ping_status', … )` call was dropped — for the same reason as the Writing rows below: `options.php` nulls any allow-listed setting missing from the POST, and `register_setting()` re-adds to the allow-list via the `allowed_options` filter. Verified by submitting the Discussion form and confirming all six values survive while a still-editable setting takes its posted change.

Removing the two checkboxes left **Default post settings** holding nothing but "Allow people to submit comments on new posts", so that row is gone too: `default_comment_status` moved into **Other comment settings**, which is renamed **Comment settings** and is now the first row on the screen. The checkbox keeps its "Individual posts may override these settings" note and saves in both states as before.

Email me whenever, moderation, disallowed keys and Avatars are untouched. `default_ping_status` is no longer exposed on `/wp/v2/settings`.

### Writing settings — two rows removed
**Default Post Format** and **Default Mail Category** no longer appear on Settings → Writing.

Removing the form fields alone would have been a bug: `wp-admin/options.php` loops the allow-listed settings for the group and calls `update_option( $option, null )` for any that are absent from the POST, so every save of the Writing screen would have silently wiped both stored values. Both were therefore also removed from `$allowed_options['writing']`, and the `register_setting( 'writing', 'default_post_format', … )` call in `wp-includes/option.php` was dropped as well — `register_setting()` re-adds an option to the allow-list through the `allowed_options` filter, so leaving it would have reintroduced the same nulling.

Consequences: `default_post_format` is no longer exposed on `/wp/v2/settings` (it was the only one of the two registered for REST). Both option rows keep whatever value they already held, and `get_option()` still reads them, so post-formats behaviour and any post-by-email setup are unchanged — they are simply no longer editable from this screen. Verified by submitting the Writing form and confirming both values survive.

### Connectors — removed
WordPress 7.0's **Settings → Connectors** screen (AI-provider connections and their API keys) is gone in its entirety:

- **Screen:** `wp-admin/options-connectors.php`, and its **Connectors** item under Settings.
- **Subsystem:** `wp-includes/connectors.php` and `WP_Connector_Registry`, plus the `_wp_connectors_init` bootstrap on `init`.
- **Build page/route system:** `wp-includes/build/pages.php`, `build/routes.php` and the `options-connectors` / `connectors-home` page and route bundles. Connectors was the last consumer of this loader (the font library, its only other user, went with Gutenberg), so the whole `build/pages` + `build/routes` machinery is removed and its two `require`s in `wp-settings.php` with it.
- **Script module:** `@wordpress/connectors` and its `js/dist/script-modules/connectors/` bundle, deregistered from both the script-module registry and the packages manifest.

Kept deliberately:

- **The Abilities API stays.** `wp-includes/abilities-api/`, `abilities.php` and the `wp-abilities/v1` REST controllers are untouched — Connectors never used them, and the **Content-Type Builder registers seven ability classes** of its own (field groups, fields, post types, taxonomies, options pages). Removing the Abilities API would break it.
- **API-key masking on the all-settings screen.** An install that previously used Connectors may still hold `connectors_*_api_key` option rows. `wp-admin/options.php` still masks them and keeps them read-only, with the masking inlined since `_wp_connectors_mask_api_key()` is gone — otherwise stored keys would print in plain text.

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

### `readme.html` — replaced by `README.md`
WordPress ships its root readme as HTML. GitHub does not render an HTML readme as a page — it shows the raw markup — so the file was rewritten as **`README.md`** and `readme.html` was deleted. The only core reference to it (`update-core.php`, a confidence check on a downloaded core-update archive) is unaffected: it inspects an unzipped WordPress package, not this repository, and core self-update is disabled anyway.

### Dead code — removed
- `wp-includes/collaboration.php` + `collaboration/` (unwired real-time-collaboration feature; also removed upstream in WP 7.0.2).

---

## 2. Added by DMPress (us)

### Headless front controller — `index.php` (rewritten)
- REST API requests (`?rest_route=…` or `/wp-json/…`) boot the CMS and serve only the API.
- **All other front-end requests return an instant response with zero WordPress boot** (~11 ms vs ~50 ms full boot on the dev server).
- Serves `front/index.html` if present (drop-in point for a headless SPA build), otherwise a minimal placeholder pointing at the REST API.
- REST prefix overridable via the `DMPRESS_REST_PREFIX` constant.

### Themes screen rewritten — `wp-admin/themes.php`
Replaced WordPress's Backbone-driven theme grid (~1,330 lines of JS templates, details modal, feature filters and search) with a simple server-rendered list, since a metadata-only theme has nothing to preview:

- Themes are **stacked vertically**, showing name, version, author, folder slug and description — all read from the theme's `theme.json`.
- **No screenshots/thumbnails.**
- **Activate is the only action.** The active theme shows an "Active" label; every other theme shows an Activate button. Activating one deactivates the previous theme (WordPress only ever has one active theme).
- No Live Preview, Customize, Delete, auto-update toggles, details modal or theme search.
- Activation still goes through core's nonce-checked (`switch-theme_<stylesheet>`) `switch_theme()` path, and network-disallowed themes are still filtered via `is_allowed()`.

### `theme.json` theme system
- **`wp-includes/class-wp-theme.php`** — new `parse_theme_json_headers()`; a theme is valid with only a `theme.json` manifest (`name`, `version`, optional `description`/`author`/…), no `style.css` or templates.
- **`wp-includes/theme.php`** — `validate_current_theme()` accepts metadata-only themes.
- Themes are just `theme.json` (+ optional `screenshot.png`) and remain selectable/switchable under **Appearance → Themes**.
- **`wp-content/themes/dmpone/theme.json`** — the default theme, now metadata-only.

### Block API compatibility shim — `wp-includes/block-compat.php` (new)
Inert, no-op implementations of the public block API (`register_block_type`, `register_block_pattern`, `has_blocks`, `do_blocks`, `parse_blocks`, `WP_Block_Type`, `WP_Block_Type_Registry`, …) so third-party plugins that register blocks install and run without fatal errors.

### Consolidated **Admin** menu — `wp-admin/menu.php`
- A single top-level **Admin** menu replaces the separate Settings, Tools, Users, Appearance, and Plugins top-levels, plus the Content-Type Builder.
- Grouped with dim **heading rows** (`dmp-menu-heading`, styled in `wp-admin/css/admin-menu*.css`): Settings · Tools · Users · Appearance · Plugins · Content Types.
- Legacy parents (`tools.php`, `users.php`, `themes.php`, `plugins.php`, …) are remapped so third-party submenu registrations group in automatically.

### Comments as a per-post-type feature — `wp-admin/menu.php`
- A **Comments** submenu is added under any post type that supports comments (toggled via the Content-Type Builder), scoped with `edit-comments.php?post_type=<type>`.
- The label is renamable via the `dmpress_comments_menu_label` filter (globally or per post type).

### Dual-version scheme — `wp-includes/version.php`
- `$wp_version = '7.0'` (compatibility: plugin `Requires at least`, wordpress.org APIs, WP-CLI). **Never** set this to the DMPress version — doing so breaks plugin installation.
- `$dmpress_version = '1.0.0-beta.20'` (product version shown in generator tags, admin footer, dashboard).

**Release process:** bump `$dmpress_version` on every published release/push — `1.0.0-beta.1` → `1.0.0-beta.2` → … → `1.0.0` — and record what changed in this file.

### Fix: duplicate Posts menu
Splitting `post` into a Content-Type Builder entry made it report `_builtin => false`, so it matched both the `_builtin => false` post-type query *and* the `$builtin` special case in `wp-admin/menu.php` — rendering the **Posts** top-level menu twice. The merged list is now passed through `array_unique()`, keeping the `$builtin` entry so Posts retains its tidy `edit.php` URLs. Other post types are unaffected and still get their own menus.

### Default content types — `wp-includes/dmpress-content-types.php` (new)
- Seeds **"Posts"** as a default Content-Type Builder entry on the first admin request, so the familiar Posts type is present out of the box without being hard-coded in core.
- Ships with the same feature set the old built-in had: title, editor, author, featured image, excerpt, trackbacks, custom fields, comments, revisions, post formats — and the **`category` + `post_tag` taxonomies** assigned, so Categories and Tags appear under Posts as before.
- The seed is **one-time**, guarded by the `dmpress_default_content_types_seeded` option: if an administrator deletes the Posts type it stays deleted and is never resurrected.
- Because it is an ordinary Content-Type Builder entry, its labels, supports (including **comments**), taxonomies and REST settings are all editable in the admin.
- Seeds **"Categories"** (`category`, hierarchical) and **"Tags"** (`post_tag`, flat) as default Content-Type Builder *taxonomy* entries attached to Posts, carrying the capabilities (`manage_categories`, `manage_post_tags`, …) and REST bases (`categories`, `tags`) core used — so existing role assignments, term data and REST clients are unaffected.
- The taxonomy seed is tracked by its own `dmpress_default_taxonomies_seeded` option rather than the post-type one, so installs created before the taxonomies were split out of core still receive them exactly once. Deleting a taxonomy keeps it deleted.
- Deactivating either taxonomy removes its **Posts → Categories/Tags** submenu item and its metabox from the post editor, and hides the *Default Post Category* setting; reactivating restores all of them.

### Content-Type Builder freed to define `page` and `post`
- Removed `'page'` and `'post'` from SCF's reserved-terms list so those keys can be used for Content-Type Builder post types. (`post__in`, `post_type`, `post_format`, `pagename` etc. remain reserved.)

---

## 3. Third-party components

### Secure Custom Fields (SCF) — integrated into core
- **Source:** Secure Custom Fields 6.9.1, WordPress.org (the open-source ACF fork). GPL.
- **Location:** moved from `wp-content/plugins/secure-custom-fields/` into **`wp-includes/scf/`** (~25 MB) and loaded from `wp-settings.php` on every request — it is now a core component, not an optional plugin.
- **Role in DMPress:** it *is* the **Content-Type Builder** — the UI for creating post types, taxonomies, options pages, and custom fields.
- **Fork adjustments:** asset URL patched to `includes_url('scf/')`; `ACF_PATH`/`ACF_BASENAME` defined in `wp-settings.php`; uninstall hook removed; guards added where SCF's (inert) block layer called the removed block system.
- **Logo removed:** `assets/images/scf-logo.svg` drew the letters **S C F** as vector paths — invisible to a text search, but the most prominent SCF branding on screen. There is now no logo mark at all: the toolbar renders the product name as plain text (`.acf-logo` is a text link carrying `acf_get_setting( 'name' )`), the decorative mark on the database-upgrade notice was dropped, and the SVG was deleted. Note that SCF's own stylesheet hides the toolbar `<h2>` (`display: none`), which is why the heading alone was never visible — the wordmark goes through `.acf-logo` instead. In `acf-global.css`/`.min.css` the 72px logo gutter (`.acf-nav-wrap { padding-left }`) and the `position: absolute; top: 0; left: 0` it existed to support were both removed from the base rules, and an appended block sets the wordmark to 20px, 600 weight, white. Both the readable and minified builds are patched — **the `.min` is the one actually enqueued**.
- **Presented as the Content-Type Builder, not as SCF:** the `name` setting (`secure-custom-fields.php`) is `Content-Type Builder`, which drives the `<h2>` heading on every builder screen. The hard-coded `SCF` group header in the "More" dropdown now echoes that same setting, the toolbar logo's `aria-label`/`alt` were reworded, and the two Tools tooltips that referenced "another SCF installation" / "an SCF JSON file" were rewritten. No SCF or ACF branding renders anywhere in the admin. **Attribution is unaffected** — it lives in `CREDITS.md`, and internal identifiers (`acf_*` functions, `acf-*` post types, the `secure-custom-fields` text domain, `ACF_*` constants) are deliberately untouched so SCF-aware plugins and existing field data keep working.
- **Toolbar active state fixed:** DMPress's `submenu_file` filter (`wp-admin/menu.php`) pins `$submenu_file` to `edit.php?post_type=acf-field-group` on every builder screen so the left-hand **Admin → Content-Type Builder** item highlights. SCF's toolbar read that same global to pick its active tab, so **Field Groups** appeared active everywhere. `views/global/navigation.php` now derives the active tab from `$typenow` (list/edit/add-new screens of each builder post type) and `$plugin_page` (slug pages such as Tools) instead. This also made SCF's separate "Add New" special case redundant.
- **Asset cache-busting:** SCF's version never moves while the fork patches its built CSS/JS in place, so browsers kept serving stale copies of DMPress's changes. `includes/assets.php` folds `$dmpress_version` into the registered version string (`?ver=6.9.1-dmp1.0.0-beta.20`), so every release bumps the URL.
- **"Beta Features" removed from the "More" menu:** `SCF_Admin_Beta_Features::admin_menu()` returns before `add_submenu_page()`, so the page is never registered — it drops out of the Content-Type Builder nav (which is built from `$submenu`) and a direct URL returns 403. The class, `scf_register_admin_beta_feature()` and `acf()->admin_beta_features` are left intact so nothing referencing them fatals. The only shipped beta feature (`editor_sidebar`) targets the block editor, which DMPress does not have.
- **Copyright:** all original SCF/ACF and WordPress copyrights remain with their authors; DMPress ships under GPL as a derivative work.

*(No other third-party code was added. The plugins directory is otherwise empty.)*

---

## 4. Modified / rebranded core

### WordPress → DMPress branding
- `readme.html` replaced by a Markdown `README.md` (GitHub renders HTML readmes as source, not as a page); login screen ("Powered by DMPress", logo links to the site home); admin `<title>` tags; admin footer; dashboard greeting; installer / upgrade / setup-config screens.
- Generator meta + RSS tags → `DMPress <version>`.
- HTTP User-Agent → `WordPress/7.0; DMPress/1.0; <url>` (keeps a WP-compatible token so services still recognise it).
- Default outgoing-mail sender name → `DMPress`.
- **Admin branding sweep** — ~300 user-facing strings across the admin rebranded WordPress → DMPress, plus `wp-config-sample.php` and the `setup-config.php` install flow. The admin bar's **"About WordPress" logo menu** (and its wordpress.org / Documentation / Support / Feedback links) was removed entirely, along with the WordPress marketing pages it linked to — `about.php`, `credits.php`, `freedoms.php`, `contribute.php` (plus their network/user wrappers) — which described block-editor features DMPress no longer ships. Dangling links to those pages were cleaned up.

  Two categories of "WordPress" are **intentionally retained** because changing them would make the software lie: references to **wordpress.org services** (the plugin/theme directories, the salt-key service, update APIs) and **WordPress-version compatibility messages** (plugins declare `Requires at least` against a WordPress version — which is exactly what `$wp_version` reports).
- **Default install content** (`wp-admin/includes/upgrade.php`) — the sample "Hello world!" post now reads "Welcome to DMPress…", and the accompanying sample comment is authored by "A DMPress Commenter" with a neutral e-mail and no author URL (was "A WordPress Commenter" linking to wordpress.org). The dormant sample-page copy was rebranded too. All of this default content was additionally **stripped of Gutenberg block markup** (`<!-- wp:paragraph -->` etc.), which would otherwise appear as literal comments in the classic editor now that the block editor is gone.
- **`dms` → `dmp` identifiers.** Leftovers from the earlier "DMSPress" spelling were renamed for consistency: the default theme `dmsone` / "DMS One" became **`dmpone` / "DMP One"** (which also required migrating the `stylesheet`, `template` and `theme_mods_*` options and clearing the theme transients, or the active theme would have been orphaned), the admin menu heading class `dms-menu-heading` became `dmp-menu-heading` (PHP + all four stylesheets), and the `#dms-group-*` menu anchors became `#dmp-group-*`.
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
- **No Privacy settings:** Settings → Privacy, the Policy Guide and the suggested-privacy-text collection are gone. Plugins calling `wp_add_privacy_policy_content()` still run — the call is a no-op. Tools → Export/Erase Personal Data are unaffected.
- **Posts comments are now admin-controlled:** because Posts is a Content-Type Builder entry, its `comments` support is a checkbox in the admin. It ships enabled (so Posts shows a Comments submenu out of the box) and can simply be unchecked — this supersedes the earlier note that changing it required a code edit.
- **Deleting/deactivating the Posts type:** supported, and core tolerates it (menus, dashboard, admin bar, XML-RPC and Press This are all guarded). `wp-admin/edit.php` and `wp-admin/post-new.php` default to `post`, so a bare URL to either now returns a clean **"Invalid post type." (404)**. Upstream those screens assume `post` always exists and fall through to a misleading permission error (a 500 on `edit.php`, a 403 on `post-new.php`); DMPress validates the defaulted type up front instead. Nothing links to them once Posts is gone.
- **Seeded types register on the next request:** the default Posts entry is written during `admin_init`, so it is registered from the following request onward (one page load on a brand-new install).
- **Inert front-end template code:** core's template-loader / template-hierarchy / `get_header`/`get_footer` etc. remain in the tree but are never invoked; they can be pruned later (low risk/reward, left for safety).
- **No Site Health diagnostics:** the status checks and the "Info" tab (the copy-paste debug report often requested in support) are gone with Site Health. Server/environment details must be gathered another way. Plugins that registered `site_status_test` checks simply have nothing to hook into; they do not error.
- **WP-CLI:** works against the compatibility version, but cannot reach the database in this particular dev environment (CLI-PHP limitation, not a fork issue).
