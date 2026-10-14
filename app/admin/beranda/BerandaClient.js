"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { updateSiteContentAction, saveStatsAction, savePillarsAction } from "@/app/actions/admin";

const ICONS = ["ShieldCheck", "Target", "Clock"];

export default function BerandaClient({ content, stats, pillars }) {
  return (
    <div className="space-y-6">
      <ContentForm content={content} />
      <StatsForm initial={stats} />
      <PillarsForm initial={pillars} />
    </div>
  );
}

function ContentForm({ content }) {
  const [state, dispatch, pending] = useActionState(updateSiteContentAction, null);

  useEffect(() => {
    if (state?.success) toast.success("Konten Beranda berhasil disimpan!");
    else if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={dispatch} className="card p-6 space-y-5">
      <div>
        <h2 className="font-rajdhani text-xl font-bold text-white">Teks Halaman Utama</h2>
        <p className="text-xs text-slate-500 mt-1">
          Bungkus sebuah kata dengan <span className="font-mono text-slate-400">*bintang*</span> pada Judul untuk menebalkan/memiringkan kata tersebut.
        </p>
      </div>

      <div>
        <label className="label">Judul Hero</label>
        <input name="hero_title" className="field" defaultValue={content.hero_title} />
      </div>

      <div>
        <label className="label">Subjudul Hero</label>
        <textarea name="hero_subtitle" className="field min-h-[80px] resize-y" defaultValue={content.hero_subtitle} />
      </div>

      <div className="border-t border-line pt-5">
        <h3 className="font-rajdhani text-lg font-bold text-white mb-4">Profil Perusahaan</h3>
        <div className="space-y-4">
          <div>
            <label className="label">Judul Profil</label>
            <input name="profile_title" className="field" defaultValue={content.profile_title} />
          </div>
          <div>
            <label className="label">Narasi Profil (pisahkan paragraf dengan enter)</label>
            <textarea name="profile_intro" className="field min-h-[140px] resize-y" defaultValue={content.profile_intro} />
          </div>
          <div>
            <label className="label">Judul Komitmen</label>
            <input name="profile_commitment_title" className="field" defaultValue={content.profile_commitment_title} />
          </div>
          <div>
            <label className="label">Isi Komitmen</label>
            <textarea name="profile_commitment_body" className="field min-h-[120px] resize-y" defaultValue={content.profile_commitment_body} />
          </div>
          <div>
            <label className="label">Penutup / Tujuan</label>
            <textarea name="profile_goal" className="field min-h-[100px] resize-y" defaultValue={content.profile_goal} />
          </div>
        </div>
      </div>

      {state?.error && <p className="text-sm text-crimson-400">{state.error}</p>}

      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? "Menyimpan..." : "Simpan Konten"}
      </button>
    </form>
  );
}

function StatsForm({ initial }) {
  const [state, dispatch, pending] = useActionState(saveStatsAction, null);
  const [rows, setRows] = useState(() =>
    initial.map((s) => ({ label: s.label, value: String(s.value), suffix: s.suffix || "" }))
  );

  useEffect(() => {
    if (state?.success) toast.success("Statistik berhasil disimpan!");
    else if (state?.error) toast.error(state.error);
  }, [state]);

  const update = (i, field, val) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));

  return (
    <form action={dispatch} className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-rajdhani text-lg font-bold text-white">Statistik Beranda</h3>
        <button type="button" onClick={() => setRows((rs) => [...rs, { label: "", value: 0, suffix: "" }])} className="btn btn-ghost btn-sm">
          <Plus className="size-4" /> Tambah
        </button>
      </div>

      <input type="hidden" name="rows" value={JSON.stringify(rows)} />

      <div className="space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <input className="field flex-1" placeholder="Label (mis: Personil Aktif)" value={row.label} onChange={(e) => update(i, "label", e.target.value)} />
            <input className="field w-full sm:w-28" type="number" placeholder="Nilai" value={row.value} onChange={(e) => update(i, "value", e.target.value)} />
            <input className="field w-full sm:w-24" placeholder="Suffix (+)" value={row.suffix} onChange={(e) => update(i, "suffix", e.target.value)} />
            <button type="button" onClick={() => setRows((rs) => rs.filter((_, idx) => idx !== i))} className="p-2 text-slate-400 hover:text-crimson-400">
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
        {rows.length === 0 && <p className="text-sm text-slate-500 py-2">Belum ada statistik.</p>}
      </div>

      {state?.error && <p className="mt-3 text-sm text-crimson-400">{state.error}</p>}

      <button type="submit" disabled={pending} className="btn btn-primary mt-4">
        {pending ? "Menyimpan..." : "Simpan Statistik"}
      </button>
    </form>
  );
}

function PillarsForm({ initial }) {
  const [state, dispatch, pending] = useActionState(savePillarsAction, null);

  useEffect(() => {
    if (state?.success) toast.success("Pilar berhasil disimpan!");
    else if (state?.error) toast.error(state.error);
  }, [state]);

  const [rows, setRows] = useState(() =>
    (initial || []).map((p) => ({ icon_name: p.icon_name || "ShieldCheck", title: p.title, description: p.description }))
  );

  const update = (i, field, val) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));

  return (
    <form action={dispatch} className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-rajdhani text-lg font-bold text-white">Pilar Perusahaan</h3>
        <button type="button" onClick={() => setRows((rs) => [...rs, { icon_name: "ShieldCheck", title: "", description: "" }])} className="btn btn-ghost btn-sm">
          <Plus className="size-4" /> Tambah
        </button>
      </div>

      <input type="hidden" name="rows" value={JSON.stringify(rows)} />

      <div className="space-y-4">
        {rows.map((row, i) => (
          <div key={i} className="rounded-lg border border-line p-4 space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <select className="field sm:w-40" value={row.icon_name} onChange={(e) => update(i, "icon_name", e.target.value)}>
                {ICONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
              </select>
              <input className="field flex-1" placeholder="Judul pilar" value={row.title} onChange={(e) => update(i, "title", e.target.value)} />
              <button type="button" onClick={() => setRows((rs) => rs.filter((_, idx) => idx !== i))} className="self-end p-2.5 text-slate-400 hover:text-crimson-400 sm:self-auto">
                <Trash2 className="size-4" />
              </button>
            </div>
            <textarea className="field min-h-[80px] resize-y" placeholder="Deskripsi" value={row.description} onChange={(e) => update(i, "description", e.target.value)} />
          </div>
        ))}
        {rows.length === 0 && <p className="text-sm text-slate-500 py-2">Belum ada pilar.</p>}
      </div>

      {state?.error && <p className="mt-3 text-sm text-crimson-400">{state.error}</p>}

      <button type="submit" disabled={pending} className="btn btn-primary mt-4">
        {pending ? "Menyimpan..." : "Simpan Pilar"}
      </button>
    </form>
  );
}
