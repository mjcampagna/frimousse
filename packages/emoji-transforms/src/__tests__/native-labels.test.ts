import { describe, expect, it } from "vitest";
import { buildLabelMap, getLabel } from "../index";

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
});
