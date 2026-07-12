import { describe, expect, it } from "vitest";
import type { EmojiData } from "../../types";
import { getEmojiPickerData, searchEmojis } from "../emoji-picker";

const data: EmojiData = {
  locale: "en",
  emojis: [
    {
      emoji: "🙂",
      category: 0,
      version: 1,
      label: "Slightly smiling face",
      tags: ["face", "happy", "slightly", "smile", "smiling"],
      countryFlag: undefined,
      skins: undefined,
    },
    {
      emoji: "👋",
      category: 1,
      version: 0.6,
      label: "Waving hand",
      tags: [
        "bye",
        "cya",
        "g2g",
        "greetings",
        "gtg",
        "hand",
        "hello",
        "hey",
        "hi",
        "later",
        "outtie",
        "ttfn",
        "ttyl",
        "wave",
        "yo",
        "you",
      ],
      countryFlag: undefined,
      skins: {
        light: "👋🏻",
        "medium-light": "👋🏼",
        medium: "👋🏽",
        "medium-dark": "👋🏾",
        dark: "👋🏿",
      },
    },
    {
      emoji: "🧑‍🤝‍🧑",
      category: 1,
      version: 12,
      label: "People holding hands",
      tags: [
        "bae",
        "bestie",
        "bff",
        "couple",
        "dating",
        "flirt",
        "friends",
        "hand",
        "hold",
        "people",
        "twins",
      ],
      countryFlag: undefined,
      skins: {
        light: "🧑🏻‍🤝‍🧑🏻",
        "medium-light": "🧑🏼‍🤝‍🧑🏼",
        medium: "🧑🏽‍🤝‍🧑🏽",
        "medium-dark": "🧑🏾‍🤝‍🧑🏾",
        dark: "🧑🏿‍🤝‍🧑🏿",
      },
    },
    {
      emoji: "🐈‍⬛",
      category: 3,
      version: 13,
      label: "Black cat",
      tags: [
        "animal",
        "black",
        "cat",
        "feline",
        "halloween",
        "meow",
        "unlucky",
      ],
      countryFlag: undefined,
      skins: undefined,
    },
    {
      emoji: "🥦",
      category: 4,
      version: 5,
      label: "Broccoli",
      tags: ["cabbage", "wild"],
      countryFlag: undefined,
      skins: undefined,
    },
    {
      emoji: "🚧",
      category: 5,
      version: 0.6,
      label: "Construction",
      tags: ["barrier"],
      countryFlag: undefined,
      skins: undefined,
    },
    {
      emoji: "🌚",
      category: 5,
      version: 1,
      label: "New moon face",
      tags: ["face", "moon", "new", "space"],
      countryFlag: undefined,
      skins: undefined,
    },
    {
      emoji: "🎉",
      category: 6,
      version: 0.6,
      label: "Party popper",
      tags: [
        "awesome",
        "birthday",
        "celebrate",
        "celebration",
        "excited",
        "hooray",
        "party",
        "popper",
        "tada",
        "woohoo",
      ],
      countryFlag: undefined,
      skins: undefined,
    },
    {
      emoji: "🔗",
      category: 7,
      version: 0.6,
      label: "Link",
      tags: ["links"],
      countryFlag: undefined,
      skins: undefined,
    },
    {
      emoji: "🦖",
      category: 3,
      version: 5,
      label: "T-Rex",
      tags: ["dinosaur"],
      countryFlag: undefined,
      skins: undefined,
    },
    {
      emoji: "🎦",
      category: 8,
      version: 0.6,
      label: "Cinema",
      tags: ["camera", "film", "movie"],
      countryFlag: undefined,
      skins: undefined,
    },
    {
      emoji: "🇪🇺",
      category: 9,
      version: 2,
      label: "Flag: European Union",
      tags: ["EU", "flag"],
      countryFlag: true,
      skins: undefined,
    },
  ],
  categories: [
    {
      index: 0,
      label: "Smileys & emotion",
    },
    {
      index: 1,
      label: "People & body",
    },
    {
      index: 3,
      label: "Animals & nature",
    },
    {
      index: 4,
      label: "Food & drink",
    },
    {
      index: 5,
      label: "Travel & places",
    },
    {
      index: 6,
      label: "Activities",
    },
    {
      index: 7,
      label: "Objects",
    },
    {
      index: 8,
      label: "Symbols",
    },
    {
      index: 9,
      label: "Flags",
    },
  ],
  skinTones: {
    dark: "Dark skin tone",
    light: "Light skin tone",
    medium: "Medium skin tone",
    "medium-dark": "Medium-dark skin tone",
    "medium-light": "Medium-light skin tone",
  },
};

const groupedSupplemental = {
  sections: [
    {
      id: "favorites",
      label: "Favorites",
      position: "prepend" as const,
      searchable: false,
      items: [
        {
          kind: "supplemental" as const,
          id: "shipit",
          label: "Ship It",
          aliases: ["ship it"],
        },
      ],
    },
    {
      id: "team",
      label: "Team",
      position: "append" as const,
      items: [
        {
          kind: "supplemental" as const,
          id: "party-parrot",
          label: "Party Parrot",
          aliases: ["party"],
        },
      ],
    },
  ],
  search: {
    mode: "grouped" as const,
    resultsLabel: "Results",
  },
};

