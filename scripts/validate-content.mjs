import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const contentDir = path.join(rootDir, "src", "content");
const assetObjectsDir = path.join(rootDir, "src", "assets", "objects");
const errors = [];
const urlSafeAsciiSlugPattern = /^[A-Za-z0-9-]+$/;

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
  const objectFiles = await listMarkdownFiles(path.join(contentDir, "objects"));
  const assetEntries = await readdir(assetObjectsDir, { withFileTypes: true });
  const assetNames = new Set(assetEntries.filter((entry) => entry.isFile()).map((entry) => entry.name.toLowerCase()));
  const assetStems = new Set([...assetNames].map((name) => path.parse(name).name));
  const objectIds = new Set(objectFiles.map((file) => path.basename(file, path.extname(file))));
  const objectIdBySlug = new Map();

  for (const objectFile of objectFiles) {
    const source = await readFile(objectFile, "utf8");
    const { frontmatter } = splitMarkdownFile(objectFile, source);
    const slug = getFrontmatterString(frontmatter, "slug");

    if (slug) objectIdBySlug.set(slug, path.basename(objectFile, path.extname(objectFile)));
  }

  for (const file of files) {
    const source = await readFile(file, "utf8");
    const { frontmatter } = splitMarkdownFile(file, source);
    const fileName = getFrontmatterString(frontmatter, "dateiname");

    for (const objectReference of getFrontmatterList(frontmatter, "objekte")) {
      if (objectIds.has(objectReference)) continue;

      const objectId = objectIdBySlug.get(objectReference);
      errors.push(
        objectId
          ? `${relative(file)} object reference must use the object filename "${objectId}", not its slug "${objectReference}"`
          : `${relative(file)} references missing object file: src/content/objects/${objectReference}.md`,
      );
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
}

await validateGalleries();
await validateImages();
await validateObjects();

if (errors.length > 0) {
  console.error("Content validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Content validation passed.");
