import { describe, expect, it } from "vitest";
import {
  buildNativeEmojiSearchTermMap,
  getNativeEmojiSearchTerms,
  mergeNativeEmojiSearchTermMaps,
  normalizeNativeEmojiSearchKey,
} from "../index";

describe("buildNativeEmojiSearchTermMap", () => {
  it("looks up terms by the base emoji key", () => {
    const termMap = buildNativeEmojiSearchTermMap([
      {
        emoji: "👍",
        shortcodes: ["+1", "thumbsup"],
        aliases: ["like"],
      },
    ]);

    expect(termMap).toEqual({
      "👍": ["+1", "thumbsup", "like"],
    });
    expect(getNativeEmojiSearchTerms(termMap, "👍")).toEqual([
      "+1",
      "thumbsup",
      "like",
    ]);
    expect(getNativeEmojiSearchTerms(termMap, "👍🏽")).toEqual([
      "+1",
      "thumbsup",
      "like",
    ]);
  });

  it("expands shortcode and alias terms into predictable search variants", () => {
    const termMap = buildNativeEmojiSearchTermMap([
      {
        emoji: "✅",
        shortcodes: [":white_check_mark:"],
        aliases: ["check-mark", " done "],
      },
    ]);

    expect(termMap["✅"]).toEqual([
      "white_check_mark",
      "white check mark",
      "check-mark",
      "check mark",
      "done",
    ]);
  });

  it("normalizes variation selectors for storage and lookup", () => {
    const termMap = buildNativeEmojiSearchTermMap([
      {
        emoji: "❤️",
        shortcodes: ["red_heart"],
      },
    ]);

    expect(termMap).toEqual({
      "❤": ["red_heart", "red heart"],
    });
    expect(getNativeEmojiSearchTerms(termMap, "❤️")).toEqual([
      "red_heart",
      "red heart",
    ]);
    expect(getNativeEmojiSearchTerms(termMap, "❤")).toEqual([
      "red_heart",
      "red heart",
    ]);
  });

  it("collapses skin-tone entries onto the base key", () => {
    const termMap = buildNativeEmojiSearchTermMap([
      {
        emoji: "👍🏽",
        shortcodes: ["thumbs_up_medium_skin_tone"],
      },
      {
        emoji: "👍",
        aliases: ["thumbs-up"],
      },
    ]);

    expect(termMap).toEqual({
      "👍": [
        "thumbs_up_medium_skin_tone",
        "thumbs up medium skin tone",
        "thumbs-up",
        "thumbs up",
      ],
    });
    expect(getNativeEmojiSearchTerms(termMap, "👍🏻")).toEqual([
      "thumbs_up_medium_skin_tone",
      "thumbs up medium skin tone",
      "thumbs-up",
      "thumbs up",
    ]);
  });

  it("deduplicates normalized terms and skips empty candidates", () => {
    const termMap = buildNativeEmojiSearchTermMap([
      {
        emoji: "✅",
        shortcodes: [":white_check_mark:", "white_check_mark", ""],
        aliases: ["white check mark", "   "],
      },
    ]);

    expect(termMap).toEqual({
      "✅": ["white_check_mark", "white check mark"],
    });
  });

  it("merges and deduplicates multiple term maps", () => {
    const merged = mergeNativeEmojiSearchTermMaps(
      {
        "❤️": ["red_heart", "red heart"],
        "👍": ["+1"],
      },
      {
        "❤": ["red heart", "love"],
        "👍🏽": ["thumbsup"],
      },
    );

    expect(merged).toEqual({
      "❤": ["red_heart", "red heart", "love"],
      "👍": ["+1", "thumbsup"],
    });
  });
});

describe("normalizeNativeEmojiSearchKey", () => {
  it("removes variation selectors and skin tone modifiers", () => {
    expect(normalizeNativeEmojiSearchKey("✌️")).toBe("✌");
    expect(normalizeNativeEmojiSearchKey("👍🏿")).toBe("👍");
  });
});
