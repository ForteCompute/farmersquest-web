# Poppins (self-hosted)

The brand sans typeface, self-hosted so the app serves it from its own origin with no external font
CDN. Loaded by `src/design-system/fonts.css` and bundled by Vite.

- Family: Poppins
- Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold), normal style
- Subset: latin, `.woff2` with a `.woff` fallback
- License: SIL Open Font License 1.1, see `OFL.txt`

## Provenance and updating

These files are the latin, normal-style weights taken from the `@fontsource/poppins` package (which
packages the upstream Poppins project under the OFL). To refresh or add weights:

```bash
npm install --no-save @fontsource/poppins
cp node_modules/@fontsource/poppins/files/poppins-latin-<weight>-normal.woff2 src/design-system/fonts/poppins/
cp node_modules/@fontsource/poppins/files/poppins-latin-<weight>-normal.woff  src/design-system/fonts/poppins/
```

Then add a matching `@font-face` block in `src/design-system/fonts.css`. Keep the weights in step
with the typography tokens in `src/design-system/tokens/typography.ts`.
