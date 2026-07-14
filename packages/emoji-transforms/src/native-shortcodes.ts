import type {
  NativeEmojiShortcodeEntry,
  NativeEmojiShortcodeMap,
} from "./types";
import { normalizeNativeEmojiSearchKey } from "./native-search-terms";

const SURROUNDING_COLONS_PATTERN = /^:+|:+$/g;

export function buildShortcodeMap(
  entries: Iterable<NativeEmojiShortcodeEntry>,
): NativeEmojiShortcodeMap {
  const shortcodesByEmoji = new Map<string, Set<string>>();

  for (const entry of entries) {
    const key = normalizeNativeEmojiSearchKey(entry.emoji);

    if (!key) {
      continue;
    }

    const shortcodes = shortcodesByEmoji.get(key) ?? new Set<string>();

    for (const candidate of entry.shortcodes ?? []) {
      const shortcode = normalizeShortcode(candidate);

      if (shortcode) {
        shortcodes.add(shortcode);
      }
    }

    if (shortcodes.size > 0) {
      shortcodesByEmoji.set(key, shortcodes);
    }
  }

  return Object.fromEntries(
    Array.from(shortcodesByEmoji, ([emoji, shortcodes]) => [
      emoji,
      Array.from(shortcodes),
    ]),
  );
}

export function getShortcodes(
  shortcodeMap: NativeEmojiShortcodeMap,
  emoji: string,
): string[] {
  const key = normalizeNativeEmojiSearchKey(emoji);

  return shortcodeMap[key] ?? [];
}

export function getPrimaryShortcode(
  shortcodeMap: NativeEmojiShortcodeMap,
  emoji: string,
): string | undefined {
  return getShortcodes(shortcodeMap, emoji)[0];
}

function normalizeShortcode(value: string): string {
  return value.trim().replace(SURROUNDING_COLONS_PATTERN, "").toLowerCase();
}
