import type { EmojiPickerSearchConfig } from "../search-types";
import type { EmojiDataEmoji } from "../types";

const VARIATION_SELECTOR_PATTERN = /[\uFE0E\uFE0F]/gu;
const SKIN_TONE_PATTERN = /[\u{1F3FB}-\u{1F3FF}]/gu;
const SEPARATOR_PATTERN = /[_-]+/g;
const WHITESPACE_PATTERN = /\s+/g;

type NativeSearchTermsMap = Map<string, string[]>;

export function normalizeNativeSearchKey(emoji: string): string {
  return emoji
    .replace(VARIATION_SELECTOR_PATTERN, "")
    .replace(SKIN_TONE_PATTERN, "");
}

export function normalizeNativeSearchText(search: string): string {
  return normalizeNativeSearchTerm(search);
}

export function createNativeSearchTermsMap(
  search?: EmojiPickerSearchConfig,
): NativeSearchTermsMap | undefined {
  const terms = search?.native?.terms;

  if (!terms) {
    return undefined;
  }

  const normalized = new Map<string, string[]>();

  for (const [emoji, values] of Object.entries(terms)) {
    const key = normalizeNativeSearchKey(emoji);

    if (!key || values.length === 0) {
      continue;
    }

    normalized.set(key, values);
  }

  return normalized.size > 0 ? normalized : undefined;
}

export function scoreNativeEmojiMatch(
  emoji: EmojiDataEmoji,
  searchText: string,
  nativeTerms?: NativeSearchTermsMap,
): number {
  let score = 0;

  if (emoji.label.toLowerCase().includes(searchText)) {
    score += 10;
  }

  for (const tag of emoji.tags) {
    if (normalizeNativeSearchTerm(tag).includes(searchText)) {
      score += 1;
    }
  }

  const terms = nativeTerms?.get(normalizeNativeSearchKey(emoji.emoji)) ?? [];

  for (const term of terms) {
    if (normalizeNativeSearchTerm(term).includes(searchText)) {
      score += 1;
    }
  }

  return score;
}

function normalizeNativeSearchTerm(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(SEPARATOR_PATTERN, " ")
    .replace(WHITESPACE_PATTERN, " ");
}
