import type { EmojiPickerItem } from "./supplemental-types";
import type {
  EmojiPickerCustomEmoji,
  EmojiPickerCustomEmojiInput,
  EmojiPickerCustomSection,
  EmojiPickerCustomSectionOptions,
} from "./custom-emoji-types";

function normalizeRequiredText(value: string, field: string) {
  const normalized = value.trim();

  if (normalized.length === 0) {
    throw new Error(`Emoji picker custom emoji "${field}" must be non-empty.`);
  }

  return normalized;
}

function normalizeOptionalText(value: string | undefined) {
  const normalized = value?.trim();

  return normalized && normalized.length > 0 ? normalized : undefined;
}

function normalizeTextList(values: string[] | undefined) {
  if (!values) {
    return undefined;
  }

  const normalized = Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter((value) => value.length > 0),
    ),
  );

  return normalized.length > 0 ? normalized : undefined;
}

export function isEmojiPickerCustomEmoji(
  item: EmojiPickerItem,
): item is EmojiPickerCustomEmoji {
  return item.kind === "supplemental" && typeof item.imageUrl === "string";
}

export function createEmojiPickerCustomEmoji(
  input: EmojiPickerCustomEmojiInput,
): EmojiPickerCustomEmoji {
  const id = normalizeRequiredText(input.id, "id");
  const imageUrl = normalizeRequiredText(input.imageUrl, "imageUrl");
  const label = normalizeOptionalText(input.label) ?? id;

  return {
    kind: "supplemental",
    id,
    label,
    imageUrl,
    tags: normalizeTextList(input.tags),
    keywords: normalizeTextList(input.keywords),
    aliases: normalizeTextList(input.aliases),
    data: input.data,
  };
}

export function createEmojiPickerCustomSection(
  items: readonly EmojiPickerCustomEmojiInput[],
  options: EmojiPickerCustomSectionOptions,
): EmojiPickerCustomSection {
  return {
    id: normalizeRequiredText(options.id, "section.id"),
    label: normalizeOptionalText(options.label),
    position: options.position ?? "append",
    searchable: options.searchable,
    items: items.map(createEmojiPickerCustomEmoji),
  };
}
