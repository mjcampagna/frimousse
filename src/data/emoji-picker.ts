import type {
  EmojiData,
  EmojiDataEmoji,
  EmojiPickerData,
  EmojiPickerDataCategory,
  EmojiPickerDataRow,
  SkinTone,
} from "../types";
import type { EmojiPickerSearchConfig } from "../search-types";
import type { EmojiPickerSupplementalConfig } from "../supplemental-types";
import { chunk } from "../utils/chunk";
import {
  createNativeSearchTermsMap,
  normalizeNativeSearchText,
  scoreNativeEmojiMatch,
  warnForUnmatchedNativeSearchTerms,
} from "./native-search";
import {
  buildSupplementalSections,
  buildUnifiedSearchRows,
  toNativeEmojiPickerItem,
} from "./supplemental";

export function searchEmojis(
  emojis: EmojiDataEmoji[],
  search?: string,
  searchConfig?: EmojiPickerSearchConfig,
) {
  if (!search) {
    return emojis;
  }

  const searchText = normalizeNativeSearchText(search);
  const nativeTerms = createNativeSearchTermsMap(searchConfig);
  const scores = new WeakMap<EmojiDataEmoji, number>();

  return emojis
    .filter((emoji) => {
      const score = scoreNativeEmojiMatch(emoji, searchText, nativeTerms);

      if (score > 0) {
        scores.set(emoji, score);

        return true;
      }

      return false;
    })
    .sort((a, b) => (scores.get(b) ?? 0) - (scores.get(a) ?? 0));
}

export function getEmojiPickerData(
  data: EmojiData,
  columns: number,
  skinTone: SkinTone | undefined,
  search: string,
  supplemental?: EmojiPickerSupplementalConfig,
  searchConfig?: EmojiPickerSearchConfig,
): EmojiPickerData {
  warnForUnmatchedNativeSearchTerms(data.emojis, searchConfig);

  const unified = supplemental
    ? buildUnifiedSearchRows(
        data.emojis,
        supplemental,
        search,
        columns,
        skinTone,
        searchConfig,
      )
    : null;

  if (unified) {
    return {
      count: unified.count,
      categories: unified.categories,
      categoriesStartRowIndices: unified.categories.map(
        (category) => category.startRowIndex,
      ),
      rows: unified.rows,
      skinTones: data.skinTones,
    };
  }

  const emojis = searchEmojis(data.emojis, search, searchConfig);
  const rows: EmojiPickerDataRow[] = [];
  const categories: EmojiPickerDataCategory[] = [];
  const categoriesStartRowIndices: number[] = [];
  const emojisByCategory: Record<number, EmojiPickerDataRow["emojis"]> = {};
  let categoryIndex = 0;
  let startRowIndex = 0;
  let count = 0;

  const prependedSections =
    supplemental?.sections?.filter(
      (section) => (section.position ?? "append") === "prepend",
    ) ?? [];
  const appendedSections =
    supplemental?.sections?.filter(
      (section) => (section.position ?? "append") === "append",
    ) ?? [];

  if (prependedSections.length > 0) {
    const built = buildSupplementalSections(
      prependedSections,
      search,
      columns,
      categoryIndex,
      startRowIndex,
    );

    rows.push(...built.rows);
    categories.push(...built.categories);
    categoriesStartRowIndices.push(
      ...built.categories.map((category) => category.startRowIndex),
    );
    count += built.count;
    categoryIndex += built.categories.length;
    startRowIndex += built.rows.length;
  }

  for (const emoji of emojis) {
    if (!emojisByCategory[emoji.category]) {
      emojisByCategory[emoji.category] = [];
    }

    emojisByCategory[emoji.category]!.push(
      toNativeEmojiPickerItem(emoji, skinTone),
    );
  }

  for (const category of data.categories) {
    const categoryEmojis = emojisByCategory[category.index];

    if (!categoryEmojis || categoryEmojis.length === 0) {
      continue;
    }

    const categoryRows = chunk(Array.from(categoryEmojis), columns).map(
      (emojis) => ({
        categoryIndex,
        emojis,
      }),
    );

    rows.push(...categoryRows);
    categories.push({
      label: category.label,
      rowsCount: categoryRows.length,
      startRowIndex,
    });

    categoriesStartRowIndices.push(startRowIndex);

    categoryIndex++;
    startRowIndex += categoryRows.length;
    count += categoryEmojis.length;
  }

  if (appendedSections.length > 0) {
    const built = buildSupplementalSections(
      appendedSections,
      search,
      columns,
      categoryIndex,
      startRowIndex,
    );

    rows.push(...built.rows);
    categories.push(...built.categories);
    categoriesStartRowIndices.push(
      ...built.categories.map((category) => category.startRowIndex),
    );
    count += built.count;
  }

  return {
    count,
    categories,
    categoriesStartRowIndices,
    rows,
    skinTones: data.skinTones,
  };
}
