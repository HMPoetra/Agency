// app/actions/attendance.js
"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { createAttendance, checkoutAttendance, getTodayAttendance } from "@/lib/queries";

export async function checkInAction(payload) {
  let note = "";
  if (payload instanceof FormData) {
    note = payload.get("note")?.toString() || "";
  } else if (typeof payload === "string") {
    note = payload;
  }

  const session = await requireAuth();
  const officerId = session.officer_id;
  if (!officerId) return { error: "Akun ini tidak terhubung ke personil manapun." };

  // Cegah check-in ganda di hari yang sama
  const existing = await getTodayAttendance(officerId);
  if (existing && !existing.checked_out_at) {
    return { error: "Kamu sudah check-in hari ini dan belum check-out." };
  }

  const record = await createAttendance(officerId, note);
  revalidatePath("/absensi");
  return { success: true, record };
}

export async function checkOutAction(attendanceId) {
  await requireAuth();
  const record = await checkoutAttendance(attendanceId);
  if (!record) return { error: "Record absensi tidak ditemukan atau sudah check-out." };
  revalidatePath("/absensi");
  return { success: true, record };
}
