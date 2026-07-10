import { useId, useMemo, useState } from "react";
import {
  buildEmojiPickerFrequentSection,
  createEmojiPickerCustomSection,
  EmojiPicker,
  recordEmojiPickerUsage,
  type EmojiPickerItemSelection,
  type EmojiPickerUsageEntry,
} from "@slithy/frimousse";

type PickerState = {
  columns: number;
  locale: "en" | "fr";
  skinTone: "none" | "light" | "medium";
  sticky: boolean;
};

const INITIAL_STATE: PickerState = {
  columns: 9,
  locale: "en",
  skinTone: "none",
  sticky: true,
};

export function App() {
  const [picker, setPicker] = useState<PickerState>(INITIAL_STATE);
  const [selectedSelection, setSelectedSelection] =
    useState<EmojiPickerItemSelection>({
      kind: "native",
      item: {
        kind: "native",
        id: "🙂",
        emoji: "🙂",
        label: "Slightly smiling face",
      },
    });
  const [usageEntries, setUsageEntries] = useState<EmojiPickerUsageEntry[]>([]);
  const [search, setSearch] = useState("");
  const headingId = useId();
  const customSection = useMemo(
    () =>
      createEmojiPickerCustomSection(
        [
          {
            id: "shipit",
            label: "Ship It",
            imageUrl: "https://github.githubassets.com/images/icons/emoji/shipit.png",
            aliases: ["ship it", "approve"],
            tags: ["approval", "launch"],
          },
          {
            id: "party-parrot",
            label: "Party Parrot",
            imageUrl:
              "https://cultofthepartyparrot.com/parrots/hd/parrot.gif",
            aliases: ["party parrot"],
            tags: ["party", "celebrate"],
          },
          {
            id: "build-bot",
            label: "Build Bot",
            imageUrl:
              "https://github.githubassets.com/images/icons/emoji/unicode/1f916.png?v8",
            aliases: ["robot"],
            tags: ["ci", "automation"],
          },
        ],
        {
          id: "workspace-custom",
          label: "Custom emoji",
        },
      ),
    [],
  );
  const frequentSection = useMemo(
    () =>
      buildEmojiPickerFrequentSection(usageEntries, {
        label: "Frequently used",
        limit: 6,
        searchable: false,
      }),
    [usageEntries],
  );
  const supplemental = useMemo(
    () => ({
      sections: [
        {
          id: "starter-pack",
          label: "Starter pack",
          position: "prepend" as const,
          searchable: false,
          items: [
            {
              kind: "native" as const,
              id: "🎉",
              emoji: "🎉",
              label: "Party popper",
            },
            customSection.items[0]!,
          ],
        },
        ...(frequentSection ? [frequentSection] : []),
        customSection,
      ],
      search: {
        mode: "unified" as const,
        resultsLabel: "Results",
      },
    }),
    [customSection, frequentSection],
  );
  const selectedPreview =
    selectedSelection.kind === "native" ? (
      <span className="selection-emoji">{selectedSelection.item.emoji}</span>
    ) : (
      <img
        className="selection-image"
        src={selectedSelection.item.imageUrl}
        alt={selectedSelection.item.label}
        width="24"
        height="24"
      />
    );

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Developer Sandbox</p>
        <h1 id={headingId}>Frimousse playground.</h1>
        <p className="hero-copy">
          This workspace is for fast iteration on the library contract: selection,
          search, locale, skin tone, layout, and styling hooks.
        </p>
      </section>

      <section className="panel controls-panel" aria-labelledby={headingId}>
        <div className="panel-header">
          <h2>Controls</h2>
          <button
            className="ghost-button"
            type="button"
            onClick={() => {
              setPicker(INITIAL_STATE);
              setSearch("");
            }}
          >
            Reset
          </button>
        </div>

        <div className="controls-grid">
          <label className="field">
            <span>Locale</span>
            <select
              value={picker.locale}
              onChange={(event) => {
                const locale = event.target.value as PickerState["locale"];
                setPicker((current) => ({ ...current, locale }));
              }}
            >
              <option value="en">English</option>
              <option value="fr">French</option>
            </select>
          </label>

          <label className="field">
            <span>Columns</span>
            <input
              type="range"
              min="6"
              max="12"
              value={picker.columns}
              onChange={(event) => {
                const columns = Number(event.target.value);
                setPicker((current) => ({ ...current, columns }));
              }}
            />
            <output>{picker.columns}</output>
          </label>

          <label className="field">
            <span>Skin tone</span>
            <select
              value={picker.skinTone}
              onChange={(event) => {
                const skinTone = event.target.value as PickerState["skinTone"];
                setPicker((current) => ({ ...current, skinTone }));
              }}
            >
              <option value="none">Default</option>
              <option value="light">Light</option>
              <option value="medium">Medium</option>
            </select>
          </label>

          <label className="toggle">
            <input
              type="checkbox"
              checked={picker.sticky}
              onChange={(event) => {
                const sticky = event.target.checked;
                setPicker((current) => ({ ...current, sticky }));
              }}
            />
            <span>Sticky category headers</span>
          </label>
        </div>
      </section>

      <section className="workspace">
        <article className="panel picker-panel">
          <div className="panel-header">
            <h2>Picker</h2>
            <div className="selection-pill" aria-live="polite">
              {selectedPreview}
              <span>{selectedSelection.item.label}</span>
            </div>
          </div>

          <EmojiPicker.Root
            key={`${picker.locale}-${picker.skinTone}-${picker.sticky}`}
            className="picker-root"
            locale={picker.locale}
            columns={picker.columns}
            skinTone={picker.skinTone}
            sticky={picker.sticky}
            supplemental={supplemental}
            onEmojiSelect={({ emoji, label }) => {
              setSelectedSelection({
                kind: "native",
                item: {
                  kind: "native",
                  id: emoji,
                  emoji,
                  label,
                },
              });
            }}
            onSelectionChange={(selection) => {
              setSelectedSelection(selection);
              setUsageEntries((current) =>
                recordEmojiPickerUsage(current, selection),
              );
            }}
          >
            <div className="picker-toolbar">
              <EmojiPicker.Search
                className="picker-search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                }}
              />
              <EmojiPicker.SkinToneSelector className="picker-skin-tone" />
            </div>

            <EmojiPicker.Viewport className="picker-viewport">
              <EmojiPicker.Loading className="picker-feedback">
                Loading emoji data…
              </EmojiPicker.Loading>
              <EmojiPicker.Empty className="picker-feedback">
                {({ search: currentSearch }) =>
                  currentSearch === ""
                    ? "No emoji available."
                    : `No emoji found for “${currentSearch}”.`
                }
              </EmojiPicker.Empty>
              <EmojiPicker.List
                className="picker-list"
                components={{
                  SupplementalEmoji: ({ emoji, ...props }) => (
                    <button
                      type="button"
                      {...props}
                      className="picker-custom-emoji"
                    >
                      {emoji.imageUrl ? (
                        <img
                          src={emoji.imageUrl}
                          alt={emoji.label}
                          loading="lazy"
                          width="24"
                          height="24"
                        />
                      ) : (
                        <span>{emoji.label}</span>
                      )}
                    </button>
                  ),
                }}
              />
            </EmojiPicker.Viewport>
          </EmojiPicker.Root>
        </article>

        <article className="panel notes-panel">
          <h2>What to validate here</h2>
          <ul className="notes-list">
            <li>Baseline import compatibility for a normal React consumer.</li>
            <li>Mixed native and image-backed custom emoji in one picker.</li>
            <li>Consumer-owned frequency tracking derived from selection callbacks.</li>
            <li>Unified search behavior across native and supplemental items.</li>
            <li>Keyboard navigation and sticky-header behavior as props change.</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
