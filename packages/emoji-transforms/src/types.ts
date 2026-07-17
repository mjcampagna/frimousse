export type NativeEmojiSearchTermMap = Record<string, string[]>;
export type NativeEmojiShortcodeMap = Record<string, string[]>;
export type NativeEmojiLabelMap = Record<string, string>;

export interface NativeEmojiShortcodeEntry {
  emoji: string;
  shortcodes?: readonly string[];
  aliases?: readonly string[];
}

export interface NativeEmojiLabelEntry {
  emoji: string;
  label: string;
}

export interface NativeEmojiSearchAdapter<TEntry> {
  getEmoji(entry: TEntry): string | null | undefined;
  getShortcodes?(entry: TEntry): Iterable<string> | null | undefined;
  getAliases?(entry: TEntry): Iterable<string> | null | undefined;
}

export interface NativeEmojiLabelAdapter<TEntry> {
  getEmoji(entry: TEntry): string | null | undefined;
  getLabel(entry: TEntry): string | null | undefined;
}

export interface EmojibaseNativeEmojiRecord {
  emoji?: string | null | undefined;
  hexcode?: string | null | undefined;
  label?: string | null | undefined;
  shortcodes?: readonly string[] | null | undefined;
  skins?: readonly EmojibaseNativeEmojiSkinRecord[] | null | undefined;
  tags?: readonly string[] | null | undefined;
}

export interface EmojibaseNativeEmojiSkinRecord {
  emoji?: string | null | undefined;
  hexcode?: string | null | undefined;
}

export type EmojibaseShortcodePreset = Record<
  string,
  string | readonly string[]
>;

export interface EmojibaseNativeEmojiSearchOptions {
  includeLabel?: boolean;
  includeTags?: boolean;
}

export interface EmojibaseLocaleFallbackSearchOptions {
  includeTags?: boolean;
}
