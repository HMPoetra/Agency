// app/absensi/page.js
import { requireAuth } from "@/lib/auth";
import { getAttendance, getTodayAttendance, getOfficerById, getOfficersWithHours, getSiteContent } from "@/lib/queries";
import DashboardClient from "./DashboardClient";
import HoursTableClient from "./HoursTableClient";
import AttendanceListClient from "./AttendanceListClient";
import LiveStreamCard from "./LiveStreamCard";
import UserSidebar from "@/app/components/UserSidebar";
import { Shield } from "lucide-react";

export const metadata = { title: "Absensi — COP-S" };

export default async function AbsensiPage() {
  const session = await requireAuth();
  const officerId = session.officer_id;

  const [officer, todayRecord, history, allOfficers, allAttendance, siteContent] = await Promise.all([
    officerId ? getOfficerById(officerId) : null,
    officerId ? getTodayAttendance(officerId) : null,
    officerId ? getAttendance({ officerId, limit: 1000 }) : [],
    getOfficersWithHours(),
    getAttendance({ limit: 1000 }),
    getSiteContent().catch(() => ({})),
  ]);

  const isAdmin = session.role === "admin";

  let visualServers = [
    { id: "7glory", name: "7GloryRP", subtitle: "Mulai dari 0 jam (Visual)", createdAt: 1000 },
  ];
  if (siteContent?.attendance_visual_servers) {
    try {
      const parsed = JSON.parse(siteContent.attendance_visual_servers);
      if (Array.isArray(parsed) && parsed.length > 0) visualServers = parsed;
    } catch (_) {}
  }

  const MOXIE_SERVER = {
    id: "moxie",
    name: "MoxieRP",
    subtitle: "Data akumulasi jam absensi dari database",
    isDb: true,
    createdAt: 0,
  };

  const servers = [...visualServers, MOXIE_SERVER].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  return (
    <div className="min-h-screen bg-night lg:flex">
      <UserSidebar username={session.username} />

      <main className="min-w-0 flex-1">
        <div className="wrap space-y-8 pb-10 pt-20 lg:pt-10">
          {!officer && (
            <div className="card flex items-center gap-3 p-6 text-amber-400">
              <Shield className="size-5" />
              <p className="text-sm">Akun ini belum terhubung ke personil. Hubungi Admin.</p>
            </div>
          )}

          {officer && (
            <>
              <section id="dashboard" className="scroll-mt-24">
                <DashboardClient
                  officer={officer}
                  history={history}
                  todayRecord={todayRecord}
                  servers={servers}
                />
              </section>

              <section id="live" className="scroll-mt-24">
                <LiveStreamCard officer={officer} />
              </section>

              <section id="riwayat" className="scroll-mt-24">
                <AttendanceListClient records={history} />
              </section>
            </>
          )}

          <section id="total" className="scroll-mt-24">
            <HoursTableClient
              officers={allOfficers}
              attendance={allAttendance}
              isAdmin={isAdmin}
              initialVisualServers={siteContent?.attendance_visual_servers}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
