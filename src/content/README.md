# Content Editing

The exhibition content is split into four content collections:

- `chapters`: chapter-level navigation and ordering.
- `subchapters`: one page per subchapter, with hero data and gallery order.
- `galleries`: one gallery/narrative block per repeated section on a subchapter page.
- `objects`: canonical object and image metadata, used by galleries and object pages.

Edit object metadata only in `objects`. Galleries should reference objects by slug instead of repeating creator, date, institution, image credit, or alt text.

Long text lives in the Markdown body below the frontmatter. Structured data lives in the YAML frontmatter between the `---` lines.

Unknown or not-yet-needed fields should be omitted instead of filled with `TODO`. Add fields later when the information is available.

Images used by objects are source-controlled masters in `src/assets/objects`. Create them from the ignored `import` folder with:

```sh
npm run images:preprocess -- import/Hebel_Ausstellung src/assets/objects --flat
```

The script writes lossless WebP files with a 4096px maximum long edge by default.
