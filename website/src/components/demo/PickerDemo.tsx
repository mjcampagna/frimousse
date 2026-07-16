import {
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

type DemoSectionLink = {
  id: string;
  label: string;
  top: number;
};

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

function slugifySectionLabel(label: string) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function collectDemoSections(root: HTMLDivElement): DemoSectionLink[] {
  return Array.from(root.querySelectorAll("[frimousse-category]"))
    .map((category, index) => {
      if (!(category instanceof HTMLElement)) {
        return null;
      }

      if (!category.style.top) {
        return null;
      }

      const header = category.querySelector("[frimousse-category-header]");

      if (!(header instanceof HTMLElement)) {
        return null;
      }

      const label = header.textContent?.trim();

      if (!label) {
        return null;
      }

      return {
        id: `${slugifySectionLabel(label)}-${index}`,
        label,
        top: category.offsetTop,
      };
    })
    .filter((section): section is DemoSectionLink => section !== null);
}

function DemoSectionRail({
  activeSectionId,
  onSelectSection,
  sections,
}: {
  activeSectionId: string | null;
  onSelectSection: (section: DemoSectionLink) => void;
  sections: DemoSectionLink[];
}) {
  if (sections.length < 2) {
    return null;
  }

  return (
    <nav
      aria-label="Emoji picker sections"
      className="demo-section-rail"
    >
      <ol className="demo-section-rail-list">
        {sections.map((section) => {
          const isActive = section.id === activeSectionId;
          const isAdditive =
            section.label === "Frequently used" || section.label === "Custom emoji";

          return (
            <li className="demo-section-rail-item" key={section.id}>
              <button
                aria-current={isActive ? "true" : undefined}
                data-additive={isAdditive ? "" : undefined}
                className="demo-section-rail-button"
                data-active={isActive ? "" : undefined}
                onClick={() => onSelectSection(section)}
                type="button"
              >
                <span className="demo-section-rail-dot" aria-hidden="true" />
                <span className="demo-section-rail-text">{section.label}</span>
                {isAdditive ? (
                  <span className="demo-section-rail-badge">Custom</span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

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
  const [sections, setSections] = useState<DemoSectionLink[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    const viewport = root.querySelector("[frimousse-viewport]");
    const list = root.querySelector("[frimousse-list]");

    if (!(viewport instanceof HTMLDivElement) || !(list instanceof HTMLDivElement)) {
      return;
    }

    let frame = 0;

    const syncSections = () => {
      const nextSections = collectDemoSections(root);
      const maxScrollTop = Math.max(
        viewport.scrollHeight - viewport.clientHeight,
        0,
      );
      const isAtBottom = maxScrollTop - viewport.scrollTop <= 2;
      const activeTop = viewport.scrollTop + 12;
      const activeSection = isAtBottom
        ? nextSections.at(-1) ?? null
        : (nextSections.findLast((section) => section.top <= activeTop) ??
            nextSections[0] ??
            null);

      setSections(nextSections);
      setActiveSectionId(activeSection?.id ?? null);
    };

    const scheduleSync = () => {
      cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(syncSections);
    };

    const resizeObserver = new ResizeObserver(() => {
      scheduleSync();
    });
    const mutationObserver = new MutationObserver(() => {
      scheduleSync();
    });

    scheduleSync();
    viewport.addEventListener("scroll", scheduleSync, { passive: true });
    resizeObserver.observe(viewport);
    resizeObserver.observe(list);
    mutationObserver.observe(list, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      cancelAnimationFrame(frame);
      viewport.removeEventListener("scroll", scheduleSync);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [columns, supplemental]);

  const handleSelectionChange = useCallback(
    (nextSelection: ItemSelection) => {
      setUsageEntries((current) => recordEmojiPickerUsage(current, nextSelection));
      onCelebrateSelection(nextSelection);
    },
    [onCelebrateSelection],
  );

  const handleSelectSection = useCallback((section: DemoSectionLink) => {
    const viewport = rootRef.current?.querySelector("[frimousse-viewport]");

    if (!(viewport instanceof HTMLDivElement)) {
      return;
    }

    viewport.scrollTo({
      top: section.top,
      behavior: "smooth",
    });
  }, []);

  return (
    <div className="demo-grid demo-grid-with-rail">
      <EmojiPicker.Root
        columns={columns}
        ref={rootRef}
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
      <DemoSectionRail
        activeSectionId={activeSectionId}
        onSelectSection={handleSelectSection}
        sections={sections}
      />
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
