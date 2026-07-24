# Data Model

## Structure

- Home Page -- Not yet finished
- Chapters
    - With Subchapter -- contains subchapters
    - Without Subchapter -- contains galleries
- Subchapters -- contains gallieries
- Galleries (combination of (multiple) images with text and blockquote)
- Images (optional image metadata only)
- Objects (contain references to the images in which they are shown)


## Entities

### Chapter

Reihenfolge: INT, Required
Nummer: String, Required
Titel: String (MARKDOWN), Required
Nav-Titel: String (MARKDOWN), Required
Hero: ->Image, Required
Intro-Text: MD
Unterkapitel: ->Subchapters, IN ORDER
Galerien: ->Galleries (one of both required, either Unterkapitel or Galerien), IN ORDER


### Subchapter

Nummer: String, Required
Titel: String (MARKDOWN), Required
Nav-Titel: String (MARKDOWN), Required
Hero: ->Image, Required
Intro-Text: MD
Galerien: ->Galleries, Required
NOTE: Same fields as chapter, except for ORDER, and can't contain further subchapters)


### Gallery

Titel: String (MARKDOWN), Required
Beschriftung: String (MARKDOWN), Optional
Untertitel: String (MARKDOWN), Optional
Farbe: String, Optional
Bilder: ->Images, Required, In Order
Text: String (MARKDOWN), Required, Long


### Image

Dateiname: String, Optional (falls nicht gesetzt, wird der Basisname der Bild-Metadatendatei verwendet)
Alt-Text: String (MARKDOWN), Optional
Beschriftung: String (MARKDOWN), Optional
Nachweis: String (MARKDOWN), Optional
Image records do not contain object references.


### Objects

Slug: URL-Compatible String, Required
Titel: String (MARKDOWN), Required
Untertitel: String (MARKDOWN), Optional
Beschreibung: String (MARKDOWN), Optional
Urheber: String (MARKDOWN), Optional
Datierung: String, Optional
Material-Technik: String, Optional
Institution: String (MARKDOWN), Optional
Inventarnummer: String (MARKDOWN), Optional
Transkription: String (MARKDOWN), Optional, Long
Bilder: Array of image associations, Optional, In order for the object page
Each image association contains Bild (image metadata ID or asset filename/basename), optional Position (Links/Rechts/Vorne), and optional Objekt-Reihenfolge for shared images.
NOTE: Object-to-image references are authoritative. Image metadata contains no backlink.
