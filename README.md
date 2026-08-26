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
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run licenses:generate` | Regenerates `LICENSES.csv` after metadata changes |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |


## Credits

Nyght Serif: https://www.tunera.xyz/fonts/nyght-serif/
Geist: Vercels Geist https://vercel.com/font
