# Firefly III UI fork

This branch keeps current Firefly III behavior and adds a small presentation layer
for daily finance work. `main` mirrors `upstream/main`; UI work belongs only on
`ui-improvements`. Push only to the `fork` remote.

## What changed upstream

The last release with the old interface is **v6.6.6** (2026-07-01). The replacement
first appears in **v6.7.0**, merge commit `6b82da5edf`, and is documented under
**v6.7.1** (2026-09-15), which superseded v6.7.0. The release replaced Twig with
Blade, AdminLTE 2 / Bootstrap 3 with AdminLTE 4 / Bootstrap 5, Font Awesome with
Bootstrap Icons, and the transaction forms. Compare:

```sh
git diff --stat v6.6.6 v6.7.0 -- resources/views resources/assets public
git show v6.6.6:resources/views/layout/default.twig
git show v6.7.0:resources/views/layout/v3/session.blade.php
```

That comparison changes 1,053 UI files, including removal of the old skins and
`public/v1/css/firefly.css`. This is a framework/theme replacement, rather than
one missing stylesheet. Some old markup survived: the sidebar's Bootstrap 3
`input-group-append` needs joined button corners and flex alignment under
Bootstrap 5. AdminLTE still provides the `sr-only` compatibility class, so the
fork leaves that alone. The new dashboard uses large saturated
`text-bg-*` boxes and the forms have a different hierarchy.

Later upstream changes include `e396488624` (compact mode and colors),
`34534b61ee` (0.9rem base font), and `2c653d86d5` (Roboto), first included in
v6.7.2. `19e59667c8` improves monetary contrast. These fixes help but do not
restore the old theme. The fork builds on the current markup and retains the
upstream positive/negative/transfer money colors.

## Fork changes and files

- `public/css/ui-fork.css`: neutral light/dark surfaces, a restrained teal
  accent, system fonts, clearer headers, compact readable table cells, tabular
  amounts, stronger neutral-money contrast, consistent form spacing and focus
  outlines, calmer dashboard cards, and a responsive login card. Fixes the
  surviving sidebar search markup and compact navbar height. Wide ledgers scroll
  within their cards on smaller screens, with space for open row menus.
- `resources/views/partials/layout/ui-fork.blade.php`: loads the stylesheet with
  a modification-time cache key, using Laravel's asset URL helper.
- `resources/views/layout/v3/session.blade.php`: one include immediately after
  upstream's `@vite(['sass/app.scss'])`.
- `resources/views/layout/v3/auth.blade.php`: the same one-line hook for login,
  registration and password screens.
- `resources/assets/v3/js/fork/chart-theme.js`: a presentation-only Chart.js
  plugin that colors dashboard axes from the CSS tokens and redraws on theme
  changes. Canvas text otherwise remains hardcoded gray on dark backgrounds.
- `resources/assets/v3/js/shared/draw-chart.js`: one import of the chart plugin.
- `UI-FORK.md`: rationale, maintenance and verification notes.

The stylesheet is served directly; the chart plugin builds through the existing
Vite entry points. Neither needs extra dependencies or generated files in Git.
Only two declarations use `!important`,
scoped to dashboard card colors, because upstream `text-bg-*` utilities already
use it. Breakpoints and sidebar behavior remain owned by AdminLTE. Error, install
and email layouts retain upstream styling.

## Verification

At upstream baseline `ba26768619` / v6.7.9:

- Installed locked Composer dependencies with `--no-scripts` and Node dependencies
  with `npm ci` (root npm workspace; do not install a separate workspace lock).
- `npm run build --workspace=v3` succeeds. Upstream Sass deprecation warnings are
  unchanged. The override itself is plain CSS.
- `php artisan view:cache --env=testing` compiles the Blade views. No enabled
  view/layout test suite exists; the legacy homepage feature test is disabled.
- `vendor/bin/phpunit -d memory_limit=512M --testsuite unit --no-coverage` passes:
  373 tests, 376 assertions. Upstream emits two PHPUnit configuration
  deprecations. The default 128 MB runtime exhausts memory before completion.
- Integration tests require local Passport keys. With keys generated, the suite
  stops at `BillControllerTest::testGivenAuthenticatedRequestWhenCallingTheBillsEndpointThenReturns200HttpCode`:
  expected 200, received 401. This is an existing API authentication failure,
  reproduced with both layout hooks removed.
- Headless Chromium renders login, dashboard, populated accounts and transactions,
  and transaction create/edit pages in light and dark mode. Checks use disposable
  SQLite fixtures, generated English JSON from the checked-in translations, and
  a loopback preview bridge to the PHP 8.5 container. They exercise real routes,
  Blade and frontend bundles with a test identity; onboarding is suppressed for
  screenshots. No personal financial data is accessed or altered.
- All six pages return 200 at 375, 768 and 1440 pixels in both themes (36 cases),
  with no page-wide horizontal overflow or failed asset/API requests. Checked
  sidebar collapse and mobile opening, row dropdown visibility, and print
  overflow/sidebar rules. Navbar text contrast measures 15.43:1 in light mode
  and 11.85:1 in dark mode; neutral amounts measure 6.35:1 and 7.52:1.
- The new chart module passes ESLint. A canvas pixel check confirms axis labels
  use the theme token both at initial load and after light/dark theme changes.

The checks cover presentation, not production authentication, real-world data
volumes, saving transactions, all languages, or every optional form widget. The
chart plugin covers current Chart.js dashboard charts; legacy report charts
still use upstream's chart styling.
Node's existing dependency audit reports four high-severity findings in
`patch-package`, `find-yarn-workspace-root`, `micromatch`, and `braces`; dependency
versions are unchanged by this branch.

For future changes, build upstream assets, compile Blade, and check login,
dashboard, accounts, transaction lists and create/edit forms at desktop, tablet
and phone widths in both themes. Check sidebar collapse, dropdowns, table scroll,
keyboard focus and print styles. Use isolated test data for browser work.

## Sync upstream

Start with a clean working tree. These are the exact synchronization steps:

```sh
git fetch upstream
git checkout main
git merge --ff-only upstream/main
git push fork main
git checkout ui-improvements
git merge main
# Resolve conflicts, usually only in override files or the layout hooks.
# Keep each include after upstream's stylesheet; inspect new theme/markup changes.
# If conflicts occurred: git add <resolved-files> && git commit
```

Reinstall locked dependencies when the lockfiles change, rebuild upstream assets,
repeat verification, then publish the branch without force:

```sh
git push fork ui-improvements
```

Never push to `upstream`, force-push, or commit fork styling to `main`. If upstream
renames a layout, move the one-line hook to its replacement. Prefer adding focused
rules to `ui-fork.css` over editing upstream components or compiled assets.
