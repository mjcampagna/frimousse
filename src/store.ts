import type { RefObject } from "react";
import type {
  EmojiPickerData,
  EmojiPickerDataRow,
  ItemSelection,
  EmojiPickerRootProps,
  Locale,
  SkinTone,
} from "./types";
import type { EmojiPickerItem } from "./supplemental-types";
import { createStore, createStoreContext } from "./utils/store";
import {
  isNativeEmojiPickerItem,
  sameEmojiPickerItem,
} from "./utils/emoji-item";

const VIEWPORT_OVERSCAN = 2;

function findItemPosition(
  data: EmojiPickerData,
  item: EmojiPickerItem | undefined,
) {
  if (!item) {
    return undefined;
  }

  for (const [activeRowIndex, row] of data.rows.entries()) {
    for (const [activeColumnIndex, candidate] of row.emojis.entries()) {
      if (sameEmojiPickerItem(candidate, item)) {
        return {
          activeColumnIndex,
          activeRowIndex,
        };
      }
    }
  }

  return undefined;
}

type Interaction = "keyboard" | "pointer" | "none";

export type EmojiPickerStore = {
  locale: Locale;
  columns: number;
  sticky: boolean;
  skinTone: SkinTone;
  onEmojiSelect: NonNullable<EmojiPickerRootProps["onEmojiSelect"]>;
  onItemSelect: NonNullable<EmojiPickerRootProps["onItemSelect"]>;
  onSearchValueChange: NonNullable<EmojiPickerRootProps["onSearchValueChange"]>;

  data: EmojiPickerData | null | undefined;
  search: string;
  interaction: Interaction;
  activeColumnIndex: number;
  activeRowIndex: number;
  suppressPointerEnter: boolean;

  rowHeight: number | null;
  categoryHeaderHeight: number | null;
  viewportWidth: number | null;
  viewportHeight: number | null;

  viewportStartCategoryIndex: number;
  viewportStartRowIndex: number;
  viewportEndRowIndex: number;

  rootRef: RefObject<HTMLDivElement> | null;
  searchRef: RefObject<HTMLInputElement> | null;
  viewportRef: RefObject<HTMLDivElement> | null;
  listRef: RefObject<HTMLDivElement> | null;

  updateViewportState: (changes?: Partial<EmojiPickerStore>) => void;
  selectItem: (item: EmojiPickerItem) => void;

  onDataChange: (data: EmojiPickerData) => void;
  onSearchChange: (search: string, notify?: boolean) => void;
  onActiveEmojiChange: (
    interaction: Exclude<Interaction, "none">,
    activeColumnIndex: number,
    activeRowIndex: number,
  ) => void;
  onActiveEmojiReset: () => void;
  onRowHeightChange: (rowHeight: number) => void;
  onCategoryHeaderHeightChange: (categoryHeaderHeight: number) => void;
  onViewportSizeChange: (viewportWidth: number, viewportHeight: number) => void;
  onViewportScroll: (scrollY: number) => void;
};

