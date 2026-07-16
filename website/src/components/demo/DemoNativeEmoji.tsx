import type { CSSProperties } from "react";
import type { EmojiPickerListEmojiProps } from "@slithy/frimousse";

export function DemoNativeEmoji({
  emoji,
  ...props
}: EmojiPickerListEmojiProps) {
  const { className, style, ...buttonProps } = props;

  return (
    <button
      className={className ? `picker-native-emoji ${className}` : "picker-native-emoji"}
      style={
        {
          "--emoji": `"${emoji.emoji}"`,
          ...style,
        } as CSSProperties
      }
      type="button"
      {...buttonProps}
    >
      <span className="picker-native-emoji-glyph" aria-hidden="true">
        {emoji.emoji}
      </span>
    </button>
  );
}
