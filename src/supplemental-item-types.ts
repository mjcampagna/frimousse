import type {
  EmojiPickerSection,
  EmojiPickerSectionPosition,
  SupplementalEmojiPickerItem,
} from "./supplemental-types";

export type SupplementalItemInput = {
  /** Consumer-owned stable identity for the item. */
  id: string;
  /** Human-readable display label. Falls back to `id` when omitted. */
  label?: string;
  /** Optional canonical display-oriented shortcode token. */
  shortcode?: string;
  /** Optional presentation data for image-backed rendering. */
  imageUrl?: string;
  /** Broader search hints. */
  tags?: string[];
  /** Search-oriented descriptors. */
  keywords?: string[];
  /** Alternate typed forms or names. */
  aliases?: string[];
  /** Opaque consumer-owned payload carried through unchanged. */
  data?: unknown;
};

export type SupplementalSectionOptions = {
  /** Consumer-owned stable section identity. */
  id: string;
  /** Human-readable section label. */
  label?: string;
  /** Whether the section is prepended or appended around native categories. */
  position?: EmojiPickerSectionPosition;
  /** Whether the section participates in search. */
  searchable?: boolean;
};

export type SupplementalSection = EmojiPickerSection<SupplementalEmojiPickerItem>;
