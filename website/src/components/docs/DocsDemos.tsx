import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  buildEmojiPickerFrequentSection,
  EmojiPicker,
  type EmojiPickerItemSelection,
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

type SectionDemoShellProps = {
  children: ReactNode;
  kicker: string;
  title: string;
  body: string;
};

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

const initialSelection: EmojiPickerItemSelection = {
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

function SectionDemoShell({
  kicker,
  title,
  body,
  children,
}: SectionDemoShellProps) {
  return (
    <section className="docs-demo">
      <div className="docs-demo-copy">
        <p className="eyebrow">{kicker}</p>
        <h2>{title}</h2>
        <p>{body}</p>
      </div>
      <div className="docs-demo-card">{children}</div>
    </section>
  );
}

function BasicDemo() {
  const columns = useResponsiveColumns(7, 8, 9);
  const [selection, setSelection] =
    useState<EmojiPickerItemSelection>(initialSelection);

  return (
    <SectionDemoShell
      kicker="Base API"
      title="Start with the familiar picker composition model."
      body="This stays close to upstream: grouped search, viewport, loading, empty, list, and the default native dataset."
    >
      <div className="docs-picker-wrap">
        <SelectionBurstLayer selection={selection} />
        <EmojiPicker.Root
          columns={columns}
          onSelectionChange={setSelection}
          sticky
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
            <EmojiPicker.List />
          </EmojiPicker.Viewport>
        </EmojiPicker.Root>
      </div>
    </SectionDemoShell>
  );
}

function ExtendedDemo() {
  const columns = useResponsiveColumns(7, 8, 9);
  const [selection, setSelection] =
    useState<EmojiPickerItemSelection>(initialSelection);
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
    (nextSelection: EmojiPickerItemSelection) => {
      setSelection(nextSelection);
      setUsageEntries((current) => recordEmojiPickerUsage(current, nextSelection));
    },
    [],
  );

  return (
    <SectionDemoShell
      kicker="Extended API"
      title="Opt into mixed sections and consumer-owned frequent items."
      body="This demonstrates fork-owned extensions: supplemental image-backed items, unified search, and a frequent row that stays consumer-owned."
    >
      <div className="docs-picker-wrap">
        <SelectionBurstLayer selection={selection} />
        <EmojiPicker.Root
          columns={columns}
          onSelectionChange={handleSelectionChange}
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
            {selection.kind === "native" ? (
              <>
                <div className="picker-footer-emoji">{selection.item.emoji}</div>
                <span className="picker-footer-label">{selection.item.label}</span>
              </>
            ) : (
              <>
                <img
                  className="picker-footer-image"
                  src={selection.item.imageUrl}
                  alt={selection.item.label}
                  width="20"
                  height="20"
                />
                <span className="picker-footer-label">{selection.item.label}</span>
              </>
            )}
          </div>
        </EmojiPicker.Root>
      </div>
    </SectionDemoShell>
  );
}

function NativeSearchDemo() {
  const columns = useResponsiveColumns(7, 8, 9);
  const [query, setQuery] = useState("good bye");
  const [selection, setSelection] =
    useState<EmojiPickerItemSelection>(initialSelection);

  const examples = [
    { term: "good_bye", value: "good_bye", emoji: "👋" },
    { term: "hyper link", value: "hyper link", emoji: "🔗" },
    { term: "red heart", value: "red heart", emoji: "❤️" },
  ] as const;

  return (
    <SectionDemoShell
      kicker="Supplemental Packages"
      title="Feed native search enrichment into the picker as plain data."
      body="This demo generates the term map with `@slithy/emoji-kit`, then passes the resulting plain data into the picker. The picker stays ignorant of dataset policy and only consumes the enriched terms."
    >
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
            onSelectionChange={setSelection}
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
        <pre className="docs-demo-code">
          <code>{`<EmojiPicker.Root
  search={{
    native: {
      terms: {
        "👋": ["good_bye", "ttyl", "see_you"],
        "🔗": ["hyper_link", "url"],
        "❤️": ["red_heart", "love"],
      },
    },
  }}
>
  ...
</EmojiPicker.Root>`}</code>
        </pre>
      </div>
    </SectionDemoShell>
  );
}

export function DocsDemos() {
  return (
    <div className="docs-demos">
      <BasicDemo />
      <ExtendedDemo />
      <NativeSearchDemo />
    </div>
  );
}
