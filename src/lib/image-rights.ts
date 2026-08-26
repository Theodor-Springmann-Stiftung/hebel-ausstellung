import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export type RightsStatus = "Geklärt" | "Offen" | "Nicht erfasst";

export type RightsItem = {
  editing: string[];
  text: string;
  href?: string;
};

export type ObjectRights = {
  status: RightsStatus;
  items: RightsItem[];
};

type CsvRightsRow = {
  position: string;
  title: string;
  url: string;
  institution: string;
  status: string;
  rights: string;
  comment: string;
  editing: string;
};

const legacySlugTargets: Record<string, string[]> = {
  "ag-1803-titelblatt": ["ag-1803-seite-33"],
  "biblische-geschichten-umschlag-verso": ["biblische-geschichten-umschlag-recto"],
  "marktweiber-satzmanuskript-seite-4": ["marktweiber-satzmanuskript-seite-3"],
  "stammbuch-walch-blb": ["stammbuch-blb"],
  "hexlein-fruehe-version": ["hexlein-abschrift-1801", "hebel-brief-hitzig-faksimile-2026"],
  "wiese-satzmanuskript": ["wiese-satzmanuskript-seite-6"],
  "marktweiber-erstdruck": ["marktweiber-satzmanuskript-seite-3", "ag-1803-seite-33"],
  "neue-aufgaben": ["badischer-landkalender-1805"],
  "rheinlaendischer-hausfreund-1814-druck": ["rheinlaendischer-hausfreund-1814-druckexemplar"],
  "schatzkaestlein-1811": ["schatzkaestlein-erstausgabe-1811"],
  "hendel-caryatide-peroux": ["hendel-caryatide-peroux-ritter-1810"],
  "hendel-attitude": ["hendel-ariadne-peroux-ritter-1810"],
};

const parseCsv = (input: string) => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];

    if (character === '"') {
      if (quoted && input[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === ";" && !quoted) {
      row.push(field);
      field = "";
    } else if (character === "\n" && !quoted) {
      row.push(field.replace(/\r$/, ""));
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (field || row.length) {
    row.push(field.replace(/\r$/, ""));
    if (row.some((value) => value.trim())) rows.push(row);
  }

  return rows;
};

const getSlug = (url: string) => url.match(/\/objekte\/([^/]+)\/?/)?.[1];

const normalizeStatus = (status: string): RightsStatus =>
  status.trim().toLocaleLowerCase("de") === "geklärt" ? "Geklärt" : "Offen";

const editingPattern = /auss?chnitt|freigestellt|bildmontage|fotografie|farbe|h[ae]lligkeit|kontrast|schärfe|bearbeit/i;

const getEditingNotes = ({ comment, editing }: CsvRightsRow) => {
  const notes = [comment, editing]
    .flatMap((value) => value.split(","))
    .map((value) => value.trim().replace(/^Auschnitt$/i, "Ausschnitt"))
    .filter((value) => editingPattern.test(value));

  return [...new Set(notes)];
};

const getRightsItem = (row: CsvRightsRow): RightsItem => {
  const status = normalizeStatus(row.status);
  const rawRights = row.rights.trim();
  const editing = getEditingNotes(row);

  if (status === "Offen") {
    return { editing, text: rawRights || "Rechteprüfung offen" };
  }

  const isPermission = /genehmigung/i.test(rawRights) && !/keine .*genehmigung erforderlich/i.test(rawRights);
  if (isPermission) {
    return { editing, text: `Mit freundlicher Genehmigung von ${row.institution}` };
  }

  if (/eigener bestand/i.test(rawRights)) {
    return { editing, text: `Eigener Bestand: ${row.institution}` };
  }

  if (/foto von eigener mitarbeiterin/i.test(rawRights)) {
    return { editing, text: `Eigenes Foto: ${row.institution}` };
  }

  const urlMatch = rawRights.match(/https?:\/\/[^\s,;]+/);
  const href = urlMatch?.[0];
  const text = href
    ? rawRights.replace(href, "").replace(/[\s,;]+$/, "").trim()
    : rawRights;

  return { editing, text: text || "Keine Rechteangabe", href };
};

const mergeRights = (current: ObjectRights | undefined, row: CsvRightsRow): ObjectRights => {
  const status = normalizeStatus(row.status);
  const item = getRightsItem(row);
  const items = current?.items ?? [];
  const itemKey = JSON.stringify(item);

  return {
    status: current?.status === "Offen" || status === "Offen" ? "Offen" : "Geklärt",
    items: items.some((existing) => JSON.stringify(existing) === itemKey) ? items : [...items, item],
  };
};

export const getObjectRightsBySlug = async () => {
  let input: string;

  try {
    input = await readFile(resolve(process.cwd(), "import/Bilrechte.csv"), "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return new Map<string, ObjectRights>();
    throw error;
  }

  const rows = parseCsv(input).slice(1).map((values): CsvRightsRow => ({
    position: values[0]?.trim() ?? "",
    title: values[1]?.trim() ?? "",
    url: values[2]?.trim() ?? "",
    institution: values[3]?.trim() ?? "",
    status: values[4]?.trim() ?? "",
    rights: values[5]?.trim() ?? "",
    comment: values[6]?.trim() ?? "",
    editing: values[7]?.trim() ?? "",
  }));
  const rightsBySlug = new Map<string, ObjectRights>();

  for (const row of rows) {
    const csvSlug = getSlug(row.url);
    if (!csvSlug) continue;

    for (const slug of legacySlugTargets[csvSlug] ?? [csvSlug]) {
      rightsBySlug.set(slug, mergeRights(rightsBySlug.get(slug), row));
    }
  }

  return rightsBySlug;
};
