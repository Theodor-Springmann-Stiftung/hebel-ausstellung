#!/usr/bin/env node

import { mkdir, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const SUPPORTED_EXTENSIONS = new Set([
  ".avif",
  ".bmp",
  ".gif",
  ".jpeg",
  ".jpg",
  ".png",
  ".tif",
  ".tiff",
  ".webp",
]);

const DEFAULT_MAX_EDGE = 4096;

function printUsage() {
  console.log(`Usage: npm run images:preprocess -- <input-dir> <output-dir> [--max-edge=4096] [--flat]

Converts supported images recursively to source-controlled lossless WebP masters.

Examples:
  npm run images:preprocess -- import/images src/assets/objects
  npm run images:preprocess -- import/images src/assets/objects --max-edge=5000
  npm run images:preprocess -- import/Hebel_Ausstellung src/assets/objects --flat

Behavior:
  - Preserves the input folder structure in the output folder by default.
  - Use --flat to put all output files directly in the output folder.
  - Writes every output as .webp.
  - Overwrites existing output files.
  - Resizes only when an image's longest edge is larger than --max-edge.
  - Uses lossless WebP to avoid compression artifacts in text and drawings.
`);
}

function parseArgs(argv) {
  const positional = [];
  let maxEdge = DEFAULT_MAX_EDGE;
  let flat = false;

  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") {
      return { help: true };
    }

    if (arg.startsWith("--max-edge=")) {
      const value = Number.parseInt(arg.slice("--max-edge=".length), 10);
      if (!Number.isFinite(value) || value < 1) {
        throw new Error("--max-edge must be a positive integer.");
      }
      maxEdge = value;
      continue;
    }

    if (arg === "--flat") {
      flat = true;
      continue;
    }

    positional.push(arg);
  }

  if (positional.length !== 2) {
    throw new Error("Expected exactly <input-dir> and <output-dir>.");
  }

  return {
    inputDir: path.resolve(positional[0]),
    outputDir: path.resolve(positional[1]),
    maxEdge,
    flat,
  };
}

