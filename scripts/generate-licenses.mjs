import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const objectDir = path.join(rootDir, "src", "content", "objects");
const imageMetadataDir = path.join(rootDir, "src", "content", "images");
const assetsDir = path.join(rootDir, "src", "assets");
const imageExtensionPattern = /\.(avif|gif|jpe?g|png|webp)$/i;

async function listFiles(directory, predicate) {
  const files = [];

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(entryPath, predicate));
    else if (entry.isFile() && predicate(entry.name)) files.push(entryPath);
  }

  return files.sort((left, right) => left.localeCompare(right, "de"));
}

const splitFrontmatter = (source, filePath) => {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) throw new Error(`${path.relative(rootDir, filePath)} has no YAML frontmatter`);
  return match[1];
};

const unquote = (value) => {
  const trimmed = value.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed.slice(1, -1);
    }
  }
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) return trimmed.slice(1, -1).replaceAll("''", "'");
  return trimmed;
};

const scalar = (frontmatter, key) => {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+?)\\s*$`, "m"));
  return match ? unquote(match[1]) : "";
};

const imageReferences = (frontmatter) => {
  const block = frontmatter.match(/^bilder:\s*\r?\n((?:^[ \t]+.*(?:\r?\n|$))*)/m)?.[1] ?? "";
  return [...block.matchAll(/^\s{2}-\s+bild:\s*(.+?)\s*$/gm)].map((match) => unquote(match[1]));
};

const plainText = (value) => value
  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
  .replace(/<[^>]*aria-label=(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*><\/[^>]+>/g, (_match, doubleQuoted, singleQuoted, unquoted) =>
    (doubleQuoted || singleQuoted || unquoted).replaceAll("&#32;", " "))
  .replace(/<[^>]+>/g, "")
  .replace(/[*_`]/g, "")
  .replace(/\s+/g, " ")
  .trim();

const licenseUrls = (value) => [...new Set(
  [...value.matchAll(/\[[^\]]+\]\((https?:\/\/[^)]+)\)/g)].map((match) => match[1]),
)].join(" | ");

const csvField = (value) => `"${String(value).replaceAll('"', '""')}"`;

const addReference = (catalog, reference, assetName) => {
  const normalized = reference.toLowerCase();
  if (!catalog.has(normalized)) catalog.set(normalized, assetName);
};

async function buildImageCatalog() {
  const assetFiles = (await Promise.all(["Bilder", "Heroes", "Meta"].map((directory) =>
    listFiles(path.join(assetsDir, directory), (name) => imageExtensionPattern.test(name)),
  ))).flat();
  const catalog = new Map();

  for (const assetFile of assetFiles) {
    const assetName = path.relative(assetsDir, assetFile).split(path.sep).join("/");
    const filename = path.basename(assetName);
    const stem = filename.replace(imageExtensionPattern, "");
    addReference(catalog, assetName, assetName);
    addReference(catalog, assetName.replace(imageExtensionPattern, ""), assetName);
    addReference(catalog, filename, assetName);
    addReference(catalog, stem, assetName);
  }

  for (const metadataFile of await listFiles(imageMetadataDir, (name) => name.endsWith(".md"))) {
    const frontmatter = splitFrontmatter(await readFile(metadataFile, "utf8"), metadataFile);
    const id = path.basename(metadataFile, path.extname(metadataFile));
    const configuredFilename = scalar(frontmatter, "dateiname");
    const assetName = configuredFilename
      ? catalog.get(configuredFilename.toLowerCase())
      : catalog.get(id.toLowerCase());

    if (!assetName) continue;
    addReference(catalog, id, assetName);
    addReference(catalog, id.replaceAll(".", ""), assetName);
    if (configuredFilename) {
      addReference(catalog, configuredFilename, assetName);
      addReference(catalog, configuredFilename.replace(imageExtensionPattern, ""), assetName);
    }
  }

  return catalog;
}

const licenseHolderOverrides = new Map([
  ["alz-rezension-1790-lupe", "Li Wen Kuo, TSS"],
  ["hebel-brief-hitzig-faksimile-2026", "Badische Landesbibliothek Karlsruhe"],
  ["proteuserschwur-1812", "Dreiländermuseum Lörrach"],
]);

const getLicenseHolder = ({ slug, license, institution, creator, source }) => {
  const override = licenseHolderOverrides.get(slug);
  if (override) return override;
  if (!license) return plainText(institution);
  if (/creativecommons\.org\/publicdomain\/mark/i.test(license)) return "";
  if (/creativecommons\.org\/licenses\/by-nc\/4\.0/i.test(license)
    && (/hebel-archiv/i.test(institution) || /hebel-archiv/i.test(source) || slug === "ebel-8-zuerich")) {
    return "Hebel-Archiv Heidelberg";
  }
  if (/wikipedia|wikimedia/i.test(institution)) {
    if (creator) return plainText(creator);
    return plainText(source.split(/,\s*(?:via\s+)?\[/i)[0]);
  }
  return plainText(institution || creator);
};

const imageCatalog = await buildImageCatalog();
const objectFiles = await listFiles(objectDir, (name) => name.endsWith(".md"));
const rows = [];

for (const objectFile of objectFiles) {
  const frontmatter = splitFrontmatter(await readFile(objectFile, "utf8"), objectFile);
  const id = path.basename(objectFile, path.extname(objectFile));
  const slug = scalar(frontmatter, "slug");
  const title = scalar(frontmatter, "titel");
  const license = scalar(frontmatter, "lizenz");
  const institution = scalar(frontmatter, "institution");
  const creator = scalar(frontmatter, "urheber");
  const source = scalar(frontmatter, "quelle");
  const references = imageReferences(frontmatter);
  const effectiveReferences = references.length > 0 ? references : [id];
  const unresolved = effectiveReferences.filter((reference) => !imageCatalog.has(reference.toLowerCase()));

  if (unresolved.length > 0) {
    throw new Error(`${path.relative(rootDir, objectFile)} has unresolved image references: ${unresolved.join(", ")}`);
  }

  const imageFiles = [...new Set(effectiveReferences.map((reference) => imageCatalog.get(reference.toLowerCase())))];
  rows.push({
    slug,
    title: plainText(title),
    url: `/objekte/${slug}/`,
    imageFiles: imageFiles.join(" | "),
    licenseText: license ? plainText(license) : "Keine Lizenzangabe erfasst",
    licenseUrl: licenseUrls(license),
    licenseHolder: getLicenseHolder({ slug, license, institution, creator, source }),
    source: plainText(institution || source),
  });
}

rows.sort((left, right) => left.slug.localeCompare(right.slug, "de"));

const header = [
  "object_slug",
  "object_title",
  "object_url",
  "image_files",
  "license_text",
  "license_url",
  "license_holder",
  "institution_or_source",
];
const output = [
  header.map(csvField).join(","),
  ...rows.map((row) => [
    row.slug,
    row.title,
    row.url,
    row.imageFiles,
    row.licenseText,
    row.licenseUrl,
    row.licenseHolder,
    row.source,
  ].map(csvField).join(",")),
].join("\n");

await writeFile(path.join(rootDir, "LICENSES.csv"), `${output}\n`, "utf8");
console.log(`Generated LICENSES.csv with ${rows.length} objects.`);
