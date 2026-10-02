// app/login/page.js
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Login — COP-S",
};

export default async function LoginPage() {
  const session = await getSession();
  if (session?.role === "admin") redirect("/admin");
  if (session?.role === "user") redirect("/absensi");

  return (
    <div className="min-h-screen flex items-center justify-center bg-night px-4">
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-crimson-700/[0.12] blur-[120px]" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <span className="font-orbitron text-2xl font-black tracking-[0.2em] text-white">
            COP<span className="text-crimson-400">-S</span>
          </span>
          <p className="mt-1 font-rajdhani text-xs uppercase tracking-[0.22em] text-slate-500">
            Cops On Supply
          </p>
        </div>

        <div className="card p-8">
          <h1 className="font-orbitron text-lg font-bold text-white">
            Masuk ke Sistem
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Gunakan kredensial yang diberikan oleh dispatcher.
          </p>
          <LoginForm />
        </div>

        <p className="mt-6 text-center font-mono text-[10px] text-slate-600">
          COP-S DISPATCH SYSTEM &middot; SECURE ACCESS
        </p>
        
        <div className="mt-8 flex justify-center">
          <a href="/" className="btn btn-ghost text-sm">
            &larr; Kembali ke Dashboard Utama
          </a>
        </div>
      </div>
    </div>
  );
}
