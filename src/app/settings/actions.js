// src/app/settings/actions.js
'use server'

import { saveSettingsToExcel } from "@/lib/excel";
import { revalidatePath } from "next/cache";

export async function updateSettingsAction(prevState, formData) {
  const nama = formData.get("nama");
  const email = formData.get("email");

  // Cek log di terminal VS Code kamu
  console.log("-> Data diterima Server Action:", { nama, email });

  try {
    await saveSettingsToExcel({ nama, email });
    revalidatePath("/settings");

    return { success: true, message: "Berhasil disimpan ke Excel!" };
  } catch (error) {
    console.error("-> Error menyimpan Excel:", error);
    return { success: false, message: "Gagal menyimpan ke Excel. Pastikan file tidak sedang dibuka!" };
  }
}