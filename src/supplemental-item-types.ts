import type {
  EmojiPickerSection,
  EmojiPickerSectionPosition,
  SupplementalEmojiPickerItem,
} from "./supplemental-types";

export type SupplementalItemInput = {
  id: string;
  label?: string;
  shortcode?: string;
  imageUrl?: string;
  tags?: string[];
  keywords?: string[];
  aliases?: string[];
  data?: unknown;
};

export type SupplementalSectionOptions = {
  id: string;
  label?: string;
  position?: EmojiPickerSectionPosition;
  searchable?: boolean;
};

export type SupplementalSection = EmojiPickerSection<SupplementalEmojiPickerItem>;
