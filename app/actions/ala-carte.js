// app/actions/ala-carte.js
"use server";

import { revalidatePath } from "next/cache";
import {
  getAlaCarte, getAlaCarteRanks,
  createAlaCarteOrder, nextAlaCarteOrderId,
} from "@/lib/queries";

function parseList(raw) {
  try {
    const v = JSON.parse((raw || "").toString() || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

// Aksi publik: pelanggan menyusun & mengirim order Ala Carte dari Beranda.
export async function createAlaCarteOrderAction(prevState, formData) {
  const serverName = (formData.get("server_name") || "").toString().trim();
  if (serverName.length < 2) return { error: "Nama server wajib diisi." };

  const items = parseList(formData.get("divisions"));
  const rankIds = parseList(formData.get("ranks"));
  if (!items.length) return { error: "Pilih minimal satu divisi." };

  try {
    const [divisions, ranks] = await Promise.all([
      getAlaCarte(),
      getAlaCarteRanks(),
    ]);
    const divMap = new Map(divisions.map((d) => [d.id, d]));
    const rankMap = new Map(ranks.map((r) => [r.id, r]));

    // Harga diambil ulang dari DB agar total tidak bisa dimanipulasi dari klien.
    const snapItems = items
      .map((it) => {
        const d = divMap.get(it?.id);
        if (!d) return null;
        const qty = Math.max(1, Math.min(50, Number(it?.qty) || 1));
        const base = Number(d.price_idr) || 0;
        const per = Number(d.price_per_person) || 0;
        return {
          id: d.id,
          name: d.name || d.division_name || d.id,
          tag: d.division_tag || d.division_id || null,
          qty,
          base_price: base,
          price_per_person: per,
          subtotal: base + per * qty,
        };
      })
      .filter(Boolean);

    if (!snapItems.length) return { error: "Divisi yang dipilih tidak valid." };

    const pickedRanks = rankIds
      .map((id) => rankMap.get(id))
      .filter(Boolean)
      .map((r) => ({ id: r.id, name: r.name, price: Number(r.price_idr) || 0 }));

    const subtotal = snapItems.reduce((s, i) => s + i.subtotal, 0);
    const rankTotal = pickedRanks.reduce((s, r) => s + r.price, 0);
    const total = subtotal + rankTotal;

    const id = await nextAlaCarteOrderId();
    await createAlaCarteOrder({
      id,
      server_name: serverName,
      divisions: snapItems,
      ranks: pickedRanks,
      subtotal,
      total,
    });

    revalidatePath("/admin/ala-carte");
    return { success: true, id };
  } catch (e) {
    return { error: e.message };
  }
}
