// app/admin/beranda/page.js
import { getSiteContent, getStats, getPillars } from "@/lib/queries";
import { LayoutDashboard } from "lucide-react";
import BerandaClient from "./BerandaClient";

export const metadata = { title: "Kelola Beranda — Admin COP-S" };

export default async function BerandaPage() {
  const [content, stats, pillars] = await Promise.all([
    getSiteContent(),
    getStats(),
    getPillars(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">
          <span className="font-mono text-slate-600">00</span>
          <span className="h-px w-6 bg-crimson-500/40" />
          Halaman Utama
        </p>
        <h1 className="mt-1 font-orbitron text-xl font-bold text-white flex items-center gap-2">
          <LayoutDashboard className="size-5 text-crimson-400" /> Beranda
        </h1>
      </div>

      <BerandaClient content={content} stats={stats} pillars={pillars} />
    </div>
  );
}
