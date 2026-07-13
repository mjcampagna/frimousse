import type {
  SupplementalItemInput,
  SupplementalSection,
  SupplementalSectionOptions,
} from "./supplemental-item-types";
import type { SupplementalEmojiPickerItem } from "./supplemental-types";

function normalizeRequiredText(value: string, field: string) {
  const normalized = value.trim();

  if (normalized.length === 0) {
    throw new Error(`Emoji picker supplemental item "${field}" must be non-empty.`);
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

export function createSupplementalItem(
  input: SupplementalItemInput,
): SupplementalEmojiPickerItem {
  const id = normalizeRequiredText(input.id, "id");
  const label = normalizeOptionalText(input.label) ?? id;

  return {
    kind: "supplemental",
    id,
    label,
    imageUrl: normalizeOptionalText(input.imageUrl),
    tags: normalizeTextList(input.tags),
    keywords: normalizeTextList(input.keywords),
    aliases: normalizeTextList(input.aliases),
    data: input.data,
  };
}

export function createSupplementalSection(
  items: readonly SupplementalItemInput[],
  options: SupplementalSectionOptions,
): SupplementalSection {
  return {
    id: normalizeRequiredText(options.id, "section.id"),
    label: normalizeOptionalText(options.label),
    position: options.position ?? "append",
    searchable: options.searchable,
    items: items.map(createSupplementalItem),
  };
}
