export interface Artwork {
  id: string;
  title: string;
  artist: string;
  textAuthor?: string;
  year: string;
  date: string;
  ownership: string;
  additional?: string;
  materialTechnique: string;
  institution: string;
  inventory: string;
  imageDescription: string;
  caption: string;
  credit: string;
  shortDescription: string;
  fullDescription: string;
  commentary?: {
    title: string;
    text: string;
  };
  thumbnailTitle: string;
}

export const artworks: Artwork[] = [
  {
    id: "werk-1",
    title: "Aufgeklärte Volkspoesie",
    artist: "Benjamin Zix",
    textAuthor: "Johann Peter Hebel",
    year: "um 1800",
    date: "1806",
    ownership: "Privatsammlung",
    additional: "—",
    materialTechnique: "Kupferstich",
    institution: "Hebel-Archiv Heidelberg",
    inventory: "???",
    imageDescription: "Abbildung · Lithographie · Querformat",
    caption: "Das Licht der Aufklärung erhellt die Dunkelheit bäuerlichen Erzählens.",
    credit: "Benjamin Zix' Kupferstich zum Carfunkel (1806).",
    shortDescription:
      "Benjamin Zix präsentiert den Carfunkel als »Volkspoesie«. Schon Goethe [Querverweis] hatte den von einem »Bauern« als »wackern naiven Erzähler« dargebotenen »Carfunkel« ein »Komödienchen« genannt, und dieses klassische volkspoetische Setting, bäuerlich-mündliches Erzählen am Ofen und/oder in der Spinnstube, ist das Sujet des Kupferstichs.",
    fullDescription:
      "»Volkspoesie« wird um 1800 als eine geläuterte entworfen, also gerade nicht als das, womit sich das »Volk« tatsächlich unterhält. Darin sind Autoritäten wie Wieland, Musäus oder Brentano einig, und Hebel scheint sich ihnen mit dem Erzählrahmen des Carfunkel zuzugesellen: eine scheinbar ungebildete, aber weise Erzählinstanz, ein idyllischer ländlicher Schauplatz, eine handfeste Moral.",
    commentary: {
      title: "Kommentar",
      text: "Die Szene zeigt den Erzähler inmitten seiner Zuhörer, wobei die Körperhaltung der Figuren die Aufmerksamkeit auf das mündliche Erzählen lenkt.",
    },
    thumbnailTitle: "Aufgeklärte Volkspoesie",
  },
  {
    id: "werk-2",
    title: "Christlich-romantische Volkspoesie",
    artist: "Julius Nisle",
    textAuthor: "Johann Peter Hebel",
    year: "1845",
    date: "1845",
    ownership: "Staatsbibliothek Berlin",
    additional: "Lithographie",
    materialTechnique: "Lithographie",
    institution: "Staatsbibliothek Berlin",
    inventory: "???",
    imageDescription: "Abbildung · Lithographie · Querformat",
    caption: "Sag' mir, wo du stehst und welchen Weg Du gehst.",
    credit: "Julius Nisles Lithographie zum Carfunkel (1845).",
    shortDescription:
      "Den »Hans Jerg [...] überen Ofen« hat Nisle von Zix [Querverweis] übernommen, samt dessen aufgeklärter Sicht des Carfunkel, die er christlich-romantisch reinszeniert: Die weltgerichtlich konnotierte Bildkomposition zeigt zur Rechten des Vaters ein Weihwasserbecken; es hängt neben einem Fenster, das sich, wie der Vogelkäfig davor, öffnen ließe – Symbole dafür, dass die gläubige Seele der Enge des Irdischen zu entfliehen vermag.",
    fullDescription:
      "Entsprechend blickt uns im Rahmen darüber ein Engel an, der mit erhobenem Zeigefinger gen Himmel weist. Diese Geste spiegelt die des erzählenden »Aetti« und weist derart den Weg, auf den uns der Carfunkel lenken will. Komplementär hierzu ist zur Linken des Erzählers, auf der »falschen« Seite, eine weitere Figur zu erkennen, die den irdischen Verlockungen zugewandt bleibt.",
    thumbnailTitle: "Christlich-romantische Volkspoesie",
  },
  {
    id: "werk-3",
    title: "Volkspoesie im harmlosesten Biedermeier",
    artist: "Unbekannt",
    year: "1835",
    date: "1835",
    ownership: "Universitätsbibliothek Heidelberg",
    additional: "—",
    materialTechnique: "Holzschnitt",
    institution: "Universitätsbibliothek Heidelberg",
    inventory: "???",
    imageDescription: "Abbildung · Holzschnitt · Hochformat",
    caption: "Ein idyllisches Interieur mit spinnender Magd und lauschenden Kindern.",
    credit: "Holzschnitt aus einer Biedermeier-Zeitschrift (1835).",
    shortDescription:
      "Im Biedermeier wird die Volkspoesie zum häuslichen Idyll. Der Erzähler tritt zurück, die Szenerie der Spinnstube wird zum Inbegriff gemütlicher Unterhaltung, und die Moral wird nicht mehr eindringlich verkündet, sondern in alltägliche Situationen eingewoben.",
    fullDescription:
      "Diese Harmonisierung entspricht der biedermeierlichen Sehnsucht nach Ruhe und Geborgenheit. Hebels Texte werden hier als Familienlektüre rezipiert, die Unterhaltung und leichte Belehrung verbindet, ohne politische Spitzen zu setzen.",
    thumbnailTitle: "Volkspoesie im Biedermeier",
  },
  {
    id: "werk-4",
    title: "Zukunftsträchtige Weiblichkeit",
    artist: "Sophie Reinhard",
    year: "1817",
    date: "1817",
    ownership: "Kunsthalle Karlsruhe",
    additional: "Radierung",
    materialTechnique: "Radierung",
    institution: "Kunsthalle Karlsruhe",
    inventory: "???",
    imageDescription: "Abbildung · Radierung · Querformat",
    caption: "Weibliche Gestalt mit Fackel und Schriftrolle.",
    credit: "Sophie Reinhards Radierung (1817).",
    shortDescription:
      "Die Allegorie der Weiblichkeit wird mit Zukunftshoffnungen verbunden. Fackel und Schriftrolle deuten auf Aufklärung und Bildung hin, während die Pose zwischen Ruhe und Bewegung eine neue Rolle der Frau andeutet.",
    fullDescription:
      "Diese Darstellung steht im Spannungsfeld zwischen traditioneller Allegorik und frühen Emanzipationsentwürfen. Hebels Texte kennen starke weibliche Figuren, die jedoch stets in die Ordnung der kleinen Welt eingebunden bleiben.",
    thumbnailTitle: "Zukunftsträchtige Weiblichkeit",
  },
  {
    id: "werk-5",
    title: "Maskuliner Revisionismus I",
    artist: "Johann Friedrich Müller",
    year: "1795",
    date: "1795",
    ownership: "Germanisches Nationalmuseum",
    additional: "Kupferstich",
    materialTechnique: "Kupferstich",
    institution: "Germanisches Nationalmuseum",
    inventory: "???",
    imageDescription: "Abbildung · Kupferstich · Querformat",
    caption: "Männliche Figur in heroischer Pose mit antikem Gewand.",
    credit: "Johann Friedrich Müllers Kupferstich (1795).",
    shortDescription:
      "Die männliche Hauptfigur wird als idealisierter Erzählerhero inszeniert. Antike Gewänder und eine erhobene Rechte verleihen ihm Autorität und verweisen auf die humanistische Bildungstradition, aus der Hebels Werk erwächst.",
    fullDescription:
      "Gleichzeitig wird hier ein Revisionismus sichtbar: Der naive Volkserzähler wird zum bewussten Künstler stilisiert, der seine Zuhörerschaft souverän lenkt. Diese Umdeutung setzt sich im 19. Jahrhundert fort.",
    thumbnailTitle: "Maskuliner Revisionismus I",
  },
  {
    id: "werk-6",
    title: "Magisch-volatile Weiblichkeit",
    artist: "Anna Maria Sibylla Merian",
    year: "1700",
    date: "1700",
    ownership: "Kupferstichkabinett Dresden",
    additional: "—",
    materialTechnique: "Aquarell",
    institution: "Kupferstichkabinett Dresden",
    inventory: "???",
    imageDescription: "Abbildung · Aquarell · Hochformat",
    caption: "Weibliche Gestalt in bewegter Draperie, umgeben von Ranken.",
    credit: "Anna Maria Sibylla Merians Aquarell (1700).",
    shortDescription:
      "Die weibliche Figur erscheint hier als Naturgewalt: Ranken, fließende Gewänder und eine asymmetrische Komposition vermitteln Bewegung und Unberechenbarkeit. Solche Darstellungen stehen im Kontrast zur biedermeierlichen Häuslichkeit.",
    fullDescription:
      "In der literarischen Tradition der Zeit werden Frauenfiguren oft zwischen Vernunft und Sinnlichkeit, zwischen Engel und Hexe verortet. Hebel vermeidet solche Klischees weitgehend, doch die Rezeptionsgeschichte legt sie ihm immer wieder an.",
    thumbnailTitle: "Magisch-volatile Weiblichkeit",
  },
  {
    id: "werk-7",
    title: "Maskuliner Revisionismus II",
    artist: "Ludwig Emil Grimm",
    year: "1820",
    date: "1820",
    ownership: "Museum für Kunst und Kulturgeschichte",
    additional: "Lithographie",
    materialTechnique: "Lithographie",
    institution: "Museum für Kunst und Kulturgeschichte",
    inventory: "???",
    imageDescription: "Abbildung · Lithographie · Querformat",
    caption: "Erzähler vor aufmerksamer Männergesellschaft.",
    credit: "Ludwig Emil Grimms Lithographie (1820).",
    shortDescription:
      "Der Erzähler als geistiger Führer einer ausschließlich männlichen Hörerschaft: Diese Szene betont Autorität, Tradition und mündliche Kultur als Männerdomäne. Die Frauen werden an den Rand gedrängt oder gänzlich ausgeschlossen.",
    fullDescription:
      "Diese Darstellung ist symptomatisch für eine Rezeption, die Hebels Volkspoesie als männliches Erbe vereinnahmt. Die gemütliche Spinnstube wird zum Rauchzimmer, die Erzählung zur Geschichtsstunde.",
    thumbnailTitle: "Maskuliner Revisionismus II",
  },
  {
    id: "werk-8",
    title: "Wegweisende Weiblichkeit",
    artist: "Elisabeth Jerichau-Baumann",
    year: "1850",
    date: "1850",
    ownership: "Nationalmuseum Stockholm",
    additional: "Öl auf Leinwand",
    materialTechnique: "Öl auf Leinwand",
    institution: "Nationalmuseum Stockholm",
    inventory: "???",
    imageDescription: "Abbildung · Öl · Hochformat",
    caption: "Weibliche Figur weist mit ausgestrecktem Arm den Weg.",
    credit: "Elisabeth Jerichau-Baumanns Ölgemälde (1850).",
    shortDescription:
      "Die weibliche Figur wird zur Wegweiserin. Ihr ausgestreckter Arm und der offene Blick verleihen ihr Aktivität und Bedeutung. Sie lenkt den Betrachter nicht nur räumlich, sondern auch moralisch.",
    fullDescription:
      "Diese Allegorie knüpft an die Tradition der Sapientia an, verzichtet jedoch auf kirchliche Attribute. Stattdessen tritt eine allgemeine, humanistische Weisheit hervor, die Geschlechtergrenzen zu überwinden scheint.",
    thumbnailTitle: "Wegweisende Weiblichkeit",
  },
  {
    id: "werk-9",
    title: "Maskuliner Revisionismus III",
    artist: "Ferdinand Piloty",
    year: "1840",
    date: "1840",
    ownership: "Bayerische Staatsbibliothek",
    additional: "Stahlstich",
    materialTechnique: "Stahlstich",
    institution: "Bayerische Staatsbibliothek",
    inventory: "???",
    imageDescription: "Abbildung · Stahlstich · Querformat",
    caption: "Heroisierter Dichter inmitten einer lauschenden Menge.",
    credit: "Ferdinand Pilotys Stahlstich (1840).",
    shortDescription:
      "Die letzte Variante des maskulinen Revisionismus stilisiert den Dichter zum Nationalhelden. Die lauschende Menge wird zur Nation, der Erzähler zum Gründer einer literarischen Tradition, die über Hebel zurück auf ältere Vorbilder verweist.",
    fullDescription:
      "Diese heroisierende Lesart blendet die kleinräumige, regionale Ausrichtung Hebelscher Texte aus und integriert sie in ein großnationales Erzählprogramm. Der Biedermeier wird zum Vorspiel des Realismus und der Heimatdichtung.",
    thumbnailTitle: "Maskuliner Revisionismus III",
  },
];
