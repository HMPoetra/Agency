"use client";
import { useMemo, useState } from "react";
import ReviewInbox from "./components/ReviewInbox";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Car,
  Check,
  ChevronRight,
  Clock,
  Code2,
  Crosshair,
  Crown,
  Cpu,
  FileText,
  Radio,
  Search,
  Shield,
  ShieldCheck,
  Shirt,
  Siren,
  Tag,
  Target,
  Users,
} from "lucide-react";
import RadarBackground from "@/components/RadarBackground";
import CopsLogo from "@/components/CopsLogo";
import TypeTitle from "@/components/TypeTitle";
import CountUp from "@/components/CountUp";
import { Reveal, RevealItem } from "@/components/Reveal";

const DISCORD = "https://discord.gg/HWZDKJAJh";

/* ══════════════════════════════════════════
   DATA
   ══════════════════════════════════════════ */

const stats = [
  { label: "Personil Aktif", value: 50, suffix: "+" },
  { label: "Server Partner", value: 25, suffix: "+" },
  { label: "Jam Terbang RP", value: 10, suffix: "K+" },
  { label: "Tingkat Kepuasan", value: 98, suffix: "%" },
];

const pillars = [
  {
    icon: ShieldCheck,
    title: "SOP Standar Tinggi",
    desc: "Setiap personil wajib lulus tes pemahaman penal code, traffic stop protocol, pursuit box, dan radio 10-codes sebelum mulai bertugas.",
  },
  {
    icon: Target,
    title: "Netralitas Tanpa Powergaming",
    desc: "Tidak ada favoritisme fraksi. Ruang aksi dan reaksi tetap adil untuk seluruh pemain di server Anda.",
  },
  {
    icon: Clock,
    title: "Shift 24/7 Terstruktur",
    desc: "Jadwal shift bergilir memastikan kota selalu diawasi, tanpa jam kosong yang rawan fail-RP.",
  },
];

const divisions = [
  {
    id: "alpha",
    name: "Divisi Alpha",
    unit: "Tactical / SWAT",
    tag: "DIV-A",
    accent: "rose",
    description:
      "Unit taktis penanganan krisis berisiko tinggi. Terlatih dalam dynamic entry, hostage rescue, barricaded suspect, dan CQB dengan disiplin radio militer.",
    features: [
      "High-Risk Breach & Entry",
      "Heavy Weaponry Specialist",
      "Hostage Negotiation Unit",
      "Tactical Air Insertion",
    ],
    icon: Crosshair,
  },
  {
    id: "bravo",
    name: "Divisi Bravo",
    unit: "Patrol & Investigation",
    tag: "DIV-B",
    accent: "blue",
    description:
      "Pilar penegakan hukum kota. Menjalankan patroli presisi, investigasi TKP berantai, traffic enforcement realistis, serta manajemen konflik roleplay yang berimbang.",
    features: [
      "Standard Patrol & Traffic Stops",
      "Crime Scene Investigation",
      "Pursuit & PIT Maneuvers",
      "Community Policing & SOP",
    ],
    icon: Shield,
  },
];

const accent = {
  rose: {
    text: "text-rose-400",
    dot: "bg-rose-400",
    chip: "border-rose-500/30 bg-rose-500/10 text-rose-400",
    hover: "hover:border-rose-500/40",
    ring: "border-rose-500/30 bg-rose-500/5",
    rgb: "244,63,94",
  },
  blue: {
    text: "text-pine-400",
    dot: "bg-pine-400",
    chip: "border-pine-500/30 bg-pine-500/10 text-pine-400",
    hover: "hover:border-pine-500/40",
    ring: "border-pine-500/30 bg-pine-500/5",
    rgb: "229,51,51",
  },
};

const officers = [
  {
    id: "COP-001",
    name: 'Sgt. Alex "Viper" Reyes',
    callsign: "1-ALPHA-01",
    rank: "Sergeant",
    division: "SWAT",
    divTag: "DIV-A",
    status: "Active",
    experience: "2500+ Jam",
    age: "28 (OOC)",
  },
  {
    id: "COP-002",
    name: 'Ofc. Maya "Shadow" Chen',
    callsign: "2-BRAVO-14",
    rank: "Officer II",
    division: "Patrol",
    divTag: "DIV-B",
    status: "On-Duty",
    experience: "1800+ Jam",
    age: "24 (OOC)",
  },
  {
    id: "COP-003",
    name: 'Cpl. Dante "Hawk" Morales',
    callsign: "1-ALPHA-04",
    rank: "Corporal",
    division: "SWAT",
    divTag: "DIV-A",
    status: "Active",
    experience: "3200+ Jam",
    age: "31 (OOC)",
  },
  {
    id: "COP-004",
    name: 'Det. Luna "Ghost" Park',
    callsign: "3-DELTA-02",
    rank: "Detective",
    division: "Detective",
    divTag: "DIV-B",
    status: "Standby",
    experience: "2100+ Jam",
    age: "27 (OOC)",
  },
  {
    id: "COP-005",
    name: 'Ofc. Riko "Bolt" Tanaka',
    callsign: "4-TANGO-08",
    rank: "Officer I",
    division: "Traffic",
    divTag: "DIV-B",
    status: "On-Duty",
    experience: "1400+ Jam",
    age: "23 (OOC)",
  },
  {
    id: "COP-006",
    name: 'Lt. Arya "Titan" Pratama',
    callsign: "1-ALPHA-00",
    rank: "Lieutenant",
    division: "SWAT",
    divTag: "DIV-A",
    status: "Active",
    experience: "4100+ Jam",
    age: "33 (OOC)",
  },
  {
    id: "COP-007",
    name: 'Ofc. Nadia "Pulse" Sari',
    callsign: "2-BRAVO-21",
    rank: "Officer II",
    division: "Patrol",
    divTag: "DIV-B",
    status: "Active",
    experience: "1600+ Jam",
    age: "25 (OOC)",
  },
  {
    id: "COP-008",
    name: 'Sgt. Kazuki "Storm" Ito',
    callsign: "1-ALPHA-02",
    rank: "Sergeant",
    division: "SWAT",
    divTag: "DIV-A",
    status: "On-Duty",
    experience: "2900+ Jam",
    age: "29 (OOC)",
  },
  {
    id: "COP-009",
    name: 'Ofc. Diana "Lynx" Cruz',
    callsign: "4-TANGO-05",
    rank: "Officer I",
    division: "Traffic",
    divTag: "DIV-B",
    status: "Standby",
    experience: "1100+ Jam",
    age: "22 (OOC)",
  },
];

