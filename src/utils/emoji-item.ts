import type {
  EmojiPickerItem,
  NativeEmojiPickerItem,
  SupplementalEmojiPickerItem,
} from "../supplemental-types";

export function isSupplementalEmojiPickerItem(
  item: EmojiPickerItem,
): item is SupplementalEmojiPickerItem {
  return item.kind === "supplemental";
}

export function isNativeEmojiPickerItem(
  item: EmojiPickerItem,
): item is NativeEmojiPickerItem {
  return item.kind === "native";
}

export function sameEmojiPickerItem(
  a: EmojiPickerItem | undefined,
  b: EmojiPickerItem | undefined,
) {
  if (!a || !b) {
    return a === b;
  }

  return a.kind === b.kind && a.id === b.id;
}
