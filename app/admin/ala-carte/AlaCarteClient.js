// app/admin/ala-carte/AlaCarteClient.js
"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Eye, EyeOff, Star, Inbox } from "lucide-react";
import {
  createAlaCarteAction, updateAlaCarteAction,
  setAlaCarteActiveAction, deleteAlaCarteAction,
  createAlaCarteRankAction, updateAlaCarteRankAction,
  setAlaCarteRankActiveAction, deleteAlaCarteRankAction,
  setAlaCarteOrderStatusAction, deleteAlaCarteOrderAction,
} from "@/app/actions/admin";
import { useFormAction } from "@/app/hooks/useFormAction";
import { useMounted } from "@/app/hooks/useMounted";

const rupiah = (n) => "Rp " + new Intl.NumberFormat("id-ID").format(Number(n) || 0);

function Modal({ title, onClose, children }) {
  const mounted = useMounted();
  if (!mounted) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-y-auto card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-rajdhani text-xl font-bold text-white">{title}</h2>
          <button type="button" onClick={onClose} className="flex size-10 items-center justify-center rounded-lg text-slate-500 hover:text-white" aria-label="Tutup">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

/* ── Form harga per divisi ── */
function DivisionFormModal({ item, mode, divisions, onClose }) {
  const action = mode === "edit"
    ? updateAlaCarteAction.bind(null, item.id)
    : createAlaCarteAction;

  const { handleSubmit, pending, error } = useFormAction(action, () => {
    toast.success(mode === "edit" ? "Harga divisi diperbarui!" : "Harga divisi ditambahkan!");
    onClose();
  });

  return (
    <Modal onClose={onClose} title={mode === "edit" ? "Edit Harga Divisi" : "Tambah Harga Divisi"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Divisi (opsional)</label>
            <select name="division_id" className="field" defaultValue={item?.division_id || ""}>
              <option value="">— Tanpa divisi (pakai judul kustom) —</option>
              {divisions.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Harga Dasar Divisi (Rp)</label>
              <input name="price_idr" type="number" min="0" className="field" placeholder="0" defaultValue={item?.price_idr ?? 0} />
            </div>
            <div>
              <label className="label">Harga per Orang (Rp)</label>
              <input name="price_per_person" type="number" min="0" className="field" placeholder="0" defaultValue={item?.price_per_person ?? 0} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Judul / Nama Paket</label>
              <input name="name" className="field" placeholder="cth. Paket VIP Escort" defaultValue={item?.name} />
            </div>
            <div>
              <label className="label">Urutan</label>
              <input name="sort_order" type="number" className="field" defaultValue={item?.sort_order ?? 0} />
            </div>
          </div>
          <p className="-mt-2 text-xs text-slate-500">
            Wajib salah satu: pilih divisi <span className="text-slate-600">atau</span> isi judul kustom.
          </p>

        <div>
          <label className="label">Deskripsi (opsional)</label>
          <textarea name="description" className="field min-h-[90px] resize-y" placeholder="Keterangan tambahan…" defaultValue={item?.description} />
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
    </Modal>
  );
}

function DivisionCard({ item, divisions, onRefresh }) {
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
    if (!confirm(`Hapus harga divisi "${item.name || item.division_name}"?`)) return;
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
            {item.division_tag || item.division_id || "KUSTOM"} · {item.id}
          </span>
          <h3 className="truncate font-rajdhani text-lg font-bold text-white">
            {item.name || item.division_name || item.id}
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

      <dl className="mt-3 space-y-1.5 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-400">Harga dasar divisi</dt>
          <dd className="font-mono text-white">{rupiah(item.price_idr)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-400">Harga per orang</dt>
          <dd className="font-mono text-white">{rupiah(item.price_per_person)}</dd>
        </div>
      </dl>

      {item.description && (
        <p className="mt-3 text-sm leading-relaxed text-slate-400">{item.description}</p>
      )}

      <div className="mt-4 flex gap-2 pt-1">
        <button type="button" onClick={toggle} disabled={busy} className="btn btn-ghost btn-sm flex-1">
          {item.is_active ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          <span className="hidden sm:inline">{item.is_active ? "Sembunyikan" : "Tampilkan"}</span>
        </button>
        <button type="button" onClick={() => setEditing(true)} className="btn btn-ghost btn-sm flex-1">
          <Pencil className="size-3.5" /> Edit
        </button>
        <button type="button" onClick={remove} disabled={busy} className="flex size-10 items-center justify-center rounded-lg text-slate-500 hover:bg-crimson-500/10 hover:text-crimson-400" aria-label="Hapus">
          <Trash2 className="size-4" />
        </button>
      </div>

      {editing && (
        <DivisionFormModal item={item} mode="edit" divisions={divisions} onClose={() => setEditing(false)} />
      )}
    </div>
  );
}

/* ── Form harga jabatan ── */
function RankFormModal({ rank, mode, onClose }) {
  const action = mode === "edit"
    ? updateAlaCarteRankAction.bind(null, rank.id)
    : createAlaCarteRankAction;

  const { handleSubmit, pending, error } = useFormAction(action, () => {
    toast.success(mode === "edit" ? "Jabatan diperbarui!" : "Jabatan ditambahkan!");
    onClose();
  });

  return (
    <Modal onClose={onClose} title={mode === "edit" ? "Edit Jabatan" : "Tambah Jabatan"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Nama Jabatan</label>
          <input name="name" className="field" placeholder="cth. High Command" defaultValue={rank?.name} required />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Harga (Rp)</label>
            <input name="price_idr" type="number" min="0" className="field" placeholder="0" defaultValue={rank?.price_idr ?? 0} />
          </div>
          <div>
            <label className="label">Urutan</label>
            <input name="sort_order" type="number" className="field" defaultValue={rank?.sort_order ?? 0} />
          </div>
        </div>

        <div>
          <label className="label">Deskripsi (opsional)</label>
          <textarea name="description" className="field min-h-[90px] resize-y" placeholder="Keterangan tambahan…" defaultValue={rank?.description} />
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" name="is_active" defaultChecked={rank ? rank.is_active : true} className="size-4 rounded border-line bg-black/40" />
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
    </Modal>
  );
}

function RankRow({ rank, onRefresh }) {
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);

  const toggle = async () => {
    setBusy(true);
    const res = await setAlaCarteRankActiveAction(rank.id, !rank.is_active);
    setBusy(false);
    if (res?.error) toast.error(res.error);
    else onRefresh();
  };

  const remove = async () => {
    if (!confirm(`Hapus jabatan "${rank.name}"?`)) return;
    setBusy(true);
    const res = await deleteAlaCarteRankAction(rank.id);
    setBusy(false);
    if (res?.error) toast.error(res.error);
    else onRefresh();
  };

  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-line px-4 py-3">
      <div className="min-w-0">
        <p className="flex items-center gap-2 truncate font-rajdhani font-bold text-white">
          {rank.name}
          {!rank.is_active && (
            <span className="rounded border border-amber-500/25 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10px] tracking-[0.1em] text-amber-400">
              NONAKTIF
            </span>
          )}
        </p>
        <p className="font-mono text-sm text-slate-400">{rupiah(rank.price_idr)}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button type="button" onClick={toggle} disabled={busy} className="flex size-10 items-center justify-center rounded-lg text-slate-500 hover:text-white" aria-label={rank.is_active ? "Sembunyikan" : "Tampilkan"}>
          {rank.is_active ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
        <button type="button" onClick={() => setEditing(true)} className="flex size-10 items-center justify-center rounded-lg text-slate-500 hover:text-white" aria-label="Edit">
          <Pencil className="size-4" />
        </button>
        <button type="button" onClick={remove} disabled={busy} className="flex size-10 items-center justify-center rounded-lg text-slate-500 hover:bg-crimson-500/10 hover:text-crimson-400" aria-label="Hapus">
          <Trash2 className="size-4" />
        </button>
      </div>

      {editing && <RankFormModal rank={rank} mode="edit" onClose={() => setEditing(false)} />}
    </li>
  );
}

/* ── Order Ala Carte dari Beranda ── */
const ORDER_STATUS = {
  pending: { label: "Baru", cls: "border-amber-500/25 bg-amber-500/10 text-amber-400" },
  proses: { label: "Diproses", cls: "border-sky-500/25 bg-sky-500/10 text-sky-400" },
  selesai: { label: "Selesai", cls: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400" },
  batal: { label: "Batal", cls: "border-line bg-white/5 text-slate-400" },
};

function OrderCard({ order, onRefresh }) {
  const [busy, setBusy] = useState(false);
  const divisions = Array.isArray(order.divisions) ? order.divisions : [];
  const ranks = Array.isArray(order.ranks) ? order.ranks : [];
  const status = ORDER_STATUS[order.status] ?? ORDER_STATUS.pending;
  const created = order.created_at
    ? new Date(order.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })
    : "";

  const change = async (next) => {
    setBusy(true);
    const res = await setAlaCarteOrderStatusAction(order.id, next);
    setBusy(false);
    if (res?.error) toast.error(res.error);
    else onRefresh();
  };

  const remove = async () => {
    if (!confirm(`Hapus order ${order.id} (${order.server_name})?`)) return;
    setBusy(true);
    const res = await deleteAlaCarteOrderAction(order.id);
    setBusy(false);
    if (res?.error) toast.error(res.error);
    else onRefresh();
  };

  return (
    <div className="card flex flex-col p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
            {order.id} · {created}
          </span>
          <h3 className="truncate font-rajdhani text-lg font-bold text-white">
            {order.server_name}
          </h3>
        </div>
        <span className={`shrink-0 rounded border px-2 py-0.5 font-mono text-[10px] tracking-[0.1em] ${status.cls}`}>
          {status.label.toUpperCase()}
        </span>
      </div>

      <ul className="mt-3 space-y-1.5 text-sm">
        {divisions.map((d, i) => (
          <li key={`d${i}`} className="flex items-center justify-between gap-3">
            <span className="text-slate-400">
              {d.name} <span className="text-slate-500">× {d.qty} orang</span>
            </span>
            <span className="font-mono text-slate-200">{rupiah(d.subtotal)}</span>
          </li>
        ))}
        {ranks.map((r, i) => (
          <li key={`r${i}`} className="flex items-center justify-between gap-3">
            <span className="text-slate-400">{r.name}</span>
            <span className="font-mono text-slate-200">{rupiah(r.price)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
        <span className="text-xs uppercase tracking-[0.12em] text-slate-500">Total</span>
        <span className="font-orbitron font-bold text-white">{rupiah(order.total_idr)}</span>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <select
          value={order.status}
          onChange={(e) => change(e.target.value)}
          disabled={busy}
          aria-label="Status order"
          className="flex-1 rounded-lg border border-line bg-black/40 px-3 py-2 text-sm text-slate-200"
        >
          {Object.entries(ORDER_STATUS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <button type="button" onClick={remove} disabled={busy} className="flex size-10 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-crimson-500/10 hover:text-crimson-400" aria-label="Hapus order">
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  );
}

export default function AlaCarteClient({ items = [], divisions = [], ranks = [], orders = [] }) {
  const router = useRouter();
  const [creatingDivision, setCreatingDivision] = useState(false);
  const [creatingRank, setCreatingRank] = useState(false);
  const refresh = () => router.refresh();

  return (
    <div className="space-y-10">
      {/* Pesanan masuk */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-rajdhani text-lg font-bold text-white">
            <Inbox className="size-4 text-crimson-400" /> Pesanan Masuk
          </h2>
          <span className="font-mono text-xs text-slate-500">{orders.length} order</span>
        </div>

        {orders.length === 0 ? (
          <p className="text-sm text-slate-500">
            Belum ada order. Order dari kalkulator Beranda akan muncul di sini.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} onRefresh={refresh} />
            ))}
          </div>
        )}
      </section>

      {/* Harga per divisi */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-rajdhani text-lg font-bold text-white">Harga Divisi</h2>
          <button type="button" onClick={() => setCreatingDivision(true)} className="btn btn-primary btn-sm">
            <Plus className="size-4" /> Tambah Divisi
          </button>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-slate-500">
            Belum ada harga divisi. Tambahkan agar muncul di kalkulator Beranda.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <DivisionCard key={item.id} item={item} divisions={divisions} onRefresh={refresh} />
            ))}
          </div>
        )}
      </section>

      {/* Harga jabatan */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-rajdhani text-lg font-bold text-white">
            <Star className="size-4 text-crimson-400" /> Harga Jabatan
          </h2>
          <button type="button" onClick={() => setCreatingRank(true)} className="btn btn-primary btn-sm">
            <Plus className="size-4" /> Tambah Jabatan
          </button>
        </div>
        <p className="mb-4 max-w-2xl text-sm text-slate-400">
          Biaya tambahan saat pelanggan meminta jabatan tertentu, mis. High Command.
        </p>

        {ranks.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada jabatan berharga.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {ranks.map((rank) => (
              <RankRow key={rank.id} rank={rank} onRefresh={refresh} />
            ))}
          </ul>
        )}
      </section>

      {creatingDivision && (
        <DivisionFormModal mode="create" divisions={divisions} onClose={() => setCreatingDivision(false)} />
      )}
      {creatingRank && (
        <RankFormModal mode="create" onClose={() => setCreatingRank(false)} />
      )}
    </div>
  );
}
