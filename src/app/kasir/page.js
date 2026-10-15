// src/app/kasir/page.js
'use client'

import { useActionState, useState, useRef, useEffect, useTransition } from 'react';
import { 
  tambahCartAction, 
  hapusCartAction, 
  checkoutAction, 
  fetchCartAction, 
  updateQtyCartAction,
  updateExactQtyCartAction 
} from './actions';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  AlertTriangle, 
  Search, 
  Filter, 
  Tag 
} from "lucide-react";

export default function KasirPage() {
  const [addState, formAction, isAdding] = useActionState(tambahCartAction, null);
  const [checkoutState, checkoutFormAction, isCheckingOut] = useActionState(checkoutAction, null);
  const [updateErrorMsg, setUpdateErrorMsg] = useState('');
  
  const [cart, setCart] = useState([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [jumlahBeli, setJumlahBeli] = useState(1);
  const [satuanJual, setSatuanJual] = useState('Pcs');
  
  // State untuk Inline Edit Kuantitas
  const [editingBarcode, setEditingBarcode] = useState(null);
  const [editQtyValue, setEditQtyValue] = useState('');

  const [isPending, startTransition] = useTransition();
  const formRef = useRef(null);

  // Initial Fetch Cart saat komponen dimuat
  useEffect(() => {
    startTransition(async () => {
      const res = await fetchCartAction();
      if (res.success && res.cart) {
        setCart(res.cart);
      }
    });
  }, []);

  // Sinkronisasi data keranjang dari penambahan item (Scan)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (addState?.cart) setCart(addState.cart);
      if (addState?.success) setBarcodeInput('');
    }, 0);
    return () => clearTimeout(timer);
  }, [addState]);

  // Sinkronisasi data keranjang dari checkout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (checkoutState?.cart) setCart(checkoutState.cart);
    }, 0);
    return () => clearTimeout(timer);
  }, [checkoutState]);

  // Logika Auto-Submit Scanner 1D (0.5 detik / 13 digit)
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
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [barcodeInput]);

  // Handler Hapus Item
  const handleRemove = (barcode) => {
    setUpdateErrorMsg('');
    startTransition(async () => {
      const res = await hapusCartAction(barcode);
      if (res.success) setCart(res.cart);
    });
  };

  // Handler Update Qty (+1 / -1)
  const handleUpdateQty = (barcode, delta) => {
    setUpdateErrorMsg('');
    startTransition(async () => {
      const res = await updateQtyCartAction(barcode, delta);
      if (res.success) {
        setCart(res.cart);
      } else if (res.message) {
        setUpdateErrorMsg(res.message);
      }
    });
  };

  // Handler Simpan Input Eksak (Setelah Double Click & Enter/Blur)
  const handleSaveExactQty = (barcode) => {
    setEditingBarcode(null);
    const num = parseInt(editQtyValue);
    if (isNaN(num) || num <= 0) return;

    setUpdateErrorMsg('');
    startTransition(async () => {
      const res = await updateExactQtyCartAction(barcode, num);
      if (res.success) {
        setCart(res.cart);
      } else if (res.message) {
        setUpdateErrorMsg(res.message);
      }
    });
  };

  // Kalkulasi Finansial Sederhana
  const totalItemCount = cart.reduce((acc, curr) => acc + curr.jumlah, 0);
  const subtotal = totalItemCount * 12.98;
  const tax = subtotal * 0.10;
  const grandTotal = subtotal + tax;

  return (
    <div className="h-screen w-full bg-base-200/40 p-4 md:p-6 flex flex-col lg:flex-row gap-6 overflow-hidden">
      
      {/* ================= 1. BAGIAN UTAMA (KATALOG & HEADER) ================= */}
      <div className="flex-1 flex flex-col min-w-0 bg-base-100 rounded-3xl p-6 shadow-sm border border-base-200/60 overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 shrink-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Time to Sushi!</h1>
            <p className="text-xs text-base-content/50 mt-0.5">Pilih menu atau scan barcode untuk memulai pesanan.</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/40" />
              <input 
                type="text" 
                placeholder="Search menu..." 
                className="input input-bordered input-sm w-full pl-9 rounded-full bg-base-200/50 border-none" 
              />
            </div>
            <button className="btn btn-ghost btn-sm btn-circle bg-base-200/50" title="Filter">
              <Filter className="size-4" />
            </button>
          </div>
        </div>

        {/* Kategori Menu Tabs */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide shrink-0">
          {['Nigiri Sushi', 'Maki Sushi', 'Uramaki Sushi', 'Gunkan Maki', 'Temaki Sushi', 'Oshi Sushi', 'Chirashi Sushi'].map((cat, idx) => (
            <button 
              key={idx} 
              className={`flex flex-col items-center justify-center p-3 rounded-2xl min-w-[90px] transition-all border ${idx === 0 ? 'bg-primary text-primary-content border-primary shadow-md' : 'bg-base-100 hover:bg-base-200/50 border-base-200'}`}
            >
              <div className="size-10 rounded-full bg-base-200/80 mb-1 flex items-center justify-center text-lg">🍣</div>
              <span className="text-[11px] font-medium tracking-tight whitespace-nowrap">{cat}</span>
            </button>
          ))}
        </div>

        {/* Product Grid Catalog */}
        <div className="flex-1 overflow-y-auto pr-1 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {[
              { name: 'Salmori Sushi', desc: '4 pcs/pack', price: '$10.00', img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=300&auto=format&fit=crop' },
              { name: 'Nori Glaze Salmon', desc: '6 pcs/pack', price: '$11.00', img: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?q=80&w=300&auto=format&fit=crop' },
              { name: 'Sweet Shrimp Sushi', desc: '4 pcs/pack', price: '$12.00', img: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=300&auto=format&fit=crop' },
              { name: 'Umami Gyuniku Sushi', desc: '2 pcs/pack', price: '$13.50', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=300&auto=format&fit=crop' },
              { name: 'Tamago Ikura Sushi', desc: '4 pcs/pack', price: '$11.50', img: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?q=80&w=300&auto=format&fit=crop' },
              { name: 'Maguro Wasabi Sushi', desc: '8 pcs/pack', price: '$12.00', img: 'https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=300&auto=format&fit=crop' },
            ].map((prod, idx) => (
              <div key={idx} className="card bg-base-100 shadow-xs hover:shadow-md transition-shadow border border-base-200/80 p-3 rounded-2xl flex flex-col justify-between">
                <div>
                  <figure className="bg-base-200/50 rounded-xl h-32 w-full overflow-hidden mb-3">
                     <div className="w-full h-full bg-cover bg-center hover:scale-105 transition-transform duration-300" style={{ backgroundImage: `url('${prod.img}')` }}></div>
                  </figure>
                  <h3 className="font-bold text-xs leading-tight line-clamp-1">{prod.name}</h3>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[10px] text-base-content/50">{prod.desc}</span>
                    <span className="font-bold text-primary text-xs">{prod.price}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="btn btn-xs btn-outline btn-primary w-full rounded-xl text-[11px] font-medium pointer-events-none">
                    + Add to cart
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ================= 2. SIDEBAR KANAN: ORDER DETAILS (PERSISTENT) ================= */}
      <div className="w-full lg:w-96 bg-base-100 rounded-3xl border border-base-200/60 shadow-sm p-5 flex flex-col justify-between shrink-0 overflow-hidden">
        
        <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto pr-1">
          
          {/* Header Order Details */}
          <div className="flex justify-between items-center pb-2 border-b border-base-100">
            <h3 className="font-bold text-base tracking-tight">Order Details</h3>
            <span className="text-xs text-base-content/40 hover:text-error cursor-pointer font-medium" onClick={() => setCart([])}>Clear All</span>
          </div>

          {/* Dine In & Table Selectors */}
          <div className="grid grid-cols-2 gap-2">
            <select className="select select-bordered select-sm rounded-xl text-xs font-medium bg-base-200/30">
              <option>Dine In</option>
              <option>Take Away</option>
            </select>
            <select className="select select-bordered select-sm rounded-xl text-xs font-medium bg-base-200/30">
              <option>Table 21</option>
              <option>Table 22</option>
              <option>VIP Room</option>
            </select>
          </div>

          {/* Alert Error / Sukses */}
          {(addState?.message || checkoutState?.message || updateErrorMsg) && (
            <div className={`alert ${(addState?.success ?? checkoutState?.success) && !updateErrorMsg ? 'alert-success' : 'alert-error'} shadow-xs text-xs p-2.5 rounded-xl`}>
              <div className="flex items-start gap-2">
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">
                    {updateErrorMsg || addState?.message || checkoutState?.message}
                  </span>
                  {checkoutState?.rincian && (
                    <ul className="text-xs mt-1 list-disc list-inside">
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
            </div>
          )}

          {/* Form Input Barcode Scanner (Tersembunyi namun aktif) */}
          <form ref={formRef} action={formAction} className="hidden">
            <input 
              type="text" 
              name="barcode" 
              maxLength={13}
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              autoFocus 
              required
            />
            <input type="hidden" name="jumlah" value={jumlahBeli} />
            <input type="hidden" name="satuan" value={satuanJual} />
          </form>

          {/* Input Barcode Visual Minimalis */}
          <div className="form-control">
            <div className="relative">
              <input 
                type="text" 
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Scan barcode 1D / ketik kode..." 
                className="input input-bordered input-sm w-full pl-8 rounded-xl font-mono text-xs bg-base-200/40" 
                autoFocus 
              />
              <ShoppingCart className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-base-content/40" />
            </div>
          </div>

          {/* Daftar Item Keranjang */}
          <div className="space-y-3 flex-1 overflow-y-auto">
            <h4 className="font-bold text-xs uppercase opacity-50 tracking-wider">
              Items ({cart.length}) {isAdding && <span className="text-primary animate-pulse ml-2 font-normal">Memproses...</span>}
            </h4>
            
            {cart.length === 0 ? (
              <div className="text-center py-10 text-xs text-base-content/40 border border-dashed border-base-300 rounded-2xl p-4">
                Belum ada item di keranjang. Scan barcode produk untuk menambahkan.
              </div>
            ) : (
              cart.map((item, idx) => {
                const currentQtyPcs = item.satuan === 'Dus' ? item.jumlah * item.isi_per_dus : item.jumlah;
                const isMaxStokReached = currentQtyPcs >= item.stok_sisa_layak;
                const isEditing = editingBarcode === item.barcode;

                return (
                  <div key={idx} className="flex justify-between items-center bg-base-200/30 p-2.5 rounded-2xl border border-base-200/60">
                    <div className="min-w-0 flex-1 pr-2">
                      <h5 className="font-bold text-xs truncate">{item.nama_barang}</h5>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-base-content/50 font-mono">
                          {item.barcode} ({item.satuan})
                        </span>
                        <span className={`text-[9px] font-semibold px-1 py-0.2 rounded ${isMaxStokReached ? 'bg-warning/20 text-warning-content' : 'bg-base-200 text-base-content/60'}`}>
                          Stok: {item.stok_sisa_layak}
                        </span>
                      </div>
                    </div>

                    {/* Kontrol Qty Plus, Minus & Double Click Edit */}
                    <div className="flex items-center gap-1 bg-base-100 rounded-xl p-0.5 border border-base-200 shadow-2xs">
                      <button 
                        type="button" 
                        onClick={() => handleUpdateQty(item.barcode, -1)}
                        className="btn btn-xs btn-ghost btn-square rounded-lg h-6 w-6 min-h-0"
                        disabled={isPending}
                        title="Kurangi"
                      >
                        <Minus className="size-3" />
                      </button>

                      {isEditing ? (
                        <input 
                          type="number"
                          className="input input-bordered input-xs w-10 text-center font-bold px-0 text-xs h-6 min-h-0"
                          value={editQtyValue}
                          onChange={(e) => setEditQtyValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveExactQty(item.barcode);
                            if (e.key === 'Escape') setEditingBarcode(null);
                          }}
                          onBlur={() => handleSaveExactQty(item.barcode)}
                          autoFocus
                          min="1"
                        />
                      ) : (
                        <span 
                          onDoubleClick={() => {
                            setEditingBarcode(item.barcode);
                            setEditQtyValue(item.jumlah);
                          }}
                          className="text-xs font-bold w-6 text-center cursor-pointer hover:text-primary transition-colors select-none"
                          title="Klik 2 kali untuk ubah jumlah langsung"
                        >
                          {item.jumlah}
                        </span>
                      )}

                      <button 
                        type="button" 
                        onClick={() => handleUpdateQty(item.barcode, 1)}
                        className="btn btn-xs btn-ghost btn-square rounded-lg h-6 w-6 min-h-0 text-success"
                        disabled={isPending || isMaxStokReached}
                        title={isMaxStokReached ? "Stok maksimum telah tercapai" : "Tambah"}
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>

                    {/* Tombol Hapus */}
                    <button 
                      type="button" 
                      onClick={() => handleRemove(item.barcode)}
                      className="btn btn-xs btn-ghost btn-square text-error/70 hover:text-error ml-1"
                      disabled={isPending}
                      title="Hapus"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Ringkasan & Checkout FEFO */}
        <div className="pt-3 mt-2 border-t border-base-200 text-xs space-y-2 shrink-0">
          <div className="space-y-1.5 px-1">
            <div className="flex justify-between text-base-content/70">
              <span>Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base-content/70">
              <span>Tax (10%)</span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base-content/70">
              <span>Discount</span>
              <span className="font-medium text-success">$0.00</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-1 border-t border-dashed border-base-200">
              <span>Total</span>
              <span className="text-primary text-base">${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <div className="relative flex-1">
              <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-base-content/40" />
              <input type="text" placeholder="Enter promo code..." className="input input-bordered input-xs w-full pl-8 rounded-xl h-8 bg-base-200/30" />
            </div>
            <button className="btn btn-xs btn-outline rounded-xl h-8 px-3 font-medium">Apply</button>
          </div>

          <select className="select select-bordered select-xs w-full rounded-xl h-8 text-xs font-medium bg-base-200/30">
            <option>Select payment method (Cash / QRIS / Card)</option>
            <option>Cash (Tunai)</option>
            <option>QRIS / E-Wallet</option>
            <option>Credit / Debit Card</option>
          </select>

          <form action={checkoutFormAction} className="pt-2">
            <button 
              type="submit"
              disabled={isCheckingOut || cart.length === 0} 
              className="btn btn-primary w-full h-11 rounded-2xl text-sm font-bold shadow-sm tracking-wide"
            >
              {isCheckingOut ? <span className="loading loading-spinner"></span> : 'Place Order (Checkout FEFO)'}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}