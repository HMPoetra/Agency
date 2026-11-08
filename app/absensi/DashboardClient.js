"use client";

import { useEffect, useState, useActionState } from "react";
import { checkInAction, checkOutAction } from "@/app/actions/attendance";
import { LogIn, LogOut, Clock, CalendarClock, Activity, Server } from "lucide-react";

const TZ = "Asia/Jakarta";

function jakartaKey(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
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

function fmtDuration(totalMinutes) {
  const mins = Math.max(0, Math.round(Number(totalMinutes) || 0));
  return `${Math.floor(mins / 60)}j ${mins % 60}m`;
}

export default function DashboardClient({ officer, history = [], todayRecord, servers = [] }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateString = now.toLocaleDateString("id-ID", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeString = now.toLocaleTimeString("id-ID", { timeZone: TZ, hour12: false }) + " WIB";

  const isCheckedIn = todayRecord && !todayRecord.checked_out_at;
  const checkInTime = todayRecord
    ? new Date(todayRecord.checked_in_at).toLocaleTimeString("id-ID", { timeZone: TZ, hour12: false }) + " WIB"
    : null;

  const serverMatch = todayRecord?.note?.match(/^\[(.*?)\]/);
  const checkedInServer = serverMatch ? serverMatch[1] : null;
  const cleanNote = todayRecord?.note ? todayRecord.note.replace(/^\[.*?\]\s*/, "") : "";

  // Jam minggu ini (Senin–Minggu, WIB)
  const weekStart = mondayOf(jakartaKey(now));
  const weekKeys = new Set(Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)));

  const activeElapsed = isCheckedIn && todayRecord.checked_in_at
    ? Math.max(1, Math.round((now.getTime() - new Date(todayRecord.checked_in_at).getTime()) / 60000))
    : 0;

  const weekMinutes = history.reduce(
    (acc, rec) => (weekKeys.has(jakartaKey(rec.checked_in_at)) ? acc + (Number(rec.duration_minutes) || 0) : acc),
    0
  ) + activeElapsed;

  // Total akumulasi (sistem + manual)
  const totalMinutes =
    history.reduce((acc, rec) => acc + (Number(rec.duration_minutes) || 0), 0) +
    (parseInt(officer?.manual_minutes, 10) || 0) + activeElapsed;

  const availableServers = servers && servers.length > 0
    ? servers
    : [
        { id: "7glory", name: "7GloryRP" },
        { id: "moxie", name: "MoxieRP" },
      ];

  const [selectedServer, setSelectedServer] = useState(
    () => availableServers[0]?.name || "7GloryRP"
  );

  const [checkInState, checkInDispatch, checkInPending] = useActionState(checkInAction, null);
  const [note, setNote] = useState("");

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="card p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">
              <span className="h-px w-6 bg-crimson-500/40" />
              Dashboard Personil
            </p>
            <h1 className="mt-2 font-orbitron text-xl font-bold text-white sm:text-2xl">
              {officer.full_name}
            </h1>
            <p className="mt-1 font-mono text-xs text-slate-500">
              {officer.callsign} <span className="text-slate-600">•</span> {officer.rank}
            </p>
          </div>
          <div className="sm:text-right">
            <p
              className="font-orbitron text-3xl font-bold tracking-widest text-white tabular-nums sm:text-4xl"
              suppressHydrationWarning
            >
              {timeString}
            </p>
            <p
              className="mt-1 font-rajdhani text-sm uppercase tracking-widest text-slate-400"
              suppressHydrationWarning
            >
              {dateString}
            </p>
          </div>
        </div>
      </div>

      {/* Kartu ringkasan */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Jam Minggu Ini"
          value={fmtDuration(weekMinutes)}
          sub="Senin – Minggu (WIB)"
          icon={CalendarClock}
          tone="crimson"
        />
        <StatCard
          label="Total Jam"
          value={fmtDuration(totalMinutes)}
          sub="Akumulasi sistem + manual"
          icon={Clock}
          tone="amber"
        />
        <StatCard
          label="Status Shift"
          value={isCheckedIn ? "Aktif" : "Off Duty"}
          sub={
            isCheckedIn
              ? `${checkedInServer ? `${checkedInServer} • ` : ""}Mulai ${checkInTime}`
              : "Belum check-in hari ini"
          }
          icon={Activity}
          tone={isCheckedIn ? "emerald" : "slate"}
        />
      </div>

      {/* Widget check-in */}
      <div className="card p-6 sm:p-8">
        {isCheckedIn ? (
          <div className="flex flex-col items-center gap-5 text-center">
            <span className="relative flex size-20 items-center justify-center rounded-full border-2 border-emerald-500/40 bg-emerald-500/10">
              <span className="absolute inline-flex size-20 animate-ping rounded-full bg-emerald-500/10" />
              <Clock className="size-8 text-emerald-400" />
            </span>
            <div>
              <h2 className="font-rajdhani text-2xl font-bold text-white">Sedang Bertugas</h2>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-400">
                {checkedInServer && (
                  <>
                    <span className="inline-flex items-center gap-1 font-mono text-xs px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold">
                      <Server className="size-3.5" /> {checkedInServer}
                    </span>
                    <span className="text-slate-600">•</span>
                  </>
                )}
                <p>
                  Check-in: <span className="font-mono text-emerald-400">{checkInTime}</span>
                </p>
              </div>
              {cleanNote && (
                <p className="mt-1 text-xs text-slate-500 italic">
                  Catatan: &ldquo;{cleanNote}&rdquo;
                </p>
              )}
            </div>
            <form action={() => checkOutAction(todayRecord.id)} className="w-full max-w-sm">
              <button type="submit" className="btn btn-danger w-full">
                <LogOut className="size-4" /> Check-Out Sekarang
              </button>
            </form>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-sm">
            <div className="flex flex-col items-center gap-4 text-center">
              <span className="flex size-16 items-center justify-center rounded-full border-2 border-crimson-500/40 bg-crimson-500/10">
                <LogIn className="size-7 text-crimson-400" />
              </span>
              <div>
                <h2 className="font-rajdhani text-2xl font-bold text-white">Mulai Shift</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {todayRecord
                    ? "Kamu sudah menyelesaikan shift sebelumnya hari ini. Mulai shift baru?"
                    : "Pilih server tujuan dan rekam kehadiran kamu."}
                </p>
              </div>
            </div>
            <form action={checkInDispatch} className="mt-5 space-y-4">
              {/* Pilihan Server */}
              <div>
                <label className="label">Pilih Server Roleplay</label>
                <div className="flex flex-wrap gap-2">
                  {availableServers.map((s) => {
                    const isSelected = selectedServer === s.name;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedServer(s.name)}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-mono transition-all ${
                          isSelected
                            ? "bg-crimson-600 border border-crimson-500 text-white font-bold shadow-md shadow-crimson-900/30"
                            : "bg-white/[0.03] border border-line text-slate-400 hover:text-white hover:bg-white/[0.06]"
                        }`}
                      >
                        <Server className="size-3.5" />
                        <span>{s.name}</span>
                      </button>
                    );
                  })}
                </div>
                <input type="hidden" name="server" value={selectedServer} />
              </div>

              <div>
                <label htmlFor="shift-note" className="label">Catatan (opsional)</label>
                <input
                  id="shift-note"
                  type="text"
                  name="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Mis. Duty harian / patroli"
                  className="field"
                />
              </div>

              {checkInState?.error && (
                <p className="text-sm text-crimson-400">{checkInState.error}</p>
              )}

              <button type="submit" disabled={checkInPending} className="btn btn-primary w-full">
                {checkInPending ? (
                  <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <LogIn className="size-4" />
                )}
                Check-In ke {selectedServer}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, tone = "slate" }) {
  const tones = {
    crimson: "border-crimson-500/30 bg-crimson-500/10 text-crimson-400",
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    slate: "border-line bg-white/5 text-slate-400",
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{label}</p>
        <span className={`flex size-9 items-center justify-center rounded-lg border ${tones[tone]}`}>
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 font-orbitron text-2xl font-bold text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}
