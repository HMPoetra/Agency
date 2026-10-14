// app/components/ContentClient.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createContentAction, updateContentAction, setContentActiveAction, deleteContentAction,
} from "@/app/actions/content";
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Radio, Film, Clapperboard, ExternalLink, Check, X,
} from "lucide-react";

const CATEGORIES = ["Live", "Clip", "Konten"];
const FILTERS = ["Semua", ...CATEGORIES];

const catMeta = {
  Live:   { icon: Radio,        tone: "border-crimson-500/30 bg-crimson-500/10 text-crimson-400" },
  Clip:   { icon: Clapperboard, tone: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
  Konten: { icon: Film,         tone: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" },
};

function CategoryBadge({ category }) {
  const meta = catMeta[category] ?? catMeta.Konten;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] ${meta.tone}`}>
      <Icon className="size-3" />
      {category}
    </span>
  );
}

function AddContentForm({ isAdmin = false, officers = [] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("Live");
  const [officerId, setOfficerId] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setPending(true);
    const fd = new FormData();
    fd.set("title", title);
    fd.set("url", url);
    fd.set("category", category);
    if (isAdmin) fd.set("officer_id", officerId);
    const res = await createContentAction(null, fd);
    setPending(false);
    if (res?.error) { setError(res.error); return; }
    setError("");
    setTitle(""); setUrl(""); setCategory("Live"); setOfficerId("");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="card space-y-4 p-6">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg border border-crimson-500/30 bg-crimson-500/10 text-crimson-400">
          <Plus className="size-4" />
        </span>
        <h2 className="font-rajdhani text-xl font-bold text-white">Tambah Content</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Judul (opsional)</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Mis. Live Patrol Malam" className="field" />
        </div>
        <div>
          <label className="label">Kategori</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="field">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className={isAdmin ? "grid gap-4 sm:grid-cols-2" : ""}>
        <div>
          <label className="label">Link (YouTube / TikTok / lainnya)</label>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="field" />
        </div>
        {isAdmin && (
          <div>
            <label className="label">Personil (opsional)</label>
            <select value={officerId} onChange={(e) => setOfficerId(e.target.value)} className="field">
              <option value="">Umum (tanpa personil)</option>
              {officers.map((o) => (
                <option key={o.id} value={o.id}>{o.callsign} — {o.full_name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-crimson-400">{error}</p>}

      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? (
          <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <Plus className="size-4" />
        )}
        Simpan Content
      </button>
    </form>
  );
}

function EditForm({ item, onDone, isAdmin = false, officers = [] }) {
  const router = useRouter();
  const [title, setTitle] = useState(item.title || "");
  const [url, setUrl] = useState(item.url || "");
  const [category, setCategory] = useState(item.category || "Konten");
  const [officerId, setOfficerId] = useState(item.officer_id || "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setPending(true);
    const fd = new FormData();
    fd.set("id", item.id);
    fd.set("title", title);
    fd.set("url", url);
    fd.set("category", category);
    if (isAdmin) fd.set("officer_id", officerId);
    const res = await updateContentAction(null, fd);
    setPending(false);
    if (res?.error) { setError(res.error); return; }
    onDone();
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="mt-4 space-y-3 rounded-lg border border-line bg-black/20 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul" className="field" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="field">
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="field" />
        {isAdmin && (
          <select value={officerId} onChange={(e) => setOfficerId(e.target.value)} className="field">
            <option value="">Umum (tanpa personil)</option>
            {officers.map((o) => (
              <option key={o.id} value={o.id}>{o.callsign} — {o.full_name}</option>
            ))}
          </select>
        )}
      </div>
      {error && <p className="text-sm text-crimson-400">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn btn-primary btn-sm">
          {pending ? <span className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Check className="size-3.5" />}
          Simpan
        </button>
        <button type="button" onClick={onDone} className="btn btn-ghost btn-sm">
          <X className="size-3.5" /> Batal
        </button>
      </div>
    </form>
  );
}

export default function ContentClient({ items = [], isAdmin = false, officers = [] }) {
  const router = useRouter();
  const [filter, setFilter] = useState("Semua");
  const [editingId, setEditingId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const filtered = filter === "Semua" ? items : items.filter((i) => i.category === filter);

  const toggleActive = async (item) => {
    setBusyId(item.id);
    const res = await setContentActiveAction(item.id, !item.is_active);
    setBusyId(null);
    if (res?.error) alert(res.error);
    else router.refresh();
  };

  const remove = async (item) => {
    if (!confirm(`Hapus content "${item.title || item.url}"?`)) return;
    setBusyId(item.id);
    const res = await deleteContentAction(item.id);
    setBusyId(null);
    if (res?.error) alert(res.error);
    else router.refresh();
  };

  return (
    <div className="space-y-6">
      <AddContentForm isAdmin={isAdmin} officers={officers} />

      <div className="card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-rajdhani text-xl font-bold text-white">
            {isAdmin ? "Semua Content" : "Content Saya"}
          </h2>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter kategori">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={`flex min-h-10 items-center rounded-full border px-4 text-xs uppercase tracking-[0.1em] transition-colors ${
                  filter === f
                    ? "border-crimson-500/40 bg-crimson-500/15 text-white"
                    : "border-line text-slate-400 hover:border-line-strong hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-4 border-t border-line pt-4 text-[11px] uppercase tracking-[0.12em] text-slate-500">
          Menampilkan <span className="font-mono text-slate-200">{filtered.length}</span> dari{" "}
          <span className="font-mono">{items.length}</span> content
        </p>

        {filtered.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">Belum ada content pada kategori ini.</p>
        ) : (
          <ul className="mt-6 space-y-3">
            {filtered.map((item) => (
              <li key={item.id} className={`rounded-xl border p-4 transition-colors ${item.is_active ? "border-line bg-white/[0.02]" : "border-line/60 bg-black/20 opacity-70"}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <CategoryBadge category={item.category} />
                      {!item.is_active && (
                        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-slate-500">Non-aktif</span>
                      )}
                    </div>
                    <h3 className="mt-2 truncate font-rajdhani text-lg font-bold text-white">
                      {item.title || item.url}
                    </h3>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex max-w-full items-center gap-1 truncate text-xs text-slate-400 hover:text-crimson-400"
                    >
                      <ExternalLink className="size-3 flex-shrink-0" />
                      <span className="truncate">{item.url}</span>
                    </a>
                    {isAdmin && (
                      <p className="mt-1 font-mono text-[11px] text-slate-600">
                        {item.officer_callsign ? `${item.officer_callsign} • ` : ""}{item.officer_name || "Tanpa personil"}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleActive(item)}
                      disabled={busyId === item.id}
                      className={`btn btn-ghost btn-sm ${item.is_active ? "text-emerald-400" : "text-slate-500"}`}
                      title={item.is_active ? "Non-aktifkan" : "Aktifkan"}
                    >
                      {item.is_active ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                      {item.is_active ? "Aktif" : "Non-aktif"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                      aria-label="Edit content"
                      className="btn btn-ghost btn-sm"
                      title="Edit"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(item)}
                      disabled={busyId === item.id}
                      className="btn btn-ghost btn-sm text-crimson-400"
                      title="Hapus"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                {editingId === item.id && (
                  <EditForm item={item} onDone={() => setEditingId(null)} isAdmin={isAdmin} officers={officers} />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
