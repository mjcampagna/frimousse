import type {
  EmojiPickerSection,
  EmojiPickerSectionPosition,
  SupplementalEmojiPickerItem,
} from "./supplemental-types";

export type EmojiPickerCustomEmoji = SupplementalEmojiPickerItem & {
  imageUrl: string;
};

export type EmojiPickerCustomEmojiInput = {
  id: string;
  label?: string;
  imageUrl: string;
  tags?: string[];
  keywords?: string[];
  aliases?: string[];
  data?: unknown;
};

export type EmojiPickerCustomSectionOptions = {
  id: string;
  label?: string;
  position?: EmojiPickerSectionPosition;
  searchable?: boolean;
};

export type EmojiPickerCustomSection = EmojiPickerSection<EmojiPickerCustomEmoji>;
