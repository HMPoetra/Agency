"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
import CopsLogo from "./CopsLogo";

const navItems = [
  { name: "Beranda", href: "#home" },
  { name: "Unit Ops", href: "#divisions" },
  { name: "Roster", href: "#roster" },
  { name: "Harga & Kontak", href: "#pricing" },
  { name: "Script & Assets", href: "#scripts" },
];

const sectionIds = [
  "home",
  "about",
  "divisions",
  "roster",
  "pricing",
  "scripts",
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");

  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5] },
    );

    sections.forEach((el) => observer.observe(el));

    const sentinel = new IntersectionObserver(
      ([e]) => setScrolled(!e.isIntersecting),
      { threshold: 0 },
    );
    const bar = document.getElementById("nav-sentinel");
    if (bar) sentinel.observe(bar);

    return () => {
      observer.disconnect();
      sentinel.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  return (
    <>
      <div
        id="nav-sentinel"
        aria-hidden="true"
        className="absolute top-0 h-px w-full"
      />

      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          scrolled || isOpen
            ? "border-b border-line bg-[#080608]/85 backdrop-blur-xl"
            : "border-b border-transparent"
        }`}
      >
        <div className="wrap">
          <div className="flex h-16 items-center justify-between">
            <a
              href="#home"
              className="flex items-center gap-3"
              aria-label="COP-s, ke beranda"
            >
              <CopsLogo size={34} />
              <span className="flex flex-col leading-none">
                <span className="font-orbitron text-sm font-bold tracking-[0.2em] text-white">
                  COP-S
                </span>
                <span className="mt-1 font-rajdhani text-[10px] uppercase tracking-[0.22em] text-slate-500">
                  Cops On Supply
                </span>
              </span>
            </a>

            <nav aria-label="Navigasi utama" className="hidden lg:block">
              <ul className="flex items-center gap-1 rounded-full border border-line bg-white/[0.02] p-1">
                {navItems.map((item) => {
                  const isActive = active === item.href.slice(1);
                  return (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        aria-current={isActive ? "true" : undefined}
                        className={`relative block rounded-full px-3.5 py-1.5 text-xs tracking-wide transition-colors ${
                          isActive
                            ? "text-white"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="nav-active"
                            className="absolute inset-0 rounded-full border border-crimson-500/30 bg-crimson-500/15"
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 32,
                            }}
                          />
                        )}
                        <span className="relative">{item.name}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="hidden items-center gap-3 sm:flex">
              <Link href="/login" className="btn btn-ghost btn-sm">
                Login
              </Link>
              <a href="#pricing" className="btn btn-primary btn-sm">
                Sewa
                <ArrowUpRight className="size-3.5" />
              </a>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen((v) => !v)}
              aria-expanded={isOpen}
              aria-controls="menu-mobile"
              aria-label={isOpen ? "Tutup menu" : "Buka menu"}
              className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-line text-slate-300 transition-colors hover:border-line-strong hover:text-white active:scale-95 lg:hidden"
            >
              {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="menu-mobile"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="overflow-hidden border-b border-line bg-[#080608]/95 backdrop-blur-xl lg:hidden"
            >
              <nav aria-label="Navigasi mobile" className="wrap py-4">
                <ul className="flex flex-col gap-1">
                  {navItems.map((item) => {
                    const isActive = active === item.href.slice(1);
                    return (
                      <li key={item.href}>
                        <a
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          aria-current={isActive ? "true" : undefined}
                          className={`flex min-h-11 items-center rounded-lg px-3.5 py-2.5 text-sm uppercase tracking-[0.12em] transition-colors ${
                            isActive
                              ? "border border-crimson-500/30 bg-crimson-500/15 text-white"
                              : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                          }`}
                        >
                          {item.name}
                        </a>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-4 flex flex-col gap-2">
                  <a
                    href="#pricing"
                    onClick={() => setIsOpen(false)}
                    className="btn btn-primary w-full"
                  >
                    Lihat Harga
                    <ArrowUpRight className="size-3.5" />
                  </a>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="btn btn-ghost w-full"
                  >
                    Login
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
