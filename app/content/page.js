// app/content/page.js
import { requireAuth } from "@/lib/auth";
import { getContentForOfficer } from "@/lib/queries";
import UserSidebar from "@/app/components/UserSidebar";
import ContentClient from "@/app/components/ContentClient";

export const metadata = { title: "Content — COP-S" };

export default async function ContentPage() {
  const session = await requireAuth();
  const items = session.officer_id ? await getContentForOfficer(session.officer_id) : [];

  return (
    <div className="min-h-screen bg-night lg:flex">
      <UserSidebar username={session.username} />

      <main className="min-w-0 flex-1">
        <div className="wrap space-y-6 pb-10 pt-20 lg:pt-10">
          <header>
            <p className="eyebrow">
              <span className="font-mono text-slate-600">03</span>
              <span className="h-px w-6 bg-crimson-500/40" />
              Portal Content
            </p>
            <h1 className="mt-3 font-orbitron text-2xl font-bold text-white sm:text-3xl">
              Live <span className="text-crimson-400">•</span> Clip <span className="text-crimson-400">•</span> Konten
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Unggah link Live, Clip, atau Konten. Content yang <span className="text-emerald-400">aktif</span> tampil
              di Beranda publik tanpa login; yang non-aktif disembunyikan.
            </p>
          </header>

          <ContentClient items={items} />
        </div>
      </main>
    </div>
  );
}
