# Data Model

## Structure

- Home Page -- Not yet finished
- Chapters
    - With Subchapter -- contains subchapters
    - Without Subchapter -- contains galleries
- Subchapters -- contains gallieries
- Galleries (combination of (multiple) images with text and blockquote)
- Images (image meta data, contains object(s) shown)
- Objects


## Entities

### Chapter

Order: INT, Required
Number: String, Required
Title: String (MARKDOWN), Required
Nav-Title: String (MARKDOWN), Required
Hero-Image: ->Image, Required
Intro-Text: MD
Subchapters: ->Subchapters, IN ORDER
Galleries: ->Galleries (one of both required, either Subchapters or Galleries), IN ORDER


### Subchapter

Number: String, Required
Title: String (MARKDOWN), Required
Nav-Title: String (MARKDOWN), Required
Hero-Image: ->Image, Required
Intro-Text: MD
Galleries: ->Galleries (one of both required, either Subchapters or Galleries)
NOTE: Same fields as chapter, except for ORDER, and can't contain further subchapters)


### Gallery

Title: String (MARKDOWN), Required
Caption: String (MARKDOWN), Optional
SubCaption: String (MARKDOWN), Optional
Images: ->Images, Required, In Order
Text: String (MARKDOWN), Required, Long


### Image

File-Name: String, Required
Alt-Text: String (MARKDOWN), Optional
Caption: String (MARKDOWN), Optional
Credits: String (MARKDOWN), Optional
Objects: ->Objects, Optional, InOrder as seen on Picture


### Objects

Slug: URL-Compatible String, Required
Title: String (MARKDOWN), Required
Beschreibung: String (MARKDOWN), Optional
Urheber: String (MARKDOWN), Optional
Date: String, Optional
Material-Technik: String, Optional
Institution: String (MARKDOWN), Optional
Inventarnummer: String (MARKDOWN), Optional
Transkription: String (MARKDOWN), Optional, Long
NOTE: Backlinks to images are given via Image type
