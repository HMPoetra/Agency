// app/login/LoginForm.js
"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import { Eye, EyeOff, LogIn, Shield } from "lucide-react";
import { useState } from "react";

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null);
  const [show, setShow] = useState(false);

  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label htmlFor="login-username" className="label">Username</label>
        <input
          id="login-username"
          name="username"
          type="text"
          autoComplete="username"
          required
          className="field"
          placeholder="masukkan username..."
        />
      </div>

      <div>
        <label htmlFor="login-password" className="label">Password</label>
        <div className="relative">
          <input
            id="login-password"
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            className="field pr-11"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
            aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      {state?.error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-crimson-500/30 bg-crimson-500/10 px-3.5 py-2.5 text-sm text-crimson-300"
        >
          <Shield className="size-4 flex-shrink-0" aria-hidden="true" />
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary w-full mt-2"
        id="login-submit"
      >
        {pending ? (
          <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <LogIn className="size-4" />
        )}
        {pending ? "Memverifikasi..." : "Masuk"}
      </button>
    </form>
  );
}
