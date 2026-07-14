import type { SupplementalItemInput, SupplementalSection } from "./supplemental-item-types";
import type {
  EmojiPickerSectionPosition,
  SupplementalEmojiPickerItem,
} from "./supplemental-types";

export type CustomEmoji = SupplementalEmojiPickerItem & {
  /** Required image source for image-backed custom emoji. */
  imageUrl: string;
};

export type CustomEmojiInput = SupplementalItemInput & {
  /** Required image source for image-backed custom emoji. */
  imageUrl: string;
};

export type CustomSectionOptions = {
  /** Consumer-owned stable section identity. */
  id: string;
  /** Human-readable section label. */
  label?: string;
  /** Whether the section is prepended or appended around native categories. */
  position?: EmojiPickerSectionPosition;
  /** Whether the section participates in search. */
  searchable?: boolean;
};

export type CustomSection = SupplementalSection & {
  items: CustomEmoji[];
};
