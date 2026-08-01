// src/app/dashboard-expired/page.js
'use client'

import { useEffect, useState, useTransition } from "react";
import { fetchLaporanExpired } from "./actions";

export default function DashboardExpiredPage() {
  const [laporan, setLaporan] = useState([]);
  const [isPending, startTransition] = useTransition();

  // Fungsi fetch background tanpa membuat layar berkedip/kosong
  const refreshData = () => {
    startTransition(async () => {
      const data = await fetchLaporanExpired();
      setLaporan(data);
    });
  };

  useEffect(() => {
    // Muat data awal
    refreshData();

    // Polling halus setiap 3 detik di background
    const interval = setInterval(() => {
      refreshData();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Dashboard Peringatan Expired
            {/* Indicator Real-time animasi halus */}
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
            <tr>
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
                <tr key={item.id_batch} className="transition-colors duration-300">
                  <td className="font-mono text-xs">{item.id_batch}</td>
                  <td className="font-semibold">{item.nama_barang}</td>
                  <td>{item.tgl_expired}</td>
                  <td>
                    <span className={item.sisa_hari <= 30 ? "text-error font-bold" : ""}>
                      {item.sisa_hari} hari lagi
                    </span>
                  </td>
                  <td>
                    <b className="text-primary text-base">{item.stok_sisa}</b> Pcs
                  </td>
                  <td>
                    <span className={`badge ${item.warna_badge} font-medium`}>
                      {item.status}
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