// app/absensi/AttendanceClient.js
"use client";

import { useActionState, useState } from "react";
import { checkInAction, checkOutAction } from "@/app/actions/attendance";
import { LogIn, LogOut, Clock, CheckCircle } from "lucide-react";

export default function AttendanceClient({ todayRecord, officerId }) {
  const isCheckedIn = todayRecord && !todayRecord.checked_out_at;
  const isCheckedOut = todayRecord && todayRecord.checked_out_at;

  const [checkInState, checkInDispatch, checkInPending] = useActionState(
    checkInAction, null
  );
  const [note, setNote] = useState("");

  async function handleCheckOut() {
    await checkOutAction(todayRecord.id);
  }

  if (isCheckedOut) {
    return (
      <div className="card p-8 text-center">
        <CheckCircle className="mx-auto size-12 text-emerald-400 mb-4" />
        <h2 className="font-rajdhani text-2xl font-bold text-white">Shift Selesai!</h2>
        <p className="mt-2 text-slate-400">
          Durasi: <span className="text-white font-mono">
            {Math.floor(todayRecord.duration_minutes / 60)}j {Math.round(todayRecord.duration_minutes % 60)}m
          </span>
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Check-in: {new Date(todayRecord.checked_in_at).toLocaleTimeString("en-GB", { timeZone: "Asia/Jakarta" })} WIB &middot;{" "}
          Check-out: {new Date(todayRecord.checked_out_at).toLocaleTimeString("en-GB", { timeZone: "Asia/Jakarta" })} WIB
        </p>
      </div>
    );
  }

  if (isCheckedIn) {
    return (
      <div className="card p-8 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full border-2 border-crimson-500/40 bg-crimson-500/10 mb-4">
          <Clock className="size-7 text-crimson-400 animate-pulse" />
        </div>
        <h2 className="font-rajdhani text-2xl font-bold text-white">Sedang Bertugas</h2>
        <p className="mt-2 text-slate-400">
          Check-in:{" "}
          <span className="font-mono text-crimson-400">
            {new Date(todayRecord.checked_in_at).toLocaleTimeString("en-GB", { timeZone: "Asia/Jakarta" })} WIB
          </span>
        </p>
        <form
          action={handleCheckOut}
          className="mt-6"
        >
          <button
            type="submit"
            className="btn btn-danger w-full sm:w-auto"
            id="checkout-btn"
          >
            <LogOut className="size-4" />
            Check-Out Sekarang
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="card p-8">
      <h2 className="font-rajdhani text-xl font-bold text-white mb-1">
        Mulai Shift Hari Ini
      </h2>
      <p className="text-sm text-slate-400 mb-6">
        Rekam kehadiran kamu untuk hari ini.
      </p>
      <form action={checkInDispatch} className="space-y-4">
        <div>
          <label htmlFor="note" className="label">Catatan (opsional)</label>
          <input
            id="note"
            name="note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="field"
            placeholder="Mis: Patroli sector 3, operasi khusus..."
          />
        </div>

        {checkInState?.error && (
          <p className="text-sm text-crimson-400">{checkInState.error}</p>
        )}

        <button
          type="submit"
          disabled={checkInPending}
          className="btn btn-primary w-full"
          id="checkin-btn"
        >
          {checkInPending ? (
            <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <LogIn className="size-4" />
          )}
          {checkInPending ? "Mencatat..." : "Check-In Sekarang"}
        </button>
      </form>
    </div>
  );
}
