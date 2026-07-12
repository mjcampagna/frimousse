import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  buildEmojiPickerFrequentSection,
  EmojiPicker,
  type ItemSelection,
  type EmojiPickerListSupplementalEmojiProps,
  type EmojiPickerUsageEntry,
  recordEmojiPickerUsage,
} from "@slithy/frimousse";
import { buildNativeEmojiSearchTermMap } from "@slithy/emoji-kit";
import {
  createDemoInitialFrequentEntries,
  demoCustomSection,
} from "../demo/picker-demo-data";
import { PickerLoadingSkeleton } from "../demo/PickerLoadingSkeleton";
import { SelectionBurstLayer } from "../demo/SelectionBurstLayer";

const nativeSearchTerms = buildNativeEmojiSearchTermMap([
  {
    emoji: "👋",
    shortcodes: ["good_bye", "ttyl", "see_you"],
  },
  {
    emoji: "🔗",
    shortcodes: ["hyper_link", "url"],
  },
  {
    emoji: "❤️",
    shortcodes: ["red_heart"],
    aliases: ["love"],
  },
]);

const initialSelection: ItemSelection = {
  kind: "native",
  item: {
    kind: "native",
    id: "🙂",
    emoji: "🙂",
    label: "Slightly smiling face",
  },
};

const DocsSupplementalEmoji = memo(function DocsSupplementalEmoji({
  emoji,
  ...props
}: EmojiPickerListSupplementalEmojiProps) {
  return (
    <button {...props} className="picker-custom-emoji" type="button">
      {emoji.imageUrl ? (
        <img src={emoji.imageUrl} alt={emoji.label} width="24" height="24" />
      ) : (
        emoji.label
      )}
    </button>
  );
});

function DemoPickerFooter({
  selection,
}: {
  selection: ItemSelection;
}) {
  return (
    <EmojiPicker.ActiveItem>
      {({ item: activeItem }) => {
        const displayedSelection = activeItem ?? selection;

        return displayedSelection.kind === "native" ? (
          <>
            <div className="picker-footer-emoji">{displayedSelection.item.emoji}</div>
            <span className="picker-footer-label">{displayedSelection.item.label}</span>
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
            <span className="picker-footer-label">{displayedSelection.item.label}</span>
          </>
        );
      }}
    </EmojiPicker.ActiveItem>
  );
}

function useResponsiveColumns(small = 7, medium = 8, large = 9) {
  const [columns, setColumns] = useState(large);

  useEffect(() => {
    const updateColumns = () => {
      if (window.matchMedia("(max-width: 359px)").matches) {
        setColumns(small);
        return;
      }

      if (window.matchMedia("(max-width: 429px)").matches) {
        setColumns(medium);
        return;
      }

      setColumns(large);
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);

    return () => {
      window.removeEventListener("resize", updateColumns);
    };
  }, [large, medium, small]);

  return columns;
}

export function ExtendedDemo() {
  const columns = useResponsiveColumns(7, 8, 9);
  const [selection, setSelection] =
    useState<ItemSelection>(initialSelection);
  const [usageEntries, setUsageEntries] = useState<EmojiPickerUsageEntry[]>(() =>
    createDemoInitialFrequentEntries(),
  );

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

  const handleSelectionChange = useCallback(
    (nextSelection: ItemSelection) => {
      setSelection(nextSelection);
      setUsageEntries((current) => recordEmojiPickerUsage(current, nextSelection));
    },
    [],
  );

  return (
    <div className="docs-demo-card">
      <div className="docs-picker-wrap">
        <SelectionBurstLayer selection={selection} />
        <EmojiPicker.Root
          columns={columns}
          onItemSelect={handleSelectionChange}
          sticky
          supplemental={supplemental}
        >
          <div className="picker-toolbar">
            <EmojiPicker.Search placeholder="Search native and custom emoji" />
            <EmojiPicker.SkinToneSelector />
          </div>
          <EmojiPicker.Viewport tabIndex={0}>
            <EmojiPicker.Loading>
              <PickerLoadingSkeleton columns={columns} />
            </EmojiPicker.Loading>
            <EmojiPicker.Empty>No emoji found.</EmojiPicker.Empty>
            <EmojiPicker.List
              components={{
                SupplementalEmoji: DocsSupplementalEmoji,
              }}
            />
          </EmojiPicker.Viewport>
          <div className="picker-footer">
            <DemoPickerFooter selection={selection} />
          </div>
        </EmojiPicker.Root>
      </div>
    </div>
  );
}

export function NativeSearchDemo() {
  const columns = useResponsiveColumns(7, 8, 9);
  const [query, setQuery] = useState("good bye");
  const [selection, setSelection] =
    useState<ItemSelection>(initialSelection);

  const examples = [
    { term: "good_bye", value: "good_bye", emoji: "👋" },
    { term: "hyper link", value: "hyper link", emoji: "🔗" },
    { term: "red heart", value: "red heart", emoji: "❤️" },
  ] as const;

  return (
    <div className="docs-demo-card">
      <div className="docs-demo-stack">
        <div className="docs-demo-chip-row">
          {examples.map((example) => (
            <button
              key={example.value}
              className="docs-demo-chip"
              onClick={() => setQuery(example.value)}
              type="button"
            >
              <span className="docs-demo-chip-term">{example.term}</span>
              <span className="docs-demo-chip-arrow" aria-hidden="true">
                →
              </span>
              <span className="docs-demo-chip-emoji" aria-hidden="true">
                {example.emoji}
              </span>
            </button>
          ))}
        </div>
        <div className="docs-picker-wrap">
          <SelectionBurstLayer selection={selection} />
          <EmojiPicker.Root
            columns={columns}
            onItemSelect={setSelection}
            search={{ native: { terms: nativeSearchTerms } }}
            sticky
          >
            <div className="picker-toolbar">
              <EmojiPicker.Search
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try good_bye, hyper link, or red heart"
                value={query}
              />
              <EmojiPicker.SkinToneSelector />
            </div>
            <EmojiPicker.Viewport tabIndex={0}>
              <EmojiPicker.Loading>
                <PickerLoadingSkeleton columns={columns} />
              </EmojiPicker.Loading>
              <EmojiPicker.Empty>
                {({ search }) => `No emoji found for "${search}"`}
              </EmojiPicker.Empty>
              <EmojiPicker.List />
            </EmojiPicker.Viewport>
            </EmojiPicker.Root>
          </div>
      </div>
    </div>
  );
}
