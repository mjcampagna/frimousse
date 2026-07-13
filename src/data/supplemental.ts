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
  EmojiPickerSupplementalSearch,
  EmojiPickerSupplementalSearchWeights,
  NativeEmojiPickerItem,
} from "../supplemental-types";
import { chunk } from "../utils/chunk";
import {
  createNativeSearchTermsMap,
  normalizeNativeSearchKey,
  normalizeNativeSearchText,
  normalizeNativeSearchTerm,
  scoreNativeEmojiMatch,
  scoreSearchQuality,
  type NativeSearchTermsMap,
} from "./native-search";

type BuiltEmojiPickerRows = {
  count: number;
  categories: EmojiPickerDataCategory[];
  rows: EmojiPickerDataRow[];
};

function normalizeSearch(search: string) {
  return normalizeNativeSearchText(search);
}

function normalizeSupplementalSearchValue(value: string) {
  return normalizeNativeSearchTerm(value);
}

const DEFAULT_SUPPLEMENTAL_SEARCH_WEIGHTS = {
  label: 10,
  aliases: 6,
  keywords: 3,
  tags: 1,
  id: 1,
} satisfies Required<EmojiPickerSupplementalSearchWeights>;

function resolveSupplementalSearchWeights(
  weights: EmojiPickerSupplementalSearchWeights | undefined,
) {
  return {
    ...DEFAULT_SUPPLEMENTAL_SEARCH_WEIGHTS,
    ...weights,
  };
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

function createNativeEmojiMap(nativeEmojis: readonly EmojiDataEmoji[] | undefined) {
  if (!nativeEmojis) {
    return undefined;
  }

  return new Map(
    nativeEmojis.map((emoji) => [normalizeNativeSearchKey(emoji.emoji), emoji]),
  );
}

function scoreNativeItemMatch(
  item: NativeEmojiPickerItem,
  searchText: string,
  nativeTerms: NativeSearchTermsMap | undefined,
  nativeEmojiByKey: Map<string, EmojiDataEmoji> | undefined,
) {
  let score = 0;
  const nativeEmoji = nativeEmojiByKey?.get(normalizeNativeSearchKey(item.emoji));

  if (nativeEmoji) {
    score += scoreNativeEmojiMatch(nativeEmoji, searchText, nativeTerms);
  } else {
    score += scoreSearchQuality(
      normalizeSupplementalSearchValue(item.label),
      searchText,
      10,
    );
  }

  if (
    nativeEmoji &&
    nativeEmoji.label !== item.label &&
    normalizeSupplementalSearchValue(item.label) !==
      normalizeSupplementalSearchValue(nativeEmoji.label)
  ) {
    score += scoreSearchQuality(
      normalizeSupplementalSearchValue(item.label),
      searchText,
      10,
    );
  }

  score += scoreSearchQuality(
    normalizeSupplementalSearchValue(item.id),
    searchText,
    1,
  );

  return score;
}

function scoreSupplementalItemMatch(
  item: Extract<EmojiPickerItem, { kind: "supplemental" }>,
  searchText: string,
  weights: EmojiPickerSupplementalSearchWeights | undefined,
  preferCanonicalId = false,
) {
  const resolvedWeights = resolveSupplementalSearchWeights(weights);
  const normalizedId = normalizeSupplementalSearchValue(item.id);
  const normalizedLabel = normalizeSupplementalSearchValue(item.label);
  let primaryScore = scoreSearchQuality(
    normalizedLabel,
    searchText,
    resolvedWeights.label,
  );
  let tagScore = 0;

  for (const alias of item.aliases ?? []) {
    primaryScore = Math.max(
      primaryScore,
      scoreSearchQuality(
      normalizeSupplementalSearchValue(alias),
      searchText,
      resolvedWeights.aliases,
      ),
    );
  }

  for (const keyword of item.keywords ?? []) {
    primaryScore = Math.max(
      primaryScore,
      scoreSearchQuality(
      normalizeSupplementalSearchValue(keyword),
      searchText,
      resolvedWeights.keywords,
      ),
    );
  }

  for (const tag of item.tags ?? []) {
    tagScore += scoreSearchQuality(
      normalizeSupplementalSearchValue(tag),
      searchText,
      resolvedWeights.tags,
    );
  }

  primaryScore = Math.max(
    primaryScore,
    scoreSearchQuality(
      normalizedId,
      searchText,
      resolvedWeights.id,
    ),
  );

  if (
    preferCanonicalId &&
    weights?.id === undefined &&
    normalizedId === searchText
  ) {
    primaryScore = Math.max(
      primaryScore,
      scoreSearchQuality(
        normalizedId,
        searchText,
        resolvedWeights.label,
      ) + 1,
    );
  }

  return primaryScore + tagScore;
}

function compareScoredItems(
  a: EmojiPickerItem,
  b: EmojiPickerItem,
  scores: Map<string, number>,
  searchText: string,
  preferCanonicalId = false,
) {
  if (preferCanonicalId) {
    const aIsExactCanonicalSupplementalId =
      a.kind === "supplemental" &&
      normalizeSupplementalSearchValue(a.id) === searchText;
    const bIsExactCanonicalSupplementalId =
      b.kind === "supplemental" &&
      normalizeSupplementalSearchValue(b.id) === searchText;

    if (aIsExactCanonicalSupplementalId !== bIsExactCanonicalSupplementalId) {
      return aIsExactCanonicalSupplementalId ? -1 : 1;
    }
  }

  const scoreDifference =
    (scores.get(`${b.kind}:${b.id}`) ?? 0) -
    (scores.get(`${a.kind}:${a.id}`) ?? 0);

  if (scoreDifference !== 0) {
    return scoreDifference;
  }

  return 0;
}

function getItemScoreKey(item: EmojiPickerItem) {
  return `${item.kind}:${item.id}`;
}

function setItemScore(
  scores: Map<string, number>,
  item: EmojiPickerItem,
  score: number,
) {
  scores.set(getItemScoreKey(item), score);
}

function getPreviousItemScore(
  scores: Map<string, number>,
  item: EmojiPickerItem,
) {
  return scores.get(getItemScoreKey(item)) ?? -1;
}

function scoreItemMatch(
  item: EmojiPickerItem,
  searchText: string,
  searchConfig?: EmojiPickerSupplementalSearch,
  nativeTerms?: NativeSearchTermsMap,
  nativeEmojiByKey?: Map<string, EmojiDataEmoji>,
): number {
  return item.kind === "native"
    ? scoreNativeItemMatch(item, searchText, nativeTerms, nativeEmojiByKey)
    : scoreSupplementalItemMatch(
        item,
        searchText,
        searchConfig?.weights,
        searchConfig?.mode === "unified",
      );
}

function filterSectionItems(
  items: EmojiPickerItem[],
  searchText: string,
  searchConfig?: EmojiPickerSupplementalSearch,
  nativeTerms?: NativeSearchTermsMap,
  nativeEmojiByKey?: Map<string, EmojiDataEmoji>,
) {
  if (!searchText) {
    return items;
  }

  const scores = new Map<string, number>();

  return items
    .filter((item) => {
      const score = scoreItemMatch(
        item,
        searchText,
        searchConfig,
        nativeTerms,
        nativeEmojiByKey,
      );

      if (score > 0) {
        setItemScore(scores, item, score);
        return true;
      }

      return false;
    })
    .sort(
      (a, b) =>
        compareScoredItems(
          a,
          b,
          scores,
          searchText,
          searchConfig?.mode === "unified",
        ),
    );
}

export function buildSupplementalSections(
  sections: EmojiPickerSection[],
  search: string,
  columns: number,
  categoryIndexStart: number,
  startRowIndexStart: number,
  searchConfig?: EmojiPickerSupplementalSearch,
  nativeSearchConfig?: EmojiPickerSearchConfig,
  nativeEmojis?: readonly EmojiDataEmoji[],
): BuiltEmojiPickerRows {
  const searchText = normalizeSearch(search);
  const nativeTerms = createNativeSearchTermsMap(nativeSearchConfig);
  const nativeEmojiByKey = createNativeEmojiMap(nativeEmojis);
  const rows: EmojiPickerDataRow[] = [];
  const categories: EmojiPickerDataCategory[] = [];
  let count = 0;
  let categoryIndex = categoryIndexStart;
  let startRowIndex = startRowIndexStart;

  for (const section of sections) {
    const items = searchText
      ? section.searchable === false
        ? []
        : filterSectionItems(
            section.items,
            searchText,
            searchConfig,
            nativeTerms,
            nativeEmojiByKey,
          )
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
  const nativeEmojiByKey = createNativeEmojiMap(nativeEmojis);

  for (const emoji of nativeEmojis) {
    const score = scoreNativeEmojiMatch(emoji, searchText, nativeTerms);

    if (score > 0) {
      const item = toNativeEmojiPickerItem(emoji, skinTone);
      const key = getItemScoreKey(item);
      const previousScore = getPreviousItemScore(scored, item);

      if (score > previousScore) {
        setItemScore(scored, item, score);
        itemsByKey.set(key, item);
      }
    }
  }

  for (const section of supplemental.sections ?? []) {
    if (section.searchable === false) {
      continue;
    }

    for (const item of filterSectionItems(
      section.items,
      searchText,
      supplemental.search,
      nativeTerms,
      nativeEmojiByKey,
    )) {
      const score = scoreItemMatch(
        item,
        searchText,
        supplemental.search,
        nativeTerms,
        nativeEmojiByKey,
      );

      if (score > 0) {
        const key = getItemScoreKey(item);
        const previousScore = getPreviousItemScore(scored, item);

        if (score > previousScore) {
          setItemScore(scored, item, score);
          itemsByKey.set(key, item);
        }
      }
    }
  }

  const items = Array.from(itemsByKey.values());

  if (items.length === 0) {
    return { count: 0, categories: [], rows: [] };
  }

  items.sort((a, b) =>
    compareScoredItems(a, b, scored, searchText, true),
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
