# Questionnaire and Data Model Mismatch

The content questionnaires in `texte/` were designed to collect material for wireframes and page layouts. They describe the exhibition as a designer sees it: chapters contain slides, and each slide combines prose, quotations, images, captions, objects, references, and layout instructions. The application model in `src/content.config.ts` serves a different purpose. It separates chapters, subchapters, galleries, images, and objects into reusable records connected by stable references. Converting a questionnaire is therefore an editorial migration, not a mechanical change from one file format to another.

## Where the questionnaire falls short

The questionnaire does not reliably encode hierarchy or identity. A section may be called a chapter in one file and a subchapter in another; slide numbering can be incomplete or contradictory. Object slugs are usually blank, while cross-references are prose such as “Kap. 7, Folie 3” rather than stable IDs. Filenames are often the only identifiers, even though they contain spaces, inconsistent numbering, unsupported TIFF extensions, or names that changed during image processing.

It also mixes entities that the data model deliberately separates. “Object(s) shown” may refer to one physical object with several photographed pages, several objects already combined in one image, or several image files that should be displayed as a single side-by-side composition. Captions and credits may apply to one image, a whole group, or the underlying objects. Spatial labels such as “links”, “rechts”, and “vorne” describe the relationship between an object and a particular composite; they belong on that object's image association, not on the image metadata or as permanent properties of the object.

Finally, the questionnaire contains important material without a dedicated field in the current schema. Transcriptions, bibliography references, related objects, design notes, delivery status, and unresolved questions occur alongside publishable copy. Required application data may meanwhile be absent: useful alt text is rare, colors are unspecified, slugs are blank, and draft markers such as `???`, “lacking”, or template instructions remain in nominal content fields. Dates, names, inventory numbers, and credits can also contradict one another within the same questionnaire.

## Migration rules

Treat the executable schema as the validation target and the questionnaire as source evidence. First reconstruct the chapter and subchapter hierarchy, then assign stable ASCII IDs and slugs. Create gallery, image, and object records separately, preserving their many-to-many relationships. Asset filenames should be normalized and converted to supported formats without using the normalized filename as proof that two records describe the same object.

Store reusable catalog facts and image relationships on objects, while image metadata contains only `dateiname`, `altText`, `beschriftung`, and `nachweis`. An object's `bilder` array is ordered for its detail page. Each association can carry a relationship-specific `position` and `objektReihenfolge`, so “Links” or “Rechts” does not leak into another view of the same object and shared-image caption order remains stable. If several files must appear as one visual unit, do not silently flatten them into independent gallery slides. Use a prepared montage, extend the model with an explicit image-group concept, or record the layout request as unresolved until the presentation behavior is decided.

Long transcriptions and descriptions can live in an object's Markdown body when they describe that object. Use headings to distinguish pages or views. Gallery body Markdown should contain the curatorial narrative and quotations. Do not force bibliography, workflow notes, or unresolved questions into visible prose merely because no structured destination exists.

## Edge cases and editorial review

Placeholder text must not become published metadata. Blank template prompts, “none”, and instructions such as “Short description for accessibility” should be omitted; genuinely unknown values and uncertain dates should be retained only when they are intentional catalog information. Object records must always contain their required metadata; asset preparation must not create empty object templates.

Conflicts require editorial decisions rather than arbitrary normalization. Compare institution, inventory number, source URL, credit, and image content before deduplicating records. Preserve historical spelling in quotations and transcriptions, while correcting clear errors in newly written narrative or metadata. Mark unresolved dates, names, truncated transcriptions, and copied identifiers for review instead of guessing.

Cross-references should be resolved only after target routes and anchors exist. Until then, keep them as tracked migration issues rather than publishing literal questionnaire instructions such as `[Querverweis ...]`. Alt text must be authored from the actual image, not copied from captions or template prompts.

The conversion of chapters 1 and 2 illustrates the general rule: preserve supplied scholarship, normalize relationships, and separate definite corrections from unresolved curatorial choices. Validation can confirm that records fit the schema, but it cannot decide whether a date is authoritative, whether two scans form one designed image, or whether an unfinished transcription is complete. Those cases need an explicit editorial pass.
