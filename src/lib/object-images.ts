import type { ImageMetadata } from "astro";
import { getImage } from "astro:assets";

const objectImageModules = import.meta.glob("../assets/objects/*.{avif,gif,jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
}) as Record<string, ImageMetadata>;

export const getObjectImage = (dateiname: string) => {
  const image = objectImageModules[`../assets/objects/${dateiname}`];

  if (!image) {
    throw new Error(`Missing object image asset: ${dateiname}`);
  }

  return image;
};

const galleryWidths = [480, 768, 1060, 1440, 2120];

export type GalleryImageSource = {
  src: string;
  srcset: string;
  sizes: string;
  peekSrc: string;
};

export const getGalleryImageSource = async (image: ImageMetadata): Promise<GalleryImageSource> => {
  const widths = galleryWidths.filter((width) => width < image.width);
  widths.push(Math.min(image.width, galleryWidths.at(-1) ?? image.width));

  const variants = await Promise.all(
    [...new Set(widths)].map(async (width) => ({
      width,
      image: await getImage({ src: image, width, format: "webp", quality: 85 }),
    })),
  );

  return {
    src: variants.at(-1)?.image.src ?? image.src,
    srcset: variants.map((variant) => `${variant.image.src} ${variant.width}w`).join(", "),
    sizes: "(min-width: 1440px) 1060px, (min-width: 768px) calc(100vw - 184px), calc(100vw - 80px)",
    peekSrc: variants[0]?.image.src ?? image.src,
  };
};
