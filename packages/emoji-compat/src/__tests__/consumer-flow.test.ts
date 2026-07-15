import { describe, expect, it } from "vitest";
import {
  buildCompatMap,
  getFallbackUrl,
} from "../compat";
import { buildFallbackAssetManifest } from "../assets";
import type { EmojiCompatRecord } from "../types";

const records: EmojiCompatRecord[] = [
  {
    emoji: "👍",
    version: 1,
    hexcode: "1F44D",
  },
  {
    emoji: "🧑‍🧑‍🧒",
    version: 16,
    hexcode: "1F9D1-200D-1F9D1-200D-1F9D2",
    skins: [
      {
        emoji: "🧑🏽‍🧑🏽‍🧒🏽",
        hexcode: "1F9D1-1F3FD-200D-1F9D1-1F3FD-200D-1F9D2-1F3FD",
      },
    ],
  },
  {
    emoji: "🫩",
    version: 16,
    hexcode: "1FAE9",
  },
];

describe("consumer flow", () => {
  it("supports a build-time compat map plus fallback asset manifest workflow", () => {
    const compatMap = buildCompatMap(records, {
      supportedVersion: 15,
    });
    const generatedCompatMap = JSON.parse(JSON.stringify(compatMap));
    const fallbackAssetManifest = buildFallbackAssetManifest(records, {
      versionFloor: 15,
    });

    expect(getFallbackUrl(generatedCompatMap, "👍")).toBeUndefined();
    expect(
      getFallbackUrl(generatedCompatMap, "🫩", {
        basePath: "/emoji",
      }),
    ).toBe("/emoji/1fae9.svg");
    expect(
      getFallbackUrl(generatedCompatMap, "🧑🏽‍🧑🏽‍🧒🏽", {
        basePath: "/emoji",
      }),
    ).toBe("/emoji/1f9d1-1f3fd-200d-1f9d1-1f3fd-200d-1f9d2-1f3fd.svg");

    expect(fallbackAssetManifest).toEqual([
      {
        emoji: "🧑‍🧑‍🧒",
        version: 16,
        hexcode: "1f9d1-200d-1f9d1-200d-1f9d2",
        kind: "base",
      },
      {
        emoji: "🧑🏽‍🧑🏽‍🧒🏽",
        version: 16,
        hexcode: "1f9d1-1f3fd-200d-1f9d1-1f3fd-200d-1f9d2-1f3fd",
        kind: "skin",
      },
      {
        emoji: "🫩",
        version: 16,
        hexcode: "1fae9",
        kind: "base",
      },
    ]);
  });
});
