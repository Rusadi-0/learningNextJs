// src/lib/inventory.js
import fs from 'fs';
import path from 'path';

const masterBarangPath = path.join(process.cwd(), 'master_barang.csv');
const batchStokPath = path.join(process.cwd(), 'batch_stok.csv');
const limitJual = 3; // Batas hari untuk status KRITIS (layak jual <= 30 hari)

// Inisialisasi file CSV jika belum ada
function initFiles() {
  if (!fs.existsSync(masterBarangPath)) {
    fs.writeFileSync(masterBarangPath, 'barcode,nama_barang,satuan_terkecil,isi_per_dus\n', 'utf-8');
  }
  if (!fs.existsSync(batchStokPath)) {
    fs.writeFileSync(batchStokPath, 'id_batch,barcode,tgl_expired,stok_sisa\n', 'utf-8');
  }
}

// 1. Tambah / Daftarkan Barang ke Master
export function saveMasterBarang(data) {
  initFiles();
  const line = `"${data.barcode}","${data.nama_barang}","${data.satuan_terkecil}",${data.isi_per_dus}\n`;
  fs.appendFileSync(masterBarangPath, line, 'utf-8');
}

// 2. Ambil Master Barang Berdasarkan Barcode
export function getMasterBarangByBarcode(barcode) {
  initFiles();
  const content = fs.readFileSync(masterBarangPath, 'utf-8');
  const lines = content.trim().split('\n');

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, ''));
    if (cols[0] === barcode) {
      return {
        barcode: cols[0],
        nama_barang: cols[1],
        satuan_terkecil: cols[2],
        isi_per_dus: parseInt(cols[3]) || 1,
      };
    }
  }
  return null;
}

// 3. Catat Barang Masuk (Masuk ke Batch Stok dengan Expired)
export function tambahBarangMasuk(data) {
  initFiles();
  
  // Ambil data master untuk konversi satuan
  const barang = getMasterBarangByBarcode(data.barcode);
  if (!barang) throw new Error("Barang belum terdaftar di Master Barang!");

  // Hitung jumlah dalam satuan terkecil (Pcs)
  let jumlahPcs = parseInt(data.jumlah);
  if (data.satuan === 'Dus') {
    jumlahPcs = jumlahPcs * barang.isi_per_dus;
  }

  const idBatch = `BAT-${Date.now()}`;
  const newRow = `"${idBatch}","${data.barcode}","${data.tgl_expired}",${jumlahPcs}\n`;
  
  fs.appendFileSync(batchStokPath, newRow, 'utf-8');
  return { idBatch, jumlahPcs };
}

// ==========================================
// 4. AMBIL SEMUA BATCH STOK AKTIF
// ==========================================
export function getBatchStok() {
  initFiles();
  const content = fs.readFileSync(batchStokPath, 'utf-8');
  const lines = content.trim().split('\n');
  const batches = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, ''));
    if (cols.length >= 4) {
      batches.push({
        id_batch: cols[0],
        barcode: cols[1],
        tgl_expired: cols[2],
        stok_sisa: parseInt(cols[3]) || 0,
      });
    }
  }
  return batches;
}

// ==========================================
// 5. UPDATE / SIMPAN KEMBALI FILE BATCH
// ==========================================
function saveAllBatches(batches) {
  initFiles();
  let content = 'id_batch,barcode,tgl_expired,stok_sisa\n';
  for (const b of batches) {
    content += `"${b.id_batch}","${b.barcode}","${b.tgl_expired}",${b.stok_sisa}\n`;
  }
  fs.writeFileSync(batchStokPath, content, 'utf-8');
}

