"use client";

import { useState, useMemo, Fragment } from "react";
import { ChevronLeft, ChevronRight, Server } from "lucide-react";

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

// Ekstrak nama server dari catatan absensi
function getServerNameFromRecord(rec) {
  const match = rec.note?.match(/^\[(.*?)\]/);
  if (match) return match[1];
  if (rec.note?.toLowerCase().includes("7glory")) return "7GloryRP";
  return "MoxieRP";
}

// Cek apakah record cocok dengan server yang dipilih
function isRecordMatchingServer(rec, target) {
  if (!target || target === "all") return true;
  const s = getServerNameFromRecord(rec).toLowerCase().trim();
  const t = target.toLowerCase().trim();
  if (t === "moxie" || t === "moxierp") {
    return s === "moxie" || s === "moxierp";
  }
  if (t === "7glory" || t === "7gloryrp") {
    return s === "7glory" || s === "7gloryrp";
  }
  return s === t;
}

export default function OfficerAttendanceClient({
  officer,
  initialRecords = [],
  servers = [],
  initialServer = null,
}) {
  // Pilihan server (default ke initialServer atau server visual terdepan seperti 7GloryRP)
  const [selectedServer, setSelectedServer] = useState(() => {
    if (initialServer) return initialServer;
    return servers[0]?.name || "7GloryRP";
  });

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
    current.setHours(0, 0, 0, 0);
    const end = new Date(tableEndDate);
    end.setHours(23, 59, 59, 999);
    while (current <= end && days.length <= 31) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [tableStartDate, tableEndDate]);

  const getRecordsForDay = (d) => {
    return initialRecords
      .filter((rec) => {
        if (!isRecordMatchingServer(rec, selectedServer)) return false;
        const rd = new Date(rec.checked_in_at);
        return (
          rd.getDate() === d.getDate() &&
          rd.getMonth() === d.getMonth() &&
          rd.getFullYear() === d.getFullYear()
        );
      })
      .sort((a, b) => new Date(a.checked_in_at) - new Date(b.checked_in_at));
  };

  const shiftTable = (direction) => {
    const duration =
      Math.round((tableEndDate.getTime() - tableStartDate.getTime()) / 86400000) + 1;
    const s = new Date(tableStartDate);
    const e = new Date(tableEndDate);
    s.setDate(s.getDate() + duration * direction);
    e.setDate(e.getDate() + duration * direction);
    setTableStartDate(s);
    setTableEndDate(e);
  };

  return (
    <div className="card p-4 sm:p-6 border border-line space-y-6">
      {/* ── BAR FILTER SERVER ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-line pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Server:
          </span>
          <div className="inline-flex flex-wrap rounded-lg bg-black/40 p-1 border border-line gap-1">
            {servers.map((s) => {
              const isActive =
                selectedServer.toLowerCase() === (s.name || "").toLowerCase();
              return (
                <button
                  key={s.id || s.name}
                  type="button"
                  onClick={() => setSelectedServer(s.name)}
                  className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded transition-colors ${
                    isActive
                      ? "bg-crimson-600 text-white font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {s.name}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setSelectedServer("all")}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded transition-colors ${
                selectedServer === "all"
                  ? "bg-crimson-600 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Semua Server
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.03] border border-line text-xs font-mono text-slate-300">
          <Server className="size-3.5 text-crimson-400" />
          <span>
            Server:{" "}
            <strong className="text-white">
              {selectedServer === "all" ? "Semua Server" : selectedServer}
            </strong>
          </span>
        </div>
      </div>

      {/* ── KONTROL WAKTU LAPORAN BERKALA (RESPONSIF MOBILE) ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-line pb-4">
        <h3 className="font-rajdhani text-lg font-bold text-white tracking-widest uppercase">
          Laporan Berkala
        </h3>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-white/[0.02] border border-line rounded-lg p-1.5 w-full sm:w-auto">
          {/* Navigasi Periode */}
          <div className="flex items-center justify-between sm:justify-start gap-1">
            <button
              onClick={() => shiftTable(-1)}
              className="p-2 hover:text-white text-slate-400 transition-colors rounded hover:bg-white/5"
              aria-label="Minggu sebelumnya"
            >
              <ChevronLeft className="size-4 sm:size-5" />
            </button>
            <span className="font-mono text-xs text-slate-300 px-1 text-center font-medium">
              {weekDays[0]?.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
              })}{" "}
              -{" "}
              {weekDays[weekDays.length - 1]?.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
            <button
              onClick={() => shiftTable(1)}
              className="p-2 hover:text-white text-slate-400 transition-colors rounded hover:bg-white/5"
              aria-label="Minggu berikutnya"
            >
              <ChevronRight className="size-4 sm:size-5" />
            </button>
          </div>

          <div className="h-4 w-px bg-line hidden sm:block"></div>

          {/* Date Picker Input */}
          <div className="flex items-center justify-center gap-1 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-line/40">
            <input
              type="date"
              className="field h-8 sm:h-9 text-xs !bg-transparent border-none w-28 sm:w-auto text-slate-200 cursor-pointer p-0 text-center"
              value={tableStartDate.toISOString().split("T")[0]}
              onChange={(e) => {
                if (e.target.value) setTableStartDate(new Date(e.target.value));
              }}
            />
            <span className="text-slate-500 text-xs px-1">-</span>
            <input
              type="date"
              className="field h-8 sm:h-9 text-xs !bg-transparent border-none w-28 sm:w-auto text-slate-200 cursor-pointer p-0 text-center"
              value={tableEndDate.toISOString().split("T")[0]}
              onChange={(e) => {
                if (e.target.value) setTableEndDate(new Date(e.target.value));
              }}
            />
          </div>
        </div>
      </div>

      {/* ── TABEL KALENDER MINGGUAN (DESKTOP & MOBILE FRIENDLY) ─── */}
      <div className="flex flex-col gap-6">
        {Array.from({ length: Math.ceil(weekDays.length / 7) }).map(
          (_, chunkIndex) => {
            const chunk = weekDays.slice(chunkIndex * 7, (chunkIndex + 1) * 7);
            return (
              <div key={chunkIndex} className="space-y-3">
                {/* 1. Tampilan Desktop: Tabel 7 Kolom Asli (Layar Sedang & Besar) */}
                <div className="hidden md:block card overflow-x-auto rounded-xl border border-line bg-black/40">
                  <table className="w-full text-center text-xs whitespace-nowrap">
                    <thead>
                      <tr className="bg-[#151515] text-slate-300 font-bold uppercase tracking-widest border-b border-line">
                        {chunk.map((d, i) => (
                          <th
                            key={i}
                            colSpan={2}
                            className="px-4 py-3 border-r border-line last:border-r-0"
                          >
                            <div className="text-crimson-400">
                              {DAYS[d.getDay()].toUpperCase()}
                            </div>
                            <div className="text-[10px] font-mono mt-0.5 opacity-60">
                              {d.toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "2-digit",
                              })}
                            </div>
                          </th>
                        ))}
                      </tr>
                      <tr className="bg-[#0a0a0a] text-slate-400 font-bold uppercase text-[10px] border-b border-line">
                        {chunk.map((_, i) => (
                          <Fragment key={i}>
                            <th className="px-3 py-2 border-r border-line">
                              ON DUTY
                            </th>
                            <th className="px-3 py-2 border-r border-line last:border-r-0">
                              OFF DUTY
                            </th>
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
                                <td className="px-3 py-4 border-r border-line text-emerald-400/30 bg-emerald-900/5">
                                  -
                                </td>
                                <td className="px-3 py-4 border-r border-line last:border-r-0 text-slate-500/30 bg-red-900/5">
                                  -
                                </td>
                              </Fragment>
                            );
                          }
                          return (
                            <Fragment key={i}>
                              <td className="px-3 py-2 border-r border-line text-emerald-400 bg-emerald-900/5 align-top">
                                {recs.map((r, idx) => (
                                  <div key={idx} className="my-1">
                                    {new Date(
                                      r.checked_in_at
                                    ).toLocaleTimeString("id-ID", {
                                      timeZone: "Asia/Jakarta",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: false,
                                    })}{" "}
                                    WIB
                                  </div>
                                ))}
                              </td>
                              <td className="px-3 py-2 border-r border-line last:border-r-0 text-slate-500 bg-red-900/5 align-top">
                                {recs.map((r, idx) => (
                                  <div key={idx} className="my-1">
                                    {r.checked_out_at
                                      ? new Date(
                                          r.checked_out_at
                                        ).toLocaleTimeString("id-ID", {
                                          timeZone: "Asia/Jakarta",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          hour12: false,
                                        }) + " WIB"
                                      : "-"}
                                  </div>
                                ))}
                              </td>
                            </Fragment>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 2. Tampilan Mobile Friendly: Kartu Harian Vertikal (Layar Ponsel) */}
                <div className="md:hidden space-y-3">
                  {chunk.map((d, i) => {
                    const recs = getRecordsForDay(d);
                    const hasDuty = recs.length > 0;
                    const hasActive = recs.some((r) => !r.checked_out_at);

                    return (
                      <div
                        key={i}
                        className={`rounded-xl border transition-colors overflow-hidden ${
                          hasDuty
                            ? "bg-black/40 border-line"
                            : "bg-black/20 border-line/40 opacity-70"
                        }`}
                      >
                        {/* Header Hari */}
                        <div className="bg-[#151515] px-3.5 py-2.5 border-b border-line flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-crimson-400 font-bold font-mono text-xs tracking-wider">
                              {DAYS[d.getDay()].toUpperCase()}
                            </span>
                            <span className="text-slate-400 font-mono text-[11px]">
                              {d.toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                            </span>
                          </div>

                          <div>
                            {!hasDuty ? (
                              <span className="text-[10px] font-mono text-slate-500 px-2 py-0.5 rounded bg-white/[0.02] border border-line">
                                Tidak Ada
                              </span>
                            ) : hasActive ? (
                              <span className="text-[10px] font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 animate-pulse">
                                Sedang Aktif
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                                {recs.length} Sesi
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Grid Kolom ON DUTY & OFF DUTY */}
                        <div className="grid grid-cols-2 divide-x divide-line text-xs font-mono">
                          {/* ON DUTY */}
                          <div className="p-3 bg-emerald-950/10">
                            <p className="text-[10px] uppercase font-bold text-emerald-400/80 tracking-widest pb-1.5 border-b border-emerald-500/20 mb-2 text-center">
                              ON DUTY
                            </p>
                            {!hasDuty ? (
                              <p className="text-slate-600 text-center py-2">-</p>
                            ) : (
                              <div className="space-y-1.5 text-emerald-400 font-semibold text-center">
                                {recs.map((r, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20"
                                  >
                                    {new Date(
                                      r.checked_in_at
                                    ).toLocaleTimeString("id-ID", {
                                      timeZone: "Asia/Jakarta",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: false,
                                    })}{" "}
                                    WIB
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* OFF DUTY */}
                          <div className="p-3 bg-red-950/10">
                            <p className="text-[10px] uppercase font-bold text-crimson-400/80 tracking-widest pb-1.5 border-b border-crimson-500/20 mb-2 text-center">
                              OFF DUTY
                            </p>
                            {!hasDuty ? (
                              <p className="text-slate-600 text-center py-2">-</p>
                            ) : (
                              <div className="space-y-1.5 text-slate-300 font-semibold text-center">
                                {recs.map((r, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-white/5 px-2 py-1 rounded border border-line"
                                  >
                                    {r.checked_out_at ? (
                                      `${new Date(
                                        r.checked_out_at
                                      ).toLocaleTimeString("id-ID", {
                                        timeZone: "Asia/Jakarta",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: false,
                                      })} WIB`
                                    ) : (
                                      <span className="text-amber-400 font-bold uppercase text-[10px] animate-pulse">
                                        Aktif
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}
