// app/admin/officers/OfficerForm.js
"use client";

import { useActionState, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { createOfficerAction, updateOfficerAction } from "@/app/actions/admin";
import { Plus, Pencil, X } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_RANKS = [
  "All Rank",
  "01. CHIEF", "02. ASSISTANT CHIEF", "03. COMMANDER", "04. CAPTAIN",
  "05. LIEUTENANT II", "06. LIEUTENANT", "07. SERGEANT II", "08. SERGEANT",
  "09. SENIOR POLICE OFFICER", "10. POLICE OFFICER III", "11. POLICE OFFICER II",
  "12. POLICE OFFICER", "13. CADET"
];
const STATUSES = ["Active", "On-Duty", "Standby", "Inactive"];
const GENDERS = ["Laki-laki", "Perempuan", "Lainnya"];

export default function OfficerForm({ officer, divisions, ranks, mode }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const activeRanks = ranks ? ranks.map(r => r.name) : DEFAULT_RANKS;

  useEffect(() => {
    setMounted(true);
  }, []);

  const action = mode === "edit"
    ? updateOfficerAction.bind(null, officer.id)
    : createOfficerAction;

  const [state, dispatch, pending] = useActionState(action, null);

  // Auto-close on success and alert
  useEffect(() => {
    if (state?.success && open) {
      toast.success(mode === "edit" ? "Data personil berhasil diperbarui!" : "Data personil berhasil ditambahkan!");
      setOpen(false);
    } else if (state?.error && open) {
      toast.error(state.error);
    }
  }, [state, open, mode]);





  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={mode === "edit" ? "btn btn-ghost btn-sm" : "btn btn-primary btn-sm w-full sm:w-auto"}
        id={mode === "edit" ? `edit-officer-${officer?.id}` : "add-officer-btn"}
      >
        {mode === "edit" ? <Pencil className="size-3.5" /> : <Plus className="size-4" />}
        {mode === "edit" ? "" : "TAMBAH PERSONIL"}
      </button>

      {open && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg card p-6 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-rajdhani text-xl font-bold text-white">
                {mode === "edit" ? "Edit Personil" : "Tambah Personil"}
              </h2>
              <button type="button" onClick={() => setOpen(false)} className="text-slate-500 hover:text-white">
                <X className="size-5" />
              </button>
            </div>

            <form action={dispatch} className="space-y-4">
              {/* ID auto-generated */}
              <div>
                <label className="label">Nama Lengkap</label>
                <input name="full_name" className="field" placeholder='Alex Reyes' defaultValue={officer?.full_name} required />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="label">Callsign</label>
                  <input name="callsign" className="field" placeholder="1-ALPHA-05" defaultValue={officer?.callsign} required />
                </div>
                <div>
                  <label className="label">Status</label>
                  <select name="status" className="field" defaultValue={officer?.status ?? "Active"} required>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Jenis Kelamin</label>
                  <select name="gender" className="field" defaultValue={officer?.gender ?? "Laki-laki"} required>
                    {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Pangkat</label>
                  <select name="rank" multiple className="field min-h-[120px]" defaultValue={officer?.rank ? officer.rank.split(", ") : []} required>
                    {[...activeRanks].map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <p className="mt-1 text-[10px] text-slate-500">Tahan Ctrl/Cmd untuk memilih lebih dari 1</p>
                </div>
                <div>
                  <label className="label">Divisi</label>
                  <select name="division" multiple className="field min-h-[120px]" defaultValue={officer?.division ? officer.division.split(", ") : ["All Division"]} required>
                    <option value="All Division">All Division</option>
                    {divisions?.filter(d => (d.name || d.id) !== "All Division").map(d => (
                      <option key={d.id} value={d.name || d.id}>{d.name || d.id}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-[10px] text-slate-500">Tahan Ctrl/Cmd untuk memilih lebih dari 1</p>
                </div>
              </div>
              <div>
                <label className="label">Keterangan Tambahan</label>
                <input name="notes" type="text" className="field" placeholder="-" defaultValue={officer?.notes} />
              </div>

              {state?.error && (
                <p className="text-sm text-crimson-400">{state.error}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={pending} className="btn btn-primary flex-1">
                  {pending && <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                  {pending ? "Menyimpan..." : mode === "edit" ? "Simpan Perubahan" : "Tambah"}
                </button>
                <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost">Batal</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
