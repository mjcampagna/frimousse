import { type CSSProperties, useEffect, useRef, useState } from "react";
import type { EmojiPickerItemSelection } from "@slithy/frimousse";

type SelectionBurst = {
  id: number;
  selection: EmojiPickerItemSelection;
};

const confettiOffsets = [
  { x: -64, y: -108, rotation: -30, color: "var(--confetti-1)" },
  { x: -36, y: -132, rotation: -12, color: "var(--confetti-2)" },
  { x: -8, y: -144, rotation: 14, color: "var(--confetti-3)" },
  { x: 20, y: -138, rotation: 34, color: "var(--confetti-4)" },
  { x: 46, y: -116, rotation: 18, color: "var(--confetti-5)" },
  { x: 70, y: -92, rotation: -16, color: "var(--confetti-6)" },
] as const;

export function SelectionBurstLayer({
  selection,
}: {
  selection: EmojiPickerItemSelection;
}) {
  const [bursts, setBursts] = useState<SelectionBurst[]>([]);
  const burstIdRef = useRef(0);
  const hasMountedRef = useRef(false);
  const timeoutIdsRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      for (const timeoutId of timeoutIdsRef.current) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    const id = burstIdRef.current++;

    setBursts((current) => [...current, { id, selection }]);

    const timeoutId = window.setTimeout(() => {
      setBursts((current) => current.filter((burst) => burst.id !== id));
      timeoutIdsRef.current = timeoutIdsRef.current.filter(
        (currentTimeoutId) => currentTimeoutId !== timeoutId,
      );
    }, 1600);
    timeoutIdsRef.current.push(timeoutId);
  }, [selection]);

  return (
    <div className="selection-burst-layer" aria-live="polite">
      {bursts.map((burst) => (
        <div key={burst.id} className="selection-burst">
          <div className="selection-burst-badge">
            {burst.selection.kind === "native" ? (
              <span className="selection-burst-emoji">
                {burst.selection.item.emoji}
              </span>
            ) : (
              <img
                className="selection-burst-image"
                src={burst.selection.item.imageUrl}
                alt={burst.selection.item.label}
                width="36"
                height="36"
              />
            )}
          </div>
          <div className="selection-burst-confetti" aria-hidden="true">
            {confettiOffsets.map((piece, index) => (
              <span
                key={index}
                className="selection-burst-piece"
                style={
                  {
                    "--burst-x": `${piece.x}px`,
                    "--burst-y": `${piece.y}px`,
                    "--burst-rotation": `${piece.rotation}deg`,
                    "--burst-color": piece.color,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
