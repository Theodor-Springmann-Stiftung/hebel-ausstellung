# Inhaltsmodell

Dieses Dokument beschreibt die Astro-Sammlungen aus `src/content.config.ts`.

## Kurzueberblick

| Bereich | Kurzbeschreibung |
|---|---|
| Kapitel | Ein Kapitel beschreibt einen grossen Ausstellungsabschnitt und enthaelt entweder Unterkapitel oder direkt Galerien. |
| Unterkapitel | Ein Unterkapitel beschreibt einen kleineren Abschnitt innerhalb eines Kapitels und enthaelt die zugehoerigen Galerien. |
| Galerie | Eine Galerie verbindet ein oder mehrere Bilder mit Bildunterschriftsdaten und einem begleitenden Markdown-Text. |
| Bild | Ein Bild beschreibt die Bilddatei, Alternativtext, Bildunterschriften und optional die darauf gezeigten Objekte. |
| Objekt | Ein Objekt beschreibt ein einzelnes Ausstellungsobjekt mit Titel, Urheber, Datierung, Institution und weiteren Metadaten. |

## Feldtypen

| Typ | Bedeutung |
|---|---|
| String | Ein kurzer Textwert im Frontmatter, meistens in Anfuehrungszeichen, zum Beispiel `"Der Dichter"`. |
| Einfacher String | Ein String, der als reiner Datenwert behandelt wird, nicht als Markdown. Formatierungen wie `*kursiv*` werden hier nicht als Gestaltung interpretiert. |
| Markdown-String | Ein String, der Inline-Markdown enthalten darf, zum Beispiel `"Der *Dichter*"`. |
| Pflicht-Markdown-String | Ein Markdown-String, der vorhanden und nicht leer sein muss. |
| Optionaler Markdown-String | Ein Markdown-String, der fehlen darf, aber nicht leer sein darf, wenn er gesetzt ist. |
| Body-Markdown | Langer Markdown-Inhalt unterhalb des Frontmatter-Blocks. Hier stehen zum Beispiel Fliesstexte, Absaetze und Blockzitate. |
| Ganzzahl | Eine Zahl ohne Nachkommastellen, zum Beispiel `1`, `2` oder `3`. |
| Positive Ganzzahl | Eine Ganzzahl groesser als `0`. |
| Boolean | Ein Wahr/Falsch-Wert: entweder `true` oder `false`. Dieser Typ wird aktuell nicht verwendet, ist aber fuer Schalter geeignet. |
| Array | Eine Liste mehrerer Werte, meistens als YAML-Liste geschrieben. Die Reihenfolge ist relevant, wenn das Feld so beschrieben ist. |
| Referenz | Verweis auf einen anderen Content-Eintrag, angegeben ueber dessen ID, zum Beispiel `"carfunkel-kupfer"`. |
| Array von Referenzen | Eine Liste von Verweisen auf andere Content-Eintraege, zum Beispiel mehrere Bilder in einer Galerie. |
| Enum | Ein String, bei dem nur bestimmte Werte erlaubt sind, zum Beispiel `chapter-1` bis `chapter-7`. |
| URL-sicherer ASCII-Slug | Ein String fuer URLs. Erlaubt sind nur `A-Z`, `a-z`, `0-9`, `-`. Keine Leerzeichen, keine Steuerzeichen, keine Nicht-ASCII-Zeichen und keine URL-Sonderzeichen wie `~`, `/`, `\\`, `:`, `?`, `#`, `&` oder `=`. |

## Gemeinsame Abschnittsfelder

`chapters` und `subchapters` verwenden diese Felder gemeinsam.

Kurzbeschreibung: Diese Felder speichern die gemeinsamen Informationen fuer Kapitel und Unterkapitel, also Nummer, Titel, Navigationstitel und Hero-Bild.

| Feld | Typ | Pflicht | Hinweise |
|---|---|---:|---|
| `number` | Einfacher String | ja | Sichtbare Nummer, zum Beispiel `"01"` oder `"01.1"`. |
| `title` | Pflicht-Markdown-String | ja | Sichtbarer Titel. Unterstuetzt Inline-Markdown. |
| `navTitle` | Pflicht-Markdown-String | ja | Titel fuer die Navigation. Das Schema erlaubt Inline-Markdown, der Text sollte aber meist einfach bleiben. |
| `heroImage` | Referenz auf `images` | ja | ID des Hero-Bild-Eintrags. |
| Inhalt | Body-Markdown | optional | Freier Markdown-Text unterhalb des Frontmatters. |

## Sammlungen

Die folgenden Abschnitte beschreiben die Content-Sammlungen, aus denen die Ausstellungsdaten aufgebaut sind.

### Sammlung: `chapters`

Ein Kapitel ist ein grosser Ausstellungsabschnitt und verweist entweder auf Unterkapitel oder direkt auf Galerien.

Pfad: `src/content/chapters/*.md`

