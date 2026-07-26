import ThemeSelector from "@/components/ThemeSelector";

export default function Navbar() {
  return (
    /* Menambahkan sticky top-0 z-10 agar navbar menempel di atas saat discroll */
    <nav className="navbar w-full bg-base-300 shadow-lg sticky top-0 z-10">
      <label
        htmlFor="my-drawer-4"
        aria-label="open sidebar"
        className="btn btn-square btn-ghost drawer-button"
      >
        {/* Sidebar toggle icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeWidth="2"
          fill="none"
          stroke="currentColor"
          className="my-1.5 inline-block size-4"
        >
          <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path>
          <path d="M9 4v16"></path>
          <path d="M14 10l2 2l-2 2"></path>
        </svg>
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