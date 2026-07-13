# Extensions Guide

This guide documents the additive APIs available in this repository beyond the baseline upstream picker composition examples.

The goal of these extensions is to stay compatibility-conscious:

- existing consumers can keep using `EmojiPicker.Root`, `EmojiPicker.Search`, `EmojiPicker.Viewport`, and `EmojiPicker.List` as before
- new behavior is opt-in
- consumer applications remain in control of storage, rendering, and product-specific policy

## Core concepts

The picker now exposes three related extension seams:

- mixed sections via `supplemental.sections`
- widened selection callbacks via `onItemSelect`
- helper utilities for frequent items and image-backed custom emoji

The base concepts are:

- native item: a standard Unicode emoji provided by the Emojibase dataset
- supplemental item: a consumer-provided item rendered alongside native emoji
- mixed section: a consumer-provided section that may contain native items, supplemental items, or both

Custom emoji build on the supplemental seam rather than introducing a separate picker-only data model.

## Mixed sections

Use `supplemental.sections` when you want to inject consumer-defined categories before or after the built-in dataset.

```tsx
import { EmojiPicker } from "@slithy/frimousse";

const supplemental = {
  sections: [
    {
      id: "favorites",
      label: "Favorites",
      position: "prepend" as const,
      items: [
        {
          kind: "native" as const,
          id: "🎉",
          emoji: "🎉",
          label: "Party popper",
        },
        {
          kind: "supplemental" as const,
          id: "shipit",
          label: "Ship It",
          imageUrl: "https://example.com/shipit.png",
          aliases: ["ship it"],
        },
      ],
    },
  ],
};

export function MyEmojiPicker() {
  return (
    <EmojiPicker.Root supplemental={supplemental}>
      <EmojiPicker.Search />
      <EmojiPicker.Viewport>
        <EmojiPicker.List />
      </EmojiPicker.Viewport>
    </EmojiPicker.Root>
  );
}
```

Notes:

- `position` defaults to `"append"`
- `searchable` defaults to `true`
- duplicate items may appear in multiple sections
- active highlight is per occurrence, not per shared item identity

## Selection APIs

Two selection APIs now coexist:

- `onEmojiSelect` remains native-only
- `onItemSelect` includes both native and supplemental items

```tsx
import { EmojiPicker } from "@slithy/frimousse";

<EmojiPicker.Root
  onEmojiSelect={({ emoji, label }) => {
    console.log("native only", emoji, label);
  }}
  onItemSelect={(selection) => {
    if (selection.kind === "native") {
      console.log("native", selection.item.emoji);
    } else {
      console.log("supplemental", selection.item.id);
    }
  }}
>
  <EmojiPicker.Search />
  <EmojiPicker.Viewport>
    <EmojiPicker.List />
  </EmojiPicker.Viewport>
</EmojiPicker.Root>;
```

The same distinction applies to the preview helpers:

- `useActiveEmoji()` and `<EmojiPicker.ActiveEmoji />` remain native-only
- `useActiveItem()` and `<EmojiPicker.ActiveItem />` expose the widened selection

## Frequent items

Frequency tracking utilities are intentionally storage-agnostic.

The library provides:

- `recordEmojiPickerUsage`
- `rankEmojiPickerUsage`
- `buildEmojiPickerFrequentSection`

The consumer decides where usage data lives.

The built-in ranking model is frecency, not raw counts:

- every selection adds `1` to an item's score
- older score decays over time before the next increment
- entries are ordered by decayed score first, then recency, then total uses
- the default score half-life is `30` days

That makes the default helper behavior good for "Frequently used" sections without treating them as strict recents.

If you want a strict "Recently used" section instead, pass `mode: "recent"` to
the frequency helpers.

