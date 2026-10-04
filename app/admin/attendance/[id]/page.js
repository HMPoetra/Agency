import { requireAdmin } from "@/lib/auth";
import { getOfficerById, getAttendance } from "@/lib/queries";
import { notFound } from "next/navigation";
import OfficerAttendanceClient from "./OfficerAttendanceClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Detail Absensi Personil — Admin COP-S" };

export default async function OfficerAttendancePage({ params }) {
  await requireAdmin();
  const { id } = await params;
  
  const officer = await getOfficerById(id);
  if (!officer) notFound();

  const records = await getAttendance({ officerId: id, limit: 1000 });

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="eyebrow">
              <span className="font-mono text-slate-600">05</span>
              <span className="h-px w-6 bg-crimson-500/40" />
              Laporan Detail
            </p>
            <h1 className="mt-1 font-orbitron text-xl font-bold text-white flex items-center gap-2">
              <span className="font-mono text-crimson-400">{officer.callsign}</span>
              <span className="text-slate-500">—</span>
              {officer.full_name}
            </h1>
          </div>
          <Link href="/admin/attendance" className="btn btn-ghost">
            <ArrowLeft className="size-4" />
            Kembali
          </Link>
        </div>
        
        <OfficerAttendanceClient officer={officer} initialRecords={records} />
      </div>
    </div>
  );
}
