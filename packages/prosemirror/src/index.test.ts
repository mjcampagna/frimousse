import { describe, expect, it } from "vitest";
import {
  ProsemirrorEditor,
  createEditorInstance,
  defaultSchema,
  useEditorCursorPosition,
  useEditorState,
  useEditorView,
} from "./index";

describe("@slithy/prosemirror", () => {
  it("exports the first harness primitives", () => {
    expect(createEditorInstance).toBeTypeOf("function");
    expect(ProsemirrorEditor).toBeDefined();
    expect(useEditorCursorPosition).toBeTypeOf("function");
    expect(useEditorState).toBeTypeOf("function");
    expect(useEditorView).toBeTypeOf("function");
    expect(defaultSchema.nodes.doc).toBeDefined();
  });
});
