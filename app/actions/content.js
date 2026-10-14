"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import {
  createContent, updateContent, setContentActive, deleteContent, getContentById,
} from "@/lib/queries";

const CATEGORIES = ["Live", "Clip", "Konten"];

function revalidateContent() {
  revalidatePath("/content");
  revalidatePath("/admin/content");
  revalidatePath("/");
}

function canManage(session, record) {
  return session.role === "admin" || record.officer_id === session.officer_id;
}

function normalize(formData) {
  const url = (formData.get("url") || "").trim();
  const title = (formData.get("title") || "").trim();
  const category = CATEGORIES.includes(formData.get("category")) ? formData.get("category") : "Konten";
  return { url, title, category };
}

export async function createContentAction(prevState, formData) {
  const session = await requireAuth();

  // Admin boleh upload sebagai "umum" (tanpa personil) atau memilih personil.
  // User biasa wajib terhubung ke personil.
  let officerId;
  if (session.role === "admin") {
    officerId = formData.get("officer_id") || null;
  } else {
    if (!session.officer_id) {
      return { error: "Akun ini belum terhubung ke personil. Hubungi Admin." };
    }
    officerId = session.officer_id;
  }

  const { url, title, category } = normalize(formData);
  if (!url) return { error: "Link wajib diisi." };

  try {
    await createContent({ officer_id: officerId, title, url, category, is_active: true });
    revalidateContent();
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}

export async function updateContentAction(prevState, formData) {
  const session = await requireAuth();
  const id = formData.get("id");
  const record = id ? await getContentById(id) : null;
  if (!record) return { error: "Konten tidak ditemukan." };
  if (!canManage(session, record)) return { error: "Akses ditolak." };

  const { url, title, category } = normalize(formData);
  if (!url) return { error: "Link wajib diisi." };

  // Admin boleh mengganti/mengosongkan pemilik content.
  const officerId = session.role === "admin" && formData.has("officer_id")
    ? formData.get("officer_id") || null
    : record.officer_id;

  try {
    await updateContent(id, { title, url, category, is_active: record.is_active, officer_id: officerId });
    revalidateContent();
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}

export async function setContentActiveAction(id, isActive) {
  const session = await requireAuth();
  const record = await getContentById(id);
  if (!record) return { error: "Konten tidak ditemukan." };
  if (!canManage(session, record)) return { error: "Akses ditolak." };

  try {
    await setContentActive(id, isActive);
    revalidateContent();
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}

export async function deleteContentAction(id) {
  const session = await requireAuth();
  const record = await getContentById(id);
  if (!record) return { error: "Konten tidak ditemukan." };
  if (!canManage(session, record)) return { error: "Akses ditolak." };

  try {
    await deleteContent(id);
    revalidateContent();
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}
