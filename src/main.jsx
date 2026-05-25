import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { FilterStoreProvider } from "./data/filterStore";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <FilterStoreProvider>
      <App />
    </FilterStoreProvider>
  </React.StrictMode>,
);
