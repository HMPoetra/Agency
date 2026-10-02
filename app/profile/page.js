// app/profile/page.js
import { requireAuth } from "@/lib/auth";
import { getOfficerById } from "@/lib/queries";
import ProfileClient from "./ProfileClient";
import { logoutAction } from "@/app/actions/auth";
import { LogOut, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Profil Personal — COP-S" };

export default async function ProfilePage() {
  const session = await requireAuth();
  
  let officer = null;
  if (session.officer_id) {
    officer = await getOfficerById(session.officer_id);
  }

  return (
    <div className="min-h-screen bg-night">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-line bg-[#080608]/90 backdrop-blur-xl">
        <div className="wrap flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            {session.role === "officer" && (
              <Link href="/absensi" className="text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="size-4" />
              </Link>
            )}
            <span className="font-orbitron text-sm font-bold tracking-[0.2em] text-white">
              COP<span className="text-crimson-400">-S</span>{" "}
              <span className="font-sans text-xs font-normal text-slate-500">/ Profil</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <form action={logoutAction}>
              <button type="submit" className="btn btn-ghost btn-sm">
                <LogOut className="size-3.5" />
                Keluar
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="wrap py-10">
        <ProfileClient session={session} officer={officer} />
      </div>
    </div>
  );
}
