// app/admin/page.js — Dashboard Overview
import { getDashboardSummary, getOfficers, getAttendance } from "@/lib/queries";
import { getSession } from "@/lib/auth";
import {
  Users, FileText, Clock, TrendingUp,
  CheckCircle, AlertCircle, Shield,
} from "lucide-react";

export default async function AdminDashboard() {
  const [session, summary, recentAttendance] = await Promise.all([
    getSession(),
    getDashboardSummary(),
    getAttendance({ limit: 5 }),
  ]);

  const o = summary.officers;
  const c = summary.contracts;
  const a = summary.attendance;

  const statCards = [
    {
      label: "Total Personil",
      value: o.total,
      sub: `${o.active} Active · ${o.on_duty} On-Duty`,
      icon: Users,
      color: "crimson",
    },
    {
      label: "Kontrak Aktif",
      value: c.active,
      sub: `${c.pending} Pending · ${c.total} Total`,
      icon: FileText,
      color: "amber",
    },
    {
      label: "Absensi Hari Ini",
      value: a.today,
      sub: "personil check-in hari ini",
      icon: Clock,
      color: "emerald",
    },
    {
      label: "Standby",
      value: o.standby,
      sub: "personil standby",
      icon: Shield,
      color: "slate",
    },
  ];

  const colorMap = {
    crimson: "border-crimson-500/25 bg-crimson-500/10 text-crimson-400",
    amber:   "border-amber-500/25 bg-amber-500/10 text-amber-400",
    emerald: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
    slate:   "border-slate-500/25 bg-slate-500/10 text-slate-400",
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="eyebrow">
          <span className="font-mono text-slate-600">ADMIN</span>
          <span className="h-px w-6 bg-crimson-500/40" />
          Dashboard
        </p>
        <h1 className="mt-2 font-orbitron text-2xl font-bold text-white">
          Selamat datang, {session?.username}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
          })}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{label}</p>
              <span className={`flex size-8 items-center justify-center rounded-lg border ${colorMap[color]}`}>
                <Icon className="size-4" />
              </span>
            </div>
            <p className="mt-3 font-orbitron text-3xl font-bold text-white">{value}</p>
            <p className="mt-1 text-xs text-slate-500">{sub}</p>
          </div>
        ))}
      </div>

      {/* Recent Attendance */}
      <div className="mt-8">
        <h2 className="flex items-center gap-2 font-rajdhani text-lg font-bold text-white">
          <Clock className="size-4 text-crimson-400" />
          Absensi Terbaru
        </h2>
        <div className="mt-4 card overflow-hidden">
          {recentAttendance.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-500">
              Belum ada absensi hari ini.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  {["Personil", "Callsign", "Divisi", "Check-In", "Check-Out", "Status"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentAttendance.map((rec) => (
                  <tr key={rec.id} className="border-b border-line/50 last:border-0 hover:bg-white/[0.015] transition-colors">
                    <td className="px-4 py-3 text-slate-200">{rec.full_name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{rec.callsign}</td>
                    <td className="px-4 py-3 text-slate-400">{rec.division}</td>
                    <td className="px-4 py-3 font-mono text-crimson-400">
                      {new Date(rec.checked_in_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400">
                      {rec.checked_out_at
                        ? new Date(rec.checked_out_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {rec.checked_out_at ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                          <CheckCircle className="size-3" /> Selesai
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-400">
                          <AlertCircle className="size-3" /> Aktif
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
