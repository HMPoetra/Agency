"use client";

import { useActionState, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { createDivisionAction, updateDivisionAction } from "@/app/actions/admin";
import { Plus, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "@/app/components/ImageUpload";

export default function DivisionForm({ division, mode }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const action = mode === "edit"
    ? updateDivisionAction.bind(null, division.id)
    : createDivisionAction;

  const [state, dispatch, pending] = useActionState(action, null);

  useEffect(() => {
    if (state?.success && open) {
      toast.success(mode === "edit" ? "Divisi berhasil diperbarui!" : "Divisi berhasil ditambahkan!");
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
        className={mode === "edit" ? "btn btn-ghost btn-sm flex-1" : "btn btn-primary btn-sm"}
      >
        {mode === "edit" ? <Pencil className="size-3.5" /> : <Plus className="size-4" />}
        {mode === "edit" ? "Edit Divisi" : "Tambah Divisi Baru"}
      </button>

      {open && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg card p-6 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-rajdhani text-xl font-bold text-white">
                {mode === "edit" ? "Edit Divisi" : "Tambah Divisi"}
              </h2>
              <button type="button" onClick={() => setOpen(false)} className="text-slate-500 hover:text-white">
                <X className="size-5" />
              </button>
            </div>

            <form action={dispatch} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Nama Divisi</label>
                  <input name="name" className="field" placeholder='Mis: SWAT' defaultValue={division?.name} required />
                </div>
                <div>
                  <label className="label">Singkatan (Tag)</label>
                  <input name="tag" className="field uppercase" maxLength={10} placeholder='Mis: SWA' defaultValue={division?.tag} />
                </div>
              </div>
              
              <ImageUpload name="photo_url" defaultValue={division?.photo_url} label="URL Foto / Logo (Opsional)" />

              <div>
                <label className="label">Deskripsi</label>
                <textarea 
                  name="description" 
                  className="field min-h-[100px] resize-y" 
                  placeholder="Keterangan mengenai divisi..." 
                  defaultValue={division?.description && division.description !== '-' ? division.description : ""} 
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  name="is_visible_on_dashboard" 
                  id={`visible-${division?.id || 'new'}`} 
                  defaultChecked={division?.is_visible_on_dashboard ?? true} 
                  className="size-4 rounded border-line bg-black/40 text-crimson-500 focus:ring-crimson-500/30"
                />
                <label htmlFor={`visible-${division?.id || 'new'}`} className="text-sm text-slate-300 cursor-pointer">
                  Tampilkan divisi ini di halaman utama (Dashboard)
                </label>
              </div>

              {state?.error && (
                <p className="text-sm text-crimson-400">{state.error}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={pending} className="btn btn-primary flex-1">
                  {pending && <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                  {pending ? "Menyimpan..." : mode === "edit" ? "Simpan Perubahan" : "Tambah Divisi"}
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
