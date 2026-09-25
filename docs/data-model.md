# Datenmodell: Kurzreferenz

Alle Pfade beziehen sich auf das Repository. Die ausführliche Anleitung steht in [content-model.md](./content-model.md). Maßgeblich sind [das Astro-Schema](../app/src/content.config.ts) und [die Inhaltsprüfung](../app/scripts/validate-content.mjs).

## Dateien

| Ordner | Inhalt |
|---|---|
| `content/chapters/` | Kapitel (`2-der-dichter.md`) und Unterkapitel (`2-1-allemannische-gedichte-1803.md`) |
| `content/galleries/1/`, `2-1/`, … | Galerien mit Bildern und Beschriftungen je Folie |
| `content/images/` | Bildpfad und Alternativtext |
| `content/objects/` | Objekte; Dateiname entspricht dem `slug` |
| `assets/` | Bilddateien in `Bilder/`, `Heroes/`, `Thumbnails/` und `Meta/` |

Galerie-IDs sind die vollständigen Dateinamen ohne `.md` und ohne Ordnerpräfix. Sie müssen in allen Galerieordnern eindeutig sein. Objekt-IDs entsprechen dem `slug`. Bildreferenzen sind Bild-Metadaten-IDs oder vollständige Pfade relativ zu `assets/`.

## Kapitel und Unterkapitel

| Feld | Typ | Pflicht/Standard |
|---|---|---|
| `nummer` | String, zum Beispiel `"2"` oder `"2.1"` | ja |
| `titel`, `navTitel` | Markdown-String | ja |
| `thumbnail`, `hero` | WebP-Dateiname in `Thumbnails/` bzw. `Heroes/` | ja |
| `heroMetadata` | Bildreferenz für den Alternativtext | nein |
| `heroBeschriftung` | Direkt angezeigter Markdown-Text unter dem Hero | nein |
| `heroObject` | Objekt-Slug für „Zum Objekt“ | nein |
| `heroObjektBild` | Exakte sichtbare `bilder[].bild`-Referenz des verlinkten Objekts | nein |
| `heroNachweis` | Nachweis für die Objektübersicht | nein |
| `reihenfolge` | Positive Ganzzahl | nur Kapitel: ja |
| `startseitenVariante` | `featured`, `poet`, `friend`, `theologian`, `proteuser`, `bachelor`, `letter-writer` | nur Kapitel: ja |
| `unterkapitel` | Geordnete Unterkapitel-IDs | nur Kapitel: bedingt |
| `galerien` | Geordnete Galerie-IDs | Kapitel: bedingt; Unterkapitel: ja |
| Body | Markdown-Einleitung | nein |

Ein Kapitel enthält genau eines von `unterkapitel` und `galerien`, jeweils nicht leer. Unterkapitel enthalten mindestens eine Galerie. Ein Hero zeigt nur den expliziten `heroBeschriftung`-Text. Sein Objektlink erscheint innerhalb dieses Beschriftungsbereichs und nur mit `heroObject`; das Linkziel wird nicht aus Bildbeziehungen abgeleitet.

## Galerien und Folien

| Feld | Typ | Pflicht/Standard |
|---|---|---|
| `titel` | Markdown-String | ja |
| `bildabstand` | `normal` oder `weit` | `normal` |
| `folien` | Geordnete Liste von Folien | mindestens eine |
| Body | Begleitender Markdown-Text | ja |

Jede Folie enthält:

| Feld | Typ | Pflicht/Standard |
|---|---|---|
| `bilder` | Geordnete Bildreferenzen | mindestens eine |
| `beschriftungen` | Geordnete Beschriftungen | `[]` |
| `nachweis` | Nachweis für Suche und Objektübersicht | nein |

Jede Beschriftung enthält:

| Feld | Typ | Pflicht |
|---|---|---|
| `text` | Der angezeigte Markdown-Text | ja |
| `objekt` | Objekt-Slug für „Zum Objekt“ | nein |
| `objektBild` | Exakte sichtbare `bilder[].bild`-Referenz des verlinkten Objekts | nein |
| `position` | `Links`, `Rechts` oder `Vorne`; Zusatz am Ziel der Objektverlinkung | nein |

Beschriftungen werden genau in Listenreihenfolge ausgegeben. Es gibt keine Ersatztexte aus Bildern oder Objekttiteln, keine automatische Zusammenfassung und keine automatisch ergänzten „Links/Rechts“-Präfixe. Gewünschte Präfixe stehen direkt in `text`. `objektBild` und `position` benötigen `objekt`.

## Bildmetadaten

| Feld | Typ | Pflicht |
|---|---|---|
| `dateiname` | Vollständiger Pfad unter `Bilder/`, `Heroes/` oder `Meta/` | nein, wenn Dateiname zum Asset passt |
| `altText` | Alternativtext | nein |

Bildmetadaten haben keine Beschriftungen, Nachweise, Objektbeziehungen oder Body-Texte. Ohne `altText` bleibt der Alternativtext in Galerien und auf Objektseiten leer. Heroes verwenden ersatzweise den Kapitel- oder Unterkapiteltitel.

## Objekte

| Feld | Typ | Pflicht/Standard |
|---|---|---|
| `slug` | ASCII-Buchstaben, Ziffern und Bindestriche; kein Präfix `1-` bis `7-` | ja |
| `titel` | Markdown-String | ja |
| `untertitel`, `urheber`, `datierung`, `materialTechnik` | Markdown-String | nein |
| `institution`, `inventarnummer`, `quelle`, `lizenz` | Markdown-String | nein |
| `kapitelunabhaengig` | Boolean | `false` |
| `transkription` | Boolean; kennzeichnet den Galerie-Objektlink | `false` |
| `transkriptionsart` | `Transkription` oder `Übersetzung` | `Transkription` |
| `bilder` | Geordnete Bildzuordnungen | nein; wenn gesetzt, mindestens eine |
| Body | Markdown unter erlaubten H1-Überschriften | nein |

Eine Bildzuordnung enthält nur `bild` und optional `inObjektansicht` (Standard `true`). Bei `false` bleibt die Bildbeziehung erhalten, das Bild wird jedoch nicht in der regulären Objekt-Bildliste angezeigt. Beschriftungen, Linkpositionen und ihre Reihenfolge werden in der Galerie gepflegt.

Erlaubte Objekt-Überschriften: `# Beschreibung`, `# Anmerkungen`, `# Transkription`, `# Übersetzung`. Text vor der ersten H1-Überschrift ist nicht erlaubt.

## Prüfung

Aus `app/`: `npm run content:validate`, danach für die vollständige Prüfung `npm run build`. Fehlende Bilder oder Objektlinkziele sind Fehler. Entfernte Felder in Galerien, Bildmetadaten und Objekt-Bildzuordnungen werden abgewiesen. Optionale Textfelder weglassen, statt leere Strings einzutragen.