export function createEmojiPickerStore(
  onEmojiSelect: NonNullable<EmojiPickerRootProps["onEmojiSelect"]>,
  onItemSelect: NonNullable<EmojiPickerRootProps["onItemSelect"]>,
  onSearchValueChange: NonNullable<EmojiPickerRootProps["onSearchValueChange"]>,
  initialLocale: Locale,
  initialColumns: number,
  initialSticky: boolean,
  initialSkinTone: SkinTone,
) {
  let viewportScrollY = 0;

  return createStore<EmojiPickerStore>((set, get) => ({
    locale: initialLocale,
    columns: initialColumns,
    sticky: initialSticky,
    skinTone: initialSkinTone,
    onEmojiSelect,
    onItemSelect,
    onSearchValueChange,

    data: null,
    search: "",
    interaction: "none",
    activeColumnIndex: 0,
    activeRowIndex: 0,
    suppressPointerEnter: false,

    rowHeight: null,
    categoryHeaderHeight: null,
    viewportWidth: null,
    viewportHeight: null,

    viewportStartCategoryIndex: 0,
    viewportStartRowIndex: 0,
    viewportEndRowIndex: 0,

    rootRef: null,
    searchRef: null,
    viewportRef: null,
    listRef: null,

    selectItem: (item: EmojiPickerItem) => {
      if (isNativeEmojiPickerItem(item)) {
        get().onEmojiSelect({
          emoji: item.emoji,
          label: item.label,
        });
      }

      const selection: ItemSelection = isNativeEmojiPickerItem(item)
        ? { kind: "native", item }
        : { kind: "supplemental", item };

      get().onItemSelect(selection);
    },

    updateViewportState: (partial?: Partial<EmojiPickerStore>) => {
      const state = get();

      const data = partial?.data ?? state.data;
      const categoryHeaderHeight =
        partial?.categoryHeaderHeight ?? state.categoryHeaderHeight;
      const rowHeight = partial?.rowHeight ?? state.rowHeight;
      const viewportHeight = partial?.viewportHeight ?? state.viewportHeight;

      if (
        !data ||
        data.rows.length === 0 ||
        !categoryHeaderHeight ||
        !rowHeight ||
        !viewportHeight
      ) {
        return set({
          ...partial,
          viewportStartCategoryIndex: 0,
          viewportStartRowIndex: 0,
          viewportEndRowIndex: 0,
        });
      }

      let previousCategoryHeadersHeight = 0;
      let categoryIndex = 0;

      for (const category of data.categories) {
        const categoryY =
          categoryIndex++ * categoryHeaderHeight +
          category.startRowIndex * rowHeight;

        if (categoryY < viewportScrollY) {
          previousCategoryHeadersHeight += categoryHeaderHeight;
        } else {
          break;
        }
      }

      const totalHeight =
        data.categories.length * categoryHeaderHeight +
        data.rows.length * rowHeight;

      const overscanStart = Math.floor((VIEWPORT_OVERSCAN * rowHeight) / 2);
      const overscanEnd = Math.ceil((VIEWPORT_OVERSCAN * rowHeight) / 2);

      // Adjust the scroll position to account for previous category headers
      const viewportStartY = Math.min(
        viewportScrollY - previousCategoryHeadersHeight - overscanStart,
        totalHeight - viewportHeight,
      );

      const viewportEndY = viewportStartY + viewportHeight + overscanEnd;

      const viewportStartRowIndex = Math.max(
        0,
        Math.floor(viewportStartY / rowHeight),
      );
      const viewportEndRowIndex = Math.min(
        data.rows.length - 1,
        Math.ceil(viewportEndY / rowHeight),
      );
      const viewportStartCategoryIndex =
        data.rows[viewportStartRowIndex]?.categoryIndex;

      if (viewportStartCategoryIndex === undefined && partial) {
        return set(partial);
      }

      return set({
        ...partial,
        viewportStartCategoryIndex,
        viewportStartRowIndex,
        viewportEndRowIndex,
      });
    },

    onDataChange: (data: EmojiPickerData) => {
      const previousState = get();
      const previousActiveItem =
        previousState.data?.rows[previousState.activeRowIndex]?.emojis[
          previousState.activeColumnIndex
        ];
      const nextItemAtSameCoordinates =
        data.rows[previousState.activeRowIndex]?.emojis[
          previousState.activeColumnIndex
        ];
      const nextActivePosition =
        sameEmojiPickerItem(previousActiveItem, nextItemAtSameCoordinates)
          ? {
              activeColumnIndex: previousState.activeColumnIndex,
              activeRowIndex: previousState.activeRowIndex,
            }
          : findItemPosition(data, previousActiveItem);

      get().updateViewportState({
        data,
        activeColumnIndex: nextActivePosition?.activeColumnIndex ?? 0,
        activeRowIndex: nextActivePosition?.activeRowIndex ?? 0,
        suppressPointerEnter:
          previousState.interaction === "pointer" &&
          !!nextActivePosition &&
          (nextActivePosition.activeColumnIndex !==
            previousState.activeColumnIndex ||
            nextActivePosition.activeRowIndex !== previousState.activeRowIndex),
      });
    },
    onSearchChange: (search: string, notify = true) => {
      set({
        search,
        interaction: search ? "keyboard" : "none",
        activeColumnIndex: search ? 0 : get().activeColumnIndex,
        activeRowIndex: search ? 0 : get().activeRowIndex,
        suppressPointerEnter: false,
      });

      if (notify) {
        get().onSearchValueChange(search);
      }
    },
    onActiveEmojiChange: (
      interaction: Exclude<Interaction, "none">,
      activeColumnIndex: number,
      activeRowIndex: number,
    ) => {
      set({
        interaction,
        activeColumnIndex,
        activeRowIndex,
        suppressPointerEnter: false,
      });

      if (interaction !== "keyboard") {
        return;
      }

      const {
        listRef,
        viewportRef,
        sticky,
        rowHeight,
        viewportHeight,
        categoryHeaderHeight,
      } = get();

      const list = listRef?.current;
      const viewport = viewportRef?.current;

      if (
        !list ||
        !viewport ||
        !rowHeight ||
        !categoryHeaderHeight ||
        !viewportHeight
      ) {
        return;
      }

      const rowIndex = activeRowIndex;

      if (rowIndex === 0) {
        viewport.scrollTo({
          top: 0,
          behavior: "instant",
        });
      }

      const row = list.querySelector(`[aria-rowindex="${rowIndex}"]`);

      if (!(row instanceof HTMLElement)) {
        return;
      }

      const rowY = row.offsetTop;
      const rowComputedStyle = getComputedStyle(row);
      const rowScrollMarginTop = Number.parseFloat(
        rowComputedStyle.scrollMarginTop,
      );
      const rowScrollMarginBottom = Number.parseFloat(
        rowComputedStyle.scrollMarginBottom,
      );

      let viewportStartY = viewportScrollY + rowScrollMarginTop;

      // Account for headers if they are sticky and if the row is in the upper half of the viewport
      if (sticky && rowY < viewportScrollY + viewportHeight / 2) {
        viewportStartY += categoryHeaderHeight;
      }

      const viewportEndY =
        viewportStartY + viewportHeight - rowScrollMarginBottom;

      if (rowY < viewportStartY || rowY + rowHeight > viewportEndY) {
        viewport.scrollTo({
          // Align to the viewport's top or bottom based on the row's position
          top: Math.max(
            rowY < viewportStartY + categoryHeaderHeight
              ? rowY -
                  Math.max(
                    sticky ? categoryHeaderHeight : 0,
                    rowScrollMarginTop,
                  )
              : rowY - viewportHeight + rowHeight + rowScrollMarginBottom,
            0,
          ),
          behavior: "instant",
        });
      }
    },
    onActiveEmojiReset: () => {
      set({
        interaction: "none",
        suppressPointerEnter: false,
      });
    },
    onRowHeightChange: (rowHeight: number) => {
      get().updateViewportState({ rowHeight });
    },
    onCategoryHeaderHeightChange: (categoryHeaderHeight: number) => {
      get().updateViewportState({ categoryHeaderHeight });
    },
    onViewportSizeChange: (viewportWidth: number, viewportHeight: number) => {
      get().updateViewportState({ viewportWidth, viewportHeight });
    },
    onViewportScroll: (scrollY: number) => {
      viewportScrollY = scrollY;

      get().updateViewportState();
    },
  }));
}

