import { useId, useState } from "react";
import { EmojiPicker } from "frimousse";

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
  const [selectedEmoji, setSelectedEmoji] = useState<string>("🙂");
  const [selectedLabel, setSelectedLabel] = useState<string>("Slightly smiling face");
  const [search, setSearch] = useState("");
  const headingId = useId();

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
              <span className="selection-emoji">{selectedEmoji}</span>
              <span>{selectedLabel}</span>
            </div>
          </div>

          <EmojiPicker.Root
            key={`${picker.locale}-${picker.skinTone}-${picker.sticky}`}
            className="picker-root"
            locale={picker.locale}
            columns={picker.columns}
            skinTone={picker.skinTone}
            sticky={picker.sticky}
            onEmojiSelect={({ emoji, label }) => {
              setSelectedEmoji(emoji);
              setSelectedLabel(label);
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
              <EmojiPicker.List className="picker-list" />
            </EmojiPicker.Viewport>
          </EmojiPicker.Root>
        </article>

        <article className="panel notes-panel">
          <h2>What to validate here</h2>
          <ul className="notes-list">
            <li>Baseline import compatibility for a normal React consumer.</li>
            <li>Keyboard navigation and sticky-header behavior as props change.</li>
            <li>Search behavior with a controlled input.</li>
            <li>Surface area for future additive features without app-specific assumptions.</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
