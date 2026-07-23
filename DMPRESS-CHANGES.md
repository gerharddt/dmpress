# DMPress — Fork Change Log

DMPress is a fork of **WordPress 7.0** re-focused as a **headless, data-management CMS**.
This document logs everything that has been changed relative to stock WordPress 7.0, grouped by:

1. [Removed from WordPress](#1-removed-from-wordpress)
2. [Added by DMPress (us)](#2-added-by-dmpress-us)
3. [Third-party components](#3-third-party-components)
4. [Modified / rebranded core](#4-modified--rebranded-core)
5. [Upstream WordPress fixes ported](#5-upstream-wordpress-fixes-ported)
6. [Known consequences & decisions](#6-known-consequences--decisions)

> **Baseline:** stock WordPress 7.0. **Product version:** DMPress 1.0.0-beta.55 (pre-release).
> Internally `$wp_version` remains `7.0` for plugin/API compatibility; `$dmpress_version` (`1.0.0-beta.55`) is the product version shown to users.

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

### Child themes — removed as a concept
DMPress has no parent/child theme relationship. A theme is a single directory holding a `theme.json` manifest, so there is nothing to inherit from and nothing to override.

- **`WP_Theme`:** the whole `Template`-header parent-resolution block is gone, along with the `theme_child_invalid`, `theme_no_index`, `theme_no_parent` and `theme_parent_invalid` error paths it produced (none can occur any more). `$this->template` is simply `$this->stylesheet`; `parent()` returns `false`; `get_template_directory()` / `get_template_directory_uri()` resolve to the theme's own directory.
- **`switch_theme()`:** no longer derives a template from the new theme. It still writes the `template` and `template_root` options, kept identical to their stylesheet counterparts, because plugins read those options directly.
- **`locate_template()`:** the parent-theme fallback is removed — only the active theme and `wp-includes/theme-compat/` are searched.
- **`wp_set_template_globals()`:** `$wp_template_path` is assigned from `$wp_stylesheet_path`, so the two can never diverge.
- **`wp_get_active_and_valid_themes()`, `validate_current_theme()`, editor styles:** their child-theme branches are gone.
- **Body classes:** `wp-child-theme-*` is no longer emitted in the admin or by `get_body_class()`.

**`is_child_theme()`, `get_template()`, `get_template_directory()`, `get_template_directory_uri()` and `WP_Theme::parent()` are all retained** — they are public API that plugins call. `is_child_theme()` and `parent()` simply always return `false`, and the `get_template*()` family always resolves to the active theme. Verified end to end, including a theme switch between two `theme.json` themes: both the `stylesheet` and `template` options track the active theme in step.

### Theme template system — reduced to metadata
Themes no longer contain templates or `style.css`. A theme is a `theme.json` manifest plus an optional `index.html` front end. (Core's now-inert front-end template functions were left in place to avoid breaking plugins; they are never invoked.)

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

### Export screen — corrected for the new content model
`wp-admin/export.php` still assumed WordPress's built-in content types and had drifted out of step with the fork:

- **A "Pages" option and its author/date/status filters rendered even though `page` is not registered**, offering an export of a type that cannot exist. The hard-coded Pages block, its `'pages'` request branch and its JS filter panel are removed. If an administrator recreates `page` in the Content-Type Builder it now appears in the custom-type list like anything else.
- **"Posts" was offered twice** — once from the hard-coded built-in block and again from the custom-post-type loop, because `post` is a Content-Type Builder entry and therefore reports `_builtin => false`. This is the same root cause as the duplicate Posts admin menu. The loop now skips `post`, and the hard-coded block (which carries the richer category/author/date/status filters) only renders while the type is registered.
- **The Categories filter rendered as an empty drop-down** when the `category` taxonomy is deactivated; it is now wrapped in `taxonomy_exists( 'category' )`.
- **The screen text promised "posts, pages, comments, custom fields, categories, and tags"** — pages do not exist and the taxonomies are optional. The help tab, intro paragraph and "All content" description now describe content, comments, custom fields and terms without naming types that may not be present.

- **The Content-Type Builder's own storage types were offered as export targets** — Field Groups, Fields, Post Types, Taxonomies and Options Pages. These are configuration rather than content, the builder has its own JSON import/export that round-trips them properly, and `acf-field` is meaningless in isolation since fields only exist inside a group. They are hidden from the type list by `dmpress_non_exportable_post_types()` (filterable via `dmpress_non_exportable_post_types`), which reads SCF's `acf_get_internal_post_types()` and adds `acf-field`. **Nothing is lost:** they are still written into an "All content" export, and a direct `?content=acf-field-group` URL still exports — only the radio option is hidden. The screen now offers **All content, Posts, Media**.

Verified across states: Posts + Categories both active, Categories deactivated, and Posts deleted entirely — each renders the right options — and `?download=true` still produces valid WXR for `all` (11 items, including the builder's own records), `posts` and `attachment`.

### User profile — "Show Toolbar when viewing site" removed
The **Toolbar** row is gone from the profile screen. The front end is headless and never renders the admin bar, so the preference had nothing to control.

`wp-admin/includes/user.php` no longer assigns `show_admin_bar_front` on save either. That line was unconditional (`isset( $_POST['admin_bar_front'] ) ? 'true' : 'false'`), so with the checkbox removed it would have forced every user's stored preference to `'false'` on any profile save — the same trap as the settings allow-lists. The meta keeps whatever value it holds and `_get_admin_bar_pref()` still reads it. Verified by seeding `'true'` and submitting the profile form.

**Application Passwords are deliberately retained** — see [§6](#6-known-consequences--decisions).

### "Installed Plugins" renamed to "All Plugins"
The Admin → Plugins submenu item is labelled **All Plugins**, matching **All Users** in the group above. Only the menu label changed: the link, capability, position and the pending-update count badge are untouched, as is the Plugins screen itself.

### "Add User" and "Add Plugin" — removed from the Admin menu
Both submenu items are gone from **Admin → Users** and **Admin → Plugins**. Only the menu entries were removed; the screens are untouched.

`user-new.php` and `plugin-install.php` still load, still enforce their own capability checks (`create_users` / `install_plugins`), and are still reached from the **Add User** and **Add Plugin** buttons at the top of the Users and Plugins screens — which is now the primary route to them. With no submenu entry to match, the Admin top-level menu stays highlighted on both screens rather than marking a sibling item current.

### General settings — Site Icon removed
The **Site Icon** row is gone from Settings → General. The icon is a front-end favicon / mobile app icon, and DMPress's front end is headless, so core never renders it.

`site_icon` was also removed from `$allowed_options['general']` — without that, every save of the General screen would have wiped the stored attachment ID, since `options.php` nulls any allow-listed setting missing from the POST. (It is not passed to `register_setting()`, so nothing re-adds it.) The dead `#site-icon-preview-site-title` handler in `options_general_add_js()` was removed with it.

The `site_icon` option, `get_site_icon_url()`, `has_site_icon()` and the site-icon REST field are all untouched, so a headless front end can still read the icon and a plugin can still set it. Verified by seeding an attachment ID and submitting the General form: the value survives while other fields take their posted changes.

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

### Core self-update — repointed to a DMPress channel
The wordpress.org core channel stays permanently disabled: `wp_version_check()` returns immediately and is never scheduled, so no request is made to api.wordpress.org. This matters because `$wp_version` reports `7.0` for plugin compatibility, so wordpress.org treats DMPress as a stock install and would offer the next core release as an "upgrade" — **applying it would overwrite the fork with stock WordPress.** The **plugin and theme** update checks are untouched.

In its place, **`wp-includes/dmpress-update.php` adds a separate update channel keyed on `$dmpress_version`.** It reuses WordPress's entire update engine — `WP_Upgrader` / `Core_Upgrader` (download, unzip, copy, DB upgrade, rollback), the Dashboard → Updates screen, and the Ed25519 signature verifier — and only supplies what is DMPress-specific:

- **A signed manifest.** `dmpress_update_check()` fetches a small JSON manifest (default: the "latest release" asset on GitHub Releases, overridable via `DMPRESS_UPDATE_MANIFEST_URL`), and when its `version` is newer than `$dmpress_version` it populates the standard `update_core` transient. Only `packages->full` is set, which forces `Core_Upgrader` down its full-download branch and sidesteps every `$wp_version` comparison in the engine.
- **Signature verification.** Packages are Ed25519-signed. The public key ships in `DMPRESS_UPDATE_PUBLIC_KEY`; the private key is held only by the release maintainer. Verification hooks `upgrader_pre_download` and reuses core's own `verify_file_signature()` against the key added via the `wp_trusted_keys` filter — a tampered or spoofed package is rejected before it is applied. **If no key is configured the channel is dormant** and never offers an unverifiable update.
- **Manual apply only.** The check runs twice daily (its own cron event, plus a throttled `admin_init` refresh) and surfaces on Dashboard → Updates, but nothing installs until an admin clicks *Update to version X*. This matches the stability-first release policy — a bad release cannot silently reach every install.
- **Post-update screen fixed.** After a successful update the screen announced *"Welcome to DMPress 7.0"* — `update_core()` returns `$wp_version`, frozen at 7.0 for compatibility. It now re-reads the freshly installed `version.php` and reports the product version. The screen also ended with no way forward, because WordPress sends the administrator to the About screen at that point and DMPress removed it; a **Return to Updates** link is shown instead, where the new version is visible.
- **Fix: the package root was assumed, not resolved.** `Core_Upgrader::upgrade()` hard-codes `/wordpress/` when copying the new `update-core.php` into place ahead of the main copy. DMPress packages unpack under `/dmpress/`, so that copy looked for a file that did not exist and the update aborted — reported as *"some files could not be copied… inconsistent file permissions"*, which was misleading: nothing was wrong with permissions. The root is now resolved by probing `/dmpress/`, `/wordpress/` and `/wordpress-mu/`, matching the `$roots` check already in `update_core()`, with a clear error if none matches. **Note:** because DMPress publishes no rollback package (`packages->rollback` is `false`), a core update that fails partway is not rolled back automatically — which is why a throwaway install should always take a release first.
- **"Check again" actually re-checks.** The updates screen routes that link to `wp_version_check()`, which is a no-op in DMPress, so it appeared to work while the 12-hour throttle silently ignored it — an install could sit on a stale "no updates" answer with no way to refresh. The DMPress check now honours `force-check=1`. The scheduled cron event also forces past the throttle, since running a twice-daily event against a ~12 hour throttle let the two cadences drift together and skip checks.
- **Release notes are linked from the update notice.** The manifest's `notes_url` (the GitHub release page) is surfaced as a "Read the release notes" link beside the update offer, so an administrator can see what changed before deciding to apply it.
- **Help text corrected.** The Updates screen's help tab inherited WordPress's claim that maintenance and security updates are applied "automatically in the background". DMPress never does that — updates are manual-apply only — so the sentence now says so and notes that packages are signed and verified.
- **The update screen reasons about the product version.** `update-core.php` now compares against `$dmpress_version` rather than the frozen `$wp_version`, and shows it as the current version. The confidence check in `includes/update-core.php` recognises a package that unpacks under `/dmpress/` (marker: `wp-includes/dmpress-update.php`, since `readme.html` was removed).

A GitHub Actions workflow (`.github/workflows/release.yml`) builds, signs and publishes a release when a `v<version>` tag is pushed, with the private key held in the `DMPRESS_SIGNING_KEY` repository secret — so a release is just *tag and push*, and the key never leaves GitHub. Release tooling lives in `bin/`: `dmpress-keygen.php` (run once to create the signing keypair) and `build-release.sh` (`git archive` → zip under `dmpress/` → Ed25519-sign → emit manifest). `.gitattributes` keeps dev-only paths (`bin/`, `.claude/`, `.htaccess`) out of the release archive; `git archive` already excludes `wp-config.php`, uploads and the `/front` build. **The private signing key never enters the repository.**

### Data left by removed features — cleaned up once
`dmpress_cleanup_removed_feature_data()` (in `wp-includes/dmpress-content-types.php`, guarded by the `dmpress_cleanup_done` option) removes rows that only exist because of features DMPress has since dropped. New installs never create them; this exists so sites built by an earlier build converge on the same state.

- **`acf_site_health`** — SCF gathers a diagnostics blob to fill WordPress's Site Health "Info" tab through the `debug_information` filter. DMPress removed Site Health, and nothing applies that filter, so the data was written weekly and never read. SCF's collector is no longer started (`secure-custom-fields.php`), which also stops the `acf_update_site_health_data` cron event; the stored option and any scheduled event are deleted.
- **`_site_transient_update_core`** — a stale leftover from before core updates were disabled, holding a wordpress.org download URL for a release that must never be applied here.

**Deliberately kept:** `_site_transient_available_translations` and `_site_transient_popular_importers_*`. Both contain wordpress.org URLs because that is genuinely where the data comes from — the language packs behind the install-screen language picker and Settings → General, and the importer list on Tools → Import. They are non-autoloaded, expiring caches of live API responses, not fork branding that leaked into the database.

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

### Branding: the WordPress logo replaced on login and install screens
The login, registration, lost-password, setup-config and install screens still carried WordPress's logo. They now use the DMPress mark at `wp-admin/images/dmpress-logo.svg`.

- All eight stylesheets were repointed — `login`, `login-rtl`, `install`, `install-rtl` and each of their `.min` builds — since the minified files are the ones actually served. Each carried a PNG declaration plus an SVG override; both are replaced by a single SVG reference with a fresh `?ver=` so caches turn over.
- The supplied artwork used a lowercase `viewbox` attribute. That is fine for SVG inlined in HTML, where the parser corrects it, but a standalone `.svg` is parsed as XML and case-sensitive — so as a CSS `background-image` it would have had no viewBox and would not have scaled into the 84px box. The stored file uses `viewBox` with explicit `width`/`height`.
- Five now-unreferenced WordPress logo files were deleted (`w-logo-gray.png`, `wordpress-logo.png`, `wordpress-logo.svg`, `wordpress-logo-gray.svg`, `about-release-logo.svg`) so no WordPress trademark artwork ships as part of DMPress branding. See `CREDITS.md`.
- `w-logo-white.png` and `wordpress-logo-white.svg` remain only because `about*.css` still references them; that stylesheet is orphaned (the About screens were removed) but is still enqueued as a `wp-admin` style dependency, so it was left for a separate cleanup. `w-logo-blue.png` in `wp-includes/images/` stays as the oEmbed site-icon fallback, which is inert on a headless install.

### Remaining "WordPress" in user-facing copy — replaced
A sweep of text DMPress speaks in its own voice, rather than factual references to wordpress.org:

- **Setup screen:** the Database Name field's placeholder was `wordpress`; it is now `dmpress`.
- **`install.php`:** the "WordPress requires that your web server is running PHP" notice.
- **The new-install email** (`wp_new_blog_notification()`), sent to the administrator on *every* fresh install: "Your new WordPress site has been successfully set up at…" signed "--The WordPress Team" with a wordpress.org link. Now "Your new DMPress site…" signed "--The DMPress Team", with the link dropped.
- **Four copies** of "(WordPress could not establish a secure connection to WordPress.org…)" in `update.php`, `theme.php`, `plugin-install.php` and `translation-install.php` — the subject of that sentence is this software, so it now reads DMPress. The wordpress.org half is correct and unchanged.

Deliberately left as-is, because they are accurate references rather than branding: "Your WordPress.org username" on the plugin/theme install screens (it genuinely is a wordpress.org account), and the core-update strings in `update-core.php` and `class-wp-automatic-updater.php` (core self-update is disabled, so they are unreachable).

### Fix: setup screen offered the `wp_` table prefix
`wp-admin/setup-config.php` hard-coded `value="wp_"` on the **Table Prefix** field, so a fresh install would have been created with WordPress's prefix even though `wp-config-sample.php` ships `dmp_`. The field now defaults to `dmp_`, matching the sample config. The generated `wp-config.php` has always used whatever was submitted, so this only affected the default shown.

### Fix: the installer was unreachable from the site root
The headless front controller served its placeholder without ever checking whether DMPress had been configured, so on a **fresh install with no `wp-config.php`** visiting the site root returned the static headless page instead of the setup screen. `index.php` now checks for the config file first — in this directory, or one level up when that parent is not itself a WordPress root, mirroring `wp-load.php`'s own lookup — and hands off to `wp-load.php` when it is absent. WordPress then runs its normal redirect to `wp-admin/setup-config.php`.

The check is two `file_exists()` calls ahead of the fast path, so the headless response is unaffected: front-end requests still return in ~13 ms with no WordPress boot.

### Themes screen rewritten — `wp-admin/themes.php`
Replaced WordPress's Backbone-driven theme grid (~1,330 lines of JS templates, details modal, feature filters and search) with a simple server-rendered list, since a metadata-only theme has nothing to preview:

- Themes are **stacked vertically**, showing name, version, author, folder slug and description — all read from the theme's `theme.json`.
- **No screenshots/thumbnails.**
- **Activate is the only action.** The active theme shows an "Active" label; every other theme shows an Activate button. Activating one deactivates the previous theme (WordPress only ever has one active theme).
- No Live Preview, Customize, Delete, auto-update toggles, details modal or theme search.
- Activation still goes through core's nonce-checked (`switch-theme_<stylesheet>`) `switch_theme()` path, and network-disallowed themes are still filtered via `is_allowed()`.

### Themes now own the front end — `index.php` + `wp-includes/dmpress-front.php` (new)
Themes were previously pure metadata: the front controller always served `front/index.html`, so the active theme had no effect on what visitors saw. `index.php` now resolves its entry file in this order:

1. **The active theme's `index.html`** — switching themes in the admin switches the live front end.
2. **`front/index.html`** — a deployed application build, for setups that do not express the front end as a theme.
3. The built-in placeholder.

Resolving the active theme would normally mean reading the `stylesheet` option, i.e. a database connection and a full WordPress boot — exactly what the headless front end exists to avoid. Instead `wp-includes/dmpress-front.php` caches the active theme's directory in `wp-content/dmpress-front.json`, rewritten on `switch_theme` and recreated on the next admin request if missing. `index.php` reads that one small file, so **front-end requests still return in ~13 ms with no WordPress boot**. A missing or unwritable pointer degrades to the fallbacks rather than breaking, and the resolved path is checked with `realpath()` to sit inside `wp-content/themes` so a tampered pointer cannot be used to read arbitrary files.

`{{THEME_URI}}` in a theme's `index.html` is replaced with the theme's public URL when served, so a theme can reference its own assets without hard-coding its slug.

### Permalinks — the URL contract with the front end
In stock WordPress the permalink structure decides which pages core renders. DMPress renders nothing, so the setting means something different here: **it defines the public URL space, and the front end implements it.** The structure is published in every REST `link` field, and a theme routes on those URLs.

This works because the front controller ignores the request path. WordPress's rewrite block sends any request that is not a real file or directory to `/index.php`, which serves the active theme's entry document — so `/some-post/` and `/page/2/` both receive the app shell. That is the single-page-application fallback, and it is now documented in `index.php` rather than being an accident of the implementation. **Unknown URLs therefore answer 200, not 404** — the CMS cannot know which paths the front end considers valid, so the theme renders its own "not found" view.

**Fix: fresh installs were always landing on plain permalinks.** `wp_install_maybe_enable_pretty_permalinks()` decides this by requesting a URL and checking for an `X-Pingback` header. DMPress never boots WordPress for front-end requests, so that header can never appear and the probe could only ever fail. It also looked up the `hello-world` post, which does not exist yet at that point because content types are seeded on the first admin request. The probe now asks the only question that matters — does the web server route a non-file path to `index.php`? — by requesting an arbitrary path and checking for the `X-DMPress: headless` header that the front controller sends. A fresh install now lands on **`/%postname%/`**, falling back to the `/index.php/…` PATHINFO structure and then to plain, so servers without rewrite support still install cleanly.

**The Optional section is removed.** WordPress's Permalinks screen carries *Category base* and *Tag base* fields, which write the `category_base` and `tag_base` options. The only code that ever read those options was core's `create_initial_taxonomies()` — and DMPress does not register these taxonomies in core; they are Content-Type Builder entries like any other. **The fields were therefore dead controls**, storing values that nothing consumed. Confirmed by experiment: with `category_base` set to `option-base`, the registered rewrite slug and the term's REST `link` both still used the builder's value, in both the builder's default and custom-slug cases.

The section, its two save handlers and the now-unused variables are gone, and the help tab points at the Content-Type Builder instead. **Every taxonomy sets its URL base in exactly one place** — the rewrite slug on its own builder entry — rather than the two defaults being special-cased on a screen where the setting no longer worked. Only taxonomy-specific slugs live in the builder; the post permalink structure remains on this screen.

**"Plain" is fully supported.** With no permalink structure there are no rewrite rules, so `/post/hello-world/` and `/page/2/` 404 at the web server and the canonical URL the CMS reports becomes `?post_type=post&p=1` — whose path is just `/`. A front end that routes on paths therefore silently shows the post list for every link. The starter theme detects the mode (the same probe that finds the REST root) and **routes on the query string instead**: `?p=<id>` and `?name=<slug>` for single posts, `?page=<n>` for pagination, with post links taken from the REST `link` field either way. Settings → Permalinks carries a note explaining the trade-off.

**Web server requirements.** Apache is handled automatically: WordPress writes the standard rewrite block to `.htaccess`. **Nginx has no `.htaccess`**, so the equivalent must be added to the server config, or every path except `/` will 404 and the front end will have no routing:

```nginx
location / {
    try_files $uri $uri/ /index.php?$args;
}
```

### Fix: fresh installs served the placeholder until an admin page was opened
Two independent faults made a newly installed site show the built-in *"This is a headless CMS backend"* placeholder instead of its theme.

**The pointer was not written during installation.** `wp-content/dmpress-front.json` was created on the first `admin_init`, so between finishing the installer and opening wp-admin, `index.php` could not resolve the active theme and fell through to the placeholder. It is now also written on the `wp_install` action, at the end of `wp_install()`.

**The front-end document was served with no cache headers**, so a browser was free to keep the placeholder indefinitely — which is why clearing the cache appeared to fix it, and why a fresh domain that had never seen the site before was still affected: it cached the placeholder on its own first visit. Every document response (theme entry, `front/index.html`, placeholder and `robots.txt`) now sends `Cache-Control: no-cache, must-revalidate, max-age=0`. Which document to serve is a server-side decision that changes when the theme does, so the shell must always be revalidated. Static assets are unaffected — the web server serves those under their own URLs with their own caching.

### Search-engine visibility — made to work headlessly, and `robots.txt` fixed
**Settings → Reading → "Discourage search engines from indexing this site"** had almost no effect, and `/robots.txt` was broken.

`blog_public` drives two things in WordPress: a `noindex` robots meta tag on rendered pages, and `Disallow: /` in `do_robots()`. DMPress renders no pages, and front-end requests never boot the CMS, so `do_robots()` never ran — **`/robots.txt` fell through to the front controller and returned the front-end document as `200 text/html`**. The checkbox's only remaining live effect was gating the Update Services box on Settings → Writing. Meanwhile the theme-served front end carried no robots signal at all, so a staging or private site had no way to opt out of indexing.

Rather than remove a setting whose purpose is still real, `index.php` now honours it:

- **`/robots.txt` is served directly**, as `text/plain`. Public: `Disallow: /wp-admin/` plus the `admin-ajax.php` allowance. Discouraged: `Disallow: /`.
- **`X-Robots-Tag: noindex, nofollow`** accompanies every front-end response while discouraged — a header rather than a meta tag, so it applies to the app shell without the theme having to implement anything.

`blog_public` is cached in `wp-content/dmpress-front.json` alongside the active theme, refreshed on `update_option_blog_public` as well as `switch_theme`, so **no WordPress boot is added** — front-end responses still return in ~12 ms. It **fails open**: a missing pointer, or one written before this field existed, is treated as public, so an upgrade or a deleted cache can never silently de-index a live site. (The built-in placeholder still sends `noindex` unconditionally — it is not real content.)

### Starter theme — `wp-content/themes/dmpstarter/`
This is now the **default and only bundled theme**. `WP_DEFAULT_THEME` is `dmpstarter`, and the previous metadata-only `dmpone` theme was removed.

Two things had to change for a fresh install to land on it. `WP_DEFAULT_THEME` was still WordPress's `twentytwentyfive`, which DMPress does not ship; the documented fallback, `WP_Theme::get_core_default_theme()`, scans `WP_Theme::$default_themes` — a list of WordPress's own bundled themes, none of which are shipped either. So `populate_options()` would have written a `stylesheet`/`template` naming a theme that does not exist. The constant now names `dmpstarter` and `$default_themes` lists only it, so the fallback resolves.

A reference headless front end, built only from the REST API with no build step and no dependencies:

- **Lists posts with pagination**, five per page, driving the pager from the `X-WP-Total` and `X-WP-TotalPages` response headers rather than counting client-side.
- **Detects the REST root at runtime.** Pretty permalinks expose `/wp-json/`; plain permalinks only answer on `?rest_route=`. The app probes once and reuses whichever responds, so it works on a fresh install before permalinks are configured.
- **Works with any permalink structure**, including Plain: path routing when rewrite rules exist, query-string routing when they do not.
- The **site title links home** (`{{SITE_PATH}}`), navigating client-side like any other internal link.
- **Category archives.** A category nav in the header (name + post count), category links on each post card, and an archive view with its own pagination. The archive URL base is **derived from the term's REST `link`** rather than hard-coded, so it follows whatever rewrite slug the Content-Type Builder sets — `/category/news/page/2/` with pretty permalinks, `?cat=4&page=2` with Plain. An unknown category slug renders the in-app Not found view.
- **Degrades when Categories is deactivated.** The taxonomy is a Content-Type Builder entry and its REST route 404s when switched off; the theme resolves that to an empty list, so the nav, the per-post category links and the archive routes simply disappear instead of erroring.
- **Real URLs via the History API** — `/post/hello-world/`, `/page/2/` — with same-origin links intercepted for client-side navigation (`/wp-admin`, `/wp-login` and `/wp-json` are deliberately left to the server). Post links come from the REST `link` field, so the permalink structure stays the single source of truth, and routing treats the **last path segment** as the slug — which means it keeps working if the structure changes. Unknown paths render an in-app **Not found** view.
- Requests only the fields it renders via `_fields`, and ships a light stylesheet built on CSS custom properties, so recolouring it means editing the `:root` block.

### `theme.json` theme system
- **`wp-includes/class-wp-theme.php`** — new `parse_theme_json_headers()`; a theme is valid with only a `theme.json` manifest (`name`, `version`, optional `description`/`author`/…), no `style.css` or templates.
- **`wp-includes/theme.php`** — `validate_current_theme()` accepts metadata-only themes.
- Themes are just `theme.json` (+ optional `screenshot.png`) and remain selectable/switchable under **Appearance → Themes**.
- **`wp-content/themes/dmpstarter/`** — the default and only bundled theme (see the starter theme entry above).

### Block API compatibility shim — `wp-includes/block-compat.php` (new)
Inert, no-op implementations of the public block API (`register_block_type`, `register_block_pattern`, `has_blocks`, `do_blocks`, `parse_blocks`, `WP_Block_Type`, `WP_Block_Type_Registry`, …) so third-party plugins that register blocks install and run without fatal errors.

### Consolidated **Admin** menu — `wp-admin/menu.php`
- A single top-level **Admin** menu replaces the separate Settings, Tools, Users, Appearance, and Plugins top-levels, plus the Content-Type Builder.
- Grouped with dim **heading rows** (`dmp-menu-heading`, styled in `wp-admin/css/admin-menu*.css`): Settings · Tools · Users · Appearance · Plugins · Content Types.
- Legacy parents (`tools.php`, `users.php`, `themes.php`, `plugins.php`, …) are remapped so third-party submenu registrations group in automatically.

**Group order** is Content Types, Appearance, Plugins, Users, Settings, Tools. Two things were needed to make that stick:

- **WordPress never sorts submenu arrays.** The `uksort()` in `wp-admin/includes/menu.php` applies to top-level menus only, so submenu items render in registration order and anything added on a later hook — the Content-Type Builder, or a third-party page — lands at the end whatever its index. A pass on `admin_menu` at priority `99999` `ksort()`s the Admin submenu once, after every hook has run, so the index numbers actually determine the order.
- **A hidden anchor row pins the parent slug.** `wp-admin/includes/menu.php` re-parents a top-level menu onto its *first* submenu item whenever the two slugs differ, which moves the whole submenu to a new key and orphans late additions. That previously worked only because the Settings heading happened to be first and happened to use `options-general.php`. Index `0` is now an empty row with that slug and the class `dmp-menu-anchor` (hidden in all four `admin-menu` stylesheets), so groups can be reordered freely without tripping it. The re-parent loop runs before `admin_menu` fires, so it always sees the anchor.

### Comments as a per-post-type feature — `wp-admin/menu.php`
- A **Comments** submenu is added under any post type that supports comments (toggled via the Content-Type Builder), scoped with `edit-comments.php?post_type=<type>`.
- The label is renamable via the `dmpress_comments_menu_label` filter (globally or per post type).

### Dual-version scheme — `wp-includes/version.php`
- `$wp_version = '7.0'` (compatibility: plugin `Requires at least`, wordpress.org APIs, WP-CLI). **Never** set this to the DMPress version — doing so breaks plugin installation.
- `$dmpress_version = '1.0.0-beta.55'` (product version shown in generator tags, admin footer, dashboard).

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
- **Asset cache-busting:** SCF's version never moves while the fork patches its built CSS/JS in place, so browsers kept serving stale copies of DMPress's changes. `includes/assets.php` folds `$dmpress_version` into the registered version string (`?ver=6.9.1-dmp1.0.0-beta.55`), so every release bumps the URL.
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
- **`dms` → `dmp` identifiers.** Leftovers from the earlier "DMSPress" spelling were renamed for consistency: the default theme `dmsone` / "DMS One" became **`dmpone` / "DMP One"** (later replaced entirely by `dmpstarter`) (which also required migrating the `stylesheet`, `template` and `theme_mods_*` options and clearing the theme transients, or the active theme would have been orphaned), the admin menu heading class `dms-menu-heading` became `dmp-menu-heading` (PHP + all four stylesheets), and the `#dms-group-*` menu anchors became `#dmp-group-*`.
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
- **Application Passwords are load-bearing in DMPress, more so than in stock WordPress.** They are the *only* built-in way to authenticate a REST request from outside a browser: `determine_current_user` has just three callbacks, and the other two (`wp_validate_auth_cookie`, `wp_validate_logged_in_cookie`) are cookie-based and need a nonce, so they only work in-browser. With a headless front end and REST as the entire external contract, removing Application Passwords would leave no built-in mechanism for a front-end app, mobile client or integration to authenticate. They stay.
- **WP-CLI:** works against the compatibility version, but cannot reach the database in this particular dev environment (CLI-PHP limitation, not a fork issue).
