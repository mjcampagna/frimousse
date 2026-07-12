import { describe, expect, expectTypeOf, it } from "vitest";
import {
  isNativeSelection,
  isSupplementalSelection,
  type ItemSelection,
  type NativeItemSelection,
  type SupplementalItemSelection,
} from "../index";

describe("selection guards", () => {
  it("should identify native selections", () => {
    const selection: ItemSelection = {
      kind: "native",
      item: {
        kind: "native",
        id: "😀",
        emoji: "😀",
        label: "Grinning face",
      },
    };

    expect(isNativeSelection(selection)).toBe(true);
    expect(isSupplementalSelection(selection)).toBe(false);

    if (isNativeSelection(selection)) {
      expect(selection.item.emoji).toBe("😀");
      expectTypeOf(selection).toEqualTypeOf<NativeItemSelection>();
    }
  });

  it("should identify supplemental selections", () => {
    const selection: ItemSelection = {
      kind: "supplemental",
      item: {
        kind: "supplemental",
        id: "shipit",
        label: "Ship It",
        imageUrl: "https://example.com/shipit.png",
      },
    };

    expect(isNativeSelection(selection)).toBe(false);
    expect(isSupplementalSelection(selection)).toBe(true);

    if (isSupplementalSelection(selection)) {
      expect(selection.item.id).toBe("shipit");
      expectTypeOf(selection).toEqualTypeOf<SupplementalItemSelection>();
    }
  });
});
