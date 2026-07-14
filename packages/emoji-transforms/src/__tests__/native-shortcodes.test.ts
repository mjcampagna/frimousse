import { describe, expect, it } from "vitest";
import {
  buildShortcodeMap,
  getPrimaryShortcode,
  getShortcodes,
} from "../index";

describe("buildShortcodeMap", () => {
  it("builds a normalized shortcode-only map by base emoji key", () => {
    const shortcodeMap = buildShortcodeMap([
      {
        emoji: "❤️",
        shortcodes: [":red_heart:", "red_heart"],
        aliases: ["love"],
      },
    ]);

    expect(shortcodeMap).toEqual({
      "❤": ["red_heart"],
    });
    expect(getShortcodes(shortcodeMap, "❤️")).toEqual(["red_heart"]);
    expect(getShortcodes(shortcodeMap, "❤")).toEqual(["red_heart"]);
    expect(getPrimaryShortcode(shortcodeMap, "❤️")).toBe("red_heart");
  });

  it("collapses skin tone variants onto the base key", () => {
    const shortcodeMap = buildShortcodeMap([
      {
        emoji: "👍🏽",
        shortcodes: ["thumbs_up_medium_skin_tone"],
      },
      {
        emoji: "👍",
        shortcodes: ["+1"],
      },
    ]);

    expect(shortcodeMap).toEqual({
      "👍": ["thumbs_up_medium_skin_tone", "+1"],
    });
    expect(getShortcodes(shortcodeMap, "👍🏻")).toEqual([
      "thumbs_up_medium_skin_tone",
      "+1",
    ]);
  });

  it("skips aliases and empty shortcodes", () => {
    const shortcodeMap = buildShortcodeMap([
      {
        emoji: "✅",
        shortcodes: ["", " :white_check_mark: "],
        aliases: ["done"],
      },
    ]);

    expect(shortcodeMap).toEqual({
      "✅": ["white_check_mark"],
    });
  });
});
