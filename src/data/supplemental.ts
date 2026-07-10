import type {
  EmojiDataEmoji,
  EmojiPickerDataCategory,
  EmojiPickerDataRow,
  SkinTone,
} from "../types";
import type {
  EmojiPickerItem,
  EmojiPickerSection,
  EmojiPickerSupplementalConfig,
  NativeEmojiPickerItem,
  SupplementalEmojiPickerItem,
} from "../supplemental-types";
import { chunk } from "../utils/chunk";

type BuiltEmojiPickerRows = {
  count: number;
  categories: EmojiPickerDataCategory[];
  rows: EmojiPickerDataRow[];
};

function normalizeSearch(search: string) {
  return search.toLowerCase().trim().replace(/[_-]/g, " ");
}

function scoreTextMatch(
  label: string,
  terms: string[],
  searchText: string,
): number {
  let score = 0;

  if (label.toLowerCase().includes(searchText)) {
    score += 10;
  }

  for (const term of terms) {
    if (term.toLowerCase().replace(/[_-]/g, " ").includes(searchText)) {
      score += 1;
    }
  }

  return score;
}

function buildRows(
  items: EmojiPickerItem[],
  columns: number,
  categoryIndex: number,
): EmojiPickerDataRow[] {
  return chunk(items, columns).map((emojis) => ({
    categoryIndex,
    emojis,
  }));
}

export function toNativeEmojiPickerItem(
  emoji: EmojiDataEmoji,
  skinTone: SkinTone | undefined,
): NativeEmojiPickerItem {
  const value =
    skinTone && skinTone !== "none" && emoji.skins
      ? emoji.skins[skinTone]
      : emoji.emoji;

  return {
    kind: "native",
    id: value,
    emoji: value,
    label: emoji.label,
  };
}

function filterSupplementalItems(
  items: SupplementalEmojiPickerItem[],
  searchText: string,
) {
  if (!searchText) {
    return items;
  }

  const scores = new Map<string, number>();

  return items
    .filter((item) => {
      const score = scoreTextMatch(
        item.label,
        [
          ...(item.tags ?? []),
          ...(item.keywords ?? []),
          ...(item.aliases ?? []),
          item.id,
        ],
        searchText,
      );

      if (score > 0) {
        scores.set(item.id, score);
        return true;
      }

      return false;
    })
    .sort((a, b) => (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0));
}

export function buildSupplementalSections(
  sections: EmojiPickerSection<SupplementalEmojiPickerItem>[],
  search: string,
  columns: number,
  categoryIndexStart: number,
  startRowIndexStart: number,
): BuiltEmojiPickerRows {
  const searchText = normalizeSearch(search);
  const rows: EmojiPickerDataRow[] = [];
  const categories: EmojiPickerDataCategory[] = [];
  let count = 0;
  let categoryIndex = categoryIndexStart;
  let startRowIndex = startRowIndexStart;

  for (const section of sections) {
    const items = searchText
      ? section.searchable === false
        ? []
        : filterSupplementalItems(section.items, searchText)
      : section.items;

    if (items.length === 0) {
      continue;
    }

    const sectionRows = buildRows(items, columns, categoryIndex);

    rows.push(...sectionRows);
    categories.push({
      label: section.label ?? "",
      rowsCount: sectionRows.length,
      startRowIndex,
    });

    count += items.length;
    categoryIndex += 1;
    startRowIndex += sectionRows.length;
  }

  return { count, categories, rows };
}

export function buildUnifiedSearchRows(
  nativeEmojis: EmojiDataEmoji[],
  supplemental: EmojiPickerSupplementalConfig,
  search: string,
  columns: number,
  skinTone: SkinTone | undefined,
): BuiltEmojiPickerRows | null {
  const searchText = normalizeSearch(search);

  if (!searchText || supplemental.search?.mode !== "unified") {
    return null;
  }

  const scored = new Map<string, number>();
  const items: EmojiPickerItem[] = [];

  for (const emoji of nativeEmojis) {
    const score = scoreTextMatch(emoji.label, emoji.tags, searchText);

    if (score > 0) {
      const item = toNativeEmojiPickerItem(emoji, skinTone);
      scored.set(`${item.kind}:${item.id}`, score);
      items.push(item);
    }
  }

  for (const section of supplemental.sections ?? []) {
    if (section.searchable === false) {
      continue;
    }

    for (const item of filterSupplementalItems(section.items, searchText)) {
      const score = scoreTextMatch(
        item.label,
        [
          ...(item.tags ?? []),
          ...(item.keywords ?? []),
          ...(item.aliases ?? []),
          item.id,
        ],
        searchText,
      );

      if (score > 0) {
        scored.set(`${item.kind}:${item.id}`, score);
        items.push(item);
      }
    }
  }

  if (items.length === 0) {
    return { count: 0, categories: [], rows: [] };
  }

  items.sort(
    (a, b) =>
      (scored.get(`${b.kind}:${b.id}`) ?? 0) -
      (scored.get(`${a.kind}:${a.id}`) ?? 0),
  );

  const rows = buildRows(items, columns, 0);

  return {
    count: items.length,
    categories: [
      {
        label: supplemental.search?.resultsLabel ?? "",
        rowsCount: rows.length,
        startRowIndex: 0,
      },
    ],
    rows,
  };
}
