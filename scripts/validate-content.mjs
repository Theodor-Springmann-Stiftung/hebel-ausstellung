import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const contentDir = path.join(rootDir, "src", "content");
const assetsDir = path.join(rootDir, "src", "assets");
const errors = [];
const warnings = [];
const urlSafeAsciiSlugPattern = /^[A-Za-z0-9-]+$/;
const imageExtensionPattern = /\.(avif|gif|jpe?g|png|webp)$/i;

async function listMarkdownFiles(directory) {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
      .map((entry) => path.join(directory, entry.name));
  } catch (error) {
    if (error?.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function listImageFiles(directory) {
  const files = [];

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...await listImageFiles(entryPath));
    } else if (entry.isFile() && imageExtensionPattern.test(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
}

function relative(filePath) {
  return path.relative(rootDir, filePath);
}

function splitMarkdownFile(filePath, source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);

  if (!match) {
    errors.push(`${relative(filePath)} must start with YAML frontmatter`);
    return { frontmatter: "", body: source };
  }

  return {
    frontmatter: match[1],
    body: source.slice(match[0].length),
  };
}

function getFrontmatterString(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*["']?([^"'\\r\\n]+)["']?\\s*$`, "m"));
  return match?.[1]?.trim();
}

function unquoteFrontmatterValue(value) {
  const trimmed = value.trim();
  const quote = trimmed[0];
  return (quote === '"' || quote === "'") && trimmed.at(-1) === quote
    ? trimmed.slice(1, -1)
    : trimmed;
}

function getFrontmatterNestedList(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*\\r?\\n((?:^[ \\t]+.*(?:\\r?\\n|$))*)`, "m"));
  const groups = [];
  let current;

  for (const line of (match?.[1] ?? "").split(/\r?\n/)) {
    const outer = line.match(/^[ \t]{2}-[ \t]*(.*)$/);
    const inner = line.match(/^[ \t]{4}-[ \t]+(.+?)\s*$/);

    if (outer) {
      current = [];
      groups.push(current);
      const firstItem = outer[1].match(/^-[ \t]+(.+?)\s*$/);
      if (firstItem) current.push(unquoteFrontmatterValue(firstItem[1]));
    } else if (inner && current) {
      current.push(unquoteFrontmatterValue(inner[1]));
    }
  }

  return groups;
}

