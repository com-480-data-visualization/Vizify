// ============================================================================
// Dataset hook
// ============================================================================
// Single entry point for chart components to read their data. Today it serves
// values from public/data/*.json. Set USE_MOCK to true only when developing
// chart layout without the CSV-derived aggregates.
//
// The shape returned by both modes is identical, so chart components do not
// need to change.
// ============================================================================

import { useState, useEffect } from "react";

const USE_MOCK = false;

const cache = new Map();

export function useDataset(name) {
  const [state, setState] = useState(() => ({
    data: USE_MOCK ? null : cache.get(name) ?? null,
    loading: USE_MOCK ? false : !cache.has(name),
    error: null,
  }));

  useEffect(() => {
    if (USE_MOCK) {
      let cancelled = false;
      import("./mockData").then((mockData) => {
        if (!cancelled) setState({ data: mockData[name] ?? null, loading: false, error: null });
      });
      return () => {
        cancelled = true;
      };
    }
    if (cache.has(name)) {
      setState({ data: cache.get(name), loading: false, error: null });
      return undefined;
    }
    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));
    fetch(`/data/${name}.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data) => {
        if (cancelled) return;
        cache.set(name, data);
        setState({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ data: null, loading: false, error: err });
      });
    return () => {
      cancelled = true;
    };
  }, [name]);

  return state;
}
