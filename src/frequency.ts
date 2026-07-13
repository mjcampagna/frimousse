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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPositiveFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isNonNegativeFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function sanitizeNativeItem(item: unknown): EmojiPickerItem {
  if (
    !isRecord(item) ||
    item.kind !== "native" ||
    typeof item.id !== "string" ||
    typeof item.emoji !== "string" ||
    typeof item.label !== "string"
  ) {
    throw new Error();
  }

  const id = item.id.trim();
  const emoji = item.emoji.trim();
  const label = item.label.trim();

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
  if (!isRecord(item) || typeof item.kind !== "string") {
    throw new Error();
  }

  return item.kind === "native"
    ? sanitizeNativeItem(item)
    : createSupplementalItem({
        id: typeof item.id === "string" ? item.id : "",
        label: typeof item.label === "string" ? item.label : undefined,
        imageUrl: typeof item.imageUrl === "string" ? item.imageUrl : undefined,
        tags: Array.isArray(item.tags)
          ? item.tags.filter((value): value is string => typeof value === "string")
          : undefined,
        keywords: Array.isArray(item.keywords)
          ? item.keywords.filter(
              (value): value is string => typeof value === "string",
            )
          : undefined,
        aliases: Array.isArray(item.aliases)
          ? item.aliases.filter(
              (value): value is string => typeof value === "string",
            )
          : undefined,
        data: item.data,
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

  const entries = new Map<string, EmojiPickerUsageEntry>();

  for (const entry of value) {
    try {
      if (
        !isRecord(entry) ||
        !isPositiveFiniteNumber(entry.score) ||
        !isPositiveFiniteNumber(entry.uses) ||
        !isNonNegativeFiniteNumber(entry.lastUsedAt)
      ) {
        continue;
      }

      const item = sanitizeUsageItem(entry.item);
      const key = getEmojiPickerUsageKey(item);
      const sanitizedEntry = {
        key,
        item,
        score: entry.score,
        uses: entry.uses,
        lastUsedAt: entry.lastUsedAt,
      };
      const existingEntry = entries.get(key);

      if (!existingEntry) {
        entries.set(key, sanitizedEntry);
        continue;
      }

      const preferredEntry = sortUsageEntries(
        [existingEntry, sanitizedEntry],
        "frecency",
      )[0];

      if (preferredEntry) {
        entries.set(key, preferredEntry);
      }
    } catch {
      continue;
    }
  }

  return Array.from(entries.values());
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
        .filter(
          (entry) =>
            isPositiveFiniteNumber(entry.score) &&
            isPositiveFiniteNumber(entry.uses) &&
            isNonNegativeFiniteNumber(entry.lastUsedAt),
        ),
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
