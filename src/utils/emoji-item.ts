import type {
  EmojiPickerItem,
  EmojiPickerSelection,
  NativeEmojiPickerSelection,
  NativeEmojiPickerItem,
  SupplementalEmojiPickerSelection,
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

export function isSupplementalSelection(
  selection: EmojiPickerSelection,
): selection is SupplementalEmojiPickerSelection {
  return selection.kind === "supplemental";
}

export function isNativeSelection(
  selection: EmojiPickerSelection,
): selection is NativeEmojiPickerSelection {
  return selection.kind === "native";
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
