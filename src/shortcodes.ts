import type { ItemSelection } from "./supplemental-types";
import type { EmojiPickerItem } from "./supplemental-types";
import { formatAsShortcode } from "./utils/format-as-shortcode";

export type EmojiNativeShortcodeMap = Record<
  string,
  string | readonly string[]
>;

export type EmojiShortcodeSource = EmojiPickerItem | ItemSelection;

export type EmojiShortcodeOptions = {
  nativeShortcodes?: EmojiNativeShortcodeMap;
};

function normalizeShortcodes(values: readonly string[]) {
  const shortcodes = Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter((value) => value.length > 0)
        .map(formatAsShortcode),
    ),
  );

  return shortcodes;
}

function toItem(source: EmojiShortcodeSource) {
  return "item" in source ? source.item : source;
}

export function getEmojiShortcodes(
  source: EmojiShortcodeSource,
  options: EmojiShortcodeOptions = {},
) {
  const item = toItem(source);

  if (item.kind === "native") {
    const nativeShortcodes = options.nativeShortcodes?.[item.emoji] ??
      options.nativeShortcodes?.[item.id];

    if (!nativeShortcodes) {
      return [];
    }

    return normalizeShortcodes(
      Array.isArray(nativeShortcodes) ? nativeShortcodes : [nativeShortcodes],
    );
  }

  return normalizeShortcodes([
    item.shortcode ?? item.id,
    ...(item.aliases ?? []),
  ]);
}

export function getEmojiPrimaryShortcode(
  source: EmojiShortcodeSource,
  options?: EmojiShortcodeOptions,
) {
  return getEmojiShortcodes(source, options)[0];
}
