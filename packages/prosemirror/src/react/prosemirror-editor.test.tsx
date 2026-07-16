import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProsemirrorEditor } from "./prosemirror-editor";
import { useEditorState, useEditorView } from "./editor-context";

function EditorObserver() {
  const state = useEditorState();
  const view = useEditorView();

  return (
    <div>
      <span data-testid="doc-text">{state.doc.textContent || ""}</span>
      <button
        onClick={() => {
          view.dispatch(view.state.tr.insertText("Updated"));
        }}
        type="button"
      >
        Update
      </button>
    </div>
  );
}

describe("ProsemirrorEditor", () => {
  it("provides editor hooks to descendant React components", async () => {
    render(
      <ProsemirrorEditor>
        <EditorObserver />
      </ProsemirrorEditor>,
    );

    expect(screen.getByTestId("doc-text").textContent).toBe("");

    fireEvent.click(screen.getByRole("button", { name: "Update" }));

    expect(screen.getByTestId("doc-text").textContent).toBe("Updated");
  });
});
