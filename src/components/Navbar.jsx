import ThemeSelector from "@/components/ThemeSelector";
import { PanelLeftClose } from "lucide-react"; // Import ikon dari Lucide

export default function Navbar() {
  return (
    /* Sticky top-0 z-10 agar navbar menempel di atas saat discroll */
    <nav className="navbar w-full bg-base-300 shadow-lg sticky top-0 z-10">
      <label
        htmlFor="my-drawer-4"
        aria-label="open sidebar"
        className="btn btn-square btn-ghost drawer-button"
      >
        {/* Sidebar toggle icon dari Lucide */}
        <PanelLeftClose className="size-5" />
      </label>
      
      <div className="navbar-start">
        <div className="px-4 font-semibold">Navbar Title</div>
      </div>
      
      <div className="navbar-center"></div>
      
      <div className="navbar-end me-2">
        <ThemeSelector />
      </div>
    </nav>
  );
}