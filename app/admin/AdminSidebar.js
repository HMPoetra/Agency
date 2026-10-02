// app/admin/AdminSidebar.js
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import {
  LayoutDashboard, Users, FileText, Tag, Code2,
  LogOut, Shield, ClipboardList, Menu, X, MessageSquareQuote
} from "lucide-react";
import { useState } from "react";

const nav = [
  { href: "/admin",             label: "Dashboard",  icon: LayoutDashboard },
  { href: "/admin/officers",    label: "Personil",   icon: Users },
  { href: "/admin/divisions",   label: "Divisi",     icon: Shield },
  { href: "/admin/contracts",   label: "Harga & Kontrak", icon: FileText },
  { href: "/admin/attendance",  label: "Absensi",    icon: ClipboardList },
  { href: "/admin/products",    label: "Script & Assets", icon: Code2 },
  { href: "/admin/reviews",     label: "Rating & Pesan", icon: MessageSquareQuote },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="border-b border-line px-6 py-5">
        <span className="font-orbitron text-sm font-black tracking-[0.2em] text-white">
          COP<span className="text-crimson-400">-S</span>
        </span>
        <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-slate-600">
          Admin Panel
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? "bg-crimson-500/15 border border-crimson-500/30 text-white"
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
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

      {/* Logout */}
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

  return (
    <>
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-50 flex size-10 items-center justify-center rounded-lg border border-line bg-night text-slate-400 lg:hidden"
        aria-label="Buka menu"
      >
        <Menu className="size-5" />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 border-r border-line bg-[#080608] transition-transform duration-300 lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute right-3 top-3 text-slate-500 hover:text-white"
          aria-label="Tutup menu"
        >
          <X className="size-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden w-56 flex-shrink-0 border-r border-line bg-[#080608] lg:block">
        <SidebarContent />
      </aside>
    </>
  );
}
