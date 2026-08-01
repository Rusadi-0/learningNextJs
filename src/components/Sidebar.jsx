// src/components/Sidebar.jsx
'use client' // Tambahkan ini agar bisa menggunakan usePathname

import Link from "next/link";
import { usePathname } from "next/navigation"; // Import hook untuk mendeteksi URL aktif
import { Home, Settings, PackagePlus, ShoppingCart, AlertTriangle } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname(); // Ambil path URL saat ini (misal: '/kasir')

  return (
    <div className="drawer-side is-drawer-close:overflow-visible z-50 shadow">
      <label
        htmlFor="my-drawer-4"
        aria-label="close sidebar"
        className="drawer-overlay"
      ></label>
      
      <div className="flex min-h-full flex-col items-start bg-base-200 is-drawer-close:w-14 is-drawer-open:w-64 transition-all duration-300">
        <ul className="menu w-full grow space-y-1 p-2">
          
          {/* Menu 1: Homepage */}
          <li>
            <Link
              href="/"
              // Jika pathname === '/' maka tambahkan class 'bg-primary text-primary-content' bawaan DaisyUI
              className={`is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center gap-3 ${pathname === "/" ? "bg-primary text-primary-content" : ""}`}
              data-tip="Homepage"
            >
              <Home className="my-1.5 inline-block size-5 shrink-0" />
              <span className="is-drawer-close:hidden">
                Homepage
              </span>
            </Link>
          </li>

          {/* Menu 2: Barang Masuk */}
          <li>
            <Link
              href="/barang-masuk"
              className={`is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center gap-3 ${pathname === "/barang-masuk" ? "bg-primary text-primary-content" : ""}`}
              data-tip="Barang Masuk"
            >
              <PackagePlus className="my-1.5 inline-block size-5 shrink-0" />
              <span className="is-drawer-close:hidden">
                Barang Masuk
              </span>
            </Link>
          </li>

          {/* Menu 3: Kasir */}
          <li>
            <Link
              href="/kasir"
              className={`is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center gap-3 ${pathname === "/kasir" ? "bg-primary text-primary-content" : ""}`}
              data-tip="Kasir"
            >
              <ShoppingCart className="my-1.5 inline-block size-5 shrink-0" />
              <span className="is-drawer-close:hidden">
                Kasir
              </span>
            </Link>
          </li>

          {/* Menu 4: Dashboard Expired */}
          <li>
            <Link
              href="/dashboard-expired"
              className={`is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center gap-3 ${pathname === "/dashboard-expired" ? "bg-primary text-primary-content" : ""}`}
              data-tip="Dashboard Expired"
            >
              <AlertTriangle className="my-1.5 inline-block size-5 shrink-0" />
              <span className="is-drawer-close:hidden">
                Dashboard Expired
              </span>
            </Link>
          </li>

          {/* Menu 5: Settings */}
          <li>
            <Link
              href="/settings"
              className={`is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center gap-3 ${pathname === "/settings" ? "bg-primary text-primary-content" : ""}`}
              data-tip="Settings"
            >
              <Settings className="my-1.5 inline-block size-5 shrink-0" />
              <span className="is-drawer-close:hidden">
                Settings
              </span>
            </Link>
          </li>

        </ul>
      </div>
    </div>
  );
}