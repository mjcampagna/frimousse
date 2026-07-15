import type {
  NativeEmojiSearchTermMap,
  NativeEmojiShortcodeEntry,
} from "./types";

const VARIATION_SELECTOR_PATTERN = /[\uFE0E\uFE0F]/gu;
const SKIN_TONE_PATTERN = /[\u{1F3FB}-\u{1F3FF}]/gu;
const SURROUNDING_COLONS_PATTERN = /^:+|:+$/g;
const SEPARATOR_PATTERN = /[_-]+/g;
const WHITESPACE_PATTERN = /\s+/g;

export function normalizeNativeEmojiSearchKey(emoji: string): string {
  return emoji
    .replace(VARIATION_SELECTOR_PATTERN, "")
    .replace(SKIN_TONE_PATTERN, "");
}

export function buildNativeEmojiSearchTermMap(
  entries: Iterable<NativeEmojiShortcodeEntry>,
): NativeEmojiSearchTermMap {
  const termsByEmoji = new Map<string, Set<string>>();

  for (const entry of entries) {
    const key = normalizeNativeEmojiSearchKey(entry.emoji);

    if (!key) {
      continue;
    }

    const terms = termsByEmoji.get(key) ?? new Set<string>();

    for (const candidate of [...(entry.shortcodes ?? []), ...(entry.aliases ?? [])]) {
      for (const term of expandShortcodeTerms(candidate)) {
        terms.add(term);
      }
    }

    if (terms.size > 0) {
      termsByEmoji.set(key, terms);
    }
  }

  return Object.fromEntries(
    Array.from(termsByEmoji, ([emoji, terms]) => [emoji, Array.from(terms)]),
  );
}

export function mergeNativeEmojiSearchTermMaps(
  ...maps: readonly NativeEmojiSearchTermMap[]
): NativeEmojiSearchTermMap {
  const termsByEmoji = new Map<string, Set<string>>();

  for (const map of maps) {
    for (const [emoji, candidates] of Object.entries(map)) {
      const key = normalizeNativeEmojiSearchKey(emoji);

      if (!key) {
        continue;
      }

      const terms = termsByEmoji.get(key) ?? new Set<string>();

      for (const candidate of candidates) {
        for (const term of expandShortcodeTerms(candidate)) {
          terms.add(term);
        }
      }

      if (terms.size > 0) {
        termsByEmoji.set(key, terms);
      }
    }
  }

  return Object.fromEntries(
    Array.from(termsByEmoji, ([emoji, terms]) => [emoji, Array.from(terms)]),
  );
}

export function getNativeEmojiSearchTerms(
  termMap: NativeEmojiSearchTermMap,
  emoji: string,
): string[] {
  const key = normalizeNativeEmojiSearchKey(emoji);

  return termMap[key] ?? [];
}

function expandShortcodeTerms(value: string): string[] {
  const normalized = normalizeSearchTerm(value);

  if (!normalized) {
    return [];
  }

  const expanded = new Set<string>([normalized]);
  const spaced = normalized
    .replace(SEPARATOR_PATTERN, " ")
    .replace(WHITESPACE_PATTERN, " ");

  if (spaced !== normalized) {
    expanded.add(spaced);
  }

  return Array.from(expanded);
}

function normalizeSearchTerm(value: string): string {
  return value
    .trim()
    .replace(SURROUNDING_COLONS_PATTERN, "")
    .toLowerCase()
    .replace(WHITESPACE_PATTERN, " ");
}
