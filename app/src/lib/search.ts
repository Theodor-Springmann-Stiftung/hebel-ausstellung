export type SearchRecord = {
  id: string;
  kind: "gallery" | "object";
  title: string;
  subtitle: string;
  context: string;
  href: string;
  body: string;
  captions: string;
  imageMetadata: string;
  creator: string;
  metadata: string;
  source: string;
};

export const normalizeSearchText = (value: string) =>
  value.toLocaleLowerCase("de-DE").normalize("NFC");
