export type NativeSearchTermSource = {
  emoji: string;
  shortcodes?: string[];
  aliases?: string[];
  terms?: string[];
};

function normalizeTerms(values: readonly string[] | undefined) {
  if (!values) {
    return [];
  }

  return values
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

export function buildNativeSearchTermsMap(
  entries: readonly NativeSearchTermSource[],
): Record<string, string[]> {
  const map: Record<string, string[]> = {};

  for (const entry of entries) {
    const terms = Array.from(
      new Set([
        ...normalizeTerms(entry.shortcodes),
        ...normalizeTerms(entry.aliases),
        ...normalizeTerms(entry.terms),
      ]),
    );

    if (terms.length > 0) {
      map[entry.emoji] = terms;
    }
  }

  return map;
}
