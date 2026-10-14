// app/admin/ala-carte/AlaCarteClient.js
"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Users, Eye, EyeOff } from "lucide-react";
import {
  createAlaCarteAction, updateAlaCarteAction,
  setAlaCarteActiveAction, deleteAlaCarteAction,
} from "@/app/actions/admin";
import { useFormAction } from "@/app/hooks/useFormAction";
import { useMounted } from "@/app/hooks/useMounted";

const rupiah = (n) => "Rp " + new Intl.NumberFormat("id-ID").format(Number(n) || 0);

function FormModal({ item, mode, divisions, onClose }) {
  const mounted = useMounted();
  const action = mode === "edit"
    ? updateAlaCarteAction.bind(null, item.id)
    : createAlaCarteAction;

  const { handleSubmit, pending, error } = useFormAction(action, () => {
    toast.success(mode === "edit" ? "Ala Carte diperbarui!" : "Ala Carte ditambahkan!");
    onClose();
  });

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-y-auto card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-rajdhani text-xl font-bold text-white">
            {mode === "edit" ? "Edit Ala Carte" : "Tambah Ala Carte"}
          </h2>
          <button type="button" onClick={onClose} className="flex size-10 items-center justify-center rounded-lg text-slate-500 hover:text-white" aria-label="Tutup">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Divisi</label>
            <select name="division_id" className="field" defaultValue={item?.division_id || ""} required>
              <option value="" disabled>Pilih divisi…</option>
              {divisions.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Nama Paket (Opsional)</label>
              <input name="name" className="field" placeholder="Mis: Patroli Tambahan" defaultValue={item?.name} />
            </div>
            <div>
              <label className="label">Urutan</label>
              <input name="sort_order" type="number" className="field" defaultValue={item?.sort_order ?? 0} />
            </div>
          </div>

          <div>
            <label className="label">Harga (Rp)</label>
            <input name="price_idr" type="number" min="0" className="field" placeholder="0" defaultValue={item?.price_idr ?? 0} />
          </div>

          <div>
            <label className="label">Deskripsi</label>
            <textarea name="description" className="field min-h-[90px] resize-y" placeholder="Keterangan paket…" defaultValue={item?.description} />
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" name="is_active" defaultChecked={item ? item.is_active : true} className="size-4 rounded border-line bg-black/40" />
            Tampilkan di Beranda
          </label>

          {error && <p className="text-sm text-crimson-400">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={pending} className="btn btn-primary flex-1">
              {pending && <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
              {pending ? "Menyimpan…" : mode === "edit" ? "Simpan Perubahan" : "Tambah"}
            </button>
            <button type="button" onClick={onClose} className="btn btn-ghost">Batal</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

function ItemCard({ item, divisions, onRefresh }) {
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);

  const toggle = async () => {
    setBusy(true);
    const res = await setAlaCarteActiveAction(item.id, !item.is_active);
    setBusy(false);
    if (res?.error) toast.error(res.error);
    else onRefresh();
  };

  const remove = async () => {
    if (!confirm(`Hapus paket "${item.name || item.division_name}"?`)) return;
    setBusy(true);
    const res = await deleteAlaCarteAction(item.id);
    setBusy(false);
    if (res?.error) toast.error(res.error);
    else onRefresh();
  };

  return (
    <div className="card flex flex-col p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
            {item.division_tag} · {item.id}
          </span>
          <h3 className="truncate font-rajdhani text-lg font-bold text-white">
            {item.name || item.division_name}
          </h3>
        </div>
        <span className={`rounded border px-2 py-0.5 font-mono text-[10px] tracking-[0.1em] ${
          item.is_active
            ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
            : "border-amber-500/25 bg-amber-500/10 text-amber-400"
        }`}>
          {item.is_active ? "AKTIF" : "NONAKTIF"}
        </span>
      </div>

      <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-400">
        <Users className="size-3.5 text-crimson-400" />
        {item.player_count} personil
      </p>
      <p className="mt-3 font-orbitron text-lg font-bold text-white">{rupiah(item.price_idr)}</p>
      {item.description && (
        <p className="mt-2 flex-1 text-sm text-slate-500 line-clamp-3">{item.description}</p>
      )}

      <div className="mt-4 flex gap-2 border-t border-line pt-4">
        <button type="button" onClick={toggle} disabled={busy} className="btn btn-ghost btn-sm flex-1">
          {item.is_active ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          {item.is_active ? "Sembunyikan" : "Tampilkan"}
        </button>
        <button type="button" onClick={() => setEditing(true)} className="btn btn-ghost btn-sm flex-1">
          <Pencil className="size-3.5" /> Edit
        </button>
        <button type="button" onClick={remove} disabled={busy} className="flex size-10 items-center justify-center rounded-lg text-slate-500 hover:bg-crimson-500/10 hover:text-crimson-400" aria-label="Hapus">
          <Trash2 className="size-4" />
        </button>
      </div>

      {editing && (
        <FormModal item={item} mode="edit" divisions={divisions} onClose={() => setEditing(false)} />
      )}
    </div>
  );
}

export default function AlaCarteClient({ items = [], divisions = [] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-6">
      <button type="button" onClick={() => setCreating(true)} className="btn btn-primary">
        <Plus className="size-4" /> Tambah Ala Carte
      </button>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">Belum ada paket Ala Carte. Tambahkan satu untuk ditampilkan di Beranda.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} divisions={divisions} onRefresh={() => router.refresh()} />
          ))}
        </div>
      )}

      {creating && (
        <FormModal mode="create" divisions={divisions} onClose={() => setCreating(false)} />
      )}
    </div>
  );
}
