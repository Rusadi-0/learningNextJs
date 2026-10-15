// src/app/kasir/page.js
'use client'

import { useActionState, useState, useRef, useEffect, useTransition } from 'react';
import { tambahCartAction, hapusCartAction, checkoutAction, fetchCartAction } from './actions';
import Offcanvas from "@/components/Offcanvas";
import { HelpCircle, ShoppingCart, Trash2 } from "lucide-react";

export default function KasirPage() {
  let timeScanout = 500; // 3 detik untuk auto-submit scanner 1D
  const [addState, formAction, isAdding] = useActionState(tambahCartAction, null);
  const [checkoutState, checkoutFormAction, isCheckingOut] = useActionState(checkoutAction, null);
  
  const [cart, setCart] = useState([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [jumlahBeli, setJumlahBeli] = useState(1);
  const [satuanJual, setSatuanJual] = useState('Pcs');
  const [isPending, startTransition] = useTransition();

  const formRef = useRef(null);

  // 1. AMBIL DATA CART DARI SERVER (cart.csv) SAAT HALAMAN PERTAMA KALI DIBUKA / PINDAH MENU
  useEffect(() => {
    startTransition(async () => {
      const res = await fetchCartAction();
      if (res.success && res.cart) {
        setCart(res.cart);
      }
    });
  }, []);

  // 2. Sinkronisasi data keranjang dari penambahan item
  useEffect(() => {
    const timer = setTimeout(() => {
      if (addState?.cart) setCart(addState.cart);
      if (addState?.success) setBarcodeInput('');
    }, 0);
    return () => clearTimeout(timer);
  }, [addState]);

  // 3. Sinkronisasi data keranjang dari checkout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (checkoutState?.cart) setCart(checkoutState.cart);
    }, 0);
    return () => clearTimeout(timer);
  }, [checkoutState]);

  // Logika Auto-Submit Scanner 1D (3 detik / 13 digit)
  useEffect(() => {
    if (!barcodeInput) return;

    if (barcodeInput.length === 13) {
      const submitTimer = setTimeout(() => {
        formRef.current?.requestSubmit();
      }, 50);
      return () => clearTimeout(submitTimer);
    }

    const debounceTimer = setTimeout(() => {
      if (barcodeInput.length > 0) {
        formRef.current?.requestSubmit();
      }
    }, timeScanout);

    return () => clearTimeout(debounceTimer);
  }, [barcodeInput]);

  // Handler Hapus Item
  const handleRemove = (barcode) => {
    startTransition(async () => {
      const res = await hapusCartAction(barcode);
      if (res.success) setCart(res.cart);
    });
  };

  return (
    <div className="h-full w-full bg-base-200/50 p-4 md:p-6 lg:p-8 flex flex-col">
      
      {/* ================= 1. OFFCANVAS PANDUAN FEFO ================= */}
      <Offcanvas id="offcanvas-kasir-help" title="Panduan Kasir & Info FEFO" position="start">
        <p className="text-sm">
          Sistem ini menerapkan algoritma <b>First Expired, First Out (FEFO)</b> secara otomatis.
        </p>
        <div className="space-y-2 text-xs mt-4">
          <div className="alert alert-info">
            <span>Barang berstatus <b>WASPADA</b> & <b>AMAN</b> dapat dijual.</span>
          </div>
          <div className="alert alert-error">
            <span>Barang berstatus <b>KRITIS</b> (&le; 30 hari) & <b>EXPIRED</b> akan otomatis diabaikan sistem.</span>
          </div>
        </div>
      </Offcanvas>

      {/* ================= 2. OFFCANVAS CURRENT ORDER (CART.CSV) ================= */}
      <Offcanvas id="offcanvas-current-order" title="Current Order (CSV Cart)" position="end">
        <div className="flex flex-col h-full justify-between">
          <div className="space-y-4">
            
            {/* Notifikasi / Alert dari Server Action */}
            {(addState?.message || checkoutState?.message) && (
              <div className={`alert ${(addState?.success ?? checkoutState?.success) ? 'alert-success' : 'alert-error'} shadow-sm text-xs p-3`}>
                <div>
                  <span className="font-semibold block">{addState?.message || checkoutState?.message}</span>
                  {checkoutState?.rincian && (
                    <ul className="text-xs mt-2 list-disc list-inside">
                      {checkoutState.rincian.map((item, idx) => (
                        <li key={idx}>
                          <b>{item.nama_barang}</b> dipotong dari batch:
                          {item.rincian_potong.map((r, i) => (
                            <span key={i} className="block pl-3 opacity-80">
                              - Batch {r.id_batch} (Exp: {r.tgl_expired}): {r.jumlah_dipotong} Pcs
                            </span>
                          ))}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* Form Input Barcode dengan Auto-Submit Tersembunyi */}
            <form ref={formRef} action={formAction} className="card bg-base-200/60 p-4 rounded-xl space-y-3">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-medium text-xs flex justify-between">
                    <span>Barcode (Auto-Submit Scanner)</span>
                    {isAdding && <span className="text-primary animate-pulse font-bold">Memproses...</span>}
                  </span>
                </label>
                <input 
                  type="text" 
                  name="barcode" 
                  maxLength={13}
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Scan barcode di sini..." 
                  className="input input-bordered w-full input-sm font-mono" 
                  autoFocus 
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-medium text-xs">Jumlah Beli</span>
                  </label>
                  <input 
                    type="number" 
                    name="jumlah" 
                    value={jumlahBeli} 
                    onChange={(e) => setJumlahBeli(parseInt(e.target.value) || 1)}
                    className="input input-bordered w-full input-sm font-bold text-primary" 
                    required 
                    min="1" 
                  />
                </div>
                <div className="form-control">
                  <label className="label py-1"><span className="label-text font-medium text-xs">Satuan Jual</span></label>
                  <select 
                    name="satuan" 
                    value={satuanJual} 
                    onChange={(e) => setSatuanJual(e.target.value)} 
                    className="select select-bordered w-full select-sm"
                  >
                    <option value="Pcs">Pcs</option>
                    <option value="Dus">Dus</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="hidden">Submit</button>
            </form>

            {/* Daftar Item dari cart.csv */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-xs uppercase opacity-60 tracking-wider">
                Item Keranjang ({cart.length})
              </h4>
              
              {cart.length === 0 ? (
                <div className="text-center py-6 text-xs text-base-content/50 border border-dashed rounded-xl p-4">
                  Keranjang kosong. Silakan scan barcode produk menggunakan scanner 1D.
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-base-100 p-2.5 rounded-xl border border-base-200">
                    <div>
                      <h5 className="font-bold text-xs">{item.nama_barang}</h5>
                      <span className="text-[10px] text-base-content/60 font-mono">
                        {item.barcode} | <b>{item.jumlah} {item.satuan}</b>
                      </span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleRemove(item.barcode)}
                      className="btn btn-xs btn-ghost text-error"
                      disabled={isPending}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

          </div>

          {/* Bagian Bawah: Tombol Checkout FEFO */}
          <div className="mt-6 pt-4 border-t border-base-200 border-dashed text-xs space-y-2">
            <form action={checkoutFormAction}>
              <button 
                type="submit"
                disabled={isCheckingOut || cart.length === 0} 
                className="btn btn-primary w-full h-12 rounded-xl text-sm shadow-md"
              >
                {isCheckingOut ? <span className="loading loading-spinner"></span> : 'Continue to Payment (Checkout FEFO)'}
              </button>
            </form>
          </div>
        </div>
      </Offcanvas>

      {/* ================= 3. HALAMAN UTAMA KASIR ================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome, Gorry</h1>
          <p className="text-sm text-base-content/60 mt-1">Discover whatever you need easily</p>
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="offcanvas-kasir-help" className="btn btn-soft btn-info btn-circle shadow-xs" title="Panduan Kasir">
            <HelpCircle className="size-5" />
          </label>

          <label htmlFor="offcanvas-current-order" className="btn btn-primary btn-circle shadow-xs relative" title="Current Order">
            <ShoppingCart className="size-5" />
            <span className="badge badge-sm badge-error absolute -top-1 -right-1 text-white border-none">
              {cart.length}
            </span>
          </label>
        </div>
      </div>

      {/* Kategori Menu Tabs */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <button className="btn btn-ghost bg-base-100 rounded-full px-6 shadow-sm">✨ Signature</button>
        <button className="btn btn-primary rounded-full px-6 shadow-sm">🥐 Croissant</button>
        <button className="btn btn-ghost bg-base-100 rounded-full px-6 shadow-sm">🧇 Waffle</button>
        <button className="btn btn-ghost bg-base-100 rounded-full px-6 shadow-sm">☕ Coffee</button>
        <button className="btn btn-ghost bg-base-100 rounded-full px-6 shadow-sm">🍦 Ice Cream</button>
      </div>

      {/* Product Grid Catalog */}
      <div className="flex-1 overflow-y-auto pb-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="card bg-base-100 shadow-sm border border-base-200/60 p-3">
            <figure className="bg-base-200 rounded-xl h-36 w-full overflow-hidden">
               <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1549903072-7e6e08924e54?q=80&w=300&auto=format&fit=crop')] bg-cover bg-center"></div>
            </figure>
            <div className="mt-3 flex flex-col gap-1">
              <h3 className="font-bold text-xs leading-tight">Almond Brown Sugar Croissant</h3>
              <p className="text-[10px] text-base-content/50 line-clamp-1 mt-0.5">Sweet croissant with topping almonds</p>
              <div className="flex items-end gap-1 mt-2">
                <span className="font-bold text-primary text-base">$12.98</span>
                <span className="text-[10px] text-base-content/40 mb-0.5">/ 3 pcs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}