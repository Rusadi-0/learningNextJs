// src/app/barang-masuk/actions.js
'use server'

import { saveMasterBarang, getMasterBarangByBarcode, tambahBarangMasuk } from "@/lib/inventory";
import { revalidatePath } from "next/cache";

export async function processBarangMasuk(prevState, formData) {
  const barcode = formData.get("barcode");
  const namaBarang = formData.get("nama_barang");
  const jumlah = formData.get("jumlah");
  const satuan = formData.get("satuan");
  const tglExpired = formData.get("tgl_expired");

  try {
    // 1. Cek apakah barang sudah ada di master, jika belum otomatis daftarkan
    let barang = getMasterBarangByBarcode(barcode);
    if (!barang) {
      saveMasterBarang({
        barcode,
        nama_barang: namaBarang || "Barang Baru",
        satuan_terkecil: "Pcs",
        isi_per_dus: satuan === 'Dus' ? parseInt(formData.get("isi_per_dus") || 24) : 24
      });
    }

    // 2. Masukkan ke catatan batch stok dengan tanggal expired
    const result = tambahBarangMasuk({
      barcode,
      jumlah,
      satuan,
      tgl_expired: tglExpired
    });

    revalidatePath("/barang-masuk");
    return { success: true, message: `Berhasil! Ditambahkan ke batch (${result.jumlahPcs} Pcs) dengan Expired: ${tglExpired}` };
  } catch (error) {
    console.error(error);
    return { success: false, message: error.message || "Gagal memproses barang masuk." };
  }
}