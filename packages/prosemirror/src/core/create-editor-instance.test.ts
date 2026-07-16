import { describe, expect, it, vi } from "vitest";

import { createEditorInstance } from "./create-editor-instance";

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
});
