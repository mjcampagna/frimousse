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
        onSelectionChange={(nextSelection) => {
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
          <EmojiPicker.ActiveSelection>
            {({ selection }) =>
              selection ? (
                <p data-testid="active-selection">
                  {selection.kind}:{selection.item.label}
                </p>
              ) : null
            }
          </EmojiPicker.ActiveSelection>
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
      onSelectionChange={(selection) => {
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

  it("should keep ActiveEmoji native-only while ActiveSelection includes supplemental items", async () => {
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
      .toHaveTextContent("native:Party popper");
    await expect
      .element(page.getByTestId("active-emoji"))
      .toHaveTextContent("Party popper");
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

  it("should allow onSelectionChange without supplemental configuration", async () => {
    function NativeSelectionPage() {
      const [selection, setSelection] = useState("");

      return (
        <>
          <p data-testid="selection">{selection}</p>
          <EmojiPicker.Root
            onSelectionChange={(nextSelection) => {
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
});
