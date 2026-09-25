# Inhaltsmodell

Alle Pfade beziehen sich auf das Repository. Das [Astro-Schema](../app/src/content.config.ts) definiert die Felder; [validate-content.mjs](../app/scripts/validate-content.mjs) prüft zusätzliche Beziehungen. Eine kompakte Feldübersicht steht in [data-model.md](./data-model.md).

## Grundregel für Beschriftungen

Die Beschriftung steht dort, wo sie angezeigt wird:

- Unter einem Hero: `heroBeschriftung` im Kapitel oder Unterkapitel.
- Unter einer Galerie-Folie: `folien[].beschriftungen[].text` in der Galerie.
- Bildmetadaten enthalten nur den Dateipfad und den Alternativtext.
- Objekte enthalten ihre eigenen Titel und Metadaten. Diese erzeugen keine Galerie-Beschriftungen.

Texte unterstützen Inline-Markdown wie `*kursiv*` und `[Links](https://example.com)`. Optionale Texte müssen weggelassen werden, wenn sie nicht gebraucht werden; vorhandene leere Texte sind ungültig.

## Ordner, IDs und URLs

| Dateien | Bedeutung und Referenz |
|---|---|
| `content/chapters/2-der-dichter.md` | Kapitel; eine Ziffer ohne führende Null, danach ein mit Kleinbuchstaben beginnender Name |
| `content/chapters/2-1-allemannische-gedichte-1803.md` | Unterkapitel; je eine Ziffer für Kapitel und Unterkapitel |
| `content/galleries/2-1/2-1-01-ueberraschungserfolg.md` | Galerie-ID: `2-1-01-ueberraschungserfolg` |
| `content/images/…md` | Bild-Metadaten-ID; kann in Bildern, Heroes und Objekt-Bildlisten verwendet werden |
| `content/objects/zix-carfunkel.md` | Objekt-ID und `slug`: `zix-carfunkel`; URL: `/objekte/zix-carfunkel/` |

Kapitel und Unterkapitel sind intern getrennte Sammlungen im gemeinsamen Ordner. Kapitelnummern reichen von `1` bis `7`, Unterkapitelnummern von `1` bis `9`. Die öffentlichen URLs verwenden `nummer`, zum Beispiel `/2/` und `/2/2.1/`.

Galerien liegen in Unterordnern wie `1/`, `2-1/`, `2-2/` und `6-3/`. Loader und Validator lesen diese rekursiv. Ihre IDs enthalten den Ordner nicht; Galerie-Dateinamen müssen deshalb über alle Unterordner hinweg eindeutig sein. Der Ordner allein bindet eine Galerie noch nicht in die Ausstellung ein: Dafür muss ihre ID in `galerien` des Kapitels oder Unterkapitels stehen.

Kapitel, Bildmetadaten und Objekte bleiben direkt in ihren jeweiligen Ordnern. Objektdateiname und Frontmatter-Slug müssen übereinstimmen. Änderungen eines Slugs erfordern auch die Anpassung der Datei und aller `objekt`-/`heroObject`-Verweise und ändern die öffentliche Objektadresse.

## Kapitel und Unterkapitel

Beide benötigen `nummer`, `titel`, `navTitel`, `thumbnail` und `hero`. Die beiden Bildnamen verweisen auf vorbereitete WebP-Dateien in `assets/Thumbnails/` und `assets/Heroes/`.

Kapitel benötigen zusätzlich `reihenfolge` (positive Ganzzahl) und `startseitenVariante`. Erlaubte Varianten sind `featured`, `poet`, `friend`, `theologian`, `proteuser`, `bachelor` und `letter-writer`. Ein Kapitel enthält entweder eine nicht leere Liste `unterkapitel` oder eine nicht leere Liste `galerien`. Unterkapitel benötigen eine nicht leere Liste `galerien`.

Kapitel werden nach `reihenfolge` sortiert. Unterkapitel und Galerien folgen der Reihenfolge der jeweiligen Listen. Markdown unterhalb des Frontmatters ist der optionale Einleitungstext.

