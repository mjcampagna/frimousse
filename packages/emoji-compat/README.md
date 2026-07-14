# @slithy/emoji-compat

Small emoji compatibility utilities for native-support detection and fallback
metadata.

This package is intentionally adjacent to picker and rendering code.

- It can detect which emoji version the current browser supports.
- It can turn emojibase-like records into fallback metadata keyed by native
  emoji strings.
- It can resolve asset URLs for emoji that need fallback rendering.

It does not render anything itself, bundle Twemoji assets, or require a picker.

## Shipped Surface

```ts
import {
  buildCompatMap,
  detectSupportedVersion,
  getCompatEntry,
  getFallbackUrl,
  isEmojiSupported,
  normalizeEmojiCompatKey,
} from "@slithy/emoji-compat";
```

Build-time asset helpers are also available from the `assets` subpath:

```ts
import {
  buildFallbackAssetManifest,
  collectFallbackHexcodes,
  downloadFallbackAssets,
} from "@slithy/emoji-compat/assets";
```

Related exported types:

- `CollectFallbackHexcodesOptions`
- `DownloadFallbackAssetsOptions`
- `DownloadFallbackAssetsResult`
- `EmojiCompatRecord`
- `EmojiCompatSkinRecord`
- `EmojiCompatEntry`
- `EmojiCompatMap`
- `EmojiCompatOptions`
- `EmojiFallbackUrlOptions`
- `FallbackAssetKind`
- `FallbackAssetRecord`

## Input Shape

```ts
type EmojiCompatRecord = {
  emoji: string;
  version: number;
  hexcode?: string;
  skins?: readonly {
    emoji: string;
    hexcode?: string;
  }[];
};
```

Example:

```ts
const compatMap = buildCompatMap(records, {
  supportedVersion: 15,
});
```

If you want the package to detect support at runtime instead:

```ts
const compatMap = buildCompatMap(records);
```

That uses the built-in canvas probe to find the highest supported emoji
version for the current browser.

## Example

```ts
import {
  buildCompatMap,
  getFallbackUrl,
} from "@slithy/emoji-compat";

const compatMap = buildCompatMap(records, {
  supportedVersion: 15,
});

const fallbackUrl = getFallbackUrl(compatMap, "🫩");
// "/emoji/1fae9.svg"
```

Use that URL in your own rendering layer when you want an image fallback for
emoji above the browser's native support floor.

## Asset Preparation

If you want to prepare a fallback asset set ahead of time, use the `assets`
subpath to collect required hexcodes or build a manifest.

```ts
import {
  buildFallbackAssetManifest,
  collectFallbackHexcodes,
  downloadFallbackAssets,
} from "@slithy/emoji-compat/assets";

const hexcodes = collectFallbackHexcodes(records, {
  versionFloor: 15,
});

const manifest = buildFallbackAssetManifest(records, {
  versionFloor: 15,
});

await downloadFallbackAssets(manifest, {
  outDir: "public/emoji",
});
```

This is intended for build-time scripts, not runtime rendering code.

If you want to wire it into a Node build script directly:

```ts
import data from "emojibase-data/en/data.json";
import {
  buildFallbackAssetManifest,
  downloadFallbackAssets,
} from "@slithy/emoji-compat/assets";

const manifest = buildFallbackAssetManifest(data, {
  versionFloor: 15,
});

await downloadFallbackAssets(manifest, {
  outDir: "public/emoji",
});
```

### Asset Convention

The package assumes a simple default convention:

- asset filenames match lowercase emojibase `hexcode`
- fallback URLs look like `/emoji/{hexcode}.svg`

That matches the common `jdecked/twemoji` SVG naming convention directly.

The downloader uses the same convention by default and fetches from:

- `https://raw.githubusercontent.com/jdecked/twemoji/main/assets/svg`

You can override the source URL, target filename, and overwrite behavior from
your own build script.

### Updating Assets

Consumers may need to refresh their fallback asset set when:

- `emojibase-data` is upgraded
- their supported browser floor changes
- upstream Twemoji coverage changes

The package does not download or bundle assets automatically. Consumers remain
in control of where assets live and how they are fetched.

## Normalization Contract

- Keys are normalized with NFC.
- Variation selectors are removed for storage and lookup.
- Skin-tone modifiers are preserved.
- Fallback URLs use the source `hexcode`, lowercased.

This keeps lookup tolerant of minor Unicode presentation differences without
turning the package into a rendering system.

## Non-Goals In V1

- No React components
- No bundled emoji asset set
- No automatic asset download workflow
- No picker-specific API shape
- No shortcode or search enrichment logic

## Scripts

```bash
pnpm build
pnpm typecheck
pnpm test
```
