// app/absensi/page.js
import { requireAuth } from "@/lib/auth";
import { getAttendance, getTodayAttendance, getOfficerById, getOfficersWithHours } from "@/lib/queries";
import DashboardClient from "./DashboardClient";
import HoursTableClient from "./HoursTableClient";
import { logoutAction } from "@/app/actions/auth";
import { LogOut, Shield } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Absensi — COP-S" };

export default async function AbsensiPage() {
  const session = await requireAuth();
  const officerId = session.officer_id;

  const [officer, todayRecord, history, allOfficers] = await Promise.all([
    officerId ? getOfficerById(officerId) : null,
    officerId ? getTodayAttendance(officerId) : null,
    officerId ? getAttendance({ officerId, limit: 100 }) : [],
    getOfficersWithHours(),
  ]);

  const isAdmin = session.role === "admin";

  return (
    <div className="min-h-screen bg-night">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-line bg-[#080608]/90 backdrop-blur-xl">
        <div className="wrap flex h-14 items-center justify-between">
          <span className="font-orbitron text-sm font-bold tracking-[0.2em] text-white">
            COP<span className="text-crimson-400">-S</span>{" "}
            <span className="font-sans text-xs font-normal text-slate-500">/ Absensi</span>
          </span>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-slate-400 sm:block">
              {session.username}
            </span>
            <Link href="/profile" className="btn btn-ghost btn-sm">
              <Shield className="size-3.5" />
              Profil
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="btn btn-ghost btn-sm">
                <LogOut className="size-3.5" />
                Keluar
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="wrap py-10 space-y-8">
        {officer && (
          <DashboardClient 
            officer={officer} 
            history={history} 
            todayRecord={todayRecord} 
          />
        )}
        
        <HoursTableClient officers={allOfficers} isAdmin={isAdmin} />
        
        {!officer && (
          <div className="card mb-8 flex items-center gap-3 p-6 text-amber-400">
            <Shield className="size-5" />
            <p className="text-sm">
              Akun ini belum terhubung ke personil. Hubungi Admin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
