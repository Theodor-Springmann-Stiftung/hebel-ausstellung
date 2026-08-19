import { marked } from "marked";

const scriptElement = /<script\b[^>]*>[\s\S]*?<\/script\s*>|<script\b[^>]*\/?>/gi;
const ariaLabelElement = /<[^>]*\baria-label=(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>\s*<\/[^>]+>/gi;

export const renderInlineMarkdown = (value = "") =>
  marked.parseInline(value, { async: false }).replace(scriptElement, "");

export const markdownToPlainText = (value = "") =>
  value
    .replace(ariaLabelElement, (_element, doubleQuoted, singleQuoted, unquoted) =>
      (doubleQuoted ?? singleQuoted ?? unquoted ?? "").replace(/&#(?:32|x20);/gi, " "),
    )
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]*>/g, "")
    .replace(/[*_~`]/g, "");

export const serializeForScript = (value: unknown) =>
  JSON.stringify(value).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
