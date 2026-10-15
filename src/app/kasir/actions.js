// src/app/kasir/actions.js
'use server'

import { 
  getMasterBarangByBarcode, 
  tambahItemCart, 
  hapusItemCart, 
  getCartItems, 
  checkoutCartFEFO,
  updateQtyCartItem 
} from "@/lib/inventory";
import { revalidatePath } from "next/cache";

// Action Update Qty (+1 / -1)
export async function updateQtyCartAction(barcode, delta) {
  try {
    const updatedCart = updateQtyCartItem(barcode, delta);
    revalidatePath("/kasir");
    return { success: true, cart: updatedCart };
  } catch (error) {
    return { 
      success: false, 
      cart: getCartItems(), 
      message: error.message || "Gagal memperbarui kuantitas." 
    };
  }
}

// Action Fetch Cart Item
export async function fetchCartAction() {
  try {
    const cart = getCartItems();
    return { success: true, cart };
  } catch (error) {
    return { success: false, cart: [] };
  }
}

// Action Tambah ke Cart CSV (Scan / Form Submit)
export async function tambahCartAction(prevState, formData) {
  const barcode = formData.get("barcode");
  const jumlah = parseInt(formData.get("jumlah")) || 1;
  const satuan = formData.get("satuan") || "Pcs";

  try {
    const barang = getMasterBarangByBarcode(barcode);
    if (!barang) throw new Error(`Barang dengan barcode "${barcode}" tidak terdaftar di master!`);

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

// Action Hapus Item Cart
export async function hapusCartAction(barcode) {
  try {
    const updatedCart = hapusItemCart(barcode);
    revalidatePath("/kasir");
    return { success: true, cart: updatedCart, message: "Item dihapus dari keranjang." };
  } catch (error) {
    return { success: false, cart: getCartItems(), message: "Gagal menghapus item." };
  }
}

// Action Checkout FEFO
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

// Tambahan di src/app/kasir/actions.js
import { updateExactQtyCartItem } from "@/lib/inventory";

// Action untuk edit langsung jumlah kuantitas
export async function updateExactQtyCartAction(barcode, exactJumlah) {
  try {
    const updatedCart = updateExactQtyCartItem(barcode, exactJumlah);
    revalidatePath("/kasir");
    return { success: true, cart: updatedCart };
  } catch (error) {
    return { 
      success: false, 
      cart: getCartItems(), 
      message: error.message || "Gagal memperbarui kuantitas." 
    };
  }
}