### Hero-Beschriftung

| Feld | Verwendung |
|---|---|
| `hero` | Dateiname des sichtbaren Bildes in `assets/Heroes/` |
| `heroMetadata` | Optionaler Bilddatensatz, aus dem nur `altText` für das sichtbare Hero-Bild gelesen wird |
| `heroBeschriftung` | Optionaler Text unter dem Hero; wird unverändert als Inline-Markdown ausgegeben |
| `heroObject` | Optionaler Objekt-Slug für den Link „Zum Objekt“ |
| `heroObjektBild` | Optionales Zielbild innerhalb der Objektansicht; muss exakt einer sichtbaren `bilder[].bild`-Referenz dieses Objekts entsprechen |
| `heroNachweis` | Optionaler Nachweis in der Objektübersicht; wird nicht zusätzlich unter dem Hero angezeigt |

Der sichtbare Beschriftungsbereich entsteht nur mit `heroBeschriftung`. Ohne `heroObject` gibt es keinen Objektlink. Es werden keine Texte oder Linkziele aus Bildbeziehungen ergänzt. `heroObjektBild` benötigt `heroObject`.

Auszug aus einem Kapitel:

```yaml
hero: "1.webp"
heroMetadata: "1_00_01_hero_image_wiesental_blb"
heroBeschriftung: "Das Oberland zwischen Freiburg und Basel (1833)"
heroObject: "das-oberland"
```

Das angezeigte Bild bleibt `assets/Heroes/1.webp`. Fehlt der Alternativtext des Metadatensatzes, verwendet der Hero den Kapitel- oder Unterkapiteltitel. Für die Beschreibung des Vorschaubildes beim Teilen der Seite wird zuerst die Hero-Beschriftung, dann der Alternativtext und schließlich der Titel verwendet.

## Galerien

Eine Galerie besteht aus `titel`, optional `bildabstand` (`normal` oder `weit`, Standard `normal`), mindestens einer `folie` in der Liste `folien` und einem nicht leeren Markdown-Body. Jede Folie enthält mindestens eine Bildreferenz in `bilder`.

```md
---
titel: "Basel"
folien:
  - bilder:
      - "1_01_01_hebel_geburtshaus_privat"
    beschriftungen:
      - text: "Emanuel Büchel: *Predigerkirche mit Totentanz*. Im Bild das zweite Haus von rechts: Hebels Geburtshaus"
        objekt: "basler-totentanz"
---

Hier steht der Begleittext der Galerie.
```

### Beschriftungen einer Folie

`beschriftungen` ist eine geordnete Liste. Eine gemeinsame Beschriftung für mehrere Bilder ist genau ein Eintrag; mehrere Beschriftungen sind mehrere Einträge. Jede wird genau einmal ausgegeben. Ohne die Liste oder mit `beschriftungen: []` wird kein Beschriftungstext angezeigt.

| Feld je Beschriftung | Pflicht | Wirkung |
|---|---|---|
| `text` | ja | Sichtbarer Markdown-Text |
| `objekt` | nein | Objekt-Slug; fügt einen Objektlink hinzu |
| `objektBild` | nein | Wählt ein bestimmtes Bild im Objektkarussell aus |
| `position` | nein | `Links`, `Rechts` oder `Vorne`; wird an die Objektseite übergeben und dort vor deren Titel angezeigt |

`objektBild` und `position` benötigen `objekt`. Das Zielbild muss exakt einer `bilder[].bild`-Referenz des Objekts entsprechen und darf nicht mit `inObjektansicht: false` ausgeblendet sein. Ohne `objektBild` öffnet die Objektseite ihre normale erste Bildansicht.

Ein optionaler Folien-Nachweis steht in `folien[].nachweis`. Er wird in Suche und Objektübersicht berücksichtigt, aber nicht zusätzlich unter dem Galeriebild ausgegeben. Soll ein Nachweis dort sichtbar sein, gehört er ausdrücklich in den Beschriftungstext.

