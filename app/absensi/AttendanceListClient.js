"use client";

import { useState } from "react";

const TZ = "Asia/Jakarta";

function jakartaKey(d) {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date(d));
  const g = (t) => p.find((x) => x.type === t).value;
  return `${g("year")}-${g("month")}-${g("day")}`;
}

function addDays(key, n) {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function mondayOf(key) {
  const day = new Date(`${key}T00:00:00Z`).getUTCDay();
  return addDays(key, day === 0 ? -6 : 1 - day);
}

export default function AttendanceListClient({ records = [] }) {
  const [start, setStart] = useState(() => mondayOf(jakartaKey(new Date())));
  const [end, setEnd] = useState(() => addDays(mondayOf(jakartaKey(new Date())), 6));

  const filtered = records
    .filter((r) => {
      const k = jakartaKey(r.checked_in_at);
      if (start && k < start) return false;
      if (end && k > end) return false;
      return true;
    })
    .sort((a, b) => new Date(b.checked_in_at) - new Date(a.checked_in_at));

  const totalMinutes = filtered.reduce(
    (acc, r) => acc + Math.round(Number(r.duration_minutes) || 0), 0
  );

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b border-line">
        <div>
          <h2 className="font-rajdhani text-lg font-bold text-white">Riwayat Absensi</h2>
          {totalMinutes > 0 && (
            <p className="text-xs text-slate-500 mt-0.5">
              Total periode: <span className="font-mono text-emerald-400">
                {Math.floor(totalMinutes / 60)}j {totalMinutes % 60}m
              </span>
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs text-slate-400 uppercase tracking-widest">Rentang:</label>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="field w-auto text-sm h-9" />
          <span className="text-slate-500 text-xs">-</span>
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="field w-auto text-sm h-9" />
          {(start || end) && (
            <button onClick={() => { setStart(""); setEnd(""); }} className="text-xs text-crimson-400 hover:text-crimson-300">
              Semua
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line">
              {["Tanggal", "Check-In", "Check-Out", "Durasi", "Status"].map((h) => (
                <th key={h} className="whitespace-nowrap px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((rec) => (
              <tr key={rec.id} className="border-b border-line/50 last:border-0 hover:bg-white/[0.015] transition-colors">
                <td className="px-4 py-3 text-slate-300">
                  {new Date(rec.checked_in_at).toLocaleDateString("id-ID", {
                    timeZone: TZ, day: "2-digit", month: "long", year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3 font-mono text-emerald-400">
                  {new Date(rec.checked_in_at).toLocaleTimeString("id-ID", { timeZone: TZ, hour12: false })} WIB
                </td>
                <td className="px-4 py-3 font-mono text-crimson-400">
                  {rec.checked_out_at ? new Date(rec.checked_out_at).toLocaleTimeString("id-ID", { timeZone: TZ, hour12: false }) + " WIB" : "-"}
                </td>
                <td className="px-4 py-3 font-mono text-slate-300">
                  {rec.duration_minutes ? `${Math.floor(rec.duration_minutes / 60)}j ${Math.floor(rec.duration_minutes % 60)}m` : "-"}
                </td>
                <td className="px-4 py-3">
                  {rec.checked_out_at ? (
                    <span className="inline-flex items-center gap-1 rounded bg-slate-500/10 px-2 py-1 text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      Selesai
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-400 uppercase tracking-wider">
                      Aktif
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Belum ada data absensi untuk periode ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
