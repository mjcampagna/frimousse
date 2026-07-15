# @slithy/emoji-compat

Small emoji compatibility utilities for native-support detection and fallback
metadata.

This package is intentionally adjacent to picker and rendering code.

- It can detect which emoji version the current browser supports.
- It can turn emojibase-like records into fallback metadata keyed by native
  emoji strings.
- It can resolve asset URLs for emoji that need fallback rendering.

It does not render anything itself, bundle Twemoji assets, or require a picker.

## Boundary

`@slithy/emoji-compat` owns the reusable mechanics:

- browser support probing
- supported-version detection
- compat-map generation from emojibase-like records
- fallback URL resolution from compat data
- fallback asset manifest generation

Your app owns the product-specific policy:

- which browsers or platforms define your support baseline
- which `supportedVersion` or `versionFloor` you choose from that policy
- where generated compat maps and fallback asset manifests live
- how fallback assets are hosted or copied into your app
- how your rendering component chooses between native text and image fallback

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

One common pattern is to build the compat map once, then let a small
app-owned component choose between native rendering and an image fallback:

```tsx
import {
  buildCompatMap,
  getFallbackUrl,
} from "@slithy/emoji-compat";

const compatMap = buildCompatMap(records, {
  supportedVersion: 15,
});

function EmojiWithFallback({
  emoji,
  label,
}: {
  emoji: string;
  label: string;
}) {
  const fallbackUrl = getFallbackUrl(compatMap, emoji, {
    basePath: "/emoji",
  });

  if (!fallbackUrl) {
    return <span aria-label={label}>{emoji}</span>;
  }

  return <img src={fallbackUrl} alt={label} width="20" height="20" />;
}
```

That keeps rendering policy in your app while `@slithy/emoji-compat` handles
the support decision and asset lookup.

## Asset Preparation

For production apps, prepare fallback assets and any generated compat map
artifacts ahead of time, then import the final artifacts at runtime.

Use the `assets` subpath when you want a build-time fallback asset manifest
for the emoji assets you need above a chosen `versionFloor`.

```ts
// scripts/generate-emoji-fallbacks.ts
import {
  buildFallbackAssetManifest,
  collectFallbackHexcodes,
  downloadFallbackAssets,
} from "@slithy/emoji-compat/assets";

const hexcodes = collectFallbackHexcodes(records, {
  versionFloor: 15,
});

const fallbackAssetManifest = buildFallbackAssetManifest(records, {
  versionFloor: 15,
});

await downloadFallbackAssets(fallbackAssetManifest, {
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

const fallbackAssetManifest = buildFallbackAssetManifest(data, {
  versionFloor: 15,
});

await downloadFallbackAssets(fallbackAssetManifest, {
  outDir: "public/emoji",
});
```

Run that script as a normal Node build step:

```bash
tsx scripts/generate-emoji-fallbacks.ts
```

Use that generated compat map in your component at runtime:

```ts
// src/generated/emoji-compat-map.ts
import type { EmojiCompatMap } from "@slithy/emoji-compat";

export const compatMap: EmojiCompatMap = {
  "🫩": {
    emoji: "🫩",
    version: 16,
    hexcode: "1fae9",
    supported: false,
    needsFallback: true,
  },
};
```

```tsx
import { getFallbackUrl } from "@slithy/emoji-compat";
import { compatMap } from "./generated/emoji-compat-map";

function EmojiWithFallback({
  emoji,
  label,
}: {
  emoji: string;
  label: string;
}) {
  const fallbackUrl = getFallbackUrl(compatMap, emoji, {
    basePath: "/emoji",
  });

  return fallbackUrl ? (
    <img src={fallbackUrl} alt={label} width="20" height="20" />
  ) : (
    <span aria-label={label}>{emoji}</span>
  );
}
```

Inside this repo, the package also includes a small example script that uses
`emojibase-data` directly to generate a fallback asset manifest:

```bash
pnpm --filter @slithy/emoji-compat build
pnpm --filter @slithy/emoji-compat assets:generate -- --version-floor 15 --manifest-out ./tmp/emoji-manifest.json
```

Add `--download --out ./public/emoji` when you want the script to fetch the
matching Twemoji SVGs as well.

The script also supports:

- `--dry-run` to print a summary without writing or downloading assets
- `--data ./path/to/data.json` to use a custom `EmojiCompatRecord[]` JSON dataset
- `--no-include-skins` to collect only base emoji assets
- `--base-url` and `--overwrite` when downloading

For concrete checked-in fallback asset manifest samples, see
[`examples/fallback-manifest-v15.sample.json`](./examples/fallback-manifest-v15.sample.json)
and
[`examples/fallback-manifest-v15-no-skins.sample.json`](./examples/fallback-manifest-v15-no-skins.sample.json).

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

### Choosing A Version Floor

`versionFloor` means "emoji at this version or below are expected to render
natively in the environments my product supports."

In practice, most consumers should choose that number from product policy, not
from a one-off guess.

Common approaches:

- use a supported-browser baseline and map that policy to an emoji version floor
- use a build-time app decision such as "we only need fallback assets above 15"
- use runtime detection for rendering, but still use an explicit floor when
  preparing assets ahead of time

The important part is consistency:

- `buildCompatMap(records, { supportedVersion })` should use the same support
  assumption as your asset-generation workflow
- if your app ships fallback SVGs only above version `15`, your compat map
  should usually also treat `15` as the native support floor

If your browser support policy changes, regenerate the fallback manifest and
assets with the new floor.

As a rule of thumb:

- choose the lowest emoji version you can rely on across your supported browser
  set
- treat newer emoji versions as fallback-only until your baseline moves
- prefer an explicit build-time floor for asset preparation, even if runtime
  probing is also available

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
