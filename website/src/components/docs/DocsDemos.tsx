import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  buildNativeEmojiSearchTermMapFromEmojibase,
  mergeNativeEmojiSearchTermMaps,
} from "@slithy/emoji-transforms";
import {
  buildEmojiPickerFrequentSection,
  createCustomSection,
  EmojiPicker,
  getEmojiPrimaryShortcode,
  type ItemSelection,
  type EmojiNativeShortcodeMap,
  type EmojiPickerListSupplementalEmojiProps,
  type EmojiPickerUsageEntry,
  recordEmojiPickerUsage,
} from "@slithy/frimousse";
import {
  createDemoInitialFrequentEntries,
  demoCustomSection,
} from "../demo/picker-demo-data";
import {
  fullNativeSearchTerms,
  fullNativeShortcodes,
} from "./generated/companion-demo-data";
import { PickerLoadingSkeleton } from "../demo/PickerLoadingSkeleton";
import { SelectionBurstLayer } from "../demo/SelectionBurstLayer";

function cloneSearchTermMap(
  terms: Record<string, readonly string[]>,
): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(terms).map(([emoji, values]) => [emoji, [...values]]),
  );
}

const companionEmojiRecords = [
  {
    emoji: "👋",
    label: "Waving hand",
    shortcodes: ["wave", "good_bye"],
    tags: ["see you", "farewell"],
  },
  {
    emoji: "🔗",
    label: "Link",
    shortcodes: ["link"],
    tags: ["hyper link", "url"],
  },
  {
    emoji: "❤️",
    label: "Red heart",
    shortcodes: ["red_heart"],
    tags: ["love"],
  },
];

const nativeSearchTerms = buildNativeEmojiSearchTermMapFromEmojibase(
  companionEmojiRecords,
  {
    includeLabel: true,
    includeTags: true,
  },
);

const nativeSearchTermsWithCustomAliases = mergeNativeEmojiSearchTermMaps(
  nativeSearchTerms,
  {
    "👋": ["catch you later"],
    "❤️": ["favorite"],
  },
);

const fullNativeSearchTermMap = cloneSearchTermMap(fullNativeSearchTerms);

const shortcodeFirstCustomSection = createCustomSection(
  [
    {
      id: "good_job",
      label: "Good job",
      imageUrl: "/emoji/good_job.gif",
      aliases: [":good_job:", "good-job"],
    },
    {
      id: "say_nothing",
      label: "Say nothing",
      imageUrl: "/emoji/say_nothing.gif",
      aliases: [":say_nothing:", "say-nothing"],
    },
  ],
  {
    id: "custom",
    label: "Custom emoji",
  },
);

const initialSelection: ItemSelection = {
  kind: "native",
  item: {
    kind: "native",
    id: "🙂",
    emoji: "🙂",
    label: "Slightly smiling face",
  },
};

const initialMappedSelection: ItemSelection = {
  kind: "native",
  item: {
    kind: "native",
    id: "👋",
    emoji: "👋",
    label: "Waving hand",
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
  nativeShortcodeMap,
}: {
  nativeShortcodeMap?: EmojiNativeShortcodeMap;
}) {
  return (
    <EmojiPicker.ActiveItem>
      {({ item: activeItem }) => {
        if (!activeItem) {
          return null;
        }

        const shortcode = getEmojiPrimaryShortcode(activeItem, {
          nativeShortcodes: nativeShortcodeMap,
        });

        return (
          <>
            {activeItem.kind === "native" ? (
              <div className="picker-footer-emoji">{activeItem.item.emoji}</div>
            ) : (
              <img
                className="picker-footer-image"
                src={activeItem.item.imageUrl}
                alt={activeItem.item.label}
                width="20"
                height="20"
              />
            )}
            <div className="picker-footer-copy">
              <span className="picker-footer-label">{activeItem.item.label}</span>
              {shortcode ? (
                <span className="picker-footer-shortcode">{shortcode}</span>
              ) : null}
            </div>
          </>
        );
      }}
    </EmojiPicker.ActiveItem>
  );
}