describe("searchEmojis", () => {
  it("should return all emojis when search is missing or empty", () => {
    expect(searchEmojis(data.emojis)).toEqual(data.emojis);
    expect(searchEmojis(data.emojis, "")).toEqual(data.emojis);
  });

  it("should filter emojis by label", () => {
    const results = searchEmojis(data.emojis, "broccoli");

    expect(results).toHaveLength(1);
    expect(results[0]?.emoji).toBe("🥦");
    expect(searchEmojis(data.emojis, "   BrOcCoLi ")).toEqual(results);
  });

  it("should filter emojis by tags", () => {
    const results = searchEmojis(data.emojis, "film");

    expect(results).toHaveLength(1);
    expect(results[0]?.emoji).toBe("🎦");
    expect(searchEmojis(data.emojis, " FiLm   ")).toEqual(results);
  });

  it("should return an empty array if no match is found", () => {
    const results = searchEmojis(data.emojis, "unknown");

    expect(results).toHaveLength(0);
  });

  it("should normalize label matching for hyphenated queries", () => {
    const results = searchEmojis(data.emojis, "t-rex");

    expect(results).toHaveLength(1);
    expect(results[0]?.emoji).toBe("🦖");
  });

  it("should filter emojis by configured native search terms", () => {
    const results = searchEmojis(data.emojis, "hyper link", {
      native: {
        terms: {
          "🔗": ["hyper_link"],
        },
      },
    });

    expect(results).toHaveLength(1);
    expect(results[0]?.emoji).toBe("🔗");
  });

  it("should support VS16 and skin-tone-insensitive configured native term keys", () => {
    const results = searchEmojis(data.emojis, "good bye", {
      native: {
        terms: {
          "👋🏽": ["good_bye"],
          "❤️": ["red_heart"],
        },
      },
    });

    expect(results[0]?.emoji).toBe("👋");
  });

  it("should tolerate an empty native search config", () => {
    expect(
      searchEmojis(data.emojis, "film", {
        native: { terms: {} },
      }),
    ).toEqual(searchEmojis(data.emojis, "film"));
  });
});

describe("getEmojiPickerData", () => {
  it("should organize emojis into categories and rows", () => {
    const result = getEmojiPickerData(data, 10, undefined, "");

    expect(result.count).toBe(data.emojis.length);
    expect(result.categories.length).toBe(9);
    expect(result.rows.length).toBeGreaterThan(0);

    for (const category of result.categories) {
      expect(category).toHaveProperty("label");
      expect(category).toHaveProperty("rowsCount");
      expect(category).toHaveProperty("startRowIndex");
    }

    for (const row of result.rows) {
      expect(row).toHaveProperty("categoryIndex");
      expect(row).toHaveProperty("emojis");
      expect(Array.isArray(row.emojis)).toBe(true);
      expect(row.emojis.length).toBeLessThanOrEqual(10);
    }
  });

  it("should filter emojis based on search", () => {
    const result = getEmojiPickerData(data, 10, undefined, "broccoli");
    const firstEmoji = result.rows[0]?.emojis[0];

    expect(result.count).toBe(1);
    expect(result.categories.length).toBe(1);
    expect(result.categories[0]?.label).toBe("Food & drink");
    expect(result.rows.length).toBe(1);
    expect(firstEmoji && "emoji" in firstEmoji ? firstEmoji.emoji : undefined).toBe(
      "🥦",
    );
  });

  it("should apply skin tones when possible", () => {
    const result = getEmojiPickerData(data, 10, "dark", "");
    const emojis = result.rows.flatMap((row) => row.emojis);

    const emoji1 = emojis.find((emoji) => emoji.label === "Waving hand");
    expect(emoji1 && "emoji" in emoji1 ? emoji1.emoji : undefined).toBe("👋🏿");

    const emoji2 = emojis.find(
      (emoji) => emoji.label === "People holding hands",
    );
    expect(emoji2 && "emoji" in emoji2 ? emoji2.emoji : undefined).toBe(
      "🧑🏿‍🤝‍🧑🏿",
    );

    const emoji3 = emojis.find((emoji) => emoji.label === "Link");
    expect(emoji3 && "emoji" in emoji3 ? emoji3.emoji : undefined).toBe("🔗");
  });

  it("should support empty search results", () => {
    const result = getEmojiPickerData(data, 10, undefined, "..........");

    expect(result.count).toBe(0);
    expect(result.categories).toEqual([]);
    expect(result.rows).toEqual([]);
    expect(result.categoriesStartRowIndices).toEqual([]);
  });

  it("should include configured native search terms in grouped native search", () => {
    const result = getEmojiPickerData(
      data,
      10,
      undefined,
      "hyper link",
      undefined,
      {
        native: {
          terms: {
            "🔗": ["hyper_link"],
          },
        },
      },
    );

    expect(result.count).toBe(1);
    expect(result.categories[0]?.label).toBe("Objects");
    expect(result.rows[0]?.emojis[0]?.id).toBe("🔗");
  });

  it("should apply configured native search terms with skin tone output", () => {
    const result = getEmojiPickerData(
      data,
      10,
      "dark",
      "good bye",
      undefined,
      {
        native: {
          terms: {
            "👋": ["good_bye"],
          },
        },
      },
    );

    expect(result.rows[0]?.emojis[0]?.id).toBe("👋🏿");
  });

  it("should keep grouped search results split by section and native category", () => {
    const result = getEmojiPickerData(
      data,
      10,
      undefined,
      "party",
      groupedSupplemental,
    );

    expect(result.count).toBe(2);
    expect(result.categories).toEqual([
      {
        label: "Activities",
        rowsCount: 1,
        startRowIndex: 0,
      },
      {
        label: "Team",
        rowsCount: 1,
        startRowIndex: 1,
      },
    ]);
    expect(result.categoriesStartRowIndices).toEqual([0, 1]);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]?.emojis.map((item) => item.id)).toEqual(["🎉"]);
    expect(result.rows[1]?.emojis.map((item) => item.id)).toEqual(["party-parrot"]);
  });
});
