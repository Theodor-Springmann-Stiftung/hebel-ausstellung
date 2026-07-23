import type { ImageMetadata } from "astro";
import { getImage } from "astro:assets";
import type { CollectionEntry } from "astro:content";
import { getEntry } from "astro:content";

const objectImageModules = import.meta.glob("../assets/objects/*.{avif,gif,jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
}) as Record<string, ImageMetadata>;

const assetByFilename = new Map<string, ImageMetadata>();
const assetByStem = new Map<string, ImageMetadata>();

for (const [assetPath, image] of Object.entries(objectImageModules)) {
  const filename = assetPath.split("/").at(-1) ?? assetPath;
  const stem = filename.replace(/\.[^.]+$/, "");
  assetByFilename.set(filename.toLowerCase(), image);
  assetByStem.set(stem.toLowerCase(), image);
}

export type ImageReference = string | { id: string };

export type ResolvedContentImage = {
  id: string;
  asset: ImageMetadata;
  entry?: CollectionEntry<"images">;
};

export type ObjectDisplayImage = {
  id: string;
  dateiname?: string;
  altText?: string;
};

export const imageReferenceId = (reference: ImageReference) => typeof reference === "string" ? reference : reference.id;

export const findObjectImage = (name: string) => {
  const filename = name.split("/").at(-1) ?? name;
  return assetByFilename.get(filename.toLowerCase()) ?? assetByStem.get(filename.replace(/\.(avif|gif|jpe?g|png|webp)$/i, "").toLowerCase());
};

export const getObjectImage = (name: string) => {
  const image = findObjectImage(name);

  if (!image) {
    throw new Error(`Missing object image asset matching: ${name}`);
  }

  return image;
};

export const resolveContentImage = async (reference: ImageReference): Promise<ResolvedContentImage> => {
  const id = imageReferenceId(reference);
  const entry = await getEntry("images", id);
  const asset = getObjectImage(entry?.data.dateiname ?? id);

  return { id, asset, entry };
};

const galleryWidths = [480, 768, 1060, 1440, 2120];
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
  const outputWidths = widths.filter((width) => width < image.width);
  outputWidths.push(Math.min(image.width, widths.at(-1) ?? image.width));

  const variants = await Promise.all(
    [...new Set(outputWidths)].map(async (width) => ({
      width,
      image: await getImage({ src: image, width, format: "webp", quality }),
    })),
  );

  return {
    src: variants.at(-1)?.image.src ?? image.src,
    srcset: variants.map((variant) => `${variant.image.src} ${variant.width}w`).join(", "),
    sizes,
    smallestSrc: variants[0]?.image.src ?? image.src,
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
    sizes: "(min-width: 1440px) 1060px, (min-width: 768px) calc(100vw - 184px), calc(100vw - 80px)",
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
