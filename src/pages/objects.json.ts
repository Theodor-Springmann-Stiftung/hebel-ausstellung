import type { APIRoute } from "astro";
import { getObjectOverview } from "../lib/object-overview";

export const prerender = true;

export const GET: APIRoute = async () => {
  const objects = (await getObjectOverview()).map(({ markdown, ...object }) => ({
    ...object,
    titel: markdown.titel,
    usages: markdown.usages,
    metadata: markdown.metadata,
    imageData: markdown.imageData,
    systemData: markdown.systemData,
  }));

  return new Response(`${JSON.stringify({ count: objects.length, objects }, null, 2)}\n`, {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
