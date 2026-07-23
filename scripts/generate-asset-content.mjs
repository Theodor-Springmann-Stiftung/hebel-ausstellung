import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const assetsDir = path.join(rootDir, "src", "assets", "objects");
const imagesDir = path.join(rootDir, "src", "content", "images");
const supportedExtensions = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"]);

function imageFrontmatter(fileName) {
  return [
    "---",
    `dateiname: "${fileName}"`,
    "---",
    "",
  ].join("\n");
}

async function writeIfMissing(filePath, contents) {
  try {
    await writeFile(filePath, contents, { encoding: "utf8", flag: "wx" });
    return true;
  } catch (error) {
    if (error?.code === "EEXIST") {
      return false;
    }

    throw error;
  }
}

async function main() {
  const entries = await readdir(assetsDir, { withFileTypes: true });
  const imageNames = entries
    .filter((entry) => entry.isFile() && supportedExtensions.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  await mkdir(imagesDir, { recursive: true });

  let imageFilesCreated = 0;

  for (const imageName of imageNames) {
    const id = path.basename(imageName, path.extname(imageName));

    if (await writeIfMissing(path.join(imagesDir, `${id}.md`), imageFrontmatter(imageName))) {
      imageFilesCreated += 1;
    }
  }

  console.log(`Processed ${imageNames.length} asset(s): created ${imageFilesCreated} image file(s).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
