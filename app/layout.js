import { Inter, Orbitron, Rajdhani } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { headers } from "next/headers";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cops-inter",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cops-orbitron",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-cops-rajdhani",
});

export const metadata = {
  title: "COP-s | Cops On Supply, Agensi Penyewaan Polisi FiveM",
  description:
    "COP-s (Cops On Supply) adalah agensi penyedia personil polisi profesional untuk server FiveM. Personil bersertifikat, SOP tinggi, siap diterjunkan untuk kebutuhan roleplay kepolisian Anda.",
  keywords:
    "FiveM, police roleplay, cops, rental, roleplay agency, GTA V, server polisi",
  openGraph: {
    title: "COP-s | Cops On Supply",
    description:
      "Personil polisi profesional bersertifikat untuk server FiveM. SOP taktis, shift 24/7, garansi netralitas roleplay.",
    type: "website",
    locale: "id_ID",
  },
};

// Halaman-halaman yang tidak pakai Navbar/Footer publik
const NO_SHELL_PREFIXES = ["/admin", "/login", "/absensi", "/profile"];

export default async function RootLayout({ children }) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isShell = !NO_SHELL_PREFIXES.some((p) => pathname.startsWith(p));

  return (
    <html
      lang="id"
      className={`${inter.variable} ${orbitron.variable} ${rajdhani.variable}`}
    >
      <body className="min-h-screen flex flex-col">
        {isShell && <Navbar />}
        <main className={isShell ? "flex-1 flex flex-col" : "flex-1"}>
          {children}
        </main>
        {isShell && <Footer />}
        <Toaster position="bottom-right" richColors theme="dark" />
      </body>
    </html>
  );
}

