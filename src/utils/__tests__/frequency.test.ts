import { describe, expect, it } from "vitest";
import {
  buildEmojiPickerFrequentSection,
  getEmojiPickerUsageKey,
  rankEmojiPickerUsage,
  recordEmojiPickerUsage,
} from "../../frequency";
import type {
  EmojiPickerItem,
  EmojiPickerSelection,
} from "../../supplemental-types";

const nativeItem: EmojiPickerItem = {
  kind: "native",
  id: "😀",
  emoji: "😀",
  label: "Grinning face",
};

const supplementalItem: EmojiPickerItem = {
  kind: "supplemental",
  id: "shipit",
  label: "Ship It",
  aliases: ["ship it"],
};

describe("getEmojiPickerUsageKey", () => {
  it("should derive stable keys for items and selections", () => {
    const selection: EmojiPickerSelection = {
      kind: "supplemental",
      item: supplementalItem,
    };

    expect(getEmojiPickerUsageKey(nativeItem)).toBe("native:😀");
    expect(getEmojiPickerUsageKey(selection)).toBe("supplemental:shipit");
  });
});

describe("recordEmojiPickerUsage", () => {
  it("should create a new entry for the first usage", () => {
    const result = recordEmojiPickerUsage([], nativeItem, { now: 1_000 });

    expect(result).toEqual([
      {
        key: "native:😀",
        item: nativeItem,
        score: 1,
        uses: 1,
        lastUsedAt: 1_000,
      },
    ]);
  });

  it("should apply decay before incrementing an existing entry", () => {
    const result = recordEmojiPickerUsage(
      [
        {
          key: "native:😀",
          item: nativeItem,
          score: 4,
          uses: 2,
          lastUsedAt: 0,
        },
      ],
      nativeItem,
      { now: 1_000, halfLifeMs: 1_000 },
    );

    expect(result).toEqual([
      {
        key: "native:😀",
        item: nativeItem,
        score: 3,
        uses: 3,
        lastUsedAt: 1_000,
      },
    ]);
  });

  it("should retain mixed native and supplemental entries and trim to maxEntries", () => {
    const result = recordEmojiPickerUsage(
      [
        {
          key: "supplemental:shipit",
          item: supplementalItem,
          score: 1,
          uses: 1,
          lastUsedAt: 10,
        },
      ],
      nativeItem,
      { now: 20, maxEntries: 1 },
    );

    expect(result).toEqual([
      {
        key: "native:😀",
        item: nativeItem,
        score: 1,
        uses: 1,
        lastUsedAt: 20,
      },
    ]);
  });
});

describe("rankEmojiPickerUsage", () => {
  it("should order entries by decayed score and recency", () => {
    const result = rankEmojiPickerUsage(
      [
        {
          key: "native:😀",
          item: nativeItem,
          score: 4,
          uses: 4,
          lastUsedAt: 0,
        },
        {
          key: "supplemental:shipit",
          item: supplementalItem,
          score: 2,
          uses: 2,
          lastUsedAt: 1_000,
        },
      ],
      {
        now: 1_000,
        halfLifeMs: 1_000,
      },
    );

    expect(result.map((entry) => entry.key)).toEqual([
      "supplemental:shipit",
      "native:😀",
    ]);
  });
});

describe("buildEmojiPickerFrequentSection", () => {
  it("should build a prepended mixed section from ranked usage entries", () => {
    const result = buildEmojiPickerFrequentSection(
      [
        {
          key: "supplemental:shipit",
          item: supplementalItem,
          score: 3,
          uses: 3,
          lastUsedAt: 2_000,
        },
        {
          key: "native:😀",
          item: nativeItem,
          score: 2,
          uses: 2,
          lastUsedAt: 1_000,
        },
      ],
      { now: 2_000 },
    );

    expect(result).toEqual({
      id: "frequently-used",
      label: "Frequently used",
      position: "prepend",
      searchable: false,
      items: [supplementalItem, nativeItem],
    });
  });

  it("should return null when there are no usable entries", () => {
    expect(buildEmojiPickerFrequentSection([], { now: 0 })).toBeNull();
  });

  it("should honor consumer overrides", () => {
    const result = buildEmojiPickerFrequentSection(
      [
        {
          key: "native:😀",
          item: nativeItem,
          score: 1,
          uses: 1,
          lastUsedAt: 0,
        },
      ],
      {
        id: "recent",
        label: "Recent",
        position: "append",
        searchable: true,
        limit: 1,
        now: 0,
      },
    );

    expect(result).toEqual({
      id: "recent",
      label: "Recent",
      position: "append",
      searchable: true,
      items: [nativeItem],
    });
  });
});
