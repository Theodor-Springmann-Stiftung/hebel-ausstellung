#!/usr/bin/env node

import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import mammoth from "mammoth";

function printUsage() {
  console.log(`Usage: npm run docx:extract -- <input-file-or-dir> <output-dir> [--flat] [--raw]

Extracts content-team .docx files to Markdown for manual cleanup.

Examples:
  npm run docx:extract -- import/Hebel_Ausstellung import/extracted-docx
  npm run docx:extract -- import/Hebel_Ausstellung/2_AG import/extracted-docx/2_AG --raw

Behavior:
  - Recursively finds .docx files when the input is a directory.
  - Preserves the input folder structure in the output folder by default.
  - Use --flat to put all extracted Markdown files directly in the output folder.
  - Use --raw to also write a plain-text .txt extraction next to each .md file.
  - Output is draft/import material. Move cleaned content into src/content manually.
`);
}

function parseArgs(argv) {
  const positional = [];
  let flat = false;
  let raw = false;

  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") {
      return { help: true };
    }

    if (arg === "--flat") {
      flat = true;
      continue;
    }

    if (arg === "--raw") {
      raw = true;
      continue;
    }

    positional.push(arg);
  }

  if (positional.length !== 2) {
    throw new Error("Expected exactly <input-file-or-dir> and <output-dir>.");
  }

  return {
    inputPath: path.resolve(positional[0]),
    outputDir: path.resolve(positional[1]),
    flat,
    raw,
  };
}

async function collectDocx(inputPath) {
  const inputStats = await stat(inputPath).catch(() => null);

  if (!inputStats) {
    throw new Error(`Input path does not exist: ${inputPath}`);
  }

  if (inputStats.isFile()) {
    return path.extname(inputPath).toLowerCase() === ".docx" ? [inputPath] : [];
  }

  if (!inputStats.isDirectory()) {
    return [];
  }

  const entries = await readdir(inputPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(inputPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectDocx(absolutePath)));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (entry.name.startsWith("~$")) {
      continue;
    }

    if (path.extname(entry.name).toLowerCase() === ".docx") {
      files.push(absolutePath);
    }
  }

  return files;
}

function outputBaseFor(inputFile, inputRoot, outputDir, flat) {
  const root = inputRoot.endsWith(".docx") ? path.dirname(inputRoot) : inputRoot;
  const relativePath = path.relative(root, inputFile);
  const parsed = path.parse(relativePath);
  return path.join(outputDir, flat ? "" : parsed.dir, parsed.name);
}

function normalizeMarkdown(markdown, sourcePath) {
  const trimmed = markdown.trim();
  const relativeSource = path.relative(process.cwd(), sourcePath);
  return `<!-- Source: ${relativeSource} -->\n\n${trimmed}\n`;
}

async function extractDocx(inputFile, inputRoot, outputDir, options) {
  const outputBase = outputBaseFor(inputFile, inputRoot, outputDir, options.flat);
  const markdownPath = `${outputBase}.md`;

  const markdownResult = await mammoth.convertToMarkdown({ path: inputFile });
  const markdown = normalizeMarkdown(markdownResult.value, inputFile);

  await mkdir(path.dirname(markdownPath), { recursive: true });
  await writeFile(markdownPath, markdown, "utf8");

  let rawPath;
  if (options.raw) {
    rawPath = `${outputBase}.txt`;
    const rawResult = await mammoth.extractRawText({ path: inputFile });
    await writeFile(rawPath, rawResult.value.trimEnd() + "\n", "utf8");
  }

  for (const message of markdownResult.messages) {
    console.warn(`${path.relative(process.cwd(), inputFile)}: ${message.message}`);
  }

  return {
    input: path.relative(process.cwd(), inputFile),
    markdown: path.relative(process.cwd(), markdownPath),
    raw: rawPath ? path.relative(process.cwd(), rawPath) : undefined,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printUsage();
    return;
  }

  await mkdir(args.outputDir, { recursive: true });

  const docxFiles = await collectDocx(args.inputPath);
  if (docxFiles.length === 0) {
    console.log(`No .docx files found in ${args.inputPath}`);
    return;
  }

  console.log(`Extracting ${docxFiles.length} .docx file(s)...`);

  let processedCount = 0;
  for (const [index, docxFile] of docxFiles.entries()) {
    try {
      const result = await extractDocx(docxFile, args.inputPath, args.outputDir, args);
      processedCount += 1;
      const raw = result.raw ? ` and ${result.raw}` : "";
      console.log(`[${index + 1}/${docxFiles.length}] ${result.input} -> ${result.markdown}${raw}`);
    } catch (error) {
      console.error(`[${index + 1}/${docxFiles.length}] Failed: ${path.relative(process.cwd(), docxFile)}`);
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    }
  }

  if (process.exitCode) {
    console.error(`Finished with errors. Extracted ${processedCount}/${docxFiles.length} file(s).`);
    return;
  }

  console.log(`Done. Extracted ${processedCount}/${docxFiles.length} file(s).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  printUsage();
  process.exit(1);
});
