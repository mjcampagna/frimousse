const VARIATION_SELECTOR_PATTERN = /[\uFE0E\uFE0F]/g;

export function normalizeEmojiCompatKey(emoji: string): string {
  return emoji.normalize("NFC").replace(VARIATION_SELECTOR_PATTERN, "");
}
