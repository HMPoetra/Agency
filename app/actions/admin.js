// app/actions/admin.js
"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  createOfficer, updateOfficer, deleteOfficer, updateOfficerManualMinutes,
  createContract, updateContract, deleteContract,
  createUser, deleteUser,
  updateAttendance, deleteAttendance,
  createRank, deleteRank, createDivision, updateDivision, deleteDivision,
  createPricingTier, updatePricingTier, deletePricingTier,
  createProduct, updateProduct, deleteProduct,
  updateReview, deleteReview, toggleReviewPublish
} from "@/lib/queries";
import { processImageUrl } from "@/lib/upload";

/* ═══════════════════════════
   RANKS & DIVISIONS
═══════════════════════════ */
export async function createRankAction(prevState, formData) {
  await requireAdmin();
  const name = formData.get("name");
  if (!name || name.length < 2) return { error: "Nama pangkat minimal 2 karakter." };
  try {
    await createRank(name);
    revalidatePath("/admin/officers");
    return { success: true };
  } catch (e) {
    return { error: e.message };
  }
}

export async function deleteRankAction(id) {
  await requireAdmin();
  await deleteRank(id);
  revalidatePath("/admin/officers");
}

export async function createDivisionAction(prevState, formData) {
  await requireAdmin();
  const name = formData.get("name");
  const tag = formData.get("tag");
  const description = formData.get("description");
  const photo_url = formData.get("photo_url");
  const is_visible_on_dashboard = formData.get("is_visible_on_dashboard") === "on";
  
  let processed_photo_url = photo_url;
  if (photo_url) processed_photo_url = await processImageUrl(photo_url);

  if (!name || name.length < 2) return { error: "Nama divisi minimal 2 karakter." };
  try {
    await createDivision({ name, tag, description, photo_url: processed_photo_url, is_visible_on_dashboard });
    revalidatePath("/admin/officers");
    revalidatePath("/admin/divisions");
    return { success: true };
  } catch (e) {
    return { error: e.message };
  }
}

export async function updateDivisionAction(id, prevState, formData) {
  await requireAdmin();
  const name = formData.get("name");
  const tag = formData.get("tag");
  const description = formData.get("description");
  const photo_url = formData.get("photo_url");
  const is_visible_on_dashboard = formData.get("is_visible_on_dashboard") === "on";
  
  let processed_photo_url = photo_url;
  if (photo_url) processed_photo_url = await processImageUrl(photo_url);

  if (!name || name.length < 2) return { error: "Nama divisi minimal 2 karakter." };
  try {
    await updateDivision(id, { name, tag, description, photo_url: processed_photo_url, is_visible_on_dashboard });
    revalidatePath("/admin/officers");
    revalidatePath("/admin/divisions");
    return { success: true };
  } catch (e) {
    return { error: e.message };
  }
}

export async function deleteDivisionAction(id) {
  await requireAdmin();
  await deleteDivision(id);
  revalidatePath("/admin/officers");
  revalidatePath("/admin/divisions");
}

/* ═══════════════════════════
   OFFICERS
═══════════════════════════ */
const OfficerSchema = z.object({
  id: z.string().min(3).max(10),
  full_name: z.string().min(3),
  callsign: z.string().min(3),
  rank: z.string().min(2),
  division: z.string().min(2),
  gender: z.string(),
  unit_task: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["Active", "On-Duty", "Standby", "Inactive"]),
});

export async function createOfficerAction(prevState, formData) {
  await requireAdmin();
  const payload = Object.fromEntries(formData);
  payload.rank = formData.getAll("rank").join(", ");
  payload.division = formData.getAll("division").join(", ");
  const parsed = OfficerSchema.omit({ id: true }).safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }
  try {
    const newOfficer = await createOfficer(parsed.data);
    
    // Auto-create user account for this officer
    // Gunakan nama sebagai username (huruf kecil, tanpa spasi)
    const baseUsername = newOfficer.full_name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const password = `${baseUsername}123`;
    const password_hash = await bcrypt.hash(password, 10);
    
    await createUser({
      username: baseUsername,
      password_hash: password_hash,
      role: "officer",
      officer_id: newOfficer.id
    });

    revalidatePath("/admin/officers");
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    return { error: e.message };
  }
}

export async function updateOfficerAction(id, prevState, formData) {
  await requireAdmin();
  const payload = Object.fromEntries(formData);
  payload.rank = formData.getAll("rank").join(", ");
  payload.division = formData.getAll("division").join(", ");
  const parsed = OfficerSchema.omit({ id: true }).safeParse(payload);
  if (!parsed.success) return { error: parsed.error.errors[0].message };
  try {
    await updateOfficer(id, parsed.data);
    revalidatePath("/admin/officers");
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    return { error: e.message };
  }
}

