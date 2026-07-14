const CANVAS_SIZE = 2;
const EMOJI_FONT_FAMILY =
  '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';

let context: CanvasRenderingContext2D | null = null;

function getCanvasContext(): CanvasRenderingContext2D | null {
  try {
    context ??= document
      .createElement("canvas")
      .getContext("2d", { willReadFrequently: true });
  } catch {
    return null;
  }

  return context;
}

export function isEmojiSupported(emoji: string): boolean {
  const nextContext = getCanvasContext();

  if (!nextContext) {
    return false;
  }

  queueMicrotask(() => {
    if (context) {
      context = null;
    }
  });

  nextContext.canvas.width = CANVAS_SIZE;
  nextContext.canvas.height = CANVAS_SIZE;
  nextContext.font = `2px ${EMOJI_FONT_FAMILY}`;
  nextContext.textBaseline = "middle";

  // Unsupported ZWJ sequences often render as multiple glyphs.
  if (nextContext.measureText(emoji).width >= CANVAS_SIZE * 2) {
    return false;
  }

  nextContext.fillStyle = "#00f";
  nextContext.fillText(emoji, 0, 0);

  const blue = nextContext.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE).data;

  nextContext.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  nextContext.fillStyle = "#f00";
  nextContext.fillText(emoji, 0, 0);

  const red = nextContext.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE).data;

  for (let index = 0; index < CANVAS_SIZE * CANVAS_SIZE * 4; index += 4) {
    if (
      blue[index] !== red[index] ||
      blue[index + 1] !== red[index + 1] ||
      blue[index + 2] !== red[index + 2]
    ) {
      return false;
    }
  }

  return true;
}
