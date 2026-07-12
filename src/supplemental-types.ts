export type EmojiPickerSectionPosition = "prepend" | "append";

export type NativeEmojiPickerItem = {
  kind: "native";
  id: string;
  emoji: string;
  label: string;
};

export type SupplementalEmojiPickerItem = {
  kind: "supplemental";
  id: string;
  label: string;
  imageUrl?: string;
  tags?: string[];
  keywords?: string[];
  aliases?: string[];
  data?: unknown;
};

export type EmojiPickerItem = NativeEmojiPickerItem | SupplementalEmojiPickerItem;

export type EmojiPickerSection<TItem extends EmojiPickerItem = EmojiPickerItem> = {
  id: string;
  label?: string;
  position?: EmojiPickerSectionPosition;
  items: TItem[];
  searchable?: boolean;
};

export type EmojiPickerSupplementalSearch = {
  mode?: "grouped" | "unified";
  resultsLabel?: string;
};

export type EmojiPickerSupplementalConfig = {
  sections?: EmojiPickerSection[];
  search?: EmojiPickerSupplementalSearch;
};

export type NativeEmojiPickerSelection = {
  kind: "native";
  item: NativeEmojiPickerItem;
};

export type SupplementalEmojiPickerSelection = {
  kind: "supplemental";
  item: SupplementalEmojiPickerItem;
};

export type EmojiPickerSelection =
  | NativeEmojiPickerSelection
  | SupplementalEmojiPickerSelection;