export async function deleteOfficerAction(id) {
  await requireAdmin();
  await deleteOfficer(id);
  revalidatePath("/admin/officers");
  revalidatePath("/");
}

export async function updateManualTimeAction(id, manualHours, manualMinutes) {
  await requireAdmin();
  try {
    const totalMinutes = (parseInt(manualHours, 10) || 0) * 60 + (parseInt(manualMinutes, 10) || 0);
    await updateOfficerManualMinutes(id, totalMinutes);
    revalidatePath("/absensi");
    revalidatePath("/admin/attendance");
    return { success: true };
  } catch (e) {
    return { error: e.message };
  }
}

/* ═══════════════════════════
   CONTRACTS
═══════════════════════════ */
const ContractSchema = z.object({
  mou_code: z.string().min(3),
  server_name: z.string().min(3),
  status: z.enum(["Active", "Pending", "Expired", "Terminated"]),
  detail: z.string().optional(),
  personnel_count: z.coerce.number().int().min(1).optional(),
  signed_at: z.string().optional(),
  photo_url: z.string().optional(),
});

export async function createContractAction(prevState, formData) {
  await requireAdmin();
  const parsed = ContractSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0].message };
  try {
    const data = { ...parsed.data };
    if (data.photo_url) {
      data.photo_url = await processImageUrl(data.photo_url);
    }
    await createContract(data);
    revalidatePath("/admin/contracts");
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    return { error: e.message };
  }
}

export async function updateContractAction(id, prevState, formData) {
  await requireAdmin();
  const parsed = ContractSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0].message };
  try {
    const data = { ...parsed.data };
    if (data.photo_url) {
      data.photo_url = await processImageUrl(data.photo_url);
    }
    await updateContract(id, data);
    revalidatePath("/admin/contracts");
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    return { error: e.message };
  }
}

export async function deleteContractAction(id) {
  await requireAdmin();
  await deleteContract(id);
  revalidatePath("/admin/contracts");
  revalidatePath("/");
}

export async function createPricingAction(prevState, formData) {
  await requireAdmin();
  const name = formData.get("name");
  const price_idr = parseInt(formData.get("price_idr")) || 0;
  const featuresStr = formData.get("features");
  const features = featuresStr ? featuresStr.split('\n').map(f => f.trim()).filter(Boolean) : [];

  if (!name) return { error: "Nama paket wajib diisi." };
  try {
    await createPricingTier({
      name,
      tag: formData.get("tag") || null,
      icon_name: formData.get("icon_name") || "Shield",
      price_idr,
      billing_period: formData.get("billing_period") || "Bulan",
      is_popular: formData.get("is_popular") === "on",
      cta_label: formData.get("cta_label") || "Pesan Sekarang",
      sort_order: parseInt(formData.get("sort_order")) || 0,
      features
    });
    revalidatePath("/admin/contracts");
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    return { error: e.message };
  }
}

export async function updatePricingAction(id, prevState, formData) {
  await requireAdmin();
  const name = formData.get("name");
  const price_idr = parseInt(formData.get("price_idr")) || 0;
  const featuresStr = formData.get("features");
  const features = featuresStr ? featuresStr.split('\n').map(f => f.trim()).filter(Boolean) : [];

  if (!name) return { error: "Nama paket wajib diisi." };
  try {
    await updatePricingTier(id, {
      name,
      tag: formData.get("tag") || null,
      icon_name: formData.get("icon_name") || "Shield",
      price_idr,
      billing_period: formData.get("billing_period") || "Bulan",
      is_popular: formData.get("is_popular") === "on",
      cta_label: formData.get("cta_label") || "Pesan Sekarang",
      sort_order: parseInt(formData.get("sort_order")) || 0,
      features
    });
    revalidatePath("/admin/contracts");
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    return { error: e.message };
  }
}

export async function deletePricingAction(id) {
  await requireAdmin();
  await deletePricingTier(id);
  revalidatePath("/admin/contracts");
  revalidatePath("/");
}

/* ═══════════════════════════
   PRODUCTS (Script & Assets)
═══════════════════════════ */
const ProductSchema = z.object({
  title: z.string().min(3),
  category: z.enum(["Script", "MLO", "Clothing", "Vehicle"]),
  description: z.string().optional(),
  price_idr: z.coerce.number().int().min(0),
  photo_urls: z.string().optional(), // We'll store it as JSON string
  video_url: z.string().optional(),
  is_active: z.boolean().default(true),
  features: z.string().optional(), // Comma separated or JSON string
});