export const {
  useStore: useEmojiPickerStore,
  Provider: EmojiPickerStoreProvider,
} = createStoreContext<EmojiPickerStore>("EmojiPicker.Root is missing.");

export function $search(state: EmojiPickerStore) {
  return state.search;
}

export function $activeEmoji(
  state: EmojiPickerStore,
): EmojiPickerItem | undefined {
  if (state.interaction === "none") {
    return undefined;
  }

  const activeEmoji =
    state.data?.rows[state.activeRowIndex]?.emojis[state.activeColumnIndex];

  return activeEmoji;
}

export function $isEmpty(state: EmojiPickerStore) {
  return (
    state.data === undefined ||
    (typeof state.data?.count === "number" && state.data.count === 0)
  );
}

export function $isLoading(state: EmojiPickerStore) {
  return (
    state.data === null ||
    state.viewportHeight === null ||
    state.rowHeight === null ||
    state.categoryHeaderHeight === null
  );
}

export function $rowsCount(state: EmojiPickerStore) {
  return state.data?.rows.length;
}

export function $categoriesCount(state: EmojiPickerStore) {
  return state.data?.categories.length;
}

export function $categoriesRowsStartIndices(state: EmojiPickerStore) {
  return state.data?.categoriesStartRowIndices;
}

export function $skinTones(state: EmojiPickerStore) {
  return state.data?.skinTones;
}

export function sameEmojiPickerEmoji(
  a: EmojiPickerItem | undefined,
  b: EmojiPickerItem | undefined,
) {
  return sameEmojiPickerItem(a, b);
}

export function sameEmojiPickerRow(
  a: EmojiPickerDataRow | undefined,
  b: EmojiPickerDataRow | undefined,
) {
  if (a?.categoryIndex !== b?.categoryIndex) {
    return false;
  }

  if (a?.emojis.length !== b?.emojis.length) {
    return false;
  }

  return Boolean(
    a?.emojis.every((emoji, index) =>
      sameEmojiPickerEmoji(emoji, b?.emojis[index]),
    ),
  );
}
