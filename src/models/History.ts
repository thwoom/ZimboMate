/**
 * History management for undo / redo functionality
 */

import { GameState } from './GameState';

// History state structure
export interface StateHistory < T = GameState> {
  past: T[];
  present: T;
  future: T[];
  maxHistorySize: number;
}

// History action types
export type HistoryAction < T = GameState> =
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SAVE_STATE'; payload: T }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'JUMP_TO_PAST'; payload: number }
  | { type: 'JUMP_TO_FUTURE'; payload: number };

// Create initial history state
export function createInitialHistory < T>(
  initialState: T,
  maxHistorySize = 50,
): StateHistory < T> {
  return {
    past: [],
    present: initialState,
    future: [],
    maxHistorySize,
  };
}

// History reducer
export function historyReducer < T>(
  state: StateHistory < T>,
  action: HistoryAction < T>,
): StateHistory < T> {
  switch (action.type) {
    case 'UNDO': {
      if (state.past.length === 0) return state;

      const previousState = state.past[state.past.length-1];
      const newPast = state.past.slice(0, state.past.length-1);

      return {
        ...state,
        past: newPast,
        present: previousState,
        future: [state.present, ...state.future],
      };
    }

    case 'REDO': {
      if (state.future.length === 0) return state;

      const nextState = state.future[0];
      const newFuture = state.future.slice(1);

      return {
        ...state,
        past: [...state.past, state.present],
        present: nextState,
        future: newFuture,
      };
    }

    case 'SAVE_STATE': {
      // Don't save if the state hasn't changed
      if (deepEqual(state.present, action.payload)) return state;

      let newPast = [...state.past, state.present];

      // Limit history size
      if (newPast.length > state.maxHistorySize) {
        newPast = newPast.slice(newPast.length-state.maxHistorySize);
      }

      return {
        ...state,
        past: newPast,
        present: action.payload,
        future: [], // Clear future on new action
      };
    }

    case 'CLEAR_HISTORY':
      return {
        ...state,
        past: [],
        future: [],
      };

    case 'JUMP_TO_PAST': {
      const pastIndex = action.payload;
      if (pastIndex < 0 || pastIndex >= state.past.length) return state;

      const targetPastState = state.past[pastIndex];
      const statesAfterTarget = [
        ...state.past.slice(pastIndex + 1),
        state.present,
        ...state.future,
      ];

      return {
        ...state,
        past: state.past.slice(0, pastIndex),
        present: targetPastState,
        future: statesAfterTarget,
      };
    }

    case 'JUMP_TO_FUTURE': {
      const futureIndex = action.payload;
      if (futureIndex < 0 || futureIndex >= state.future.length) return state;

      const targetFutureState = state.future[futureIndex];
      const statesBeforeTarget = [
        ...state.past,
        state.present,
        ...state.future.slice(0, futureIndex),
      ];

      return {
        ...state,
        past: statesBeforeTarget,
        present: targetFutureState,
        future: state.future.slice(futureIndex + 1),
      };
    }

    default:
      return state;
  }
}

// Utility functions

/**
 * Check if undo is available
 */
export function canUndo < T>(history: StateHistory < T>): boolean {
  return history.past.length > 0;
}

/**
 * Check if redo is available
 */
export function canRedo < T>(history: StateHistory < T>): boolean {
  return history.future.length > 0;
}

/**
 * Get undo / redo counts
 */
export function getHistoryCounts < T>(history: StateHistory < T>): {
  undoCount: number;
  redoCount: number;
} {
  return {
    undoCount: history.past.length,
    redoCount: history.future.length,
  };
}

/**
 * Create a history-aware wrapper for unknown reducer
 */
export function withHistory < T, A>(
  reducer: (state: T, action: A) => T,
  shouldSaveHistory?: (action: A) => boolean,
) {
  return function historyAwareReducer(
    history: StateHistory < T>,
    action: A | HistoryAction < T>,
  ): StateHistory < T> {
    // Handle history actions
    if (isHistoryAction(action)) {
      return historyReducer(history, action);
    }

    // Handle regular actions
    const newPresent = reducer(history.present, action as A);

    // Check if we should save history for this action
    if (shouldSaveHistory && !shouldSaveHistory(action as A)) {
      return {
        ...history,
        present: newPresent,
      };
    }

    // Save to history
    return historyReducer(history, {
      type: 'SAVE_STATE',
      payload: newPresent,
    });
  };
}

/**
 * Type guard for history actions
 */
function isHistoryAction < T>(action: unknown): action is HistoryAction < T> {
  return [
    'UNDO',
    'REDO',
    'SAVE_STATE',
    'CLEAR_HISTORY',
    'JUMP_TO_PAST',
    'JUMP_TO_FUTURE',
  ].includes(action.type);
}

/**
 * Simple deep equality check
 */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;

  if (a == null || b == null) return false;

  if (a.constructor !== b.constructor) return false;

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (typeof a === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }

    return true;
  }

  return false;
}

/**
 * Create a debounced history saver
 */
export function createHistorySaver < T>(
  saveHistory: (state: T) => void,
  debounceMs = 1000,
) {
  let timeoutId: ReturnType < typeof setTimeout> | null = null;

  return (state: T) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      saveHistory(state);
      timeoutId = null;
    }, debounceMs);
  };
}
