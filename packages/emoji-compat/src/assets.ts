import { mkdir, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import type {
  CollectFallbackHexcodesOptions,
  DownloadFallbackAssetsOptions,
  DownloadFallbackAssetsResult,
  EmojiCompatRecord,
  FallbackAssetKind,
  FallbackAssetRecord,
} from "./types";
export type {
  CollectFallbackHexcodesOptions,
  DownloadFallbackAssetsOptions,
  DownloadFallbackAssetsResult,
  FallbackAssetKind,
  FallbackAssetRecord,
} from "./types";

const DEFAULT_FALLBACK_ASSET_BASE_URL =
  "https://raw.githubusercontent.com/jdecked/twemoji/main/assets/svg";

function shouldIncludeVersion(
  version: number,
  options: CollectFallbackHexcodesOptions,
): boolean {
  return version > options.versionFloor;
}

function normalizeHexcode(hexcode: string | undefined): string | undefined {
  return hexcode?.trim().toLowerCase() || undefined;
}

function getFallbackAssetFilename(asset: FallbackAssetRecord): string {
  return `${asset.hexcode}.svg`;
}

function buildFallbackAssetUrl(baseUrl: string, filename: string): string {
  return `${baseUrl.replace(/\/$/, "")}/${filename.replace(/^\//, "")}`;
}

async function pathExists(pathname: string): Promise<boolean> {
  try {
    await stat(pathname);
    return true;
  } catch {
    return false;
  }
}

function pushAssetRecord(
  records: FallbackAssetRecord[],
  seen: Set<string>,
  emoji: string,
  version: number,
  hexcode: string | undefined,
  kind: FallbackAssetKind,
): void {
  const normalizedHexcode = normalizeHexcode(hexcode);

  if (!normalizedHexcode || seen.has(normalizedHexcode)) {
    return;
  }

  seen.add(normalizedHexcode);
  records.push({
    emoji,
    version,
    hexcode: normalizedHexcode,
    kind,
  });
}

export function buildFallbackAssetManifest(
  records: readonly EmojiCompatRecord[],
  options: CollectFallbackHexcodesOptions,
): FallbackAssetRecord[] {
  const manifest: FallbackAssetRecord[] = [];
  const seenHexcodes = new Set<string>();
  const includeSkins = options.includeSkins ?? true;

  for (const record of records) {
    if (!shouldIncludeVersion(record.version, options)) {
      continue;
    }

    pushAssetRecord(
      manifest,
      seenHexcodes,
      record.emoji,
      record.version,
      record.hexcode,
      "base",
    );

    if (!includeSkins) {
      continue;
    }

    for (const skin of record.skins ?? []) {
      pushAssetRecord(
        manifest,
        seenHexcodes,
        skin.emoji,
        record.version,
        skin.hexcode,
        "skin",
      );
    }
  }

  return manifest;
}

export function collectFallbackHexcodes(
  records: readonly EmojiCompatRecord[],
  options: CollectFallbackHexcodesOptions,
): string[] {
  return buildFallbackAssetManifest(records, options).map(
    (record) => record.hexcode,
  );
}

export async function downloadFallbackAssets(
  manifest: readonly FallbackAssetRecord[],
  options: DownloadFallbackAssetsOptions,
): Promise<DownloadFallbackAssetsResult> {
  const overwrite = options.overwrite ?? false;
  const baseUrl = options.baseUrl ?? DEFAULT_FALLBACK_ASSET_BASE_URL;
  const filename = options.filename ?? getFallbackAssetFilename;
  let downloaded = 0;
  let skipped = 0;

  await mkdir(options.outDir, { recursive: true });

  for (const asset of manifest) {
    const assetFilename = filename(asset);
    const assetPath = join(options.outDir, assetFilename);

    if (!overwrite && (await pathExists(assetPath))) {
      skipped += 1;
      continue;
    }

    const assetUrl = buildFallbackAssetUrl(baseUrl, assetFilename);
    const response = await fetch(assetUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to download fallback asset ${asset.hexcode} from ${assetUrl} (${response.status})`,
      );
    }

    const buffer = await response.arrayBuffer();

    await mkdir(dirname(assetPath), { recursive: true });
    await writeFile(assetPath, new Uint8Array(buffer));
    downloaded += 1;
  }

  return {
    requested: manifest.length,
    downloaded,
    skipped,
  };
}
