import {
  type CSSProperties,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  buildEmojiPickerFrequentSection,
  EmojiPicker,
  type EmojiPickerListSupplementalEmojiProps,
  type EmojiPickerItemSelection,
  type EmojiPickerUsageEntry,
  recordEmojiPickerUsage,
} from "@slithy/frimousse";
import {
  createDemoInitialFrequentEntries,
  demoCustomSection,
} from "./picker-demo-data";

const initialSelection: EmojiPickerItemSelection = {
  kind: "native",
  item: {
    kind: "native",
    id: "🙂",
    emoji: "🙂",
    label: "Slightly smiling face",
  },
};

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

const DemoSupplementalEmoji = memo(function DemoSupplementalEmoji({
  emoji,
  ...props
}: EmojiPickerListSupplementalEmojiProps) {
  return (
    <button {...props} className="picker-custom-emoji" type="button">
      {emoji.imageUrl ? (
        <img
          src={emoji.imageUrl}
          alt={emoji.label}
          width="24"
          height="24"
        />
      ) : (
        emoji.label
      )}
    </button>
  );
});

function SelectionBurstLayer({
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

function DemoPickerFooter({
  mode,
  selection,
}: {
  mode: "selection" | "active";
  selection: EmojiPickerItemSelection;
}) {
  return (
    <EmojiPicker.ActiveSelection>
      {({ selection: activeSelection }) => {
        const displayedSelection =
          mode === "active" && activeSelection ? activeSelection : selection;

        return displayedSelection.kind === "native" ? (
          <>
            <div className="picker-footer-emoji">
              {displayedSelection.item.emoji}
            </div>
            <span className="picker-footer-label">
              {displayedSelection.item.label}
            </span>
          </>
        ) : (
          <>
            <img
              className="picker-footer-image"
              src={displayedSelection.item.imageUrl}
              alt={displayedSelection.item.label}
              width="20"
              height="20"
            />
            <span className="picker-footer-label">
              {displayedSelection.item.label}
            </span>
          </>
        );
      }}
    </EmojiPicker.ActiveSelection>
  );
}

const DemoPickerPanel = memo(function DemoPickerPanel({
  onCelebrateSelection,
}: {
  onCelebrateSelection: (selection: EmojiPickerItemSelection) => void;
}) {
  const [selection, setSelection] =
    useState<EmojiPickerItemSelection>(initialSelection);
  const [usageEntries, setUsageEntries] = useState<EmojiPickerUsageEntry[]>(() =>
    createDemoInitialFrequentEntries(),
  );
  const [columns, setColumns] = useState(9);
  const [footerMode, setFooterMode] = useState<"selection" | "active">(
    "selection",
  );
  const viewportRef = useRef<HTMLDivElement>(null);
  const frequentSection = useMemo(
    () =>
      buildEmojiPickerFrequentSection(usageEntries, {
        label: "Frequently used",
        limit: 8,
        searchable: false,
      }),
    [usageEntries],
  );
  const supplemental = useMemo(
    () => ({
      sections: frequentSection
        ? [frequentSection, demoCustomSection]
        : [demoCustomSection],
      search: {
        mode: "unified" as const,
        resultsLabel: "Results",
      },
    }),
    [frequentSection],
  );

  useEffect(() => {
    const updateColumns = () => {
      if (window.matchMedia("(max-width: 359px)").matches) {
        setColumns(7);
        return;
      }

      if (window.matchMedia("(max-width: 429px)").matches) {
        setColumns(8);
        return;
      }

      setColumns(9);
    };

    viewportRef.current?.focus();
    updateColumns();

    window.addEventListener("resize", updateColumns);

    return () => {
      window.removeEventListener("resize", updateColumns);
    };
  }, []);

  const handleSelectionChange = useCallback(
    (nextSelection: EmojiPickerItemSelection) => {
      setUsageEntries((current) => recordEmojiPickerUsage(current, nextSelection));
      setSelection(nextSelection);
      setFooterMode("selection");
      onCelebrateSelection(nextSelection);
    },
    [onCelebrateSelection],
  );

  return (
    <div className="demo-grid">
      <EmojiPicker.Root
        columns={columns}
        onKeyDownCapture={(event) => {
          if (
            event.key === "ArrowUp" ||
            event.key === "ArrowDown" ||
            event.key === "ArrowLeft" ||
            event.key === "ArrowRight" ||
            event.key === "Home" ||
            event.key === "End" ||
            event.key === "PageUp" ||
            event.key === "PageDown"
          ) {
            setFooterMode("active");
          }
        }}
        onPointerLeave={() => {
          setFooterMode("selection");
        }}
        onPointerMove={() => {
          setFooterMode("active");
        }}
        sticky
        onSelectionChange={handleSelectionChange}
        supplemental={supplemental}
      >
        <div className="picker-toolbar">
          <EmojiPicker.Search placeholder="Search emoji" />
          <EmojiPicker.SkinToneSelector />
        </div>

        <EmojiPicker.Viewport ref={viewportRef} tabIndex={0}>
          <EmojiPicker.Loading>Loading emoji data…</EmojiPicker.Loading>
          <EmojiPicker.Empty>No emoji found.</EmojiPicker.Empty>
          <EmojiPicker.List
            components={{
              SupplementalEmoji: DemoSupplementalEmoji,
            }}
          />
        </EmojiPicker.Viewport>
        <div className="picker-footer">
          <DemoPickerFooter mode={footerMode} selection={selection} />
        </div>
      </EmojiPicker.Root>
    </div>
  );
});

export function PickerDemo() {
  const [burstSelection, setBurstSelection] =
    useState<EmojiPickerItemSelection>(initialSelection);

  const handleCelebrateSelection = useCallback(
    (selection: EmojiPickerItemSelection) => {
      setBurstSelection(selection);
    },
    [],
  );

  return (
    <section className="demo-section">
      <div className="demo-card">
        <SelectionBurstLayer selection={burstSelection} />
        <DemoPickerPanel onCelebrateSelection={handleCelebrateSelection} />
      </div>

      <div className="demo-notes">
        <p>
          This pass restores consumer-owned frequent tracking on top of custom
          image-backed emoji, while keeping the demo site itself simple.
        </p>
        <ul>
          <li>Seeded frequent entries update in place as selections change</li>
          <li>Custom image-backed emoji stay in their own appended section</li>
          <li>Unified supplemental search is enabled</li>
          <li>The site remains a thin playground around consumer-facing APIs</li>
        </ul>
      </div>
    </section>
  );
}
