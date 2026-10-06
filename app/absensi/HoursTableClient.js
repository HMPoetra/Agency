"use client";

import { useState, Fragment } from "react";
import { updateManualTimeAction } from "@/app/actions/admin";
import Link from "next/link";

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export default function HoursTableClient({ officers, isAdmin }) {
  const [editingId, setEditingId] = useState(null);
  const [operation, setOperation] = useState("add"); // "add" or "sub"
  const [inputHours, setInputHours] = useState("");
  const [inputMinutes, setInputMinutes] = useState("");
  const [loading, setLoading] = useState(false);

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
      <h2 className="font-rajdhani text-xl font-bold text-white mb-4">Total Jam Personil</h2>
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
              const systemMinutes = parseInt(o.attendance_minutes || 0, 10);
              const manualMin = parseInt(o.manual_minutes || 0, 10);
              const totalMins = systemMinutes + manualMin;
              
              const formatMins = (mins) => {
                const isNeg = mins < 0;
                const absMins = Math.abs(mins);
                const h = Math.floor(absMins / 60);
                const m = absMins % 60;
                return `${isNeg ? "-" : ""}${h}j ${m}m`;
              };

              const systemDisplay = formatMins(systemMinutes);
              const manDisplay = formatMins(manualMin);
              const totalDisplay = formatMins(totalMins).replace('j', ' Jam').replace('m', ' Menit');

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
                          className="field py-1 px-2 h-8 w-14 bg-black/40 text-center cursor-pointer"
                          value={operation}
                          onChange={(e) => setOperation(e.target.value)}
                          disabled={loading}
                        >
                          <option value="add">+</option>
                          <option value="sub">-</option>
                        </select>
                        <input
                          type="number"
                          className="field py-1 px-2 h-8 w-16 text-center"
                          value={inputHours}
                          onChange={(e) => setInputHours(e.target.value)}
                          disabled={loading}
                          placeholder="Jam"
                        />
                        <span className="text-slate-500">j</span>
                        <input
                          type="number"
                          className="field py-1 px-2 h-8 w-16 text-center"
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
                            onClick={() => handleSave(o.id, manualMin, systemMinutes)}
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
