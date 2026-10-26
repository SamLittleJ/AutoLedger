import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";

import { getDataErrorMessage } from "@/lib/data-errors";

type LoadState<T> =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: T };

// Loads data every time the screen gains focus, so lists are fresh after
// returning from a form. `load` must be stable (a module-level function).
// Previously loaded data stays on screen while a refresh is in flight, and
// only the latest request may update the state.
export function useFocusLoad<T>(load: () => Promise<T>) {
  const [state, setState] = useState<LoadState<T>>({ status: "loading" });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const latestRequest = useRef(0);

  const run = useCallback(() => {
    const request = ++latestRequest.current;
    const isLatest = () => request === latestRequest.current;
    load()
      .then((data) => {
        if (isLatest()) setState({ status: "ready", data });
      })
      .catch((error: unknown) => {
        if (isLatest()) setState({ status: "error", message: getDataErrorMessage(error) });
      })
      .finally(() => {
        if (isLatest()) setIsRefreshing(false);
      });
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      run();
      return () => {
        // Ignore responses that arrive after the screen loses focus.
        latestRequest.current++;
      };
    }, [run]),
  );

  function reload() {
    setIsRefreshing(true);
    run();
  }

  return { state, isRefreshing, reload };
}
