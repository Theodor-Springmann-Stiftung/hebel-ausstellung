# Datenmodell: Kurzreferenz

Die ausführliche Beschreibung mit Beispielen steht in [`content-model.md`](./content-model.md). Maßgeblich für die von Astro gelesenen Felder ist `src/content.config.ts`; zusätzliche inhaltliche Regeln stehen in `scripts/validate-content.mjs`.

## Struktur

- Startseite: verwendet `thumbnail` und `startseitenVariante` der Kapitel.
- Kapitel: enthält entweder Unterkapitel oder direkt Galerien.
- Unterkapitel: enthält direkt Galerien.
- Galerie: geordnete Folien mit einem oder mehreren Bildern sowie einem erforderlichen Begleittext.
- Bild: optionale Metadaten zu einem Bild-Asset.
- Objekt: kuratorische Metadaten und maßgebliche Beziehungen zu den Bildern, auf denen das Objekt gezeigt wird.

## Entitäten

### Kapitel

| Feld | Typ | Pflicht |
|---|---|---:|
| `reihenfolge` | Positive Ganzzahl | ja |
| `nummer` | String | ja |
| `titel` | Markdown-String | ja |
| `navTitel` | Markdown-String | ja |
| `thumbnail` | WebP-Dateiname in `src/assets/Thumbnails` | ja |
| `hero` | WebP-Dateiname in `src/assets/Heroes` | ja |
| `heroMetadata` | Bildreferenz | nein |
| `heroObject` | Objekt-Referenz für einen expliziten Hero-Objektlink | nein |
| `startseitenVariante` | `featured`, `poet`, `friend`, `theologian`, `proteuser`, `bachelor` oder `letter-writer` | ja |
| `unterkapitel` | Geordnetes Array von Unterkapitel-Referenzen | bedingt |
| `galerien` | Geordnetes Array von Galerie-Referenzen | bedingt |
| Body | Markdown | nein |

Genau eines der Felder `unterkapitel` und `galerien` muss gesetzt und darf nicht leer sein.

### Unterkapitel

| Feld | Typ | Pflicht |
|---|---|---:|
| `nummer` | String | ja |
| `titel` | Markdown-String | ja |
| `navTitel` | Markdown-String | ja |
| `thumbnail` | WebP-Dateiname in `src/assets/Thumbnails` | ja |
| `hero` | WebP-Dateiname in `src/assets/Heroes` | ja |
| `heroMetadata` | Bildreferenz | nein |
| `heroObject` | Objekt-Referenz für einen expliziten Hero-Objektlink | nein |
| `galerien` | Geordnetes, nicht leeres Array von Galerie-Referenzen | ja |
| Body | Markdown | nein |

### Galerie

| Feld | Typ | Pflicht/Standard |
|---|---|---:|
| `titel` | Markdown-String | ja |
| `beschriftung` | Markdown-String | nein |
| `untertitel` | Markdown-String | nein |
| `folienbeschriftung` | Gemeinsame Markdown-Beschriftung aller Folien | nein |
| `folienbeschriftungen` | Array folienspezifischer Beschriftungen | `[]` |
| `bildabstand` | `normal` oder `weit` | `normal` |
| `positionsangaben` | Boolean | `true` |
| `bilder` | Geordnetes Array nicht leerer Bildreferenz-Arrays | ja |
| Body | Markdown | ja |

Jeder Eintrag in `folienbeschriftungen` enthält eine positive, einsbasierte `folie`, eine erforderliche Markdown-`beschriftung` und optionale `unterbeschriftungen`. Eine Unterbeschriftung ist entweder ein Markdown-String oder ein Objekt aus einsbasierter Bildnummer `bild` und Markdown-`beschriftung`.

Der aktuelle Renderer zeigt `unterbeschriftungen` und den regulären Galerie-`untertitel` nicht an. Auch `positionsangaben` ist im Schema vorhanden, wird vom Renderer aber noch nicht ausgewertet. `bildabstand: weit` ist wirksam.

### Bild

| Feld | Typ | Pflicht |
|---|---|---:|
| `dateiname` | Vollständiger Asset-Pfad unter `Bilder/`, `Heroes/` oder `Meta/` | nein |
| `altText` | Markdown-String | nein |
| `beschriftung` | Markdown-String | nein |
| `nachweis` | Markdown-String | nein |
| Body | Markdown, derzeit ungenutzt | nein |

Ohne `dateiname` muss der Basisname der Metadatendatei zu einem vorhandenen Bild-Asset passen. Bilddatensätze enthalten keine Objektbeziehungen. `nachweis` wird in den Suchindex aufgenommen, derzeit aber weder in Galerien noch an Kapitel- oder Unterkapitel-Heroes ausgegeben.

### Objekt

| Feld | Typ | Pflicht/Standard |
|---|---|---:|
| `slug` | URL-sicherer ASCII-Slug aus Buchstaben, Ziffern und Bindestrichen | ja |
| `kapitelunabhaengig` | Boolean | `false` |
| `transkription` | Boolean | `false` |
| `transkriptionsart` | `Transkription` oder `Übersetzung` | `Transkription` |
| `titel` | Markdown-String | ja |
| `untertitel` | Markdown-String | nein |
| `urheber` | Markdown-String | nein |
| `datierung` | Markdown-String | nein |
| `materialTechnik` | Markdown-String | nein |
| `institution` | Markdown-String | nein |
| `inventarnummer` | Markdown-String | nein |
| `quelle` | Markdown-String | nein |
| `lizenz` | Markdown-String | nein |
| `bilder` | Geordnetes Array von Bildzuordnungen | nein |
| Body | Markdown unter erlaubten H1-Überschriften | nein |

Eine Bildzuordnung enthält:

| Feld | Typ | Pflicht/Standard |
|---|---|---:|
| `bild` | Bild-Metadaten-ID oder vollständiger `Bilder/...`-Asset-Pfad; Metadaten dürfen auch auf `Heroes/...` verweisen | ja |
| `position` | `Links`, `Rechts` oder `Vorne` | nein |
| `objektReihenfolge` | Positive Ganzzahl | nein |
| `beschriftung` | Galerie-spezifischer Markdown-Text | nein |
| `inObjektansicht` | Boolean | `true` |

Objekt-Bild-Zuordnungen sind die maßgebliche Quelle der Beziehungen. Teilen mehrere Objekte dasselbe Bild, müssen alle eine eindeutige `objektReihenfolge` besitzen. `inObjektansicht: false` blendet das Bild nur auf der Objektseite aus; die Galeriebeziehung bleibt erhalten.

Objekt-Body-Inhalt muss vollständig unter `# Beschreibung`, `# Anmerkungen`, `# Transkription` und/oder `# Übersetzung` stehen. Andere H1-Überschriften sowie Text vor der ersten H1-Überschrift sind nicht erlaubt.
