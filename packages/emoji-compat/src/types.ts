export type EmojiCompatSkinRecord = {
  emoji: string;
  hexcode?: string;
};

export type EmojiCompatRecord = {
  emoji: string;
  version: number;
  hexcode?: string;
  skins?: readonly EmojiCompatSkinRecord[];
};

export type EmojiCompatEntry = {
  emoji: string;
  version: number;
  hexcode?: string;
  supported: boolean;
  needsFallback: boolean;
};

export type EmojiCompatMap = Record<string, EmojiCompatEntry>;

export type EmojiCompatOptions = {
  supportedVersion?: number;
  isSupported?: (emoji: string) => boolean;
};

export type EmojiFallbackUrlOptions = {
  basePath?: string;
  extension?: string;
};

export type CollectFallbackHexcodesOptions = {
  versionFloor: number;
  includeSkins?: boolean;
};

export type FallbackAssetKind = "base" | "skin";

export type FallbackAssetRecord = {
  emoji: string;
  version: number;
  hexcode: string;
  kind: FallbackAssetKind;
};

export type DownloadFallbackAssetsOptions = {
  outDir: string;
  baseUrl?: string;
  overwrite?: boolean;
  filename?: (asset: FallbackAssetRecord) => string;
};

export type DownloadFallbackAssetsResult = {
  requested: number;
  downloaded: number;
  skipped: number;
};
