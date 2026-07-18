import { useEffect, useState } from "react";
import { Popover } from "@base-ui-components/react/popover";
import { EmojiPicker, type ItemSelection } from "@slithy/frimousse";
import { PickerLoadingSkeleton } from "../demo/PickerLoadingSkeleton";

function useResponsiveColumns(small = 7, medium = 8, large = 8) {
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

export function PopoverDemo() {
  const columns = useResponsiveColumns();
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState<ItemSelection | null>(null);

  return (
    <div className="docs-demo-card">
      <div className="popover-demo-shell">
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger className="popover-demo-trigger">
            Add reaction
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner align="start" sideOffset={10}>
              <Popover.Popup className="popover-demo-popup">
                <EmojiPicker.Root
                  className="base-picker popover-picker"
                  columns={columns}
                  onItemSelect={(nextSelection) => {
                    setSelection(nextSelection);
                    setOpen(false);
                  }}
                  sticky
                >
                  <div className="base-picker-toolbar">
                    <EmojiPicker.Search
                      className="base-picker-search"
                      placeholder="Search emoji"
                    />
                    <EmojiPicker.SkinToneSelector />
                  </div>
                  <EmojiPicker.Viewport
                    className="base-picker-viewport"
                    tabIndex={0}
                  >
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
                          <button
                            className="base-picker-emoji"
                            {...props}
                            type="button"
                          >
                            {emoji.emoji}
                          </button>
                        ),
                      }}
                    />
                  </EmojiPicker.Viewport>
                </EmojiPicker.Root>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
        {selection && (
          <div className="popover-demo-selection">
            {selection.kind === "native" ? selection.item.emoji : selection.item.label}
          </div>
        )}
      </div>
    </div>
  );
}

export default PopoverDemo;
