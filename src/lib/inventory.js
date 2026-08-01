// src/lib/inventory.js
import fs from 'fs';
import path from 'path';

const masterBarangPath = path.join(process.cwd(), 'master_barang.csv');
const batchStokPath = path.join(process.cwd(), 'batch_stok.csv');

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
// 5. UPDATE / SIMPAN KEMBALI FILE BATCH (Simulasi Database Save)
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
// 6. ALGORITMA UTAMA KASIR: PEMOTONGAN FEFO
// ==========================================
export function prosesPenjualanFEFO(barcodeTarget, jumlahBeliPcs) {
  const hariIni = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  const semuaBatch = getBatchStok();

  // 1. Filter batch yang sesuai barcode, stok > 0, dan belum expired
  let batchValid = semuaBatch.filter(b => 
    b.barcode === barcodeTarget && 
    b.stok_sisa > 0 && 
    b.tgl_expired >= hariIni
  );

  // 2. Sortir FEFO: Dari tgl_expired PALING DEKAT (paling awal) ke PALING LAMA
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
    throw new Error(`Stok tidak mencukupi! Kekurangan ${sisaKebutuhan} Pcs (Stok expired telah diabaikan).`);
  }

  // 4. Update kembali file CSV utama dengan data stok terbaru
  // Map perubahan ke array utama
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

  return semuaBatch
    .filter(batch => batch.stok_sisa > 0) // <-- HANYA TAMPILKAN BATCH YANG STOKNYA MASIH ADA (> 0)
    .map(batch => {
      const cleanBarcode = batch.barcode ? batch.barcode.trim() : "";
      const tglExp = new Date(batch.tgl_expired);
      const selisihWaktu = tglExp - hariIni;
      const sisaHari = Math.ceil(selisihWaktu / (1000 * 60 * 60 * 24));

      let status = "AMAN";
      let warnaBadge = "badge-success";

      if (sisaHari <= 0) {
        status = "KADALUARSA (EXPIRED)";
        warnaBadge = "badge-error";
      } else if (sisaHari <= 30) {
        status = "KRITIS (Segera Retur/Obral)";
        warnaBadge = "badge-error";
      } else if (sisaHari <= 90) {
        status = "WASPADA (Diskon Clearance)";
        warnaBadge = "badge-warning";
      }

      return {
        ...batch,
        nama_barang: petaNamaBarang[cleanBarcode] || `Tidak Dikenal (${cleanBarcode})`,
        sisa_hari: sisaHari,
        status: status,
        warna_badge: warnaBadge
      };
    }).sort((a, b) => a.sisa_hari - b.sisa_hari);
}