"use client";

import { useEffect, useState, useMemo, useActionState, Fragment } from "react";
import { checkInAction, checkOutAction } from "@/app/actions/attendance";
import { LogIn, LogOut, Clock as ClockIcon, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
  return weekNo;
}

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
  return new Date(d.setDate(diff));
}

export default function DashboardClient({ officer, history, todayRecord }) {
  const [now, setNow] = useState(new Date());
  
  const initialStart = getStartOfWeek(new Date());
  const initialEnd = new Date(initialStart);
  initialEnd.setDate(initialEnd.getDate() + 6);
  
  const [tableStartDate, setTableStartDate] = useState(initialStart);
  const [tableEndDate, setTableEndDate] = useState(initialEnd);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Clock data
  const dayName = DAYS[now.getDay()];
  const dateNum = now.getDate();
  const monthName = MONTHS[now.getMonth()];
  const yearNum = now.getFullYear();
  const timeString = now.toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta", hour12: false }) + " WIB";
  const weekOfMonth = Math.ceil(dateNum / 7);

  // Dynamic columns for table
  const weekDays = useMemo(() => {
    const days = [];
    const current = new Date(tableStartDate);
    current.setHours(0,0,0,0);
    const end = new Date(tableEndDate);
    end.setHours(23,59,59,999);
    
    // limit max days to 31 to prevent crash/UI break
    while (current <= end && days.length <= 31) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [tableStartDate, tableEndDate]);

  const currentTableRecords = useMemo(() => {
    const s = new Date(tableStartDate).setHours(0,0,0,0);
    const e = new Date(tableEndDate).setHours(23,59,59,999);
    return history.filter(rec => {
      const d = new Date(rec.checked_in_at).getTime();
      return d >= s && d <= e;
    });
  }, [history, tableStartDate, tableEndDate]);

  const getRecordsForDay = (d) => {
    return currentTableRecords.filter(rec => {
      const rd = new Date(rec.checked_in_at);
      return rd.getDate() === d.getDate() && rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear();
    }).sort((a,b) => new Date(a.checked_in_at) - new Date(b.checked_in_at));
  };

  // ... (keeping other parts same, but since this is multi_replace_file_content or replace_file_content I need to be careful with ranges)

  const [periodFilter, setPeriodFilter] = useState("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // Accumulation
  const filteredHistory = useMemo(() => {
    return history.filter((rec) => {
      const d = new Date(rec.checked_in_at);
      if (periodFilter === "all") return true;
      if (periodFilter === "month") {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      if (periodFilter === "week") {
        const wStart = getStartOfWeek(now).getTime();
        return d.getTime() >= wStart && d.getTime() < wStart + 7 * 86400000;
      }
      if (periodFilter === "custom") {
        if (!customStart || !customEnd) return true;
        const sDate = new Date(customStart).setHours(0,0,0,0);
        const eDate = new Date(customEnd).setHours(23,59,59,999);
        return d.getTime() >= sDate && d.getTime() <= eDate;
      }
      return true;
    });
  }, [history, periodFilter, customStart, customEnd, now]);

  const totalSeconds = filteredHistory.reduce((acc, rec) => {
    if (rec.duration_minutes) return acc + (rec.duration_minutes * 60);
    return acc;
  }, 0);
  
  let h = Math.floor(totalSeconds / 3600);
  let m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);

  if (periodFilter === "all" && officer?.manual_minutes) {
    const manMins = parseInt(officer.manual_minutes, 10) || 0;
    let totalMins = (h * 60) + m + manMins;
    if (totalMins < 0) totalMins = 0;
    h = Math.floor(totalMins / 60);
    m = totalMins % 60;
  }

  // Widget Actions
  const isCheckedIn = todayRecord && !todayRecord.checked_out_at;
  const isCheckedOut = todayRecord && todayRecord.checked_out_at;
  const [checkInState, checkInDispatch, checkInPending] = useActionState(checkInAction, null);
  const [note, setNote] = useState("");

  const shiftTable = (direction) => {
    const duration = Math.round((tableEndDate.getTime() - tableStartDate.getTime()) / 86400000) + 1;
    const s = new Date(tableStartDate);
    const e = new Date(tableEndDate);
    s.setDate(s.getDate() + (duration * direction));
    e.setDate(e.getDate() + (duration * direction));
    setTableStartDate(s);
    setTableEndDate(e);
  };
  const prevPeriod = () => shiftTable(-1);
  const nextPeriod = () => shiftTable(1);

  return (
    <div className="flex flex-col gap-8">
      {/* Realtime Clock & Akumulasi */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-6 flex flex-col justify-center items-center text-center bg-gradient-to-br from-black/40 to-[#080608]">
          <h2 className="font-orbitron text-4xl font-bold text-white tracking-widest">{timeString}</h2>
          <p className="mt-2 text-slate-400 font-rajdhani text-lg uppercase tracking-widest">
            {dayName}, {dateNum} {monthName} {yearNum}
          </p>
          <p className="mt-1 text-xs text-crimson-400 font-mono">
            Minggu ke-{weekOfMonth} di bulan ini
          </p>
        </div>

        <div className="card p-6 flex flex-col justify-center items-center text-center">
          <ClockIcon className="size-8 text-pine-400 mb-3" />
          
          <div className="flex flex-col items-center gap-2 mb-2 w-full">
            <select 
              className="field h-8 text-xs py-0 w-auto bg-transparent border-line"
              value={periodFilter} 
              onChange={(e) => setPeriodFilter(e.target.value)}
            >
              <option value="all" className="bg-[#1a1a1a]">Total Akumulasi (All-Time)</option>
              <option value="month" className="bg-[#1a1a1a]">Bulan Ini</option>
              <option value="week" className="bg-[#1a1a1a]">Minggu Ini</option>
              <option value="custom" className="bg-[#1a1a1a]">Kustom (Pilih Tanggal)</option>
            </select>
            
            {periodFilter === "custom" && (
              <div className="flex items-center gap-2 mt-2">
                <input type="date" className="field h-8 text-xs bg-transparent" value={customStart} onChange={e => setCustomStart(e.target.value)} />
                <span className="text-slate-500 text-xs">-</span>
                <input type="date" className="field h-8 text-xs bg-transparent" value={customEnd} onChange={e => setCustomEnd(e.target.value)} />
              </div>
            )}
          </div>

          <p className="mt-2 font-rajdhani text-3xl font-bold text-white">
            {h} <span className="text-sm text-slate-500">Jam</span> {m} <span className="text-sm text-slate-500">Menit</span> {s} <span className="text-sm text-slate-500">Detik</span>
          </p>
        </div>
      </div>

      {/* Action Widget */}
      <div className="card p-6 max-w-xl mx-auto w-full">
        {isCheckedIn ? (
          <div className="text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full border-2 border-crimson-500/40 bg-crimson-500/10 mb-4">
              <ClockIcon className="size-6 text-crimson-400 animate-pulse" />
            </div>
            <h2 className="font-rajdhani text-xl font-bold text-white">Sedang Bertugas</h2>
            <p className="mt-2 text-sm text-slate-400">
              Check-in: <span className="font-mono text-crimson-400">{new Date(todayRecord.checked_in_at).toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta", hour12: false })} WIB</span>
            </p>
            <form action={() => checkOutAction(todayRecord.id)} className="mt-6">
              <button type="submit" className="btn btn-danger w-full">
                <LogOut className="size-4" /> Check-Out Sekarang
              </button>
            </form>
          </div>
        ) : (
          <div>
            <h2 className="font-rajdhani text-xl font-bold text-white mb-1">Mulai Shift</h2>
            <p className="text-sm text-slate-400 mb-4">
              {todayRecord ? "Kamu sudah menyelesaikan shift sebelumnya hari ini. Mulai shift baru?" : "Rekam kehadiran kamu untuk hari ini."}
            </p>
            <form action={checkInDispatch} className="space-y-4">
              <input
                type="text"
                name="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="field"
                placeholder="Catatan (opsional)..."
              />
              <button type="submit" disabled={checkInPending} className="btn btn-primary w-full">
                {checkInPending ? <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <LogIn className="size-4" />}
                Check-In Sekarang
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Grid Table */}
      <div className="mt-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
          <h2 className="font-rajdhani text-xl font-bold text-white">DATA LSPD (Mingguan)</h2>
          <div className="flex flex-wrap items-center gap-4 bg-white/[0.02] border border-line rounded-lg p-1">
            <button onClick={prevPeriod} className="p-1 hover:text-white text-slate-400 transition-colors"><ChevronLeft className="size-5" /></button>
            <span className="font-mono text-xs text-slate-300">
              {weekDays[0].toLocaleDateString('id-ID', {day:'2-digit', month:'short'})} - {weekDays[weekDays.length-1].toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'})}
            </span>
            <button onClick={nextPeriod} className="p-1 hover:text-white text-slate-400 transition-colors"><ChevronRight className="size-5" /></button>
            
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

        {/* Info Personil (di luar tabel) */}
        <div className="card p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-line bg-gradient-to-r from-crimson-900/20 to-transparent">
          <div>
            <h3 className="font-rajdhani text-2xl font-bold text-white tracking-widest uppercase">
              Riwayat Absensi
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-sm text-crimson-400">{officer.callsign}</span>
              <span className="text-slate-500">•</span>
              <span className="font-mono text-sm text-slate-300">{officer.full_name}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            {officer.rank.split(', ').map(r => (
              <span key={r} className="px-2.5 py-1 rounded bg-crimson-500/10 border border-crimson-500/30 text-crimson-400 font-mono text-xs uppercase tracking-wider">
                {r}
              </span>
            ))}
          </div>
        </div>

        {/* Tabel Absensi (dibagi per 7 hari jika panjang) */}
        <div className="flex flex-col gap-6">
          {Array.from({ length: Math.ceil(weekDays.length / 7) }).map((_, chunkIndex) => {
            const chunk = weekDays.slice(chunkIndex * 7, (chunkIndex + 1) * 7);
            return (
              <div key={chunkIndex} className="card overflow-x-auto rounded-xl border border-line shadow-2xl">
                <table className="w-full text-center text-xs whitespace-nowrap">
                  <thead>
                    {/* Kolom Informasi vs Kolom Hari */}
                    <tr className="bg-[#151515] text-slate-300 font-bold uppercase tracking-widest border-b border-line">
                      {chunk.map((d, i) => (
                        <th key={i} colSpan={2} className="px-4 py-3 border-r border-line last:border-r-0">
                          <div className="text-crimson-400">{DAYS[d.getDay()].toUpperCase()}</div>
                          <div className="text-[10px] font-mono mt-0.5 opacity-60">{d.toLocaleDateString('id-ID', {day:'2-digit', month:'2-digit', year:'2-digit'})}</div>
                        </th>
                      ))}
                    </tr>
                    {/* ON DUTY / OFF DUTY */}
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
    </div>
  );
}
