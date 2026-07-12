import { page } from "vitest/browser";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import * as EmojiPicker from "../emoji-picker";
import {
  buildEmojiPickerFrequentSection,
  createEmojiPickerCustomSection,
  recordEmojiPickerUsage,
  type EmojiPickerUsageEntry,
} from "../../index";

const supplemental = {
  sections: [
    {
      id: "favorites",
      label: "Favorites",
      position: "prepend" as const,
      items: [
        {
          kind: "native" as const,
          id: "🎉",
          emoji: "🎉",
          label: "Party popper",
        },
        {
          kind: "supplemental" as const,
          id: "shipit",
          label: "Ship It",
          aliases: ["ship it"],
        },
      ],
    },
    {
      id: "team",
      label: "Team",
      position: "append" as const,
      items: [
        {
          kind: "supplemental" as const,
          id: "grinning-bot",
          label: "Grinning Bot",
          aliases: ["grinning"],
        },
      ],
    },
  ],
};

function SupplementalPage({
  searchMode,
  withActiveEmoji = false,
}: {
  searchMode?: "grouped" | "unified";
  withActiveEmoji?: boolean;
}) {
  const [nativeSelection, setNativeSelection] = useState("");
  const [selection, setSelection] = useState("");

  return (
    <>
      <p data-testid="native-selection">{nativeSelection}</p>
      <p data-testid="selection">{selection}</p>
      <EmojiPicker.Root
        onEmojiSelect={(emoji) => {
          setNativeSelection(emoji.emoji);
        }}
        onItemSelect={(nextSelection) => {
          setSelection(
            nextSelection.kind === "native"
              ? `native:${nextSelection.item.emoji}`
              : `supplemental:${nextSelection.item.id}`,
          );
        }}
        supplemental={{
          ...supplemental,
          search: searchMode ? { mode: searchMode, resultsLabel: "Results" } : undefined,
        }}
      >
        <EmojiPicker.Search data-testid="search" />
        <EmojiPicker.Viewport data-testid="viewport" style={{ height: 1200 }}>
          {withActiveEmoji ? (
            <EmojiPicker.ActiveEmoji>
              {({ emoji }) =>
                emoji ? (
                  <p data-testid="active-emoji">{emoji.label}</p>
                ) : null
              }
            </EmojiPicker.ActiveEmoji>
          ) : null}
          <EmojiPicker.ActiveItem>
            {({ item }) =>
              item ? (
                <p data-testid="active-selection">
                  {item.kind}:{item.item.label}
                </p>
              ) : null
            }
          </EmojiPicker.ActiveItem>
          <EmojiPicker.List
            components={{
              CategoryHeader: ({ category, ...props }) => (
                <div {...props}>{category.label}</div>
              ),
              Emoji: ({ emoji, ...props }) => (
                <button {...props} type="button">
                  {emoji.emoji}
                </button>
              ),
              SupplementalEmoji: ({ emoji, ...props }) => (
                <button {...props} type="button">
                  {emoji.label}
                </button>
              ),
            }}
          />
        </EmojiPicker.Viewport>
      </EmojiPicker.Root>
    </>
  );
}

function CustomEmojiPage() {
  const [usageEntries, setUsageEntries] = useState<EmojiPickerUsageEntry[]>([]);
  const frequentSection = buildEmojiPickerFrequentSection(usageEntries, {
    label: "Frequently used",
    limit: 3,
    searchable: false,
  });
  const customSection = createEmojiPickerCustomSection(
    [
      {
        id: "shipit",
        label: "Ship It",
        imageUrl: "https://example.com/shipit.png",
        aliases: ["ship it"],
        tags: ["approve"],
      },
    ],
    {
      id: "custom",
      label: "Custom emoji",
      position: "prepend",
    },
  );
  const sections = frequentSection
    ? [frequentSection, customSection]
    : [customSection];

  return (
    <EmojiPicker.Root
      onItemSelect={(selection) => {
        setUsageEntries((current) => recordEmojiPickerUsage(current, selection));
      }}
      supplemental={{
        sections,
        search: {
          mode: "unified",
          resultsLabel: "Results",
        },
      }}
    >
      <EmojiPicker.Search data-testid="custom-search" />
      <EmojiPicker.Viewport style={{ height: 1200 }}>
        <EmojiPicker.List
          components={{
            CategoryHeader: ({ category, ...props }) => (
              <div {...props}>{category.label}</div>
            ),
            Emoji: ({ emoji, ...props }) => (
              <button {...props} type="button">
                {emoji.emoji}
              </button>
            ),
            SupplementalEmoji: ({ emoji, ...props }) => (
              <button {...props} data-image-url={emoji.imageUrl} type="button">
                {emoji.label}
              </button>
            ),
          }}
        />
      </EmojiPicker.Viewport>
    </EmojiPicker.Root>
  );
}

