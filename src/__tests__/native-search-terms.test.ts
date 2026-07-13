import { describe, expect, it } from "vitest";
import {
  buildNativeSearchTermsMap,
  type NativeSearchTermSource,
} from "../native-search-terms";

describe("buildNativeSearchTermsMap", () => {
  it("should combine shortcode-like sources into the native terms shape", () => {
    const entries: NativeSearchTermSource[] = [
      {
        emoji: "👋",
        shortcodes: ["good_bye", "see_you"],
        aliases: ["ttyl"],
        terms: ["wave"],
      },
      {
        emoji: "❤️",
        shortcodes: ["red_heart", "red_heart"],
        aliases: ["love", " love "],
      },
    ];

    expect(buildNativeSearchTermsMap(entries)).toEqual({
      "👋": ["good_bye", "see_you", "ttyl", "wave"],
      "❤️": ["red_heart", "love"],
    });
  });

  it("should omit entries that do not contribute any search terms", () => {
    expect(
      buildNativeSearchTermsMap([
        {
          emoji: "😀",
          shortcodes: ["  "],
          aliases: [],
        },
      ]),
    ).toEqual({});
  });
});
