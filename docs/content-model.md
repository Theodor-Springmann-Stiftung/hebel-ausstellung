# Inhaltsmodell

Dieses Dokument beschreibt die Astro-Sammlungen aus `src/content.config.ts`.

## Kurzüberblick

| Bereich | Kurzbeschreibung |
|---|---|
| Kapitel | Ein Kapitel beschreibt einen großen Ausstellungsabschnitt und enthält entweder Unterkapitel oder direkt Galerien. |
| Unterkapitel | Ein Unterkapitel beschreibt einen kleineren Abschnitt innerhalb eines Kapitels und enthält die zugehörigen Galerien. |
| Galerie | Eine Galerie verbindet ein oder mehrere Bilder mit Bildunterschriftsdaten und einem begleitenden Markdown-Text. |
| Bild | Ein Bild beschreibt die Bilddatei, Alternativtext, Bildunterschriften und optional die darauf gezeigten Objekte. |
| Objekt | Ein Objekt beschreibt ein einzelnes Ausstellungsobjekt mit Titel, Urheber, Datierung, Institution und weiteren Metadaten. |

## Feldtypen

| Typ | Bedeutung |
|---|---|
| String | Ein kurzer Textwert im Frontmatter, meistens in Anführungszeichen, zum Beispiel `"Der Dichter"`. |
| Markdown-String | Ein String, der Inline-Markdown enthalten darf, zum Beispiel `"Der *Dichter*"`. |
| Body-Markdown | Langer Markdown-Inhalt unterhalb des Frontmatter-Blocks. Hier stehen zum Beispiel Fließtexte, Absätze und Blockzitate. |
| Ganzzahl | Eine Zahl ohne Nachkommastellen, zum Beispiel `1`, `2` oder `3`. |
| Boolean | Ein Wahr/Falsch-Wert: entweder `true` oder `false`. |
| Array | Eine Liste mehrerer Werte. Die Reihenfolge kann je nach Verwendugn relevant sein. |
| Referenz | Verweis auf einen anderen Content-Eintrag, angegeben über dessen ID, zum Beispiel `"carfunkel-kupfer"`. |
| Array von Referenzen | Eine Liste von Referenzen, zum Beispiel mehrere Bilder in einer Galerie. |
| Enum | Ein String, bei dem nur bestimmte Werte erlaubt sind, zum Beispiel nur  die Farbnamen `lindgrün`, `vanille` oder `rosa`. |
| URL-sicherer ASCII-Slug | Ein String für URLs. Erlaubt sind nur `A-Z`, `a-z`, `0-9`, `-` oder `_`. Keine Leerzeichen, keine Steuerzeichen, keine Nicht-ASCII-Zeichen und keine URL-Sonderzeichen wie `~`, `/`, `\\`, `:`, `?`, `#`, `&` oder `=`. |

## Sammlungen

Die folgenden Abschnitte beschreiben die Content-Sammlungen, aus denen die Ausstellungsdaten aufgebaut sind.

### Sammlung: `chapters`

Ein Kapitel ist ein großer Ausstellungsabschnitt und enthält entweder Unterkapitel oder direkt Galerien.

Pfad: `src/content/chapters/*.md`

| Feld | Typ | Pflicht | Hinweise |
|---|---|---:|---|
| `reihenfolge` | Positive Ganzzahl | ja | Sortierreihenfolge der Kapitel. |
| `nummer` | String | ja | Sichtbare Kapitelnummer, zum Beispiel `"01"` oder `"02"`. |
| `titel` | Markdown-String | ja | Sichtbarer Kapiteltitel. Unterstützt Inline-Markdown. |
| `navTitel` | Markdown-String | ja | Titel für Navigationen und Menüs. Das Schema erlaubt Inline-Markdown, der Text sollte aber meist einfach bleiben. |
| `hero` | Bild-ID | ja | ID eines optionalen Bild-Eintrags oder Basisname einer Bilddatei in `src/assets/objects`. |
| `startseitenBild` | String | ja | Dateiname eines Bildes für die Startseite. Erlaubt sind `.avif`, `.gif`, `.jpg`, `.jpeg`, `.png` und `.webp`. |
| `startseitenAltText` | String | nein | Alternativtext für das Startseitenbild. |
| `startseitenVariante` | Enum | ja | Darstellungsvariante auf der Startseite. Erlaubt sind `featured`, `poet`, `friend`, `theologian`, `proteuser`, `bachelor` und `letter-writer`. |
| `unterkapitel` | Array von Referenzen auf `subchapters` | bedingt | Mindestens 1 Eintrag, wenn gesetzt. |
| `galerien` | Array von Referenzen auf `galleries` | bedingt | Mindestens 1 Eintrag, wenn gesetzt. |
| Inhalt | Body-Markdown | nein | Kapiteltext unterhalb des Frontmatters. |

