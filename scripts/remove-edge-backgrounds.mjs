#!/usr/bin/env node

import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const SUPPORTED_EXTENSIONS = new Set([".jpeg", ".jpg", ".png", ".webp"]);
const DEFAULT_INPUT = "src/assets/objects";
const ANALYSIS_MAX_EDGE = 384;

function printUsage() {
  console.log(`Usage: npm run images:remove-backgrounds -- [input-dir] [options]

Detects uniform light or dark backgrounds connected to the image perimeter.
Analysis is read-only unless --apply is supplied.

Options:
  --apply                 Write detected images (requires --output).
  --output=<dir>          Separate output directory for processed images.
  --tolerance=<0-255>     Background color tolerance (default: 24).
  --min-area=<percent>    Minimum removable area (default: 2).
  --max-area=<percent>    Maximum removable area (default: 35).
  --help, -h              Show this help.

Examples:
  npm run images:remove-backgrounds
  npm run images:remove-backgrounds -- src/assets/objects
  npm run images:remove-backgrounds -- --apply --output=/tmp/objects-transparent
`);
}

function parseNumberOption(arg, name, fallback) {
  if (!arg.startsWith(`${name}=`)) return fallback;
  const value = Number(arg.slice(name.length + 1));
  if (!Number.isFinite(value)) throw new Error(`${name} must be a number.`);
  return value;
}

function parseArgs(argv) {
  let inputDir = DEFAULT_INPUT;
  let outputDir;
  let apply = false;
  let tolerance = 24;
  let minArea = 2;
  let maxArea = 35;
  let hasInput = false;

  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") return { help: true };
    if (arg === "--apply") {
      apply = true;
      continue;
    }
    if (arg.startsWith("--output=")) {
      outputDir = arg.slice("--output=".length);
      continue;
    }
    if (arg.startsWith("--tolerance=")) {
      tolerance = parseNumberOption(arg, "--tolerance", tolerance);
      continue;
    }
    if (arg.startsWith("--min-area=")) {
      minArea = parseNumberOption(arg, "--min-area", minArea);
      continue;
    }
    if (arg.startsWith("--max-area=")) {
      maxArea = parseNumberOption(arg, "--max-area", maxArea);
      continue;
    }
    if (arg.startsWith("-")) throw new Error(`Unknown option: ${arg}`);
    if (hasInput) throw new Error("Only one input directory may be supplied.");
    inputDir = arg;
    hasInput = true;
  }

  if (tolerance <= 0 || tolerance > 255) {
    throw new Error("--tolerance must be greater than 0 and at most 255.");
  }
  if (minArea < 0 || maxArea > 100 || minArea >= maxArea) {
    throw new Error("Area limits must satisfy 0 <= min-area < max-area <= 100.");
  }
  if (apply && !outputDir) {
    throw new Error("--apply requires --output so source assets are never overwritten.");
  }

  return {
    inputDir: path.resolve(inputDir),
    outputDir: outputDir ? path.resolve(outputDir) : undefined,
    apply,
    tolerance,
    minArea: minArea / 100,
    maxArea: maxArea / 100,
  };
}

async function collectImages(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const images = [];

  for (const entry of entries) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) images.push(...(await collectImages(file)));
    if (entry.isFile() && SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      images.push(file);
    }
  }

  return images.sort();
}

function colorDistance(data, offset, color) {
  const red = data[offset] - color[0];
  const green = data[offset + 1] - color[1];
  const blue = data[offset + 2] - color[2];
  return Math.sqrt(red * red + green * green + blue * blue);
}

function median(values) {
  values.sort((a, b) => a - b);
  return values[Math.floor(values.length / 2)];
}

function perimeterIndexes(width, height) {
  const indexes = [];
  for (let x = 0; x < width; x += 1) {
    indexes.push(x, (height - 1) * width + x);
  }
  for (let y = 1; y < height - 1; y += 1) {
    indexes.push(y * width, y * width + width - 1);
  }
  return indexes;
}

