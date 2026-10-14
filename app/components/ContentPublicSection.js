// app/components/ContentPublicSection.js
"use client";

import { useState } from "react";
import { Film, Radio, Clapperboard, ExternalLink } from "lucide-react";
import { SectionImage, SectionHead } from "@/app/HomeClient";

const CATEGORIES = ["Semua", "Live", "Clip", "Konten"];

const catMeta = {
  Live:   { icon: Radio,        tone: "border-crimson-500/30 bg-crimson-500/10 text-crimson-400" },
  Clip:   { icon: Clapperboard, tone: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
  Konten: { icon: Film,         tone: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" },
};

function CategoryChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex min-h-9 items-center rounded-full border px-4 text-xs uppercase tracking-[0.1em] transition-colors ${
        active
          ? "border-crimson-500/40 bg-crimson-500/15 text-white"
          : "border-line text-slate-400 hover:border-line-strong hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function CategoryBadge({ category }) {
  const meta = catMeta[category] ?? catMeta.Konten;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] ${meta.tone}`}>
      <Icon className="size-3" />
      {category}
    </span>
  );
}

function getEmbed(url) {
  if (!url) return null;
  const u = url.trim();
  const yt = u.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|live\/|shorts\/))([\w-]{11})/);
  if (yt) return { platform: "YouTube", embedUrl: `https://www.youtube.com/embed/${yt[1]}`, aspect: "16 / 9" };
  const tt = u.match(/tiktok\.com\/(?:@[\w.-]+\/video\/|v\/)(\d+)/) || u.match(/tiktok\.com\/.+\/video\/(\d+)/);
  if (tt) return { platform: "TikTok", embedUrl: `https://www.tiktok.com/embed/v2/${tt[1]}`, aspect: "9 / 16" };
  const platform = u.includes("tiktok") ? "TikTok" : (u.includes("youtube") || u.includes("youtu.be") ? "YouTube" : "Stream");
  return { platform, embedUrl: null, aspect: "16 / 9" };
}

function ContentCard({ item }) {
  const live = item.url ? getEmbed(item.url) : null;

  return (
    <article className="card group flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-2">
        <CategoryBadge category={item.category} />
        <p className="truncate font-mono text-[11px] text-slate-600">
          {item.officer_callsign ? item.officer_callsign : ""}
        </p>
      </div>

      <h3 className="mt-3 line-clamp-2 font-rajdhani text-lg font-bold text-white">
        {item.title || item.url}
      </h3>

      {live?.embedUrl && (
        <div className="mt-4 overflow-hidden rounded-xl border border-line bg-black">
          <iframe
            src={live.embedUrl}
            title={item.title || "Content"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            style={{ aspectRatio: live.aspect }}
            className="w-full"
          />
        </div>
      )}

      <div className="mt-auto pt-4">
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm w-full border border-line text-xs text-slate-300 transition-colors hover:border-crimson-500/40 hover:bg-crimson-500/10 hover:text-white"
          >
            <ExternalLink className="size-3.5" />
            {live?.platform ? `Buka di ${live.platform}` : "Buka Link"}
          </a>
        )}
      </div>
    </article>
  );
}

export default function ContentPublicSection({ items = [] }) {
  const [filter, setFilter] = useState("Semua");
  const filtered = filter === "Semua" ? items : items.filter((i) => i.category === filter);

  return (
    <section id="content" className="relative overflow-hidden border-t border-line py-20 sm:py-28">
      <SectionImage src="/Rooster1.png" opacity={0.25} />
      <div className="wrap relative">
        <SectionHead
          index="03"
          title="Live *Clip* & Konten"
          lede="Update terbaru dari personil COP-S. Saring berdasarkan kategori Live, Clip, atau Konten."
        />

        <div className="mt-10 flex flex-wrap gap-2">
          {CATEGORIES.map((f) => (
            <CategoryChip key={f} label={f} active={filter === f} onClick={() => setFilter(f)} />
          ))}
        </div>

        <p className="mt-4 text-[11px] uppercase tracking-[0.12em] text-slate-500">
          Menampilkan <span className="font-mono text-slate-200">{filtered.length}</span> dari{" "}
          <span className="font-mono">{items.length}</span> konten aktif
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="mt-6 text-sm text-slate-500">Belum ada content aktif untuk kategori ini.</p>
        )}
      </div>
    </section>
  );
}