Validierungsregel: Ein Kapitel muss entweder `unterkapitel` oder `galerien` definieren, aber nicht beides.

Beispiel mit Unterkapiteln:

```md
---
reihenfolge: 2
nummer: "02"
titel: "Der Dichter"
navTitel: "Der Dichter"
hero: "tschopli-hero"
startseitenBild: "2.0_hero_image_Tschoepli_TSS.webp"
startseitenAltText: "Illustration zu den Allemannischen Gedichten"
startseitenVariante: "poet"
unterkapitel:
  - "allemannische-gedichte-von-1803"
  - "allemannische-gedichte-im-bild"
  - "uebersetzungen-der-allemannischen-gedichte"
  - "raubdrucke-der-allemannischen-gedichte"
---

Jenseits des deutschsprachigen Südwestens sind sie heute weitgehend unbekannt – anders als früher. 1803 begründeten die anonym erschienenen *Allemannischen Gedichte* schlagartig das Renommée ihres Autors. Hebel hatte zur rechten Zeit den rechten Ton getroffen: Die Sammlung wurde mehrfach übersetzt, teilweise vertont, wiederholt bebildert, sie sah zahlreiche rechtmäßige Ausgaben, fragwürdige Nachdrucke sowie gelehrte Editionen. Als eines der meistaufgelegten Werke des 19. Jahrhunderts waren die *Allemannischen Gedichte* Teil des deutschliterarischen Kanons.

> Daß das Allemänlein in seinem luftigen rothen Tschöplein von seinen Landsleuten so gerne erkannt und so gut aufgenommen ist, und mit seinen Gauckeleyen noch da und dort ein Lächeln gewinnt, freut mich für das Allemänlein, und freut mich an den Landsleuten.
>
> — JPH, Z 90
```

Beispiel mit direkt enthaltenen Galerien:

```md
---
reihenfolge: 1
nummer: "01"
titel: "Der Oberländer"
navTitel: "Der Oberländer"
hero: "oberland-1833"
startseitenBild: "1_00_homepage_oberlaender.png"
startseitenAltText: "Historische Ansicht des Wiesentals"
startseitenVariante: "featured"
galerien:
  - "basel"
  - "hausen"
  - "schopfheim"
  - "roettler-schloss"
---

Wenn es vom *Rheinländischen Hausfreund* im Jahrgang 1809 heißt, er gehe fleißig am Rheinstrom auf und ab, dann deckt sich das recht genau mit dem Raum, in dem sich auch Hebels Leben abspielte. Sieht man von seiner Studienzeit in Erlangen ab, gelangte Hebel auch da, wo er das zwischen Basel und Mannheim sich erstreckende Großherzogtum Basel verließ, nur in die nächste Nachbarschaft (Straßburg, Stuttgart, Schweiz). Das erste Kapitel stellt die wichtigsten Stationen in Hebels Leben vor.
```

### Sammlung: `subchapters`

Ein Unterkapitel ist ein Abschnitt innerhalb eines Kapitels und enthält direkt seine Galerien.

Pfad: `src/content/subchapters/*.md`

| Feld | Typ | Pflicht | Hinweise |
|---|---|---:|---|
| `nummer` | String | ja | Sichtbare Unterkapitelnummer, zum Beispiel `"02.1"`. |
| `titel` | Markdown-String | ja | Sichtbarer Unterkapiteltitel. Unterstützt Inline-Markdown. |
| `navTitel` | Markdown-String | ja | Titel für Navigationen und Menüs. Das Schema erlaubt Inline-Markdown, der Text sollte aber meist einfach bleiben. |
| `hero` | Bild-ID | ja | ID eines optionalen Bild-Eintrags oder Basisname einer Bilddatei in `src/assets/objects`. |
| `galerien` | Array von Referenzen auf `galleries` | ja | Mindestens 1 Galerie. |
| Inhalt | Body-Markdown | nein | Unterkapiteltext unterhalb des Frontmatters. |

