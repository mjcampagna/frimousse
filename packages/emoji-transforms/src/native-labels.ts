import type {
  NativeEmojiLabelEntry,
  NativeEmojiLabelMap,
} from "./types";
import { normalizeNativeEmojiSearchKey } from "./native-search-terms";

export function buildLabelMap(
  entries: Iterable<NativeEmojiLabelEntry>,
): NativeEmojiLabelMap {
  const labelsByEmoji = new Map<string, string>();

  for (const entry of entries) {
    const key = normalizeNativeEmojiSearchKey(entry.emoji);
    const label = normalizeLabel(entry.label);

    if (!key || !label || labelsByEmoji.has(key)) {
      continue;
    }

    labelsByEmoji.set(key, label);
  }

  return Object.fromEntries(labelsByEmoji);
}

export function mergeNativeEmojiLabelMaps(
  ...maps: readonly NativeEmojiLabelMap[]
): NativeEmojiLabelMap {
  const labelsByEmoji = new Map<string, string>();

  for (const map of maps) {
    for (const [emoji, candidate] of Object.entries(map)) {
      const key = normalizeNativeEmojiSearchKey(emoji);
      const label = normalizeLabel(candidate);

      if (!key || !label || labelsByEmoji.has(key)) {
        continue;
      }

      labelsByEmoji.set(key, label);
    }
  }

  return Object.fromEntries(labelsByEmoji);
}

export function getLabel(
  labelMap: NativeEmojiLabelMap,
  emoji: string,
): string | undefined {
  const key = normalizeNativeEmojiSearchKey(emoji);

  return labelMap[key];
}

function normalizeLabel(value: string): string {
  return value.trim();
}
