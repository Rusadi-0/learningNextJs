export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Halaman */}
      <div>
        <h1 className="text-2xl font-bold">Pengaturan Akun</h1>
        <p className="text-base-content/70 text-sm">
          Kelola preferensi akun, profil, dan notifikasi aplikasi kamu.
        </p>
      </div>

      <div className="divider"></div>

      {/* Section 1: Profil pengguna */}
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-lg mb-2">Informasi Profil</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Nama Lengkap</span>
              </label>
              <input
                type="text"
                placeholder="Masukkan nama"
                defaultValue="John Doe"
                className="input input-bordered w-full"
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <input
                type="email"
                placeholder="email@example.com"
                defaultValue="johndoe@example.com"
                className="input input-bordered w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Preferensi Notifikasi */}
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-lg mb-2">Notifikasi & Privasi</h2>

          <div className="space-y-3">
            <div className="form-control">
              <label className="label cursor-pointer justify-between">
                <div>
                  <span className="label-text font-medium block">Notifikasi Email</span>
                  <span className="label-text-alt text-base-content/60">
                    Terima pembaruan aplikasi dan laporan aktivitas via email.
                  </span>
                </div>
                <input type="checkbox" className="toggle toggle-primary" defaultChecked />
              </label>
            </div>

            <div className="divider my-1"></div>

            <div className="form-control">
              <label className="label cursor-pointer justify-between">
                <div>
                  <span className="label-text font-medium block">Mode Pengembang</span>
                  <span className="label-text-alt text-base-content/60">
                    Aktifkan fitur eksperimental dan log tambahan.
                  </span>
                </div>
                <input type="checkbox" className="toggle toggle-secondary" />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-2">
        <button className="btn btn-ghost">Batal</button>
        <button className="btn btn-primary">Simpan Perubahan</button>
      </div>
    </div>
  );
}