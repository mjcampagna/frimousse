import { describe, expectTypeOf, it } from "vitest";
import type {
  EmojiPickerSelection,
  NativeEmojiPickerSelection,
  NativeSelection,
  PickerSection,
  PickerSelection,
  PickerItem,
  SupplementalEmojiPickerSelection,
  SupplementalItem,
  SupplementalSelection,
  SupplementalSection,
  SupplementalEmoji,
} from "../index";
import type { EmojiPickerItem, EmojiPickerSection } from "../supplemental-types";

describe("public type exports", () => {
  it("should expose explicit native and supplemental selection branches", () => {
    expectTypeOf<NativeEmojiPickerSelection>().toEqualTypeOf<
      Extract<EmojiPickerSelection, { kind: "native" }>
    >();
    expectTypeOf<SupplementalEmojiPickerSelection>().toEqualTypeOf<
      Extract<EmojiPickerSelection, { kind: "supplemental" }>
    >();
  });

  it("should keep the convenience aliases aligned with the explicit branch types", () => {
    expectTypeOf<NativeSelection>().toEqualTypeOf<NativeEmojiPickerSelection>();
    expectTypeOf<SupplementalSelection>().toEqualTypeOf<
      SupplementalEmojiPickerSelection
    >();
  });

  it("should expose parallel convenience aliases for mixed item surfaces", () => {
    expectTypeOf<PickerItem>().toEqualTypeOf<EmojiPickerItem>();
    expectTypeOf<SupplementalItem>().toEqualTypeOf<SupplementalEmoji>();
    expectTypeOf<PickerSelection>().toEqualTypeOf<EmojiPickerSelection>();
    expectTypeOf<PickerSection>().toEqualTypeOf<EmojiPickerSection>();
    expectTypeOf<SupplementalSection>().toEqualTypeOf<EmojiPickerSection>();
  });
});
