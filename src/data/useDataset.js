// ============================================================================
// Dataset hook
// ============================================================================
// Single entry point for chart components to read their data. Today it serves
// values from src/data/mockData.js synchronously. When real preprocessed JSON
// files are dropped into public/data/, flip USE_MOCK to false - the hook will
// then fetch /data/<name>.json instead.
//
// The shape returned by both modes is identical, so chart components do not
// need to change.
// ============================================================================

import { useState, useEffect } from "react";
import * as mockData from "./mockData";

const USE_MOCK = true; // flip to false once public/data/*.json exist

const cache = new Map();

export function useDataset(name) {
  const [state, setState] = useState(() => ({
    data: USE_MOCK ? mockData[name] ?? null : cache.get(name) ?? null,
    loading: USE_MOCK ? false : !cache.has(name),
    error: null,
  }));

  useEffect(() => {
    if (USE_MOCK) return undefined;
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