### Reihenfolge und Positionen

Die Reihenfolge der Folien, Bilder und Beschriftungen folgt ausschließlich den Listen. Texte wie „Links:“ oder „Rechts:“ müssen direkt in `text` stehen. Das Feld `position` ergänzt solche Präfixe nicht; es steuert nur den verlinkten Objekttitel.

Es gibt keine Ersatz-Beschriftungen aus Bildmetadaten, Objekt-Bildzuordnungen oder Objekttiteln und keine automatische Zusammenfassung gleicher Objekte. Auch wenn mehrere Folien denselben Text zeigen sollen, trägt jede Folie ihren Text ausdrücklich. Das erleichtert unabhängige Änderungen an einer bestimmten Stelle.

Die Linkbeschriftung lautet „Zum Objekt“. Wenn das verlinkte Objekt `transkription: true` hat, lautet sie „Zum Objekt (mit Transkription)“ bzw. „Zum Objekt (mit Übersetzung)“ gemäß `transkriptionsart`.

### Begleittext und Zitate

Unter dem Frontmatter steht der erforderliche Galerie-Body. Ein Blockzitat mit Quellenzeile wird so geschrieben:

```md
> Der Zitattext.
>
> Brief an die Empfängerin, Datum (Z 123)
```

Der letzte Absatz wird als Quellenzeile neben dem Hebel-Porträt ausgegeben. Für das Kölle-Zitat wird die Quellenzeile mit `<span class="quote-attribution--koelle">…</span>` markiert, damit das dafür vorgesehene Porträt verwendet wird.

## Bildmetadaten

Eine Datei in `content/images/` enthält ausschließlich:

```yaml
---
dateiname: "Bilder/1/1_01_01_hebel_geburtshaus_privat.webp"
altText: "Ansicht der Basler Predigerkirche und der benachbarten Häuser"
---
```

`dateiname` ist optional, wenn der Dateiname des Metadatensatzes ohne `.md` bereits zu einem vorhandenen Asset passt. Er muss sonst vollständig unter `Bilder/`, `Heroes/` oder `Meta/` liegen, einschließlich Dateiendung. Unterstützt werden `.avif`, `.gif`, `.jpg`, `.jpeg`, `.png` und `.webp`.

`altText` ist optional. Er beschreibt das Bild für Menschen, die es nicht sehen können; ein kurzer, verständlicher Text ist besser als Bildunterschrift oder Quellenangabe. Markdown wird für das HTML-Attribut in Klartext umgewandelt. Fehlt `altText`, bleibt das Attribut in Galerien und Objektansichten leer; Heroes verwenden den Abschnittstitel.

Beschriftungen, Nachweise, Objektbeziehungen und Body-Texte sind hier nicht vorgesehen und werden vom Validator abgewiesen. Ein Metadatensatz kann trotzdem nur aus `dateiname` bestehen, wenn seine ID als Bildreferenz benötigt wird.

### Bildreferenzen

Eine Galerie oder Objekt-Bildliste darf eine Bild-Metadaten-ID oder einen vollständigen Pfad relativ zu `assets/` verwenden. Zum Beispiel:

```yaml
bilder:
  - "1_01_01_hebel_geburtshaus_privat"
  - "Bilder/2-2/2.2_01_Zix_Carfunkel_Kupfer_1806_TSS.webp"
```

Das Beispiel ist die `bilder`-Liste einer Galerie-Folie. Objekt-Bildlisten verwenden stattdessen Einträge mit dem Feld `bild`.

Galeriebilder müssen unter `Bilder/` liegen; Objektbilder können zusätzlich über eine Metadaten-ID auf `Heroes/` verweisen. Direkte Pfade werden unter `Bilder/1/` bis `Bilder/7/` und Unterkapitelordnern wie `Bilder/2-1/` akzeptiert. Die Bildauflösung erkennt auch kleingeschriebene Metadaten-IDs mit oder ohne Punkte. Bilder selbst werden durch ihre aufgelöste Asset-Datei identifiziert, unabhängig von der verwendeten Referenzform.

