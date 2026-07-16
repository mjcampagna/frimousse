import { createContext, useContext } from "react";
import { useSyncExternalStore } from "react";
import type { EditorState } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";

import type { EditorInstance } from "../core/create-editor-instance";

export const EditorContext = createContext<EditorInstance | null>(null);

export function useEditorInstance(): EditorInstance {
  const instance = useContext(EditorContext);

  if (!instance) {
    throw new Error(
      "No editor instance found. Wrap this hook in a ProsemirrorEditor.",
    );
  }

  return instance;
}

export function useEditorView(): EditorView {
  return useEditorInstance().view;
}

export function useEditorState(): EditorState {
  const instance = useEditorInstance();

  return useSyncExternalStore(
    instance.subscribe,
    instance.getState,
    instance.getState,
  );
}
