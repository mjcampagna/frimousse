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

Related exported types:

- `EmojiCompatRecord`
- `EmojiCompatSkinRecord`
- `EmojiCompatEntry`
- `EmojiCompatMap`
- `EmojiCompatOptions`
- `EmojiFallbackUrlOptions`

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
- No opinionated Twemoji download workflow
- No picker-specific API shape
- No shortcode or search enrichment logic

## Scripts

```bash
pnpm build
pnpm typecheck
pnpm test
```
