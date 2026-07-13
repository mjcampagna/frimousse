import type { SupplementalItemInput, SupplementalSection } from "./supplemental-item-types";
import type {
  EmojiPickerSectionPosition,
  SupplementalEmojiPickerItem,
} from "./supplemental-types";

export type EmojiPickerCustomEmoji = SupplementalEmojiPickerItem & {
  imageUrl: string;
};

export type EmojiPickerCustomEmojiInput = SupplementalItemInput & {
  imageUrl: string;
};

export type EmojiPickerCustomSectionOptions = {
  id: string;
  label?: string;
  position?: EmojiPickerSectionPosition;
  searchable?: boolean;
};

export type EmojiPickerCustomSection = SupplementalSection & {
  items: EmojiPickerCustomEmoji[];
};
