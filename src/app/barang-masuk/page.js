// src/app/barang-masuk/page.js
'use client'

import { useActionState } from 'react';
import { processBarangMasuk } from './actions';

export default function BarangMasukPage() {
  const [state, formAction, isPending] = useActionState(processBarangMasuk, null);

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Input Barang Masuk & Expired Date</h1>
        <p className="text-sm text-base-content/70">
          Scan Barcode 1D produk, masukkan jumlah, dan tanggal kadaluarsa fisiknya.
        </p>
      </div>

      {state?.message && (
        <div className={`alert ${state.success ? 'alert-success' : 'alert-error'} shadow-sm`}>
          <span>{state.message}</span>
        </div>
      )}

      <div className="card bg-base-200 shadow-sm">
        <form action={formAction} className="card-body space-y-4">
          <div className="form-control">
            <label className="label"><span className="label-text font-medium">Barcode (Scan 1D Disini)</span></label>
            <input type="text" name="barcode" placeholder="Contoh: 8998866632287" className="input input-bordered w-full" required autoFocus />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text font-medium">Nama Barang (Jika produk baru)</span></label>
            <input type="text" name="nama_barang" placeholder="Contoh: Air Mineral 600ml" className="input input-bordered w-full" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Jumlah Masuk</span></label>
              <input type="number" name="jumlah" placeholder="10" className="input input-bordered w-full" required min="1" />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Satuan</span></label>
              <select name="satuan" className="select select-bordered w-full">
                <option value="Pcs">Pcs / Botol / Bungkus</option>
                <option value="Dus">Dus / Karton</option>
              </select>
            </div>
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text font-medium">Tanggal Kadaluarsa (Expired Date pada Kemasan)</span></label>
            <input type="date" name="tgl_expired" className="input input-bordered w-full" required />
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="btn btn-primary" disabled={isPending}>
              {isPending ? <span className="loading loading-spinner"></span> : 'Simpan Barang Masuk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}