function DefaultCustomEmojiPage() {
  const customSection = createEmojiPickerCustomSection(
    [
      {
        id: "shipit",
        label: "Ship It",
        imageUrl: "https://example.com/shipit.png",
      },
    ],
    {
      id: "custom",
      label: "Custom emoji",
      position: "prepend",
    },
  );

  return (
    <EmojiPicker.Root
      supplemental={{
        sections: [customSection],
      }}
    >
      <EmojiPicker.Search />
      <EmojiPicker.Viewport style={{ height: 1200 }}>
        <EmojiPicker.List />
      </EmojiPicker.Viewport>
    </EmojiPicker.Root>
  );
}

function FirstFrequentInsertionPage() {
  const [usageEntries, setUsageEntries] = useState<EmojiPickerUsageEntry[]>([]);
  const frequentSection = buildEmojiPickerFrequentSection(usageEntries, {
    label: "Frequently used",
    limit: 3,
    searchable: false,
  });

  return (
    <EmojiPicker.Root
      onItemSelect={(selection) => {
        setUsageEntries((current) => recordEmojiPickerUsage(current, selection));
      }}
      supplemental={{
        sections: frequentSection ? [frequentSection] : [],
      }}
    >
      <EmojiPicker.Search />
      <EmojiPicker.Viewport style={{ height: 1200 }}>
        <EmojiPicker.ActiveItem>
          {({ item }) =>
            item ? (
              <p data-testid="active-selection-state">
                {item.kind}:{item.item.label}
              </p>
            ) : (
              <p data-testid="active-selection-state">none</p>
            )
          }
        </EmojiPicker.ActiveItem>
        <EmojiPicker.List
          components={{
            Emoji: ({ emoji, ...props }) => (
              <button {...props} type="button">
                {emoji.emoji}
              </button>
            ),
          }}
        />
      </EmojiPicker.Viewport>
    </EmojiPicker.Root>
  );
}

function DuplicateItemPage() {
  return (
    <EmojiPicker.Root
      columns={2}
      supplemental={{
        sections: [
          {
            id: "duplicates",
            label: "Duplicates",
            position: "prepend",
            items: [
              {
                kind: "native",
                id: "🎉",
                emoji: "🎉",
                label: "Party popper",
              },
              {
                kind: "supplemental",
                id: "shipit",
                label: "Ship It",
              },
            ],
          },
          {
            id: "duplicates-again",
            label: "Duplicates again",
            position: "prepend",
            items: [
              {
                kind: "native",
                id: "🎉",
                emoji: "🎉",
                label: "Party popper",
              },
              {
                kind: "supplemental",
                id: "shipit",
                label: "Ship It",
              },
            ],
          },
        ],
      }}
    >
      <EmojiPicker.Search data-testid="duplicate-search" />
      <EmojiPicker.Viewport data-testid="duplicate-viewport" style={{ height: 1200 }}>
        <EmojiPicker.List
          components={{
            Emoji: ({ emoji, ...props }) => (
              <button
                {...props}
                data-testid={`emoji:${emoji.emoji}:${emoji.isActive ? "active" : "idle"}`}
                type="button"
              >
                {emoji.emoji}
              </button>
            ),
            SupplementalEmoji: ({ emoji, ...props }) => (
              <button
                {...props}
                data-testid={`supplemental:${emoji.id}:${emoji.isActive ? "active" : "idle"}`}
                type="button"
              >
                {emoji.label}
              </button>
            ),
          }}
        />
      </EmojiPicker.Viewport>
    </EmojiPicker.Root>
  );
}

