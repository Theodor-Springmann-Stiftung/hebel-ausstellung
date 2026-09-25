import { fileURLToPath } from "node:url";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { load, JSON_SCHEMA } from "js-yaml";

const rootDir = fileURLToPath(new URL("../../", import.meta.url));
const contentDir = path.join(rootDir, "content");
const assetsDir = path.join(rootDir, "assets");
const errors = [];
const imageExtension = /\.(avif|gif|jpe?g|png|webp)$/i;
const relative = (file) => path.relative(rootDir, file);
const nonempty = (value) => typeof value === "string" && value.trim().length > 0;
const stripExtension = (value) => value.replace(imageExtension, "");

async function listFiles(directory, predicate, recursive = false) {
  const files = await Promise.all((await readdir(directory, { withFileTypes: true })).map(async (entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory() && recursive) return listFiles(file, predicate, true);
    return entry.isFile() && predicate(entry.name) ? [file] : [];
  }));
  return files.flat().sort();
}

async function readCollection(name, recursive = false) {
  const files = await listFiles(path.join(contentDir, name), (file) => file.endsWith(".md"), recursive);
  return Promise.all(files.map(async (file) => {
    const source = await readFile(file, "utf8");
    const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    let data = {};
    if (!match) errors.push(`${relative(file)} must start with YAML frontmatter`);
    else {
      try {
        data = load(match[1], { schema: JSON_SCHEMA });
        if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Expected a field mapping");
      } catch (error) {
        errors.push(`${relative(file)} has invalid YAML: ${error.message}`);
        data = {};
      }
    }
    return { file, id: path.basename(file, ".md"), data, body: match ? source.slice(match[0].length) : "" };
  }));
}

function onlyFields(data, allowed, context) {
  for (const key of Object.keys(data)) if (!allowed.includes(key)) errors.push(`${context} has unsupported field ${key}`);
}

function array(value, context, required = false) {
  if (value === undefined && !required) return [];
  if (!Array.isArray(value) || (required && value.length === 0)) {
    errors.push(`${context} must be ${required ? "a non-empty" : "an"} array`);
    return [];
  }
  return value;
}

function mapping(value, context) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    errors.push(`${context} must be a field mapping`);
    return {};
  }
  return value;
}

function optionalText(value, context) {
  if (value !== undefined && !nonempty(value)) errors.push(`${context} must be non-empty text when provided`);
}

const [images, objects, galleries, sections] = await Promise.all([
  readCollection("images"), readCollection("objects"), readCollection("galleries", true), readCollection("chapters"),
]);
const assetFiles = await listFiles(assetsDir, (name) => imageExtension.test(name), true);
const assets = new Map();
const metadataIds = new Set();
for (const file of assetFiles) {
  const name = path.relative(assetsDir, file).split(path.sep).join("/").toLowerCase();
  const basename = path.posix.basename(name);
  assets.set(name, name);
  assets.set(stripExtension(name), name);
  if (!assets.has(basename)) assets.set(basename, name);
  if (!assets.has(stripExtension(basename))) assets.set(stripExtension(basename), name);
}
const resolveAsset = (reference) => typeof reference === "string"
  ? assets.get(reference.toLowerCase()) ?? assets.get(stripExtension(reference.toLowerCase()))
  : undefined;
for (const image of images) {
  const asset = resolveAsset(image.data.dateiname ?? image.id);
  if (!asset) continue;
  for (const id of [image.id.toLowerCase(), image.id.toLowerCase().replaceAll(".", "")]) {
    metadataIds.add(id);
    if (!assets.has(id)) assets.set(id, asset);
  }
}
const canonicalReference = (reference) => typeof reference === "string" && (
  metadataIds.has(reference.toLowerCase()) || /^Bilder\/[1-7](?:-[1-9])?\/.+\.(avif|gif|jpe?g|png|webp)$/i.test(reference)
);
const objectsBySlug = new Map(objects.map((object) => [object.data.slug, object]));

