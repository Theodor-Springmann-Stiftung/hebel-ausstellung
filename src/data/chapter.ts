import { artworks } from "./artworks";

export interface Subchapter {
  slug: string;
  chapterNumber: string;
  chapterTitle: string;
  sectionNumber: string;
  sectionTitle: string;
  heroImageDescription: string;
  introTitle: string;
  introParagraphs: string[];
  quoteText: string;
  quoteAuthor: string;
  artworks: typeof artworks;
  prevSubchapter?: { slug: string; title: string };
  nextSubchapter?: { slug: string; title: string };
}

export const illustrationen: Subchapter = {
  slug: "02/illustrationen",
  chapterNumber: "2",
  chapterTitle: "Allemannische Gedichte",
  sectionNumber: "02",
  sectionTitle: "Illustrationen",
  heroImageDescription: "Hero — Lorem ipsum dolor sit amet",
  introTitle: "Überschrift zur Einleitung",
  introParagraphs: [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  ],
  quoteText:
    "Zum Erwerben eines Glücks gehört Fleiß und Geduld, und zur Erhaltung desselben gehört Mäßigung und Vorsicht. Langsam und Schritt für Schritt steigt man eine Treppe hinauf. Aber in einem Augenblick fällt man hinab, und bringt Wunden und Schmerzen genug mit auf die Erde.",
  quoteAuthor: "Johann Peter Hebel",
  artworks,
  prevSubchapter: { slug: "02/textgeschichte", title: "Textgeschichte" },
  nextSubchapter: { slug: "02/uebersetzungen", title: "Übersetzungen" },
};

export const subchapters: { slug: string; title: string }[] = [
  { slug: "02/textgeschichte", title: "Textgeschichte" },
  { slug: "02/illustrationen", title: "Illustrationen" },
  { slug: "02/uebersetzungen", title: "Übersetzungen" },
];
