"use client";

import { useState } from "react";
import { updateManualTimeAction } from "@/app/actions/admin";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

const JAKARTA = "Asia/Jakarta";

function jakartaDateKey(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: JAKARTA, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date(date));
  const get = (t) => parts.find((p) => p.type === t).value;
  return `${get("year")}-${get("month")}-${get("day")}`;
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

function fmtDay(key, withYear = false) {
  return new Date(`${key}T00:00:00Z`).toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", timeZone: "UTC", ...(withYear ? { year: "numeric" } : {}),
  });
}

export default function HoursTableClient({ officers, attendance = [], isAdmin }) {
  const [editingId, setEditingId] = useState(null);
  const [operation, setOperation] = useState("add"); // "add" or "sub"
  const [inputHours, setInputHours] = useState("");
  const [inputMinutes, setInputMinutes] = useState("");
  const [loading, setLoading] = useState(false);
  const [weekStart, setWeekStart] = useState(() => mondayOf(jakartaDateKey(new Date())));

  const weekEnd = addDays(weekStart, 6);
  // ponytail: weeks are limited to the fetched attendance window (limit 1000); add a server-side weekly query if history outgrows it.
  const weeklyByOfficer = attendance.reduce((acc, r) => {
    const k = jakartaDateKey(r.checked_in_at);
    if (k >= weekStart && k <= weekEnd) {
      acc[r.officer_id] = (acc[r.officer_id] || 0) + Math.round(Number(r.duration_minutes) || 0);
    }
    return acc;
  }, {});

  const handleEdit = (officer) => {
    setEditingId(officer.id);
    setOperation("add");
    setInputHours("");
    setInputMinutes("");
  };

  const handleSave = async (id, currentManualMinutes, systemMinutes) => {
    setLoading(true);
    let delta = (parseInt(inputHours || 0, 10) * 60) + parseInt(inputMinutes || 0, 10);
    if (operation === "sub") delta = -delta;
    
    let newTotal = currentManualMinutes + delta;
    
    // Jangan sampai total keseluruhan (sistem + manual) menjadi minus
    if (systemMinutes + newTotal < 0) {
      newTotal = -systemMinutes;
    }
    
    const isNeg = newTotal < 0;
    const absTotal = Math.abs(newTotal);
    const newH = (isNeg ? -1 : 1) * Math.floor(absTotal / 60);
    const newM = (isNeg ? -1 : 1) * (absTotal % 60);

    const res = await updateManualTimeAction(id, newH, newM);
    setLoading(false);
    if (res?.error) {
      alert(res.error);
    } else {
      setEditingId(null);
    }
  };

  return (
    <div className="card p-6 border border-line">
      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="font-rajdhani text-xl font-bold text-white">Total Jam Personil</h2>
        <div className="flex items-center gap-2 bg-white/[0.02] border border-line rounded-lg p-1">
          <button onClick={() => setWeekStart((w) => addDays(w, -7))} className="p-1 hover:text-white text-slate-400 transition-colors" title="Minggu sebelumnya">
            <ChevronLeft className="size-4" />
          </button>
          <span className="font-mono text-xs text-slate-300 px-1">
            {fmtDay(weekStart)} - {fmtDay(weekEnd, true)}
          </span>
          <button onClick={() => setWeekStart((w) => addDays(w, 7))} className="p-1 hover:text-white text-slate-400 transition-colors" title="Minggu berikutnya">
            <ChevronRight className="size-4" />
          </button>
          <div className="h-4 w-px bg-line" />
          <button onClick={() => setWeekStart(mondayOf(jakartaDateKey(new Date())))} className="px-1 text-[10px] font-mono uppercase tracking-wider text-crimson-400 hover:text-crimson-300">
            Minggu Ini
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-line bg-black/20 text-slate-400">
              <th className="p-3 font-semibold">Callsign</th>
              <th className="p-3 font-semibold">Nama</th>
              <th className="p-3 font-semibold">Jam Absensi (Sistem)</th>
              <th className="p-3 font-semibold">Jam Manual (Input)</th>
              <th className="p-3 font-semibold">Total Keseluruhan</th>
              {isAdmin && <th className="p-3 font-semibold text-right">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {officers.map((o) => {
              const systemMinutes = weeklyByOfficer[o.id] || 0;
              const totalSystemMinutes = parseInt(o.attendance_minutes || 0, 10);
              const manualMin = parseInt(o.manual_minutes || 0, 10);
              const totalMins = totalSystemMinutes + manualMin;
              
              const formatMins = (mins, isFull = false) => {
                const isNeg = mins < 0;
                const absMins = Math.abs(mins);
                const h = Math.floor(absMins / 60);
                const m = absMins % 60;
                if (isFull) {
                  return `${isNeg ? "-" : ""}${h} Jam ${m} Menit`;
                }
                return `${isNeg ? "-" : ""}${h}j ${m}m`;
              };

              const systemDisplay = formatMins(systemMinutes);
              const manDisplay = formatMins(manualMin);
              const totalDisplay = formatMins(totalMins, true);

              return (
                <tr key={o.id} className="border-b border-line/50 hover:bg-white/5">
                  <td className="p-3 font-mono text-crimson-400">{o.callsign}</td>
                  <td className="p-3 text-slate-300">{o.full_name}</td>
                  <td className="p-3 text-slate-400">
                    {systemDisplay}
                  </td>
                  <td className="p-3">
                    {editingId === o.id ? (
                      <div className="flex items-center gap-2">
                        <select
                          className="field py-1 px-2 h-11 w-14 bg-black/40 text-center cursor-pointer"
                          value={operation}
                          onChange={(e) => setOperation(e.target.value)}
                          disabled={loading}
                        >
                          <option value="add">+</option>
                          <option value="sub">-</option>
                        </select>
                        <input
                          type="number"
                          className="field py-1 px-2 h-11 w-16 text-center"
                          value={inputHours}
                          onChange={(e) => setInputHours(e.target.value)}
                          disabled={loading}
                          placeholder="Jam"
                        />
                        <span className="text-slate-500">j</span>
                        <input
                          type="number"
                          className="field py-1 px-2 h-11 w-16 text-center"
                          value={inputMinutes}
                          onChange={(e) => setInputMinutes(e.target.value)}
                          disabled={loading}
                          placeholder="Menit"
                        />
                        <span className="text-slate-500">m</span>
                      </div>
                    ) : (
                      <span className="text-slate-300">{manDisplay}</span>
                    )}
                  </td>
                  <td className="p-3 font-bold text-emerald-400">{totalDisplay}</td>
                  {isAdmin && (
                    <td className="p-3 text-right">
                      {editingId === o.id ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="btn btn-ghost btn-sm text-slate-400"
                            disabled={loading}
                          >
                            Batal
                          </button>
                          <button
                            onClick={() => handleSave(o.id, manualMin, totalSystemMinutes)}
                            className="btn btn-primary btn-sm"
                            disabled={loading}
                          >
                            {loading ? "..." : "Simpan"}
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-3 items-center">
                          <Link
                            href={`/admin/attendance/${o.id}`}
                            className="text-xs text-emerald-400 hover:text-emerald-300 underline"
                          >
                            Detail Absensi
                          </Link>
                          <button
                            onClick={() => handleEdit(o)}
                            className="text-xs text-crimson-400 hover:text-crimson-300 underline"
                          >
                            Kalkulasi Waktu
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
    </div>
  );
}
