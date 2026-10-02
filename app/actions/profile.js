"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { updateOfficerPersonal, updateUserPassword, getUserById } from "@/lib/queries";
import bcrypt from "bcryptjs";

export async function updatePersonalAction(prevState, formData) {
  const session = await requireAuth();
  
  const officer_id = formData.get("officer_id");
  if (session.officer_id !== officer_id) {
    return { error: "Akses ditolak." };
  }

  const data = {
    full_name: formData.get("full_name"),
    callsign: formData.get("callsign"),
    rank: formData.getAll("rank").join(", "),
    division: formData.get("division"),
    gender: formData.get("gender"),
    unit_task: formData.get("unit_task"),
    notes: formData.get("notes"),
  };

  try {
    await updateOfficerPersonal(officer_id, data);
    revalidatePath("/profile");
    revalidatePath("/absensi");
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}

export async function updatePasswordAction(prevState, formData) {
  const session = await requireAuth();
  
  const old_password = formData.get("old_password");
  const new_password = formData.get("new_password");
  const confirm_password = formData.get("confirm_password");

  if (!old_password || !new_password || !confirm_password) {
    return { error: "Semua kolom password wajib diisi." };
  }

  if (new_password !== confirm_password) {
    return { error: "Konfirmasi password baru tidak cocok." };
  }

  if (new_password.length < 6) {
    return { error: "Password baru minimal 6 karakter." };
  }

  try {
    const user = await getUserById(session.id);
    if (!user) return { error: "User tidak ditemukan." };

    const isValid = await bcrypt.compare(old_password, user.password_hash);
    if (!isValid) {
      await new Promise((r) => setTimeout(r, 1000));
      return { error: "Password lama salah." };
    }

    const newHash = await bcrypt.hash(new_password, 10);
    await updateUserPassword(session.id, newHash);
    
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}
