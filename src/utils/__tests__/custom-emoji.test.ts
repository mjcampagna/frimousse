import { describe, expect, it } from "vitest";
import {
  createCustomEmoji,
  createCustomSection,
  isCustomEmoji,
} from "../../custom-emoji";
import type { EmojiPickerItem } from "../../supplemental-types";

describe("createCustomEmoji", () => {
  it("should create a supplemental item with a required stable id", () => {
    expect(
      createCustomEmoji({
        id: "shipit",
        label: "Ship It",
        imageUrl: "https://example.com/shipit.png",
      }),
    ).toEqual({
      kind: "supplemental",
      id: "shipit",
      label: "Ship It",
      imageUrl: "https://example.com/shipit.png",
      tags: undefined,
      keywords: undefined,
      aliases: undefined,
      data: undefined,
    });
  });

  it("should normalize text fields and lists", () => {
    expect(
      createCustomEmoji({
        id: " shipit ",
        label: " Ship It ",
        imageUrl: " https://example.com/shipit.png ",
        tags: [" approve ", "", "approve"],
        keywords: [" launch ", "launch"],
        aliases: [" ship_it ", "ship it", "ship it"],
      }),
    ).toEqual({
      kind: "supplemental",
      id: "shipit",
      label: "Ship It",
      imageUrl: "https://example.com/shipit.png",
      tags: ["approve"],
      keywords: ["launch"],
      aliases: ["ship_it", "ship it"],
      data: undefined,
    });
  });

  it("should default the label to the id when none is provided", () => {
    expect(
      createCustomEmoji({
        id: "party_parrot",
        imageUrl: "https://example.com/party-parrot.gif",
      }),
    ).toMatchObject({
      id: "party_parrot",
      label: "party_parrot",
    });
  });

  it("should require an id even when an imageUrl is present", () => {
    expect(() =>
      createCustomEmoji({
        id: " ",
        label: "Ship It",
        imageUrl: "https://example.com/shipit.png",
      }),
    ).toThrow('Emoji picker custom emoji "id" must be non-empty.');
  });

  it("should require an imageUrl", () => {
    expect(() =>
      createCustomEmoji({
        id: "shipit",
        imageUrl: " ",
      }),
    ).toThrow('Emoji picker custom emoji "imageUrl" must be non-empty.');
  });
});

describe("isCustomEmoji", () => {
  it("should distinguish image-backed supplemental items from native items", () => {
    const nativeItem: EmojiPickerItem = {
      kind: "native",
      id: "😀",
      emoji: "😀",
      label: "Grinning face",
    };
    const customItem = createCustomEmoji({
      id: "shipit",
      imageUrl: "https://example.com/shipit.png",
    });

    expect(isCustomEmoji(nativeItem)).toBe(false);
    expect(isCustomEmoji(customItem)).toBe(true);
  });
});

describe("createCustomSection", () => {
  it("should build an appended custom section by default", () => {
    expect(
      createCustomSection(
        [
          {
            id: "shipit",
            label: "Ship It",
            imageUrl: "https://example.com/shipit.png",
          },
        ],
        {
          id: "workspace",
          label: "Workspace",
        },
      ),
    ).toEqual({
      id: "workspace",
      label: "Workspace",
      position: "append",
      searchable: undefined,
      items: [
        {
          kind: "supplemental",
          id: "shipit",
          label: "Ship It",
          imageUrl: "https://example.com/shipit.png",
          tags: undefined,
          keywords: undefined,
          aliases: undefined,
          data: undefined,
        },
      ],
    });
  });

  it("should honor section overrides", () => {
    expect(
      createCustomSection(
        [
          {
            id: "shipit",
            imageUrl: "https://example.com/shipit.png",
          },
        ],
        {
          id: "favorites",
          position: "prepend",
          searchable: false,
        },
      ),
    ).toMatchObject({
      id: "favorites",
      position: "prepend",
      searchable: false,
    });
  });
});
