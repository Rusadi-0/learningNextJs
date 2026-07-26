// src/lib/excel.js
import fs from 'fs';
import path from 'path';

// Kita gunakan file CSV (Bisa dibuka langsung di Excel)
const filePath = path.join(process.cwd(), 'database.csv');

// Fungsi untuk Inisialisasi Header File jika belum ada
function initFile() {
  if (!fs.existsSync(filePath)) {
    const header = 'Nama,Email,UpdatedAt\n';
    fs.writeFileSync(filePath, header, 'utf-8');
  }
}

// 1. Simpan/Tambah Data Baru (Selalu menambah di baris paling bawah)
export async function saveSettingsToExcel(data) {
  initFile();

  // Bersihkan data dari karakter koma atau karakter aneh agar format CSV tidak rusak
  const cleanNama = `"${(data.nama || '').replace(/"/g, '""')}"`;
  const cleanEmail = `"${(data.email || '').replace(/"/g, '""')}"`;
  const cleanDate = `"${new Date().toLocaleString('id-ID')}"`;

  // Format baris baru
  const newRow = `${cleanNama},${cleanEmail},${cleanDate}\n`;

  // Append: Menambahkan baris secara permanen di akhir file
  fs.appendFileSync(filePath, newRow, 'utf-8');
}

// 2. Baca Data Terakhir dari File
export async function getSettingsFromExcel() {
  if (!fs.existsSync(filePath)) {
    return { nama: '', email: '' };
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.trim().split('\n');

    if (lines.length <= 1) {
      return { nama: '', email: '' }; // Hanya ada header
    }

    // Ambil baris paling terakhir (data terbaru)
    const lastLine = lines[lines.length - 1];
    
    // Parse sederhana dari baris CSV
    const columns = lastLine.split(',').map(col => col.replace(/^"|"$/g, ''));

    return {
      nama: columns[0] || '',
      email: columns[1] || '',
    };
  } catch (error) {
    console.error("Error membaca file:", error);
    return { nama: '', email: '' };
  }
}