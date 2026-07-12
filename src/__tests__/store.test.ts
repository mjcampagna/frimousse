import { describe, expect, it, vi } from "vitest";
import { createEmojiPickerStore } from "../store";

describe("createEmojiPickerStore", () => {
  it("should invoke both callbacks for native selections", () => {
    const onEmojiSelect = vi.fn();
    const onSelectionChange = vi.fn();
    const store = createEmojiPickerStore(
      onEmojiSelect,
      onSelectionChange,
      "en",
      9,
      true,
      "none",
    );

    store.get().selectItem({
      kind: "native",
      id: "😀",
      emoji: "😀",
      label: "Grinning face",
    });

    expect(onEmojiSelect).toHaveBeenCalledWith({
      emoji: "😀",
      label: "Grinning face",
    });
    expect(onSelectionChange).toHaveBeenCalledWith({
      kind: "native",
      item: {
        kind: "native",
        id: "😀",
        emoji: "😀",
        label: "Grinning face",
      },
    });
  });

  it("should only invoke the widened callback for supplemental selections", () => {
    const onEmojiSelect = vi.fn();
    const onSelectionChange = vi.fn();
    const store = createEmojiPickerStore(
      onEmojiSelect,
      onSelectionChange,
      "en",
      9,
      true,
      "none",
    );

    store.get().selectItem({
      kind: "supplemental",
      id: "shipit",
      label: "Ship It",
      aliases: ["ship it"],
    });

    expect(onEmojiSelect).not.toHaveBeenCalled();
    expect(onSelectionChange).toHaveBeenCalledWith({
      kind: "supplemental",
      item: {
        kind: "supplemental",
        id: "shipit",
        label: "Ship It",
        aliases: ["ship it"],
      },
    });
  });
});
