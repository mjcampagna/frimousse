import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildEmojiPickerFrequentSection,
  createEmojiPickerCustomSection,
  EmojiPicker,
  recordEmojiPickerUsage,
  type EmojiPickerItemSelection,
  type EmojiPickerUsageEntry,
} from "@slithy/frimousse";

const customEmojiFiles = [
  "angry",
  "attitude",
  "blow_up",
  "bullhorn",
  "chest_thump",
  "cough",
  "entranced",
  "excited",
  "eyebrows",
  "good_job",
  "haha",
  "headbutt",
  "hiding",
  "holding_bomb",
  "in_love",
  "injured",
  "looking",
  "lookout",
  "love",
  "money_bath",
  "nudge",
  "pointing",
  "puking",
  "quivering",
  "reading",
  "say_nothing",
  "scared",
  "scheming",
  "see_money",
  "surrender",
  "sweaty",
  "whining",
  "whisper",
  "yelling",
  "zombie",
] as const;

const customEmojiEntries = customEmojiFiles.map((name) => {
  const words = name.split("_");
  const label = words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  const alias = words.join(" ");

  return {
    id: name.replaceAll("_", "-"),
    label,
    imageUrl: `/emoji/${name}.gif`,
    aliases: [alias],
    tags: words,
  };
});

const customSection = createEmojiPickerCustomSection(
  customEmojiEntries,
  {
    id: "custom-emoji",
    label: "Custom emoji",
  },
);

const initialSelection: EmojiPickerItemSelection = {
  kind: "native",
  item: {
    kind: "native",
    id: "🙂",
    emoji: "🙂",
    label: "Slightly smiling face",
  },
};

function createSeededUsageEntries(): EmojiPickerUsageEntry[] {
  const now = Date.now();

  return [
    {
      key: "native:👍",
      item: {
        kind: "native",
        id: "👍",
        emoji: "👍",
        label: "Thumbs up",
      },
      score: 5,
      uses: 5,
      lastUsedAt: now,
    },
    {
      key: "native:👀",
      item: {
        kind: "native",
        id: "👀",
        emoji: "👀",
        label: "Eyes",
      },
      score: 4,
      uses: 4,
      lastUsedAt: now,
    },
    {
      key: "native:😂",
      item: {
        kind: "native",
        id: "😂",
        emoji: "😂",
        label: "Face with tears of joy",
      },
      score: 3,
      uses: 3,
      lastUsedAt: now,
    },
    {
      key: "native:😅",
      item: {
        kind: "native",
        id: "😅",
        emoji: "😅",
        label: "Grinning face with sweat",
      },
      score: 2,
      uses: 2,
      lastUsedAt: now,
    },
  ];
}

export function PickerDemo() {
  const [selection, setSelection] =
    useState<EmojiPickerItemSelection>(initialSelection);
  const [usageEntries, setUsageEntries] =
    useState<EmojiPickerUsageEntry[]>(() => createSeededUsageEntries());
  const [columns, setColumns] = useState(9);
  const viewportRef = useRef<HTMLDivElement>(null);

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

  const supplemental = useMemo(() => {
    const frequentSection = buildEmojiPickerFrequentSection(usageEntries, {
      label: "Frequently used",
      limit: 6,
      searchable: false,
    });

    return {
      sections: [
        ...(frequentSection ? [frequentSection] : []),
        customSection,
      ],
      search: {
        mode: "unified" as const,
        resultsLabel: "Results",
      },
    };
  }, [usageEntries]);

  return (
    <section className="demo-section">
      <div className="demo-card">
        <div className="demo-header">
          <div className="selection-pill" aria-live="polite">
            {selection.kind === "native" ? (
              <span className="selection-emoji">{selection.item.emoji}</span>
            ) : (
              <img
                className="selection-image"
                src={selection.item.imageUrl}
                alt={selection.item.label}
                width="24"
                height="24"
              />
            )}
            <span>{selection.item.label}</span>
          </div>
        </div>

        <div className="demo-grid">
          <EmojiPicker.Root
            columns={columns}
            sticky
            supplemental={supplemental}
            onSelectionChange={(nextSelection) => {
              setSelection(nextSelection);
              setUsageEntries((current) =>
                recordEmojiPickerUsage(current, nextSelection),
              );
            }}
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
                  SupplementalEmoji: ({ emoji, ...props }) => (
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
                  ),
                }}
              />
            </EmojiPicker.Viewport>
            <div className="picker-footer">
              <EmojiPicker.ActiveSelection>
                {({ selection }) =>
                  selection && (
                    <>
                      {selection.kind === "native" ? (
                        <div className="picker-footer-emoji">
                          {selection.item.emoji}
                        </div>
                      ) : (
                        <img
                          className="picker-footer-image"
                          src={selection.item.imageUrl}
                          alt={selection.item.label}
                          width="20"
                          height="20"
                        />
                      )}
                      <span className="picker-footer-label">
                        {selection.item.label}
                      </span>
                    </>
                  )
                }
              </EmojiPicker.ActiveSelection>
            </div>
          </EmojiPicker.Root>
        </div>
      </div>

      <div className="demo-notes">
        <p>
          This demo exercises the fork’s additive model without changing the
          familiar picker composition.
        </p>
        <ul>
          <li>Supplemental sections alongside native emoji</li>
          <li>Image-backed custom emoji rendered in-place</li>
          <li>Unified search across native and supplemental items</li>
          <li>Library helpers for consumer-owned "frecency" items</li>
        </ul>
      </div>
    </section>
  );
}
