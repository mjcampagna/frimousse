import type {
  EmojiPickerItem,
  EmojiPickerSection,
  EmojiPickerSectionPosition,
  ItemSelection,
} from "./supplemental-types";

export type EmojiPickerUsageSource = EmojiPickerItem | ItemSelection;

export type EmojiPickerUsageEntry = {
  key: string;
  item: EmojiPickerItem;
  score: number;
  uses: number;
  lastUsedAt: number;
};

export type EmojiPickerUsageOptions = {
  halfLifeMs?: number;
  maxEntries?: number;
  now?: Date | number;
};

export type EmojiPickerFrequentSectionOptions = EmojiPickerUsageOptions & {
  id?: string;
  label?: string;
  limit?: number;
  position?: EmojiPickerSectionPosition;
  searchable?: boolean;
};

export type EmojiPickerFrequentSection = EmojiPickerSection;
