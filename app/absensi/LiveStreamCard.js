"use client";

import { useActionState, useState } from "react";
import { updateLiveUrlAction } from "@/app/actions/profile";
import { Radio, Save, ExternalLink, CheckCircle2 } from "lucide-react";

function getEmbed(url) {
  if (!url) return null;
  const u = url.trim();
  const yt = u.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|live\/|shorts\/))([\w-]{11})/);
  if (yt) return { label: "YouTube", embed: `https://www.youtube.com/embed/${yt[1]}`, aspect: "aspect-video" };
  const tt = u.match(/tiktok\.com\/(?:@[\w.-]+\/video\/|v\/)(\d+)/) || u.match(/tiktok\.com\/.+\/video\/(\d+)/);
  if (tt) return { label: "TikTok", embed: `https://www.tiktok.com/embed/v2/${tt[1]}`, aspect: "aspect-[9/16] max-w-xs mx-auto" };
  return { label: "Link", embed: null };
}

export default function LiveStreamCard({ officer }) {
  const [state, formAction, pending] = useActionState(updateLiveUrlAction, null);
  const [ytUrl, setYtUrl] = useState(officer?.youtube_url || (officer?.live_url?.includes("youtu") ? officer.live_url : ""));
  const [ttUrl, setTtUrl] = useState(officer?.tiktok_url || (officer?.live_url?.includes("tiktok") ? officer.live_url : ""));

  const ytInfo = ytUrl ? getEmbed(ytUrl) : null;
  const ttInfo = ttUrl ? getEmbed(ttUrl) : null;

  return (
    <div className="card p-6 border border-line">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg border border-crimson-500/30 bg-crimson-500/10 text-crimson-400">
          <Radio className="size-4" />
        </span>
        <div>
          <h2 className="font-rajdhani text-xl font-bold text-white">Media Sosial & Live Streaming</h2>
          <p className="text-xs text-slate-500">
            Tautkan channel/video YouTube dan akun TikTok kamu. Tampil di Roster Anggota.
          </p>
        </div>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="officer_id" value={officer?.id || ""} />
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="youtube_url" className="label">Link YouTube</label>
            <input
              id="youtube_url"
              type="url"
              name="youtube_url"
              value={ytUrl}
              onChange={(e) => setYtUrl(e.target.value)}
              placeholder="https://youtube.com/@channel atau link live/video"
              className="field"
            />
            {ytInfo && (
              <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                {ytInfo.embed ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="size-3" /> Embed YouTube aktif
                  </span>
                ) : (
                  <span className="text-amber-400">Link channel/eksternal</span>
                )}
                <a href={ytUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-slate-400 hover:text-white">
                  Cek <ExternalLink className="size-3" />
                </a>
              </p>
            )}
          </div>

          <div>
            <label htmlFor="tiktok_url" className="label">Link TikTok</label>
            <input
              id="tiktok_url"
              type="url"
              name="tiktok_url"
              value={ttUrl}
              onChange={(e) => setTtUrl(e.target.value)}
              placeholder="https://tiktok.com/@user atau video"
              className="field"
            />
            {ttInfo && (
              <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                {ttInfo.embed ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="size-3" /> Embed TikTok aktif
                  </span>
                ) : (
                  <span className="text-amber-400">Link profil/eksternal</span>
                )}
                <a href={ttUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-slate-400 hover:text-white">
                  Cek <ExternalLink className="size-3" />
                </a>
              </p>
            )}
          </div>
        </div>

        {state?.error && <p className="text-sm text-crimson-400">{state.error}</p>}
        {state?.success && (
          <p className="flex items-center gap-2 text-sm text-emerald-400">
            <CheckCircle2 className="size-4" /> Link media sosial berhasil disimpan.
          </p>
        )}

        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? (
            <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <Save className="size-4" />
          )}
          Simpan Link
        </button>
      </form>

      {(ytInfo?.embed || ttInfo?.embed) && (
        <div className="mt-6 space-y-4">
          <h3 className="font-rajdhani text-sm font-bold uppercase tracking-wider text-slate-400">Preview Embed:</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {ytInfo?.embed && (
              <div className="overflow-hidden rounded-xl border border-line bg-black">
                <iframe
                  src={ytInfo.embed}
                  title="Preview YouTube"
                  className="aspect-video w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
            {ttInfo?.embed && (
              <div className="overflow-hidden rounded-xl border border-line bg-black flex justify-center">
                <iframe
                  src={ttInfo.embed}
                  title="Preview TikTok"
                  className="aspect-[9/16] w-full max-w-xs"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
