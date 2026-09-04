// src/components/Offcanvas.jsx
'use client'

import { X } from "lucide-react";

export default function Offcanvas({
  id = "my-offcanvas",
  title = "Panel Offcanvas",
  children,
  position = "end" // 'start' (kiri) atau 'end' (kanan)
}) {
  return (
    <div className="drawer drawer-end z-50">
      {/* Controller Toggle Checkbox */}
      <input id={id} type="checkbox" className="drawer-toggle" />

      {/* Backdrop / Overlay Hitam */}
      <div className="drawer-side">
        <label htmlFor={id} aria-label="close sidebar" className="drawer-overlay"></label>

        {/* Panel Konten Offcanvas */}
        <div className="bg-base-100 text-base-content min-h-full w-80 sm:w-96 p-6 shadow-2xl flex flex-col justify-between">
          <div>
            {/* Header Offcanvas */}
            <div className="flex items-center justify-between pb-4 border-b border-base-200 mb-4">
              <h3 className="font-bold text-lg">{title}</h3>
              <label htmlFor={id} className="btn btn-sm btn-circle btn-ghost">
                <X className="size-5" />
              </label>
            </div>

            {/* Isi Body Offcanvas */}
            <div className="space-y-4">
              {children}
            </div>
          </div>

          {/* Footer Offcanvas */}
          <div className="pt-4 border-t border-base-200 flex justify-end gap-2">
            <label htmlFor={id} className="btn btn-ghost">
              Tutup
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}