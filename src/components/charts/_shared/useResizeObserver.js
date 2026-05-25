import { useEffect, useState } from "react";

export function useResizeObserver(ref) {
  const [dims, setDims] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return undefined;
    const el = ref.current;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDims({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return dims;
}
