import type { EmojiPickerItem } from "./supplemental-types";
import {
  createSupplementalItem,
  createSupplementalSection,
} from "./supplemental-item";
import type {
  EmojiPickerCustomEmoji,
  EmojiPickerCustomEmojiInput,
  EmojiPickerCustomSection,
  EmojiPickerCustomSectionOptions,
} from "./custom-emoji-types";

export function isEmojiPickerCustomEmoji(
  item: EmojiPickerItem,
): item is EmojiPickerCustomEmoji {
  return item.kind === "supplemental" && typeof item.imageUrl === "string";
}

export function createEmojiPickerCustomEmoji(
  input: EmojiPickerCustomEmojiInput,
): EmojiPickerCustomEmoji {
  if (input.id.trim().length === 0) {
    throw new Error('Emoji picker custom emoji "id" must be non-empty.');
  }

  if (input.imageUrl.trim().length === 0) {
    throw new Error('Emoji picker custom emoji "imageUrl" must be non-empty.');
  }

  return createSupplementalItem(input) as EmojiPickerCustomEmoji;
}

export function createEmojiPickerCustomSection(
  items: readonly EmojiPickerCustomEmojiInput[],
  options: EmojiPickerCustomSectionOptions,
): EmojiPickerCustomSection {
  return createSupplementalSection(items, options) as EmojiPickerCustomSection;
}
