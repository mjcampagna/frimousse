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
  shortcode?: string;
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

export type EmojiPickerSupplementalSearchWeights = {
  label?: number;
  aliases?: number;
  keywords?: number;
  tags?: number;
  id?: number;
};

export type EmojiPickerSupplementalSearch = {
  mode?: "grouped" | "unified";
  resultsLabel?: string;
  weights?: EmojiPickerSupplementalSearchWeights;
};

export type EmojiPickerSupplementalConfig = {
  sections?: EmojiPickerSection[];
  search?: EmojiPickerSupplementalSearch;
};

export type NativeItemSelection = {
  kind: "native";
  item: NativeEmojiPickerItem;
};

export type SupplementalItemSelection = {
  kind: "supplemental";
  item: SupplementalEmojiPickerItem;
};

export type ItemSelection =
  | NativeItemSelection
  | SupplementalItemSelection;
