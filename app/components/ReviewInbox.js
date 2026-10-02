"use client";

import { useActionState, useState } from "react";
import { submitReviewAction } from "@/app/actions/public";
import { Star, MessageSquareQuote, Send } from "lucide-react";

export default function ReviewInbox({ reviews = [] }) {
  const [state, formAction, pending] = useActionState(submitReviewAction, null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <section id="reviews-inbox" className="relative border-t border-line bg-[#080608] py-20">
      <div className="wrap relative">
        {reviews.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-10">
              <h2 className="font-orbitron text-3xl font-bold text-white uppercase tracking-wider">
                Ulasan Klien Kami
              </h2>
              <p className="mt-3 text-slate-400">
                Apa kata server-server partner tentang kinerja personil COP-S.
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((r) => (
                <div key={r.id} className="card p-6 flex flex-col justify-between bg-white/[0.02]">
                  <div>
                    <div className="flex items-center gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`size-4 ${i < r.rating ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]" : "text-slate-700"}`} />
                      ))}
                    </div>
                    <p className="text-slate-300 italic text-sm leading-relaxed text-pretty">
                      "{r.message}"
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-line/50 flex items-center justify-between">
                    <span className="font-rajdhani text-lg font-bold text-white">{r.name_server}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-orbitron text-2xl font-bold text-white flex items-center justify-center gap-3">
              <MessageSquareQuote className="size-6 text-crimson-400" />
              Tinggalkan Rating & Pesan
            </h2>
            <p className="mt-3 text-slate-400 text-sm">
              Bantu kami menjadi lebih baik! Bagikan pengalaman server Anda menggunakan jasa COP-S.
            </p>
          </div>

        {state?.success ? (
          <div className="card p-8 text-center bg-emerald-500/5 border-emerald-500/20">
            <div className="inline-flex items-center justify-center size-12 rounded-full bg-emerald-500/20 text-emerald-400 mb-4">
              <Star className="size-6 fill-current" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Terima kasih atas ulasan Anda!</h3>
            <p className="text-slate-400 text-sm">
              Pesan Anda telah kami terima dan akan sangat berarti bagi perkembangan COP-S ke depannya.
            </p>
          </div>
        ) : (
          <form action={formAction} className="card p-6 sm:p-8">
            <div className="grid gap-6">
              <div>
                <label className="label">Nama / Server Anda</label>
                <input 
                  type="text" 
                  name="name_server" 
                  className="field" 
                  placeholder="Misal: Budi / JRP" 
                  required 
                />
              </div>

              <div>
                <label className="label mb-2">Penilaian Anda</label>
                <div className="flex items-center gap-2 bg-black/20 p-4 rounded-xl border border-line w-fit">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star 
                        className={`size-8 ${
                          star <= (hoverRating || rating) 
                            ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" 
                            : "text-slate-700"
                        } transition-colors duration-200`} 
                      />
                    </button>
                  ))}
                  <input type="hidden" name="rating" value={rating} />
                  <span className="ml-3 font-mono text-sm font-bold text-amber-400">
                    {hoverRating || rating}.0
                  </span>
                </div>
              </div>

              <div>
                <label className="label">Pesan / Testimoni</label>
                <textarea 
                  name="message" 
                  className="field min-h-[120px]" 
                  placeholder="Ceritakan pengalaman kerja sama dengan COP-S..." 
                  required 
                />
              </div>

              {state?.error && (
                <div className="rounded-lg bg-crimson-500/10 border border-crimson-500/20 p-4 text-sm text-crimson-400">
                  {state.error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={pending} 
                className="btn btn-primary w-full py-3.5 text-base mt-2"
              >
                {pending ? (
                  "Mengirim Pesan..."
                ) : (
                  <>
                    <Send className="size-4" /> Kirim Rating & Pesan
                  </>
                )}
              </button>
            </div>
          </form>
        )}
        </div>
      </div>
    </section>
  );
}
