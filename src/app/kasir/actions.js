// src/app/kasir/actions.js
'use server'

import { 
  getMasterBarangByBarcode, 
  tambahItemCart, 
  hapusItemCart, 
  getCartItems, 
  checkoutCartFEFO 
} from "@/lib/inventory";
import { revalidatePath } from "next/cache";

// Action untuk mengambil isi keranjang saat ini dari cart.csv
export async function fetchCartAction() {
  try {
    const cart = getCartItems();
    return { success: true, cart };
  } catch (error) {
    return { success: false, cart: [] };
  }
}

// 1. Tambah ke Cart CSV
export async function tambahCartAction(prevState, formData) {
  const barcode = formData.get("barcode");
  const jumlah = parseInt(formData.get("jumlah")) || 1;
  const satuan = formData.get("satuan") || "Pcs";

  try {
    const barang = getMasterBarangByBarcode(barcode);
    if (!barang) throw new Error("Barang tidak terdaftar di master!");

    const updatedCart = tambahItemCart(barcode, jumlah, satuan);
    revalidatePath("/kasir");

    return {
      success: true,
      message: `Berhasil menambahkan ${barang.nama_barang} ke keranjang.`,
      cart: updatedCart
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Gagal menambah ke keranjang.",
      cart: getCartItems()
    };
  }
}

// 2. Hapus Item dari Cart CSV
export async function hapusCartAction(barcode) {
  try {
    const updatedCart = hapusItemCart(barcode);
    revalidatePath("/kasir");
    return { success: true, cart: updatedCart, message: "Item dihapus dari keranjang." };
  } catch (error) {
    return { success: false, cart: getCartItems(), message: "Gagal menghapus item." };
  }
}

// 3. Eksekusi Checkout FEFO dari Cart CSV
export async function checkoutAction(prevState, formData) {
  try {
    const rincian = checkoutCartFEFO();
    revalidatePath("/kasir");
    revalidatePath("/dashboard-expired");

    return {
      success: true,
      message: "Transaksi Pembayaran & Pemotongan FEFO Berhasil!",
      rincian,
      cart: []
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Gagal melakukan checkout.",
      cart: getCartItems()
    };
  }
}