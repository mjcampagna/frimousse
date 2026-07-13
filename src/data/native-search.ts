import type { EmojiPickerSearchConfig } from "../search-types";
import type { EmojiDataEmoji } from "../types";
import { isDevelopment } from "../utils/is-development";

const VARIATION_SELECTOR_PATTERN = /[\uFE0E\uFE0F]/gu;
const SKIN_TONE_PATTERN = /[\u{1F3FB}-\u{1F3FF}]/gu;
const SEPARATOR_PATTERN = /[_-]+/g;
const WHITESPACE_PATTERN = /\s+/g;
const LABEL_AND_ENRICHED_TERM_SCORE = 10;
const TAG_SCORE = 1;

export type NativeSearchTermsMap = Map<string, string[]>;
const warnedUnmatchedKeys = new Set<string>();

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

export function warnForUnmatchedNativeSearchTerms(
  emojis: EmojiDataEmoji[],
  search?: EmojiPickerSearchConfig,
) {
  if (!isDevelopment()) {
    return;
  }

  const configuredTerms = search?.native?.terms;

  if (!configuredTerms) {
    return;
  }

  const knownKeys = new Set(emojis.map((emoji) => normalizeNativeSearchKey(emoji.emoji)));

  for (const emoji of Object.keys(configuredTerms)) {
    const key = normalizeNativeSearchKey(emoji);

    if (!key || knownKeys.has(key) || warnedUnmatchedKeys.has(key)) {
      continue;
    }

    warnedUnmatchedKeys.add(key);
    console.warn(
      `[frimousse] Ignoring native search terms for unmatched emoji key "${emoji}".`,
    );
  }
}

export function scoreNativeEmojiMatch(
  emoji: EmojiDataEmoji,
  searchText: string,
  nativeTerms?: NativeSearchTermsMap,
): number {
  let score = 0;

  if (normalizeNativeSearchTerm(emoji.label).includes(searchText)) {
    score += LABEL_AND_ENRICHED_TERM_SCORE;
  }

  for (const tag of emoji.tags) {
    if (normalizeNativeSearchTerm(tag).includes(searchText)) {
      score += TAG_SCORE;
    }
  }

  const terms = nativeTerms?.get(normalizeNativeSearchKey(emoji.emoji)) ?? [];

  for (const term of terms) {
    if (normalizeNativeSearchTerm(term).includes(searchText)) {
      score += LABEL_AND_ENRICHED_TERM_SCORE;
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
