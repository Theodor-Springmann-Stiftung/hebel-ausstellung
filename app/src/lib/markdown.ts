import { marked } from "marked";

const scriptElement = /<script\b[^>]*>[\s\S]*?<\/script\s*>|<script\b[^>]*\/?>/gi;
const ariaLabelElement = /<[^>]*\baria-label=(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>\s*<\/[^>]+>/gi;
const namedHtmlEntities = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
} as const;

const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&#(\d+);/g, (_entity, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_entity, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&(amp|apos|gt|lt|nbsp|quot);/g, (_entity, name: keyof typeof namedHtmlEntities) => namedHtmlEntities[name]);

export const renderInlineMarkdown = (value = "") =>
  marked.parseInline(value, { async: false }).replace(scriptElement, "");

export const markdownToPlainText = (value = "") =>
  decodeHtmlEntities(value)
    .replace(ariaLabelElement, (_element, doubleQuoted, singleQuoted, unquoted) =>
      (doubleQuoted ?? singleQuoted ?? unquoted ?? "").replace(/&#(?:32|x20);/gi, " "),
    )
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]*>/g, "")
    .replace(/[*_~`]/g, "");

export const markdownBodyToPlainText = (value = "") =>
  markdownToPlainText(marked.parse(value, { async: false }))
    .replace(/\s+/g, " ")
    .trim();

export const serializeForScript = (value: unknown) =>
  JSON.stringify(value).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
