import { getEntry, type CollectionEntry } from "astro:content";
import { objectHref } from "./content";
import { renderInlineMarkdown } from "./markdown";

type GalleryCaption = CollectionEntry<"galleries">["data"]["folien"][number]["beschriftungen"][number];
type Section = CollectionEntry<"chapters"> | CollectionEntry<"subchapters">;

export type RenderedCaption = {
  titleHtml: string;
  href?: string;
  linkLabel?: string;
};

export const renderGalleryCaption = async (caption: GalleryCaption): Promise<RenderedCaption> => {
  const object = caption.objekt ? await getEntry(caption.objekt) : undefined;
  return {
    titleHtml: renderInlineMarkdown(caption.text),
    href: object ? objectHref(object.data.slug, {
      position: caption.position,
      imageKey: caption.objektBild,
    }) : undefined,
    linkLabel: object
      ? object.data.transkription ? `Zum Objekt (mit ${object.data.transkriptionsart})` : "Zum Objekt"
      : undefined,
  };
};

export const getHeroObjectHref = async (section: Section) => {
  const object = section.data.heroObject ? await getEntry(section.data.heroObject) : undefined;
  return object ? objectHref(object.data.slug, { imageKey: section.data.heroObjektBild }) : undefined;
};
