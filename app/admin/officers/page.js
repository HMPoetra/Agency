// app/admin/officers/page.js
import { getOfficers, getDivisions, getRanks } from "@/lib/queries";
import { deleteOfficerAction } from "@/app/actions/admin";
import OfficerForm from "./OfficerForm";
import DeleteOfficerButton from "./DeleteOfficerButton";
import ManageMetadataClient from "./ManageMetadataClient";
import { Users } from "lucide-react";

export const metadata = { title: "Personil — Admin COP-S" };

export default async function OfficersPage() {
  const [officers, divisions, ranks] = await Promise.all([getOfficers(), getDivisions(), getRanks()]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">
            <span className="font-mono text-slate-600">02</span>
            <span className="h-px w-6 bg-crimson-500/40" />
            Manajemen
          </p>
          <h1 className="mt-1 font-orbitron text-xl font-bold text-white flex items-center gap-2">
            <Users className="size-5 text-crimson-400" /> Personil
          </h1>
        </div>
        <OfficerForm divisions={divisions} ranks={ranks} mode="create" />
      </div>

      <ManageMetadataClient ranks={ranks} />

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <p className="font-mono text-xs text-slate-500 uppercase tracking-[0.1em]">
            {officers.length} Personil Terdaftar
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                {["ID", "Nama", "Callsign", "Pangkat", "Divisi", "Status", "JK", "Aksi"].map((h) => (
                  <th key={h} className="whitespace-nowrap px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {officers.map((officer) => (
                <tr key={officer.id} className="border-b border-line/50 last:border-0 hover:bg-white/[0.015] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{officer.id}</td>
                  <td className="px-4 py-3 text-slate-200 font-medium">{officer.full_name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{officer.callsign}</td>
                  <td className="px-4 py-3 text-slate-300">{officer.rank}</td>
                  <td className="px-4 py-3">
                    <span className="rounded border px-2 py-0.5 font-mono text-[10px] border-crimson-500/30 bg-crimson-500/10 text-crimson-400">
                      {officer.division}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-mono ${
                      officer.status === "Active"
                        ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                        : officer.status === "On-Duty"
                        ? "border-crimson-500/25 bg-crimson-500/10 text-crimson-400"
                        : "border-amber-500/25 bg-amber-500/10 text-amber-400"
                    }`}>
                      {officer.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">
                    {officer.gender}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <OfficerForm officer={officer} divisions={divisions} ranks={ranks} mode="edit" />
                      <DeleteOfficerButton id={officer.id} name={officer.full_name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