function DemoPickerShortcodeFooter({
  nativeShortcodeMap,
}: {
  nativeShortcodeMap: EmojiNativeShortcodeMap;
}) {
  return (
    <EmojiPicker.ActiveItem>
      {({ item: activeItem }) => {
        if (!activeItem || activeItem.kind !== "native") {
          return null;
        }

        const shortcode = getEmojiPrimaryShortcode(activeItem, {
          nativeShortcodes: nativeShortcodeMap,
        });

        return (
          <>
            <div className="picker-footer-emoji">{activeItem.item.emoji}</div>
            <div className="picker-footer-copy">
              <span className="picker-footer-label">{activeItem.item.label}</span>
              {shortcode ? (
                <span className="picker-footer-shortcode">{shortcode}</span>
              ) : null}
            </div>
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
            <DemoPickerFooter />
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
    { term: "favorite", value: "favorite", emoji: "❤️" },
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
              search={{ native: { terms: nativeSearchTermsWithCustomAliases } }}
              sticky
            >
            <div className="picker-toolbar">
              <EmojiPicker.Search
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try good_bye, hyper link, or favorite"
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

export function NativeShortcodeDemo() {
  const columns = useResponsiveColumns(7, 8, 9);
  const [query, setQuery] = useState("wave");
  const [selection, setSelection] =
    useState<ItemSelection>(initialMappedSelection);
  const examples = [
    { term: "wave", value: "wave", emoji: "👋" },
    { term: "link", value: "link", emoji: "🔗" },
    { term: "red_heart", value: "red_heart", emoji: "❤️" },
  ] as const;

  return (
    <div className="docs-demo-card">
      <div className="docs-demo-stack">
        <div className="docs-demo-caption">
          Select one of the mapped examples below to show its canonical shortcode in the footer.
        </div>
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
                placeholder="Try wave, link, or red_heart"
                value={query}
              />
              <EmojiPicker.SkinToneSelector />
            </div>
            <EmojiPicker.Viewport tabIndex={0}>
              <EmojiPicker.Loading>
                <PickerLoadingSkeleton columns={columns} />
              </EmojiPicker.Loading>
              <EmojiPicker.Empty>No emoji found.</EmojiPicker.Empty>
              <EmojiPicker.List />
            </EmojiPicker.Viewport>
            <div className="picker-footer">
              <DemoPickerShortcodeFooter
                nativeShortcodeMap={fullNativeShortcodes}
              />
            </div>
          </EmojiPicker.Root>
        </div>
      </div>
    </div>
  );
}

export function ShortcodeFirstDemo() {
  const columns = useResponsiveColumns(7, 8, 9);
  const [query, setQuery] = useState("");
  const [selection, setSelection] =
    useState<ItemSelection>(initialSelection);
  const examples = [
    { term: "wave", value: "wave", emoji: "👋" },
    { term: "red_heart", value: "red_heart", emoji: "❤️" },
    { term: "good_job", value: "good_job", imageUrl: "/emoji/good_job.gif" },
    {
      term: "say_nothing",
      value: "say_nothing",
      imageUrl: "/emoji/say_nothing.gif",
    },
  ] as const;

  return (
    <div className="docs-demo-card">
      <div className="docs-demo-stack">
        <div className="docs-demo-caption">
          Unified search can mix native shortcode aliases with shortcode-first custom emoji names.
        </div>
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
                {"emoji" in example ? (
                  example.emoji
                ) : (
                  <img
                    src={example.imageUrl}
                    alt=""
                    width="20"
                    height="20"
                  />
                )}
              </span>
            </button>
          ))}
        </div>
        <div className="docs-picker-wrap">
          <SelectionBurstLayer selection={selection} />
          <EmojiPicker.Root
            columns={columns}
            onItemSelect={setSelection}
            search={{ native: { terms: fullNativeSearchTermMap } }}
            sticky
            supplemental={{
              sections: [shortcodeFirstCustomSection],
              search: {
                mode: "unified",
                resultsLabel: "Results",
              },
            }}
          >
            <div className="picker-toolbar">
              <EmojiPicker.Search
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search emoji"
                value={query}
              />
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
              <DemoPickerFooter nativeShortcodeMap={fullNativeShortcodes} />
            </div>
          </EmojiPicker.Root>
        </div>
      </div>
    </div>
  );
}
