export {
  createEditorInstance,
  type CreateEditorInstanceOptions,
  type EditorInstance,
  type EditorStateListener,
} from "./core/create-editor-instance";
export { defaultSchema } from "./core/default-schema";
export {
  EditorContext,
  useEditorInstance,
  useEditorState,
  useEditorView,
} from "./react/editor-context";
export {
  ProsemirrorEditor,
  type ProsemirrorEditorHandle,
  type ProsemirrorEditorProps,
} from "./react/prosemirror-editor";
