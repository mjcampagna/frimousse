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
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    viewportRef.current?.focus();
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
    <section className="demo-card">
      <div className="demo-header">
        <div>
          <p className="demo-eyebrow">Live demo</p>
          <h2>Theme-aware picker preview</h2>
        </div>
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
        <div className="demo-notes">
          <p>
            This first pass keeps the site mostly static while letting us preview
            the package under both light and dark mode.
          </p>
          <ul>
            <li>Mixed supplemental sections</li>
            <li>Custom image-backed emoji</li>
            <li>Unified search</li>
            <li>Consumer-owned frequent tracking</li>
          </ul>
        </div>

        <EmojiPicker.Root
          className="picker-root"
          columns={9}
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
            <EmojiPicker.Search
              className="picker-search"
              placeholder="Search emoji"
            />
            <EmojiPicker.SkinToneSelector className="picker-skin-tone" />
          </div>

          <EmojiPicker.Viewport
            ref={viewportRef}
            className="picker-viewport"
            tabIndex={0}
          >
            <EmojiPicker.Loading className="picker-feedback">
              Loading emoji data…
            </EmojiPicker.Loading>
            <EmojiPicker.Empty className="picker-feedback">
              No emoji found.
            </EmojiPicker.Empty>
            <EmojiPicker.List
              className="picker-list"
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
            {selection.kind === "native" ? (
              <div className="picker-footer-emoji">{selection.item.emoji}</div>
            ) : (
              <img
                className="picker-footer-image"
                src={selection.item.imageUrl}
                alt={selection.item.label}
                width="20"
                height="20"
              />
            )}
            <span className="picker-footer-label">{selection.item.label}</span>
          </div>
        </EmojiPicker.Root>
      </div>
    </section>
  );
}
