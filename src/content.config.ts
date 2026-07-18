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

const galleryColor = z
  .enum(["lindgrün", "vanille", "hellblau", "mintgrün", "rosa", "himmelblau", "salbeigrün"])
  .default("lindgrün");

const sectionSchema = z.object({
  nummer: z.string().min(1),
  titel: requiredMarkdown,
  navTitel: requiredMarkdown,
  hero: reference("images"),
});

const chapters = defineCollection({
  loader: glob({ base: "./src/content/chapters", pattern: "**/*.md" }),
  schema: sectionSchema
    .extend({
      reihenfolge: z.number().int().positive(),
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
  schema: sectionSchema.extend({
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
    bilder: z.array(reference("images")).min(1),
  }),
});

const images = defineCollection({
  loader: glob({ base: "./src/content/images", pattern: "**/*.md" }),
  schema: z.object({
    dateiname: z.string().regex(/\.(avif|gif|jpe?g|png|webp)$/i, {
      message: "Image dateiname must end with a supported image extension",
    }),
    altText: optionalMarkdown,
    beschriftung: optionalMarkdown,
    nachweis: optionalMarkdown,
    objekte: z.array(reference("objects")).optional(),
  }),
});

const objects = defineCollection({
  loader: glob({ base: "./src/content/objects", pattern: "**/*.md" }),
  schema: z
    .object({
      slug: z.string().optional(),
      titel: z.string().optional(),
      untertitel: z.string().optional(),
      urheber: z.string().optional(),
      datierung: z.string().optional(),
      materialTechnik: z.string().optional(),
      institution: z.string().optional(),
      inventarnummer: z.string().optional(),
    })
    .superRefine((data, context) => {
      const fields = Object.entries(data);

      // Generated templates remain valid until an object has been populated.
      if (fields.every(([, value]) => !value?.trim())) {
        return;
      }

      if (!data.slug?.trim()) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Slug is required", path: ["slug"] });
      } else if (!urlSafeAsciiSlug.safeParse(data.slug).success) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Slug must use only ASCII letters, digits, and hyphens", path: ["slug"] });
      }

      if (!data.titel?.trim()) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Title is required", path: ["titel"] });
      }

      for (const field of ["untertitel", "urheber", "datierung", "materialTechnik", "institution", "inventarnummer"] as const) {
        if (data[field] !== undefined && !data[field].trim()) {
          context.addIssue({ code: z.ZodIssueCode.custom, message: "Optional field must not be empty when provided", path: [field] });
        }
      }
    }),
});

export const collections = {
  chapters,
  subchapters,
  galleries,
  images,
  objects,
};
