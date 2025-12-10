import { atom } from "jotai";

export const hydrationAtom = atom({
  total: 4,
  done: 0,
});

export const addHydrationProgress = atom(null, (get, set) => {
  const state = get(hydrationAtom);
  set(hydrationAtom, {
    ...state,
    done: state.done + 1,
  });
});
