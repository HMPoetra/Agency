import { Radio, Mail, MapPin } from "lucide-react";
import CopsLogo from "./CopsLogo";

const links = [
  { name: "Beranda Utama", href: "#home" },
  { name: "Tentang COP-s", href: "#about" },
  { name: "Unit Operasional", href: "#divisions" },
  { name: "Roster Personil", href: "#roster" },
  { name: "Harga & Kontak", href: "#pricing" },
  { name: "Script & Assets", href: "#scripts" },
];

const contacts = [
  { Icon: Radio, label: "Discord Dispatch", value: "COP-s HQ" },
  { Icon: Mail, label: "Email Resmi", value: "dispatch@cops.id" },
  {
    Icon: MapPin,
    label: "Wilayah Kerja",
    value: "FiveM Public & Whitelist Node",
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-line">
      <div
        className="grid-bg pointer-events-none absolute inset-0 opacity-60"
        aria-hidden="true"
      />

      <div className="wrap relative py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          <div>
            <div className="flex items-center gap-3">
              <CopsLogo size={34} />
              <span className="flex flex-col leading-none">
                <span className="font-orbitron text-sm font-bold tracking-[0.2em] text-white">
                  COP-S
                </span>
                <span className="mt-1 font-rajdhani text-[10px] uppercase tracking-[0.22em] text-slate-500">
                  Cops On Supply
                </span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              Agensi penyedia personil kepolisian FiveM dengan SOP taktis,
              sertifikasi CQB, dan kesiapsiagaan operasional 24/7.
            </p>
          </div>

          <nav aria-label="Navigasi footer">
            <h2 className="font-rajdhani text-xs font-semibold uppercase tracking-[0.2em] text-white">
              Halaman
            </h2>
            <ul className="mt-4 space-y-2.5">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    <span
                      aria-hidden="true"
                      className="text-slate-600 transition-colors group-hover:text-pine-400"
                    >
                      /
                    </span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-rajdhani text-xs font-semibold uppercase tracking-[0.2em] text-white">
              Kontak Dispatch
            </h2>
            <ul className="mt-4 space-y-3">
              {contacts.map(({ Icon, label, value }) => (
                <li key={label} className="flex items-start gap-2.5">
                  <Icon
                    className="mt-0.5 size-4 flex-shrink-0 text-pine-400"
                    aria-hidden="true"
                  />
                  <span className="text-sm leading-tight">
                    <span className="block text-[11px] uppercase tracking-[0.12em] text-slate-500">
                      {label}
                    </span>
                    <span className="text-slate-200">{value}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] text-slate-500">
            &copy; {new Date().getFullYear()} COP-S &middot; Cops On Supply
          </p>
          <p className="font-mono text-[11px] text-slate-600">
            FiveM Law Enforcement Roleplay Agency
          </p>
        </div>
      </div>
    </footer>
  );
}
