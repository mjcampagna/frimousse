import { describe, expect, it } from "vitest";
import { buildNativeSearchTermsMap } from "../../native-search-terms";
import type { EmojiData } from "../../types";
import { getEmojiPickerData } from "../emoji-picker";

const data: EmojiData = {
  locale: "en",
  categories: [
    {
      index: 0,
      label: "People & body",
    },
    {
      index: 1,
      label: "Activities",
    },
  ],
  emojis: [
    {
      emoji: "👋",
      category: 0,
      label: "Waving hand",
      version: 1,
      tags: ["hello", "wave"],
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
      emoji: "🎉",
      category: 1,
      label: "Party popper",
      version: 1,
      tags: ["party", "celebrate"],
      countryFlag: undefined,
      skins: undefined,
    },
  ],
  skinTones: {
    light: "🏻",
    "medium-light": "🏼",
    medium: "🏽",
    "medium-dark": "🏾",
    dark: "🏿",
  },
};

describe("search hardening", () => {
  it("should preserve grouped native and supplemental sections when native enrichment is configured", () => {
    const nativeTerms = buildNativeSearchTermsMap([
      {
        emoji: "👋",
        terms: ["wave party"],
      },
    ]);

    const result = getEmojiPickerData(
      data,
      10,
      undefined,
      "wave party",
      {
        sections: [
          {
            id: "custom",
            label: "Custom",
            position: "append",
            items: [
              {
                kind: "supplemental",
                id: "wave_party",
                label: "Wave Party",
                aliases: [":wave_party:"],
              },
            ],
          },
        ],
        search: {
          mode: "grouped",
          resultsLabel: "Results",
        },
      },
      {
        native: {
          terms: nativeTerms,
        },
      },
    );

    expect(result.categories).toEqual([
      {
        label: "People & body",
        rowsCount: 1,
        startRowIndex: 0,
      },
      {
        label: "Custom",
        rowsCount: 1,
        startRowIndex: 1,
      },
    ]);
    expect(result.rows[0]?.emojis.map((item) => item.id)).toEqual(["👋"]);
    expect(result.rows[1]?.emojis.map((item) => item.id)).toEqual([
      "wave_party",
    ]);
  });

  it("should combine native enrichment with supplemental weighting in unified search", () => {
    const nativeTerms = buildNativeSearchTermsMap([
      {
        emoji: "👋",
        terms: ["wave party"],
      },
    ]);

    const result = getEmojiPickerData(
      data,
      10,
      undefined,
      "wave party",
      {
        sections: [
          {
            id: "custom",
            label: "Custom",
            position: "append",
            items: [
              {
                kind: "supplemental",
                id: "wave_party",
                label: "Wave Party",
                aliases: [":wave_party:"],
              },
              {
                kind: "supplemental",
                id: "wave-helper",
                label: "Wave Helper",
                tags: ["wave party"],
              },
            ],
          },
        ],
        search: {
          mode: "unified",
          resultsLabel: "Results",
          weights: {
            aliases: 8,
            tags: 1,
            id: 0,
          },
        },
      },
      {
        native: {
          terms: nativeTerms,
        },
      },
    );

    expect(result.categories).toEqual([
      {
        label: "Results",
        rowsCount: 1,
        startRowIndex: 0,
      },
    ]);
    expect(result.rows[0]?.emojis.map((item) => item.id)).toEqual([
      "wave_party",
      "👋",
      "wave-helper",
    ]);
  });
});
