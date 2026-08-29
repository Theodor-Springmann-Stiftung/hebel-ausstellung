import type { ImageMetadata } from "astro";
import { getImage } from "astro:assets";
import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";

const objectImageModules = import.meta.glob("../assets/{Bilder,Heroes,Meta}/**/*.{avif,gif,jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
}) as Record<string, ImageMetadata>;

const thumbnailModules = import.meta.glob("../assets/Thumbnails/*.{avif,gif,jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
}) as Record<string, ImageMetadata>;

const heroModules = import.meta.glob("../assets/Heroes/*.{avif,gif,jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
}) as Record<string, ImageMetadata>;

const assetByPath = new Map<string, ImageMetadata>();
const assetByFilename = new Map<string, ImageMetadata>();
const assetByStem = new Map<string, ImageMetadata>();
const thumbnailByFilename = new Map<string, ImageMetadata>();
const heroByFilename = new Map<string, ImageMetadata>();

for (const [assetPath, image] of Object.entries(objectImageModules)) {
  const filename = assetPath.split("/").at(-1) ?? assetPath;
  const stem = filename.replace(/\.[^.]+$/, "");
  const relativePath = assetPath.replace(/^\.\.\/assets\//, "").toLowerCase();
  assetByPath.set(relativePath, image);
  if (!assetByFilename.has(filename.toLowerCase())) assetByFilename.set(filename.toLowerCase(), image);
  if (!assetByStem.has(stem.toLowerCase())) assetByStem.set(stem.toLowerCase(), image);
}

for (const [assetPath, image] of Object.entries(thumbnailModules)) {
  const filename = assetPath.split("/").at(-1) ?? assetPath;
  thumbnailByFilename.set(filename.toLowerCase(), image);
}

for (const [assetPath, image] of Object.entries(heroModules)) {
  const filename = assetPath.split("/").at(-1) ?? assetPath;
  heroByFilename.set(filename.toLowerCase(), image);
}

export type ImageReference = string | { id: string };

export type ResolvedContentImage = {
  id: string;
  asset: ImageMetadata;
  entry?: CollectionEntry<"images">;
};

export type ObjectDisplayImage = {
  key: string;
  id: string;
  dateiname?: string;
  altText?: string;
  returnContext?: ObjectReturnContext;
};

export type ObjectReturnContext = {
  href: string;
  label: string;
};

export const imageReferenceId = (reference: ImageReference) => typeof reference === "string" ? reference : reference.id;

export const findObjectImage = (name: string) => {
  const normalizedName = name.replace(/^\.?\/?/, "").toLowerCase();
  const filename = normalizedName.split("/").at(-1) ?? normalizedName;
  return assetByPath.get(normalizedName)
    ?? assetByFilename.get(filename)
    ?? assetByStem.get(filename.replace(/\.(avif|gif|jpe?g|png|webp)$/i, ""));
};

export const getThumbnailImage = (name: string) => {
  const filename = name.split("/").at(-1)?.toLowerCase() ?? name.toLowerCase();
  const image = thumbnailByFilename.get(filename);

  if (!image) {
    throw new Error(`Missing thumbnail image asset matching: ${name}`);
  }

  return image;
};

export const getDedicatedHeroImage = (name: string) => {
  const filename = name.split("/").at(-1)?.toLowerCase() ?? name.toLowerCase();
  const image = heroByFilename.get(filename);

  if (!image) {
    throw new Error(`Missing hero image asset matching: ${name}`);
  }

  return image;
};

export const getObjectImage = (name: string) => {
  const image = findObjectImage(name);

  if (!image) {
    throw new Error(`Missing object image asset matching: ${name}`);
  }

  return image;
};

let imageEntriesByIdPromise: Promise<Map<string, CollectionEntry<"images">>> | undefined;

const getImageEntriesById = () => {
  imageEntriesByIdPromise ??= getCollection("images").then((entries) => {
    const entriesById = new Map<string, CollectionEntry<"images">>();

    for (const entry of entries) {
      entriesById.set(entry.id, entry);
      entriesById.set(entry.id.toLowerCase(), entry);
      entriesById.set(entry.id.toLowerCase().replaceAll(".", ""), entry);
    }

    for (const entry of entries) {
      if (!entry.data.dateiname) continue;

      const filename = entry.data.dateiname.toLowerCase();
      const stem = filename.replace(/\.[^.]+$/, "");
      if (!entriesById.has(filename)) entriesById.set(filename, entry);
      if (!entriesById.has(stem)) entriesById.set(stem, entry);
    }

    return entriesById;
  });

  return imageEntriesByIdPromise;
};

export const findContentImage = async (reference: ImageReference): Promise<ResolvedContentImage | undefined> => {
  const id = imageReferenceId(reference);
  const entriesById = await getImageEntriesById();
  const entry = entriesById.get(id) ?? entriesById.get(id.toLowerCase()) ?? entriesById.get(id.toLowerCase().replaceAll(".", ""));
  const asset = findObjectImage(entry?.data.dateiname ?? id);

  return asset ? { id, asset, entry } : undefined;
};

export const resolveContentImage = async (reference: ImageReference): Promise<ResolvedContentImage> => {
  const image = await findContentImage(reference);

  if (!image) {
    throw new Error(`Missing object image asset matching: ${imageReferenceId(reference)}`);
  }

  return image;
};

const galleryWidths = [480, 768, 1060, 1440, 2120, 2752];
const navigationWidths = [320, 480, 640, 800, 1060, 1280];
const heroWidths = [480, 768, 1024, 1440, 1920, 2560, 3200, 3840];

export type ResponsiveImageSource = {
  src: string;
  srcset: string;
  sizes: string;
  smallestSrc: string;
};

const getResponsiveImageSource = async (
  image: ImageMetadata,
  { widths, sizes, quality }: { widths: number[]; sizes: string; quality: number },
): Promise<ResponsiveImageSource> => {
  const devCacheKey = import.meta.env.DEV ? Date.now().toString(36) : undefined;
  const imageUrl = (src: string) => devCacheKey
    ? `${src}${src.includes("?") ? "&" : "?"}dev=${devCacheKey}`
    : src;
  const outputWidths = widths.filter((width) => width < image.width);
  outputWidths.push(Math.min(image.width, widths.at(-1) ?? image.width));

  const variants = await Promise.all(
    [...new Set(outputWidths)].map(async (width) => ({
      width,
      image: await getImage({ src: image, width, format: "webp", quality }),
    })),
  );

  return {
    src: imageUrl(variants.at(-1)?.image.src ?? image.src),
    srcset: variants.map((variant) => `${imageUrl(variant.image.src)} ${variant.width}w`).join(", "),
    sizes,
    smallestSrc: imageUrl(variants[0]?.image.src ?? image.src),
  };
};

export type GalleryImageSource = {
  src: string;
  srcset: string;
  sizes: string;
  peekSrc: string;
};

export const getGalleryImageSource = async (image: ImageMetadata): Promise<GalleryImageSource> => {
  const source = await getResponsiveImageSource(image, {
    widths: galleryWidths,
    sizes: "(min-width: 1440px) 1376px, (min-width: 768px) calc(100vw - 184px), calc(100vw - 80px)",
    quality: 85,
  });

  return {
    src: source.src,
    srcset: source.srcset,
    sizes: source.sizes,
    peekSrc: source.smallestSrc,
  };
};

export const getNavigationImageSource = (image: ImageMetadata, sizes: string) =>
  getResponsiveImageSource(image, { widths: navigationWidths, sizes, quality: 76 });

export const getHeroImageSource = (image: ImageMetadata) =>
  getResponsiveImageSource(image, { widths: heroWidths, sizes: "100vw", quality: 72 });
