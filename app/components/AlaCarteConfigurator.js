"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, Users, BadgeCheck, ArrowUpRight, Wrench } from "lucide-react";

const rupiah = (n) =>
  "Rp " + new Intl.NumberFormat("id-ID").format(Math.round(Number(n) || 0));

const MAX_PERSONIL = 50;

export default function AlaCarteConfigurator({ items = [], ranks = [] }) {
  const divisionOptions = useMemo(() => (items ?? []).filter(Boolean), [items]);
  const rankOptions = useMemo(() => (ranks ?? []).filter(Boolean), [ranks]);

  const [divisionId, setDivisionId] = useState(divisionOptions[0]?.id ?? null);
  const [qty, setQty] = useState(1);
  const [picked, setPicked] = useState([]);

  const division =
    divisionOptions.find((d) => d.id === divisionId) ?? divisionOptions[0] ?? null;

  const basePrice = Number(division?.price_idr) || 0;
  const perPerson = Number(division?.price_per_person) || 0;
  const personilCost = perPerson * qty;
  const pickedRanks = rankOptions.filter((r) => picked.includes(r.id));
  const rankCost = pickedRanks.reduce((sum, r) => sum + (Number(r.price_idr) || 0), 0);
  const total = basePrice + personilCost + rankCost;

  const toggleRank = (id) =>
    setPicked((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  if (!division) {
    return (
      <div className="mt-6 card p-6 text-sm text-slate-500">
        Layanan Ala Carte belum tersedia. Silakan hubungi dispatch untuk
        penawaran khusus.
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* Kontrol */}
      <div className="space-y-6">
        {/* Pilih divisi */}
        <div>
          <p className="label">1 · Pilih Divisi</p>
          <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
            {divisionOptions.map((d) => {
              const active = d.id === division.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDivisionId(d.id)}
                  aria-pressed={active}
                  className={`rounded-xl border p-3.5 text-left transition-colors active:scale-[0.99] ${
                    active
                      ? "border-crimson-500/40 bg-crimson-500/10"
                      : "border-line hover:border-line-strong"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
                      {d.division_tag || d.division_id}
                    </span>
                    <Wrench
                      className={`size-3.5 ${active ? "text-crimson-400" : "text-slate-600"}`}
                      aria-hidden="true"
                    />
                  </div>
                  <p className="mt-1 truncate font-rajdhani font-bold text-white">
                    {d.name || d.division_name}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {rupiah(d.price_idr)} + {rupiah(d.price_per_person)}/orang
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Jumlah personil */}
        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="label">2 · Jumlah Personil</p>
            <span className="flex items-center gap-1.5 rounded-full border border-crimson-500/30 bg-crimson-500/10 px-3 py-1 font-mono text-sm text-white">
              <Users className="size-3.5 text-crimson-400" aria-hidden="true" />
              {qty} orang
            </span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-line text-slate-300 hover:border-line-strong hover:text-white active:scale-95"
              aria-label="Kurangi personil"
            >
              <Minus className="size-4" />
            </button>
            <input
              type="range"
              min={1}
              max={MAX_PERSONIL}
              step={1}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              aria-label="Jumlah personil"
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-crimson-500"
            />
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(MAX_PERSONIL, q + 1))}
              className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-line text-slate-300 hover:border-line-strong hover:text-white active:scale-95"
              aria-label="Tambah personil"
            >
              <Plus className="size-4" />
            </button>
          </div>
          <div className="mt-1.5 flex justify-between font-mono text-[10px] text-slate-600">
            <span>1</span>
            <span>{MAX_PERSONIL}</span>
          </div>
        </div>

        {/* Jabatan */}
        {rankOptions.length > 0 && (
          <div>
            <p className="label">3 · Request Jabatan (opsional)</p>
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
          {division.name || division.division_name}
          {pickedRanks.length > 0 && ` · ${pickedRanks.length} request jabatan`}
        </p>

        <dl className="mt-5 space-y-2.5 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-400">Harga dasar divisi</dt>
            <dd className="font-mono text-slate-200">{rupiah(basePrice)}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-400">
              Personil <span className="text-slate-500">({qty} × {rupiah(perPerson)})</span>
            </dt>
            <dd className="font-mono text-slate-200">{rupiah(personilCost)}</dd>
          </div>
          {pickedRanks.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3">
              <dt className="text-slate-400">{r.name}</dt>
              <dd className="font-mono text-slate-200">{rupiah(r.price_idr)}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 flex items-end justify-between gap-3 border-t border-line pt-4">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-500">Total</span>
          <span className="font-orbitron text-2xl font-bold text-white">{rupiah(total)}</span>
        </div>

        <a
          href="https://discord.gg/HWZDKJAJh"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary mt-5 w-full"
        >
          Ajukan Ala Carte
          <ArrowUpRight className="ml-auto size-4" />
        </a>
        <p className="mt-2 text-center text-[11px] text-slate-500">
          Estimasi otomatis — konfirmasi akhir oleh dispatch.
        </p>
      </div>
    </div>
  );
}
