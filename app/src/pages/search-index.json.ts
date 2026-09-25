import type { APIRoute } from "astro";
import { getCollection, getEntry } from "astro:content";
import { chapterHref, getOrderedChapters, subchapterHref } from "../lib/content";
import { markdownBodyToPlainText, markdownToPlainText } from "../lib/markdown";
import { findContentImage } from "../lib/object-images";
import type { SearchRecord } from "../lib/search";

export const prerender = true;

const plainInline = (value?: string) => markdownToPlainText(value).replace(/\s+/g, " ").trim();
const joinText = (values: Array<string | undefined>) => values.filter(Boolean).join(" ");

export const GET: APIRoute = async () => {
  const [chapters, objects] = await Promise.all([
    getOrderedChapters(),
    getCollection("objects"),
  ]);
  const records: SearchRecord[] = [];
  const indexedGalleryIds = new Set<string>();

  const addGallery = async (
    galleryReference: Parameters<typeof getEntry>[0],
    context: string,
    sectionHref: string,
  ) => {
    const gallery = await getEntry(galleryReference);
    if (!gallery || gallery.collection !== "galleries" || indexedGalleryIds.has(gallery.id)) return;
    indexedGalleryIds.add(gallery.id);

    const imageMetadata = await Promise.all(
      gallery.data.bilder.flat().map(async (reference) => {
        const image = await findContentImage(reference);
        if (!image?.entry) return "";

        return joinText([
          plainInline(image.entry.data.altText),
          plainInline(image.entry.data.beschriftung),
          plainInline(image.entry.data.nachweis),
        ]);
      }),
    );
    const slideCaptions = gallery.data.folienbeschriftungen.flatMap((slide) => [
      plainInline(slide.beschriftung),
      ...slide.unterbeschriftungen.map((caption) =>
        plainInline(typeof caption === "string" ? caption : caption.beschriftung),
      ),
    ]);

    records.push({
      id: `gallery:${gallery.id}`,
      kind: "gallery",
      title: plainInline(gallery.data.titel),
      subtitle: plainInline(gallery.data.untertitel),
      context,
      href: `${sectionHref}#gallery-${gallery.id}`,
      body: markdownBodyToPlainText(gallery.body),
      captions: joinText([
        plainInline(gallery.data.beschriftung),
        plainInline(gallery.data.folienbeschriftung),
        ...slideCaptions,
      ]),
      imageMetadata: joinText([...new Set(imageMetadata.filter(Boolean))]),
      creator: "",
      metadata: "",
      source: "",
    });
  };

  for (const chapter of chapters) {
    const chapterContext = `${Number(chapter.data.nummer)}. ${plainInline(chapter.data.navTitel)}`;

    for (const galleryReference of chapter.data.galerien ?? []) {
      await addGallery(galleryReference, chapterContext, chapterHref(chapter.data.nummer));
    }

    for (const subchapterReference of chapter.data.unterkapitel ?? []) {
      const subchapter = await getEntry(subchapterReference);
      if (!subchapter || subchapter.collection !== "subchapters") continue;

      const context = `${chapterContext} / ${subchapter.data.nummer} ${plainInline(subchapter.data.navTitel)}`;
      const href = subchapterHref(chapter.data.nummer, subchapter.data.nummer);
      for (const galleryReference of subchapter.data.galerien) {
        await addGallery(galleryReference, context, href);
      }
    }
  }

  for (const object of objects) {
    records.push({
      id: `object:${object.id}`,
      kind: "object",
      title: plainInline(object.data.titel),
      subtitle: plainInline(object.data.untertitel),
      context: "OBJEKT",
      href: `/objekte/${object.data.slug}/`,
      body: markdownBodyToPlainText(object.body),
      captions: "",
      imageMetadata: "",
      creator: plainInline(object.data.urheber),
      metadata: joinText([
        plainInline(object.data.datierung),
        plainInline(object.data.materialTechnik),
        plainInline(object.data.institution),
        plainInline(object.data.inventarnummer),
      ]),
      source: plainInline(object.data.quelle),
    });
  }

  return Response.json(records, {
    headers: {
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
};
