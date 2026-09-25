import { getCollection, getEntry, type CollectionEntry } from "astro:content";
import {
  chapterHref,
  getObjectRelationshipsByImage,
  getOrderedChapters,
  subchapterHref,
} from "./content";
import { resolveContentImage } from "./object-images";

export type ObjectUsageCaption = {
  label: "Folie" | "Bild" | "Nachweis";
  text: string;
};

export type ObjectUsage = {
  key: string;
  type: "Hero" | "Galerie" | "Startseite" | "Über";
  href: string;
  page: string;
  context?: string;
  slide?: number;
  image?: number;
  captions: ObjectUsageCaption[];
};

const addUsage = (usagesByObject: Map<string, ObjectUsage[]>, objectId: string, usage: ObjectUsage) => {
  const usages = usagesByObject.get(objectId) ?? [];
  if (!usages.some((existing) => existing.key === usage.key)) usages.push(usage);
  usagesByObject.set(objectId, usages);
};

const getPageLabel = (
  chapter: CollectionEntry<"chapters">,
  subchapter?: CollectionEntry<"subchapters">,
) => subchapter
  ? `Unterkapitel ${subchapter.data.nummer}: ${subchapter.data.navTitel}`
  : `Kapitel ${chapter.data.nummer}: ${chapter.data.navTitel}`;

const getHeroCaption = (section: CollectionEntry<"chapters"> | CollectionEntry<"subchapters">) => {
  const captions: ObjectUsageCaption[] = [];
  if (section.data.heroBeschriftung) captions.push({ label: "Bild", text: section.data.heroBeschriftung });
  if (section.data.heroNachweis) captions.push({ label: "Nachweis", text: section.data.heroNachweis });
  return captions;
};

export const getObjectUsagesById = async () => {
  const [chapters, galleries, relationshipsByImage] = await Promise.all([
    getOrderedChapters(),
    getCollection("galleries"),
    getObjectRelationshipsByImage(),
  ]);
  const galleryById = new Map(galleries.map((gallery) => [gallery.id, gallery]));
  const usagesByObject = new Map<string, ObjectUsage[]>();

  const recordHero = async (
    chapter: CollectionEntry<"chapters">,
    subchapter?: CollectionEntry<"subchapters">,
  ) => {
    const section = subchapter ?? chapter;
    const object = section.data.heroObject ? await getEntry(section.data.heroObject) : undefined;
    if (!object) return;

    const href = subchapter
      ? subchapterHref(chapter.data.nummer, subchapter.data.nummer)
      : chapterHref(chapter.data.nummer);
    addUsage(usagesByObject, object.id, {
      key: `hero:${section.id}`,
      type: "Hero",
      href,
      page: getPageLabel(chapter, subchapter),
      captions: getHeroCaption(section),
    });
  };

  const recordGalleries = async (
    chapter: CollectionEntry<"chapters">,
    galleryReferences: CollectionEntry<"chapters">["data"]["galerien"] | CollectionEntry<"subchapters">["data"]["galerien"],
    subchapter?: CollectionEntry<"subchapters">,
  ) => {
    const pageHref = subchapter
      ? subchapterHref(chapter.data.nummer, subchapter.data.nummer)
      : chapterHref(chapter.data.nummer);

    for (const [galleryIndex, galleryReference] of (galleryReferences ?? []).entries()) {
      const gallery = galleryById.get(galleryReference.id);
      if (!gallery) continue;

      for (const [slideIndex, slide] of gallery.data.folien.entries()) {
        const imageReferences = slide.bilder;

        for (const [imageIndex, imageReference] of imageReferences.entries()) {
          const image = await resolveContentImage(imageReference);
          const relationships = relationshipsByImage.get(image.asset.src) ?? [];

          for (const relationship of relationships) {
            const captions: ObjectUsageCaption[] = [];
            for (const caption of slide.beschriftungen) {
              if (!caption.objekt || caption.objekt.id === relationship.object.id) {
                captions.push({ label: "Folie", text: caption.text });
              }
            }
            if (slide.nachweis) captions.push({ label: "Nachweis", text: slide.nachweis });

            addUsage(usagesByObject, relationship.object.id, {
              key: `gallery:${gallery.id}:${slideIndex}:${imageIndex}:${relationship.object.id}`,
              type: "Galerie",
              href: `${pageHref}#${galleryIndex + 1}`,
              page: getPageLabel(chapter, subchapter),
              context: gallery.data.titel,
              slide: slideIndex + 1,
              image: imageReferences.length > 1 ? imageIndex + 1 : undefined,
              captions,
            });
          }
        }
      }
    }
  };

  for (const chapter of chapters) {
    await recordHero(chapter);
    await recordGalleries(chapter, chapter.data.galerien);

    for (const subchapterReference of chapter.data.unterkapitel ?? []) {
      const subchapter = await getEntry(subchapterReference);
      if (!subchapter) continue;
      await recordHero(chapter, subchapter);
      await recordGalleries(chapter, subchapter.data.galerien, subchapter);
    }
  }

  const independentObject = (await getCollection("objects")).find((object) => object.data.kapitelunabhaengig);
  if (independentObject) {
    addUsage(usagesByObject, independentObject.id, {
      key: "startseite",
      type: "Startseite",
      href: "/",
      page: "Startseite",
      captions: [{ label: "Bild", text: "Hebels Porträt nach dem Kupferstich von Johann Friedrich Müller (Ausschnitt)" }],
    });
    addUsage(usagesByObject, independentObject.id, {
      key: "ueber",
      type: "Über",
      href: "/ueber/",
      page: "Über die Ausstellung",
      captions: [{ label: "Bild", text: "Hebels Porträt nach dem Kupferstich von Johann Friedrich Müller (Ausschnitt)" }],
    });
  }

  return usagesByObject;
};
