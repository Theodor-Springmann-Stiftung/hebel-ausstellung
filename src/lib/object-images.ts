import type { ImageMetadata } from "astro";

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
