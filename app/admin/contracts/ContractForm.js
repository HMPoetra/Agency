// app/admin/contracts/ContractForm.js
"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { createContractAction, updateContractAction } from "@/app/actions/admin";
import { Plus, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "@/app/components/ImageUpload";
import { useFormAction } from "@/app/hooks/useFormAction";
import { useMounted } from "@/app/hooks/useMounted";

const STATUSES = ["Active", "Pending", "Expired", "Terminated"];

export default function ContractForm({ contract, mode }) {
  const [open, setOpen] = useState(false);
  const mounted = useMounted();
  const action = mode === "edit"
    ? updateContractAction.bind(null, contract.id)
    : createContractAction;
  const { handleSubmit, pending, error } = useFormAction(action, () => {
    toast.success(mode === "edit" ? "Kontrak berhasil diperbarui!" : "Kontrak berhasil ditambahkan!");
    setOpen(false);
  });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={mode === "edit" ? "btn btn-ghost btn-sm" : "btn btn-primary btn-sm"}
        id={mode === "edit" ? `edit-contract-${contract?.id}` : "add-contract-btn"}
      >
        {mode === "edit" ? <Pencil className="size-3.5" /> : <Plus className="size-4" />}
        {mode === "edit" ? "Edit" : "Tambah Kontrak"}
      </button>

      {open && mounted && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative max-h-[90vh] w-full max-w-md card p-6 z-10 overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-rajdhani text-xl font-bold text-white">
                {mode === "edit" ? "Edit Kontrak" : "Tambah Kontrak"}
              </h2>
              <button type="button" onClick={() => setOpen(false)} className="flex size-10 items-center justify-center rounded-lg text-slate-500 hover:text-white" aria-label="Tutup">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
              <div>
                <label className="label">Kode MOU</label>
                <input name="mou_code" className="field" placeholder="MOU-2026-004" defaultValue={contract?.mou_code} required />
              </div>
              <div>
                <label className="label">Nama Server</label>
                <input name="server_name" className="field" placeholder="Liberty City RP" defaultValue={contract?.server_name} required />
              </div>
              <div>
                <label className="label">Status</label>
                <select name="status" className="field" defaultValue={contract?.status ?? "Pending"} required>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Detail Kontrak</label>
                <textarea name="detail" className="field min-h-[80px]" placeholder="Full Precinct Deployment - 15 Personil 24/7" defaultValue={contract?.detail} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Jumlah Personil</label>
                  <input name="personnel_count" type="number" className="field" min="1" defaultValue={contract?.personnel_count} />
                </div>
                <div>
                  <label className="label">Tanggal Tanda Tangan</label>
                  <input 
                    name="signed_at" 
                    type="date" 
                    className="field" 
                    defaultValue={contract?.signed_at ? new Date(contract.signed_at).toISOString().split("T")[0] : ""} 
                  />
                </div>
              </div>
              <ImageUpload name="photo_url" defaultValue={contract?.photo_url || ""} label="URL Foto Server (Opsional)" />

              {error && <p className="text-sm text-crimson-400">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={pending} className="btn btn-primary flex-1">
                  {pending && <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                  {mode === "edit" ? "Simpan" : "Tambah"}
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
