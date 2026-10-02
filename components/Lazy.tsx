"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";

/**
 * Mounts a below-the-fold scene only when it's about a screen and a half away,
 * so its code, canvases and scroll triggers cost nothing until then.
 */
export default function Lazy({ component: Scene, minHeight = "100svh" }: { component: ComponentType; minHeight?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || show) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px 150% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [show]);

  if (show) return <Scene />;
  return <div ref={ref} aria-hidden style={{ minHeight }} />;
}
