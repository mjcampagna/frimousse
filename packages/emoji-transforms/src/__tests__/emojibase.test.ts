import { describe, expect, it } from "vitest";
import {
  adaptEmojibaseNativeEmojiSearchEntries,
  buildNativeEmojiSearchTermMapFromEmojibase,
  buildShortcodeMapFromEmojibase,
  buildShortcodeMapFromPreset,
} from "../index";

describe("adaptEmojibaseNativeEmojiSearchEntries", () => {
  it("defaults to shortcode-only enrichment for emojibase-like records", () => {
    expect(
      adaptEmojibaseNativeEmojiSearchEntries([
        {
          emoji: "❤️",
          label: "red heart",
          shortcodes: ["red_heart"],
          tags: ["love"],
        },
      ]),
    ).toEqual([
      {
        emoji: "❤️",
        shortcodes: ["red_heart"],
      },
    ]);
  });

  it("can opt into label and tag aliases explicitly", () => {
    expect(
      adaptEmojibaseNativeEmojiSearchEntries(
        [
          {
            emoji: "❤️",
            label: "red heart",
            shortcodes: ["red_heart"],
            tags: ["love", "like"],
          },
        ],
        {
          includeLabel: true,
          includeTags: true,
        },
      ),
    ).toEqual([
      {
        emoji: "❤️",
        shortcodes: ["red_heart"],
        aliases: ["red heart", "love", "like"],
      },
    ]);
  });
});

describe("buildNativeEmojiSearchTermMapFromEmojibase", () => {
  it("builds a term map from emojibase-like records", () => {
    expect(
      buildNativeEmojiSearchTermMapFromEmojibase([
        {
          emoji: "👍",
          shortcodes: ["+1", "thumbsup"],
        },
      ]),
    ).toEqual({
      "👍": ["+1", "thumbsup"],
    });
  });

  it("includes opted-in label and tag aliases in the built term map", () => {
    expect(
      buildNativeEmojiSearchTermMapFromEmojibase(
        [
          {
            emoji: "✅",
            label: "check mark button",
            shortcodes: ["white_check_mark"],
            tags: ["done"],
          },
        ],
        {
          includeLabel: true,
          includeTags: true,
        },
      ),
    ).toEqual({
      "✅": [
        "white_check_mark",
        "white check mark",
        "check mark button",
        "done",
      ],
    });
  });
});

describe("buildShortcodeMapFromEmojibase", () => {
  it("builds a shortcode map from emojibase-like records", () => {
    expect(
      buildShortcodeMapFromEmojibase([
        {
          emoji: "👍",
          shortcodes: ["+1", "thumbsup"],
          label: "thumbs up",
          tags: ["like"],
        },
      ]),
    ).toEqual({
      "👍": ["+1", "thumbsup"],
    });
  });

  it("builds a shortcode map from emojibase data plus a shortcode preset", () => {
    expect(
      buildShortcodeMapFromPreset(
        [
          {
            emoji: "👋",
            hexcode: "1F44B",
            label: "waving hand",
            skins: [
              {
                emoji: "👋🏽",
                hexcode: "1F44B-1F3FD",
              },
            ],
          },
          {
            emoji: "❤️",
            hexcode: "2764",
            label: "red heart",
          },
        ],
        {
          "1F44B": ["wave", "waving_hand"],
          "1F44B-1F3FD": "waving_hand_medium_skin_tone",
          "2764": "heart",
        },
      ),
    ).toEqual({
      "👋": ["wave", "waving_hand", "waving_hand_medium_skin_tone"],
      "❤": ["heart"],
    });
  });
});
