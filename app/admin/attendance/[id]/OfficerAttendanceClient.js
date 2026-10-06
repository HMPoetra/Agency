"use client";

import { useState, useMemo, Fragment } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export default function OfficerAttendanceClient({ officer, initialRecords }) {
  const [tableStartDate, setTableStartDate] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  });
  
  const [tableEndDate, setTableEndDate] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const end = new Date(d.setDate(diff));
    end.setDate(end.getDate() + 6);
    return end;
  });

  const weekDays = useMemo(() => {
    const days = [];
    const current = new Date(tableStartDate);
    current.setHours(0,0,0,0);
    const end = new Date(tableEndDate);
    end.setHours(23,59,59,999);
    while (current <= end && days.length <= 31) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [tableStartDate, tableEndDate]);

  const getRecordsForDay = (d) => {
    return initialRecords.filter(rec => {
      const rd = new Date(rec.checked_in_at);
      return rd.getDate() === d.getDate() && rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear();
    }).sort((a,b) => new Date(a.checked_in_at) - new Date(b.checked_in_at));
  };

  const shiftTable = (direction) => {
    const duration = Math.round((tableEndDate.getTime() - tableStartDate.getTime()) / 86400000) + 1;
    const s = new Date(tableStartDate);
    const e = new Date(tableEndDate);
    s.setDate(s.getDate() + (duration * direction));
    e.setDate(e.getDate() + (duration * direction));
    setTableStartDate(s);
    setTableEndDate(e);
  };

  return (
    <div className="card p-6 border border-line">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 border-b border-line pb-4">
        <h3 className="font-rajdhani text-lg font-bold text-white tracking-widest uppercase">Laporan Berkala</h3>
        <div className="flex flex-wrap items-center gap-4 bg-white/[0.02] border border-line rounded-lg p-1">
          <button onClick={() => shiftTable(-1)} className="p-1 hover:text-white text-slate-400 transition-colors"><ChevronLeft className="size-5" /></button>
          <span className="font-mono text-xs text-slate-300">
            {weekDays[0].toLocaleDateString('id-ID', {day:'2-digit', month:'short'})} - {weekDays[weekDays.length-1].toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'})}
          </span>
          <button onClick={() => shiftTable(1)} className="p-1 hover:text-white text-slate-400 transition-colors"><ChevronRight className="size-5" /></button>
          
          <div className="h-4 w-px bg-line hidden sm:block"></div>
          
          <input 
            type="date" 
            className="field h-8 text-xs !bg-transparent border-none w-auto"
            value={tableStartDate.toISOString().split('T')[0]}
            onChange={(e) => {
              if (e.target.value) setTableStartDate(new Date(e.target.value));
            }}
          />
          <span className="text-slate-500 text-xs">-</span>
          <input 
            type="date" 
            className="field h-8 text-xs !bg-transparent border-none w-auto"
            value={tableEndDate.toISOString().split('T')[0]}
            onChange={(e) => {
              if (e.target.value) setTableEndDate(new Date(e.target.value));
            }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {Array.from({ length: Math.ceil(weekDays.length / 7) }).map((_, chunkIndex) => {
          const chunk = weekDays.slice(chunkIndex * 7, (chunkIndex + 1) * 7);
          return (
            <div key={chunkIndex} className="card overflow-x-auto rounded-xl border border-line bg-black/40">
              <table className="w-full text-center text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-[#151515] text-slate-300 font-bold uppercase tracking-widest border-b border-line">
                    {chunk.map((d, i) => (
                      <th key={i} colSpan={2} className="px-4 py-3 border-r border-line last:border-r-0">
                        <div className="text-crimson-400">{DAYS[d.getDay()].toUpperCase()}</div>
                        <div className="text-[10px] font-mono mt-0.5 opacity-60">{d.toLocaleDateString('id-ID', {day:'2-digit', month:'2-digit', year:'2-digit'})}</div>
                      </th>
                    ))}
                  </tr>
                  <tr className="bg-[#0a0a0a] text-slate-400 font-bold uppercase text-[10px] border-b border-line">
                    {chunk.map((d, i) => (
                      <Fragment key={i}>
                        <th className="px-3 py-2 border-r border-line">ON DUTY</th>
                        <th className="px-3 py-2 border-r border-line last:border-r-0">OFF DUTY</th>
                      </Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-[#0f0f0f] text-slate-300 font-mono font-bold text-sm hover:bg-white/5 transition-colors">
                    {chunk.map((d, i) => {
                      const recs = getRecordsForDay(d);
                      if (recs.length === 0) {
                        return (
                          <Fragment key={i}>
                            <td className="px-3 py-4 border-r border-line text-emerald-400/30 bg-emerald-900/5">-</td>
                            <td className="px-3 py-4 border-r border-line last:border-r-0 text-slate-500/30 bg-red-900/5">-</td>
                          </Fragment>
                        );
                      }
                      return (
                        <Fragment key={i}>
                          <td className="px-3 py-2 border-r border-line text-emerald-400 bg-emerald-900/5 align-top">
                            {recs.map((r, idx) => (
                              <div key={idx} className="my-1">{new Date(r.checked_in_at).toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta", hour:"2-digit", minute:"2-digit", hour12: false })} WIB</div>
                            ))}
                          </td>
                          <td className="px-3 py-2 border-r border-line last:border-r-0 text-slate-500 bg-red-900/5 align-top">
                            {recs.map((r, idx) => (
                              <div key={idx} className="my-1">{r.checked_out_at ? new Date(r.checked_out_at).toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta", hour:"2-digit", minute:"2-digit", hour12: false }) + " WIB" : "-"}</div>
                            ))}
                          </td>
                        </Fragment>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}
