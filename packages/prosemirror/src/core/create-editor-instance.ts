import { Schema } from "prosemirror-model";
import { EditorState, type Plugin, type Transaction } from "prosemirror-state";
import { EditorView, type DirectEditorProps } from "prosemirror-view";

import { defaultSchema } from "./default-schema";

export type EditorStateListener = (state: EditorState) => void;
export type EditorCursorPositionListener = (
  position: EditorCursorPosition,
) => void;

export type EditorCursorCoords = {
  bottom: number;
  left: number;
  right: number;
  top: number;
};

export type EditorCursorPosition = {
  anchor: number;
  coords: EditorCursorCoords | null;
  empty: boolean;
  from: number;
  head: number;
  to: number;
};

export type EditorCursorSnapshot = EditorCursorPosition & {
  capturedAt: number;
};

export type CreateEditorInstanceOptions = {
  mount: HTMLElement;
  attributes?: DirectEditorProps["attributes"];
  editorProps?: Omit<DirectEditorProps, "dispatchTransaction" | "state">;
  dispatchTransaction?: (args: {
    transaction: Transaction;
    view: EditorView;
    state: EditorState;
  }) => void;
  initialState?: EditorState;
  plugins?: readonly Plugin[];
  schema?: Schema;
};

export type EditorInstance = {
  createCursorSnapshot: () => EditorCursorSnapshot;
  destroy: () => void;
  dispatchTransaction: (transaction: Transaction) => void;
  getCursorPosition: () => EditorCursorPosition;
  getState: () => EditorState;
  subscribeCursorPosition: (
    listener: EditorCursorPositionListener,
  ) => () => void;
  subscribe: (listener: EditorStateListener) => () => void;
  view: EditorView;
};

function buildEditorViewProps(
  options: CreateEditorInstanceOptions,
): Omit<DirectEditorProps, "dispatchTransaction" | "state"> {
  return {
    ...options.editorProps,
    attributes: options.attributes ?? options.editorProps?.attributes,
  };
}

function createInitialState(options: CreateEditorInstanceOptions): EditorState {
  if (options.initialState) {
    return options.initialState;
  }

  return EditorState.create({
    schema: options.schema ?? defaultSchema,
    plugins: [...(options.plugins ?? [])],
  });
}

function getCursorCoords(view: EditorView, position: number): EditorCursorCoords | null {
  try {
    const coords = view.coordsAtPos(position);

    return {
      bottom: coords.bottom,
      left: coords.left,
      right: coords.right,
      top: coords.top,
    };
  } catch {
    return null;
  }
}

function getCursorPosition(view: EditorView): EditorCursorPosition {
  const { selection } = view.state;

  return {
    anchor: selection.anchor,
    coords: getCursorCoords(view, selection.head),
    empty: selection.empty,
    from: selection.from,
    head: selection.head,
    to: selection.to,
  };
}

export function createEditorInstance(
  options: CreateEditorInstanceOptions,
): EditorInstance {
  const listeners = new Set<EditorStateListener>();
  const cursorPositionListeners = new Set<EditorCursorPositionListener>();

  const notify = (state: EditorState) => {
    for (const listener of listeners) {
      listener(state);
    }
  };

  const notifyCursorPosition = (position: EditorCursorPosition) => {
    for (const listener of cursorPositionListeners) {
      listener(position);
    }
  };

  let currentCursorPosition: EditorCursorPosition;

  const publish = (state: EditorState) => {
    currentCursorPosition = getCursorPosition(view);
    notify(state);
    notifyCursorPosition(currentCursorPosition);
  };

  const view = new EditorView(options.mount, {
    ...buildEditorViewProps(options),
    state: createInitialState(options),
    dispatchTransaction(transaction) {
      const nextState = view.state.apply(transaction);
      view.updateState(nextState);
      options.dispatchTransaction?.({
        transaction,
        view,
        state: nextState,
      });
      publish(nextState);
    },
  });

  currentCursorPosition = getCursorPosition(view);

  return {
    view,
    createCursorSnapshot() {
      return {
        ...getCursorPosition(view),
        capturedAt: Date.now(),
      };
    },
    destroy() {
      listeners.clear();
      cursorPositionListeners.clear();
      view.destroy();
    },
    dispatchTransaction(transaction) {
      view.dispatch(transaction);
    },
    getCursorPosition() {
      return currentCursorPosition;
    },
    getState() {
      return view.state;
    },
    subscribeCursorPosition(listener) {
      cursorPositionListeners.add(listener);
      return () => {
        cursorPositionListeners.delete(listener);
      };
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
