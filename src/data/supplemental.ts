import type {
  EmojiDataEmoji,
  EmojiPickerDataCategory,
  EmojiPickerDataRow,
  SkinTone,
} from "../types";
import type { EmojiPickerSearchConfig } from "../search-types";
import type {
  EmojiPickerItem,
  EmojiPickerSection,
  EmojiPickerSupplementalConfig,
  NativeEmojiPickerItem,
} from "../supplemental-types";
import { chunk } from "../utils/chunk";
import {
  createNativeSearchTermsMap,
  normalizeNativeSearchText,
  scoreNativeEmojiMatch,
} from "./native-search";

type BuiltEmojiPickerRows = {
  count: number;
  categories: EmojiPickerDataCategory[];
  rows: EmojiPickerDataRow[];
};

function normalizeSearch(search: string) {
  return normalizeNativeSearchText(search);
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

function getItemTerms(item: EmojiPickerItem): string[] {
  if (item.kind === "native") {
    return [item.id];
  }

  return [
    ...(item.tags ?? []),
    ...(item.keywords ?? []),
    ...(item.aliases ?? []),
    item.id,
  ];
}

function scoreItemMatch(item: EmojiPickerItem, searchText: string): number {
  return scoreTextMatch(item.label, getItemTerms(item), searchText);
}

function filterSectionItems(items: EmojiPickerItem[], searchText: string) {
  if (!searchText) {
    return items;
  }

  const scores = new Map<string, number>();

  return items
    .filter((item) => {
      const score = scoreItemMatch(item, searchText);

      if (score > 0) {
        scores.set(`${item.kind}:${item.id}`, score);
        return true;
      }

      return false;
    })
    .sort(
      (a, b) =>
        (scores.get(`${b.kind}:${b.id}`) ?? 0) -
        (scores.get(`${a.kind}:${a.id}`) ?? 0),
    );
}

export function buildSupplementalSections(
  sections: EmojiPickerSection[],
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
        : filterSectionItems(section.items, searchText)
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
  searchConfig?: EmojiPickerSearchConfig,
): BuiltEmojiPickerRows | null {
  const searchText = normalizeSearch(search);

  if (!searchText || supplemental.search?.mode !== "unified") {
    return null;
  }

  const scored = new Map<string, number>();
  const itemsByKey = new Map<string, EmojiPickerItem>();
  const nativeTerms = createNativeSearchTermsMap(searchConfig);

  for (const emoji of nativeEmojis) {
    const score = scoreNativeEmojiMatch(emoji, searchText, nativeTerms);

    if (score > 0) {
      const item = toNativeEmojiPickerItem(emoji, skinTone);
      const key = `${item.kind}:${item.id}`;
      const previousScore = scored.get(key) ?? -1;

      if (score > previousScore) {
        scored.set(key, score);
        itemsByKey.set(key, item);
      }
    }
  }

  for (const section of supplemental.sections ?? []) {
    if (section.searchable === false) {
      continue;
    }

    for (const item of filterSectionItems(section.items, searchText)) {
      const score = scoreItemMatch(item, searchText);

      if (score > 0) {
        const key = `${item.kind}:${item.id}`;
        const previousScore = scored.get(key) ?? -1;

        if (score > previousScore) {
          scored.set(key, score);
          itemsByKey.set(key, item);
        }
      }
    }
  }

  const items = Array.from(itemsByKey.values());

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
