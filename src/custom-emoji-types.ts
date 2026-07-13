import type { SupplementalItemInput, SupplementalSection } from "./supplemental-item-types";
import type {
  EmojiPickerSectionPosition,
  SupplementalEmojiPickerItem,
} from "./supplemental-types";

export type CustomEmoji = SupplementalEmojiPickerItem & {
  imageUrl: string;
};

export type CustomEmojiInput = SupplementalItemInput & {
  imageUrl: string;
};

export type CustomSectionOptions = {
  id: string;
  label?: string;
  position?: EmojiPickerSectionPosition;
  searchable?: boolean;
};

export type CustomSection = SupplementalSection & {
  items: CustomEmoji[];
};
