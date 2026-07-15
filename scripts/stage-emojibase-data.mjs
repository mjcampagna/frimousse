#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const emojibasePackagePath = require.resolve("emojibase-data/package.json");
const emojibaseRoot = path.dirname(emojibasePackagePath);
const requiredFiles = ["data.json", "messages.json"];

function printHelp() {
  console.log(`Usage:
  pnpm emojibase:stage --out ./public/emojibase-data [options]
  pnpm exec frimousse-stage-emojibase-data --out ./public/emojibase-data [options]

Options:
  --out <path>              Required output directory
  --locales <list>          Comma-separated locale list (default: en)
  --overwrite               Replace files that already exist
  --help                    Show this message
`);
}

function parseArgs(argv) {
  let outDir;
  let locales = ["en"];
  let overwrite = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help") {
      return { help: true };
    }

    if (arg === "--overwrite") {
      overwrite = true;
      continue;
    }

    const value = argv[index + 1];

    if (typeof value !== "string") {
      throw new Error(`Missing value for ${arg}`);
    }

    if (arg === "--out") {
      outDir = value;
      index += 1;
      continue;
    }

    if (arg === "--locales") {
      locales = value
        .split(",")
        .map((locale) => locale.trim())
        .filter((locale) => locale.length > 0);
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!outDir) {
    throw new Error("Missing required --out");
  }

  if (locales.length === 0) {
    throw new Error("Expected at least one locale");
  }

  return {
    help: false,
    outDir,
    locales,
    overwrite,
  };
}

async function ensureLocaleFilesExist(locale) {
  for (const fileName of requiredFiles) {
    const filePath = path.join(emojibaseRoot, locale, fileName);

    try {
      await fs.access(filePath);
    } catch {
      throw new Error(
        `Missing ${locale}/${fileName} in emojibase-data. Check the locale name or installed dataset version.`,
      );
    }
  }
}

async function copyLocaleFiles(outDir, locale, overwrite) {
  await ensureLocaleFilesExist(locale);

  const targetLocaleDir = path.join(outDir, locale);
  await fs.mkdir(targetLocaleDir, { recursive: true });

  for (const fileName of requiredFiles) {
    const sourcePath = path.join(emojibaseRoot, locale, fileName);
    const targetPath = path.join(targetLocaleDir, fileName);

    await fs.copyFile(
      sourcePath,
      targetPath,
      overwrite ? 0 : fs.constants.COPYFILE_EXCL,
    );
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  const resolvedOutDir = path.resolve(process.cwd(), options.outDir);
  const copiedLocales = [];

  for (const locale of options.locales) {
    await copyLocaleFiles(resolvedOutDir, locale, options.overwrite);
    copiedLocales.push(locale);
  }

  console.log(
    `Staged Emojibase data for ${copiedLocales.join(", ")} in ${resolvedOutDir}`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
