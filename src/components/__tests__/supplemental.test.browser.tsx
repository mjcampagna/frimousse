import { page } from "vitest/browser";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import * as EmojiPicker from "../emoji-picker";

const supplemental = {
  sections: [
    {
      id: "favorites",
      label: "Favorites",
      position: "prepend" as const,
      searchable: false,
      items: [
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
}: {
  searchMode?: "grouped" | "unified";
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

describe("EmojiPicker supplemental items", () => {
  it("should render prepended supplemental sections ahead of native items", async () => {
    page.render(<SupplementalPage />);

    await expect.element(page.getByRole("gridcell").first()).toHaveTextContent(
      "Ship It",
    );
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

  it("should support unified search across native and supplemental items", async () => {
    page.render(<SupplementalPage searchMode="unified" />);

    await page.getByTestId("search").fill("grinning");

    await expect.element(page.getByText("Results")).toBeInTheDocument();
    await expect.element(page.getByText("😀")).toBeInTheDocument();
    await expect
      .element(page.getByRole("gridcell", { name: "Grinning Bot" }))
      .toBeInTheDocument();
  });
});