Beispiel:

```md
---
nummer: "02.1"
titel: "Die *Allemannischen Gedichte* von 1803"
navTitel: "Die Allemannischen Gedichte von 1803"
hero: "hans-und-verene-hero"
galerien:
  - "ueberraschungserfolg-eines-literarischen-debuetanten"
  - "christlich-romantische-volkspoesie"
  - "volkspoesie-im-harmlosen-biedermeier"
  - "hans-und-verene-reinhard-1820"
---

Anonym erschienen, begründeten sie sein literarisches Renommée: Mit den *Allemannischen Gedichten* traf Hebel am rechten Ort zur rechten Zeit den richtigen Ton.
```

### Sammlung: `galleries`

Eine Galerie verbindet Bilder, Bildunterschriften, Farbe und begleitenden Markdown-Text zu einem Galeriebaustein.

Pfad: `src/content/galleries/*.md`

| Feld | Typ | Pflicht | Hinweise |
|---|---|---:|---|
| `titel` | Markdown-String | ja | Galerietitel. Unterstützt Inline-Markdown. |
| `beschriftung` | Markdown-String | nein | Galerie-weite Ersatz-Bildunterschrift. |
| `untertitel` | Markdown-String | nein | Galerie-weiter Zusatz zur Ersatz-Bildunterschrift. |
| `farbe` | Enum | nein | Standardwert ist `lindgrün`. Erlaubt sind `lindgrün`, `vanille`, `hellblau`, `mintgrün`, `rosa`, `himmelblau`, `salbeigrün`. |
| `bilder` | Array von Bild-IDs | ja | Mindestens 1 Bild. Eine ID kann auf Bild-Metadaten oder direkt auf den Basisnamen eines Assets verweisen. |
| Inhalt | Body-Markdown | nein | Optionaler Essay-Text unterhalb der Galerie. Blockzitate können direkt hier geschrieben werden. |

Blockzitat-Konvention im Body-Markdown:

```md
> Der Zitattext kann einen oder mehrere Absätze enthalten.
>
> — JPH
>
> Quellen- oder Zusatzzeile
```

Der letzte Absatz wird als Quelle interpretiert, der vorletzte Absatz als Autor, und alle vorherigen Absätze als Zitattext.

Beispiel:

```md
---
titel: "Überraschungserfolg eines literarischen Debütanten"
beschriftung: "Hebel-Haus in Hausen"
untertitel: "Hausen, Hebelhaus um 1840/50, Bleistift, 20 x 33,2 cm, Museum Schopfheim, Inv. Nr. GFRH 35, Zeichnung von Gustav Wilhelm Friesenegger."
farbe: "vanille"
bilder:
  - "hebelhaus-hausen-1840"
  - "allemannische-gedichte-1803-titel"
---

Die *Allemannischen Gedichte*, von denen rasch eine weitere Auflage auf den Markt kam, waren umgehend nicht nur regional erfolgreich; mit seinem literarischen Debüt war Hebel „im Begriff sich einen eigenen Platz auf dem deutschen Parnaß zu erwerben“ (Goethe).

Beifall fand die Sammlung als kunstfertig inszenierte naive Dichtung: in der Tradition von Matthias Claudius’ *Wandsbecker Bothen* bzw. einer sich mündlich gebenden Volkspoesie, wie sie seit Herders *Volksliedern* geschätzt wurde.

> Es ist für mich wahr und bleibt für mich wahr, der Himmel ist nirgends so blau, und die Luft nirgends so rein, und alles so lieblich und so heimlich als zwischen den Bergen von Hausen [...]
>
> — JPH, Z 54
>
> Brief an Johann Jeremias Herbster, 14. Dezember 1800
```

### Sammlung: `images`

Ein Bild beschreibt eine Bilddatei mit Alternativtext, Bildunterschrift, Bildnachweis und optionalen Objektverweisen.

