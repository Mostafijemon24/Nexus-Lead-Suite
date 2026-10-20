# Nexus Lead Suite — Redesign Release Checklist

For the maintainer. Nothing on this list has been done by the redesign branch unless marked ✅; the branch was never tagged, released or deployed.

## A. Decide

- [ ] **Version number.** Plugin header, `nexulesuite_VERSION` and `readme.txt` stable tag are all `1.2.18`, while git history reached `1.2.26`. Pick the next version and change the three places together (`nexus-lead-suite.php` header + constant, `readme.txt` Stable tag + changelog entry). The redesign did not touch them.
- [ ] **Merge target.** The branch is `claude/determined-heisenberg-3v6hrp` (16 commits on top of `b88315e`). Review the pull request diff with `REDESIGN-CHANGELOG.md` beside it; `git diff b88315e..<head> -- '*.php'` must stay empty.

## B. Verify on a real site before tagging

- [ ] Install the built plugin on a staging WordPress (MySQL, not SQLite) with existing data: forms, submissions, popups, buttons, email templates, AI settings. Open every admin page; confirm saved values appear unchanged and Save round-trips without altering them.
- [ ] Walk the flows the sandbox could not reach (all **BLOCKED / NOT TESTED** in `REDESIGN-TEST-REPORT.md` §6): Google/Microsoft OAuth connect + disconnect, SMTP test mail, AI provider connection / training / auto-setup, captcha verification, logo and chat-image upload to the media library, client share-link creation and revoke, PDF report output.
- [ ] Check the admin app in Safari and Firefox, and with the WordPress admin menu collapsed and in RTL if you support it.
- [ ] Check with other plugins active that inject admin CSS (page builders, security plugins): the app now uses a scoped reset instead of a global preflight, so the rest of wp-admin should look normal.
- [ ] Open the front end: forms, popups, smart buttons, accessibility dock, chat widget. Public assets are untouched, but confirm nothing regressed in your theme.

## C. Build and package

- [ ] Rebuild from source (optional; the committed assets already match the source):
  ```
  cd admin && npm ci && npm run build
  ```
  This writes `assets/admin/js/main.js`, `assets/admin/css/main.css` and `assets/admin/vite-manifest.json`. The `assets/admin/.vite/` cache is git-ignored.
- [ ] Build the distribution zip **excluding** repository-only files: `.git*`, `.claude/`, `admin/node_modules/`, `docs/`, `README.md`, `REDESIGN-FUNCTIONALITY-MAP.md`, `REDESIGN-CHANGELOG.md`, `REDESIGN-TEST-REPORT.md`, `REDESIGN-RELEASE-CHECKLIST.md`. Keep `admin/src/`, `admin/package.json`, `admin/vite.config.js`, `admin/tailwind.config.js`, `admin/postcss.config.js` and `admin/scripts/` because `readme.txt` promises the build source inside the package.
- [ ] Confirm the zip has no `.map` files and no `node_modules`.

## D. Metadata and WordPress.org

- [ ] Add a changelog entry to `readme.txt` (suggested wording):
  > Redesigned the admin interface on a shared design system: consistent layout, typography and colour across all pages, responsive down to phone widths, keyboard-accessible dialogs and controls, WCAG AA text contrast. No change to features, settings, data or the public front end.
- [ ] `readme.txt` "Source Code" section: `admin/src` is now the real source of the shipped bundle (it was out of date before this branch). No wording change needed.
- [ ] Plugin screenshots on WordPress.org: retake them; the old ones no longer match. Contact sheets for reference: `docs/redesign-audit/screenshots/contact-desktop.jpg`, `contact-phone.jpg`.
- [ ] "Tested up to" in `readme.txt`: unchanged by the redesign; update if you test on a newer core.

## E. Rollback plan

- [ ] The redesign is confined to `admin/`, `assets/admin/` and documentation. Reverting the branch (or restoring `assets/admin/js/main.js`, `assets/admin/css/main.css`, `assets/admin/css/wp-admin-chrome.css`, `assets/admin/css/form-builder-fui.css`, `assets/admin/css/range-slider.css` from `b88315e`) restores the previous UI with no data migration, because no option, table or PHP file changed.

## F. Known follow-ups (optional, not blockers)

- [ ] `admin/class-admin-app.php` still injects a `MutationObserver` for a "select a popup / button 01" `<select>` that no longer exists in the UI (it did not exist in the shipped bundle either). Safe to remove in a PHP change.
- [ ] Deletions without a confirmation step (Smart Buttons, Email templates, Submissions) were preserved as they were; consider adding confirmations in a feature change.
- [ ] The Email HTML editor "Cancel" does not revert the draft (preserved behaviour).
- [ ] Headless screenshots show TinyMCE toolbar glyphs as boxes because the test container lacks the icon font; verify on a real site.
