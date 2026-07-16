import { useRef } from "react";
import type { EditorView } from "prosemirror-view";

import {
  ProsemirrorEditor,
  type ProsemirrorEditorHandle,
  useEditorState,
  useEditorView,
} from "../src";

function EditorInspector() {
  const state = useEditorState();
  const view = useEditorView();

  return (
    <section className="playground-panel">
      <h2>Inspector</h2>
      <div className="playground-actions">
        <button
          onClick={() => {
            view.dispatch(view.state.tr.insertText("Hello from the playground"));
          }}
          type="button"
        >
          Insert sample text
        </button>
        <button
          onClick={() => {
            view.focus();
          }}
          type="button"
        >
          Focus editor
        </button>
      </div>
      <dl className="playground-metadata">
        <div>
          <dt>Text content</dt>
          <dd>{state.doc.textContent || "(empty)"}</dd>
        </div>
        <div>
          <dt>Selection</dt>
          <dd>
            {state.selection.from} - {state.selection.to}
          </dd>
        </div>
        <div>
          <dt>Document JSON</dt>
          <dd>
            <pre>{JSON.stringify(state.doc.toJSON(), null, 2)}</pre>
          </dd>
        </div>
      </dl>
    </section>
  );
}

function ExternalControls({
  getView,
}: {
  getView: () => EditorView | null;
}) {
  return (
    <section className="playground-panel">
      <h2>External controls</h2>
      <div className="playground-actions">
        <button
          onClick={() => {
            const view = getView();

            if (!view) {
              return;
            }

            view.dispatch(view.state.tr.insertText("Outside the editor tree"));
          }}
          type="button"
        >
          Insert via handle
        </button>
        <button
          onClick={() => {
            getView()?.focus();
          }}
          type="button"
        >
          Focus via handle
        </button>
      </div>
      <p className="playground-note">
        This panel talks to the editor through the exported imperative handle.
      </p>
    </section>
  );
}

export function PlaygroundApp() {
  const editorRef = useRef<ProsemirrorEditorHandle | null>(null);

  return (
    <main className="playground-shell">
      <header className="playground-hero">
        <p className="playground-eyebrow">@slithy/prosemirror</p>
        <h1>Harness playground</h1>
        <p className="playground-lede">
          A small sandbox for testing the React mount layer, editor access
          hooks, and lightweight command wiring.
        </p>
      </header>

      <section className="playground-layout">
        <div className="playground-editor-column">
          <section className="playground-panel">
            <h2>Editor</h2>
            <ProsemirrorEditor
              attributes={{
                class: "playground-editor-surface",
              }}
              ref={editorRef}
            >
              <EditorInspector />
            </ProsemirrorEditor>
          </section>
        </div>

        <div className="playground-sidebar">
          <ExternalControls getView={() => editorRef.current?.getView() ?? null} />
        </div>
      </section>
    </main>
  );
}