Pfad: `src/content/images/*.md`

| Feld | Typ | Pflicht | Hinweise |
|---|---|---:|---|
| `dateiname` | String | nein | Abweichender Dateiname des Assets. Ohne dieses Feld wird ein Asset mit demselben Basisnamen wie der Bild-Eintrag gesucht. |
| `altText` | Markdown-String | nein | Alternativtext. Das Schema erlaubt Markdown, aus Barrierefreiheitsgründen sollte der Text aber einfach bleiben. |
| `beschriftung` | Markdown-String | nein | Bild-spezifische Bildunterschrift. |
| `nachweis` | Markdown-String | nein | Bildnachweis. |
| `objekte` | Array von Referenzen auf `objects` | nein | IDs der gezeigten Objektdateien: der Dateiname aus `src/content/objects` ohne `.md`, nicht der öffentliche `slug`. Ein Bild kann mehrere Objekte zeigen; ein Objekt kann in mehreren Bildern dargestellt sein. |
| `objektPositionen` | Array von Enum-Werten | nein | Positionen der unter `objekte` referenzierten Objekte im Bild. Erlaubt sind `Links`, `Rechts` und `Vorne`. Anzahl und Reihenfolge müssen mit `objekte` übereinstimmen. |
| Inhalt | Body-Markdown | nein | Wird aktuell nicht für die Galerie-Darstellung genutzt. |

Beispiel:

```yaml
---
dateiname: "2.2_01_Zix_Carfunkel_Kupfer_1806_TSS.webp"
altText: "Dritte Auflage der Allemannischen Gedichte mit Titelkupfer von Benjamin Zix"
beschriftung: "Dritte Auflage der Allemannischen Gedichte mit einem Titelkupfer von Benjamin Zix"
nachweis: "Hebel-Archiv Heidelberg"
objekte:
  - "zix-carfunkel-1806"
objektPositionen:
  - "Links"
---
```

Die Referenz unter `objekte` bezeichnet immer den Basisnamen der Objektdatei. Wenn zum Beispiel `src/content/objects/1_01_01_hebel_geburtshaus_privat.md` den Slug `hebel-geburtshaus-privat` definiert, lautet die Bildreferenz `"1_01_01_hebel_geburtshaus_privat"`. Der Slug wird ausschließlich für die öffentliche Objekt-URL verwendet und darf nicht mit einer Kapitelnummer beginnen.

### Sammlung: `objects`

Ein Objekt beschreibt ein einzelnes Ausstellungsobjekt mit seinen kuratorischen Metadaten.

Pfad: `src/content/objects/*.md`

| Feld | Typ | Pflicht | Hinweise |
|---|---|---:|---|
| `slug` | URL-sicherer ASCII-Slug | ja | Öffentlicher Objekt-Slug. |
| `position` | Enum | nein | Standardposition des Objekts. Erlaubt sind `Links`, `Rechts` und `Vorne`. Bildspezifische Angaben unter `images.objektPositionen` haben Vorrang. |
| `titel` | Markdown-String | ja | Objekttitel. Unterstützt Inline-Markdown. |
| `untertitel` | Markdown-String | nein | Objektuntertitel. Unterstützt Inline-Markdown. |
| `urheber` | Markdown-String | nein | Urheber oder Autor. |
| `datierung` | String | nein | Datum oder Datierung. Darf nicht leer sein, wenn gesetzt. |
| `materialTechnik` | String | nein | Material und Technik. Darf nicht leer sein, wenn gesetzt. |
| `institution` | Markdown-String | nein | Bewahrende Institution. |
| `inventarnummer` | Markdown-String | nein | Inventarnummer. |
| Inhalt | Body-Markdown | nein | Objektbeschreibung unterhalb des Frontmatters. |

Beispiel:

```md
---
slug: "zix-carfunkel-1806"
titel: "Dritte Auflage der *Allemannischen Gedichte* mit einem Titelkupfer von Benjamin Zix"
urheber: |-
  Benjamin Zix (Künstler)
  Johann Peter Hebel (Autor)
datierung: "1806"
materialTechnik: "Kupferstich"
institution: "Hebel-Archiv Heidelberg"
inventarnummer: "412284"
---

# Beschreibung

Die dritte Auflage der *Allemannischen Gedichte* zeigt auf dem Titelkupfer von Benjamin Zix, wie Hebels alemannische Gedichte schon früh durch Bilder gelesen und gedeutet wurden.
```

