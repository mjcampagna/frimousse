const SURROUNDING_COLONS_PATTERN = /^:+|:+$/g;
const WHITESPACE_PATTERN = /\s+/g;
const INTERNAL_HYPHEN_PATTERN = /(?<=\w)-(?=\w)/g;

export function normalizeShortcode(value: string): string {
  const normalized = value
    .trim()
    .replace(SURROUNDING_COLONS_PATTERN, "")
    .toLowerCase()
    .replace(WHITESPACE_PATTERN, "_")
    .replace(INTERNAL_HYPHEN_PATTERN, "_");

  return `:${normalized}:`;
}
