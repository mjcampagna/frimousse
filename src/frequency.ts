import type { EmojiPickerItem } from "./supplemental-types";
import type {
  EmojiPickerFrequentSection,
  EmojiPickerFrequentSectionOptions,
  EmojiPickerUsageEntry,
  EmojiPickerUsageOptions,
  EmojiPickerUsageSource,
} from "./frequency-types";

const DEFAULT_HALF_LIFE_MS = 1000 * 60 * 60 * 24 * 30;
const DEFAULT_MAX_ENTRIES = 100;
const DEFAULT_FREQUENT_SECTION_LIMIT = 20;

function toTimestamp(value: Date | number | undefined) {
  return typeof value === "number" ? value : value?.getTime() ?? Date.now();
}

function toItem(source: EmojiPickerUsageSource): EmojiPickerItem {
  return "item" in source ? source.item : source;
}

function decayScore(
  score: number,
  lastUsedAt: number,
  now: number,
  halfLifeMs: number,
) {
  if (score <= 0) {
    return 0;
  }

  if (now <= lastUsedAt) {
    return score;
  }

  return score * 2 ** (-(now - lastUsedAt) / halfLifeMs);
}

function trimEntries(entries: EmojiPickerUsageEntry[], maxEntries: number) {
  return entries.slice(0, Math.max(0, maxEntries));
}

export function getEmojiPickerUsageKey(source: EmojiPickerUsageSource) {
  const item = toItem(source);

  return `${item.kind}:${item.id}`;
}

export function rankEmojiPickerUsage(
  entries: readonly EmojiPickerUsageEntry[],
  options: EmojiPickerUsageOptions = {},
) {
  const now = toTimestamp(options.now);
  const halfLifeMs = options.halfLifeMs ?? DEFAULT_HALF_LIFE_MS;
  const maxEntries = options.maxEntries ?? DEFAULT_MAX_ENTRIES;

  return trimEntries(
    entries
      .map((entry) => ({
        ...entry,
        score: decayScore(entry.score, entry.lastUsedAt, now, halfLifeMs),
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        if (b.lastUsedAt !== a.lastUsedAt) {
          return b.lastUsedAt - a.lastUsedAt;
        }

        return b.uses - a.uses;
      }),
    maxEntries,
  );
}

export function recordEmojiPickerUsage(
  entries: readonly EmojiPickerUsageEntry[],
  source: EmojiPickerUsageSource,
  options: EmojiPickerUsageOptions = {},
) {
  const now = toTimestamp(options.now);
  const halfLifeMs = options.halfLifeMs ?? DEFAULT_HALF_LIFE_MS;
  const maxEntries = options.maxEntries ?? DEFAULT_MAX_ENTRIES;
  const item = toItem(source);
  const key = getEmojiPickerUsageKey(item);
  const nextEntries = entries.map((entry) =>
    entry.key === key
      ? {
          ...entry,
          item,
          score: decayScore(entry.score, entry.lastUsedAt, now, halfLifeMs) + 1,
          uses: entry.uses + 1,
          lastUsedAt: now,
        }
      : entry,
  );

  if (!nextEntries.some((entry) => entry.key === key)) {
    nextEntries.push({
      key,
      item,
      score: 1,
      uses: 1,
      lastUsedAt: now,
    });
  }

  return rankEmojiPickerUsage(nextEntries, {
    halfLifeMs,
    maxEntries,
    now,
  });
}

export function buildEmojiPickerFrequentSection(
  entries: readonly EmojiPickerUsageEntry[],
  options: EmojiPickerFrequentSectionOptions = {},
): EmojiPickerFrequentSection | null {
  const ranked = rankEmojiPickerUsage(entries, options);
  const limit = options.limit ?? DEFAULT_FREQUENT_SECTION_LIMIT;
  const items = ranked.slice(0, Math.max(0, limit)).map((entry) => entry.item);

  if (items.length === 0) {
    return null;
  }

  return {
    id: options.id ?? "frequently-used",
    label: options.label ?? "Frequently used",
    position: options.position ?? "prepend",
    searchable: options.searchable ?? false,
    items,
  };
}
