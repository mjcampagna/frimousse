export {
  adaptNativeEmojiSearchEntries,
  buildNativeEmojiSearchTermMapFromAdapter,
  buildShortcodeMapFromAdapter,
} from "./adapters";
export {
  adaptEmojibaseNativeEmojiSearchEntries,
  buildNativeEmojiSearchTermMapFromEmojibase,
  buildShortcodeMapFromEmojibase,
  buildShortcodeMapFromPreset,
} from "./presets/emojibase";
export {
  buildNativeEmojiSearchTermMap,
  getNativeEmojiSearchTerms,
  normalizeNativeEmojiSearchKey,
} from "./native-search-terms";
export {
  buildShortcodeMap,
  getPrimaryShortcode,
  getShortcodes,
} from "./native-shortcodes";
export type {
  EmojibaseNativeEmojiRecord,
  EmojibaseNativeEmojiSkinRecord,
  EmojibaseNativeEmojiSearchOptions,
  EmojibaseShortcodePreset,
  NativeEmojiSearchAdapter,
  NativeEmojiSearchTermMap,
  NativeEmojiShortcodeMap,
  NativeEmojiShortcodeEntry,
} from "./types";
