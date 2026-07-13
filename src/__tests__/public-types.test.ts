import { describe, expectTypeOf, it } from "vitest";
import type {
  Item,
  ItemSelection,
  NativeItemSelection,
  SupplementalItemSelection,
  SupplementalItem,
} from "../index";
import type { EmojiPickerItem, EmojiPickerSection } from "../supplemental-types";

describe("public type exports", () => {
  it("should expose explicit native and supplemental selection branches", () => {
    expectTypeOf<NativeItemSelection>().toEqualTypeOf<
      Extract<ItemSelection, { kind: "native" }>
    >();
    expectTypeOf<SupplementalItemSelection>().toEqualTypeOf<
      Extract<ItemSelection, { kind: "supplemental" }>
    >();
  });

  it("should keep the concise item aliases aligned with the explicit item types", () => {
    expectTypeOf<Item>().toEqualTypeOf<EmojiPickerItem>();
    expectTypeOf<SupplementalItem>().toEqualTypeOf<
      Extract<EmojiPickerItem, { kind: "supplemental" }>
    >();
    expectTypeOf<EmojiPickerSection>().toEqualTypeOf<
      EmojiPickerSection<EmojiPickerItem>
    >();
  });
});