// ==========================================
// 6. ALGORITMA UTAMA KASIR: PEMOTONGAN FEFO (HANYA WASPADA & AMAN)
// ==========================================
export function prosesPenjualanFEFO(barcodeTarget, jumlahBeliPcs) {
  const hariIni = new Date();
  hariIni.setHours(0, 0, 0, 0);

  const semuaBatch = getBatchStok();

  // 1. Filter batch yang sesuai barcode, stok > 0, DAN Sisa Hari >= 0 (Layak Jual)
  let batchValid = semuaBatch.filter(b => {
    if (b.barcode !== barcodeTarget || b.stok_sisa <= 0) return false;

    const tglExp = new Date(b.tgl_expired);
    tglExp.setHours(0, 0, 0, 0);
    
    const selisihWaktu = tglExp - hariIni;
    const sisaHari = Math.ceil(selisihWaktu / (1000 * 60 * 60 * 24));

    return sisaHari >= 0;
  });

  // 2. Sortir FEFO: Dari tgl_expired PALING DEKAT ke PALING LAMA
  batchValid.sort((a, b) => new Date(a.tgl_expired) - new Date(b.tgl_expired));

  let sisaKebutuhan = jumlahBeliPcs;
  const rincianPemotongan = [];

  // 3. Eksekusi loop pemotongan stok
  for (let batch of batchValid) {
    if (sisaKebutuhan === 0) break;

    const jumlahDipotong = Math.min(batch.stok_sisa, sisaKebutuhan);
    batch.stok_sisa -= jumlahDipotong;
    sisaKebutuhan -= jumlahDipotong;

    rincianPemotongan.push({
      id_batch: batch.id_batch,
      tgl_expired: batch.tgl_expired,
      jumlah_dipotong: jumlahDipotong,
      sisa_stok_batch: batch.stok_sisa
    });
  }

  // Jika stok total tidak mencukupi
  if (sisaKebutuhan > 0) {
    throw new Error(`Stok layak jual tidak mencukupi! Kekurangan ${sisaKebutuhan} Pcs. (Stok berstatus Kritis & Kadaluarsa otomatis diabaikan Kasir).`);
  }

  // 4. Update kembali file CSV utama dengan data stok terbaru
  const mapPerubahan = new Map(batchValid.map(b => [b.id_batch, b.stok_sisa]));
  const batchFinal = semuaBatch.map(b => {
    if (mapPerubahan.has(b.id_batch)) {
      return { ...b, stok_sisa: mapPerubahan.get(b.id_batch) };
    }
    return b;
  });

  saveAllBatches(batchFinal);

  return {
    sukses: true,
    jumlah_dibeli: jumlahBeliPcs,
    rincian: rincianPemotongan
  };
}

// ==========================================
// 7. DASHBOARD MONITORING EXPIRED (EWS) - FILTER STOK > 0
// ==========================================
export function getLaporanStatusExpired() {
  const semuaBatch = getBatchStok();
  
  const masterBarangPath = path.join(process.cwd(), 'master_barang.csv');
  const petaNamaBarang = {};

  if (fs.existsSync(masterBarangPath)) {
    const contentMaster = fs.readFileSync(masterBarangPath, 'utf-8');
    const linesMaster = contentMaster.trim().split('\n');

    for (let i = 1; i < linesMaster.length; i++) {
      const line = linesMaster[i].trim();
      if (!line) continue;

      const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim());
      
      if (cols.length >= 2 && cols[0]) {
        petaNamaBarang[cols[0]] = cols[1];
      }
    }
  }

  const hariIni = new Date();
  hariIni.setHours(0, 0, 0, 0);

  return semuaBatch
    .filter(batch => batch.stok_sisa > 0) // HANYA TAMPILKAN BATCH YANG STOKNYA MASIH ADA (> 0)
    .map(batch => {
      const cleanBarcode = batch.barcode ? batch.barcode.trim() : "";
      const tglExp = new Date(batch.tgl_expired);
      tglExp.setHours(0, 0, 0, 0);

      const selisihWaktu = tglExp - hariIni;
      const sisaHari = Math.ceil(selisihWaktu / (1000 * 60 * 60 * 24));

      let status = "AMAN";
      let warnaBadge = "badge-success";

      if (sisaHari <= 0) {
        status = "KADALUARSA (EXPIRED)";
        warnaBadge = "badge-error";
      } else if (sisaHari <= 30) { // <= 30 hari
        status = "KRITIS (Segera Retur/Obral)";
        warnaBadge = "badge-error";
      } else if (sisaHari <= 90) {
        status = "WASPADA (Diskon Clearance)";
        warnaBadge = "badge-warning";
      }

      return {
        ...batch,
        nama_barang: petaNamaBarang[cleanBarcode] + ` (${cleanBarcode})` || `Tidak Dikenal (${cleanBarcode})`,
        sisa_hari: sisaHari,
        status: status,
        warna_badge: warnaBadge
      };
    }).sort((a, b) => a.sisa_hari - b.sisa_hari);
}

