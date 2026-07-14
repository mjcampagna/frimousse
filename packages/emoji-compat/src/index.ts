export {
  buildCompatMap,
  detectSupportedVersion,
  getCompatEntry,
  getFallbackUrl,
} from "./compat";
export { normalizeEmojiCompatKey } from "./normalize";
export { isEmojiSupported } from "./support";
export type {
  CollectFallbackHexcodesOptions,
  DownloadFallbackAssetsOptions,
  DownloadFallbackAssetsResult,
  EmojiCompatEntry,
  EmojiCompatMap,
  EmojiCompatOptions,
  EmojiCompatRecord,
  EmojiCompatSkinRecord,
  EmojiFallbackUrlOptions,
  FallbackAssetKind,
  FallbackAssetRecord,
} from "./types";
