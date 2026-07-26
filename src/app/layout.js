import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider"; // 1. Import ThemeProvider di sini
import "@/app/globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="h-full" suppressHydrationWarning>
      <body suppressHydrationWarning className="h-full antialiased">
        {/* 2. Bungkus seluruh isi aplikasi dengan ThemeProvider */}
        <ThemeProvider>
          <main className="min-h-screen flex flex-col">
            <div className="drawer lg:drawer-open min-h-screen grow">
              <input
                id="my-drawer-4"
                type="checkbox"
                className="drawer-toggle inline"
              />
              
              <div className="drawer-content flex flex-col min-h-screen">
                <Navbar />

                <div className="p-4 grow">
                  {children}
                </div>

                <Footer />
              </div>

              <Sidebar />
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}