import type { EmojiPickerItem } from "./supplemental-types";
import { createSupplementalItem } from "./supplemental-item";
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

function sanitizeNativeItem(item: unknown): EmojiPickerItem {
  const record = item as Record<string, unknown>;

  if (
    typeof item !== "object" ||
    item === null ||
    record.kind !== "native" ||
    typeof record.id !== "string" ||
    typeof record.emoji !== "string" ||
    typeof record.label !== "string"
  ) {
    throw new Error();
  }

  const id = record.id.trim();
  const emoji = record.emoji.trim();
  const label = record.label.trim();

  if (id.length === 0 || emoji.length === 0 || label.length === 0) {
    throw new Error();
  }

  return {
    kind: "native",
    id,
    emoji,
    label,
  };
}

function sanitizeUsageItem(item: unknown): EmojiPickerItem {
  const record = item as Record<string, unknown>;

  if (typeof item !== "object" || item === null || typeof record.kind !== "string") {
    throw new Error();
  }

  return record.kind === "native"
    ? sanitizeNativeItem(item)
    : createSupplementalItem({
        id: typeof record.id === "string" ? record.id : "",
        label: typeof record.label === "string" ? record.label : undefined,
        imageUrl: typeof record.imageUrl === "string" ? record.imageUrl : undefined,
        tags: Array.isArray(record.tags)
          ? record.tags.filter((value): value is string => typeof value === "string")
          : undefined,
        keywords: Array.isArray(record.keywords)
          ? record.keywords.filter(
              (value): value is string => typeof value === "string",
            )
          : undefined,
        aliases: Array.isArray(record.aliases)
          ? record.aliases.filter(
              (value): value is string => typeof value === "string",
            )
          : undefined,
        data: record.data,
      });
}

function sortUsageEntries(
  entries: EmojiPickerUsageEntry[],
  mode: "frecency" | "recent",
) {
  return entries.sort((a, b) => {
    if (mode === "recent") {
      if (b.lastUsedAt !== a.lastUsedAt) {
        return b.lastUsedAt - a.lastUsedAt;
      }

      if (b.uses !== a.uses) {
        return b.uses - a.uses;
      }

      return b.score - a.score;
    }

    if (b.score !== a.score) {
      return b.score - a.score;
    }

    if (b.lastUsedAt !== a.lastUsedAt) {
      return b.lastUsedAt - a.lastUsedAt;
    }

    return b.uses - a.uses;
  });
}

export function getEmojiPickerUsageKey(source: EmojiPickerUsageSource) {
  const item = toItem(source);

  return `${item.kind}:${item.id}`;
}

export function sanitizeEmojiPickerUsageEntries(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  const entries: EmojiPickerUsageEntry[] = [];

  for (const entry of value) {
    try {
      const record = entry as Record<string, unknown>;

      if (
        typeof entry !== "object" ||
        entry === null ||
        typeof record.score !== "number" ||
        typeof record.uses !== "number" ||
        typeof record.lastUsedAt !== "number"
      ) {
        continue;
      }

      const item = sanitizeUsageItem(record.item);

      entries.push({
        key: getEmojiPickerUsageKey(item),
        item,
        score: record.score,
        uses: record.uses,
        lastUsedAt: record.lastUsedAt,
      });
    } catch {
      continue;
    }
  }

  return entries;
}

export function rankEmojiPickerUsage(
  entries: readonly EmojiPickerUsageEntry[],
  options: EmojiPickerUsageOptions = {},
) {
  const mode = options.mode ?? "frecency";
  const now = toTimestamp(options.now);
  const halfLifeMs = options.halfLifeMs ?? DEFAULT_HALF_LIFE_MS;
  const maxEntries = options.maxEntries ?? DEFAULT_MAX_ENTRIES;

  return trimEntries(
    sortUsageEntries(
      entries
        .map((entry) => ({
          ...entry,
          score:
            mode === "recent"
              ? entry.score
              : decayScore(entry.score, entry.lastUsedAt, now, halfLifeMs),
        }))
      .filter((entry) => entry.score > 0)
      ,
      mode,
    ),
    maxEntries,
  );
}

export function recordEmojiPickerUsage(
  entries: readonly EmojiPickerUsageEntry[],
  source: EmojiPickerUsageSource,
  options: EmojiPickerUsageOptions = {},
) {
  const mode = options.mode ?? "frecency";
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
          score:
            (mode === "recent"
              ? entry.score
              : decayScore(entry.score, entry.lastUsedAt, now, halfLifeMs)) + 1,
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
    mode,
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
