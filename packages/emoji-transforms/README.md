# @slithy/emoji-transforms

Small emoji metadata utilities for search enrichment and related tooling.

The first shipped surface is intentionally narrow: build extra native search
terms for emoji from consumer-owned metadata. It is designed to feed packages
like `@slithy/frimousse`, without forcing picker-specific concerns into this
package.

## Installation

```bash
pnpm add @slithy/emoji-transforms
```

Full docs:

- [frimousse.slithy.me/docs#companion-packages](https://frimousse.slithy.me/docs#companion-packages)
- [frimousse.slithy.me/docs/api-reference#emoji-transforms-api](https://frimousse.slithy.me/docs/api-reference#emoji-transforms-api)

## Shipped Surface

```ts
import {
  adaptNativeEmojiSearchEntries,
  adaptEmojibaseNativeEmojiSearchEntries,
  buildFallbackTermsFromEmojibase,
  buildNativeEmojiSearchTermMap,
  buildNativeEmojiSearchTermMapFromAdapter,
  buildNativeEmojiSearchTermMapFromEmojibase,
  mergeNativeEmojiSearchTermMaps,
  buildShortcodeMap,
  buildShortcodeMapFromAdapter,
  buildShortcodeMapFromEmojibase,
  buildShortcodeMapFromPreset,
  getPrimaryShortcode,
  getShortcodes,
  getNativeEmojiSearchTerms,
  normalizeNativeEmojiSearchKey,
} from "@slithy/emoji-transforms";
```

- `buildNativeEmojiSearchTermMap(entries)` builds a plain
  `Record<string, string[]>`.
- `buildShortcodeMap(entries)` builds a shortcode-only
  `Record<string, string[]>` keyed by base emoji.
- `adaptNativeEmojiSearchEntries(entries, adapter)` maps arbitrary source
  records into the package's neutral entry format.
- `buildNativeEmojiSearchTermMapFromAdapter(entries, adapter)` combines the
  adapter step with map construction.
- `buildShortcodeMapFromAdapter(entries, adapter)` combines the adapter step
  with shortcode-map construction.
- `adaptEmojibaseNativeEmojiSearchEntries(entries, options?)` adapts a common
  `emojibase`-like record shape.
- `buildFallbackTermsFromEmojibase(entries, options?)` builds a
  locale-fallback-friendly term map from a secondary Emojibase dataset.
- `buildNativeEmojiSearchTermMapFromEmojibase(entries, options?)` builds a
  term map directly from those records.
- `mergeNativeEmojiSearchTermMaps(...maps)` combines multiple plain native
  search-term maps into one normalized result.
- `buildShortcodeMapFromEmojibase(entries)` builds a shortcode-only map
  directly from those records.
- `buildShortcodeMapFromPreset(entries, preset)` joins Emojibase records with a
  hexcode-keyed shortcode preset such as `emojibase-data/en/shortcodes/iamcal.json`.
- `getNativeEmojiSearchTerms(termMap, emoji)` performs normalized lookup.
- `getShortcodes(shortcodeMap, emoji)` performs normalized shortcode lookup.
- `getPrimaryShortcode(shortcodeMap, emoji)` returns the first normalized
  shortcode for that emoji.
- `normalizeNativeEmojiSearchKey(emoji)` exposes the base-key normalization
  used by the package.

Related exported types:

- `NativeEmojiShortcodeEntry`
- `NativeEmojiSearchAdapter<TEntry>`
- `EmojibaseNativeEmojiRecord`
- `EmojibaseNativeEmojiSkinRecord`
- `EmojibaseNativeEmojiSearchOptions`
- `EmojibaseLocaleFallbackSearchOptions`
- `EmojibaseShortcodePreset`
- `NativeEmojiSearchTermMap`
- `NativeEmojiShortcodeMap`

## Input Shape

```ts
type NativeEmojiShortcodeEntry = {
  emoji: string;
  shortcodes?: readonly string[];
  aliases?: readonly string[];
};
```

Example:

```ts
const termMap = buildNativeEmojiSearchTermMap([
  {
    emoji: "❤️",
    shortcodes: ["red_heart"],
    aliases: ["love"],
  },
  {
    emoji: "👍",
    shortcodes: ["+1", "thumbsup"],
    aliases: ["thumbs_up", "like"],
  },
]);
```

Adapter example:

```ts
const termMap = buildNativeEmojiSearchTermMapFromAdapter(sourceRecords, {
  getEmoji: (record) => record.emoji,
  getShortcodes: (record) => record.shortcodes,
  getAliases: (record) => record.aliases,
});
```

If you want to keep the adaptation step reusable, you can split it out:

```ts
const entries = adaptNativeEmojiSearchEntries(sourceRecords, {
  getEmoji: (record) => record.emoji,
  getShortcodes: (record) => record.shortcodes,
  getAliases: (record) => record.aliases,
});

const termMap = buildNativeEmojiSearchTermMap(entries);
```

Emojibase preset example:

```ts
const termMap = buildNativeEmojiSearchTermMapFromEmojibase(records, {
  includeLabel: false,
  includeTags: false,
});
```

By default, the Emojibase preset only contributes `shortcodes`. `label` and
`tags` are opt-in so the package does not silently widen search behavior.

Locale-fallback example:

```ts
import englishData from "emojibase-data/en/data.json";
import {
  buildFallbackTermsFromEmojibase,
  mergeNativeEmojiSearchTermMaps,
} from "@slithy/emoji-transforms";

const englishFallbackTerms =
  buildFallbackTermsFromEmojibase(englishData);

const termMap = mergeNativeEmojiSearchTermMaps(
  consumerOwnedTerms,
  englishFallbackTerms,
);
```

Use this when your picker renders in one locale but should still match common
English search terms.

Build-time script example:

```ts
// scripts/build-fr-search-terms.ts
import { writeFile } from "node:fs/promises";
import englishData from "emojibase-data/en/data.json";
import frenchData from "emojibase-data/fr/data.json";
import {
  buildFallbackTermsFromEmojibase,
  buildNativeEmojiSearchTermMapFromEmojibase,
  mergeNativeEmojiSearchTermMaps,
} from "@slithy/emoji-transforms";

const frenchTerms = buildNativeEmojiSearchTermMapFromEmojibase(frenchData, {
  includeLabel: true,
});

const englishFallbackTerms = buildFallbackTermsFromEmojibase(englishData);

const searchTerms = mergeNativeEmojiSearchTermMaps(
  frenchTerms,
  englishFallbackTerms,
);

await writeFile(
  new URL("../src/generated/fr-search-terms.json", import.meta.url),
  `${JSON.stringify(searchTerms, null, 2)}\n`,
);
```

Run that script during your build step, then import the generated artifact into
your picker setup:

```bash
pnpm tsx scripts/build-fr-search-terms.ts
```

That writes `src/generated/fr-search-terms.json`. Use that generated file in
the picker config for the matching locale:

```ts
import frSearchTerms from "./generated/fr-search-terms.json";

<EmojiPicker.Root
  locale="fr"
  search={{ native: { terms: frSearchTerms } }}
>
  {/* ... */}
</EmojiPicker.Root>;
```

Shortcode-map example:

```ts
const shortcodeMap = buildShortcodeMapFromEmojibase(records);

getPrimaryShortcode(shortcodeMap, "❤️");
// "red_heart"
```

Joining full Emojibase data with a shortcode preset:

```ts
import emojiData from "emojibase-data/en/data.json";
import iamcalShortcodes from "emojibase-data/en/shortcodes/iamcal.json";
import { buildShortcodeMapFromPreset } from "@slithy/emoji-transforms";

const shortcodeMap = buildShortcodeMapFromPreset(emojiData, iamcalShortcodes);
```

## Normalization Contract

- Keys are normalized to a base emoji form.
- Variation selectors are removed for storage and lookup.
- Skin-tone modifiers are removed for storage and lookup.
- Shortcodes and aliases are trimmed, lowercased, and deduplicated.
- Separator-based terms like `white_check_mark` also get a spaced variant like
  `white check mark`.
- Shortcode maps stay shortcode-only and do not widen into label/tag aliases.
- Locale-fallback Emojibase maps include `label` by default and keep `tags`
  opt-in.

This keeps lookup predictable while still returning a plain data structure that
any consumer can own and pass around.

## Non-Goals In V1

- No search scoring or weighting config
- No picker-specific API shape
- No bundled shortcode dataset
- No callback-based search API
- No runtime dependency on `emojibase` data packages

V1 ships loader-style utilities only. Raw shortcode source data should remain
consumer-owned until there is a strong reason to bundle generated metadata.
