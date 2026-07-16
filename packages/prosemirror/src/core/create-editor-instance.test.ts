import { EditorState, Plugin } from "prosemirror-state";
import { describe, expect, it, vi } from "vitest";

import { createEditorInstance } from "./create-editor-instance";
import { defaultSchema } from "./default-schema";

describe("createEditorInstance", () => {
  it("creates an editor view with the default schema", () => {
    const mount = document.createElement("div");

    const instance = createEditorInstance({ mount });

    expect(instance.view).toBeDefined();
    expect(instance.getState().schema.nodes.doc).toBeDefined();

    instance.destroy();
  });

  it("notifies subscribers after transactions", () => {
    const mount = document.createElement("div");
    const listener = vi.fn();

    const instance = createEditorInstance({ mount });
    const unsubscribe = instance.subscribe(listener);

    instance.dispatchTransaction(
      instance.view.state.tr.insertText("Hello ProseMirror"),
    );

    expect(listener).toHaveBeenCalledTimes(1);
    expect(instance.getState().doc.textContent).toBe("Hello ProseMirror");

    unsubscribe();
    instance.destroy();
  });

  it("stops notifying unsubscribed listeners and respects initialState", () => {
    const mount = document.createElement("div");
    const listener = vi.fn();
    const plugin = new Plugin({});
    const initialState = EditorState.create({
      schema: defaultSchema,
      plugins: [plugin],
    }).apply(
      EditorState.create({
        schema: defaultSchema,
        plugins: [plugin],
      }).tr.insertText("seed"),
    );

    const instance = createEditorInstance({
      mount,
      editorProps: {
        editable: () => false,
      },
      initialState,
      schema: defaultSchema,
    });

    const unsubscribe = instance.subscribe(listener);

    expect(instance.getState().doc.textContent).toBe("seed");
    expect(instance.getState().plugins).toHaveLength(1);
    expect(instance.view.editable).toBe(false);

    unsubscribe();
    instance.dispatchTransaction(instance.view.state.tr.insertText(" ignored"));

    expect(listener).not.toHaveBeenCalled();

    instance.destroy();
  });

  it("tracks cursor position and snapshots it independently", () => {
    const mount = document.createElement("div");
    const instance = createEditorInstance({ mount });
    const coordsAtPos = vi
      .spyOn(instance.view, "coordsAtPos")
      .mockReturnValue({ bottom: 40, left: 10, right: 10, top: 20 });

    const initialCursorPosition = instance.getCursorPosition();
    const snapshot = instance.createCursorSnapshot();

    instance.dispatchTransaction(
      instance.view.state.tr.insertText("cursor tracking"),
    );

    const nextCursorPosition = instance.getCursorPosition();

    expect(initialCursorPosition.head).toBe(snapshot.head);
    expect(snapshot.coords).toEqual({
      bottom: 40,
      left: 10,
      right: 10,
      top: 20,
    });
    expect(nextCursorPosition.head).not.toBe(snapshot.head);

    coordsAtPos.mockRestore();
    instance.destroy();
  });
});
