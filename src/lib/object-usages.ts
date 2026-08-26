import { getCollection, getEntry, type CollectionEntry } from "astro:content";
import {
  chapterHref,
  getObjectRelationshipsByImage,
  getOrderedChapters,
  subchapterHref,
} from "./content";
import { resolveContentImage } from "./object-images";

export type ObjectUsageCaption = {
  label: "Galerie" | "Folie" | "Bild" | "Objekt" | "Nachweis";
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

const getHeroObject = async (
  section: CollectionEntry<"chapters"> | CollectionEntry<"subchapters">,
  relationshipsByImage: Awaited<ReturnType<typeof getObjectRelationshipsByImage>>,
) => {
  if (section.data.heroObject) return getEntry(section.data.heroObject);
  if (!section.data.heroMetadata) return undefined;

  const image = await resolveContentImage(section.data.heroMetadata);
  return relationshipsByImage.get(image.asset.src)?.find((relationship) => relationship.object.data.slug)?.object;
};

const getHeroCaption = async (section: CollectionEntry<"chapters"> | CollectionEntry<"subchapters">) => {
  if (!section.data.heroMetadata) return [];
  const image = await resolveContentImage(section.data.heroMetadata);
  const captions: ObjectUsageCaption[] = [];

  if (image.entry?.data.beschriftung) captions.push({ label: "Bild", text: image.entry.data.beschriftung });
  if (image.entry?.data.nachweis) captions.push({ label: "Nachweis", text: image.entry.data.nachweis });
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
    const object = await getHeroObject(section, relationshipsByImage);
    if (!object) return;

    const href = subchapter
      ? subchapterHref(chapter.data.nummer, subchapter.data.nummer)
      : chapterHref(chapter.data.nummer);
    addUsage(usagesByObject, object.id, {
      key: `hero:${section.id}`,
      type: "Hero",
      href,
      page: getPageLabel(chapter, subchapter),
      captions: await getHeroCaption(section),
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

      for (const [slideIndex, imageReferences] of gallery.data.bilder.entries()) {
        const slideCaption = gallery.data.folienbeschriftungen.find((caption) => caption.folie === slideIndex + 1);

        for (const [imageIndex, imageReference] of imageReferences.entries()) {
          const image = await resolveContentImage(imageReference);
          const relationships = relationshipsByImage.get(image.asset.src) ?? [];

          for (const relationship of relationships) {
            const captions: ObjectUsageCaption[] = [];
            if (gallery.data.beschriftung) captions.push({ label: "Galerie", text: gallery.data.beschriftung });
            if (slideCaption?.beschriftung ?? gallery.data.folienbeschriftung) {
              captions.push({ label: "Folie", text: slideCaption?.beschriftung ?? gallery.data.folienbeschriftung ?? "" });
            }

            for (const undercaption of slideCaption?.unterbeschriftungen ?? []) {
              if (typeof undercaption === "string" || undercaption.bild === imageIndex + 1) {
                captions.push({
                  label: "Bild",
                  text: typeof undercaption === "string" ? undercaption : undercaption.beschriftung,
                });
              }
            }
            if (image.entry?.data.beschriftung && !captions.some((caption) => caption.text === image.entry?.data.beschriftung)) {
              captions.push({ label: "Bild", text: image.entry.data.beschriftung });
            }

            if (relationship.beschriftung) captions.push({ label: "Objekt", text: relationship.beschriftung });
            if (image.entry?.data.nachweis) captions.push({ label: "Nachweis", text: image.entry.data.nachweis });

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