function validateImage(reference, context, gallery = false) {
  const asset = resolveAsset(reference);
  if (!asset) errors.push(`${context} references missing image metadata or asset: ${reference}`);
  else if (!canonicalReference(reference)) errors.push(`${context} must use an image metadata ID or complete Bilder/... path: ${reference}`);
  else if (!(gallery ? /^bilder\// : /^(bilder|heroes)\//).test(asset)) errors.push(`${context} references an image outside ${gallery ? "Bilder/" : "Bilder/ or Heroes/"}: ${reference}`);
}

function validateObjectLink(slug, imageKey, position, context) {
  if (slug === undefined) {
    if (imageKey !== undefined || position !== undefined) errors.push(`${context} requires an object link for a target image or position`);
    return;
  }
  const object = objectsBySlug.get(slug);
  if (!object) {
    errors.push(`${context} references missing object: ${slug}`);
    return;
  }
  if (imageKey !== undefined && !(Array.isArray(object.data.bilder) && object.data.bilder.some(
    (association) => association?.bild === imageKey && association.inObjektansicht !== false,
  ))) errors.push(`${context} target image must match a visible bilder[].bild reference in object ${slug}: ${imageKey}`);
  if (position !== undefined && !["Links", "Rechts", "Vorne"].includes(position)) errors.push(`${context} position must be Links, Rechts, or Vorne`);
}

for (const image of images) {
  const context = relative(image.file);
  onlyFields(image.data, ["dateiname", "altText"], context);
  optionalText(image.data.altText, `${context} altText`);
  if (image.body.trim()) errors.push(`${context} image metadata must not contain body text`);
  const filename = image.data.dateiname;
  if (filename !== undefined && (typeof filename !== "string" || filename.includes("..") || !/^(Bilder|Heroes|Meta)\/.+\.(avif|gif|jpe?g|png|webp)$/i.test(filename))) {
    errors.push(`${context} dateiname must be a complete path relative to assets/`);
  }
  if (!resolveAsset(filename ?? image.id)) errors.push(`${context} must reference or match an existing image asset`);
}

for (const object of objects) {
  const context = relative(object.file);
  const { slug, titel } = object.data;
  if (!nonempty(slug) || !/^[A-Za-z0-9-]+$/.test(slug) || /^[1-7]-/.test(slug)) errors.push(`${context} must define an ASCII slug without a chapter-number prefix`);
  if (slug !== object.id) errors.push(`${context} must be named ${slug}.md to match its slug`);
  if (!nonempty(titel)) errors.push(`${context} must define titel`);
  for (const [index, value] of array(object.data.bilder, `${context} bilder`, object.data.bilder !== undefined).entries()) {
    const location = `${context} bilder[${index}]`;
    const association = mapping(value, location);
    onlyFields(association, ["bild", "inObjektansicht"], location);
    validateImage(association.bild, location);
    if (association.inObjektansicht !== undefined && typeof association.inObjektansicht !== "boolean") errors.push(`${location} inObjektansicht must be a boolean`);
  }
  if (object.body.trim()) {
    const headings = [...object.body.matchAll(/^#\s+(.+?)\s*$/gm)];
    if (object.body.split(/^#\s+/m)[0].trim() || headings.length === 0) errors.push(`${context} body must be under # Beschreibung, # Anmerkungen, # Transkription, or # Übersetzung`);
    for (const heading of headings) if (!["Beschreibung", "Anmerkungen", "Transkription", "Übersetzung"].includes(heading[1])) errors.push(`${context} has unsupported object body heading: ${heading[1]}`);
  }
}

const galleryIds = new Set();
for (const gallery of galleries) {
  const context = relative(gallery.file);
  if (galleryIds.has(gallery.id)) errors.push(`${context} duplicates gallery ID ${gallery.id}`);
  galleryIds.add(gallery.id);
  onlyFields(gallery.data, ["titel", "bildabstand", "folien"], context);
  if (!nonempty(gallery.data.titel)) errors.push(`${context} must define titel`);
  if (!gallery.body.trim()) errors.push(`${context} must contain required gallery text in the Markdown body`);
  for (const [slideIndex, value] of array(gallery.data.folien, `${context} folien`, true).entries()) {
    const location = `${context} folien[${slideIndex}]`;
    const slide = mapping(value, location);
    onlyFields(slide, ["bilder", "beschriftungen", "nachweis"], location);
    for (const reference of array(slide.bilder, `${location} bilder`, true)) validateImage(reference, location, true);
    optionalText(slide.nachweis, `${location} nachweis`);
    for (const [captionIndex, value] of array(slide.beschriftungen, `${location} beschriftungen`).entries()) {
      const captionLocation = `${location} beschriftungen[${captionIndex}]`;
      const caption = mapping(value, captionLocation);
      onlyFields(caption, ["text", "objekt", "objektBild", "position"], captionLocation);
      if (!nonempty(caption.text)) errors.push(`${captionLocation} must define non-empty text`);
      validateObjectLink(caption.objekt, caption.objektBild, caption.position, captionLocation);
    }
  }
}

for (const section of sections) {
  const context = relative(section.file);
  if (!/^[1-7](?:-[1-9])?-[a-z].*\.md$/.test(path.basename(section.file))) errors.push(`${context} must use a chapter filename like 2-name.md or a subchapter filename like 2-1-name.md`);
  for (const [field, folder] of [["hero", "Heroes"], ["thumbnail", "Thumbnails"]]) {
    const name = section.data[field];
    if (!nonempty(name) || !/\.webp$/i.test(name) || !assets.has(`${folder}/${name}`.toLowerCase())) errors.push(`${context} must reference an existing WebP ${field} in assets/${folder}`);
  }
  if (section.data.heroMetadata !== undefined && !resolveAsset(section.data.heroMetadata)) errors.push(`${context} references missing heroMetadata: ${section.data.heroMetadata}`);
  optionalText(section.data.heroBeschriftung, `${context} heroBeschriftung`);
  optionalText(section.data.heroNachweis, `${context} heroNachweis`);
  validateObjectLink(section.data.heroObject, section.data.heroObjektBild, undefined, `${context} heroObject`);
  for (const id of array(section.data.galerien, `${context} galerien`)) if (!galleryIds.has(id)) errors.push(`${context} references missing gallery: ${id}`);
}

if (errors.length) {
  console.error("Content validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log("Content validation passed.");
