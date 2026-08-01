"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

// Pemisahan tema DaisyUI
const darkThemes = [
  "dark", "synthwave", "halloween", "forest", "black", 
  "luxury", "dracula", "business", "night", "coffee", 
  "dim", "sunset"
];

const lightThemes = [
  "default", "light", "cupcake", "bumblebee", "emerald", "corporate",
  "retro", "cyberpunk", "valentine", "garden", "aqua", "lofi", 
  "pastel", "fantasy", "wireframe", "cmyk", "autumn", "acid", 
  "lemon", "winter", "nord"
];

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
      <div className="btn w-36 disabled shadow-md">
        Pilih Tema 🎨
      </div>
    );
  }

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-primary btn-soft shadow-2xs capitalize flex justify-between items-center">
        <span className="truncate">{theme || "default"}</span> 🎨
        {/* <span className="truncate">Tema</span> 🎨 */}
      </div>

      <div
        tabIndex={0}
        className="dropdown-content z-50 bg-base-100 rounded-box w-80 max-w-[calc(100vw-2rem)] shadow-xl max-h-96 overflow-x-auto overflow-y-auto p-3"
      >
        {/* ================= 1. TEMA GELAP (DI ATAS) ================= */}
        <div className="text-xs font-bold uppercase text-primary tracking-wider mb-2 flex items-center gap-1">
          🌙 Tema Gelap
        </div>

        {/* Grid 2 Kolom Horizontal dengan Min Width agar bisa di-scroll di HP */}
        <div className="grid grid-cols-2 gap-1.5 min-w-[260px]">
          {darkThemes.map((t) => (
            <button
              key={t}
              type="button"
              className={`btn btn-sm btn-ghost justify-start gap-2 capitalize text-xs font-normal w-full px-2 ${
                theme === t ? "bg-primary text-primary-content font-bold" : ""
              }`}
              onClick={() => setTheme(t)}
            >
              {/* Preview Warna Tema di KIRI */}
              <div
                data-theme={t}
                className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded p-0.5 shadow-xs border border-base-content/20"
              >
                <div className="bg-base-content size-1.5 rounded-full"></div>
                <div className="bg-primary size-1.5 rounded-full"></div>
                <div className="bg-secondary size-1.5 rounded-full"></div>
                <div className="bg-accent size-1.5 rounded-full"></div>
              </div>
              <span className="truncate">{t}</span>
            </button>
          ))}
        </div>

        {/* ================= 2. PEMISAH ================= */}
        <div className="divider my-3"></div>

        {/* ================= 3. TEMA TERANG (DI BAWAH) ================= */}
        <div className="text-xs font-bold uppercase text-secondary tracking-wider mb-2 flex items-center gap-1">
          ☀️ Tema Terang
        </div>

        {/* Grid 2 Kolom Horizontal */}
        <div className="grid grid-cols-2 gap-1.5 min-w-[260px]">
          {lightThemes.map((t) => (
            <button
              key={t}
              type="button"
              className={`btn btn-sm btn-ghost justify-start gap-2 capitalize text-xs font-normal w-full px-2 ${
                theme === t ? "bg-primary text-primary-content font-bold" : ""
              }`}
              onClick={() => setTheme(t)}
            >
              {/* Preview Warna Tema di KIRI */}
              <div
                data-theme={t}
                className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded p-0.5 shadow-xs border border-base-content/20"
              >
                <div className="bg-base-content size-1.5 rounded-full"></div>
                <div className="bg-primary size-1.5 rounded-full"></div>
                <div className="bg-secondary size-1.5 rounded-full"></div>
                <div className="bg-accent size-1.5 rounded-full"></div>
              </div>
              <span className="truncate">{t}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}