| Feld | Typ | Pflicht | Hinweise |
|---|---|---:|---|
| `order` | Positive Ganzzahl | ja | Sortierreihenfolge der Kapitel. |
| `number` | Einfacher String | ja | Siehe gemeinsame Abschnittsfelder. |
| `title` | Pflicht-Markdown-String | ja | Siehe gemeinsame Abschnittsfelder. |
| `navTitle` | Pflicht-Markdown-String | ja | Siehe gemeinsame Abschnittsfelder. |
| `heroImage` | Referenz auf `images` | ja | Siehe gemeinsame Abschnittsfelder. |
| `subchapters` | Array von Referenzen auf `subchapters` | bedingt | Mindestens 1 Eintrag, wenn gesetzt. |
| `galleries` | Array von Referenzen auf `galleries` | bedingt | Mindestens 1 Eintrag, wenn gesetzt. |
| Inhalt | Body-Markdown | optional | Kapiteltext unterhalb des Frontmatters. |

Validierungsregel: Ein Kapitel muss entweder `subchapters` oder `galleries` definieren, aber nicht beides.

Beispiel:

```yaml
---
order: 1
number: "01"
title: "Der *Dichter*"
navTitle: "Der Dichter"
heroImage: "ag-1803-title"
subchapters:
  - "allemannische-gedichte"
---
```

### Sammlung: `subchapters`

Ein Unterkapitel ist ein Abschnitt innerhalb eines Kapitels und verweist direkt auf seine Galerien.

Pfad: `src/content/subchapters/*.md`

| Feld | Typ | Pflicht | Hinweise |
|---|---|---:|---|
| `number` | Einfacher String | ja | Siehe gemeinsame Abschnittsfelder. |
| `title` | Pflicht-Markdown-String | ja | Siehe gemeinsame Abschnittsfelder. |
| `navTitle` | Pflicht-Markdown-String | ja | Siehe gemeinsame Abschnittsfelder. |
| `heroImage` | Referenz auf `images` | ja | Siehe gemeinsame Abschnittsfelder. |
| `galleries` | Array von Referenzen auf `galleries` | ja | Mindestens 1 Galerie. |
| Inhalt | Body-Markdown | optional | Unterkapiteltext unterhalb des Frontmatters. |

Beispiel:

```yaml
---
number: "01.1"
title: "Die *Allemannischen Gedichte*"
navTitle: "Allemannische Gedichte"
heroImage: "tschopli-hero"
galleries:
  - "allemannische-gedichte-im-bild"
---
```

### Sammlung: `galleries`

Eine Galerie verbindet Bilder, Bildunterschriften, Farbe und begleitenden Markdown-Text zu einem Galeriebaustein.

Pfad: `src/content/galleries/*.md`

| Feld | Typ | Pflicht | Hinweise |
|---|---|---:|---|
| `title` | Pflicht-Markdown-String | ja | Galerietitel. Unterstuetzt Inline-Markdown. |
| `caption` | Optionaler Markdown-String | nein | Galerie-weite Ersatz-Bildunterschrift. |
| `subCaption` | Optionaler Markdown-String | nein | Galerie-weiter Zusatz zur Ersatz-Bildunterschrift. |
| `color` | Enum | nein | Standardwert ist `chapter-1`. Erlaubt sind `chapter-1` bis `chapter-7`. |
| `images` | Array von Referenzen auf `images` | ja | Mindestens 1 Bild. |
| Inhalt | Body-Markdown | optional | Essay-Text unterhalb der Galerie. Blockzitate koennen direkt hier geschrieben werden. |

Blockzitat-Konvention im Body-Markdown:

```md
> Der Zitattext kann einen oder mehrere Absaetze enthalten.
>
> — JPH
>
> Quellen- oder Zusatzzeile
```

Der letzte Absatz wird als Quelle interpretiert, der vorletzte Absatz als Autor, und alle vorherigen Absaetze als Zitattext.

Beispiel:

```yaml
---
title: "Der *Karfunkel* als Bildfolge"
caption: "Bildzeugnisse zur Wirkungsgeschichte"
subCaption: "Diese Galerie nutzt Objekt-, Bild- und Galerie-Metadaten als Ersatzwerte fuer Bildunterschriften."
color: "chapter-1"
images:
  - "carfunkel-kupfer"
  - "carfunkel-nisle"
  - "carfunkel-richter"
---
```

### Sammlung: `images`

Ein Bild beschreibt eine Bilddatei mit Alternativtext, Bildunterschrift, Bildnachweis und optionalen Objektverweisen.

Pfad: `src/content/images/*.md`

