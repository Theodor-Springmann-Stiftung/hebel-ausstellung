# Open Content Questions

This file records information that could not be migrated from the questionnaires without guessing. The questionnaires remain the source for the references below; an answer should be confirmed editorially before the structured content is changed.

## General

- Alt text is missing or contains only questionnaire instructions for most images in chapters 3–7. It must be written from the actual image, not inferred from a caption.
- Gallery colors are not specified in the questionnaires. The schema default is currently used.
- Bibliography references, workflow notes, and related-object prompts have no direct field in the current model. Examples: chapter 4 *Biblische Geschichten* cites `Biblische Geschichten II, Nr. 56`; chapter 6.2 cites Sophie Haufe's *Zeit- und Hebelerinnerungen* as `ZHE`; chapter 6.3 contains workflow markers such as `XXXnoch scannenXXX`; and the object questionnaires repeatedly provide a `Related objects` field. Sources: `texte/Hebel_Ausstellung/4_Der Theologe/CONTENT QUESTIONNAIRE_4_Biblische_Geschichten.md`, `texte/Hebel_Ausstellung/6_Der Junggeselle/Haufe/CONTENT QUESTIONNAIRE_2026-06-03_H_u_F_Sophie_Haufe.md`, and `texte/Hebel_Ausstellung/6_Der Junggeselle/Hendel/CONTENT QUESTIONNAIRE_2026-06-17_Hendel.md`. Should bibliography and related objects become structured data, while workflow notes remain migration-only?
- Several slides request composites or side-by-side groups, while the model only stores an ordered list of images. Examples: chapter 2.1.2 requests three paired groups; chapter 4 *Kirchenunion* requests two objects `nebeneinander auf einem Bild`; chapter 6.3 slides 1, 2, 3, and 5 request multiple objects in one image; and chapter 6.3 slide 4 requests four objects in one image, with its first object assembled from two files. Sources: `texte/Hebel_Ausstellung/2_Der Dichter/2.1_AG_1803/CONTENT QUESTIONNAIRE_2026-06-12_2.1_AG_1803.md`, `texte/Hebel_Ausstellung/4_Der Theologe/CONTENT QUESTIONNAIRE_2026-06-18_Kirchenunion.md`, and `texte/Hebel_Ausstellung/6_Der Junggeselle/Hendel/CONTENT QUESTIONNAIRE_2026-06-17_Hendel.md`. Should these use prepared montage assets or a structured image-group/layout field?
- Several cross-references identify a chapter or slide in prose but no stable target. Examples: the chapter 4 Belchen caption links `proteusische Kultstätte` to chapter 5; chapter 6.1 slide 2 points to chapter 7 slide 2; chapter 6.3 slide 3 points to chapter 2.2 slide 4; and chapter 7 slide 3 points to chapter 1 slide 2 and other questionnaire slide labels. Sources: the corresponding questionnaires under `texte/Hebel_Ausstellung/{4_Der Theologe,6_Der Junggeselle,7_Der Briefschreiber}/`. Confirm the target routes and anchors before converting these instructions to links.

## Missing image files

Status after comparing chapters 3–7 with `src/content/images`, `src/assets/objects`, and the source files under `import/Hebel_Ausstellung/`:

- **Referenced and missing:** `BuP_3_review_ALZ_magn_glass_TSS` in chapter 5, slide 3 (*Die Proteuserphilosophie*). No matching source or normalized asset was found. This gallery currently has no displayable image.
- **Requested but not currently referenced:** the Karl Christian Gmelin portrait for chapter 6.1, slide 2. The questionnaire explicitly says that one image is missing and supplies neither a filename nor a usable credit. Confirm whether it should be supplied and added as a third image, or whether the slide should remain limited to the two *Flora* images.
- **Requested but not currently referenced:** `6.3_04_1d_Schwarzwälder_D5_TSS` for chapter 6.3, slide 4. The questionnaire marks the scan, filename, and inventory number as unfinished. Confirm whether it will be supplied or whether the slide is complete without it.
- **Missing inline symbol asset:** `media/image1.tiff` from the chapter 5 questionnaire. It represents the custom three-stroke Pi used within running text, not a gallery image. Confirm whether this should be supplied as an SVG/web image, a font glyph, or remain textualized as `dreigebalktes Pi`.
- All currently referenced chapter 3, 4, 6, and 7 images resolve to existing assets. Chapter 5 resolves except for the ALZ image above.

