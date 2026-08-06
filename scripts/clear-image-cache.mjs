import { rm } from "node:fs/promises";

const imageCache = new URL("../node_modules/.astro/assets/", import.meta.url);

await rm(imageCache, { recursive: true, force: true });
console.log("Cleared Astro image cache.");