function getFrontmatterObjectList(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*\\r?\\n((?:^[ \\t]+.*(?:\\r?\\n|$))*)`, "m"));
  const block = match?.[1] ?? "";
  const entries = [];
  let current;

  for (const line of block.split(/\r?\n/)) {
    const item = line.match(/^\s{2}-\s+([A-Za-z][A-Za-z0-9]*):\s*["']?(.+?)["']?\s*$/);
    const property = line.match(/^\s{4}([A-Za-z][A-Za-z0-9]*):\s*["']?(.+?)["']?\s*$/);

    if (item) {
      current = { [item[1]]: item[2] };
      entries.push(current);
    } else if (property && current) {
      current[property[1]] = property[2];
    }
  }

  return entries;
}

const stripImageExtension = (value) => value.replace(imageExtensionPattern, "");

async function getImageCatalog() {
  const imageFiles = await listMarkdownFiles(path.join(contentDir, "images"));
  const assetFiles = (await Promise.all(["Bilder", "Heroes", "Meta", "Thumbnails"].map(
    (directory) => listImageFiles(path.join(assetsDir, directory)),
  ))).flat();
  const assetNames = assetFiles.map((file) => path.relative(assetsDir, file).split(path.sep).join("/"));
  const assetByReference = new Map();
  const metadataReferences = new Set();

  for (const assetName of assetNames) {
    const normalizedName = assetName.toLowerCase();
    const filename = path.basename(normalizedName);
    assetByReference.set(normalizedName, normalizedName);
    assetByReference.set(stripImageExtension(normalizedName), normalizedName);
    if (!assetByReference.has(filename)) assetByReference.set(filename, normalizedName);
    if (!assetByReference.has(stripImageExtension(filename))) assetByReference.set(stripImageExtension(filename), normalizedName);
  }

  for (const imageFile of imageFiles) {
    const source = await readFile(imageFile, "utf8");
    const { frontmatter } = splitMarkdownFile(imageFile, source);
    const imageId = path.basename(imageFile, path.extname(imageFile));
    const fileName = getFrontmatterString(frontmatter, "dateiname") ?? imageId;
    const assetName = assetByReference.get(fileName.toLowerCase())
      ?? assetByReference.get(stripImageExtension(fileName.toLowerCase()));

    if (!assetName) continue;

    for (const reference of [imageId, imageId.toLowerCase(), imageId.toLowerCase().replaceAll(".", ""), fileName.toLowerCase(), stripImageExtension(fileName.toLowerCase())]) {
      if (!assetByReference.has(reference)) assetByReference.set(reference, assetName);
    }
    metadataReferences.add(imageId);
    metadataReferences.add(imageId.toLowerCase());
    metadataReferences.add(imageId.toLowerCase().replaceAll(".", ""));
  }

  return {
    assetNames: new Set(assetNames.map((name) => name.toLowerCase())),
    assetStems: new Set(assetNames.map((name) => stripImageExtension(name.toLowerCase()))),
    resolve(reference) {
      const normalized = reference.toLowerCase();
      return assetByReference.get(reference)
        ?? assetByReference.get(normalized)
        ?? assetByReference.get(normalized.replaceAll(".", ""))
        ?? assetByReference.get(stripImageExtension(normalized));
    },
    isMetadataReference(reference) {
      const normalized = reference.toLowerCase();
      return metadataReferences.has(reference)
        || metadataReferences.has(normalized)
        || metadataReferences.has(normalized.replaceAll(".", ""));
    },
  };
}

const isCanonicalImageReference = (reference, imageCatalog) =>
  imageCatalog.isMetadataReference(reference)
  || /^Bilder\/[1-7](?:-[1-9])?\/.+\.(avif|gif|jpe?g|png|webp)$/i.test(reference);

async function validateGalleries() {
  const files = await listMarkdownFiles(path.join(contentDir, "galleries"));

  for (const file of files) {
    const source = await readFile(file, "utf8");
    const { body } = splitMarkdownFile(file, source);

    if (!body.trim()) {
      errors.push(`${relative(file)} must contain required gallery text in the Markdown body`);
    }
  }
}

async function validateImages() {
  const files = await listMarkdownFiles(path.join(contentDir, "images"));
  const imageCatalog = await getImageCatalog();

  for (const file of files) {
    const source = await readFile(file, "utf8");
    const { frontmatter } = splitMarkdownFile(file, source);
    const fileName = getFrontmatterString(frontmatter, "dateiname");

    if (/^(objekte|objektPositionen):/m.test(frontmatter)) {
      errors.push(`${relative(file)} must not define object relationships; use objects.bilder instead`);
    }

    if (!fileName) {
      const inferredStem = path.basename(file, path.extname(file)).toLowerCase();
      if (!imageCatalog.resolve(inferredStem)) {
        errors.push(`${relative(file)} must define dateiname or match an image asset basename`);
      }
      continue;
    }

    if (fileName.includes("..") || path.isAbsolute(fileName)) {
      errors.push(`${relative(file)} fileName must be relative to src/assets`);
      continue;
    }

    if (!/^(Bilder|Heroes|Meta)\/.+\.(avif|gif|jpe?g|png|webp)$/i.test(fileName)) {
      errors.push(`${relative(file)} dateiname must be a complete path relative to src/assets`);
      continue;
    }

    if (!imageCatalog.resolve(fileName)) {
      errors.push(`${relative(file)} references missing image asset: src/assets/${fileName}`);
    }
  }
}

async function validateObjects() {
  const files = await listMarkdownFiles(path.join(contentDir, "objects"));
  const imageCatalog = await getImageCatalog();
  const relationshipsByImage = new Map();
  const allowedHeadings = new Set(["Beschreibung", "Transkription", "Übersetzung"]);

  for (const file of files) {
    const source = await readFile(file, "utf8");
    const { frontmatter, body } = splitMarkdownFile(file, source);
    const slug = getFrontmatterString(frontmatter, "slug");
    const title = getFrontmatterString(frontmatter, "titel");

    if (!slug) {
      errors.push(`${relative(file)} must define slug`);
    } else if (!urlSafeAsciiSlugPattern.test(slug)) {
      errors.push(`${relative(file)} slug must use only ASCII letters, digits, and hyphens`);
    } else if (/^[1-7]-/.test(slug)) {
      errors.push(`${relative(file)} object slug must not start with a chapter number`);
    }

    if (!title) {
      errors.push(`${relative(file)} must define titel`);
    }

    for (const association of getFrontmatterObjectList(frontmatter, "bilder")) {
      const imageReference = association.bild;

      if (!imageReference) {
        errors.push(`${relative(file)} contains a bilder entry without bild`);
        continue;
      }

      const assetName = imageCatalog.resolve(imageReference);

      if (!assetName) {
        errors.push(`${relative(file)} references missing image metadata or asset: ${imageReference}`);
      } else if (!isCanonicalImageReference(imageReference, imageCatalog)) {
        errors.push(`${relative(file)} must reference an image metadata ID or complete Bilder/... asset path: ${imageReference}`);
      } else if (!/^(bilder|heroes)\//.test(assetName)) {
        errors.push(`${relative(file)} object image must resolve to a Bilder/... or Heroes/... asset: ${imageReference}`);
      }

      if (association.objektReihenfolge && !/^[1-9]\d*$/.test(association.objektReihenfolge)) {
        errors.push(`${relative(file)} objektReihenfolge must be a positive integer`);
      }

      if (assetName) {
        const relationships = relationshipsByImage.get(assetName) ?? [];
        relationships.push({ file, order: association.objektReihenfolge });
        relationshipsByImage.set(assetName, relationships);
      }
    }

    if (!body.trim()) {
      continue;
    }

    const h1Matches = [...body.matchAll(/^#\s+(.+?)\s*$/gm)];
    const beforeFirstHeading = body.split(/^#\s+/m)[0]?.trim();

    if (beforeFirstHeading) {
      errors.push(`${relative(file)} object body text must be inside # Beschreibung, # Transkription, or # Übersetzung`);
    }

    if (h1Matches.length === 0) {
      errors.push(`${relative(file)} object body must use # Beschreibung, # Transkription, and/or # Übersetzung`);
      continue;
    }

    for (const match of h1Matches) {
      const heading = match[1].trim();

      if (!allowedHeadings.has(heading)) {
        errors.push(`${relative(file)} has unsupported object body heading: # ${heading}`);
      }
    }
  }

  for (const [image, relationships] of relationshipsByImage) {
    if (relationships.length < 2) continue;

    const orders = relationships.map((relationship) => relationship.order);
    if (orders.some((order) => !order)) {
      errors.push(`Objects sharing image ${image} must all define objektReihenfolge`);
      continue;
    }

    if (new Set(orders).size !== orders.length) {
      errors.push(`Objects sharing image ${image} must define unique objektReihenfolge values`);
    }
  }
}