| Feld | Typ | Pflicht | Hinweise |
|---|---|---:|---|
| `fileName` | Einfacher String | ja | Dateiname des Assets. Muss auf `.avif`, `.gif`, `.jpg`, `.jpeg`, `.png` oder `.webp` enden. |
| `altText` | Optionaler Markdown-String | nein | Alternativtext. Das Schema erlaubt Markdown, aus Barrierefreiheitsgruenden sollte der Text aber einfach bleiben. |
| `caption` | Optionaler Markdown-String | nein | Bild-spezifische Bildunterschrift. |
| `credits` | Optionaler Markdown-String | nein | Bildnachweis. |
| `objects` | Array von Referenzen auf `objects` | nein | Objekte, die auf diesem Bild gezeigt werden. |
| Inhalt | Body-Markdown | optional | Wird aktuell nicht fuer die Galerie-Darstellung genutzt. |

Beispiel:

```yaml
---
fileName: "2.2_01_Zix_Carfunkel_Kupfer_1806_TSS.webp"
altText: "Kupferstich zu Der Karfunkel"
caption: "Der Karfunkel"
credits: "Theodor Springmann Stiftung"
objects:
  - "zix-carfunkel-1806"
---
```

### Sammlung: `objects`

Ein Objekt beschreibt ein einzelnes Ausstellungsobjekt mit seinen kuratorischen Metadaten.

Pfad: `src/content/objects/*.md`

| Feld | Typ | Pflicht | Hinweise |
|---|---|---:|---|
| `slug` | URL-sicherer ASCII-Slug | ja | Oeffentlicher Objekt-Slug. |
| `title` | Pflicht-Markdown-String | ja | Objekttitel. Unterstuetzt Inline-Markdown. |
| `urheber` | Optionaler Markdown-String | nein | Urheber oder Autor. |
| `date` | Einfacher String | nein | Datum oder Datierung. Darf nicht leer sein, wenn gesetzt. |
| `materialTechnik` | Einfacher String | nein | Material und Technik. Darf nicht leer sein, wenn gesetzt. |
| `institution` | Optionaler Markdown-String | nein | Bewahrende Institution. |
| `inventarnummer` | Optionaler Markdown-String | nein | Inventarnummer. |
| Inhalt | Body-Markdown | optional | Objektbeschreibung unterhalb des Frontmatters. |

Beispiel:

```yaml
---
slug: "zix-carfunkel-1806"
title: "Der Karfunkel"
urheber: "Benjamin Zix"
date: "1806"
materialTechnik: "Kupferstich"
institution: "Theodor Springmann Stiftung"
inventarnummer: "Beispiel-Inventarnummer"
---
```

## Bildunterschrift-Ersatzlogik

Galerie-Bildunterschriften werden von den spezifischsten zu den allgemeinsten Daten aufgeloest:

Kurzbeschreibung: Die sichtbaren Bildunterschriften kommen zuerst aus Objekt-Daten, dann aus Bild-Daten und zuletzt aus Galerie-Daten.

| Prioritaet | Quelle | Hinweise |
|---:|---|---|
| 1 | Metadaten aus `objects` | Wird genutzt, wenn ein Bild ein oder mehrere Objekte referenziert. |
| 2 | `images.caption` und `images.credits` | Wird genutzt, wenn Bildmetadaten vorhanden sind, aber keine Objektmetadaten. |
| 3 | `galleries.caption` und `galleries.subCaption` | Galerie-weiter Ersatzwert. |

## Grafik

```mermaid
erDiagram
  CHAPTER ||--o{ SUBCHAPTER : "enthaelt optional"
  CHAPTER ||--o{ GALLERY : "enthaelt optional"
  SUBCHAPTER ||--|{ GALLERY : "enthaelt"
  GALLERY ||--|{ IMAGE : "referenziert"
  IMAGE ||--o{ OBJECT : "zeigt"

  CHAPTER {
    integer order "Pflicht"
    string number "Pflicht einfach"
    markdown title "Pflicht Markdown"
    markdown navTitle "Pflicht Markdown"
    reference heroImage "Pflicht Bild"
    reference_array subchapters "bedingt, min 1"
    reference_array galleries "bedingt, min 1"
    markdown body "optional"
  }

  SUBCHAPTER {
    string number "Pflicht einfach"
    markdown title "Pflicht Markdown"
    markdown navTitle "Pflicht Markdown"
    reference heroImage "Pflicht Bild"
    reference_array galleries "Pflicht, min 1"
    markdown body "optional"
  }

  GALLERY {
    markdown title "Pflicht Markdown"
    markdown caption "Markdown optional"
    markdown subCaption "Markdown optional"
    enum color "optional, Standard chapter-1"
    reference_array images "Pflicht, min 1"
    markdown body "optional"
  }

  IMAGE {
    string fileName "Pflicht Asset-Dateiname"
    markdown altText "Markdown optional"
    markdown caption "Markdown optional"
    markdown credits "Markdown optional"
    reference_array objects "optional"
    markdown body "optional, ungenutzt"
  }

  OBJECT {
    slug slug "Pflicht URL-sicherer ASCII"
    markdown title "Pflicht Markdown"
    markdown urheber "Markdown optional"
    string date "optional einfach"
    string materialTechnik "optional einfach"
    markdown institution "Markdown optional"
    markdown inventarnummer "Markdown optional"
    markdown body "optional"
  }
```
