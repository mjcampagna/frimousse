import { Schema } from "prosemirror-model";
import { EditorState, type Plugin, type Transaction } from "prosemirror-state";
import { EditorView, type DirectEditorProps } from "prosemirror-view";

import { defaultSchema } from "./default-schema";

export type EditorStateListener = (state: EditorState) => void;

export type CreateEditorInstanceOptions = {
  mount: HTMLElement;
  attributes?: DirectEditorProps["attributes"];
  dispatchTransaction?: (args: {
    transaction: Transaction;
    view: EditorView;
    state: EditorState;
  }) => void;
  plugins?: readonly Plugin[];
  schema?: Schema;
  state?: EditorState;
};

export type EditorInstance = {
  destroy: () => void;
  dispatchTransaction: (transaction: Transaction) => void;
  getState: () => EditorState;
  subscribe: (listener: EditorStateListener) => () => void;
  view: EditorView;
};

function createInitialState(options: CreateEditorInstanceOptions): EditorState {
  if (options.state) {
    return options.state;
  }

  return EditorState.create({
    schema: options.schema ?? defaultSchema,
    plugins: [...(options.plugins ?? [])],
  });
}

export function createEditorInstance(
  options: CreateEditorInstanceOptions,
): EditorInstance {
  const listeners = new Set<EditorStateListener>();

  const notify = (state: EditorState) => {
    for (const listener of listeners) {
      listener(state);
    }
  };

  const view = new EditorView(options.mount, {
    state: createInitialState(options),
    attributes: options.attributes,
    dispatchTransaction(transaction) {
      const nextState = view.state.apply(transaction);
      view.updateState(nextState);
      options.dispatchTransaction?.({
        transaction,
        view,
        state: nextState,
      });
      notify(nextState);
    },
  });

  return {
    view,
    destroy() {
      listeners.clear();
      view.destroy();
    },
    dispatchTransaction(transaction) {
      const nextState = view.state.apply(transaction);
      view.updateState(nextState);
      options.dispatchTransaction?.({
        transaction,
        view,
        state: nextState,
      });
      notify(nextState);
    },
    getState() {
      return view.state;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
