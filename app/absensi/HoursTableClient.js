"use client";

import { useState } from "react";
import { updateManualTimeAction } from "@/app/actions/admin";

export default function HoursTableClient({ officers, isAdmin }) {
  const [editingId, setEditingId] = useState(null);
  const [manualHours, setManualHours] = useState("");
  const [manualMinutes, setManualMinutes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEdit = (officer) => {
    setEditingId(officer.id);
    const totalMinutes = parseInt(officer.manual_minutes || 0, 10);
    setManualHours(Math.floor(totalMinutes / 60));
    setManualMinutes(totalMinutes % 60);
  };

  const handleSave = async (id) => {
    setLoading(true);
    const res = await updateManualTimeAction(id, manualHours, manualMinutes);
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
              
              const systemH = Math.floor(systemMinutes / 60);
              const systemM = systemMinutes % 60;
              
              const manH = Math.floor(manualMin / 60);
              const manM = manualMin % 60;
              
              const totalH = Math.floor(totalMins / 60);
              const totalM = totalMins % 60;

              return (
                <tr key={o.id} className="border-b border-line/50 hover:bg-white/5">
                  <td className="p-3 font-mono text-crimson-400">{o.callsign}</td>
                  <td className="p-3 text-slate-300">{o.full_name}</td>
                  <td className="p-3 text-slate-400">
                    {systemH}j {systemM}m
                  </td>
                  <td className="p-3">
                    {editingId === o.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          className="field py-1 px-2 h-8 w-16 text-center"
                          value={manualHours}
                          onChange={(e) => setManualHours(e.target.value)}
                          disabled={loading}
                          placeholder="Jam"
                        />
                        <span className="text-slate-500">j</span>
                        <input
                          type="number"
                          className="field py-1 px-2 h-8 w-16 text-center"
                          value={manualMinutes}
                          onChange={(e) => setManualMinutes(e.target.value)}
                          disabled={loading}
                          placeholder="Menit"
                        />
                        <span className="text-slate-500">m</span>
                      </div>
                    ) : (
                      <span className="text-slate-300">{manH}j {manM}m</span>
                    )}
                  </td>
                  <td className="p-3 font-bold text-emerald-400">{totalH} Jam {totalM} Menit</td>
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
                            onClick={() => handleSave(o.id)}
                            className="btn btn-primary btn-sm"
                            disabled={loading}
                          >
                            {loading ? "..." : "Simpan"}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(o)}
                          className="text-xs text-crimson-400 hover:text-crimson-300 underline"
                        >
                          Edit Jam Manual
                        </button>
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
