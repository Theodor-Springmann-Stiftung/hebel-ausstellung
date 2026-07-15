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

const sectionSchema = z.object({
  number: z.string().min(1),
  title: requiredMarkdown,
  navTitle: requiredMarkdown,
  heroImage: reference("images"),
});

const chapters = defineCollection({
  loader: glob({ base: "./src/content/chapters", pattern: "**/*.md" }),
  schema: sectionSchema
    .extend({
      order: z.number().int().positive(),
      subchapters: z.array(reference("subchapters")).min(1).optional(),
      galleries: z.array(reference("galleries")).min(1).optional(),
    })
    .superRefine((data, context) => {
      const hasSubchapters = Boolean(data.subchapters?.length);
      const hasGalleries = Boolean(data.galleries?.length);

      if (hasSubchapters === hasGalleries) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Chapter must define either subchapters or galleries, but not both",
          path: ["subchapters"],
        });
      }
    }),
});

const subchapters = defineCollection({
  loader: glob({ base: "./src/content/subchapters", pattern: "**/*.md" }),
  schema: sectionSchema.extend({
    galleries: z.array(reference("galleries")).min(1),
  }),
});

const galleries = defineCollection({
  loader: glob({ base: "./src/content/galleries", pattern: "**/*.md" }),
  schema: z.object({
    title: requiredMarkdown,
    caption: optionalMarkdown,
    subCaption: optionalMarkdown,
    images: z.array(reference("images")).min(1),
  }),
});

const images = defineCollection({
  loader: glob({ base: "./src/content/images", pattern: "**/*.md" }),
  schema: z.object({
    fileName: z.string().regex(/\.(avif|gif|jpe?g|png|webp)$/i, {
      message: "Image fileName must end with a supported image extension",
    }),
    altText: optionalMarkdown,
    caption: optionalMarkdown,
    credits: optionalMarkdown,
    objects: z.array(reference("objects")).optional(),
  }),
});

const objects = defineCollection({
  loader: glob({ base: "./src/content/objects", pattern: "**/*.md" }),
  schema: z.object({
    slug: z.string().min(1),
    title: requiredMarkdown,
    urheber: optionalMarkdown,
    date: z.string().min(1).optional(),
    materialTechnik: z.string().min(1).optional(),
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
