// src/app/dashboard-expired/page.js
'use client'

import { useEffect, useState, useTransition } from "react";
import { fetchLaporanExpired } from "./actions";
import { AlertOctagon, AlertTriangle, Info, CheckCircle2 } from "lucide-react"; // Import ikon tambahan

export default function DashboardExpiredPage() {
  const [laporan, setLaporan] = useState([]);
  const [isPending, startTransition] = useTransition();

  const refreshData = () => {
    startTransition(async () => {
      const data = await fetchLaporanExpired();
      setLaporan(data);
    });
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(() => {
      refreshData();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Helper function untuk menentukan ikon berdasarkan sisa hari / status
  const getStatusIcon = (sisaHari) => {
    if (sisaHari <= 0) {
      return <AlertOctagon className="size-4 shrink-0" />; // Expired
    } else if (sisaHari <= 30) {
      return <AlertTriangle className="size-4 shrink-0" />; // Kritis
    } else if (sisaHari <= 90) {
      return <Info className="size-4 shrink-0" />; // Waspada
    } else {
      return <CheckCircle2 className="size-4 shrink-0" />; // Aman
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Dashboard Peringatan Expired
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
            </span>
          </h1>
          <p className="text-sm text-base-content/70">
            Terhubung langsung ke database stok (Otomatis memperbarui setiap 3 detik).
          </p>
        </div>

        <div className="text-xs text-base-content/50 font-mono">
          {isPending ? "Syncing..." : "Live Active"}
        </div>
      </div>

      <div className="overflow-x-auto bg-base-200 rounded-box shadow-sm p-4">
        <table className="table table-zebra">
          <thead>
            <tr className="whitespace-nowrap">
              <th>ID Batch</th>
              <th>Nama Barang</th>
              <th>Tgl Expired</th>
              <th>Sisa Hari</th>
              <th>Stok Sisa</th>
              <th>Status Tindakan</th>
            </tr>
          </thead>
          <tbody>
            {laporan.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-base-content/50">
                  Memuat data batch stok...
                </td>
              </tr>
            ) : (
              laporan.map((item) => (
                <tr key={item.id_batch} className="transition-colors duration-300 hover:bg-base-300">
                  <td className="font-mono text-xs whitespace-nowrap">{item.id_batch}</td>
                  <td className="font-semibold whitespace-nowrap">{item.nama_barang}</td>
                  <td className="whitespace-nowrap">{item.tgl_expired}</td>
                  <td className="whitespace-nowrap">
                    <span className={item.sisa_hari <= 30 ? "text-error font-bold" : ""}>
                      {item.sisa_hari} hari lagi
                    </span>
                  </td>
                  <td className="whitespace-nowrap">
                    <b className="text-primary text-base">{item.stok_sisa}</b> <span className="text-xs">Pcs</span>
                  </td>
                  <td className="min-w-[240px]">
                    <span className={`badge ${item.warna_badge} font-medium text-xs h-auto py-1.5 px-3 leading-tight w-full flex items-center justify-center gap-1.5`}>
                      {getStatusIcon(item.sisa_hari)}
                      <span>{item.status}</span>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}