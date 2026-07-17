import { describe, expect, it } from "vitest";
import {
  buildLabelMap,
  getLabel,
  mergeNativeEmojiLabelMaps,
} from "../index";

describe("buildLabelMap", () => {
  it("builds a normalized label map by base emoji key", () => {
    const labelMap = buildLabelMap([
      {
        emoji: "❤️",
        label: "Red heart",
      },
    ]);

    expect(labelMap).toEqual({
      "❤": "Red heart",
    });
    expect(getLabel(labelMap, "❤️")).toBe("Red heart");
    expect(getLabel(labelMap, "❤")).toBe("Red heart");
  });

  it("collapses skin tone variants onto the base key without overriding the first label", () => {
    const labelMap = buildLabelMap([
      {
        emoji: "👍",
        label: "Thumbs up",
      },
      {
        emoji: "👍🏽",
        label: "Thumbs up: medium skin tone",
      },
    ]);

    expect(labelMap).toEqual({
      "👍": "Thumbs up",
    });
    expect(getLabel(labelMap, "👍🏻")).toBe("Thumbs up");
  });

  it("skips empty labels", () => {
    const labelMap = buildLabelMap([
      {
        emoji: "✅",
        label: "  ",
      },
    ]);

    expect(labelMap).toEqual({});
    expect(getLabel(labelMap, "✅")).toBeUndefined();
  });

  it("merges multiple label maps with first-map-wins precedence", () => {
    const merged = mergeNativeEmojiLabelMaps(
      {
        "❤️": "Coeur rouge",
        "👍": "Pouce levé",
      },
      {
        "❤": "Red heart",
        "👍🏽": "Thumbs up: medium skin tone",
        "🔥": "Fire",
      },
    );

    expect(merged).toEqual({
      "❤": "Coeur rouge",
      "👍": "Pouce levé",
      "🔥": "Fire",
    });
    expect(getLabel(merged, "❤️")).toBe("Coeur rouge");
    expect(getLabel(merged, "👍🏻")).toBe("Pouce levé");
  });

  it("ignores empty fallback labels while continuing to later maps", () => {
    const merged = mergeNativeEmojiLabelMaps(
      {
        "🔥": "   ",
      },
      {
        "🔥": "Fire",
      },
    );

    expect(merged).toEqual({
      "🔥": "Fire",
    });
  });
});
