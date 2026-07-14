import { describe, expect, it } from "vitest";
import {
  buildCompatMap,
  detectSupportedVersion,
  getCompatEntry,
  getFallbackUrl,
  isEmojiSupported,
  normalizeEmojiCompatKey,
} from "../index";
import type { EmojiCompatRecord } from "../types";

const records: EmojiCompatRecord[] = [
  {
    emoji: "👍",
    version: 1,
    hexcode: "1F44D",
    skins: [{ emoji: "👍🏽", hexcode: "1F44D-1F3FD" }],
  },
  {
    emoji: "🫠",
    version: 14,
    hexcode: "1FAE0",
  },
  {
    emoji: "🫩",
    version: 16,
    hexcode: "1FAE9",
  },
];

describe("normalizeEmojiCompatKey", () => {
  it("removes variation selectors while preserving other modifiers", () => {
    expect(normalizeEmojiCompatKey("❤️")).toBe("❤");
    expect(normalizeEmojiCompatKey("👍🏽")).toBe("👍🏽");
  });
});

describe("isEmojiSupported", () => {
  it("returns false outside the browser", () => {
    expect(isEmojiSupported("😊")).toBe(false);
  });
});

describe("detectSupportedVersion", () => {
  it("returns the highest supported version using the injected probe", () => {
    const supported = new Set(["👍", "🫠"]);

    expect(
      detectSupportedVersion(records, {
        isSupported: (emoji) => supported.has(emoji),
      }),
    ).toBe(14);
  });

  it("returns zero when nothing is supported", () => {
    expect(
      detectSupportedVersion(records, {
        isSupported: () => false,
      }),
    ).toBe(0);
  });
});

describe("buildCompatMap", () => {
  it("marks newer emoji as fallback candidates", () => {
    const compatMap = buildCompatMap(records, {
      supportedVersion: 14,
    });

    expect(getCompatEntry(compatMap, "👍")).toEqual({
      emoji: "👍",
      version: 1,
      hexcode: "1F44D",
      supported: true,
      needsFallback: false,
    });

    expect(getCompatEntry(compatMap, "🫩")).toEqual({
      emoji: "🫩",
      version: 16,
      hexcode: "1FAE9",
      supported: false,
      needsFallback: true,
    });
  });

  it("includes skin variants at the same version as the base emoji", () => {
    const compatMap = buildCompatMap(records, {
      supportedVersion: 1,
    });

    expect(getCompatEntry(compatMap, "👍🏽")).toEqual({
      emoji: "👍🏽",
      version: 1,
      hexcode: "1F44D-1F3FD",
      supported: true,
      needsFallback: false,
    });
  });

  it("normalizes lookups that differ only by variation selectors", () => {
    const compatMap = buildCompatMap(
      [
        {
          emoji: "❤️",
          version: 1,
          hexcode: "2764-FE0F",
        },
      ],
      {
        supportedVersion: 0,
      },
    );

    expect(getCompatEntry(compatMap, "❤")).toEqual({
      emoji: "❤️",
      version: 1,
      hexcode: "2764-FE0F",
      supported: false,
      needsFallback: true,
    });
  });
});

describe("getFallbackUrl", () => {
  it("returns a lowercased fallback asset URL when needed", () => {
    const compatMap = buildCompatMap(records, {
      supportedVersion: 14,
    });

    expect(getFallbackUrl(compatMap, "🫩")).toBe("/emoji/1fae9.svg");
  });

  it("allows a custom asset location and extension", () => {
    const compatMap = buildCompatMap(records, {
      supportedVersion: 14,
    });

    expect(
      getFallbackUrl(compatMap, "🫩", {
        basePath: "/assets/twemoji/",
        extension: "png",
      }),
    ).toBe("/assets/twemoji/1fae9.png");
  });

  it("returns undefined when the emoji does not need a fallback", () => {
    const compatMap = buildCompatMap(records, {
      supportedVersion: 16,
    });

    expect(getFallbackUrl(compatMap, "🫩")).toBeUndefined();
  });
});
