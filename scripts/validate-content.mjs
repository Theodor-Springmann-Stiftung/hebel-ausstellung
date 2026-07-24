import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const contentDir = path.join(rootDir, "src", "content");
const assetObjectsDir = path.join(rootDir, "src", "assets", "objects");
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

function getFrontmatterList(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*\\r?\\n((?:^[ \\t]+-.*(?:\\r?\\n|$))*)`, "m"));

  return [...(match?.[1] ?? "").matchAll(/^\s*-\s*["']?(.+?)["']?\s*$/gm)].map((item) => item[1].trim());
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
  const assetEntries = await readdir(assetObjectsDir, { withFileTypes: true });
  const assetNames = assetEntries.filter((entry) => entry.isFile()).map((entry) => entry.name);
  const assetByReference = new Map();

  for (const assetName of assetNames) {
    const normalizedName = assetName.toLowerCase();
    assetByReference.set(normalizedName, normalizedName);
    assetByReference.set(stripImageExtension(normalizedName), normalizedName);
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
  };
}

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
  const { assetNames, assetStems } = await getImageCatalog();

  for (const file of files) {
    const source = await readFile(file, "utf8");
    const { frontmatter } = splitMarkdownFile(file, source);
    const fileName = getFrontmatterString(frontmatter, "dateiname");

    if (/^(objekte|objektPositionen):/m.test(frontmatter)) {
      errors.push(`${relative(file)} must not define object relationships; use objects.bilder instead`);
    }

    if (!fileName) {
      const inferredStem = path.basename(file, path.extname(file)).toLowerCase();
      if (!assetStems.has(inferredStem)) {
        errors.push(`${relative(file)} must define dateiname or match an image asset basename`);
      }
      continue;
    }

    if (fileName.includes("..") || path.isAbsolute(fileName)) {
      errors.push(`${relative(file)} fileName must be relative to src/assets/objects`);
      continue;
    }

    if (!assetNames.has(fileName.toLowerCase())) {
      errors.push(`${relative(file)} references missing image asset: src/assets/objects/${fileName}`);
    }
  }
}

async function validateObjects() {
  const files = await listMarkdownFiles(path.join(contentDir, "objects"));
  const imageCatalog = await getImageCatalog();
  const relationshipsByImage = new Map();
  const allowedHeadings = new Set(["Beschreibung", "Transkription"]);

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
      errors.push(`${relative(file)} object body text must be inside # Beschreibung or # Transkription`);
    }

    if (h1Matches.length === 0) {
      errors.push(`${relative(file)} object body must use # Beschreibung and/or # Transkription`);
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

    for (const imageReference of getFrontmatterList(frontmatter, "bilder")) {
      if (!imageCatalog.resolve(imageReference)) {
        warnings.push(`${relative(file)} references unavailable gallery image metadata or asset: ${imageReference}`);
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
