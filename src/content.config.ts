import { defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const requiredMarkdown = z.string().refine((value) => value.trim().length > 0, {
  message: "Required Markdown string must not be empty",
});

const optionalMarkdown = z
  .string()
  .refine((value) => value.trim().length > 0, {
    message: "Optional Markdown string must not be empty when provided",
  })
  .optional();

const urlSafeAsciiSlug = z.string().regex(/^[A-Za-z0-9-]+$/, {
  message: "Slug must use only ASCII letters, digits, and hyphens",
});
const objectSlug = urlSafeAsciiSlug.refine((slug) => !/^[1-7]-/.test(slug), {
  message: "Object slug must not start with a chapter number",
});

const gallerySlideCaption = z.object({
  folie: z.number().int().positive(),
  beschriftung: requiredMarkdown,
  unterbeschriftungen: z.array(z.union([
    requiredMarkdown,
    z.object({
      bild: z.number().int().positive(),
      beschriftung: requiredMarkdown,
    }),
  ])).default([]),
});

const sectionFields = {
  nummer: z.string().min(1),
  titel: requiredMarkdown,
  navTitel: requiredMarkdown,
  thumbnail: z.string().regex(/\.webp$/i, {
    message: "Thumbnail must be a WebP filename",
  }),
};

const homepageImageVariant = z.enum(["featured", "poet", "friend", "theologian", "proteuser", "bachelor", "letter-writer"]);
const imageReference = z.string().min(1);
const objectImageAssociation = z.object({
  bild: imageReference,
  position: z.enum(["Links", "Rechts", "Vorne"]).optional(),
  objektReihenfolge: z.number().int().positive().optional(),
  beschriftung: optionalMarkdown,
  inObjektansicht: z.boolean().default(true),
});
const contentFileId = ({ entry }: { entry: string }) => entry.replace(/\.[^.]+$/, "");

const chapters = defineCollection({
  loader: glob({ base: "./src/content/chapters", pattern: "**/*.md" }),
  schema: z
    .object({
      ...sectionFields,
      reihenfolge: z.number().int().positive(),
      hero: z.string().regex(/\.webp$/i, { message: "Hero must be a WebP filename" }),
      heroMetadata: imageReference.optional(),
      startseitenVariante: homepageImageVariant,
      unterkapitel: z.array(reference("subchapters")).min(1).optional(),
      galerien: z.array(reference("galleries")).min(1).optional(),
    })
    .superRefine((data, context) => {
      const hasSubchapters = Boolean(data.unterkapitel?.length);
      const hasGalleries = Boolean(data.galerien?.length);

      if (hasSubchapters === hasGalleries) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Chapter must define either subchapters or galleries, but not both",
          path: ["unterkapitel"],
        });
      }
    }),
});

const subchapters = defineCollection({
  loader: glob({ base: "./src/content/subchapters", pattern: "**/*.md" }),
  schema: z.object({
    ...sectionFields,
    hero: z.string().regex(/\.webp$/i, { message: "Hero must be a WebP filename" }),
    heroMetadata: imageReference.optional(),
    galerien: z.array(reference("galleries")).min(1),
  }),
});

const galleries = defineCollection({
  loader: glob({ base: "./src/content/galleries", pattern: "**/*.md" }),
  schema: z.object({
    titel: requiredMarkdown,
    beschriftung: optionalMarkdown,
    untertitel: optionalMarkdown,
    folienbeschriftung: optionalMarkdown,
    folienbeschriftungen: z.array(gallerySlideCaption).default([]),
    bildabstand: z.enum(["normal", "weit"]).default("normal"),
    positionsangaben: z.boolean().default(true),
    bilder: z.array(z.array(imageReference).min(1)).min(1),
  }),
});

const images = defineCollection({
  loader: glob({ base: "./src/content/images", pattern: "**/*.md" }),
  schema: z.object({
    dateiname: z.string().regex(/^(Bilder|Heroes|Meta)\/.+\.(avif|gif|jpe?g|png|webp)$/i, {
      message: "Image dateiname must be a complete path relative to src/assets",
    }).optional(),
    altText: optionalMarkdown,
    beschriftung: optionalMarkdown,
    nachweis: optionalMarkdown,
  }),
});

const objects = defineCollection({
  loader: glob({ base: "./src/content/objects", pattern: "**/*.md", generateId: contentFileId }),
  schema: z
    .object({
      slug: objectSlug,
      transkription: z.boolean().default(false),
      transkriptionsart: z.enum(["Transkription", "Übersetzung"]).default("Transkription"),
      titel: requiredMarkdown,
      untertitel: optionalMarkdown,
      urheber: optionalMarkdown,
      datierung: optionalMarkdown,
      materialTechnik: optionalMarkdown,
      institution: optionalMarkdown,
      inventarnummer: optionalMarkdown,
      quelle: optionalMarkdown,
      bilder: z.array(objectImageAssociation).min(1).optional(),
    }),
});

export const collections = {
  chapters,
  subchapters,
  galleries,
  images,
  objects,
};