const divisionFilters = ["All", "SWAT", "Patrol", "Detective", "Traffic"];

const statusTone = {
  Active: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
  "On-Duty": "border-pine-500/25 bg-pine-500/10 text-pine-400",
  Standby: "border-amber-500/25 bg-amber-500/10 text-amber-400",
};

const onDutyCount = officers.filter((o) => o.status !== "Standby").length;

const divisionCount = divisionFilters.slice(1).map((division) => ({
  division,
  count: officers.filter((o) => o.division === division).length,
}));

const activeContracts = [
  {
    server: "Liberty City RP",
    mou: "MOU-2024-001",
    status: "Active",
    detail: "Full Precinct Deployment - 15 Personil 24/7",
  },
  {
    server: "San Andreas State RP",
    mou: "MOU-2024-002",
    status: "Active",
    detail: "Patrol & Criminal Investigation - 8 Personil",
  },
  {
    server: "Metro Life Roleplay",
    mou: "MOU-2024-003",
    status: "Pending",
    detail: "SWAT Tactical Standby - Grand Opening",
  },
];

const pricingTiers = [
  {
    name: "Patrol Basic",
    tag: "Starter",
    icon: Shield,
    price: 500,
    priceSuffix: "K",
    period: "per bulan",
    popular: false,
    cta: "Pilih Starter",
    features: [
      "5 Personil Patrol Bersertifikat",
      "Shift Terjadwal 8 Jam/Hari",
      "Standar SOP FiveM",
      "Radio Frequency Terintegrasi",
      "Laporan Mingguan Disiplin",
      "Pengawasan Officer In-Charge",
    ],
  },
  {
    name: "Full Precinct",
    tag: "Recommended",
    icon: Crown,
    price: 1.5,
    priceDecimals: 1,
    priceSuffix: "M",
    period: "per bulan",
    popular: true,
    cta: "Sewa Full Precinct",
    features: [
      "15 Personil (Patrol + Detektif)",
      "Coverage Fleksibel 24/7",
      "Kustomisasi SOP & Penal Code",
      "Dedicated Field Commander",
      "CAD / MDT Live Synchronization",
      "Evaluasi Kinerja Bulanan",
      "Prioritas Event & Operasi Khusus",
      "Garansi Netralitas Roleplay",
    ],
  },
  {
    name: "SWAT High-Risk",
    tag: "Special Ops",
    icon: Target,
    price: 2.5,
    priceDecimals: 1,
    priceSuffix: "M",
    period: "per event",
    popular: false,
    cta: "Request Briefing",
    features: [
      "10 SWAT Tactical Specialists",
      "Briefing Skenario & Tactical Plan",
      "Heavy Armor & Equipment Pack",
      "Tactical Incident Commander",
      "Disiplin SOP CQB Terjaga",
      "After-Action Debrief & Recording",
      "Akses Helikopter & Air Insertion",
      "Prioritas Kontrak Eksklusif",
    ],
  },
];

const products = [
  {
    id: "script-custom",
    title: "Custom Police Script System",
    category: "Script",
    icon: Code2,
    price: 750,
    priceSuffix: "K",
    badge: "Premium",
    description:
      "Sistem policing lengkap: dispatch otomatis, terminal MDT/CAD, interaksi traffic stop, dan arrest system teroptimasi.",
    features: [
      "Dispatch & CAD Real-time",
      "In-Game MDT Terminal",
      "Traffic Stop & Fine Module",
      "Arrest, Frisk & Booking",
      "Evidence & Gunshot Logs",
      "Penal Code Config File",
    ],
  },
  {
    id: "eup-pack",
    title: "Tactical Uniform / EUP Pack",
    category: "Clothing",
    icon: Shirt,
    price: 350,
    priceSuffix: "K",
    badge: "Populer",
    description:
      "Seragam kepolisian HD dengan rank badge, vest anti-peluru realistis, holster, dan variasi pakaian taktis lengkap.",
    features: [
      "Patrol Class A, B & C",
      "SWAT All-Black Tactical BDU",
      "Detective Undercover Fits",
      "HD Badge & Custom Patch",
      "Body Armor Variasi Level",
      "Male & Female Textures",
    ],
  },
  {
    id: "vehicle-script",
    title: "Police Vehicle Handling Pack",
    category: "Vehicle",
    icon: Car,
    price: 500,
    priceSuffix: "K",
    badge: "Tactical",
    description:
      "Konfigurasi handling kendaraan polisi realistis: sistem sirene ELS, spike strip deploy, dan PIT maneuver physics.",
    features: [
      "Realistic Pursuit Handling",
      "ELS Siren Synchronizer",
      "Deployable Spike Strips",
      "PIT Maneuver Dynamic Weight",
      "Police Garage Quick Fix",
      "Damage & Bulletproof Tire",
    ],
  },
];

