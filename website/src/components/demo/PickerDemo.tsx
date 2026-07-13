import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  buildEmojiPickerFrequentSection,
  EmojiPicker,
  type EmojiPickerListSupplementalEmojiProps,
  type ItemSelection,
  type EmojiPickerUsageEntry,
  recordEmojiPickerUsage,
} from "@slithy/frimousse";
import {
  createDemoInitialFrequentEntries,
  demoCustomSection,
} from "./picker-demo-data";
import { PickerLoadingSkeleton } from "./PickerLoadingSkeleton";
import { SelectionBurstLayer } from "./SelectionBurstLayer";

const initialSelection: ItemSelection = {
  kind: "native",
  item: {
    kind: "native",
    id: "🙂",
    emoji: "🙂",
    label: "Slightly smiling face",
  },
};

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

function DemoPickerFooter() {
  return (
    <EmojiPicker.ActiveItem>
      {({ item: activeSelection }) => {
        if (!activeSelection) {
          return null;
        }

        return activeSelection.kind === "native" ? (
          <>
            <div className="picker-footer-emoji">
              {activeSelection.item.emoji}
            </div>
            <span className="picker-footer-label">
              {activeSelection.item.label}
            </span>
          </>
        ) : (
          <>
            <img
              className="picker-footer-image"
              src={activeSelection.item.imageUrl}
              alt={activeSelection.item.label}
              width="20"
              height="20"
            />
            <span className="picker-footer-label">
              {activeSelection.item.label}
            </span>
          </>
        );
      }}
    </EmojiPicker.ActiveItem>
  );
}

const DemoPickerPanel = memo(function DemoPickerPanel({
  onCelebrateSelection,
}: {
  onCelebrateSelection: (selection: ItemSelection) => void;
}) {
  const [usageEntries, setUsageEntries] = useState<EmojiPickerUsageEntry[]>(() =>
    createDemoInitialFrequentEntries(),
  );
  const [columns, setColumns] = useState(9);
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

    updateColumns();

    window.addEventListener("resize", updateColumns);

    return () => {
      window.removeEventListener("resize", updateColumns);
    };
  }, []);

  const handleSelectionChange = useCallback(
    (nextSelection: ItemSelection) => {
      setUsageEntries((current) => recordEmojiPickerUsage(current, nextSelection));
      onCelebrateSelection(nextSelection);
    },
    [onCelebrateSelection],
  );

  return (
    <div className="demo-grid">
      <EmojiPicker.Root
        columns={columns}
        sticky
        onItemSelect={handleSelectionChange}
        supplemental={supplemental}
      >
        <div className="picker-toolbar">
          <EmojiPicker.Search placeholder="Search emoji" />
          <EmojiPicker.SkinToneSelector />
        </div>

        <EmojiPicker.Viewport tabIndex={0}>
          <EmojiPicker.Loading>
            <PickerLoadingSkeleton columns={columns} />
          </EmojiPicker.Loading>
          <EmojiPicker.Empty>No emoji found.</EmojiPicker.Empty>
          <EmojiPicker.List
            components={{
              SupplementalEmoji: DemoSupplementalEmoji,
            }}
          />
        </EmojiPicker.Viewport>
        <div className="picker-footer">
          <DemoPickerFooter />
        </div>
      </EmojiPicker.Root>
    </div>
  );
});

export function PickerDemo() {
  const [burstSelection, setBurstSelection] =
    useState<ItemSelection>(initialSelection);

  const handleCelebrateSelection = useCallback(
    (selection: ItemSelection) => {
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
    </section>
  );
}
