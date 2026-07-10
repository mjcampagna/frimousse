import { describe, expect, it } from "vitest";
import type { EmojiDataEmoji } from "../../types";
import type {
  EmojiPickerSection,
  EmojiPickerSupplementalConfig,
  SupplementalEmojiPickerItem,
} from "../../supplemental-types";
import {
  buildSupplementalSections,
  buildUnifiedSearchRows,
  toNativeEmojiPickerItem,
} from "../supplemental";

const nativeEmojis: EmojiDataEmoji[] = [
  {
    emoji: "😀",
    category: 0,
    version: 1,
    label: "Grinning face",
    tags: ["face", "grinning", "smile"],
    countryFlag: undefined,
    skins: undefined,
  },
  {
    emoji: "🎉",
    category: 1,
    version: 1,
    label: "Party popper",
    tags: ["party", "celebrate", "tada"],
    countryFlag: undefined,
    skins: undefined,
  },
  {
    emoji: "👋",
    category: 2,
    version: 1,
    label: "Waving hand",
    tags: ["wave", "hello"],
    countryFlag: undefined,
    skins: {
      light: "👋🏻",
      "medium-light": "👋🏼",
      medium: "👋🏽",
      "medium-dark": "👋🏾",
      dark: "👋🏿",
    },
  },
];

const supplementalSections: EmojiPickerSection<SupplementalEmojiPickerItem>[] = [
  {
    id: "favorites",
    label: "Favorites",
    position: "prepend",
    searchable: false,
    items: [
      {
        kind: "supplemental",
        id: "shipit",
        label: "Ship It",
        aliases: ["ship_it"],
        tags: ["approve"],
      },
    ],
  },
  {
    id: "team",
    label: "Team",
    position: "append",
    items: [
      {
        kind: "supplemental",
        id: "grinning-bot",
        label: "Grinning Bot",
        aliases: ["grinning_bot"],
        tags: ["grinning", "bot"],
      },
      {
        kind: "supplemental",
        id: "party-parrot",
        label: "Party Parrot",
        aliases: ["party_parrot"],
        tags: ["party", "celebrate"],
      },
    ],
  },
];

describe("toNativeEmojiPickerItem", () => {
  it("should derive a stable item shape for native emojis", () => {
    expect(toNativeEmojiPickerItem(nativeEmojis[0]!, undefined)).toEqual({
      kind: "native",
      id: "😀",
      emoji: "😀",
      label: "Grinning face",
    });
  });

  it("should apply skin tone variants when available", () => {
    expect(toNativeEmojiPickerItem(nativeEmojis[2]!, "dark")).toEqual({
      kind: "native",
      id: "👋🏿",
      emoji: "👋🏿",
      label: "Waving hand",
    });
  });
});

describe("buildSupplementalSections", () => {
  it("should build rows and categories for supplemental sections", () => {
    const result = buildSupplementalSections(supplementalSections, "", 1, 3, 5);

    expect(result.count).toBe(3);
    expect(result.categories).toEqual([
      {
        label: "Favorites",
        rowsCount: 1,
        startRowIndex: 5,
      },
      {
        label: "Team",
        rowsCount: 2,
        startRowIndex: 6,
      },
    ]);
    expect(result.rows).toHaveLength(3);
    expect(result.rows[0]?.categoryIndex).toBe(3);
    expect(result.rows[1]?.categoryIndex).toBe(4);
    expect(result.rows[2]?.categoryIndex).toBe(4);
  });

  it("should filter items by normalized search text", () => {
    const result = buildSupplementalSections(
      supplementalSections,
      "grinning_bot",
      10,
      0,
      0,
    );

    expect(result.count).toBe(1);
    expect(result.categories).toEqual([
      {
        label: "Team",
        rowsCount: 1,
        startRowIndex: 0,
      },
    ]);
    const item = result.rows[0]?.emojis[0];
    expect(item && "id" in item ? item.id : undefined).toBe("grinning-bot");
  });

  it("should exclude non-searchable sections during search", () => {
    const result = buildSupplementalSections(
      supplementalSections,
      "ship",
      10,
      0,
      0,
    );

    expect(result.count).toBe(0);
    expect(result.categories).toEqual([]);
    expect(result.rows).toEqual([]);
  });

  it("should rank better matches ahead of weaker ones", () => {
    const result = buildSupplementalSections(
      supplementalSections,
      "party",
      10,
      0,
      0,
    );

    const firstItem = result.rows[0]?.emojis[0];

    expect(firstItem && "id" in firstItem ? firstItem.id : undefined).toBe(
      "party-parrot",
    );
  });
});

describe("buildUnifiedSearchRows", () => {
  const supplemental: EmojiPickerSupplementalConfig = {
    sections: supplementalSections,
    search: {
      mode: "unified",
      resultsLabel: "Results",
    },
  };

  it("should return null when unified mode is not active", () => {
    expect(
      buildUnifiedSearchRows(
        nativeEmojis,
        { sections: supplementalSections, search: { mode: "grouped" } },
        "grinning",
        10,
        undefined,
      ),
    ).toBeNull();
    expect(
      buildUnifiedSearchRows(nativeEmojis, supplemental, "", 10, undefined),
    ).toBeNull();
  });

  it("should merge native and supplemental matches into one category", () => {
    const result = buildUnifiedSearchRows(
      nativeEmojis,
      supplemental,
      "grinning",
      10,
      undefined,
    );

    expect(result).not.toBeNull();
    expect(result?.count).toBe(2);
    expect(result?.categories).toEqual([
      {
        label: "Results",
        rowsCount: 1,
        startRowIndex: 0,
      },
    ]);
    expect(result?.rows).toHaveLength(1);
    expect(result?.rows[0]?.emojis.map((item) => item.kind)).toEqual([
      "supplemental",
      "native",
    ]);
  });

  it("should exclude non-searchable sections from unified results", () => {
    const result = buildUnifiedSearchRows(
      nativeEmojis,
      supplemental,
      "ship",
      10,
      undefined,
    );

    expect(result).toEqual({
      count: 0,
      categories: [],
      rows: [],
    });
  });
});