## Chapter 1: Der Oberländer

Source: `texte/Hebel_Ausstellung/1_Der Oberländer/CONTENT QUESTIONNAIRE_Lebensstationen_2026-06-23.md`

The title `Der Oberländer` and the Wiesental hero are confirmed project decisions. Their difference from the questionnaire is not an open question.

- Two editorial markers remain visible: `[kollationieren]` in `src/content/galleries/1-03-schopfheim.md` and `[mit Anmerkung]` in the Rheinwald caption in `src/content/images/1_05_01_Stammbuch_Rheinwald_BLB.md`.
- The gallery currently prefers linked object metadata over image `beschriftung` and `nachweis`. This hides detailed credits, URLs, dimensions, and rights statements stored on chapter 1 image records. Confirm whether image credits must also be displayed when objects are linked.
- Both Swiss-journey records call their asset a `Titelkupfer`. `1_08_01_Ebel_8_Zuerich.webp` is a printed title page and `1_08_02_Ebel_5_Zuerich.webp` is a landscape view. Confirm separate captions for the two images.
- The two Ebel records each contain both e-rara links concatenated together. Confirm which DOI belongs to which image: `10.3931/e-rara-9810` and `10.3931/e-rara-32257`.
- The accepted Wiesental hero lacks a holding institution, shelfmark, stable source URL, rights statement, and object association. Confirm whether this metadata is available.
- The former Karlsruhe-plan hero remains as an unreferenced image, object, and asset. Confirm whether it should remain as archival content or be removed.
- `n.a.` remains as the inventory number for the Lateinschule object and as the creator of the Strasbourg fish-market object. Should these fields be omitted, displayed as unknown, or replaced with authoritative data?
- The Karlsruhe object has no institution or inventory number; only a secondary Schefold reproduction citation is supplied.
- The Widmungsgedicht and Stammbuch transcriptions now contain all text supplied by the questionnaire, but the facsimiles also show deletions, calculations, symbols, and marginal annotations. Confirm whether complete diplomatic transcriptions are required.
- `src/assets/objects/1_00_homepage_oberlaender.png` contains JPEG data despite its `.png` extension. Confirm whether this should be converted or renamed.

## Chapter 2: Der Dichter

Sources: all Markdown files under `texte/Hebel_Ausstellung/2_Der Dichter/`.

- The chapter hero questionnaire requests a montage of the original wrapper and title page. The current `2.0_hero_image_Tschoepli_TSS.webp` asset shows only the wrapper, while its image record describes and links both objects. Either create the montage or change the hero caption, alt text, and object relationship to describe only the wrapper.
- `2.0_srollytelling_image_AG804_schwarzer_Rahmen` is an unreferenced image/asset pair with no alt text, caption, or credit. Confirm whether it is stale or still required by a planned interaction.
- Subchapters 2.2, 2.3, and 2.4 have no introduction text because the questionnaires leave it blank. Confirm whether an introduction is required before publication.
- Most chapter 2 object records have no description because the object-detail prompts are blank or placeholders. Confirm which public object pages require curatorial descriptions.
- The Richter/Gaber image and publication are dated 1851, while the object detail gives 1850. Confirm whether these are creation and publication dates and how both should be displayed.
- Scheffner's name alternates between `Johann George Scheffner` and `Johann Georg Scheffner` across narrative, captions, alt text, and object metadata. Confirm the authoritative form.
- The 2.2 and 2.4 questionnaires supply neither hero nor navigation label. Current records infer heroes and labels; confirm those choices.

## Chapter 3: Der Hausfreund

Source: `texte/Hebel_Ausstellung/3_Der Hausfreund/CONTENT QUESTIONNAIRE_Kapitel 3_2026-07-07.md`

