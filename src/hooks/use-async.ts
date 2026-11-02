"use client";

import { useCallback, useEffect, useState } from "react";

type AsyncState<T> = { key: string; data?: T; error?: string };

/**
 * Runs an async API call and re-runs it when `deps` change or `reload()` is called.
 * Keeps the previous data while a new request is loading (no flashing).
 */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[], initialData?: T) {
  const [version, setVersion] = useState(0);
  const key = JSON.stringify(deps) + ":" + version;
  const [state, setState] = useState<AsyncState<T>>({ key: "", data: initialData });

  useEffect(() => {
    let cancelled = false;
    fn().then(
      (data) => {
        if (!cancelled) setState({ key, data });
      },
      (error: unknown) => {
        if (!cancelled) {
          setState((previous) => ({
            key,
            data: previous.data,
            error: error instanceof Error ? error.message : "Something went wrong.",
          }));
        }
      }
    );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);

  return {
    data: state.data,
    error: state.key === key ? state.error : undefined,
    loading: state.key !== key,
    reload,
  };
}