// ==========================================
// HELPER: HITUNG TOTAL STOK LAYAK JUAL (AMAN & WASPADA)
// ==========================================
export function getTotalStokLayakJual(barcodeTarget) {
  const semuaBatch = getBatchStok();
  const hariIni = new Date();
  hariIni.setHours(0, 0, 0, 0);

  let totalLayak = 0;
  for (const b of semuaBatch) {
    if (b.barcode === barcodeTarget && b.stok_sisa > 0) {
      const tglExp = new Date(b.tgl_expired);
      tglExp.setHours(0, 0, 0, 0);
      const selisihHari = Math.ceil((tglExp - hariIni) / (1000 * 60 * 60 * 24));

      // Hanya hitung jika status AMAN atau WASPADA (sisaHari > 30 atau sisaHari >= 0 tergantung kebijakan, di sini sisaHari >= 0 dan bukan Kritis <= 30)
      if (selisihHari > limitJual) { // Sesuai aturan AMAN & WASPADA (> 30 hari)
        totalLayak += b.stok_sisa;
      }
    }
  }
  return totalLayak;
}

// ==========================================
// 8. MANAJEMEN KERANJANG (CART.CSV) DENGAN VALIDASI STOK
// ==========================================
const cartPath = path.join(process.cwd(), 'cart.csv');

function initCartFile() {
  if (!fs.existsSync(cartPath)) {
    fs.writeFileSync(cartPath, 'barcode,jumlah,satuan\n', 'utf-8');
  }
}

export function getCartItems() {
  initCartFile();
  const content = fs.readFileSync(cartPath, 'utf-8');
  const lines = content.trim().split('\n');
  const items = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = line.split(',').map(c => c.replace(/^"|"$/g, ''));
    if (cols.length >= 3) {
      const barcode = cols[0];
      const jumlah = parseInt(cols[1]) || 0;
      const satuan = cols[2];

      const master = getMasterBarangByBarcode(barcode);
      const totalStokSisa = getTotalStokLayakJual(barcode);

      items.push({
        barcode,
        nama_barang: master ? master.nama_barang : `Tidak Dikenal (${barcode})`,
        jumlah,
        satuan,
        isi_per_dus: master ? master.isi_per_dus : 1,
        stok_sisa_layak: totalStokSisa // Dikirim ke frontend untuk batas tombol plus
      });
    }
  }
  return items;
}

export function tambahItemCart(barcodeTarget, jumlahTambah, satuanTarget) {
  initCartFile();
  const barang = getMasterBarangByBarcode(barcodeTarget);
  if (!barang) throw new Error("Barang tidak terdaftar di master!");

  const totalStokLayak = getTotalStokLayakJual(barcodeTarget);
  if (totalStokLayak <= 0) {
    throw new Error(`Stok barang "${barang.nama_barang}" habis atau berstatus Kritis/Expired!`);
  }

  const isiPerDus = barang.isi_per_dus || 1;
  const jumlahTambahPcs = satuanTarget === 'Dus' ? jumlahTambah * isiPerDus : jumlahTambah;

  let items = getCartItems();
  const existing = items.find(i => i.barcode === barcodeTarget && i.satuan === satuanTarget);
  
  let currentQtyPcsInCart = 0;
  if (existing) {
    currentQtyPcsInCart = existing.satuan === 'Dus' ? existing.jumlah * isiPerDus : existing.jumlah;
  }

  const totalRequirementPcs = currentQtyPcsInCart + jumlahTambahPcs;

  if (totalRequirementPcs > totalStokLayak) {
    throw new Error(`Stok tidak mencukupi! Sisa stok layak jual hanya ${totalStokLayak} Pcs.`);
  }

  if (existing) {
    existing.jumlah += jumlahTambah;
  } else {
    items.push({
      barcode: barcodeTarget,
      jumlah: jumlahTambah,
      satuan: satuanTarget
    });
  }

  let content = 'barcode,jumlah,satuan\n';
  for (const item of items) {
    content += `"${item.barcode}",${item.jumlah},"${item.satuan}"\n`;
  }
  fs.writeFileSync(cartPath, content, 'utf-8');
  return getCartItems();
}

