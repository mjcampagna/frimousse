import { useEffect, useState } from "react";
import { EmojiPicker, type EmojiPickerItemSelection } from "@slithy/frimousse";
import { PickerLoadingSkeleton } from "../demo/PickerLoadingSkeleton";
import { SelectionBurstLayer } from "../demo/SelectionBurstLayer";

const initialSelection: EmojiPickerItemSelection = {
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
    useState<EmojiPickerItemSelection>(initialSelection);

  return (
    <div className="docs-demo-card">
      <div className="docs-picker-wrap">
        <SelectionBurstLayer selection={selection} />
        <EmojiPicker.Root
          columns={columns}
          onSelectionChange={setSelection}
          sticky
        >
          <div className="picker-toolbar">
            <EmojiPicker.Search placeholder="Search emoji" />
            <EmojiPicker.SkinToneSelector />
          </div>
          <EmojiPicker.Viewport tabIndex={0}>
            <EmojiPicker.Loading>
              <PickerLoadingSkeleton columns={columns} />
            </EmojiPicker.Loading>
            <EmojiPicker.Empty>No emoji found.</EmojiPicker.Empty>
            <EmojiPicker.List />
          </EmojiPicker.Viewport>
        </EmojiPicker.Root>
      </div>
    </div>
  );
}

export default BaseApiDemo;
