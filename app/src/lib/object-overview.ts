import type { ImageMetadata } from "astro";
import { getImage } from "astro:assets";
import { getCollection } from "astro:content";
import { markdownBodyToPlainText, markdownToPlainText, renderInlineMarkdown } from "./markdown";
import { findContentImage, findObjectImage } from "./object-images";
import { getObjectUsagesById } from "./object-usages";

const preserveMarkdownUrls = (value = "") =>
  value.replace(/\[([^\]]+)]\(([^)]+)\)/g, "$1 ($2)");

const plainInline = (value?: string) =>
  value ? markdownToPlainText(preserveMarkdownUrls(value)).replace(/\s+/g, " ").trim() : "";

const plainBody = (value?: string) =>
  value ? markdownBodyToPlainText(preserveMarkdownUrls(value)) : "";

const usageOrder = (usage: { type: string; sectionNumber?: string }) => {
  if (usage.type === "Startseite") return [0];
  if (usage.type === "Über") return [1];
  if (usage.sectionNumber) return [2, ...usage.sectionNumber.split(".").map(Number)];
  return [3];
};

const compareOrder = (left: number[], right: number[]) => {
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const difference = (left[index] ?? -1) - (right[index] ?? -1);
    if (difference !== 0) return difference;
  }
  return 0;
};

export const getObjectOverview = async () => {
  const [objectEntries, usagesByObjectId] = await Promise.all([
    getCollection("objects"),
    getObjectUsagesById(),
  ]);

  return (await Promise.all(objectEntries.map(async (object) => {
    const associations = object.data.bilder ?? [];
    const displayImages: ImageMetadata[] = [];
    const seenImageSources = new Set<string>();

    for (const association of associations.filter((association) => association.inObjektansicht)) {
      const image = await findContentImage(association.bild);
      if (!image || seenImageSources.has(image.asset.src)) continue;
      seenImageSources.add(image.asset.src);
      displayImages.push(image.asset);
    }

    const fallbackImage = findObjectImage(object.id);
    if (displayImages.length === 0 && fallbackImage) displayImages.push(fallbackImage);

    const thumbnails = await Promise.all(displayImages.map(async (asset) => {
      const thumbnail = await getImage({ src: asset, width: Math.min(120, asset.width), format: "webp", quality: 70 });
      return {
        src: thumbnail.src,
        width: thumbnail.attributes.width,
        height: thumbnail.attributes.height,
      };
    }));
    const usagePairs = (usagesByObjectId.get(object.id) ?? []).map((usage) => {
      const page = plainInline(usage.page);
      const section = page.match(/^(?:Unterkapitel|Kapitel)\s+([^:]+):\s*(.+)$/);
      const markdownSection = usage.page.match(/^(?:Unterkapitel|Kapitel)\s+([^:]+):\s*(.+)$/);

      return {
        view: {
          ...usage,
          page: section?.[2] ?? page,
          sectionNumber: section?.[1],
          context: plainInline(usage.context),
          captions: usage.captions.map((caption) => ({ ...caption, text: plainInline(caption.text) })),
        },
        markdown: {
          ...usage,
          page: markdownSection?.[2] ?? usage.page,
          sectionNumber: markdownSection?.[1],
        },
      };
    }).sort((left, right) => compareOrder(usageOrder(left.view), usageOrder(right.view)));
    const usages = usagePairs.map(({ view }) => view);
    const metadata = [
      { label: "Urheber", value: object.data.urheber, markdown: object.data.urheber },
      { label: "Datum", value: object.data.datierung, markdown: object.data.datierung },
      { label: "Material und Technik", value: object.data.materialTechnik, markdown: object.data.materialTechnik },
      { label: "Institution", value: object.data.institution, markdown: object.data.institution },
      { label: "Inventarnummer", value: object.data.inventarnummer, markdown: object.data.inventarnummer },
      { label: "Quelle", value: object.data.quelle, markdown: object.data.quelle, wide: true },
      { label: "Lizenz", value: object.data.lizenz, markdown: object.data.lizenz, wide: true },
      { label: "Inhalt", value: plainBody(object.body), markdown: object.body, wide: true },
    ].filter(({ markdown }) => Boolean(markdown)).map(({ label, value, markdown, wide }) => ({
      label,
      text: plainInline(value),
      html: renderInlineMarkdown(value),
      markdown: markdown ?? "",
      wide,
    }));
    const imageData = associations.map((association, index) => ({
      label: `Bild ${index + 1}`,
      details: [
        { label: "Datei", value: association.bild },
        { label: "Position", value: association.position ?? "-" },
        { label: "Objektreihenfolge", value: String(association.objektReihenfolge ?? "-") },
        { label: "Beschriftung", value: plainInline(association.beschriftung) || "-" },
        { label: "In Objektansicht", value: association.inObjektansicht ? "Ja" : "Nein" },
      ],
    }));
    const systemData = [
      { label: "ID", value: object.id },
      { label: "Kapitelunabhängig", value: object.data.kapitelunabhaengig ? "Ja" : "Nein" },
      { label: "Transkription", value: object.data.transkription ? "Ja" : "Nein" },
      { label: "Transkriptionsart", value: object.data.transkriptionsart },
      { label: "Untertitel", value: plainInline(object.data.untertitel) || "-" },
    ];

    return {
      slug: object.data.slug,
      href: `/objekte/${object.data.slug}/`,
      thumbnails,
      usages,
      titel: plainInline(object.data.titel),
      metadata,
      imageData,
      systemData,
      markdown: {
        titel: object.data.titel,
        usages: usagePairs.map(({ markdown }) => markdown),
        metadata: metadata.map(({ label, markdown: text, wide }) => ({ label, text, wide })),
        imageData: associations.map((association, index) => ({
          label: `Bild ${index + 1}`,
          details: [
            { label: "Datei", value: association.bild },
            { label: "Position", value: association.position ?? "-" },
            { label: "Objektreihenfolge", value: String(association.objektReihenfolge ?? "-") },
            { label: "Beschriftung", value: association.beschriftung ?? "-" },
            { label: "In Objektansicht", value: association.inObjektansicht ? "Ja" : "Nein" },
          ],
        })),
        systemData: systemData.map((detail) => detail.label === "Untertitel"
          ? { ...detail, value: object.data.untertitel ?? "-" }
          : detail),
      },
    };
  }))).sort((left, right) => (
    compareOrder(usageOrder(left.usages[0] ?? { type: "Nicht verwendet" }), usageOrder(right.usages[0] ?? { type: "Nicht verwendet" }))
    || left.titel.localeCompare(right.titel, "de")
  ));
};