## Bildunterschrift-Ersatzlogik

Galerie-Bildunterschriften werden von den spezifischsten zu den allgemeinsten Daten aufgelöst:

Kurzbeschreibung: Die sichtbaren Bildunterschriften kommen zuerst aus Objekt-Daten, dann aus Bild-Daten und zuletzt aus Galerie-Daten.

| Priorität | Quelle | Hinweise |
|---:|---|---|
| 1 | Metadaten aus `objects` | Wird genutzt, wenn ein Bild ein oder mehrere Objekte referenziert. |
| 2 | `images.beschriftung` und `images.nachweis` | Wird genutzt, wenn Bildmetadaten vorhanden sind, aber keine Objektmetadaten. |
| 3 | `galleries.beschriftung` und `galleries.untertitel` | Galerie-weiter Ersatzwert. |

## Bilddatei-Ersatzlogik

Bild-Metadaten in `src/content/images` sind optional. Kapitel, Unterkapitel und Galerien dürfen direkt den Basisnamen einer Datei aus `src/assets/objects` verwenden. Unterstützt werden `.avif`, `.gif`, `.jpg`, `.jpeg`, `.png` und `.webp`; Groß- und Kleinschreibung sowie die Dateiendung müssen in der Referenz nicht übereinstimmen.

Wenn ein gleichnamiger Bild-Eintrag vorhanden ist, werden dessen `dateiname`, Alternativtext, Beschriftung, Nachweis und Objektverweise verwendet. Ohne Bild-Eintrag wird das Asset direkt geladen und die allgemeineren Metadaten des jeweiligen Kontexts dienen als Ersatz.

## Grafik

```mermaid
erDiagram
  CHAPTER ||--o{ SUBCHAPTER : "contains optional"
  CHAPTER ||--o{ GALLERY : "contains optional"
  CHAPTER ||--|| IMAGE : "hero"
  SUBCHAPTER ||--|{ GALLERY : "contains"
  SUBCHAPTER ||--|| IMAGE : "hero"
  GALLERY ||--|{ IMAGE : "contains"
  IMAGE }o--o{ OBJECT : "contains / is depicted by"

  CHAPTER {
    number reihenfolge "int positive required"
    string nummer "required"
    markdown titel "requiredMarkdown"
    markdown navTitel "requiredMarkdown"
    reference hero "reference images required"
    string startseitenBild "required image extension"
    string startseitenAltText "optional"
    enum startseitenVariante "required homepage variant"
    reference_array unterkapitel "reference subchapters optional min 1"
    reference_array galerien "reference galleries optional min 1"
    markdown body "optional"
  }

  SUBCHAPTER {
    string nummer "required"
    markdown titel "requiredMarkdown"
    markdown navTitel "requiredMarkdown"
    reference hero "reference images required"
    reference_array galerien "reference galleries required min 1"
    markdown body "optional"
  }

  GALLERY {
    markdown titel "requiredMarkdown"
    markdown beschriftung "optionalMarkdown"
    markdown untertitel "optionalMarkdown"
    enum farbe "galleryColor default lindgrün"
    reference_array bilder "reference images required min 1"
    markdown body "optional"
  }

  IMAGE {
    string dateiname "optional image extension"
    markdown altText "optionalMarkdown"
    markdown beschriftung "optionalMarkdown"
    markdown nachweis "optionalMarkdown"
    reference_array objekte "optional"
    enum_array objektPositionen "optional; matches objekte order and length"
    markdown body "optional unused"
  }

  OBJECT {
    slug slug "urlSafeAsciiSlug required"
    enum position "optional Links/Rechts/Vorne"
    markdown titel "requiredMarkdown"
    markdown untertitel "optionalMarkdown"
    markdown urheber "optionalMarkdown"
    string datierung "optional"
    string materialTechnik "optional"
    markdown institution "optionalMarkdown"
    markdown inventarnummer "optionalMarkdown"
    markdown body "optional"
  }
```
