// app/admin/attendance/page.js
import { getAttendance, getOfficersWithHours } from "@/lib/queries";
import { ClipboardList, CheckCircle, AlertCircle } from "lucide-react";
import AttendanceClient from "./AttendanceClient";
import HoursTableClient from "@/app/absensi/HoursTableClient";

export const metadata = { title: "Data Absensi — Admin COP-S" };

export default async function AttendancePage() {
  const [records, allOfficers] = await Promise.all([
    getAttendance({ limit: 1000 }),
    getOfficersWithHours()
  ]);

  const totalToday = records.filter(
    (r) => new Date(r.checked_in_at).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-6">
          <p className="eyebrow">
            <span className="font-mono text-slate-600">05</span>
            <span className="h-px w-6 bg-crimson-500/40" />
            Laporan
          </p>
          <h1 className="mt-1 font-orbitron text-xl font-bold text-white flex items-center gap-2">
            <ClipboardList className="size-5 text-crimson-400" /> Data Absensi
          </h1>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="card p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Absensi Hari Ini</p>
            <p className="mt-2 font-orbitron text-2xl font-bold text-white">{totalToday}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Total Records</p>
            <p className="mt-2 font-orbitron text-2xl font-bold text-white">{records.length}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Sedang Aktif</p>
            <p className="mt-2 font-orbitron text-2xl font-bold text-amber-400">
              {records.filter((r) => !r.checked_out_at).length}
            </p>
          </div>
        </div>

        <AttendanceClient initialRecords={records} officers={allOfficers} />
      </div>

      <HoursTableClient officers={allOfficers} isAdmin={true} />
    </div>
  );
}
