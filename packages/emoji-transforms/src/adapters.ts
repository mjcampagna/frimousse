import { buildLabelMap } from "./native-labels";
import { buildNativeEmojiSearchTermMap } from "./native-search-terms";
import { buildShortcodeMap } from "./native-shortcodes";
import type {
  NativeEmojiLabelAdapter,
  NativeEmojiLabelEntry,
  NativeEmojiLabelMap,
  NativeEmojiSearchAdapter,
  NativeEmojiSearchTermMap,
  NativeEmojiShortcodeEntry,
  NativeEmojiShortcodeMap,
} from "./types";

export function adaptNativeEmojiSearchEntries<TEntry>(
  entries: Iterable<TEntry>,
  adapter: NativeEmojiSearchAdapter<TEntry>,
): NativeEmojiShortcodeEntry[] {
  const adaptedEntries: NativeEmojiShortcodeEntry[] = [];

  for (const entry of entries) {
    const emoji = adapter.getEmoji(entry);

    if (!emoji) {
      continue;
    }

    const shortcodes = toArray(adapter.getShortcodes?.(entry));
    const aliases = toArray(adapter.getAliases?.(entry));

    adaptedEntries.push({
      emoji,
      ...(shortcodes.length > 0 ? { shortcodes } : {}),
      ...(aliases.length > 0 ? { aliases } : {}),
    });
  }

  return adaptedEntries;
}

export function buildNativeEmojiSearchTermMapFromAdapter<TEntry>(
  entries: Iterable<TEntry>,
  adapter: NativeEmojiSearchAdapter<TEntry>,
): NativeEmojiSearchTermMap {
  return buildNativeEmojiSearchTermMap(
    adaptNativeEmojiSearchEntries(entries, adapter),
  );
}

export function buildShortcodeMapFromAdapter<TEntry>(
  entries: Iterable<TEntry>,
  adapter: NativeEmojiSearchAdapter<TEntry>,
): NativeEmojiShortcodeMap {
  return buildShortcodeMap(adaptNativeEmojiSearchEntries(entries, adapter));
}

export function adaptNativeEmojiLabelEntries<TEntry>(
  entries: Iterable<TEntry>,
  adapter: NativeEmojiLabelAdapter<TEntry>,
): NativeEmojiLabelEntry[] {
  const adaptedEntries: NativeEmojiLabelEntry[] = [];

  for (const entry of entries) {
    const emoji = adapter.getEmoji(entry);
    const label = adapter.getLabel(entry);

    if (!emoji || !label) {
      continue;
    }

    adaptedEntries.push({
      emoji,
      label,
    });
  }

  return adaptedEntries;
}

export function buildLabelMapFromAdapter<TEntry>(
  entries: Iterable<TEntry>,
  adapter: NativeEmojiLabelAdapter<TEntry>,
): NativeEmojiLabelMap {
  return buildLabelMap(adaptNativeEmojiLabelEntries(entries, adapter));
}

function toArray(values: Iterable<string> | null | undefined): string[] {
  return values ? Array.from(values) : [];
}
