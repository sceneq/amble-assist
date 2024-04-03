import { useRef, useState, SetStateAction, Dispatch } from "react";

type UpdateFunction<T> = (state: T) => T;

export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const serialize = JSON.stringify;
  const deserialize = JSON.parse;

  const initialize = useRef(() => {
    let value = defaultValue;

    const cache = localStorage.getItem(key);
    if (cache) {
      value = deserialize(cache);
    }

    return value;
  });

  const [state, setState] = useState(initialize.current);

  // todo: useCallback?
  const setter: Dispatch<SetStateAction<T>> = (v) => {
    const nextState = typeof v === "function" ? (v as UpdateFunction<typeof state>)(state) : v;
    if (nextState === undefined) return;

    localStorage.setItem(key, serialize(nextState));
    setState(nextState);
  };

  return [state, setter];
}
