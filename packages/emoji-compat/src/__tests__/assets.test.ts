import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildFallbackAssetManifest,
  collectFallbackHexcodes,
  downloadFallbackAssets,
} from "../assets";
import type { EmojiCompatRecord, FallbackAssetRecord } from "../types";

const records: EmojiCompatRecord[] = [
  {
    emoji: "👍",
    version: 1,
    hexcode: "1F44D",
    skins: [{ emoji: "👍🏽", hexcode: "1F44D-1F3FD" }],
  },
  {
    emoji: "🪽",
    version: 15,
    hexcode: "1FAE9",
  },
  {
    emoji: "🐦‍🔥",
    version: 15.1,
    hexcode: "1F426-200D-1F525",
    skins: [{ emoji: "🐦‍🔥", hexcode: "1F426-200D-1F525" }],
  },
  {
    emoji: "🫩",
    version: 16,
    hexcode: "1FAE8",
  },
];

const tempDirs: string[] = [];

async function createTempDir(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "emoji-compat-assets-"));
  tempDirs.push(directory);
  return directory;
}

afterEach(async () => {
  vi.unstubAllGlobals();

  await Promise.all(
    tempDirs.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe("buildFallbackAssetManifest", () => {
  it("includes only emoji above the version floor", () => {
    expect(
      buildFallbackAssetManifest(records, {
        versionFloor: 15,
      }),
    ).toEqual([
      {
        emoji: "🐦‍🔥",
        version: 15.1,
        hexcode: "1f426-200d-1f525",
        kind: "base",
      },
      {
        emoji: "🫩",
        version: 16,
        hexcode: "1fae8",
        kind: "base",
      },
    ]);
  });

  it("includes skin variants by default", () => {
    expect(
      buildFallbackAssetManifest(
        [
          {
            emoji: "🧑‍🧑‍🧒",
            version: 16,
            hexcode: "1f9d1-200d-1f9d1-200d-1f9d2",
            skins: [
              {
                emoji: "🧑🏽‍🧑🏽‍🧒🏽",
                hexcode: "1f9d1-1f3fd-200d-1f9d1-1f3fd-200d-1f9d2-1f3fd",
              },
            ],
          },
        ],
        {
          versionFloor: 15,
        },
      ),
    ).toEqual([
      {
        emoji: "🧑‍🧑‍🧒",
        version: 16,
        hexcode: "1f9d1-200d-1f9d1-200d-1f9d2",
        kind: "base",
      },
      {
        emoji: "🧑🏽‍🧑🏽‍🧒🏽",
        version: 16,
        hexcode: "1f9d1-1f3fd-200d-1f9d1-1f3fd-200d-1f9d2-1f3fd",
        kind: "skin",
      },
    ]);
  });

  it("can omit skin variants explicitly", () => {
    expect(
      buildFallbackAssetManifest(
        [
          {
            emoji: "🧑‍🧑‍🧒",
            version: 16,
            hexcode: "1f9d1-200d-1f9d1-200d-1f9d2",
            skins: [
              {
                emoji: "🧑🏽‍🧑🏽‍🧒🏽",
                hexcode: "1f9d1-1f3fd-200d-1f9d1-1f3fd-200d-1f9d2-1f3fd",
              },
            ],
          },
        ],
        {
          versionFloor: 15,
          includeSkins: false,
        },
      ),
    ).toEqual([
      {
        emoji: "🧑‍🧑‍🧒",
        version: 16,
        hexcode: "1f9d1-200d-1f9d1-200d-1f9d2",
        kind: "base",
      },
    ]);
  });

  it("deduplicates repeated hexcodes and preserves first-seen order", () => {
    expect(
      buildFallbackAssetManifest(records, {
        versionFloor: 15,
      }),
    ).toEqual([
      {
        emoji: "🐦‍🔥",
        version: 15.1,
        hexcode: "1f426-200d-1f525",
        kind: "base",
      },
      {
        emoji: "🫩",
        version: 16,
        hexcode: "1fae8",
        kind: "base",
      },
    ]);
  });
});

describe("collectFallbackHexcodes", () => {
  it("returns the normalized hexcodes from the manifest", () => {
    expect(
      collectFallbackHexcodes(records, {
        versionFloor: 15,
      }),
    ).toEqual(["1f426-200d-1f525", "1fae8"]);
  });
});

describe("downloadFallbackAssets", () => {
  const manifest: FallbackAssetRecord[] = [
    {
      emoji: "🫩",
      version: 16,
      hexcode: "1fae8",
      kind: "base",
    },
    {
      emoji: "🧑🏽‍🧑🏽‍🧒🏽",
      version: 16,
      hexcode: "1f9d1-1f3fd-200d-1f9d1-1f3fd-200d-1f9d2-1f3fd",
      kind: "skin",
    },
  ];
  const firstManifestAsset = manifest[0]!;

  it("downloads every requested asset with the default filename convention", async () => {
    const outDir = await createTempDir();
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockImplementation(async () => new Response("<svg>ok</svg>", { status: 200 }));

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      downloadFallbackAssets(manifest, {
        outDir,
        baseUrl: "https://cdn.example.com/twemoji",
      }),
    ).resolves.toEqual({
      requested: 2,
      downloaded: 2,
      skipped: 0,
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://cdn.example.com/twemoji/1fae8.svg",
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://cdn.example.com/twemoji/1f9d1-1f3fd-200d-1f9d1-1f3fd-200d-1f9d2-1f3fd.svg",
    );
    await expect(readFile(join(outDir, "1fae8.svg"), "utf8")).resolves.toBe(
      "<svg>ok</svg>",
    );
  });

  it("skips existing files unless overwrite is enabled", async () => {
    const outDir = await createTempDir();
    const assetPath = join(outDir, "1fae8.svg");

    await writeFile(assetPath, "existing");

    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response("<svg>new</svg>", { status: 200 }));

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      downloadFallbackAssets([firstManifestAsset], {
        outDir,
      }),
    ).resolves.toEqual({
      requested: 1,
      downloaded: 0,
      skipped: 1,
    });

    expect(fetchMock).not.toHaveBeenCalled();
    await expect(readFile(assetPath, "utf8")).resolves.toBe("existing");
  });

  it("overwrites existing files when requested", async () => {
    const outDir = await createTempDir();
    const assetPath = join(outDir, "nested", "1fae8.svg");

    await mkdir(join(outDir, "nested"), { recursive: true });
    await writeFile(assetPath, "existing");

    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response("<svg>fresh</svg>", { status: 200 }));

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      downloadFallbackAssets([firstManifestAsset], {
        outDir,
        overwrite: true,
        filename(asset) {
          return `nested/${asset.hexcode}.svg`;
        },
      }),
    ).resolves.toEqual({
      requested: 1,
      downloaded: 1,
      skipped: 0,
    });

    await expect(readFile(assetPath, "utf8")).resolves.toBe("<svg>fresh</svg>");
  });

  it("throws when an asset request fails", async () => {
    const outDir = await createTempDir();
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response("missing", { status: 404 }));

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      downloadFallbackAssets([firstManifestAsset], {
        outDir,
        baseUrl: "https://cdn.example.com/twemoji",
      }),
    ).rejects.toThrow(
      "Failed to download fallback asset 1fae8 from https://cdn.example.com/twemoji/1fae8.svg (404)",
    );
  });
});
