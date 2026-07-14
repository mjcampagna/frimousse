import { describe, expect, it } from "vitest";
import {
  adaptNativeEmojiSearchEntries,
  buildNativeEmojiSearchTermMapFromAdapter,
  buildShortcodeMapFromAdapter,
} from "../index";

interface TestEmojiRecord {
  aliases?: string[];
  emoji?: string | null;
  id?: string;
  shortcodes?: string[];
}

describe("adaptNativeEmojiSearchEntries", () => {
  it("adapts arbitrary records into native search entries", () => {
    const records: TestEmojiRecord[] = [
      {
        emoji: "👍",
        shortcodes: ["+1", "thumbsup"],
        aliases: ["like"],
      },
      {
        emoji: "✅",
        shortcodes: ["white_check_mark"],
      },
    ];

    expect(
      adaptNativeEmojiSearchEntries(records, {
        getEmoji: (entry) => entry.emoji,
        getShortcodes: (entry) => entry.shortcodes,
        getAliases: (entry) => entry.aliases,
      }),
    ).toEqual([
      {
        emoji: "👍",
        shortcodes: ["+1", "thumbsup"],
        aliases: ["like"],
      },
      {
        emoji: "✅",
        shortcodes: ["white_check_mark"],
      },
    ]);
  });

  it("skips entries without an emoji and omits empty term groups", () => {
    const records: TestEmojiRecord[] = [
      {
        emoji: null,
        shortcodes: ["ignored"],
      },
      {
        emoji: "✨",
      },
    ];

    expect(
      adaptNativeEmojiSearchEntries(records, {
        getEmoji: (entry) => entry.emoji,
        getShortcodes: (entry) => entry.shortcodes,
        getAliases: (entry) => entry.aliases,
      }),
    ).toEqual([{ emoji: "✨" }]);
  });
});

describe("buildNativeEmojiSearchTermMapFromAdapter", () => {
  it("builds a term map from adapted records", () => {
    const records = [
      {
        id: "red_heart",
        emoji: "❤️",
        aliases: ["love"],
      },
    ];

    expect(
      buildNativeEmojiSearchTermMapFromAdapter(records, {
        getEmoji: (entry) => entry.emoji,
        getShortcodes: (entry) => (entry.id ? [entry.id] : []),
        getAliases: (entry) => entry.aliases,
      }),
    ).toEqual({
      "❤": ["red_heart", "red heart", "love"],
    });
  });
});

describe("buildShortcodeMapFromAdapter", () => {
  it("builds a shortcode-only map from adapted records", () => {
    const records = [
      {
        id: ":red_heart:",
        emoji: "❤️",
        aliases: ["love"],
      },
    ];

    expect(
      buildShortcodeMapFromAdapter(records, {
        getEmoji: (entry) => entry.emoji,
        getShortcodes: (entry) => (entry.id ? [entry.id] : []),
        getAliases: (entry) => entry.aliases,
      }),
    ).toEqual({
      "❤": ["red_heart"],
    });
  });
});
