import type {
  EmojiPickerItem,
  ItemSelection,
  NativeItemSelection,
  NativeEmojiPickerItem,
  SupplementalItemSelection,
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
  selection: ItemSelection,
): selection is SupplementalItemSelection {
  return selection.kind === "supplemental";
}

export function isNativeSelection(
  selection: ItemSelection,
): selection is NativeItemSelection {
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
