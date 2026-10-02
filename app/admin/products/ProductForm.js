"use client";

import { useState, useActionState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, X, Pencil } from "lucide-react";
import { createProductAction, updateProductAction } from "@/app/actions/admin";
import { toast } from "sonner";

export default function ProductForm({ product, mode = "create" }) {
  const [open, setOpen] = useState(false);
  const action = mode === "create" ? createProductAction : updateProductAction.bind(null, product?.id);
  const [state, formAction, pending] = useActionState(action, null);
  const [mounted, setMounted] = useState(false);
  const [price, setPrice] = useState(product?.price_idr ? String(product.price_idr) : "");

  const handlePriceChange = (e) => {
    // Remove non-digits
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
      toast.success(mode === "create" ? "Aset berhasil ditambahkan!" : "Aset berhasil diperbarui!");
      setOpen(false);
    } else if (state?.error && open) {
      toast.error(state.error);
    }
  }, [state, open, mode]);

  const initialFeatures = product?.features?.join("\n") || "";
  const initialPhotos = product?.photo_urls 
    ? (typeof product.photo_urls === 'string' ? JSON.parse(product.photo_urls) : product.photo_urls).join("\n") 
    : "";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={mode === "create" ? "btn btn-primary" : "btn btn-ghost btn-sm"}
      >
        {mode === "create" ? (
          <>
            <Plus className="size-4" /> Tambah Script/Asset
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
          <div className="relative w-full max-w-2xl rounded-2xl border border-line bg-[#080608] shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h2 className="font-orbitron text-lg font-bold text-white">
                {mode === "create" ? "Tambah Script / Asset" : "Edit Script / Asset"}
              </h2>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
                <X className="size-5" />
              </button>
            </div>

            <form action={formAction} className="p-6">
              <div className="grid gap-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Judul (Wajib)</label>
                    <input type="text" name="title" className="field" defaultValue={product?.title} required placeholder="Cops CAD System" />
                  </div>
                  <div>
                    <label className="label">Kategori</label>
                    <select name="category" className="field" defaultValue={product?.category || "Script"}>
                      <option value="Script">Script</option>
                      <option value="MLO">MLO</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Vehicle">Vehicle</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Deskripsi</label>
                  <textarea name="description" className="field min-h-[80px]" defaultValue={product?.description} placeholder="Deskripsi singkat produk..." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      {/* Hidden input to pass actual numeric value to server action */}
                      <input type="hidden" name="price_idr" value={price || "0"} />
                    </div>
                  </div>
                  <div>
                    <label className="label">URL Video (Opsional)</label>
                    <input type="url" name="video_url" className="field" defaultValue={product?.video_url} placeholder="https://youtube.com/..." />
                  </div>
                </div>

                <div>
                  <label className="label">Fitur (1 fitur per baris)</label>
                  <textarea name="features" className="field min-h-[120px]" defaultValue={initialFeatures} placeholder="Optimized&#10;Standalone&#10;Easy config" />
                </div>

                <div>
                  <label className="label">URL Foto (1 URL per baris)</label>
                  <textarea name="photo_urls" className="field min-h-[100px]" defaultValue={initialPhotos} placeholder="https://media.discordapp.net/...&#10;https://cdn.discordapp.com/..." />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    name="is_active" 
                    id={`active-${product?.id || 'new'}`} 
                    defaultChecked={product ? product.is_active : true} 
                    className="size-4 rounded border-line bg-black/40 text-crimson-500 focus:ring-crimson-500/30"
                  />
                  <label htmlFor={`active-${product?.id || 'new'}`} className="text-sm text-slate-300 cursor-pointer">
                    Aktif (Tampilkan di halaman utama)
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
