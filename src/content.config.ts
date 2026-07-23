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

const galleryColor = z
  .enum(["lindgrün", "vanille", "hellblau", "mintgrün", "rosa", "himmelblau", "salbeigrün"])
  .default("lindgrün");

const sectionFields = {
  nummer: z.string().min(1),
  titel: requiredMarkdown,
  navTitel: requiredMarkdown,
};

const homepageImageVariant = z.enum(["featured", "poet", "friend", "theologian", "proteuser", "bachelor", "letter-writer"]);
const imageReference = z.string().min(1);
const contentFileId = ({ entry }: { entry: string }) => entry.replace(/\.[^.]+$/, "");

const chapters = defineCollection({
  loader: glob({ base: "./src/content/chapters", pattern: "**/*.md" }),
  schema: z
    .object({
      ...sectionFields,
      reihenfolge: z.number().int().positive(),
      hero: imageReference,
      startseitenBild: z.string().regex(/\.(avif|gif|jpe?g|png|webp)$/i),
      startseitenAltText: z.string().optional(),
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
    hero: imageReference,
    galerien: z.array(reference("galleries")).min(1),
  }),
});

const galleries = defineCollection({
  loader: glob({ base: "./src/content/galleries", pattern: "**/*.md" }),
  schema: z.object({
    titel: requiredMarkdown,
    beschriftung: optionalMarkdown,
    untertitel: optionalMarkdown,
    farbe: galleryColor,
    bilder: z.array(imageReference).min(1),
  }),
});

const images = defineCollection({
  loader: glob({ base: "./src/content/images", pattern: "**/*.md" }),
  schema: z
    .object({
      dateiname: z.string().regex(/\.(avif|gif|jpe?g|png|webp)$/i, {
        message: "Image dateiname must end with a supported image extension",
      }).optional(),
      altText: optionalMarkdown,
      beschriftung: optionalMarkdown,
      nachweis: optionalMarkdown,
      objekte: z.array(reference("objects")).optional(),
      objektPositionen: z.array(z.enum(["Links", "Rechts", "Vorne"])).optional(),
    })
    .superRefine((data, context) => {
      if (data.objektPositionen && data.objektPositionen.length !== data.objekte?.length) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Object positions must match the number and order of objects",
          path: ["objektPositionen"],
        });
      }
    }),
});

const objects = defineCollection({
  loader: glob({ base: "./src/content/objects", pattern: "**/*.md", generateId: contentFileId }),
  schema: z
    .object({
      slug: objectSlug,
      position: z.enum(["Links", "Rechts", "Vorne"]).optional(),
      titel: requiredMarkdown,
      untertitel: optionalMarkdown,
      urheber: optionalMarkdown,
      datierung: optionalMarkdown,
      materialTechnik: optionalMarkdown,
      institution: optionalMarkdown,
      inventarnummer: optionalMarkdown,
    }),
});

export const collections = {
  chapters,
  subchapters,
  galleries,
  images,
  objects,
};
