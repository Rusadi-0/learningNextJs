// src/app/kasir/page.js
'use client'

import { useActionState } from 'react';
import { processPenjualan } from './actions';
import Offcanvas from "@/components/Offcanvas";
import { HelpCircle } from "lucide-react";

export default function KasirPage() {
  const [state, formAction, isPending] = useActionState(processPenjualan, null);

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      {/* Offcanvas Component */}
      <Offcanvas id="offcanvas-kasir-help" title="Panduan Kasir & Info FEFO">
        <p className="text-sm">
          Sistem ini menerapkan algoritma <b>First Expired, First Out (FEFO)</b> secara otomatis.
        </p>
        <div className="space-y-2 text-xs">
          <div className="alert alert-info">
            <span>Barang berstatus <b>WASPADA</b> & <b>AMAN</b> dapat dijual.</span>
          </div>
          <div className="alert alert-error">
            <span>Barang berstatus <b>KRITIS</b> ($\le 30$ hari) & <b>EXPIRED</b> akan otomatis diabaikan sistem.</span>
          </div>
        </div>
      </Offcanvas>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Simulasi Kasir & Pemotongan FEFO</h1>
          <p className="text-sm text-base-content/70">
            Scan Barcode barang yang dibeli pembeli. Sistem otomatis memotong batch dengan tanggal *expired* terdekat.
          </p>
        </div>

        {/* Tombol Pemicu Offcanvas (Trigger) */}
        <label htmlFor="offcanvas-kasir-help" className="btn btn-soft btn-info btn-circle shadow-xs">
          <HelpCircle className="size-5" />
        </label>
      </div>

      {state?.message && (
        <div className={`alert ${state.success ? 'alert-success' : 'alert-error'} shadow-sm`}>
          <div>
            <span className="font-semibold block">{state.message}</span>
            {state.rincian && (
              <ul className="text-xs mt-2 list-disc list-inside">
                {state.rincian.map((r, idx) => (
                  <li key={idx}>
                    Batch <b>{r.id_batch}</b> (Exp: {r.tgl_expired}): Dipotong <b>{r.jumlah_dipotong} Pcs</b>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <div className="card bg-base-200 shadow-sm">
        <form action={formAction} className="card-body space-y-4">
          <div className="form-control">
            <label className="label"><span className="label-text font-medium">Barcode (Scan 1D)</span></label>
            <input type="text" name="barcode" placeholder="Contoh: 8998866632287" className="input input-bordered w-full" required autoFocus />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Jumlah Beli</span></label>
              <input type="number" name="jumlah" placeholder="5" className="input input-bordered w-full" required min="1" />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Satuan Jual</span></label>
              <select name="satuan" className="select select-bordered w-full">
                <option value="Pcs">Pcs / Satuan Terkecil</option>
                <option value="Dus">Dus / Karton</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="btn btn-primary" disabled={isPending}>
              {isPending ? <span className="loading loading-spinner"></span> : 'Proses Penjualan (Checkout)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}