"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme");
    const isDark = saved === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  if (!mounted) return null;

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button className="btn-outline text-sm" onClick={toggle}>
      {dark ? (
        <>
          <span className="theme-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="img" focusable="false">
              <path
                fill="currentColor"
                d="M12 3a1 1 0 0 1 1 1v1.25a1 1 0 0 1-2 0V4a1 1 0 0 1 1-1zm0 14.75a1 1 0 0 1 1 1V20a1 1 0 1 1-2 0v-1.25a1 1 0 0 1 1-1zM5.22 5.22a1 1 0 0 1 1.41 0l.89.89a1 1 0 0 1-1.41 1.41l-.89-.89a1 1 0 0 1 0-1.41zm12.26 12.26a1 1 0 0 1 1.41 0l.89.89a1 1 0 1 1-1.41 1.41l-.89-.89a1 1 0 0 1 0-1.41zM3 12a1 1 0 0 1 1-1h1.25a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1zm14.75 0a1 1 0 0 1 1-1H20a1 1 0 1 1 0 2h-1.25a1 1 0 0 1-1-1zM5.22 18.78a1 1 0 0 1 0-1.41l.89-.89a1 1 0 0 1 1.41 1.41l-.89.89a1 1 0 0 1-1.41 0zm12.26-12.26a1 1 0 0 1 0-1.41l.89-.89a1 1 0 1 1 1.41 1.41l-.89.89a1 1 0 0 1-1.41 0zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10z"
              />
            </svg>
          </span>
          <span>Dark</span>
        </>
      ) : (
        <>
          <span className="theme-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="img" focusable="false">
              <path
                fill="currentColor"
                d="M14.5 2.5a1 1 0 0 1 .95 1.31 7 7 0 1 0 6.74 9.1 1 1 0 0 1 1.22 1.22A9 9 0 1 1 13.19 3.45a1 1 0 0 1 1.31-.95z"
              />
            </svg>
          </span>
          <span>Light</span>
        </>
      )}
    </button>
  );
}
