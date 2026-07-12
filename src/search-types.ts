export type EmojiPickerNativeSearchConfig = {
  terms?: Record<string, string[]>;
};

export type EmojiPickerSearchConfig = {
  native?: EmojiPickerNativeSearchConfig;
};
