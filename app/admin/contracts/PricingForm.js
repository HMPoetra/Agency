"use client";

import { useState, useActionState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, X, Tag, Pencil } from "lucide-react";
import { createPricingAction, updatePricingAction } from "@/app/actions/admin";
import { toast } from "sonner";

export default function PricingForm({ pricing, mode = "create" }) {
  const [open, setOpen] = useState(false);
  const action = mode === "create" ? createPricingAction : updatePricingAction.bind(null, pricing?.id);
  const [state, formAction, pending] = useActionState(action, null);
  const [mounted, setMounted] = useState(false);
  const [price, setPrice] = useState(pricing?.price_idr ? String(pricing.price_idr) : "");

  const handlePriceChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    setPrice(val);
  };

  const formatPrice = (val) => {
    if (!val) return "";
    return new Intl.NumberFormat("id-ID").format(val);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (state?.success && open) {
      toast.success(mode === "create" ? "Paket Harga berhasil ditambahkan!" : "Paket Harga berhasil diperbarui!");
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
        className={mode === "create" ? "btn btn-primary" : "btn btn-ghost btn-sm"}
      >
        {mode === "create" ? (
          <>
            <Plus className="size-4" /> Tambah Paket Harga
          </>
        ) : (
          <>
            <Pencil className="size-3.5" />
            Edit
          </>
        )}
      </button>

      {open && mounted && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-line bg-[#080608] shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h2 className="font-orbitron text-lg font-bold text-white">
                {mode === "create" ? "Tambah Paket Harga" : "Edit Paket Harga"}
              </h2>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
                <X className="size-5" />
              </button>
            </div>

            <form action={formAction} className="p-6">
              <div className="grid gap-5">
                <div>
                  <label className="label">Nama Paket (Wajib)</label>
                  <input type="text" name="name" className="field" defaultValue={pricing?.name} required placeholder="MOU - Full Station" />
                </div>
                <div>
                  <label className="label">Tag / Label (Misal: Basic, Pro, Elite)</label>
                  <input type="text" name="tag" className="field" defaultValue={pricing?.tag} placeholder="Elite" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Harga (IDR)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">Rp</span>
                      <input 
                        type="text" 
                        className="field pl-9" 
                        value={formatPrice(price)} 
                        onChange={handlePriceChange}
                        placeholder="0" 
                        required 
                      />
                      <input type="hidden" name="price_idr" value={price || "0"} />
                    </div>
                  </div>
                  <div>
                    <label className="label">Periode (Misal: Bulan)</label>
                    <input type="text" name="billing_period" className="field" defaultValue={pricing?.billing_period || "Bulan"} />
                  </div>
                </div>
                <div>
                  <label className="label">Label Tombol (CTA)</label>
                  <input type="text" name="cta_label" className="field" defaultValue={pricing?.cta_label || "Pesan Sekarang"} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Ikon (Lucide)</label>
                    <input type="text" name="icon_name" className="field" defaultValue={pricing?.icon_name || "Shield"} />
                  </div>
                  <div>
                    <label className="label">Urutan Tampil (Sort Order)</label>
                    <input type="number" name="sort_order" className="field" defaultValue={pricing?.sort_order || 0} />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    name="is_popular" 
                    id={`popular-${pricing?.id || 'new'}`} 
                    defaultChecked={pricing?.is_popular ?? false} 
                    className="size-4 rounded border-line bg-black/40 text-crimson-500 focus:ring-crimson-500/30"
                  />
                  <label htmlFor={`popular-${pricing?.id || 'new'}`} className="text-sm text-slate-300 cursor-pointer">
                    Sorot paket ini (Popular/Rekomendasi)
                  </label>
                </div>

                {state?.error && (
                  <p className="text-sm text-crimson-400">{state.error}</p>
                )}

                <div className="mt-2 flex justify-end gap-3 border-t border-line pt-5">
                  <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost">
                    Batal
                  </button>
                  <button type="submit" disabled={pending} className="btn btn-primary">
                    {pending ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
