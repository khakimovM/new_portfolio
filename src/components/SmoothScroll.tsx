"use client";

import { useEffect } from "react";
import { ReactLenis, useLenis } from "lenis/react";

/** Ichki anchor (#...) linklarni Lenis orqali silliq scroll qiladi */
function AnchorHandler() {
  const lenis = useLenis();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!anchor || !lenis) return;
      const target = document.querySelector<HTMLElement>(anchor.getAttribute("href")!);
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: -72, duration: 1.4 });
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [lenis]);

  return null;
}

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.11, duration: 1.3 }}>
      <AnchorHandler />
      {children}
    </ReactLenis>
  );
}