function candidateBackground(data, width, height, tolerance) {
  const indexes = perimeterIndexes(width, height);
  const channels = [[], [], []];

  for (const index of indexes) {
    const offset = index * 4;
    channels[0].push(data[offset]);
    channels[1].push(data[offset + 1]);
    channels[2].push(data[offset + 2]);
  }

  const color = channels.map(median);
  const luminance = color[0] * 0.2126 + color[1] * 0.7152 + color[2] * 0.0722;
  if (luminance > 45 && luminance < 215) return null;

  const matchingEdges = indexes.filter(
    (index) => colorDistance(data, index * 4, color) <= tolerance,
  ).length;
  if (matchingEdges / indexes.length < 0.9) return null;

  const patch = Math.max(2, Math.round(Math.min(width, height) * 0.025));
  const corners = [
    [0, 0],
    [width - patch, 0],
    [0, height - patch],
    [width - patch, height - patch],
  ];

  for (const [startX, startY] of corners) {
    let matching = 0;
    for (let y = startY; y < startY + patch; y += 1) {
      for (let x = startX; x < startX + patch; x += 1) {
        if (colorDistance(data, (y * width + x) * 4, color) <= tolerance) matching += 1;
      }
    }
    if (matching / (patch * patch) < 0.9) return null;
  }

  return color;
}

function connectedMask(data, width, height, color, tolerance) {
  const pixelCount = width * height;
  const mask = new Uint8Array(pixelCount);
  const queue = new Uint32Array(pixelCount);
  let head = 0;
  let tail = 0;

  const enqueue = (index) => {
    if (mask[index] || colorDistance(data, index * 4, color) > tolerance) return;
    mask[index] = 1;
    queue[tail] = index;
    tail += 1;
  };

  for (const index of perimeterIndexes(width, height)) enqueue(index);

  while (head < tail) {
    const index = queue[head];
    head += 1;
    const x = index % width;
    const y = Math.floor(index / width);
    if (x > 0) enqueue(index - 1);
    if (x + 1 < width) enqueue(index + 1);
    if (y > 0) enqueue(index - width);
    if (y + 1 < height) enqueue(index + width);
  }

  return { mask, count: tail };
}

async function analyzeImage(file, options) {
  const { data, info } = await sharp(file, { failOn: "none", limitInputPixels: false })
    .rotate()
    .resize({
      width: ANALYSIS_MAX_EDGE,
      height: ANALYSIS_MAX_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let offset = 3; offset < data.length; offset += 4) {
    if (data[offset] < 250) return { detected: false, reason: "already transparent" };
  }

  const color = candidateBackground(data, info.width, info.height, options.tolerance);
  if (!color) return { detected: false, reason: "no uniform light/dark perimeter" };

  const { count } = connectedMask(
    data,
    info.width,
    info.height,
    color,
    options.tolerance * 1.5,
  );
  const area = count / (info.width * info.height);
  if (area < options.minArea || area > options.maxArea) {
    return { detected: false, reason: `connected area ${(area * 100).toFixed(1)}%` };
  }

  return { detected: true, color, area };
}

async function writeTransparent(inputFile, outputFile, color, tolerance) {
  const { data, info } = await sharp(inputFile, { failOn: "none", limitInputPixels: false })
    .rotate()
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const softTolerance = tolerance * 2;
  const { mask } = connectedMask(data, info.width, info.height, color, softTolerance);

  for (let index = 0; index < mask.length; index += 1) {
    if (!mask[index]) continue;
    const offset = index * 4;
    const distance = colorDistance(data, offset, color);
    const opacity = Math.max(0, Math.min(1, (distance - tolerance) / tolerance));
    data[offset + 3] = Math.round(data[offset + 3] * opacity);
  }

  await mkdir(path.dirname(outputFile), { recursive: true });
  await sharp(data, { raw: info }).webp({ lossless: true, effort: 6 }).toFile(outputFile);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printUsage();
    return;
  }

  const images = await collectImages(options.inputDir);
  let detected = 0;

  for (const [index, file] of images.entries()) {
    const relative = path.relative(options.inputDir, file);
    const result = await analyzeImage(file, options);
    const prefix = `[${index + 1}/${images.length}]`;

    if (!result.detected) {
      console.log(`${prefix} skip   ${relative} (${result.reason})`);
      continue;
    }

    detected += 1;
    const description = `${(result.area * 100).toFixed(1)}% ${result.color.join(",")}`;
    if (!options.apply) {
      console.log(`${prefix} detect ${relative} (${description})`);
      continue;
    }

    const outputFile = path.join(
      options.outputDir,
      path.dirname(relative),
      `${path.parse(relative).name}.webp`,
    );
    await writeTransparent(file, outputFile, result.color, options.tolerance);
    console.log(`${prefix} write  ${relative} (${description})`);
  }

  console.log(
    `${options.apply ? "Wrote" : "Detected"} ${detected}/${images.length} image(s).${options.apply ? ` Output: ${options.outputDir}` : " No files changed."}`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
