export {
  adaptNativeEmojiLabelEntries,
  adaptNativeEmojiSearchEntries,
  buildLabelMapFromAdapter,
  buildNativeEmojiSearchTermMapFromAdapter,
  buildShortcodeMapFromAdapter,
} from "./adapters";
export {
  adaptEmojibaseNativeEmojiSearchEntries,
  buildFallbackTermsFromEmojibase,
  buildLabelMapFromEmojibase,
  buildNativeEmojiSearchTermMapFromEmojibase,
  buildShortcodeMapFromEmojibase,
  buildShortcodeMapFromPreset,
} from "./presets/emojibase";
export {
  buildLabelMap,
  getLabel,
  mergeNativeEmojiLabelMaps,
} from "./native-labels";
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
  NativeEmojiLabelAdapter,
  NativeEmojiLabelEntry,
  NativeEmojiLabelMap,
  EmojibaseNativeEmojiRecord,
  EmojibaseNativeEmojiSkinRecord,
  EmojibaseNativeEmojiSearchOptions,
  EmojibaseShortcodePreset,
  NativeEmojiSearchAdapter,
  NativeEmojiSearchTermMap,
  NativeEmojiShortcodeMap,
  NativeEmojiShortcodeEntry,
} from "./types";
