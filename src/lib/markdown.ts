import { marked } from "marked";

const scriptElement = /<script\b[^>]*>[\s\S]*?<\/script\s*>|<script\b[^>]*\/?>/gi;

export const renderInlineMarkdown = (value = "") =>
  marked.parseInline(value, { async: false }).replace(scriptElement, "");

export const markdownToPlainText = (value = "") =>
  value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]*>/g, "")
    .replace(/[*_~`]/g, "");

export const serializeForScript = (value: unknown) =>
  JSON.stringify(value).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
