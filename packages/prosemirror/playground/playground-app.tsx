import { useRef, useState } from "react";
import type { EditorView } from "prosemirror-view";

import {
  ProsemirrorEditor,
  type EditorCursorSnapshot,
  type ProsemirrorEditorHandle,
  useEditorCursorPosition,
  useEditorInstance,
  useEditorState,
  useEditorView,
} from "../src";

function EditorInspector() {
  const cursorPosition = useEditorCursorPosition();
  const instance = useEditorInstance();
  const state = useEditorState();
  const view = useEditorView();
  const [cursorSnapshot, setCursorSnapshot] =
    useState<EditorCursorSnapshot | null>(null);

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
        <button
          onClick={() => {
            setCursorSnapshot(instance.createCursorSnapshot());
          }}
          type="button"
        >
          Snapshot cursor
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
          <dt>Live cursor</dt>
          <dd>
            head {cursorPosition.head}, anchor {cursorPosition.anchor}
            {cursorPosition.coords
              ? ` at ${Math.round(cursorPosition.coords.left)}, ${Math.round(cursorPosition.coords.top)}`
              : " (coords unavailable)"}
          </dd>
        </div>
        <div>
          <dt>Frozen snapshot</dt>
          <dd>
            {cursorSnapshot
              ? `head ${cursorSnapshot.head}, anchor ${cursorSnapshot.anchor}${
                  cursorSnapshot.coords
                    ? ` at ${Math.round(cursorSnapshot.coords.left)}, ${Math.round(cursorSnapshot.coords.top)}`
                    : " (coords unavailable)"
                }`
              : "No snapshot captured yet."}
          </dd>
        </div>
        <div>
          <dt>Document JSON</dt>
          <dd>
            <pre>{JSON.stringify(state.doc.toJSON(), null, 2)}</pre>
          </dd>
        </div>
      </dl>
      <p className="playground-note">
        Capture a snapshot, keep typing, and compare the frozen anchor to the
        live cursor position.
      </p>
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
