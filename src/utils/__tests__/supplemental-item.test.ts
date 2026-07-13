import { describe, expect, it } from "vitest";
import {
  createSupplementalItem,
  createSupplementalSection,
} from "../../supplemental-item";

describe("createSupplementalItem", () => {
  it("should create a plain supplemental item without requiring an image", () => {
    expect(
      createSupplementalItem({
        id: "shipit",
        label: "Ship It",
        aliases: ["ship it"],
      }),
    ).toEqual({
      kind: "supplemental",
      id: "shipit",
      label: "Ship It",
      imageUrl: undefined,
      tags: undefined,
      keywords: undefined,
      aliases: ["ship it"],
      data: undefined,
    });
  });

  it("should normalize optional image-backed metadata too", () => {
    expect(
      createSupplementalItem({
        id: " party_parrot ",
        label: " Party parrot ",
        imageUrl: " https://example.com/party-parrot.gif ",
        tags: [" fun ", "", "fun"],
        keywords: [" mascot "],
        aliases: [" party ", "party"],
      }),
    ).toEqual({
      kind: "supplemental",
      id: "party_parrot",
      label: "Party parrot",
      imageUrl: "https://example.com/party-parrot.gif",
      tags: ["fun"],
      keywords: ["mascot"],
      aliases: ["party"],
      data: undefined,
    });
  });

  it("should require a non-empty id", () => {
    expect(() =>
      createSupplementalItem({
        id: " ",
      }),
    ).toThrow('Emoji picker supplemental item "id" must be non-empty.');
  });
});

describe("createSupplementalSection", () => {
  it("should build an appended section by default", () => {
    expect(
      createSupplementalSection(
        [
          {
            id: "shipit",
            label: "Ship It",
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
          imageUrl: undefined,
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
      createSupplementalSection(
        [
          {
            id: "shipit",
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
