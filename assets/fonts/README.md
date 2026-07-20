# Fonts shipped with the plugin

Nothing here is fetched from Google Fonts or any other CDN. Every file is served
from this plugin folder on your own site.

## Webfonts (WOFF2)

The `*-latin-*.woff2` files back the Global Font setting and the accessibility
reading mode. They are the `latin` subset. Families whose file is named
`-wght-normal` are variable-weight and cover 100-900 in a single request; the
rest ship fixed weights.

All 23 families are licensed under the SIL Open Font License 1.1, which is
GPL-compatible. The full licence text is in `OFL.txt`. Files come from the
Fontsource distribution of the upstream project repositories
(https://fontsource.org).

## PDF font

`NotoSans-Regular.ttf` is embedded into generated PDF reports, which need a real
TTF rather than a webfont. Noto Sans is also SIL Open Font License 1.1.