export function hapusItemCart(barcodeTarget) {
  initCartFile();
  let items = getCartItems().filter(i => i.barcode !== barcodeTarget);
  
  let content = 'barcode,jumlah,satuan\n';
  for (const item of items) {
    content += `"${item.barcode}",${item.jumlah},"${item.satuan}"\n`;
  }
  fs.writeFileSync(cartPath, content, 'utf-8');
  return getCartItems();
}

export function clearCartCSV() {
  initCartFile();
  fs.writeFileSync(cartPath, 'barcode,jumlah,satuan\n', 'utf-8');
}

// Checkout seluruh isi cart.csv menggunakan Algoritma FEFO
export function checkoutCartFEFO() {
  const items = getCartItems();
  if (items.length === 0) throw new Error("Keranjang belanja masih kosong!");

  const rincianTotal = [];

  for (const item of items) {
    let jumlahPcs = item.jumlah;
    if (item.satuan === 'Dus') {
      jumlahPcs = item.jumlah * item.isi_per_dus;
    }

    const hasil = prosesPenjualanFEFO(item.barcode, jumlahPcs);
    rincianTotal.push({
      barcode: item.barcode,
      nama_barang: item.nama_barang,
      rincian_potong: hasil.rincian
    });
  }

  clearCartCSV();
  return rincianTotal;
}

// ==========================================
// UPDATE KUANTITAS ITEM CART (PLUS / MINUS DENGAN VALIDASI STOK)
// ==========================================
export function updateQtyCartItem(barcodeTarget, delta) {
  initCartFile();
  let items = getCartItems();
  const targetItem = items.find(i => i.barcode === barcodeTarget);

  if (targetItem) {
    const barang = getMasterBarangByBarcode(barcodeTarget);
    const isiPerDus = barang ? barang.isi_per_dus || 1 : 1;
    const totalStokLayak = getTotalStokLayakJual(barcodeTarget);

    const newJumlah = targetItem.jumlah + delta;
    const newJumlahPcs = targetItem.satuan === 'Dus' ? newJumlah * isiPerDus : newJumlah;

    if (delta > 0 && newJumlahPcs > totalStokLayak) {
      throw new Error(`Mencapai batas stok sisa! Stok layak jual tersedia: ${totalStokLayak} Pcs.`);
    }

    targetItem.jumlah = newJumlah;
  }

  // Filter out item yang jumlahnya <= 0
  items = items.filter(i => i.jumlah > 0);

  let content = 'barcode,jumlah,satuan\n';
  for (const item of items) {
    content += `"${item.barcode}",${item.jumlah},"${item.satuan}"\n`;
  }
  fs.writeFileSync(cartPath, content, 'utf-8');
  return getCartItems();
}

// ==========================================
// UPDATE KUANTITAS EKSAK (DIRECT EDIT)
// ==========================================
export function updateExactQtyCartItem(barcodeTarget, exactJumlah) {
  initCartFile();
  let items = getCartItems();
  const targetItem = items.find(i => i.barcode === barcodeTarget);

  if (targetItem) {
    const barang = getMasterBarangByBarcode(barcodeTarget);
    const isiPerDus = barang ? barang.isi_per_dus || 1 : 1;
    const totalStokLayak = getTotalStokLayakJual(barcodeTarget);

    const newJumlah = parseInt(exactJumlah) || 1;
    if (newJumlah <= 0) {
      return hapusItemCart(barcodeTarget);
    }

    const newJumlahPcs = targetItem.satuan === 'Dus' ? newJumlah * isiPerDus : newJumlah;

    if (newJumlahPcs > totalStokLayak) {
      throw new Error(`Kuantitas melebihi stok sisa! Stok layak jual tersedia: ${totalStokLayak} Pcs.`);
    }

    targetItem.jumlah = newJumlah;
  }

  items = items.filter(i => i.jumlah > 0);

  let content = 'barcode,jumlah,satuan\n';
  for (const item of items) {
    content += `"${item.barcode}",${item.jumlah},"${item.satuan}"\n`;
  }
  fs.writeFileSync(cartPath, content, 'utf-8');
  return getCartItems();
}