import {
  type CSSProperties,
  type PropsWithChildren,
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useEffect,
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
  editorProps?: Omit<DirectEditorProps, "dispatchTransaction" | "state">;
  initialState?: EditorState;
  plugins?: readonly Plugin[];
  schema?: Schema;
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
    editorProps,
    initialState,
    plugins,
    schema,
    style,
  },
  ref,
) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const dispatchTransactionRef = useRef(dispatchTransaction);
  const initialStateRef = useRef(initialState);
  const pluginsRef = useRef(plugins);
  const schemaRef = useRef(schema);
  const [instance, setInstance] = useState<EditorInstance | null>(null);

  dispatchTransactionRef.current = dispatchTransaction;

  useEffect(() => {
    if (initialStateRef.current !== initialState && initialState !== undefined) {
      console.warn(
        "ProsemirrorEditor ignores `initialState` changes after mount. Recreate the component to replace the editor state.",
      );
    }
  }, [initialState]);

  useEffect(() => {
    if (pluginsRef.current !== plugins && plugins !== undefined) {
      console.warn(
        "ProsemirrorEditor ignores `plugins` changes after mount. Recreate the component to replace the plugin set.",
      );
    }
  }, [plugins]);

  useEffect(() => {
    if (schemaRef.current !== schema && schema !== undefined) {
      console.warn(
        "ProsemirrorEditor ignores `schema` changes after mount. Recreate the component to replace the schema.",
      );
    }
  }, [schema]);

  useEffect(() => {
    if (
      initialState !== undefined &&
      (plugins !== undefined || schema !== undefined)
    ) {
      console.warn(
        "ProsemirrorEditor received `initialState` together with `plugins` or `schema`. When `initialState` is provided, it defines the editor state and create-time schema/plugin inputs are ignored.",
      );
    }
  }, [initialState, plugins, schema]);

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
      dispatchTransaction(args) {
        dispatchTransactionRef.current?.(args);
      },
      editorProps,
      initialState,
      plugins,
      schema,
    });

    setInstance(nextInstance);

    return () => {
      setInstance((currentInstance) =>
        currentInstance === nextInstance ? null : currentInstance,
      );
      nextInstance.destroy();
    };
  }, []);

  useLayoutEffect(() => {
    instance?.view.setProps({
      ...editorProps,
      attributes: attributes ?? editorProps?.attributes,
    });
  }, [attributes, editorProps, instance]);

  return (
    <EditorContext.Provider value={instance}>
      <div className={className} ref={mountRef} style={style} />
      {instance ? children : null}
    </EditorContext.Provider>
  );
});
