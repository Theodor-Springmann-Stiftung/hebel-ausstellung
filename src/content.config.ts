import { defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const noteSchema = z.object({
  label: z.string().optional(),
  text: z.string(),
});

const imageSchema = z.object({
  filename: z.string(),
  alt: z.string().optional(),
  credit: z.string().optional(),
  caption: z.string().optional(),
});

const chapters = defineCollection({
  loader: glob({ base: "./src/content/chapters", pattern: "**/*.md" }),
  schema: z.object({
    slug: z.string(),
    order: z.number().int().positive(),
    title: z.string(),
    shortTitle: z.string().optional(),
    subchapters: z.array(reference("subchapters")).default([]),
  }),
});

const subchapters = defineCollection({
  loader: glob({ base: "./src/content/subchapters", pattern: "**/*.md" }),
  schema: z.object({
    slug: z.string(),
    chapter: reference("chapters"),
    order: z.number().int().positive(),
    title: z.string(),
    kicker: z.string(),
    hero: imageSchema.optional(),
    galleries: z.array(reference("galleries")).default([]),
    notes: z.array(noteSchema).default([]),
  }),
});

const galleries = defineCollection({
  loader: glob({ base: "./src/content/galleries", pattern: "**/*.md" }),
  schema: z.object({
    slug: z.string(),
    subchapter: reference("subchapters"),
    order: z.number().int().positive(),
    title: z.string(),
    objects: z.array(
      z.object({
        object: reference("objects"),
        captionTitle: z.string().optional(),
        captionOverride: z.string().optional(),
        imageOverride: imageSchema.partial().optional(),
      }),
    ),
    crossReferences: z.array(reference("objects")).default([]),
    notes: z.array(noteSchema).default([]),
  }),
});

const objects = defineCollection({
  loader: glob({ base: "./src/content/objects", pattern: "**/*.md" }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    creator: z.string().optional(),
    date: z.string().optional(),
    holdingInstitution: z.string().optional(),
    inventoryId: z.string().optional(),
    description: z.string().optional(),
    image: imageSchema,
    relatedObjects: z.array(reference("objects")).default([]),
    notes: z.array(noteSchema).default([]),
  }),
});

export const collections = {
  chapters,
  subchapters,
  galleries,
  objects,
};
