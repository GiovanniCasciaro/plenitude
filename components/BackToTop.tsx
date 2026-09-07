"use client";

import { useEffect } from "react";

export function BackToTop() {
  useEffect(() => {
    const button = document.getElementById("backToTop");
    if (!button) return;

    const onScroll = () => {
      button.classList.toggle("show", window.scrollY > 400);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      className="back-to-top"
      id="backToTop"
      type="button"
      aria-label="Torna in alto"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      ↑
    </button>
  );
}
