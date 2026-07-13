import type { EmojiPickerItem } from "./supplemental-types";
import {
  createSupplementalItem,
  createSupplementalSection,
} from "./supplemental-item";
import type {
  CustomEmoji,
  CustomEmojiInput,
  CustomSection,
  CustomSectionOptions,
} from "./custom-emoji-types";

export function isCustomEmoji(
  item: EmojiPickerItem,
): item is CustomEmoji {
  return item.kind === "supplemental" && typeof item.imageUrl === "string";
}

export function createCustomEmoji(
  input: CustomEmojiInput,
): CustomEmoji {
  if (input.id.trim().length === 0) {
    throw new Error('Emoji picker custom emoji "id" must be non-empty.');
  }

  if (input.imageUrl.trim().length === 0) {
    throw new Error('Emoji picker custom emoji "imageUrl" must be non-empty.');
  }

  const item = createSupplementalItem(input);

  if (!item.imageUrl) {
    throw new Error('Emoji picker custom emoji "imageUrl" must be non-empty.');
  }

  return {
    ...item,
    imageUrl: item.imageUrl,
  };
}

export function createCustomSection(
  items: readonly CustomEmojiInput[],
  options: CustomSectionOptions,
): CustomSection {
  const section = createSupplementalSection(items, options);

  return {
    ...section,
    items: items.map(createCustomEmoji),
  };
}
