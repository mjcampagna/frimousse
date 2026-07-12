import { describe, expectTypeOf, it } from "vitest";
import type {
  Item,
  ItemSelection,
  NativeItemSelection,
  NativeSelection,
  PickerSection,
  PickerItem,
  SupplementalItemSelection,
  SupplementalItem,
  SupplementalSelection,
  SupplementalSection,
  SupplementalEmoji,
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

  it("should keep the convenience aliases aligned with the explicit branch types", () => {
    expectTypeOf<NativeSelection>().toEqualTypeOf<NativeItemSelection>();
    expectTypeOf<SupplementalSelection>().toEqualTypeOf<SupplementalItemSelection>();
  });

  it("should expose parallel convenience aliases for mixed item surfaces", () => {
    expectTypeOf<Item>().toEqualTypeOf<EmojiPickerItem>();
    expectTypeOf<PickerItem>().toEqualTypeOf<EmojiPickerItem>();
    expectTypeOf<SupplementalItem>().toEqualTypeOf<SupplementalEmoji>();
    expectTypeOf<PickerSection>().toEqualTypeOf<EmojiPickerSection>();
    expectTypeOf<SupplementalSection>().toEqualTypeOf<EmojiPickerSection>();
  });
});
