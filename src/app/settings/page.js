// src/app/settings/page.js
'use client'

import { useActionState } from 'react';
import { updateSettingsAction } from "./actions";

export default function SettingsPage() {
  // state menyimpan balasan dari Server Action
  const [state, formAction, isPending] = useActionState(updateSettingsAction, null);

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan Akun (Local Excel)</h1>
        <p className="text-sm text-base-content/70">
          Data disimpan ke file <code className="bg-base-300 px-1 rounded">database.xlsx</code>.
        </p>
      </div>

      {/* NOTIFIKASI BERHASIL / GAGAL */}
      {state?.message && (
        <div className={`alert ${state.success ? 'alert-success' : 'alert-error'} shadow-sm`}>
          <span>{state.message}</span>
        </div>
      )}

      <div className="card bg-base-200 shadow-sm">
        <form action={formAction} className="card-body space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Nama Lengkap</span>
            </label>
            <input
              type="text"
              name="nama"
              placeholder="Masukkan nama"
              className="input input-bordered w-full"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Email</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="email@example.com"
              className="input input-bordered w-full"
              required
            />
          </div>

          <div className="flex justify-end pt-2">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isPending}
            >
              {isPending ? <span className="loading loading-spinner"></span> : 'Simpan ke Excel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}