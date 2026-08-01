// src/app/kasir/actions.js
'use server'

import { getMasterBarangByBarcode, prosesPenjualanFEFO } from "@/lib/inventory";
import { revalidatePath } from "next/cache";

export async function processPenjualan(prevState, formData) {
  const barcode = formData.get("barcode");
  const jumlah = parseInt(formData.get("jumlah")) || 0;
  const satuan = formData.get("satuan");

  try {
    const barang = getMasterBarangByBarcode(barcode);
    if (!barang) throw new Error("Barang tidak terdaftar di master!");

    // Konversi satuan ke Pcs jika dibeli dalam bentuk Dus
    let jumlahPcs = jumlah;
    if (satuan === 'Dus') {
      jumlahPcs = jumlah * barang.isi_per_dus;
    }

    // Jalankan algoritma FEFO
    const hasil = prosesPenjualanFEFO(barcode, jumlahPcs);

    // REVALIDASI CACHE: Memaksa Next.js memperbarui data di halaman kasir dan dashboard expired
    revalidatePath("/kasir");
    revalidatePath("/dashboard-expired");

    return { 
      success: true, 
      message: `Transaksi Sukses! Terjual ${jumlahPcs} Pcs ${barang.nama_barang}.`,
      rincian: hasil.rincian 
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: error.message || "Gagal memproses transaksi." };
  }
}