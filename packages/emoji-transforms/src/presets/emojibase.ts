import {
  adaptNativeEmojiSearchEntries,
  buildNativeEmojiSearchTermMapFromAdapter,
} from "../adapters";
import { buildShortcodeMap } from "../native-shortcodes";
import type {
  EmojibaseLocaleFallbackSearchOptions,
  EmojibaseNativeEmojiRecord,
  EmojibaseNativeEmojiSearchOptions,
  EmojibaseShortcodePreset,
  NativeEmojiSearchTermMap,
  NativeEmojiShortcodeEntry,
  NativeEmojiShortcodeMap,
} from "../types";

export function adaptEmojibaseNativeEmojiSearchEntries(
  entries: Iterable<EmojibaseNativeEmojiRecord>,
  options: EmojibaseNativeEmojiSearchOptions = {},
): NativeEmojiShortcodeEntry[] {
  return adaptNativeEmojiSearchEntries(entries, {
    getEmoji: (entry) => entry.emoji,
    getShortcodes: (entry) => entry.shortcodes,
    getAliases: (entry) => getAliases(entry, options),
  });
}

export function buildNativeEmojiSearchTermMapFromEmojibase(
  entries: Iterable<EmojibaseNativeEmojiRecord>,
  options: EmojibaseNativeEmojiSearchOptions = {},
): NativeEmojiSearchTermMap {
  return buildNativeEmojiSearchTermMapFromAdapter(entries, {
    getEmoji: (entry) => entry.emoji,
    getShortcodes: (entry) => entry.shortcodes,
    getAliases: (entry) => getAliases(entry, options),
  });
}

export function buildFallbackTermsFromEmojibase(
  entries: Iterable<EmojibaseNativeEmojiRecord>,
  options: EmojibaseLocaleFallbackSearchOptions = {},
): NativeEmojiSearchTermMap {
  return buildNativeEmojiSearchTermMapFromEmojibase(entries, {
    includeLabel: true,
    includeTags: options.includeTags,
  });
}

export function buildShortcodeMapFromEmojibase(
  entries: Iterable<EmojibaseNativeEmojiRecord>,
): NativeEmojiShortcodeMap {
  return buildShortcodeMap(adaptEmojibaseNativeEmojiSearchEntries(entries));
}

export function buildShortcodeMapFromPreset(
  entries: Iterable<EmojibaseNativeEmojiRecord>,
  preset: EmojibaseShortcodePreset,
): NativeEmojiShortcodeMap {
  const adaptedEntries: NativeEmojiShortcodeEntry[] = [];

  for (const entry of entries) {
    const shortcodes = getPresetShortcodes(entry.hexcode, preset, entry.shortcodes);

    if (entry.emoji && shortcodes.length > 0) {
      adaptedEntries.push({
        emoji: entry.emoji,
        shortcodes,
      });
    }

    for (const skin of entry.skins ?? []) {
      const skinShortcodes = getPresetShortcodes(skin.hexcode, preset);

      if (skin.emoji && skinShortcodes.length > 0) {
        adaptedEntries.push({
          emoji: skin.emoji,
          shortcodes: skinShortcodes,
        });
      }
    }
  }

  return buildShortcodeMap(adaptedEntries);
}

function getAliases(
  entry: EmojibaseNativeEmojiRecord,
  options: EmojibaseNativeEmojiSearchOptions,
): string[] {
  const aliases: string[] = [];

  if (options.includeLabel && entry.label) {
    aliases.push(entry.label);
  }

  if (options.includeTags) {
    aliases.push(...(entry.tags ?? []));
  }

  return aliases;
}

function getPresetShortcodes(
  hexcode: string | null | undefined,
  preset: EmojibaseShortcodePreset,
  fallback: readonly string[] | null | undefined = [],
): string[] {
  const presetValue = hexcode ? preset[hexcode] : undefined;
  const shortcodes = [...toArray(presetValue), ...toArray(fallback)];

  return Array.from(new Set(shortcodes));
}

function toArray(
  value: string | readonly string[] | null | undefined,
): string[] {
  if (!value) {
    return [];
  }

  return typeof value === "string" ? [value] : Array.from(value);
}
