"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const themes = [
  "default", "light", "dark", "cupcake", "bumblebee", "emerald", "corporate",
  "synthwave", "retro", "cyberpunk", "valentine", "halloween", "garden",
  "forest", "aqua", "lofi", "pastel", "fantasy", "wireframe", "black",
  "luxury", "dracula", "cmyk", "autumn", "business", "acid", "lemon",
  "night", "coffee", "winter", "dim", "nord", "sunset"
];

// Helper untuk mengecek apakah sudah di-mount di client
const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const isClient = useIsClient();

  if (!isClient) {
    return (
      <div className="btn w-32 disabled shadow-md">
        Pilih Tema 🎨
      </div>
    );
  }

  return (
    <div className="dropdown dropdown-bottom">
      <div tabIndex={0} role="button" className="btn shadow-md w-32 capitalize">
        {theme || "default"}🎨
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-100 rounded-box z-10 w-36 shadow-md max-h-96 overflow-y-auto"
      >
        <div className="join join-vertical w-full">
          {themes.map((t) => (
            <input
              key={t}
              type="radio"
              name="theme-buttons"
              className="btn theme-controller join-item justify-start capitalize"
              aria-label={t}
              value={t}
              checked={theme === t}
              onChange={() => setTheme(t)}
            />
          ))}
        </div>
      </ul>
    </div>
  );
}