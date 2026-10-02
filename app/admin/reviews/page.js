import { getAllReviews } from "@/lib/queries";
import { deleteReviewAction, toggleReviewPublishAction } from "@/app/actions/admin";
import ReviewForm from "./ReviewForm";
import DeleteButton from "@/app/components/DeleteButton";
import { MessageSquareQuote, Trash2, Star, CheckCircle2, XCircle } from "lucide-react";

export const metadata = { title: "Rating & Pesan — Admin COP-S" };

export default async function ReviewsPage() {
  const reviews = await getAllReviews();

  return (
    <div className="space-y-12">
      <section>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">
              <span className="font-mono text-slate-600">07</span>
              <span className="h-px w-6 bg-crimson-500/40" />
              Interaksi
            </p>
            <h1 className="mt-1 font-orbitron text-xl font-bold text-white flex items-center gap-2">
              <MessageSquareQuote className="size-5 text-crimson-400" /> Rating & Pesan
            </h1>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="card p-8 text-center text-slate-400">
            Belum ada rating atau pesan yang masuk.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {reviews.map((review) => (
              <div key={review.id} className="card flex flex-col p-5">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`size-4 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-700"}`} />
                    ))}
                  </div>
                  {review.is_published ? (
                    <form action={toggleReviewPublishAction.bind(null, review.id, false)}>
                      <button type="submit" className="flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] tracking-[0.1em] text-emerald-400 hover:bg-emerald-500/20 transition-colors" title="Klik untuk menyembunyikan">
                        <CheckCircle2 className="size-3" /> TAMPIL
                      </button>
                    </form>
                  ) : (
                    <form action={toggleReviewPublishAction.bind(null, review.id, true)}>
                      <button type="submit" className="flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] tracking-[0.1em] text-amber-400 hover:bg-amber-500/20 transition-colors" title="Klik untuk menampilkan">
                        <XCircle className="size-3" /> DISEMBUNYIKAN
                      </button>
                    </form>
                  )}
                </div>
                
                <h3 className="font-rajdhani text-lg font-bold text-white">{review.name_server}</h3>
                
                <div className="mt-3 flex-1">
                  <p className="text-sm text-slate-400 italic">"{review.message}"</p>
                </div>
                
                <div className="mt-4 text-[10px] text-slate-600 font-mono">
                  Dibuat: {new Date(review.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                
                <div className="mt-4 flex gap-2 border-t border-line pt-4">
                  <ReviewForm review={review} />
                  <DeleteButton action={deleteReviewAction.bind(null, review.id)} itemName="Rating & Pesan" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
