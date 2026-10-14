"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Minus, Plus, Users, BadgeCheck, ArrowUpRight, Wrench, Server, Check,
} from "lucide-react";
import { createAlaCarteOrderAction } from "@/app/actions/ala-carte";
import { useFormAction } from "@/app/hooks/useFormAction";

const rupiah = (n) =>
  "Rp " + new Intl.NumberFormat("id-ID").format(Math.round(Number(n) || 0));

const MAX_PERSONIL = 50;

export default function AlaCarteConfigurator({ items = [], ranks = [] }) {
  const divisionOptions = useMemo(() => (items ?? []).filter(Boolean), [items]);
  const rankOptions = useMemo(() => (ranks ?? []).filter(Boolean), [ranks]);
  const divById = useMemo(
    () => new Map(divisionOptions.map((d) => [d.id, d])),
    [divisionOptions]
  );

  const [serverName, setServerName] = useState("");
  const [selected, setSelected] = useState([]); // [{ id, qty }]
  const [picked, setPicked] = useState([]); // rank ids

  const { handleSubmit, pending, error } = useFormAction(
    createAlaCarteOrderAction,
    (res) => {
      toast.success(`Order ${res?.id ?? ""} terkirim! Dispatch akan menindaklanjuti.`);
      setServerName("");
      setSelected([]);
      setPicked([]);
    }
  );

  const toggleDivision = (id) =>
    setSelected((prev) =>
      prev.some((s) => s.id === id)
        ? prev.filter((s) => s.id !== id)
        : [...prev, { id, qty: 1 }]
    );

  const setQty = (id, qty) =>
    setSelected((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, qty: Math.max(1, Math.min(MAX_PERSONIL, qty)) }
          : s
      )
    );

  const toggleRank = (id) =>
    setPicked((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const lines = selected
    .map((s) => {
      const d = divById.get(s.id);
      if (!d) return null;
      const base = Number(d.price_idr) || 0;
      const per = Number(d.price_per_person) || 0;
      return { ...d, qty: s.qty, base, per, subtotal: base + per * s.qty };
    })
    .filter(Boolean);

  const pickedRanks = rankOptions.filter((r) => picked.includes(r.id));
  const subtotal = lines.reduce((sum, l) => sum + l.subtotal, 0);
  const rankCost = pickedRanks.reduce((sum, r) => sum + (Number(r.price_idr) || 0), 0);
  const total = subtotal + rankCost;

  if (divisionOptions.length === 0) {
    return (
      <div className="mt-6 card p-6 text-sm text-slate-500">
        Layanan Ala Carte belum tersedia. Silakan hubungi dispatch untuk
        penawaran khusus.
      </div>
    );
  }

  const canSubmit = serverName.trim().length >= 2 && selected.length > 0 && !pending;

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
      <input type="hidden" name="divisions" value={JSON.stringify(selected)} />
      <input type="hidden" name="ranks" value={JSON.stringify(picked)} />

      {/* Kontrol */}
      <div className="space-y-6">
        {/* Nama server */}
        <div>
          <label htmlFor="server_name" className="label">1 · Nama Server</label>
          <div className="relative mt-2">
            <Server
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500"
              aria-hidden="true"
            />
            <input
              id="server_name"
              name="server_name"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              placeholder="cth. Los Santos Roleplay"
              className="field pl-10"
              maxLength={80}
              required
            />
          </div>
        </div>

        {/* Divisi (bisa >1) */}
        <div>
          <p className="label">2 · Pilih Divisi (boleh lebih dari satu)</p>
          <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
            {divisionOptions.map((d) => {
              const active = selected.some((s) => s.id === d.id);
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => toggleDivision(d.id)}
                  aria-pressed={active}
                  className={`rounded-xl border p-3.5 text-left transition-colors active:scale-[0.99] ${
                    active
                      ? "border-crimson-500/40 bg-crimson-500/10"
                      : "border-line hover:border-line-strong"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
                      {d.division_tag || d.division_id || "PAKET"}
                    </span>
                    <span
                      className={`flex size-5 items-center justify-center rounded border ${
                        active
                          ? "border-crimson-400 text-crimson-400"
                          : "border-line text-transparent"
                      }`}
                    >
                      <Check className="size-3.5" aria-hidden="true" />
                    </span>
                  </div>
                  <p className="mt-1 truncate font-rajdhani font-bold text-white">
                    {d.name || d.division_name || d.id}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {rupiah(d.price_idr)} + {rupiah(d.price_per_person)}/orang
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Jumlah personil per divisi */}
        {lines.length > 0 && (
          <div>
            <p className="label">3 · Jumlah Personil</p>
            <div className="mt-2 space-y-3">
              {lines.map((l) => (
                <div key={l.id} className="rounded-xl border border-line p-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 font-rajdhani font-bold text-white">
                      <Wrench className="size-3.5 text-crimson-400" aria-hidden="true" />
                      {l.name || l.division_name || l.id}
                    </span>
                    <span className="flex items-center gap-1.5 rounded-full border border-crimson-500/30 bg-crimson-500/10 px-2.5 py-0.5 font-mono text-xs text-white">
                      <Users className="size-3 text-crimson-400" aria-hidden="true" />
                      {l.qty}
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQty(l.id, l.qty - 1)}
                      className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-line text-slate-300 hover:border-line-strong hover:text-white active:scale-95"
                      aria-label="Kurangi personil"
                    >
                      <Minus className="size-4" />
                    </button>
                    <input
                      type="range"
                      min={1}
                      max={MAX_PERSONIL}
                      step={1}
                      value={l.qty}
                      onChange={(e) => setQty(l.id, Number(e.target.value))}
                      aria-label={`Jumlah personil ${l.name}`}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-crimson-500"
                    />
                    <button
                      type="button"
                      onClick={() => setQty(l.id, l.qty + 1)}
                      className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-line text-slate-300 hover:border-line-strong hover:text-white active:scale-95"
                      aria-label="Tambah personil"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Jabatan */}
        {rankOptions.length > 0 && (
          <div>
            <p className="label">
              {lines.length > 0 ? "4" : "3"} · Request Jabatan (opsional)
            </p>
            <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
              {rankOptions.map((r) => {
                const active = picked.includes(r.id);
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => toggleRank(r.id)}
                    aria-pressed={active}
                    className={`flex items-center justify-between gap-2 rounded-xl border px-3.5 py-3 text-left transition-colors active:scale-[0.99] ${
                      active
                        ? "border-crimson-500/40 bg-crimson-500/10"
                        : "border-line hover:border-line-strong"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <BadgeCheck
                        className={`size-4 shrink-0 ${active ? "text-crimson-400" : "text-slate-600"}`}
                        aria-hidden="true"
                      />
                      <span className="font-rajdhani text-sm font-bold text-white">
                        {r.name}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-xs text-slate-400">
                      {rupiah(r.price_idr)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Ringkasan */}
      <div className="card flex h-fit flex-col p-6 lg:sticky lg:top-24">
        <h3 className="font-rajdhani text-lg font-bold text-white">Rincian Biaya</h3>
        <p className="mt-1 text-xs text-slate-500">
          {lines.length > 0
            ? `${lines.length} divisi${pickedRanks.length ? ` · ${pickedRanks.length} jabatan` : ""}`
            : "Pilih divisi untuk mulai"}
        </p>

        {lines.length === 0 ? (
          <p className="mt-5 text-sm text-slate-500">
            Belum ada divisi dipilih.
          </p>
        ) : (
          <dl className="mt-5 space-y-2.5 text-sm">
            {lines.map((l) => (
              <div key={l.id} className="flex items-center justify-between gap-3">
                <dt className="text-slate-400">
                  {l.name || l.division_name || l.id}{" "}
                  <span className="text-slate-500">({l.qty} orang)</span>
                </dt>
                <dd className="font-mono text-slate-200">{rupiah(l.subtotal)}</dd>
              </div>
            ))}
            {pickedRanks.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3">
                <dt className="text-slate-400">{r.name}</dt>
                <dd className="font-mono text-slate-200">{rupiah(r.price_idr)}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-5 flex items-end justify-between gap-3 border-t border-line pt-4">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-500">Total</span>
          <span className="font-orbitron text-2xl font-bold text-white">{rupiah(total)}</span>
        </div>

        {error && <p className="mt-3 text-sm text-crimson-400">{error}</p>}

        <button type="submit" disabled={!canSubmit} className="btn btn-primary mt-5 w-full disabled:opacity-50">
          {pending && (
            <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          )}
          {pending ? "Mengirim…" : "Ajukan Ala Carte"}
          {!pending && <ArrowUpRight className="ml-auto size-4" />}
        </button>
        <p className="mt-2 text-center text-[11px] text-slate-500">
          Order tersimpan & diteruskan ke dispatch untuk konfirmasi.
        </p>
      </div>
    </form>
  );
}