## Objekte

Dateiname, `slug` und Objekt-ID stimmen überein. `slug` besteht aus ASCII-Buchstaben, Ziffern und Bindestrichen und darf nicht mit `1-` bis `7-` beginnen. `titel` ist erforderlich.

Optionale Markdown-Metadaten sind `untertitel`, `urheber`, `datierung`, `materialTechnik`, `institution`, `inventarnummer`, `quelle` und `lizenz`. Sie werden auf der Objektseite angezeigt und sind keine Galerie-Beschriftungen.

Weitere optionale Felder:

- `kapitelunabhaengig`, Standard `false`: Unterdrückt den aus Bildbeziehungen berechneten Kapitel-Rücksprung. Der Browser kann weiterhin einen Rücksprung zur zuvor besuchten Ausstellungsseite anbieten.
- `transkription`, Standard `false`: Kennzeichnet den Galerie-Objektlink. Der Body wird unabhängig davon angezeigt.
- `transkriptionsart`, Standard `Transkription`: Erlaubt sind `Transkription` und `Übersetzung`. Die passende Body-Überschrift wird redaktionell gesetzt.
- `bilder`: Geordnete Bildzuordnungen; wenn gesetzt, mindestens eine.

Eine Bildzuordnung hat nur diese Felder:

| Feld | Pflicht/Standard | Bedeutung |
|---|---|---|
| `bild` | ja | Bildreferenz |
| `inObjektansicht` | `true` | Ob das Bild in der Objektansicht gezeigt wird |

Die Reihenfolge in `bilder` bestimmt die Reihenfolge im Objektkarussell. `inObjektansicht: false` behält die Beziehung zur Abbildung bei, blendet sie jedoch aus der regulären Objekt-Bildliste aus. Falls danach kein sichtbares Bild übrig bleibt, versucht die bestehende Objektansicht ein Asset passend zur Objekt-ID zu finden.

```md
---
slug: "zix-carfunkel"
titel: "Kupferstich von Benjamin Zix zum *Carfunkel*"
bilder:
  - bild: "2.2_01_Zix_Carfunkel_Kupfer_1806_TSS"
---

# Beschreibung

Hier steht die Objektbeschreibung.
```

Objekt-Body-Inhalt steht vollständig unter `# Beschreibung`, `# Anmerkungen`, `# Transkription` und/oder `# Übersetzung`. Andere H1-Überschriften und Text vor der ersten H1-Überschrift sind nicht erlaubt.

## Suche, Objektübersicht und Prüfung

Die Suche liest Galerie-Beschriftungen und Nachweise aus `folien`, Alternativtexte aus Bildmetadaten und die eigenen Inhalte der Objekte. Die Objektübersicht zeigt die zugehörigen expliziten Folien- bzw. Hero-Beschriftungen und Nachweise; die früheren Ersatzquellen werden nicht mehr gesammelt.

Alle Befehle werden aus `app/` ausgeführt:

| Befehl | Zweck |
|---|---|
| `npm run dev` | Vorschau; beobachtet auch `content/` und `assets/` |
| `npm run content:validate` | YAML, vorhandene Bilder/Objekte, Link-Zielbilder und zusätzliche Inhaltsregeln prüfen |
| `npm run build` | Zusätzlich Astro-Schema prüfen und alle Seiten samt Bildvarianten bauen |
| `npm run licenses:generate` | `app/LICENSES.csv` aus den Objekt- und Bildzuordnungen aktualisieren |

Fehlende Galeriebilder sind Fehler und werden nicht still übersprungen. Damit bleiben Folien, Texte und Links zusammen. Unbekannte Felder in Galerien, Folien, Beschriftungen, Bildmetadaten und Objekt-Bildzuordnungen werden abgewiesen. Vor einer Veröffentlichung ist der vollständige Build maßgeblich. GitHub Pages baut nach einem Push auf `main`.
