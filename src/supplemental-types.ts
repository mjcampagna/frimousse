export type EmojiPickerSectionPosition = "prepend" | "append";

export type NativeEmojiPickerItem = {
  /** Discriminates native Unicode emoji items from supplemental items. */
  kind: "native";
  /** Stable item identity for the rendered native emoji value. */
  id: string;
  /** The rendered native emoji glyph. */
  emoji: string;
  /** Human-readable label from the native dataset. */
  label: string;
};

export type SupplementalEmojiPickerItem = {
  /** Discriminates supplemental items from native Unicode emoji items. */
  kind: "supplemental";
  /** Consumer-owned stable identity for the item. */
  id: string;
  /** Human-readable display label. */
  label: string;
  /** Optional canonical display-oriented shortcode token such as `:party_parrot:`. */
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

export type EmojiPickerItem = NativeEmojiPickerItem | SupplementalEmojiPickerItem;

export type EmojiPickerSection<TItem extends EmojiPickerItem = EmojiPickerItem> = {
  id: string;
  label?: string;
  position?: EmojiPickerSectionPosition;
  items: TItem[];
  searchable?: boolean;
};

export type EmojiPickerSupplementalSearchWeights = {
  /** Relative weight for supplemental `label` matches. */
  label?: number;
  /** Relative weight for supplemental `aliases` matches. */
  aliases?: number;
  /** Relative weight for supplemental `keywords` matches. */
  keywords?: number;
  /** Relative weight for supplemental `tags` matches. */
  tags?: number;
  /** Relative weight for supplemental `id` matches. */
  id?: number;
};

export type EmojiPickerSupplementalSearch = {
  /** Whether supplemental results remain grouped or merge into a unified results list. */
  mode?: "grouped" | "unified";
  /** Label used for unified results only. */
  resultsLabel?: string;
  /** Optional ranking overrides for supplemental items only. */
  weights?: EmojiPickerSupplementalSearchWeights;
};

export type EmojiPickerSupplementalConfig = {
  /** Consumer-provided additional sections. */
  sections?: EmojiPickerSection[];
  /** Additive supplemental search configuration. */
  search?: EmojiPickerSupplementalSearch;
};

export type NativeItemSelection = {
  /** Discriminates native selections from supplemental selections. */
  kind: "native";
  /** The selected native item. */
  item: NativeEmojiPickerItem;
};

export type SupplementalItemSelection = {
  /** Discriminates supplemental selections from native selections. */
  kind: "supplemental";
  /** The selected supplemental item. */
  item: SupplementalEmojiPickerItem;
};

export type ItemSelection =
  | NativeItemSelection
  | SupplementalItemSelection;
