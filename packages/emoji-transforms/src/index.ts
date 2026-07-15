export {
  adaptNativeEmojiSearchEntries,
  buildNativeEmojiSearchTermMapFromAdapter,
  buildShortcodeMapFromAdapter,
} from "./adapters";
export {
  adaptEmojibaseNativeEmojiSearchEntries,
  buildFallbackTermsFromEmojibase,
  buildNativeEmojiSearchTermMapFromEmojibase,
  buildShortcodeMapFromEmojibase,
  buildShortcodeMapFromPreset,
} from "./presets/emojibase";
export {
  buildNativeEmojiSearchTermMap,
  getNativeEmojiSearchTerms,
  mergeNativeEmojiSearchTermMaps,
  normalizeNativeEmojiSearchKey,
} from "./native-search-terms";
export {
  buildShortcodeMap,
  getPrimaryShortcode,
  getShortcodes,
} from "./native-shortcodes";
export type {
  EmojibaseLocaleFallbackSearchOptions,
  EmojibaseNativeEmojiRecord,
  EmojibaseNativeEmojiSkinRecord,
  EmojibaseNativeEmojiSearchOptions,
  EmojibaseShortcodePreset,
  NativeEmojiSearchAdapter,
  NativeEmojiSearchTermMap,
  NativeEmojiShortcodeMap,
  NativeEmojiShortcodeEntry,
} from "./types";