/* ══════════════════════════════════════════
   PAGE
   ══════════════════════════════════════════ */

export default function HomeClient({ statsData, pillarsData, divisionsData, officersData, contractsData, pricingData, productsData, reviewsData }) {
  return (
    <>
      <HeroSection stats={statsData} pillars={pillarsData} contracts={contractsData} />
      <DivisionSection divisions={divisionsData} />
      <RosterSection officers={officersData} divisions={divisionsData} />
      <PricingSection contracts={contractsData} pricing={pricingData} />
      <ScriptsSection products={productsData} />
      <ReviewInbox reviews={reviewsData} />
      <CtaSection />
    </>
  );
}

/* ─── 01 Hero ─── */

function HeroSection({ stats, pillars, contracts }) {
  const reduced = useReducedMotion();
  const statsData = stats ?? [];
  const pillarsData = pillars ?? [];
  const contractsData = contracts ?? [];

  return (
    <section id="home" className="relative overflow-hidden pt-24">
      <SectionImage
        src="/Heli.png"
        opacity={0.34}
        position="object-[center_30%]"
      />
      <RadarBackground />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-1/4 size-[560px] rounded-full bg-crimson-600/[0.07] blur-[140px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="h-px w-full animate-sweep bg-gradient-to-r from-transparent via-crimson-400/18 to-transparent" />
      </div>

      <div className="wrap relative py-14 lg:py-20">
        <div className="grid items-start gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <motion.div
              initial={reduced ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            >
              <CopsLogo size={64} />
            </motion.div>

            <TypeTitle
              as="h1"
              text="Personil *Polisi* Siap Diterjunkan"
              className="mt-6 font-orbitron text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl"
            />

            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300">
              Agensi penyedia personil kepolisisan profesional untuk server
              FiveM. Personil bersertifikat, radio etiquette teruji, dan siap
              diterjunkan sesuai kebutuhan Server Roleplay Anda.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#pricing" className="btn btn-primary w-full sm:w-auto">
                <Shield className="size-4" />
                Lihat Harga
              </a>
              <a href="#roster" className="btn btn-ghost w-full sm:w-auto">
                <Users className="size-4 text-pine-400" />
                Lihat Roster
                <ArrowRight className="size-4" />
              </a>
            </div>
          </div>

          <div
            id="about"
            className="scroll-mt-20 border-t border-line pt-10 lg:border-l lg:border-t-0 lg:pt-0 lg:pl-14"
          >
            <div>
              <TypeTitle
                as="h2"
                text="Tentang *COP-S*"
                className="font-orbitron text-2xl font-bold text-white"
              />
              <p className="mt-4 text-base leading-relaxed text-slate-400">
                COP-S alias Cops On Supply. Kami menutup tiga masalah klasik
                roleplay: policing yang timpang, fail-RP, dan jam jaga yang
                kosong.
              </p>
            </div>

            <dl className="mt-9 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-line pt-8">
              {statsData.map((stat) => (
                <div key={stat.label}>
                  <dd className="font-orbitron text-3xl font-bold text-white">
                    <CountUp value={stat.value} suffix={stat.suffix} />
                  </dd>
                  <dt className="mt-1.5 text-[11px] uppercase tracking-[0.14em] text-slate-500">
                    {stat.label}
                  </dt>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <div className="wrap relative pb-16 lg:pb-24">
        <Reveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pillarsData.map((pillar) => {
            // icon_name from DB, map to Lucide component
            const IconMap = { ShieldCheck, Target, Clock };
            const PillarIcon = IconMap[pillar.icon_name] ?? ShieldCheck;
            return (
              <RevealItem key={pillar.title} className="h-full">
                <article className="card h-full p-5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-md border border-pine-500/20 bg-pine-500/10">
                      <PillarIcon
                        className="size-4 text-pine-400"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                  <h3 className="mt-4 font-rajdhani text-lg font-bold text-white">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    {pillar.description}
                  </p>
                </article>
              </RevealItem>
            );
          })}
        </Reveal>
      </div>

      <ContractMarquee contracts={contractsData} />
    </section>
  );
}

function ContractMarquee({ contracts }) {
  if (!contracts || contracts.length === 0) return null;
  // filter active contracts that have photo_url
  const logos = contracts.filter(c => c.status === "Active" && c.photo_url);
  if (logos.length === 0) return null;

  // We need enough logos to span wider than any screen to ensure seamless scrolling
  // 10 copies for each half should be more than enough
  const halfLogos = Array(10).fill(logos).flat();

  return (
    <div className="w-full bg-[#080608] py-8 overflow-hidden relative">
      <div className="wrap relative z-10">
        <p className="text-center text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-6">
          Dipercaya oleh server-server terbaik
        </p>
      </div>

      {/* gradient masks for smooth edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-32 bg-gradient-to-r from-[#080608] to-transparent"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-32 bg-gradient-to-l from-[#080608] to-transparent"></div>

      <div className="flex w-full overflow-hidden py-4">
        <div className="flex w-max animate-marquee items-center hover:[animation-play-state:paused]">
          {halfLogos.map((c, i) => (
            <div key={`${c.mou}-1-${i}`} className="relative h-12 w-32 mx-8 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300 shrink-0">
              <Image
                src={c.photo_url}
                alt={c.server}
                fill
                sizes="128px"
                className="object-contain"
              />
            </div>
          ))}
          {halfLogos.map((c, i) => (
            <div key={`${c.mou}-2-${i}`} className="relative h-12 w-32 mx-8 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300 shrink-0">
              <Image
                src={c.photo_url}
                alt={c.server}
                fill
                sizes="128px"
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── 02 Unit Operasional ─── */

function DivisionSection({ divisions }) {
  const divisionsData = divisions ?? [];
  return (
    <section
      id="divisions"
      className="relative overflow-hidden border-t border-line bg-white/[0.012] py-20 sm:py-28"
    >
      <SectionImage src="/TKP1.png" opacity={0.3} />
      <div className="wrap relative">
        <div>
          <SectionHead
            index="01"
            label="Operational Divisions"
            title="Unit *Operasional*"
            lede={`${divisionsData.length} divisi dengan kualifikasi khusus, siap beroperasi sesuai skala skenario yang dibutuhkan di server Anda.`}
          />
        </div>

        <Reveal className="mt-12 grid gap-6 md:grid-cols-2">
          {divisionsData.map((div) => {
            const tone = accent[div.accent] ?? accent.blue;
            const IconMap = { Crosshair, Shield };
            const DivIcon = IconMap[div.icon_name] ?? Shield;
            return (
              <RevealItem key={div.id} className="h-full">
                <article
                  className={`card flex h-full flex-col overflow-hidden transition-colors duration-300 ${tone.hover}`}
                >
                  <div className="p-6 sm:px-7 sm:pt-7 pb-0">
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${tone.chip}`}
                      >
                        {div.tag}
                      </span>
                      <DivIcon
                        className={`size-5 ${tone.text}`}
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  <div className="flex-1 p-6 sm:p-7 flex flex-col">
                    <Schematic tone={tone} label={div.unit || "General"} photoUrl={div.photo_url} />

                    <h3 className="mt-6 font-rajdhani text-2xl font-bold text-white">
                      {div.name}
                      {div.unit && (
                        <span className="ml-2 font-sans text-sm font-normal text-slate-500">
                          {div.unit}
                        </span>
                      )}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-slate-400">
                      {div.description}
                    </p>

                    {div.features?.length > 0 && (
                      <ul className="mt-6 grid gap-2.5 border-t border-line pt-5 sm:grid-cols-2">
                        {div.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-start gap-2 text-sm"
                          >
                            <ChevronRight
                              className={`mt-0.5 size-3.5 flex-shrink-0 ${tone.text}`}
                              aria-hidden="true"
                            />
                            <span className="text-slate-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </article>
              </RevealItem>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}

/* ─── 04 Roster ─── */

function RosterSection({ officers, divisions }) {
  const officersData = officers ?? [];
  const divs = divisions ?? [];
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const divisionFilters = ["All", ...divs.map((d) => d.name)];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return officersData.filter((officer) => {
      const hit =
        !q ||
        officer.name.toLowerCase().includes(q) ||
        officer.callsign.toLowerCase().includes(q) ||
        officer.id.toLowerCase().includes(q);

      const oDivs = officer.division ? officer.division.split(", ") : [];
      const filterMatch = filter === "All" || oDivs.includes(filter) || oDivs.includes("All Division");

      return hit && filterMatch;
    });
  }, [query, filter, officersData]);

  const onDutyCount = officersData.filter((o) => o.status !== "Standby").length;

  const divisionCount = [
    {
      division: "All Division",
      count: officersData.filter((o) => {
        const oDivs = o.division ? o.division.split(", ") : [];
        return oDivs.includes("All Division");
      }).length,
    },
    ...divs.map((d) => ({
      division: d.name,
      count: officersData.filter((o) => {
        const oDivs = o.division ? o.division.split(", ") : [];
        return oDivs.includes(d.name) || oDivs.includes("All Division");
      }).length,
    }))
  ]; return (
    <section
      id="roster"
      className="relative overflow-hidden border-t border-line py-20 sm:py-28"
    >
      <SectionImage src="/Rooster1.png" opacity={0.3} />
      <div className="wrap relative">
        <div>
          <SectionHead
            index="02"
            title="Roster *Anggota*"
            lede="Database terbuka personil COP-S. Cari lewat nama, callsign, atau ID, lalu saring per divisi."
          />
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          <RevealItem className="lg:col-span-2">
            <div className="card h-full p-6">
              <label htmlFor="cari-personil" className="label">
                Cari Personil
              </label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500"
                  aria-hidden="true"
                />
                <input
                  id="cari-personil"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Nama, callsign, atau ID - contoh: Viper, COP-001"
                  className="field pl-10"
                />
              </div>

              <div
                className="mt-6 flex flex-wrap gap-2"
                role="group"
                aria-label="Filter divisi"
              >
                {divisionFilters.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    aria-pressed={filter === f}
                    className={`flex min-h-9 items-center rounded-full border px-4 text-xs uppercase tracking-[0.1em] transition-colors active:scale-95 ${filter === f
                      ? "border-crimson-500/40 bg-crimson-500/15 text-white"
                      : "border-line text-slate-400 hover:border-line-strong hover:text-white"
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <p className="mt-6 border-t border-line pt-4 text-[11px] uppercase tracking-[0.12em] text-slate-500">
                Menampilkan{" "}
                <span className="font-mono text-slate-200">
                  {filtered.length}
                </span>{" "}
                dari <span className="font-mono">{officers.length}</span>{" "}
                personil
              </p>
            </div>
          </RevealItem>

          <RevealItem>
            <div className="card flex h-full flex-col p-6">
              <h3 className="font-rajdhani text-lg font-bold text-white">
                Sebaran Personil
              </h3>
              <p className="mt-1.5 text-sm text-slate-400">
                <CountUp
                  value={onDutyCount}
                  className="font-mono text-emerald-400"
                />{" "}
                dari {officers.length} personil sedang bertugas.
              </p>

              <ul className="mt-6 space-y-3">
                {divisionCount.map(({ division, count }) => (
                  <li key={division}>
                    <button
                      type="button"
                      onClick={() => setFilter(division)}
                      className="group flex w-full items-center justify-between rounded-lg border border-line px-3.5 py-2.5 transition-colors hover:border-line-strong"
                    >
                      <span className="text-sm text-slate-300">{division}</span>
                      <span className="flex items-center gap-3">
                        <CountUp value={count} className="font-mono text-sm text-white" />
                        <DivisionBar
                          ratio={count / Math.max(...divisionCount.map((d) => d.count))}
                        />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </RevealItem>
        </div>

        <Reveal
          as="ul"
          layout
          className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((officer) => (
              <RevealItem as="li" key={officer.id} layout>
                <OfficerCard officer={officer} />
              </RevealItem>
            ))}
          </AnimatePresence>
        </Reveal>

        {filtered.length === 0 && (
          <p className="mt-10 text-center text-sm text-slate-500">
            Tidak ada personil yang cocok dengan pencarian itu.
          </p>
        )}
      </div>
    </section>
  );
}

/* ─── 05 Harga & Kontak ─── */

function PricingSection({ contracts, pricing }) {
  const activeContracts = contracts ?? [];
  const pricingTiers = pricing ?? [];
  return (
    <section
      id="pricing"
      className="border-t border-line bg-white/[0.012] py-20 sm:py-28"
    >
      <div className="wrap">
        <div>
          <SectionHead
            index="03"
            title="Harga & *Kontak*"
            lede="Paket penugasan fleksibel plus saluran langsung ke tim dispatch COP-S."
          />
        </div>

        <Reveal className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 font-rajdhani text-base font-bold uppercase tracking-[0.12em] text-white">
              <FileText className="size-4 text-pine-400" aria-hidden="true" />
              <TypeTitle as="span" text="Kontrak Berjalan" />
            </h3>
          </div>

          <ul className="mt-5 grid gap-4 md:grid-cols-3">
            {activeContracts.map((contract) => {
              const detailPoints = contract.detail
                ? contract.detail.split(/\n|(?=\b\d+\.\s)/).filter(p => p.trim() !== '')
                : [];
              return (
                <RevealItem key={contract.mou} as="li">
                  <div className="card h-full overflow-hidden flex flex-col">
                    {contract.photo_url && (
                      <div className="relative h-40 w-full border-b border-line bg-black/40">
                        <Image
                          src={contract.photo_url}
                          alt={`Server ${contract.server}`}
                          fill
                          className="object-cover opacity-80"
                        />
                      </div>
                    )}
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] text-slate-500">
                          {contract.mou}
                        </span>
                        <span
                          className={`rounded border px-2 py-0.5 font-mono text-[10px] tracking-[0.1em] ${contract.status === "Active"
                            ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                            : "border-amber-500/25 bg-amber-500/10 text-amber-400"
                            }`}
                        >
                          {contract.status.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="mt-3 font-rajdhani text-lg font-bold text-white">
                        {contract.server}
                      </h4>
                      <div className="mt-2 text-sm text-slate-400">
                        {detailPoints.length > 0 ? (
                          <ul className="space-y-1.5">
                            {detailPoints.map((point, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="mt-1.5 text-[6px] text-emerald-500">●</span>
                                <span className="leading-relaxed">{point.trim().replace(/^-\s*/, '')}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p>-</p>
                        )}
                      </div>
                    </div>
                  </div>
                </RevealItem>
              )
            })}
          </ul>
        </Reveal>

        <Reveal className="mt-14 grid gap-6 md:grid-cols-3 md:items-stretch">
          {pricingTiers.map((tier) => {
            const IconMap = { Shield, Crown, Target };
            const TierIcon = IconMap[tier.icon_name] ?? Shield;
            return (
              <RevealItem key={tier.name} className="h-full">
                <article
                  className={`card flex h-full flex-col p-6 sm:p-7 ${tier.popular ? "border-amber-500/35 bg-amber-500/[0.04]" : ""
                    }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] ${tier.popular ? "text-amber-400" : "text-slate-400"
                        }`}
                    >
                      <TierIcon
                        className={`size-4 ${tier.popular ? "text-amber-400" : "text-pine-400"}`}
                        aria-hidden="true"
                      />
                      {tier.tag}
                    </span>
                    {tier.popular && (
                      <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] tracking-[0.1em] text-amber-300">
                        POPULER
                      </span>
                    )}
                  </div>

                  <h3 className="mt-5 font-rajdhani text-2xl font-bold text-white">
                    {tier.name}
                  </h3>
                  <p className="mt-2 flex items-baseline gap-1.5">
                    <CountUp
                      value={tier.price}
                      decimals={tier.priceDecimals ?? 0}
                      prefix="Rp "
                      suffix={tier.priceSuffix}
                      className="font-orbitron text-2xl font-bold text-white"
                    />
                    <span className="text-sm text-slate-500">{tier.period}</span>
                  </p>

                  <ul className="mt-6 flex-1 space-y-2.5">
                    {tier.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2.5 text-sm"
                      >
                        <Check
                          className={`mt-0.5 size-4 flex-shrink-0 ${tier.popular ? "text-amber-400" : "text-pine-400"
                            }`}
                          aria-hidden="true"
                        />
                        <span className="text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href="#kontak"
                    className={`btn mt-7 w-full ${tier.popular ? "btn-warn" : "btn-primary"
                      }`}
                  >
                    {tier.cta}
                    <ArrowUpRight className="size-4" />
                  </a>
                </article>
              </RevealItem>
            );
          })}
        </Reveal>

        <div>
          <div
            id="kontak"
            className="card mt-16 grid scroll-mt-24 gap-8 p-6 sm:p-8 lg:grid-cols-12"
          >
            <div className="lg:col-span-5">
              <h3 className="font-rajdhani text-2xl font-bold text-white">
                Hubungi Tim Dispatch
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-400">
                Konsultasi penyesuaian SOP server, request trial shift, atau
                negosiasi MOU jangka panjang.
              </p>

              <ul className="mt-6 space-y-3">
                <li>
                  <a
                    href={DISCORD}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Buka server Discord COP-S"
                    className="flex items-center gap-3 rounded-lg border border-line p-3 transition-colors hover:border-blurple/50 hover:bg-blurple/5"
                  >
                    <span className="flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-blurple/15">
                      <DiscordIcon className="size-6 text-blurple" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[11px] uppercase tracking-[0.12em] text-slate-500">
                        Discord Dispatch
                      </span>
                      <span className="block text-sm font-medium text-slate-200">
                        Buka server
                      </span>
                    </span>
                  </a>
                </li>
                <li className="flex items-center gap-3 rounded-lg border border-line p-3">
                  <Clock
                    className="size-4 flex-shrink-0 text-emerald-400"
                    aria-hidden="true"
                  />
                  <span className="min-w-0">
                    <span className="block text-[11px] uppercase tracking-[0.12em] text-slate-500">
                      SLA Respons
                    </span>
                    <span className="block text-sm text-slate-200">
                      Di bawah 1 jam (24/7)
                    </span>
                  </span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-7">
              <MouCta />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MouCta() {
  return (
    <div
      id="kontak"
      className="card flex h-full scroll-mt-20 flex-col p-6 sm:p-7"
    >
      <h4 className="font-rajdhani text-lg font-bold text-white">Ajukan MOU</h4>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
        Ceritakan nama server, jumlah personil, dan kebutuhan shift Anda. Tim
        dispatch akan menindaklanjuti di Discord.
      </p>

      <ul className="mt-5 space-y-2.5 text-sm text-slate-400">
        {[
          "Jawab dalam 24 jam di channel ticket",
          "Konsultasi SOP tanpa biaya",
          "Trial shift sebelum kontrak penuh",
        ].map((item) => (
          <li key={item} className="flex items-start gap-2.5">
            <Check
              className="mt-0.5 size-4 flex-shrink-0 text-pine-400"
              aria-hidden="true"
            />
            {item}
          </li>
        ))}
      </ul>

      <a
        href={DISCORD}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary mt-auto w-full pt-6"
      >
        <DiscordIcon className="size-4" />
        Ajukan di Discord
        <ArrowUpRight className="ml-auto" />
      </a>
    </div>
  );
}

/* ─── 06 Script & Assets ─── */

function ScriptsSection({ products }) {
  const productsList = products ?? [];
  const [filter, setFilter] = useState("All");

  const categories = ["All", ...Array.from(new Set(productsList.map(p => p.category)))];

  const filteredProducts = useMemo(() => {
    return productsList.filter(p => filter === "All" || p.category === filter);
  }, [filter, productsList]);

  return (
    <section
      id="scripts"
      className="relative overflow-hidden border-t border-line py-20 sm:py-28"
    >
      <SectionImage src="/TKP2.png" opacity={0.3} />
      <div className="wrap relative">
        <div>
          <SectionHead
            index="04"
            title="Script & *Assets*"
            lede="Modul script policing, pack seragam EUP, dan file handling teruji untuk stabilitas server FiveM."
          />
        </div>

        <div
          className="mt-8 flex flex-wrap gap-2"
          role="group"
          aria-label="Filter kategori"
        >
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              aria-pressed={filter === c}
              className={`flex min-h-9 items-center rounded-full border px-4 text-xs uppercase tracking-[0.1em] transition-colors active:scale-95 ${filter === c
                ? "border-pine-500/40 bg-pine-500/15 text-white"
                : "border-line text-slate-400 hover:border-line-strong hover:text-white"
                }`}
            >
              {c}
            </button>
          ))}
        </div>

        <Reveal layout className="mt-10 grid gap-6 md:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => {
              const IconMap = { Code2, Shirt, Car };
              const ProductIcon = IconMap[product.icon_name] ?? Code2;
              return (
                <RevealItem layout key={product.id} className="h-full">
                  <article className="card flex h-full flex-col p-6">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-slate-400">
                        <ProductIcon
                          className="size-4 text-pine-400"
                          aria-hidden="true"
                        />
                        {product.category}
                      </span>
                      <span className="rounded border border-line bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] tracking-[0.1em] text-slate-300">
                        {product.badge}
                      </span>
                    </div>

                    <h3 className="mt-5 font-rajdhani text-xl font-bold text-white">
                      {product.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-slate-400">
                      {product.description}
                    </p>

                    <ul className="mt-6 flex-1 space-y-2">
                      {product.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-2 text-sm text-slate-400"
                        >
                          <span className="size-1 flex-shrink-0 rounded-full bg-pine-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-7 flex items-center justify-between gap-3 border-t border-line pt-5">
                      <CountUp
                        value={product.price}
                        prefix="Rp "
                        suffix={product.priceSuffix}
                        className="flex items-center gap-1.5 font-orbitron text-lg font-bold text-white"
                      />
                      <a
                        href="#kontak"
                        aria-label={`Tanya ${product.title} ke COP-S`}
                        className="btn btn-ghost btn-sm"
                      >
                        <Tag className="size-3.5 text-pine-400" aria-hidden="true" />
                        Tanya
                      </a>
                    </div>
                  </article>
                </RevealItem>
              );
            })}
          </AnimatePresence>
        </Reveal>

        <RevealItem className="mt-6">
          <div className="card flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex size-10 flex-shrink-0 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10">
                <Cpu className="size-4 text-amber-400" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-rajdhani text-lg font-bold text-white">
                  Butuh asset khusus untuk server Anda?
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Livery kendaraan, patch seragam kustom, dan integrasi skrip
                  dispatch.
                </p>
              </div>
            </div>
            <a
              href={DISCORD}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm w-full sm:w-auto"
            >
              Konsultasikan ke COP-S Agency
              <ArrowUpRight className="size-3.5" />
            </a>
          </div>
        </RevealItem>
      </div>
    </section>
  );
}

/* ─── 07 CTA ─── */

function CtaSection() {
  return (
    <section className="border-t border-line bg-white/[0.012] py-20 sm:py-28">
      <div className="wrap">
        <Reveal amount={0.4}>
          <div className="card relative overflow-hidden px-6 py-14 text-center sm:px-12">
            <div
              className="grid-bg pointer-events-none absolute inset-0 opacity-70"
              aria-hidden="true"
            />
            <div className="relative">
              <motion.span
                initial={{ scale: 0.85, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="mx-auto flex size-12 items-center justify-center rounded-full border border-pine-500/25 bg-pine-500/10"
              >
                <Siren className="size-5 text-pine-400" aria-hidden="true" />
              </motion.span>
              <TypeTitle
                as="h2"
                text="Naikkan standar *roleplay* server Anda"
                className="mx-auto mt-6 max-w-2xl font-orbitron text-2xl font-bold text-white sm:text-3xl"
              />
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-400">
                Personil COP-S siap diterjunkan maksimal 24 jam setelah sesi
                briefing operasional.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  href={DISCORD}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary w-full sm:w-auto"
                >
                  Buka Discord
                  <ArrowUpRight className="size-4" />
                </a>
                <a href="#roster" className="btn btn-ghost w-full sm:w-auto">
                  <Users className="size-4 text-pine-400" />
                  Periksa Roster
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════
   SHARED
   ══════════════════════════════════════════ */

function SectionImage({ src, opacity = 0.16, position = "object-center" }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <Image
        src={src}
        alt=""
        fill
        sizes="100vw"
        priority={false}
        className={`object-cover ${position}`}
        style={{ opacity }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#080608]/96 via-[#080608]/62 to-[#080608]/96" />
    </div>
  );
}

function SectionHead({ index, label, title, lede }) {
  return (
    <div className="max-w-2xl">
      {(index || label) && (
        <p className="eyebrow">
          {index && (
            <>
              <span className="font-mono text-slate-600">{index}</span>
              <span className="h-px w-6 bg-pine-500/40" aria-hidden="true" />
            </>
          )}
          {label}
        </p>
      )}
      <TypeTitle
        as="h2"
        text={title}
        className={`font-orbitron text-2xl font-bold text-white sm:text-3xl ${index || label ? "mt-4" : ""
          }`}
      />
      <p className="mt-4 text-base leading-relaxed text-slate-400">{lede}</p>
    </div>
  );
}

function DiscordIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.317 4.3698a19.7913 19.7913 0 0 0-4.8851-1.5152.0741.0741 0 0 0-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 0 0-.0785-.037 19.7363 19.7363 0 0 0-4.8852 1.515.0699.0699 0 0 0-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 0 0 .0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 0 0 .0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 0 0-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 0 0-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 0 0 .0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 0 0 .0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 0 0-.0066.1276 12.2986 12.2986 0 0 1-1.873.8914.0766.0766 0 0 0-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 0 0 .0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 0 0 .0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 0 0-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
    </svg>
  );
}

function Schematic({ tone, label, photoUrl }) {
  const gridId = `schematic-grid-${tone.rgb.replace(/,/g, "")}`;

  return (
    <div className="relative mt-6 overflow-hidden rounded-xl border border-white/8 bg-[#100a0a] p-4 h-[232px] flex flex-col justify-center">
      {photoUrl ? (
        <div className="absolute inset-0 z-0">
          <img src={photoUrl} alt={label} className="w-full h-full object-cover opacity-60 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#100a0a] via-[#100a0a]/30 to-transparent" />
        </div>
      ) : (
        <svg viewBox="0 0 400 200" className="w-full relative z-10" aria-hidden="true">
          <defs>
            <pattern
              id={gridId}
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M20 0H0V20"
                fill="none"
                stroke={`rgba(${tone.rgb},0.08)`}
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="400" height="200" fill={`url(#${gridId})`} />

          <g
            transform="translate(200 100)"
            fill="none"
            stroke={`rgba(${tone.rgb},0.35)`}
            strokeWidth="1"
          >
            <circle r="16" />
            <circle r="42" strokeDasharray="3 6" opacity="0.6" />
            <circle r="68" strokeDasharray="3 6" opacity="0.35" />
            <path d="M-80 0H80M0-70V70" opacity="0.4" />
          </g>

          <g transform="translate(200 100)">
            <path
              d="M0,-30 L26,-16 L26,10 Q26,28 0,40 Q-26,28 -26,10 L-26,-16 Z"
              fill={`rgba(${tone.rgb},0.07)`}
              stroke={`rgba(${tone.rgb},0.65)`}
              strokeWidth="1.2"
            />
            <circle r="4" fill={`rgba(${tone.rgb},0.9)`} />
          </g>
        </svg>
      )}

      <span className="absolute bottom-3 left-4 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500 z-20">
        {label}
      </span>
    </div>
  );
}

function DivisionBar({ ratio }) {
  const reduced = useReducedMotion();
  return (
    <span
      aria-hidden="true"
      className="h-1.5 w-14 overflow-hidden rounded-full bg-white/5"
    >
      <motion.span
        className="block h-full rounded-full bg-pine-500/60"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: ratio }}
        viewport={{ once: true, amount: 0.6 }}
        style={reduced ? { width: `${ratio * 100}%` } : { originX: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      />
    </span>
  );
}

function OfficerCard({ officer }) {
  const tone = accent[officer.divTag === "DIV-A" ? "rose" : "blue"];
  const monogram = officer.rank.split(" ")[0].slice(0, 3).toUpperCase();

  return (
    <article className="card group flex h-full flex-col p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-slate-500">
          {officer.id}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-[0.1em] ${statusTone[officer.status]
            }`}
        >
          <span
            className={`size-1 rounded-full ${officer.status === "Active"
              ? "bg-emerald-400"
              : officer.status === "On-Duty"
                ? "bg-pine-400"
                : "bg-amber-400"
              }`}
          />
          {officer.status.toUpperCase()}
        </span>
      </div>

      <div className="mt-5 flex items-center gap-3.5">
        <span
          className={`flex size-12 flex-shrink-0 items-center justify-center rounded-lg border font-orbitron text-xs font-bold ${tone.ring} ${tone.text}`}
        >
          {monogram}
        </span>
        <div className="min-w-0">
          <h3 className="truncate font-rajdhani text-lg font-bold text-white">
            {officer.name}
          </h3>
          <p className="truncate font-mono text-[11px] text-slate-500">
            {officer.callsign}
          </p>
        </div>
      </div>

      <dl className="mt-5 space-y-0 border-t border-line text-sm">
        {[
          ["Pangkat", officer.rank],
          ["Divisi", officer.division],
          ["JK", officer.gender],
          ["Keterangan", officer.notes],
        ].map(([key, value], i, rows) => (
          <div
            key={key}
            className={`flex items-center justify-between py-2 ${i < rows.length - 1 ? "border-b border-line" : ""
              }`}
          >
            <dt className="text-[11px] uppercase tracking-[0.12em] text-slate-500">
              {key}
            </dt>
            <dd
              className={
                key === "Divisi" ? `font-medium ${tone.text}` : "text-slate-200"
              }
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <a
        href="#kontak"
        className="btn btn-ghost btn-sm mt-5 w-full opacity-0 focus-visible:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100 sm:opacity-100"
      >
        Minta Profil Lengkap
      </a>
    </article>
  );
}
