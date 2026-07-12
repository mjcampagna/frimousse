import { describe, expect, it } from "vitest";
import type { EmojiDataEmoji } from "../../types";
import {
  createNativeSearchTermsMap,
  normalizeNativeSearchKey,
  normalizeNativeSearchText,
  scoreNativeEmojiMatch,
} from "../native-search";

const wavingHand: EmojiDataEmoji = {
  emoji: "👋",
  category: 1,
  version: 0.6,
  label: "Waving hand",
  tags: ["hello", "wave"],
  countryFlag: undefined,
  skins: {
    light: "👋🏻",
    "medium-light": "👋🏼",
    medium: "👋🏽",
    "medium-dark": "👋🏾",
    dark: "👋🏿",
  },
};

describe("native search helpers", () => {
  it("normalizes search keys and search text", () => {
    expect(normalizeNativeSearchKey("❤️")).toBe("❤");
    expect(normalizeNativeSearchKey("👍🏽")).toBe("👍");
    expect(normalizeNativeSearchText(" White_Check-Mark ")).toBe("white check mark");
  });

  it("normalizes configured native term keys", () => {
    const terms = createNativeSearchTermsMap({
      native: {
        terms: {
          "👋🏽": ["good_bye"],
          "❤️": ["red_heart"],
        },
      },
    });

    expect(terms?.get("👋")).toEqual(["good_bye"]);
    expect(terms?.get("❤")).toEqual(["red_heart"]);
  });

  it("scores configured native terms alongside labels and tags", () => {
    const terms = createNativeSearchTermsMap({
      native: {
        terms: {
          "👋": ["ttyl", "good_bye"],
        },
      },
    });

    expect(scoreNativeEmojiMatch(wavingHand, "ttyl", terms)).toBe(1);
    expect(scoreNativeEmojiMatch(wavingHand, "good bye", terms)).toBe(1);
    expect(scoreNativeEmojiMatch(wavingHand, "waving", terms)).toBe(10);
  });
});
