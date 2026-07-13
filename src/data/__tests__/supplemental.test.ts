import { describe, expect, it } from "vitest";
import { buildNativeSearchTermsMap } from "../../native-search-terms";
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

const nativeSearchSection: EmojiPickerSection = {
  id: "native-search",
  label: "Native search",
  items: [
    {
      kind: "native",
      id: "🎉",
      emoji: "🎉",
      label: "Party popper",
    },
  ],
};

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

const opaqueDataSection: EmojiPickerSection = {
  id: "opaque",
  label: "Opaque",
  items: [
    {
      kind: "supplemental",
      id: "build-bot",
      label: "Build Bot",
      data: {
        hiddenSearchTerm: "deploy-only",
      },
    },
  ],
};

const weightedSearchSection: EmojiPickerSection = {
  id: "weighted",
  label: "Weighted",
  items: [
    {
      kind: "supplemental",
      id: "deploy-bot",
      label: "Build Bot",
      aliases: ["deploy helper"],
      keywords: ["release automation"],
      tags: ["ops"],
    },
    {
      kind: "supplemental",
      id: "ops-bot",
      label: "Build Bot",
      keywords: ["deploy helper"],
      tags: ["ops"],
    },
    {
      kind: "supplemental",
      id: "ops-helper",
      label: "Build Bot",
      tags: ["deploy helper"],
    },
    {
      kind: "supplemental",
      id: "deploy-helper",
      label: "Build Bot",
    },
  ],
};

const shortcodeFirstSection: EmojiPickerSection = {
  id: "custom-shortcodes",
  label: "Custom",
  items: [
    {
      kind: "supplemental",
      id: "wave_party",
      label: "Wave Party",
      aliases: [":wave_party:", "wave-party"],
      tags: ["celebrate"],
    },
    {
      kind: "supplemental",
      id: "wave_hello",
      label: "Wave Hello",
      aliases: [":wave_hello:"],
      tags: ["greeting"],
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

  it("should omit non-matching sections while preserving matching section order", () => {
    const result = buildSupplementalSections(
      supplementalSections,
      "party",
      10,
      2,
      4,
    );

    expect(result.categories).toEqual([
      {
        label: "Team",
        rowsCount: 1,
        startRowIndex: 4,
      },
    ]);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.categoryIndex).toBe(2);
    expect(result.rows[0]?.emojis.map((item) => item.id)).toEqual([
      "party-parrot",
    ]);
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

  it("should not treat opaque consumer data as searchable metadata", () => {
    const result = buildSupplementalSections(
      [opaqueDataSection],
      "deploy-only",
      10,
      0,
      0,
    );

    expect(result.count).toBe(0);
    expect(result.categories).toEqual([]);
    expect(result.rows).toEqual([]);
  });

  it("should weight alias matches ahead of keyword, tag, and id fallback matches", () => {
    const result = buildSupplementalSections(
      [weightedSearchSection],
      "deploy helper",
      10,
      0,
      0,
    );

    const items = result.rows[0]?.emojis as EmojiPickerItem[] | undefined;

    expect(items?.map((item) => item.id)).toEqual([
      "deploy-bot",
      "ops-bot",
      "ops-helper",
      "deploy-helper",
    ]);
  });

  it("should allow consumers to override supplemental search weights", () => {
    const result = buildSupplementalSections(
      [weightedSearchSection],
      "deploy helper",
      10,
      0,
      0,
      {
        weights: {
          tags: 8,
          aliases: 2,
          keywords: 1,
          id: 0,
        },
      },
    );

    const items = result.rows[0]?.emojis as EmojiPickerItem[] | undefined;

    expect(items?.map((item) => item.id)).toEqual([
      "ops-helper",
      "deploy-bot",
      "ops-bot",
    ]);
  });

  it("should search native items in custom sections by dataset tags", () => {
    const result = buildSupplementalSections(
      [nativeSearchSection],
      "tada",
      10,
      0,
      0,
      undefined,
      undefined,
      nativeEmojis,
    );

    expect(result.rows[0]?.emojis.map((item) => item.id)).toEqual(["🎉"]);
  });

  it("should search native items in custom sections by configured native terms", () => {
    const result = buildSupplementalSections(
      [nativeSearchSection],
      "confetti cannon",
      10,
      0,
      0,
      undefined,
      {
        native: {
          terms: {
            "🎉": ["confetti_cannon"],
          },
        },
      },
      nativeEmojis,
    );

    expect(result.rows[0]?.emojis.map((item) => item.id)).toEqual(["🎉"]);
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

  it("should include configured native search terms for section-native items in unified search", () => {
    const result = buildUnifiedSearchRows(
      nativeEmojis,
      {
        sections: [nativeSearchSection],
        search: {
          mode: "unified",
          resultsLabel: "Results",
        },
      },
      "confetti cannon",
      10,
      undefined,
      {
        native: {
          terms: {
            "🎉": ["confetti_cannon"],
          },
        },
      },
    );

    expect(result?.rows[0]?.emojis.map((item) => item.id)).toEqual(["🎉"]);
  });

  it("should support shortcode-first native and supplemental search in one unified result set", () => {
    const nativeTerms = buildNativeSearchTermsMap([
      {
        emoji: "👋",
        shortcodes: ["wave_party"],
        aliases: [":wave_party:"],
      },
    ]);

    const result = buildUnifiedSearchRows(
      nativeEmojis,
      {
        sections: [shortcodeFirstSection],
        search: {
          mode: "unified",
          resultsLabel: "Results",
        },
      },
      "wave_party",
      10,
      undefined,
      {
        native: {
          terms: nativeTerms,
        },
      },
    );

    expect(result?.rows[0]?.emojis.map((item) => item.id)).toEqual([
      "wave_party",
      "👋",
    ]);
    expect(result?.rows[0]?.emojis.map((item) => item.kind)).toEqual([
      "supplemental",
      "native",
    ]);
  });

  it("should apply supplemental search weights in unified search ordering", () => {
    const result = buildUnifiedSearchRows(
      nativeEmojis,
      {
        sections: [weightedSearchSection],
        search: {
          mode: "unified",
          weights: {
            tags: 8,
            aliases: 2,
            keywords: 1,
            id: 0,
          },
        },
      },
      "deploy helper",
      10,
      undefined,
    );

    expect(result?.rows[0]?.emojis.map((item) => item.id)).toEqual([
      "ops-helper",
      "deploy-bot",
      "ops-bot",
    ]);
  });
});