export async function createProductAction(prevState, formData) {
  await requireAdmin();
  const parsed = ProductSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    description: formData.get("description"),
    price_idr: formData.get("price_idr"),
    photo_urls: formData.get("photo_urls"),
    video_url: formData.get("video_url"),
    is_active: formData.get("is_active") === "on",
    features: formData.get("features"),
  });
  
  if (!parsed.success) return { error: parsed.error.errors[0].message };
  
  try {
    const data = { ...parsed.data };
    
    // Process features
    data.features = data.features ? data.features.split("\n").map(f => f.trim()).filter(Boolean) : [];
    
    // Process photo urls
    let urls = [];
    if (data.photo_urls) {
      const rawUrls = data.photo_urls.split("\n").map(u => u.trim()).filter(Boolean);
      for (const u of rawUrls) {
        urls.push(await processImageUrl(u));
      }
    }
    data.photo_urls = JSON.stringify(urls);
    
    await createProduct(data);
    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    return { error: e.message };
  }
}

export async function updateProductAction(id, prevState, formData) {
  await requireAdmin();
  const parsed = ProductSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    description: formData.get("description"),
    price_idr: formData.get("price_idr"),
    photo_urls: formData.get("photo_urls"),
    video_url: formData.get("video_url"),
    is_active: formData.get("is_active") === "on",
    features: formData.get("features"),
  });
  
  if (!parsed.success) return { error: parsed.error.errors[0].message };
  
  try {
    const data = { ...parsed.data };
    
    // Process features
    data.features = data.features ? data.features.split("\n").map(f => f.trim()).filter(Boolean) : [];
    
    // Process photo urls
    let urls = [];
    if (data.photo_urls) {
      const rawUrls = data.photo_urls.split("\n").map(u => u.trim()).filter(Boolean);
      for (const u of rawUrls) {
        urls.push(await processImageUrl(u));
      }
    }
    data.photo_urls = JSON.stringify(urls);
    
    await updateProduct(id, data);
    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    return { error: e.message };
  }
}

export async function deleteProductAction(id) {
  await requireAdmin();
  await deleteProduct(id);
  revalidatePath("/admin/products");
  revalidatePath("/");
}

/* ═══════════════════════════
   USERS
═══════════════════════════ */
const UserSchema = z.object({
  username: z.string().min(3).max(40).trim(),
  password: z.string().min(6),
  role: z.enum(["admin", "user"]),
  officer_id: z.string().optional().nullable(),
});

export async function createUserAction(prevState, formData) {
  await requireAdmin();
  const parsed = UserSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const { username, password, role, officer_id } = parsed.data;
  const hash = await bcrypt.hash(password, 12);
  try {
    await createUser({
      username,
      password_hash: hash,
      role,
      officer_id: officer_id || null,
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (e) {
    if (e.message.includes("unique")) return { error: "Username sudah dipakai." };
    return { error: e.message };
  }
}

export async function deleteUserAction(id) {
  await requireAdmin();
  await deleteUser(id);
  revalidatePath("/admin/users");
}

/* ═══════════════════════════
   ATTENDANCE
═══════════════════════════ */
export async function updateAttendanceAction(prevState, formData) {
  await requireAdmin();
  const id = formData.get("id");
  const data = {
    checked_in_at: formData.get("checked_in_at"),
    checked_out_at: formData.get("checked_out_at") || null,
  };
  try {
    await updateAttendance(id, data);
    revalidatePath("/admin/attendance");
    revalidatePath("/absensi"); // also revalidate officer absensi
    return { success: true };
  } catch (e) {
    return { error: e.message };
  }
}

export async function deleteAttendanceAction(id) {
  await requireAdmin();
  await deleteAttendance(id);
  revalidatePath("/admin/attendance");
  revalidatePath("/absensi");
}

/* ═══════════════════════════
   REVIEWS (Rating & Pesan)
═══════════════════════════ */
export async function updateReviewAction(id, prevState, formData) {
  await requireAdmin();
  try {
    const data = {
      name_server: formData.get("name_server"),
      rating: parseInt(formData.get("rating"), 10),
      message: formData.get("message"),
      is_published: formData.get("is_published") === "on",
    };
    
    await updateReview(id, data);
    revalidatePath("/admin/reviews");
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    return { error: e.message };
  }
}

export async function deleteReviewAction(id) {
  await requireAdmin();
  await deleteReview(id);
  revalidatePath("/admin/reviews");
  revalidatePath("/");
}

export async function toggleReviewPublishAction(id, is_published) {
  await requireAdmin();
  await toggleReviewPublish(id, is_published);
  revalidatePath("/admin/reviews");
  revalidatePath("/");
}
