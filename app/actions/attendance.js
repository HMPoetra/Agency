// app/actions/attendance.js
"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { createAttendance, checkoutAttendance, getTodayAttendance } from "@/lib/queries";

export async function checkInAction(prevStateOrPayload, maybeFormData) {
  let note = "";
  let server = "";

  const formData = (maybeFormData instanceof FormData)
    ? maybeFormData
    : (prevStateOrPayload instanceof FormData)
      ? prevStateOrPayload
      : null;

  if (formData) {
    server = (formData.get("server") || "").toString().trim();
    note = (formData.get("note") || "").toString().trim();
  } else if (typeof prevStateOrPayload === "string") {
    note = prevStateOrPayload.trim();
  } else if (prevStateOrPayload && typeof prevStateOrPayload === "object") {
    server = (prevStateOrPayload.server || "").toString().trim();
    note = (prevStateOrPayload.note || "").toString().trim();
  }

  const session = await requireAuth();
  const officerId = session.officer_id;
  if (!officerId) return { error: "Akun ini tidak terhubung ke personil manapun." };

  // Cegah check-in ganda di hari yang sama
  const existing = await getTodayAttendance(officerId);
  if (existing && !existing.checked_out_at) {
    return { error: "Kamu sudah check-in hari ini dan belum check-out." };
  }

  const finalNote = server ? (note ? `[${server}] ${note}` : `[${server}]`) : note;

  const record = await createAttendance(officerId, finalNote);
  revalidatePath("/absensi");
  revalidatePath("/admin/attendance");
  return { success: true, record };
}

export async function checkOutAction(attendanceId) {
  await requireAuth();
  const record = await checkoutAttendance(attendanceId);
  if (!record) return { error: "Record absensi tidak ditemukan atau sudah check-out." };
  revalidatePath("/absensi");
  return { success: true, record };
}
