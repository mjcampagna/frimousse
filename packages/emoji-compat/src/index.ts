export {
  buildCompatMap,
  detectSupportedVersion,
  getCompatEntry,
  getFallbackUrl,
} from "./compat";
export { normalizeEmojiCompatKey } from "./normalize";
export { isEmojiSupported } from "./support";
export type {
  EmojiCompatEntry,
  EmojiCompatMap,
  EmojiCompatOptions,
  EmojiCompatRecord,
  EmojiCompatSkinRecord,
  EmojiFallbackUrlOptions,
} from "./types";
