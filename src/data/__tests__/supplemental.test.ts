import { describe, expect, it } from "vitest";
import type { EmojiDataEmoji } from "../../types";
import type {
  EmojiPickerItem,
  EmojiPickerSection,
  EmojiPickerSupplementalConfig,
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

const supplementalSections: EmojiPickerSection[] = [
  {
    id: "favorites",
    label: "Favorites",
    position: "prepend",
    searchable: false,
    items: [
      {
        kind: "native",
        id: "😀",
        emoji: "😀",
        label: "Grinning face",
      },
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

const mixedSearchSection: EmojiPickerSection = {
  id: "frequently-used",
  label: "Frequently used",
  position: "prepend",
  items: [
    {
      kind: "native",
      id: "🎉",
      emoji: "🎉",
      label: "Party popper",
    },
    {
      kind: "supplemental",
      id: "party-parrot",
      label: "Party Parrot",
      aliases: ["party_parrot"],
      tags: ["party", "celebrate"],
    },
  ],
};

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

    expect(result.count).toBe(4);
    expect(result.categories).toEqual([
      {
        label: "Favorites",
        rowsCount: 2,
        startRowIndex: 5,
      },
      {
        label: "Team",
        rowsCount: 2,
        startRowIndex: 7,
      },
    ]);
    expect(result.rows).toHaveLength(4);
    expect(result.rows[0]?.categoryIndex).toBe(3);
    expect(result.rows[1]?.categoryIndex).toBe(3);
    expect(result.rows[2]?.categoryIndex).toBe(4);
    expect(result.rows[3]?.categoryIndex).toBe(4);
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
    const result = buildSupplementalSections([mixedSearchSection], "party", 10, 0, 0);
    const items = result.rows[0]?.emojis as EmojiPickerItem[] | undefined;

    expect(items?.map((item) => item.id)).toEqual(["party-parrot", "🎉"]);
  });

  it("should support mixed native and supplemental items within one section", () => {
    const result = buildSupplementalSections([mixedSearchSection], "", 2, 0, 0);

    expect(result.count).toBe(2);
    expect(result.categories).toEqual([
      {
        label: "Frequently used",
        rowsCount: 1,
        startRowIndex: 0,
      },
    ]);
    expect(result.rows[0]?.emojis.map((item) => item.kind)).toEqual([
      "native",
      "supplemental",
    ]);
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
      {
        ...supplemental,
        sections: [...supplementalSections, mixedSearchSection],
      },
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

  it("should include native items supplied through custom sections in unified search", () => {
    const result = buildUnifiedSearchRows(
      nativeEmojis,
      {
        ...supplemental,
        sections: [mixedSearchSection],
      },
      "party",
      10,
      undefined,
    );

    expect(result?.rows[0]?.emojis.map((item) => item.id)).toEqual([
      "party-parrot",
      "🎉",
    ]);
  });

  it("should dedupe identical supplemental items that appear in multiple sections", () => {
    const result = buildUnifiedSearchRows(
      nativeEmojis,
      {
        ...supplemental,
        sections: [mixedSearchSection, { ...mixedSearchSection, id: "copy" }],
      },
      "party",
      10,
      undefined,
    );

    expect(result?.rows[0]?.emojis.map((item) => item.id)).toEqual([
      "party-parrot",
      "🎉",
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

  it("should include configured native search terms in unified search", () => {
    const result = buildUnifiedSearchRows(
      nativeEmojis,
      supplemental,
      "good__bye",
      10,
      undefined,
      {
        native: {
          terms: {
            "👋": ["good_bye"],
          },
        },
      },
    );

    expect(result?.rows[0]?.emojis.map((item) => item.id)).toEqual(["👋"]);
  });
});
