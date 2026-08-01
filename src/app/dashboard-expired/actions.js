// src/app/dashboard-expired/actions.js
'use server'

import { getLaporanStatusExpired } from "@/lib/inventory";

export async function fetchLaporanExpired() {
  return getLaporanStatusExpired();
}