"use client";

import { useState, useActionState, useEffect } from "react";
import { Edit2, Trash2, X, Plus } from "lucide-react";
import { createPortal } from "react-dom";
import { updateAttendanceAction, deleteAttendanceAction } from "@/app/actions/admin";

export default function AttendanceClient({ initialRecords }) {
  const [records, setRecords] = useState(initialRecords);
  const [editingRec, setEditingRec] = useState(null);
  
  // Set default filter date to today (local time)
  const [filterDate, setFilterDate] = useState(() => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  });

  // Sync with prop
  useEffect(() => {
    setRecords(initialRecords);
  }, [initialRecords]);

  // Filter records based on selected date
  const filteredRecords = filterDate
    ? records.filter((rec) => {
        const d = new Date(rec.checked_in_at);
        const localDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
        return localDate === filterDate;
      })
    : records;

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-line">
        <h2 className="font-rajdhani text-lg font-bold text-white">Laporan Duty</h2>
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 uppercase tracking-widest">Filter Tanggal:</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="field w-auto text-sm"
          />
          {filterDate && (
            <button 
              onClick={() => setFilterDate("")}
              className="text-xs text-crimson-400 hover:text-crimson-300"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line">
              {["Personil", "Callsign", "Divisi", "Tanggal", "Check-In", "Check-Out", "Durasi", "Status", "Aksi"].map((h) => (
                <th key={h} className="whitespace-nowrap px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((rec) => (
              <tr key={rec.id} className="border-b border-line/50 last:border-0 hover:bg-white/[0.015] transition-colors">
                <td className="px-4 py-3 text-slate-200 font-medium">{rec.full_name}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{rec.callsign}</td>
                <td className="px-4 py-3 text-slate-400">{rec.division}</td>
                <td className="px-4 py-3 text-slate-300">
                  {new Date(rec.checked_in_at).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                  })}
                </td>
                <td className="px-4 py-3 font-mono text-emerald-400">
                  {new Date(rec.checked_in_at).toLocaleTimeString("id-ID")}
                </td>
                <td className="px-4 py-3 font-mono text-crimson-400">
                  {rec.checked_out_at ? new Date(rec.checked_out_at).toLocaleTimeString("id-ID") : "-"}
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
                    <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-1 text-[10px] font-medium text-amber-400 uppercase tracking-wider">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                      </span>
                      Aktif
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => setEditingRec(rec)} className="p-1.5 text-slate-400 hover:text-white transition-colors">
                      <Edit2 className="size-4" />
                    </button>
                    <form action={() => deleteAttendanceAction(rec.id)} onSubmit={e => { if(!confirm("Hapus absen?")) e.preventDefault() }}>
                      <button type="submit" className="p-1.5 text-slate-400 hover:text-crimson-400 transition-colors">
                        <Trash2 className="size-4" />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {filteredRecords.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                  Belum ada data absensi untuk periode ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingRec && (
        <AttendanceModal rec={editingRec} onClose={() => setEditingRec(null)} />
      )}
    </div>
  );
}

function AttendanceModal({ rec, onClose }) {
  const [state, formAction, isPending] = useActionState(updateAttendanceAction, null);

  useEffect(() => {
    if (state?.success) {
      alert("Berhasil mengupdate jam duty!");
      onClose();
    }
  }, [state, onClose]);

  // Convert DB timestamp to format for <input type="datetime-local">
  const formatDatetime = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
  };

  const content = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="card relative w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-white">
          <X className="size-5" />
        </button>
        
        <h2 className="mb-6 font-rajdhani text-2xl font-bold text-white">Edit Jam Duty</h2>
        
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={rec.id} />
          
          <div>
            <label className="label">Check-In</label>
            <input 
              type="datetime-local" 
              step="1"
              name="checked_in_at" 
              className="field" 
              defaultValue={formatDatetime(rec.checked_in_at)} 
              required 
            />
          </div>

          <div>
            <label className="label">Check-Out (Kosongkan jika masih aktif)</label>
            <input 
              type="datetime-local" 
              step="1"
              name="checked_out_at" 
              className="field" 
              defaultValue={formatDatetime(rec.checked_out_at)} 
            />
          </div>

          {state?.error && <p className="text-sm text-crimson-400">{state.error}</p>}
          
          <div className="pt-2">
            <button type="submit" disabled={isPending} className="btn btn-primary w-full">
              {isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
}
