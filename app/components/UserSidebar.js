// app/components/UserSidebar.js
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/app/actions/auth";
import {
  LayoutDashboard, Radio, Film, History, Users, User, LogOut, Menu, X
} from "lucide-react";

const nav = [
  { href: "/absensi",         label: "Dashboard",       icon: LayoutDashboard },
  { href: "/absensi#live",    label: "Live Streaming",  icon: Radio },
  { href: "/content",         label: "Content",         icon: Film },
  { href: "/absensi#riwayat", label: "Riwayat Absensi", icon: History },
  { href: "/absensi#total",   label: "Total Personil",  icon: Users },
  { href: "/profile",         label: "Profil",          icon: User },
];

function SidebarContent({ username, pathname, onClose }) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line px-4 py-4">
        <Link
          href="/"
          onClick={onClose}
          className="font-orbitron text-sm font-bold tracking-[0.2em] text-white"
        >
          COP<span className="text-crimson-400">-S</span>{" "}
          <span className="font-sans text-xs font-normal text-slate-500">/ Portal</span>
        </Link>
        <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.15em] text-slate-600">
          {username}
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? "bg-crimson-500/15 border border-crimson-500/30 text-white"
                      : "border border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <Icon className={`size-4 flex-shrink-0 ${isActive ? "text-crimson-400" : ""}`} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-line p-3">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 transition-colors hover:bg-crimson-500/10 hover:text-crimson-400"
          >
            <LogOut className="size-4" />
            Keluar
          </button>
        </form>
      </div>
    </div>
  );
}

export default function UserSidebar({ username }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-50 flex size-10 items-center justify-center rounded-lg border border-line bg-night text-slate-400 lg:hidden"
        aria-label="Buka menu"
      >
        <Menu className="size-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={close}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 border-r border-line bg-[#080608] transition-transform duration-300 lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={close}
          className="absolute right-3 top-3 text-slate-500 hover:text-white"
          aria-label="Tutup menu"
        >
          <X className="size-5" />
        </button>
        <SidebarContent username={username} pathname={pathname} onClose={close} />
      </aside>

      <aside className="hidden w-56 flex-shrink-0 border-r border-line bg-[#080608] lg:block">
        <div className="sticky top-0 h-screen">
          <SidebarContent username={username} pathname={pathname} onClose={close} />
        </div>
      </aside>
    </>
  );
}
