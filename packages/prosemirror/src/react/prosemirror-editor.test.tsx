import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { history } from "prosemirror-history";
import { EditorState, Plugin } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";
import { afterEach, describe, expect, it, vi } from "vitest";

import { defaultSchema } from "../core/default-schema";
import { ProsemirrorEditor } from "./prosemirror-editor";
import { useEditorState, useEditorView } from "./editor-context";

afterEach(() => {
  cleanup();
});

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

  it("does not recreate the editor view when dispatchTransaction changes", () => {
    const getView = vi.fn();
    const firstDispatchTransaction = vi.fn();
    const secondDispatchTransaction = vi.fn();
    const consoleWarn = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);

    function ViewCapture({
      onView,
    }: {
      onView: (view: ReturnType<typeof useEditorView>) => void;
    }) {
      const view = useEditorView();
      const state = useEditorState();

      onView(view);

      return <span data-testid="doc-text">{state.doc.textContent || ""}</span>;
    }

    const { rerender } = render(
      <ProsemirrorEditor
        dispatchTransaction={firstDispatchTransaction}
        plugins={[history()]}
      >
        <ViewCapture onView={getView} />
      </ProsemirrorEditor>,
    );

    const firstView = getView.mock.lastCall?.[0];

    act(() => {
      firstView.dispatch(firstView.state.tr.insertText("hello"));
    });

    rerender(
      <ProsemirrorEditor
        dispatchTransaction={secondDispatchTransaction}
        plugins={[history()]}
      >
        <ViewCapture onView={getView} />
      </ProsemirrorEditor>,
    );

    const secondView = getView.mock.lastCall?.[0];

    expect(secondView).toBe(firstView);
    expect(screen.getByTestId("doc-text").textContent).toBe("hello");

    act(() => {
      secondView.dispatch(secondView.state.tr.insertText(" world"));
    });

    expect(firstDispatchTransaction).toHaveBeenCalledTimes(1);
    expect(secondDispatchTransaction).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("doc-text").textContent).toBe("hello world");

    consoleWarn.mockRestore();
  });

  it("passes custom initialState and editorProps through to the view", () => {
    const plugin = new Plugin({});

    function ViewProbe() {
      const view = useEditorView();
      const state = useEditorState();

      return (
        <div>
          <span data-testid="doc-text">{state.doc.textContent || ""}</span>
          <span data-testid="editable">{String(view.editable)}</span>
          <span data-testid="plugin-count">{String(state.plugins.length)}</span>
          <span data-testid="spellcheck">
            {view.dom.getAttribute("spellcheck") ?? ""}
          </span>
        </div>
      );
    }

    const initialState = EditorState.create({
      schema: defaultSchema,
      plugins: [plugin],
    }).apply(
      EditorState.create({
        schema: defaultSchema,
        plugins: [plugin],
      }).tr.insertText("seed"),
    );

    render(
      <ProsemirrorEditor
        editorProps={{
          attributes: { spellcheck: "false" },
          editable: () => false,
        }}
        initialState={initialState}
      >
        <ViewProbe />
      </ProsemirrorEditor>,
    );

    expect(screen.getByTestId("doc-text").textContent).toBe("seed");
    expect(screen.getByTestId("editable").textContent).toBe("false");
    expect(screen.getByTestId("plugin-count").textContent).toBe("1");
    expect(screen.getByTestId("spellcheck").textContent).toBe("false");
  });

  it("destroys the editor view on unmount", () => {
    const destroySpy = vi.fn();
    let capturedView: EditorView | null = null;

    function ViewCapture() {
      const view = useEditorView();
      capturedView = view;
      return null;
    }

    const { unmount } = render(
      <ProsemirrorEditor>
        <ViewCapture />
      </ProsemirrorEditor>,
    );

    if (!capturedView) {
      throw new Error("Expected editor view to be captured.");
    }

    const view = capturedView as EditorView;
    const originalDestroy = view.destroy.bind(view);

    view.destroy = () => {
      destroySpy();
      originalDestroy();
    };

    unmount();

    expect(destroySpy).toHaveBeenCalledTimes(1);
  });
});
