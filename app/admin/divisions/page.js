import { getDivisions } from "@/lib/queries";
import DivisionForm from "./DivisionForm";
import DeleteDivisionButton from "./DeleteDivisionButton";
import { Shield } from "lucide-react";

export const metadata = { title: "Manajemen Divisi — Admin COP-S" };

export default async function DivisionsPage() {
  const divisions = await getDivisions();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">
            <span className="font-mono text-slate-600">06</span>
            <span className="h-px w-6 bg-crimson-500/40" />
            Organisasi
          </p>
          <h1 className="mt-1 font-orbitron text-xl font-bold text-white flex items-center gap-2">
            <Shield className="size-5 text-crimson-400" /> Divisi
          </h1>
        </div>
        <DivisionForm mode="create" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {divisions.map((div) => (
          <div key={div.id} className="card flex flex-col overflow-hidden">
            <div className="h-40 bg-black/40 border-b border-line relative overflow-hidden flex items-center justify-center">
              {div.photo_url ? (
                <img src={div.photo_url} alt={div.name} className="w-full h-full object-cover" />
              ) : (
                <Shield className="size-12 text-slate-600" />
              )}
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-rajdhani text-lg font-bold text-white">{div.name}</h3>
                <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded border border-crimson-500/30 bg-crimson-500/10 text-crimson-400">
                  {div.tag || div.id}
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-4 flex-1 line-clamp-3">
                {div.description && div.description !== '-' ? div.description : "Belum ada deskripsi."}
              </p>
              <div className="flex items-center gap-2 pt-4 border-t border-line/50">
                <DivisionForm division={div} mode="edit" />
                <DeleteDivisionButton id={div.id} name={div.name} />
              </div>
            </div>
          </div>
        ))}
        {divisions.length === 0 && (
          <div className="col-span-full card p-10 text-center text-slate-500 font-mono text-sm border-dashed">
            Belum ada divisi terdaftar.
          </div>
        )}
      </div>
    </div>
  );
}