```tsx
import { useMemo, useState } from "react";
import {
  buildEmojiPickerFrequentSection,
  EmojiPicker,
  recordEmojiPickerUsage,
  sanitizeEmojiPickerUsageEntries,
  type EmojiPickerUsageEntry,
} from "@slithy/frimousse";

export function FrequentEmojiPicker() {
  const [usageEntries, setUsageEntries] = useState<EmojiPickerUsageEntry[]>(() =>
    sanitizeEmojiPickerUsageEntries([]),
  );

  const frequentSection = useMemo(
    () =>
      buildEmojiPickerFrequentSection(usageEntries, {
        label: "Frequently used",
        limit: 6,
        searchable: false,
      }),
    [usageEntries],
  );

  return (
    <EmojiPicker.Root
      supplemental={{
        sections: frequentSection ? [frequentSection] : [],
      }}
      onItemSelect={(selection) => {
        setUsageEntries((current) =>
          recordEmojiPickerUsage(current, selection),
        );
      }}
    >
      <EmojiPicker.Search />
      <EmojiPicker.Viewport>
        <EmojiPicker.List />
      </EmojiPicker.Viewport>
    </EmojiPicker.Root>
  );
}
```

By default, `buildEmojiPickerFrequentSection` creates a prepended section, but the section can be positioned anywhere through `position`.

If you persist usage entries outside memory, `sanitizeEmojiPickerUsageEntries`
is the small helper for turning unknown stored data back into a valid
`EmojiPickerUsageEntry[]`.

## Custom emoji helpers

Custom emoji are image-backed supplemental items with a required stable `id`.

The library provides:

- `createCustomEmoji`
- `createCustomSection`
- `isCustomEmoji`

```tsx
import {
  createCustomSection,
  EmojiPicker,
} from "@slithy/frimousse";

const customSection = createCustomSection(
  [
    {
      id: "shipit",
      label: "Ship It",
      imageUrl: "https://example.com/shipit.png",
      aliases: ["ship it"],
      tags: ["approval"],
    },
    {
      id: "party-parrot",
      label: "Party Parrot",
      imageUrl: "https://example.com/party-parrot.gif",
      aliases: ["party parrot"],
      tags: ["party", "celebrate"],
    },
  ],
  {
    id: "custom",
    label: "Custom emoji",
  },
);

export function CustomEmojiPicker() {
  return (
    <EmojiPicker.Root
      supplemental={{
        sections: [customSection],
        search: {
          mode: "unified",
          resultsLabel: "Results",
        },
      }}
    >
      <EmojiPicker.Search />
      <EmojiPicker.Viewport>
        <EmojiPicker.List />
      </EmojiPicker.Viewport>
    </EmojiPicker.Root>
  );
}
```

Notes:

- `id` is required and should come from the consumer’s own stable identity model
- if your product treats shortcode as the canonical custom-emoji identity, use that shortcode as `id`
- `imageUrl` is presentation data, not fallback identity
- `aliases`, `keywords`, and `tags` are optional search inputs for supplemental matching; alternate shortcode forms belong in `aliases`
- `data` is opaque consumer payload that the picker preserves but does not read
- `label` defaults to `id` if omitted
- blank list entries and empty string metadata are normalized away

This lines up well with Slack-style custom emoji models, where the custom emoji name is the durable identity users type, search, and persist.

## Rendering image-backed items

The default supplemental renderer will display `imageUrl` items out of the box.

Override `components.SupplementalEmoji` when you want application-specific visuals:

```tsx
<EmojiPicker.List
  components={{
    SupplementalEmoji: ({ emoji, ...props }) => (
      <button {...props} type="button">
        {emoji.imageUrl ? (
          <img
            src={emoji.imageUrl}
            alt={emoji.label}
            width="20"
            height="20"
          />
        ) : (
          emoji.label
        )}
      </button>
    ),
  }}
/>
```

## Composing everything together

The three seams are designed to compose:

- custom emoji can live in their own section
- frequently used items can mix native and custom items
- unified search can search across native and supplemental items together

The local playground demonstrates this combined setup:

- helper-created custom emoji
- consumer-owned frequent tracking
- unified search
- mixed prepended and appended sections

## Summary

When choosing APIs:

- use `supplemental.sections` to add categories
- use `onItemSelect` when you care about native and supplemental items together
- use the frequency helpers when the consumer should own usage persistence
- use the custom emoji helpers when you want stable, image-backed supplemental items

These extensions are intentionally additive and should not interfere with consumers who only need the baseline picker composition model.
