import fs from "node:fs/promises";
import path from "node:path";
import emojibaseData from "emojibase-data/en/data.json" with { type: "json" };
import {
  buildFallbackAssetManifest,
  downloadFallbackAssets,
} from "../dist/assets.js";

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.length > 0;
}

function validateSkinRecord(record, pathLabel) {
  if (!isObject(record)) {
    throw new Error(`Expected ${pathLabel} to be an object`);
  }

  if (!isNonEmptyString(record.emoji)) {
    throw new Error(`Expected ${pathLabel}.emoji to be a non-empty string`);
  }

  if (
    record.hexcode !== undefined &&
    !isNonEmptyString(record.hexcode)
  ) {
    throw new Error(`Expected ${pathLabel}.hexcode to be a non-empty string when present`);
  }
}

function validateEmojiCompatRecord(record, index, sourceLabel) {
  const pathLabel = `${sourceLabel}[${index}]`;

  if (!isObject(record)) {
    throw new Error(`Expected ${pathLabel} to be an object`);
  }

  if (!isNonEmptyString(record.emoji)) {
    throw new Error(`Expected ${pathLabel}.emoji to be a non-empty string`);
  }

  if (typeof record.version !== "number" || !Number.isFinite(record.version)) {
    throw new Error(`Expected ${pathLabel}.version to be a finite number`);
  }

  if ("kind" in record) {
    throw new Error(
      `Unexpected ${pathLabel}.kind; expected source emoji records, not a generated fallback manifest`,
    );
  }

  if (
    record.hexcode !== undefined &&
    !isNonEmptyString(record.hexcode)
  ) {
    throw new Error(`Expected ${pathLabel}.hexcode to be a non-empty string when present`);
  }

  if (record.skins !== undefined) {
    if (!Array.isArray(record.skins)) {
      throw new Error(`Expected ${pathLabel}.skins to be an array when present`);
    }

    for (const [skinIndex, skin] of record.skins.entries()) {
      validateSkinRecord(skin, `${pathLabel}.skins[${skinIndex}]`);
    }
  }
}

function validateEmojiCompatRecords(records, sourceLabel) {
  for (const [index, record] of records.entries()) {
    validateEmojiCompatRecord(record, index, sourceLabel);
  }
}

function printHelp() {
  console.log(`Usage:
  pnpm --filter @slithy/emoji-compat assets:generate -- --version-floor 15 [options]

Options:
  --version-floor <number>   Required emoji support floor
  --data <path>              Read emoji records from a JSON file
  --manifest-out <path>      Write the manifest JSON to a file
  --out <path>               Output directory for downloaded assets
  --download                 Download Twemoji SVGs for the manifest
  --dry-run                  Print a summary without downloading assets
  --include-skins            Include skin-tone variants (default)
  --no-include-skins         Omit skin-tone variants
  --overwrite                Replace files that already exist
  --base-url <url>           Override the asset source URL
  --help                     Show this message
`);
}

function parseArgs(argv) {
  let versionFloor;
  let dataPath;
  let manifestOut;
  let outDir;
  let download = false;
  let dryRun = false;
  let includeSkins = true;
  let overwrite = false;
  let baseUrl;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help") {
      return { help: true };
    }

    if (arg === "--download") {
      download = true;
      continue;
    }

    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }

    if (arg === "--include-skins") {
      includeSkins = true;
      continue;
    }

    if (arg === "--no-include-skins") {
      includeSkins = false;
      continue;
    }

    if (arg === "--overwrite") {
      overwrite = true;
      continue;
    }

    const value = argv[index + 1];

    if (typeof value !== "string") {
      throw new Error(`Missing value for ${arg}`);
    }

    if (arg === "--version-floor") {
      const parsedValue = Number(value);

      if (!Number.isFinite(parsedValue)) {
        throw new Error(`Invalid version floor: ${value}`);
      }

      versionFloor = parsedValue;
      index += 1;
      continue;
    }

    if (arg === "--data") {
      dataPath = value;
      index += 1;
      continue;
    }

    if (arg === "--manifest-out") {
      manifestOut = value;
      index += 1;
      continue;
    }

    if (arg === "--out") {
      outDir = value;
      index += 1;
      continue;
    }

    if (arg === "--base-url") {
      baseUrl = value;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (typeof versionFloor !== "number") {
    throw new Error("Missing required --version-floor");
  }

  if (download && !outDir) {
    throw new Error("--download requires --out");
  }

  if (download && dryRun) {
    throw new Error("--download and --dry-run cannot be used together");
  }

  return {
    help: false,
    versionFloor,
    dataPath,
    manifestOut,
    outDir,
    download,
    dryRun,
    includeSkins,
    overwrite,
    baseUrl,
  };
}

async function readEmojiCompatRecords(dataPath) {
  if (!dataPath) {
    validateEmojiCompatRecords(emojibaseData, "emojibase-data");
    return emojibaseData;
  }

  const resolvedPath = path.resolve(process.cwd(), dataPath);
  const contents = await fs.readFile(resolvedPath, "utf8");
  const parsedValue = JSON.parse(contents);

  if (!Array.isArray(parsedValue)) {
    throw new Error(`Expected an array of emoji records in ${resolvedPath}`);
  }

  validateEmojiCompatRecords(parsedValue, resolvedPath);
  return parsedValue;
}

async function writeManifest(manifestOut, manifest) {
  const resolvedPath = path.resolve(process.cwd(), manifestOut);
  const contents = `${JSON.stringify(manifest, null, 2)}\n`;

  await fs.mkdir(path.dirname(resolvedPath), { recursive: true });
  await fs.writeFile(resolvedPath, contents);

  return resolvedPath;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  const records = await readEmojiCompatRecords(args.dataPath);
  const manifest = buildFallbackAssetManifest(records, {
    versionFloor: args.versionFloor,
    includeSkins: args.includeSkins,
  });
  const resolvedDataPath = args.dataPath
    ? path.resolve(process.cwd(), args.dataPath)
    : "emojibase-data/en/data.json";
  const baseCount = manifest.filter((record) => record.kind === "base").length;
  const skinCount = manifest.length - baseCount;

  console.log(
    `Prepared ${manifest.length} fallback assets above emoji version ${args.versionFloor}.`,
  );
  console.log(`Source data: ${resolvedDataPath}`);
  console.log(`Base assets: ${baseCount}`);
  console.log(`Skin assets: ${skinCount}`);

  if (args.manifestOut) {
    const manifestPath = await writeManifest(args.manifestOut, manifest);
    console.log(`Wrote manifest to ${manifestPath}`);
  } else if (!args.download && !args.dryRun) {
    console.log(JSON.stringify(manifest, null, 2));
  }

  if (args.dryRun || !args.download || !args.outDir) {
    return;
  }

  const result = await downloadFallbackAssets(manifest, {
    outDir: path.resolve(process.cwd(), args.outDir),
    overwrite: args.overwrite,
    baseUrl: args.baseUrl,
  });

  console.log(
    `Downloaded ${result.downloaded} assets (${result.skipped} skipped) into ${path.resolve(process.cwd(), args.outDir)}.`,
  );
}

try {
  await main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);

  console.error(message);
  process.exitCode = 1;
}