- Slide 2 gives different holdings for the 1805 calendar. The slide credit names the Hebel-Archiv Heidelberg; the object detail names the Badische Landesbibliothek Karlsruhe and supplies `urn:nbn:de:bsz:31-257642`.
- Slide 2 supplies a transcription for a composite comparison but does not say whether it applies to one or both versions.
- Slide 3 calls the first 1814 copy an `unkorrigierter Probedruck`; its object detail calls it a `Korrekturexemplar`.
- Authorship of `Ehrlichkeit eines Juden` is explicitly uncertain.
- The filename `3_04_01_Brief an Kölle 1815_BLB.tif` says 1815, but the letter is dated 25 October 1814.
- Identification of the depicted 1815 calendar as the copy sent to Kölle is tentative (`dürfte`).
- The letter shelfmark appears as both `K 3071, 1` and `K 3071,1`. Confirm the preferred form.
- The object detail says `Erstausgabe 811`; the surrounding date and references say 1811. The structured record currently uses 1811 as the evident mechanical correction.
- Slide 6 says Kafka gave the volume in 1821, while the narrative and object date say 1921. Which date should the caption use?
- Kafka's shelfmark appears as both `800 390` and `800390`.
- The creator of *Vade Mecum für lustige Leute* is given only as `n.a.`.
- `Kaspar Hegi (?)` is explicitly uncertain and has been retained as such.
- Slides 2–5 give shared captions for multiple images without defining their image-level allocation.

## Chapter 4: Der Theologe

Sources:

- `texte/Hebel_Ausstellung/4_Der Theologe/CONTENT QUESTIONNAIRE_2026-06-03_final_Theo.md`
- `texte/Hebel_Ausstellung/4_Der Theologe/CONTENT QUESTIONNAIRE_2026-06-18_Kirchenunion.md`
- `texte/Hebel_Ausstellung/4_Der Theologe/CONTENT QUESTIONNAIRE_4_Biblische_Geschichten.md`

- The hierarchy is contradictory. The main questionnaire calls its content section 4.1, while *Biblische Geschichten* says chapter 4 has no subchapters. Decide whether chapter 4 contains direct galleries or subchapters.
- The Kirchenunion questionnaire contains `Slide $$ of $$` and no section number, so its position in the chapter is unknown.
- *Biblische Geschichten* announces two slides but supplies only one slide block containing two images.
- *Biblische Geschichten* is labeled section 4.3, while its filenames use `Theo_4_2`.
- The *Biblische Geschichten* cover credit names the Hebel-Archiv Heidelberg on the slide, but both object details name Li-Wen Kuo.
- The Ehrenpromotion is dated `Juli 1821` in the object detail and `2. August 1821` in its credit. The structured date is omitted pending confirmation.
- Material and technique are missing for most objects. `Radierung/Aquatinta` is explicit only for the Stadtkirche image.

## Chapter 5: Der Proteuser

Source: `texte/Hebel_Ausstellung/5_Der Proteuser/CONTENT QUESTIONNAIRE_2026-06-03_final_BuP.md`

- `Allmanach` and `Almanach` are both used for the same title. Confirm the intended spelling in titles, captions, and alt text.
- Slide 1 quotes `uhrähnliches Ebenbild` but then discusses the `h` in `uhranfänglich`. Confirm the intended quoted word.
- The exact reading and placement of the three-stroke Pi within dates and words cannot be reconstructed from the converted Markdown.
- Slide 2 is titled `Das Wörterbuch des Belchismus` and says the dictionary is illustrated, but the listed objects are only the Meichelt drawing and Hebel's Z 368 drawing. Is a dictionary image missing?
- Institution and inventory number for *Der Proteuserschwur* are given as `???`.
- The questionnaire asks whether Hebel is fourth from the left in Meichelt's drawing. This identification remains unconfirmed.
- The questionnaire asks whether the Z 368 topography depicts the Belchen silhouette. This remains unconfirmed.
- The Z 368 object-detail alt text repeats the title-page alt text and conflicts with the slide-specific description. The slide-specific description was retained where applicable.
- The ALZ photograph concerns a 1790 review, but its object block gives 1813, BLB Karlsruhe, and `K1216`, apparently copied from the preceding object. Those fields were omitted.
- Li-Wen Kuo/TSS is listed as both creator and image credit for the ALZ photograph. Confirm the intended role.

