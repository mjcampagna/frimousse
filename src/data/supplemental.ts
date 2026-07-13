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

function matchesSearchTerm(value: string, searchText: string) {
  return value.toLowerCase().replace(/[_-]/g, " ").includes(searchText);
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

function scoreNativeItemMatch(item: NativeEmojiPickerItem, searchText: string) {
  let score = 0;

  if (matchesSearchTerm(item.label, searchText)) {
    score += 10;
  }

  if (matchesSearchTerm(item.id, searchText)) {
    score += 1;
  }

  return score;
}

function scoreSupplementalItemMatch(
  item: Extract<EmojiPickerItem, { kind: "supplemental" }>,
  searchText: string,
) {
  let score = 0;

  if (matchesSearchTerm(item.label, searchText)) {
    score += 10;
  }

  for (const alias of item.aliases ?? []) {
    if (matchesSearchTerm(alias, searchText)) {
      score += 6;
    }
  }

  for (const keyword of item.keywords ?? []) {
    if (matchesSearchTerm(keyword, searchText)) {
      score += 3;
    }
  }

  for (const tag of item.tags ?? []) {
    if (matchesSearchTerm(tag, searchText)) {
      score += 1;
    }
  }

  if (matchesSearchTerm(item.id, searchText)) {
    score += 1;
  }

  return score;
}

function scoreItemMatch(item: EmojiPickerItem, searchText: string): number {
  return item.kind === "native"
    ? scoreNativeItemMatch(item, searchText)
    : scoreSupplementalItemMatch(item, searchText);
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
