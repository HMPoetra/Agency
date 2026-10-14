// app/admin/content/page.js
import { getContent } from "@/lib/queries";
import ContentClient from "@/app/components/ContentClient";
import { Film } from "lucide-react";

export const metadata = { title: "Content — Admin COP-S" };

export default async function AdminContentPage() {
  const items = await getContent();

  return (
    <div>
      <div className="mb-6">
        <p className="eyebrow">
          <span className="font-mono text-slate-600">00</span>
          <span className="h-px w-6 bg-crimson-500/40" />
          Manajemen
        </p>
        <h1 className="mt-1 flex items-center gap-2 font-orbitron text-xl font-bold text-white">
          <Film className="size-5 text-crimson-400" /> Content
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Kelola semua content (Live / Clip / Konten) yang diunggah personil. Content non-aktif tidak tampil di Beranda publik.
        </p>
      </div>

      <ContentClient items={items} isAdmin />
    </div>
  );
}