## Chapter 6: Der Junggeselle

Sources:

- `texte/Hebel_Ausstellung/6_Der Junggeselle/Fecht/CONTENT QUESTIONNAIRE_Kap. 6.1_2026-07-16.md`
- `texte/Hebel_Ausstellung/6_Der Junggeselle/Haufe/CONTENT QUESTIONNAIRE_2026-06-03_H_u_F_Sophie_Haufe.md`
- `texte/Hebel_Ausstellung/6_Der Junggeselle/Hendel/CONTENT QUESTIONNAIRE_2026-06-17_Hendel.md`

### Gustave Fecht

- The Gustave Fecht hero has no distinct object identity. Slide 1 also lacks creator, date, inventory number, and description.
- Hoffmann's *Flora* is dated 1796 in the object block, while the credit describes an edition `für das Jahr 1795`.
- Agricola's image filename/object says `dritte Serie`, while the narrative says `zweite Druckserie`.
- The relevant Kupferstich cannot be identified with certainty according to the questionnaire.

### Sophie Haufe

- The questionnaire labels the section 6.2 but calls it `Chapter 8`. The folder and section number were used.
- It announces four slides but supplies three slide blocks. The relief is currently used as the hero, but its date is unknown.
- The Sophie Haufe drawing is described as having unknown origin and creator, but its object block assigns it to the Hebel-Archiv with inventory `101B07`.
- Both the relief and Sophie Haufe drawing use inventory `101B07`. Confirm whether that is correct.
- Jakob I is also assigned `101B07`, apparently copied from the Haufe records; this inventory number was omitted.

### Henriette Hendel

- The questionnaire supplies no introduction, hero, or navigation label. Subchapter 6.3 currently uses the inferred navigation label `Henriette Hendel` and the first gallery image as its hero, has no introduction, and contains all five galleries. Confirm those choices and whether an introduction should be supplied.
- The Peroux/Ritter objects are dated 1810 in captions and object details, while publication credits say `[1794]`.
- Novelli's object block contains a Peroux URN, while the slide credit gives accession `1988.14.1`. The accession number was used.
- The Stammbuch object block repeats the unrelated Peroux URN; its slide credit gives `623117-A THE MAG`. Only the latter was used.
- The letter to Friedrich Karl Schütz has no inventory number.
- The Haufe-family letter names both `Landesbibliothek Karlsruhe` and `Badische Landesbibliothek Karlsruhe`; the expanded credit form was used.

## Chapter 7: Der Briefschreiber

Source: `texte/Hebel_Ausstellung/7_Der Briefschreiber/CONTENT QUESTIONNAIRE_Kap 7_2026-07-15.md`

- The hierarchy is contradictory: the file says chapter 7 with six slides, but also refers to section 2.2, a subchapter page, and a subchapter title. The six galleries are currently attached directly to chapter 7.
- Slides 2 and 3 provide one caption for several images. Confirm whether each caption is gallery-wide.
- The Ittner letter date is `19. Mai 1811` in the slide label and `19. Mai [1811]` in the object detail. The bracketed object-detail date was retained.
- The Hebel-to-Jäck date appears as both `12.3.[1810]` and `12.3.1810`.
- The February 1815 object is identified as a letter to Haufe, but its transcription addresses `lieber Thurn`. Confirm recipient and title.
- Both Haufe letters use inventory number `K 1217`. Confirm whether a folio or item suffix is missing.
- The Ittner text labeled `Transcription` appears to be a German translation of the Latin letter. Should it be labeled as a translation?
- The Jean Paul transcription has an unusual paragraph break after `der` and ends incompletely with `[...]`. Confirm whether this is intentional.
- The Kölle transcription contains `[???]`, alternative readings separated by `/`, and an incomplete ending. A reviewed transcription is needed.
- Potential source errors were preserved, including `» Ihr`, `( er schreibt`, and `Schatzkästlerin`. Confirm whether they should be corrected.
- The Jean Paul letter has inventory number `n.a.`; no structured inventory number was stored.
- Credits alternate between abbreviated and expanded institution names. Confirm whether catalog display should normalize these forms.
