import { useCallback, useRef, DependencyList } from "react";

export interface DebouncedState<T extends (...args: Parameters<T>) => ReturnType<T>> {
  (...args: Parameters<T>): ReturnType<T> | undefined;
}

export default function useThrottleCallback<
  T extends (...args: Parameters<T>) => ReturnType<T>
>(callback: T, delay: number, deps: DependencyList): DebouncedState<T> {
  const lastCallTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const throttledCallback = useCallback(
    (...args: Parameters<T>): ReturnType<T> | undefined => {
      if (lastCallTimer.current === null) {
        const result = callback(...args);
        lastCallTimer.current = setTimeout(() => {
          lastCallTimer.current = null;
        }, delay);
        return result;
      }
      return undefined;
    },
    [callback, delay, ...deps]
  );

  return throttledCallback;
}
