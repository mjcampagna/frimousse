import { describe, expect, it } from "vitest";
import {
  getEmojiPrimaryShortcode,
  getEmojiShortcodes,
} from "../shortcodes";
import type { ItemSelection } from "../supplemental-types";

describe("getEmojiShortcodes", () => {
  it("should derive canonical and alias shortcodes for supplemental items", () => {
    expect(
      getEmojiShortcodes({
        kind: "supplemental",
        id: "shipit",
        label: "Ship It",
        shortcode: "ship_it",
        aliases: ["ship-it", ":shipit:"],
      }),
    ).toEqual([":ship_it:", ":shipit:"]);
  });

  it("should fall back to the supplemental id when no explicit shortcode is set", () => {
    expect(
      getEmojiShortcodes({
        kind: "supplemental",
        id: "party parrot",
        label: "Party Parrot",
      }),
    ).toEqual([":party_parrot:"]);
  });

  it("should read native shortcodes from consumer-provided mappings", () => {
    expect(
      getEmojiShortcodes(
        {
          kind: "native",
          id: "👋",
          emoji: "👋",
          label: "Waving hand",
        },
        {
          nativeShortcodes: {
            "👋": ["wave_party", ":hello-there:"],
          },
        },
      ),
    ).toEqual([":wave_party:", ":hello_there:"]);
  });

  it("should read native shortcodes from normalized base-emoji keys", () => {
    expect(
      getEmojiShortcodes(
        {
          kind: "native",
          id: "❤️",
          emoji: "❤️",
          label: "Red heart",
        },
        {
          nativeShortcodes: {
            "❤": ["red_heart"],
          },
        },
      ),
    ).toEqual([":red_heart:"]);

    expect(
      getEmojiShortcodes(
        {
          kind: "native",
          id: "👍🏽",
          emoji: "👍🏽",
          label: "Thumbs up",
        },
        {
          nativeShortcodes: {
            "👍": ["+1"],
          },
        },
      ),
    ).toEqual([":+1:"]);
  });

  it("should preserve symbolic native shortcodes like -1", () => {
    expect(
      getEmojiShortcodes(
        {
          kind: "native",
          id: "👎🏽",
          emoji: "👎🏽",
          label: "Thumbs down",
        },
        {
          nativeShortcodes: {
            "👎": ["-1"],
          },
        },
      ),
    ).toEqual([":-1:"]);
  });

  it("should accept widened item selections too", () => {
    const selection: ItemSelection = {
      kind: "supplemental",
      item: {
        kind: "supplemental",
        id: "shipit",
        label: "Ship It",
        shortcode: ":ship_it:",
      },
    };

    expect(getEmojiPrimaryShortcode(selection)).toBe(":ship_it:");
  });

  it("should return an empty list for native items without shortcode metadata", () => {
    expect(
      getEmojiShortcodes({
        kind: "native",
        id: "😀",
        emoji: "😀",
        label: "Grinning face",
      }),
    ).toEqual([]);
    expect(
      getEmojiPrimaryShortcode({
        kind: "native",
        id: "😀",
        emoji: "😀",
        label: "Grinning face",
      }),
    ).toBeUndefined();
  });
});
