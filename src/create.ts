import { createStore, StateCreator, useStore as useBaseStore } from 'zustand';
import { defaultTo, get } from 'lodash';
// @ts-ignore
import isEqual from 'react-fast-compare';

const selectState = v => v;

const parseSelector = (selector?) => {
  if (!selector) return selectState;

  if (typeof selector === 'string') {
    if (selector.indexOf(',') !== -1) {
      const props = selector.split(',').map(part => part.trim());
      return state => props.map(prop => get(state, prop));
    }
    return state => get(state, selector);
  }

  return selector;
};

export function useStore<TState, StateSlice>(
  api,
  _selector?,
  _equalityFn?: (a: StateSlice, b: StateSlice) => boolean,
) {

  return useBaseStore(
    api,
    parseSelector(_selector),
    defaultTo(_equalityFn, isEqual),
  );
}

const createImpl = <T>(createState: StateCreator<T, [], []>) => {
  if (
    // @ts-ignore
    import.meta.env?.MODE !== 'production' &&
    typeof createState !== 'function'
  ) {
    console.warn(
      '[DEPRECATED] Passing a vanilla store will be unsupported in a future version. Instead use `import { useStore } from \'zustand\'`.',
    );
  }
  const api =
    typeof createState === 'function' ? createStore(createState) : createState;

  const useBoundStore: any = (selector?: any, equalityFn?: any) => {
    return useStore(api, selector, equalityFn);
  };

  // @ts-ignore
  Object.assign(useBoundStore, api);

  return useBoundStore;
};

export const create = (<T>(createState: StateCreator<T, [], []> | undefined) =>
  createState ? createImpl(createState) : createImpl);
