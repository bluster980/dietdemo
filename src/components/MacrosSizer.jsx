// components/MacrosSizer.jsx
import React, { useEffect, useRef, useState } from "react";

export default function MacrosSizer({ children }) {
  const ref = useRef(null);
  const [w, setW] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setW(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const gap = Math.round(Math.max(6, Math.min(16, w * 0.025)));
  const colw = Math.max(88, Math.floor((w - gap * 2) / 3));

  // single shared icon size, slightly smaller to prevent overlap
  const iconPx = Math.max(34, Math.min(72, Math.round(colw * 0.48)));

  const style = { "--macro-gap": `${gap}px`, "--macro-colw": `${colw}px` };
  return (
    <div ref={ref} style={style}>
      {typeof children === "function" ? children({ iconPx }) : children}
    </div>
  );
}
