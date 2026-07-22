# Open Content Questions

This file records information that could not be migrated from the questionnaires without guessing. The questionnaires remain the source for the references below; an answer should be confirmed editorially before the structured content is changed.

## General

- Alt text is missing or contains only questionnaire instructions for most images in chapters 3–7. It must be written from the actual image, not inferred from a caption.
- Gallery colors are not specified in the questionnaires. The schema default is currently used.
- Bibliography references, workflow notes, and related-object prompts have no direct field in the current model. Should any of these become structured data?
- Several slides request composites or side-by-side groups, while the model only stores an ordered list of images. Should these use prepared montage assets or a new image-group field?
- Several cross-references identify a chapter or slide in prose but no stable target. Confirm the intended routes before converting them to links.

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
- The Kirchenunion slide says two objects should appear `auf einem Bild` but supplies two separate filenames. Confirm whether a montage is required.
- None of the named chapter 4 hero or slide assets is present in `src/assets/objects`, and several names have no extension. The galleries are therefore not attached to the chapter and cannot be published yet.
- The *Biblische Geschichten* cover credit names the Hebel-Archiv Heidelberg on the slide, but both object details name Li-Wen Kuo.
- The Ehrenpromotion is dated `Juli 1821` in the object detail and `2. August 1821` in its credit. The structured date is omitted pending confirmation.
- The two *Biblische Geschichten* images have distinct captions, but image records cannot be completed until the assets and filenames are known.
- Material and technique are missing for most objects. `Radierung/Aquatinta` is explicit only for the Stadtkirche image.
- The Belchen caption requests a link to chapter 5 but gives no exact target.
- `Biblische Geschichten II, Nr. 56` is supplied as a bibliography reference; confirm where bibliography references should be stored.

## Chapter 5: Der Proteuser

Source: `texte/Hebel_Ausstellung/5_Der Proteuser/CONTENT QUESTIONNAIRE_2026-06-03_final_BuP.md`

- The following named files are absent from `src/assets/objects`, and the questionnaire does not provide usable extensions: `BuP_Hero_Image_Pi_Z_335_BLB`, `BuP_1_1_Titel_Allm_Pi_BLB`, `BuP_2_1_Chr_Meichelt_Prot_Bund`, `BuP_2_2_Zeichnung_Z_368_BLB`, and `BuP_3_review_ALZ_magn_glass_TSS`.
- The inline file `media/image1.tiff`, used for the custom three-stroke Pi, is absent. A web asset or an agreed textual representation is required.
- The hero has no alt text, and its caption ends with the unavailable custom Pi symbol.
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

- The hero has no questionnaire alt text or distinct object identity.
- Slide 1 lacks creator, date, inventory number, description, and alt text.
- Slide 2 explicitly says the Gmelin image is missing and supplies no usable filename or credit. No Gmelin image or object is attached.
- Hoffmann's *Flora* is dated 1796 in the object block, while the credit describes an edition `für das Jahr 1795`.
- Agricola's image filename/object says `dritte Serie`, while the narrative says `zweite Druckserie`.
- The relevant Kupferstich cannot be identified with certainty according to the questionnaire.
- Cross-references point to chapter 1, slide 6 and chapter 7, slide 2. Confirm whether these should become `/1/#6` and `/7/#2`.

### Sophie Haufe

- The questionnaire labels the section 6.2 but calls it `Chapter 8`. The folder and section number were used.
- It announces four slides but supplies three slide blocks. The relief appears to serve as the hero; confirm this interpretation.
- The requested hero filename differs from the available relief asset filename. The available relief asset is currently used.
- The relief has no known date or alt text.
- The Sophie Haufe drawing is described as having unknown origin and creator, but its object block assigns it to the Hebel-Archiv with inventory `101B07`.
- Both the relief and Sophie Haufe drawing use inventory `101B07`. Confirm whether that is correct.
- Jakob I is also assigned `101B07`, apparently copied from the Haufe records; this inventory number was omitted.
- The Jean Paul filename says `Gleimhaus`, while the available asset ID says `Wikipedia`. The credit itself names the Gleimhaus.

### Henriette Hendel

- The questionnaire supplies no introduction, hero, or navigation label. A schema-valid 6.3 subchapter cannot be created without these fields, so its five galleries remain unattached.
- Slides 1, 2, 3, and 5 request several objects in one composite image, but only separate component assets exist.
- Slide 4 requests four objects in one image; the first object itself uses two images. Confirm the intended grouping/layout.
- The Peroux/Ritter objects are dated 1810 in captions and object details, while publication credits say `[1794]`.
- Novelli's object block contains a Peroux URN, while the slide credit gives accession `1988.14.1`. The accession number was used.
- The Stammbuch object block repeats the unrelated Peroux URN; its slide credit gives `623117-A THE MAG`. Only the latter was used.
- The *Schwarzwälder im Breisgau* scan and inventory number are explicitly unfinished and were omitted.
- The letter to Friedrich Karl Schütz has no inventory number.
- The Haufe-family letter names both `Landesbibliothek Karlsruhe` and `Badische Landesbibliothek Karlsruhe`; the expanded credit form was used.
- Slide 3 points to chapter 2.2, slide 4. Confirm whether this should become `/2/2.2/#4`.

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
- Cross-references identify chapter/slide labels but not stable targets. Confirm routes and whether they are links or object relationships.
