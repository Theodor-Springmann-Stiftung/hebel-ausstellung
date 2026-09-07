# Hebel-Aussellung Astro Kit

## Licensing

**Warning:** Different exhibition objects, images, scans, and other third-party content may be subject to different licensing terms and usage restrictions. Consult [LICENSES.csv](LICENSES.csv) and the linked original sources before reusing any content. A missing or unresolved license entry does not imply permission to reuse the corresponding object or image.

## Project Structure

```text
/
├── public/ -- Files copied into the destination at build time
├── src
│   ├── assets -- Asset files processed by astro
│   ├── components -- Component files
│   ├── layouts -- Main HTML layouts
│   └── pages -- Subpage designs
├── package.json -- nodejs package file
└── astro.config.mjs -- Astro config & build script 
```


## Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run images:clear-cache` | Clear optimized images before an intentional clean rebuild |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run licenses:generate` | Regenerates `LICENSES.csv` after metadata changes |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

Production builds retain Astro's optimized image cache in `node_modules/.astro/assets`.
GitHub Actions restores and saves this cache through `withastro/action`. Pages are
rebuilt normally, but unchanged image variants are reused. Changing an image's
contents or its resize/format/quality options generates new variants automatically.
The first build without a cache is still a full image build. To force regeneration,
run `npm run images:clear-cache` before `npm run build` locally, or delete the
repository's `astro-cache-*` caches in GitHub Actions before rerunning deployment.


## Credits

Nyght Serif: https://www.tunera.xyz/fonts/nyght-serif/
Geist: Vercels Geist https://vercel.com/font