async function collectImages(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectImages(absolutePath)));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(absolutePath);
    }
  }

  return files;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function normalizeOutputSegment(segment) {
  const replacements = new Map([
    ["ä", "ae"],
    ["Ä", "Ae"],
    ["ö", "oe"],
    ["Ö", "Oe"],
    ["ü", "ue"],
    ["Ü", "Ue"],
    ["ß", "ss"],
  ]);

  return segment
    .replace(/[äÄöÖüÜß]/g, (character) => replacements.get(character))
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’‘`´]/g, "")
    .replace(/[^A-Za-z0-9._+-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "") || "_";
}

function outputPathFor(inputFile, inputDir, outputDir, flat) {
  const relativePath = path.relative(inputDir, inputFile);
  const parsed = path.parse(relativePath);
  const outputDirname = flat
    ? ""
    : parsed.dir
        .split(path.sep)
        .map(normalizeOutputSegment)
        .join(path.sep);
  const outputBasename = normalizeOutputSegment(parsed.name);

  return path.join(outputDir, outputDirname, `${outputBasename}.webp`);
}

async function openImage(inputFile) {
  if (path.extname(inputFile).toLowerCase() !== ".bmp") {
    return sharp(inputFile, {
      failOn: "none",
      limitInputPixels: false,
      unlimited: true,
    });
  }

  const source = await readFile(inputFile);
  if (source.toString("ascii", 0, 2) !== "BM" || source.length < 54) {
    throw new Error("Invalid BMP file.");
  }

  const pixelOffset = source.readUInt32LE(10);
  const dibHeaderSize = source.readUInt32LE(14);
  const width = source.readInt32LE(18);
  const signedHeight = source.readInt32LE(22);
  const bitsPerPixel = source.readUInt16LE(28);
  const compression = source.readUInt32LE(30);

  if (dibHeaderSize < 40 || width < 1 || signedHeight === 0) {
    throw new Error("Unsupported BMP header.");
  }
  if (compression !== 0 || (bitsPerPixel !== 24 && bitsPerPixel !== 32)) {
    throw new Error("Only uncompressed 24-bit and 32-bit BMP files are supported.");
  }

  const height = Math.abs(signedHeight);
  const channels = bitsPerPixel / 8;
  const rowSize = Math.ceil((width * bitsPerPixel) / 32) * 4;
  const requiredSize = pixelOffset + rowSize * height;
  if (requiredSize > source.length) {
    throw new Error("BMP pixel data is truncated.");
  }

  const pixels = Buffer.allocUnsafe(width * height * channels);
  for (let y = 0; y < height; y += 1) {
    const sourceY = signedHeight > 0 ? height - y - 1 : y;
    const sourceRow = pixelOffset + sourceY * rowSize;
    const targetRow = y * width * channels;

    for (let x = 0; x < width; x += 1) {
      const sourcePixel = sourceRow + x * channels;
      const targetPixel = targetRow + x * channels;
      pixels[targetPixel] = source[sourcePixel + 2];
      pixels[targetPixel + 1] = source[sourcePixel + 1];
      pixels[targetPixel + 2] = source[sourcePixel];
      if (channels === 4) pixels[targetPixel + 3] = source[sourcePixel + 3];
    }
  }

  return sharp(pixels, { raw: { width, height, channels } });
}

async function processImage(inputFile, inputDir, outputDir, maxEdge, flat) {
  const outputFile = outputPathFor(inputFile, inputDir, outputDir, flat);
  const inputStats = await stat(inputFile);
  const image = await openImage(inputFile);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Could not read image dimensions.");
  }

  const longestEdge = Math.max(metadata.width, metadata.height);
  const shouldResize = longestEdge > maxEdge;
  const pipeline = image.rotate();

  if (shouldResize) {
    pipeline.resize({
      width: metadata.width >= metadata.height ? maxEdge : undefined,
      height: metadata.height > metadata.width ? maxEdge : undefined,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  await mkdir(path.dirname(outputFile), { recursive: true });

  const outputInfo = await pipeline
    .toColorspace("srgb")
    .webp({ lossless: true, effort: 6 })
    .toFile(outputFile);

  const outputStats = await stat(outputFile);
  const relativeInput = path.relative(process.cwd(), inputFile);
  const relativeOutput = path.relative(process.cwd(), outputFile);
  const resizeInfo = shouldResize
    ? `${metadata.width}x${metadata.height} -> ${outputInfo.width}x${outputInfo.height}`
    : `${metadata.width}x${metadata.height}`;

  return {
    input: relativeInput,
    output: relativeOutput,
    dimensions: resizeInfo,
    inputSize: formatBytes(inputStats.size),
    outputSize: formatBytes(outputStats.size),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printUsage();
    return;
  }

  const inputStats = await stat(args.inputDir).catch(() => null);
  if (!inputStats?.isDirectory()) {
    throw new Error(`Input directory does not exist: ${args.inputDir}`);
  }

  await mkdir(args.outputDir, { recursive: true });

  const images = await collectImages(args.inputDir);
  if (images.length === 0) {
    console.log(`No supported images found in ${args.inputDir}`);
    return;
  }

  console.log(
    `Processing ${images.length} image(s) with max edge ${args.maxEdge}px${args.flat ? " into a flat output folder" : ""}...`,
  );

  let processedCount = 0;
  for (const [index, image] of images.entries()) {
    try {
      const result = await processImage(image, args.inputDir, args.outputDir, args.maxEdge, args.flat);
      processedCount += 1;
      console.log(
        `[${index + 1}/${images.length}] ${result.input} -> ${result.output} | ${result.dimensions} | ${result.inputSize} -> ${result.outputSize}`,
      );
    } catch (error) {
      const relativeInput = path.relative(process.cwd(), image);
      console.error(`[${index + 1}/${images.length}] Failed: ${relativeInput}`);
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    }
  }

  if (process.exitCode) {
    console.error(`Finished with errors. Processed ${processedCount}/${images.length} image(s).`);
    return;
  }

  console.log(`Done. Processed ${processedCount}/${images.length} image(s).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  printUsage();
  process.exit(1);
});
