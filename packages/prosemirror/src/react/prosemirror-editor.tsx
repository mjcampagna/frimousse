import {
  type CSSProperties,
  type PropsWithChildren,
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { EditorState, Plugin, Transaction } from "prosemirror-state";
import type { EditorView, DirectEditorProps } from "prosemirror-view";
import type { Schema } from "prosemirror-model";

import {
  createEditorInstance,
  type EditorInstance,
} from "../core/create-editor-instance";
import { EditorContext } from "./editor-context";

export type ProsemirrorEditorProps = PropsWithChildren<{
  attributes?: DirectEditorProps["attributes"];
  className?: string;
  dispatchTransaction?: (args: {
    transaction: Transaction;
    view: EditorView;
    state: EditorState;
  }) => void;
  plugins?: readonly Plugin[];
  schema?: Schema;
  state?: EditorState;
  style?: CSSProperties;
}>;

export type ProsemirrorEditorHandle = {
  getInstance: () => EditorInstance | null;
  getView: () => EditorView | null;
};

export const ProsemirrorEditor = forwardRef<
  ProsemirrorEditorHandle,
  ProsemirrorEditorProps
>(function ProsemirrorEditor(
  {
    attributes,
    children,
    className,
    dispatchTransaction,
    plugins,
    schema,
    state,
    style,
  },
  ref,
) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [instance, setInstance] = useState<EditorInstance | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      getInstance: () => instance,
      getView: () => instance?.view ?? null,
    }),
    [instance],
  );

  useLayoutEffect(() => {
    const mount = mountRef.current;

    if (!mount) {
      return;
    }

    const nextInstance = createEditorInstance({
      mount,
      attributes,
      dispatchTransaction,
      plugins,
      schema,
      state,
    });

    setInstance(nextInstance);

    return () => {
      setInstance((currentInstance) =>
        currentInstance === nextInstance ? null : currentInstance,
      );
      nextInstance.destroy();
    };
  }, [attributes, dispatchTransaction, plugins, schema, state]);

  return (
    <EditorContext.Provider value={instance}>
      <div className={className} ref={mountRef} style={style} />
      {instance ? children : null}
    </EditorContext.Provider>
  );
});
