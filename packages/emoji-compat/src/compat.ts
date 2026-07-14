import { normalizeEmojiCompatKey } from "./normalize";
import { isEmojiSupported } from "./support";
import type {
  EmojiCompatEntry,
  EmojiCompatMap,
  EmojiCompatOptions,
  EmojiCompatRecord,
  EmojiFallbackUrlOptions,
} from "./types";

function getSupportedVersion(
  records: readonly EmojiCompatRecord[],
  options: EmojiCompatOptions | undefined,
): number {
  if (typeof options?.supportedVersion === "number") {
    return options.supportedVersion;
  }

  return detectSupportedVersion(records, options);
}

export function detectSupportedVersion(
  records: readonly EmojiCompatRecord[],
  options?: Pick<EmojiCompatOptions, "isSupported">,
): number {
  const versionSamples = new Map<number, string>();

  for (const record of records) {
    if (!versionSamples.has(record.version)) {
      versionSamples.set(record.version, record.emoji);
    }
  }

  const versions = [...versionSamples.keys()].sort((left, right) => right - left);
  const probe = options?.isSupported ?? isEmojiSupported;

  for (const version of versions) {
    const emoji = versionSamples.get(version);

    if (emoji && probe(emoji)) {
      return version;
    }
  }

  return 0;
}

function addCompatEntry(
  target: EmojiCompatMap,
  emoji: string,
  version: number,
  hexcode: string | undefined,
  supportedVersion: number,
): void {
  const normalizedKey = normalizeEmojiCompatKey(emoji);
  const supported = version <= supportedVersion;

  target[normalizedKey] = {
    emoji,
    version,
    hexcode,
    supported,
    needsFallback: !supported,
  };
}

export function buildCompatMap(
  records: readonly EmojiCompatRecord[],
  options?: EmojiCompatOptions,
): EmojiCompatMap {
  const supportedVersion = getSupportedVersion(records, options);
  const compatMap: EmojiCompatMap = {};

  for (const record of records) {
    addCompatEntry(
      compatMap,
      record.emoji,
      record.version,
      record.hexcode,
      supportedVersion,
    );

    for (const skin of record.skins ?? []) {
      addCompatEntry(
        compatMap,
        skin.emoji,
        record.version,
        skin.hexcode,
        supportedVersion,
      );
    }
  }

  return compatMap;
}

export function getCompatEntry(
  compatMap: EmojiCompatMap,
  emoji: string,
): EmojiCompatEntry | undefined {
  return compatMap[normalizeEmojiCompatKey(emoji)];
}

export function getFallbackUrl(
  compatMap: EmojiCompatMap,
  emoji: string,
  options?: EmojiFallbackUrlOptions,
): string | undefined {
  const entry = getCompatEntry(compatMap, emoji);

  if (!entry?.needsFallback || !entry.hexcode) {
    return undefined;
  }

  const basePath = (options?.basePath ?? "/emoji").replace(/\/$/, "");
  const extension = options?.extension ?? "svg";

  return `${basePath}/${entry.hexcode.toLowerCase()}.${extension}`;
}