async function validateDisplayImageReferences() {
  const imageCatalog = await getImageCatalog();

  for (const collection of ["chapters", "subchapters"]) {
    const files = await listMarkdownFiles(path.join(contentDir, collection));

    for (const file of files) {
      const source = await readFile(file, "utf8");
      const { frontmatter } = splitMarkdownFile(file, source);
      const hero = getFrontmatterString(frontmatter, "hero");

      if (hero && !imageCatalog.resolve(hero)) {
        errors.push(`${relative(file)} references missing hero image metadata or asset: ${hero}`);
      }
    }
  }

  const galleryFiles = await listMarkdownFiles(path.join(contentDir, "galleries"));
  for (const file of galleryFiles) {
    const source = await readFile(file, "utf8");
    const { frontmatter } = splitMarkdownFile(file, source);

    const imageGroups = getFrontmatterNestedList(frontmatter, "bilder");
    if (imageGroups.length === 0 || imageGroups.some((group) => group.length === 0)) {
      errors.push(`${relative(file)} must define bilder as a non-empty array of non-empty image arrays`);
    }

    for (const [slideIndex, imageGroup] of imageGroups.entries()) {
      for (const [imageIndex, imageReference] of imageGroup.entries()) {
        const assetName = imageCatalog.resolve(imageReference);

        if (!assetName) {
          warnings.push(`${relative(file)} references unavailable gallery image metadata or asset at bilder[${slideIndex}][${imageIndex}]: ${imageReference}`);
        } else if (!isCanonicalImageReference(imageReference, imageCatalog)) {
          errors.push(`${relative(file)} must use an image metadata ID or complete Bilder/... path at bilder[${slideIndex}][${imageIndex}]: ${imageReference}`);
        } else if (!assetName.startsWith("bilder/")) {
          errors.push(`${relative(file)} gallery image must resolve to a Bilder/... asset at bilder[${slideIndex}][${imageIndex}]: ${imageReference}`);
        }
      }
    }
  }
}

await validateGalleries();
await validateImages();
await validateObjects();
await validateDisplayImageReferences();

if (errors.length > 0) {
  console.error("Content validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

if (warnings.length > 0) {
  console.warn("Content validation warnings:");
  for (const warning of warnings) {
    console.warn(`- ${warning}`);
  }
}

console.log("Content validation passed.");
