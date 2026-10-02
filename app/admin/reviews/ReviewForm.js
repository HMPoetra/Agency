"use client";

import { useState, useActionState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Pencil, Star } from "lucide-react";
import { updateReviewAction } from "@/app/actions/admin";
import { toast } from "sonner";

export default function ReviewForm({ review }) {
  const [open, setOpen] = useState(false);
  const action = updateReviewAction.bind(null, review.id);
  const [state, formAction, pending] = useActionState(action, null);
  const [mounted, setMounted] = useState(false);
  const [rating, setRating] = useState(review?.rating || 5);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (state?.success && open) {
      toast.success("Rating & Pesan berhasil diperbarui!");
      setOpen(false);
    } else if (state?.error && open) {
      toast.error(state.error);
    }
  }, [state, open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-ghost btn-sm"
      >
        <Pencil className="size-3.5" />
        Edit
      </button>

      {open && mounted && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-line bg-[#080608] shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h2 className="font-orbitron text-lg font-bold text-white">
                Edit Rating & Pesan
              </h2>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
                <X className="size-5" />
              </button>
            </div>

            <form action={formAction} className="p-6">
              <div className="grid gap-5">
                <div>
                  <label className="label">Nama / Server</label>
                  <input type="text" name="name_server" className="field" defaultValue={review?.name_server} required />
                </div>

                <div>
                  <label className="label">Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`transition-colors ${star <= rating ? "text-amber-400" : "text-slate-600 hover:text-amber-400/50"}`}
                      >
                        <Star className="size-8 fill-current" />
                      </button>
                    ))}
                    <input type="hidden" name="rating" value={rating} />
                  </div>
                </div>

                <div>
                  <label className="label">Pesan</label>
                  <textarea name="message" className="field min-h-[100px]" defaultValue={review?.message} required />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    name="is_published" 
                    id={`publish-${review?.id}`} 
                    defaultChecked={review?.is_published} 
                    className="size-4 rounded border-line bg-black/40 text-crimson-500 focus:ring-crimson-500/30"
                  />
                  <label htmlFor={`publish-${review?.id}`} className="text-sm text-slate-300 cursor-pointer">
                    Tampilkan ulasan ini di beranda utama
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
