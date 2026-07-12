import { useEffect, useState } from "react";
import { EmojiPicker, type ItemSelection } from "@slithy/frimousse";
import { PickerLoadingSkeleton } from "../demo/PickerLoadingSkeleton";
import { SelectionBurstLayer } from "../demo/SelectionBurstLayer";

const initialSelection: ItemSelection = {
  kind: "native",
  item: {
    kind: "native",
    id: "🙂",
    emoji: "🙂",
    label: "Slightly smiling face",
  },
};

function useResponsiveColumns(small = 7, medium = 8, large = 9) {
  const [columns, setColumns] = useState(large);

  useEffect(() => {
    const updateColumns = () => {
      if (window.matchMedia("(max-width: 359px)").matches) {
        setColumns(small);
        return;
      }

      if (window.matchMedia("(max-width: 429px)").matches) {
        setColumns(medium);
        return;
      }

      setColumns(large);
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);

    return () => {
      window.removeEventListener("resize", updateColumns);
    };
  }, [large, medium, small]);

  return columns;
}

export function BaseApiDemo() {
  const columns = useResponsiveColumns(7, 8, 9);
  const [selection, setSelection] =
    useState<ItemSelection>(initialSelection);

  return (
    <div className="docs-demo-card">
      <div className="docs-picker-wrap">
        <SelectionBurstLayer selection={selection} />
        <EmojiPicker.Root
          className="base-picker"
          columns={columns}
          onItemSelect={setSelection}
          sticky
        >
          <div className="base-picker-toolbar">
            <EmojiPicker.Search
              className="base-picker-search"
              placeholder="Search emoji"
            />
            <EmojiPicker.SkinToneSelector />
          </div>
          <EmojiPicker.Viewport className="base-picker-viewport" tabIndex={0}>
            <EmojiPicker.Loading className="base-picker-loading">
              <PickerLoadingSkeleton columns={columns} />
            </EmojiPicker.Loading>
            <EmojiPicker.Empty className="base-picker-empty">
              No emoji found.
            </EmojiPicker.Empty>
            <EmojiPicker.List
              className="base-picker-list"
              components={{
                CategoryHeader: ({ category, ...props }) => (
                  <div className="base-picker-category-header" {...props}>
                    {category.label}
                  </div>
                ),
                Row: ({ children, ...props }) => (
                  <div className="base-picker-row" {...props}>
                    {children}
                  </div>
                ),
                Emoji: ({ emoji, ...props }) => (
                  <button className="base-picker-emoji" {...props} type="button">
                    {emoji.emoji}
                  </button>
                ),
              }}
            />
          </EmojiPicker.Viewport>
        </EmojiPicker.Root>
      </div>
    </div>
  );
}

export default BaseApiDemo;
