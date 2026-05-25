// Reads the current CSS custom-property palette at runtime so D3 scales can
// stay in lockstep with `:root` (and a future dark variant) without hardcoding.
// Call inside a `useEffect` or chart-init function; the values returned are
// frozen strings - re-call after a theme change to refresh.

export function readColorTokens() {
  const styles = getComputedStyle(document.documentElement);
  const get = (name) => styles.getPropertyValue(name).trim();
  return {
    bg: get("--bg") || "#ffffff",
    bgSoft: get("--bg-soft") || "#f5f3f0",
    surface: get("--surface") || "#faf9f8",
    border: get("--border") || "#d8d4ce",
    borderStrong: get("--border-strong") || "#0e0b08",
    text: get("--text") || "#0e0b08",
    muted: get("--muted") || "#6b6460",
    subtle: get("--subtle") || "#a09890",
    accent: get("--accent") || "#b83025",
  };
}