function FrequentDuplicatePage() {
  const [usageEntries, setUsageEntries] = useState<EmojiPickerUsageEntry[]>([
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
      lastUsedAt: Date.now(),
    },
  ]);
  const frequentSection = buildEmojiPickerFrequentSection(usageEntries, {
    label: "Frequently used",
    limit: 4,
    searchable: false,
  });

  return (
    <EmojiPicker.Root
      onItemSelect={(selection) => {
        setUsageEntries((current) => recordEmojiPickerUsage(current, selection));
      }}
      supplemental={{
        sections: frequentSection ? [frequentSection] : [],
      }}
    >
      <EmojiPicker.Search />
      <EmojiPicker.Viewport style={{ height: 1200 }}>
        <EmojiPicker.List
          components={{
            Emoji: ({ emoji, ...props }) => (
              <button
                {...props}
                data-testid={`native:${emoji.label}:${emoji.isActive ? "active" : "idle"}`}
                type="button"
              >
                {emoji.emoji}
              </button>
            ),
          }}
        />
      </EmojiPicker.Viewport>
    </EmojiPicker.Root>
  );
}

describe("EmojiPicker supplemental items", () => {
  it("should render prepended supplemental sections ahead of native items", async () => {
    page.render(<SupplementalPage />);

    await expect.element(page.getByRole("gridcell").first()).toHaveTextContent(
      "🎉",
    );
  });

  it("should support mixed native and supplemental items inside one custom section", async () => {
    page.render(<SupplementalPage />);

    await expect
      .element(page.getByRole("gridcell").nth(1))
      .toHaveTextContent("Ship It");
  });

  it("should preserve native selection while exposing supplemental selections", async () => {
    page.render(<SupplementalPage />);

    await page.getByText("Ship It").click();

    await expect
      .element(page.getByTestId("native-selection"))
      .toHaveTextContent("");
    await expect
      .element(page.getByTestId("selection"))
      .toHaveTextContent("supplemental:shipit");

    await page.getByText("😀").click();

    await expect
      .element(page.getByTestId("native-selection"))
      .toHaveTextContent("😀");
    await expect
      .element(page.getByTestId("selection"))
      .toHaveTextContent("native:😀");
  });

  it("should keep ActiveEmoji native-only while ActiveItem includes supplemental items", async () => {
    page.render(<SupplementalPage withActiveEmoji />);

    await page.getByText("Ship It").hover();

    await expect
      .element(page.getByTestId("active-selection"))
      .toHaveTextContent("supplemental:Ship It");
    await expect
      .element(page.getByTestId("active-emoji"))
      .not.toBeInTheDocument();

    await page.getByTestId("viewport").click();

    await expect
      .element(page.getByTestId("active-selection"))
      .toHaveTextContent(/^native:/);
    await expect
      .element(page.getByTestId("active-emoji"))
      .toHaveTextContent(/\S+/);
  });

  it("should support unified search across native and supplemental items", async () => {
    page.render(<SupplementalPage searchMode="unified" />);

    await page.getByTestId("search").fill("grinning");

    await expect.element(page.getByText("Results")).toBeInTheDocument();
    await expect.element(page.getByText("😀")).toBeInTheDocument();
    await expect
      .element(page.getByRole("gridcell", { name: "Grinning Bot" }))
      .toBeInTheDocument();
  });

  it("should keep grouped search results separated by section and native category", async () => {
    page.render(<SupplementalPage searchMode="grouped" />);

    await page.getByTestId("search").fill("grinning");

    await expect.element(page.getByText("Results")).not.toBeInTheDocument();
    await expect.element(page.getByText("Favorites")).not.toBeInTheDocument();
    await expect.element(page.getByText("Smileys & Emotion")).toBeInTheDocument();
    await expect.element(page.getByText("Team")).toBeInTheDocument();
    await expect.element(page.getByText("😀")).toBeInTheDocument();
    await expect
      .element(page.getByRole("gridcell", { name: "Grinning Bot" }))
      .toBeInTheDocument();
  });

  it("should allow onItemSelect without supplemental configuration", async () => {
    function NativeSelectionPage() {
      const [selection, setSelection] = useState("");

      return (
        <>
          <p data-testid="selection">{selection}</p>
          <EmojiPicker.Root
            onItemSelect={(nextSelection) => {
              setSelection(
                nextSelection.kind === "native"
                  ? `native:${nextSelection.item.emoji}`
                  : `supplemental:${nextSelection.item.id}`,
              );
            }}
          >
            <EmojiPicker.Search />
            <EmojiPicker.Viewport style={{ height: 400 }}>
              <EmojiPicker.List />
            </EmojiPicker.Viewport>
          </EmojiPicker.Root>
        </>
      );
    }

    page.render(<NativeSelectionPage />);

    await page.getByText("😀").click();

    await expect
      .element(page.getByTestId("selection"))
      .toHaveTextContent("native:😀");
  });

  it("should support helper-created custom emoji sections and derived frequent sections", async () => {
    page.render(<CustomEmojiPage />);

    await expect.element(page.getByText("Custom emoji")).toBeInTheDocument();
    await expect
      .element(page.getByText("Ship It"))
      .toHaveAttribute("data-image-url", "https://example.com/shipit.png");

    await page.getByText("Ship It").click();

    await expect
      .element(page.getByText("Frequently used"))
      .toBeInTheDocument();
    await expect
      .element(page.getByRole("gridcell").first())
      .toHaveTextContent("Ship It");

    await page.getByTestId("custom-search").fill("ship it");

    await expect.element(page.getByText("Results")).toBeInTheDocument();
    await expect
      .element(page.getByRole("gridcell", { name: "Ship It" }))
      .toBeInTheDocument();
  });

  it("should render image-backed custom emoji with the default supplemental renderer", async () => {
    page.render(<DefaultCustomEmojiPage />);

    await expect
      .element(page.getByRole("img").first())
      .toHaveAttribute("src", "https://example.com/shipit.png");
    await expect
      .element(page.getByRole("gridcell", { name: "Ship It" }))
      .toBeInTheDocument();
  });

  it("should keep the hovered item active when the first frequent section is inserted above it", async () => {
    page.render(<FirstFrequentInsertionPage />);

    const thinkingFace = page.getByRole("gridcell", {
      name: "Thinking face",
      exact: true,
    });

    await thinkingFace.hover();

    await expect
      .element(page.getByTestId("active-selection-state"))
      .toHaveTextContent("native:Thinking face");

    await thinkingFace.click();

    await expect.element(page.getByText("Frequently used")).toBeInTheDocument();
    await expect
      .element(page.getByTestId("active-selection-state"))
      .toHaveTextContent("native:Thinking face");
  });

  it("should keep only one active occurrence when a native emoji is duplicated into the frequent section", async () => {
    page.render(<FrequentDuplicatePage />);

    await page.getByRole("gridcell", { name: "Zany face", exact: true }).click();

    await expect.element(page.getByText("Frequently used")).toBeInTheDocument();
    await expect
      .element(page.getByTestId("native:Zany face:active"))
      .toBeInTheDocument();
    await expect
      .element(page.getByTestId("native:Zany face:idle"))
      .toBeInTheDocument();
  });

  it("should only highlight the active occurrence when duplicate items appear in multiple sections", async () => {
    page.render(<DuplicateItemPage />);

    const firstShipIt = page.getByRole("gridcell", { name: "Ship It" }).first();
    const secondShipIt = page.getByRole("gridcell", { name: "Ship It" }).nth(1);

    await firstShipIt.hover();

    await expect
      .element(firstShipIt)
      .toHaveAttribute("data-active");
    await expect
      .element(secondShipIt)
      .not.toHaveAttribute("data-active");

    const firstPartyPopper = page
      .getByRole("gridcell", { name: "Party popper" })
      .first();
    const secondPartyPopper = page
      .getByRole("gridcell", { name: "Party popper" })
      .nth(1);

    await firstPartyPopper.hover();

    await expect
      .element(firstPartyPopper)
      .toHaveAttribute("data-active");
    await expect
      .element(secondPartyPopper)
      .not.toHaveAttribute("data-active");
  });
});
