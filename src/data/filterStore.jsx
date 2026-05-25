import { createContext, useContext, useMemo, useReducer } from "react";

const initial = {
  category: "All",
  country: "All",
  search: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "set":
      return { ...state, [action.key]: action.value };
    case "reset":
      return initial;
    default:
      return state;
  }
}

const Ctx = createContext(null);

export function FilterStoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const value = useMemo(
    () => ({
      ...state,
      setCategory: (v) => dispatch({ type: "set", key: "category", value: v }),
      setCountry: (v) => dispatch({ type: "set", key: "country", value: v }),
      setSearch: (v) => dispatch({ type: "set", key: "search", value: v }),
      reset: () => dispatch({ type: "reset" }),
    }),
    [state],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFilters() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFilters must be used inside <FilterStoreProvider>");
  return ctx;
}
