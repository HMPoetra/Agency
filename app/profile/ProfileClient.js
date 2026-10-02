"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { updatePasswordAction, updatePersonalAction } from "@/app/actions/profile";
import { Lock, User, Eye, EyeOff } from "lucide-react";

const RANKS = [
  "01. CHIEF", "02. ASSISTANT CHIEF", "03. COMMANDER", "04. CAPTAIN",
  "05. LIEUTENANT II", "06. LIEUTENANT", "07. SERGEANT II", "08. SERGEANT",
  "09. SENIOR POLICE OFFICER", "10. POLICE OFFICER III", "11. POLICE OFFICER II",
  "12. POLICE OFFICER", "13. CADET"
];

export default function ProfileClient({ session, officer }) {
  const [passState, passDispatch, passPending] = useActionState(updatePasswordAction, null);
  const [personalState, personalDispatch, personalPending] = useActionState(updatePersonalAction, null);
  const passFormRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (passState?.success) {
      alert("Password berhasil diubah!");
      passFormRef.current?.reset();
    }
  }, [passState]);

  useEffect(() => {
    if (personalState?.success) {
      alert("Informasi personal berhasil diperbarui!");
    }
  }, [personalState]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      
      {officer && (
        <div className="card p-6">
          <div className="mb-6 flex items-center gap-3">
            <User className="size-5 text-crimson-400" />
            <h2 className="font-rajdhani text-xl font-bold text-white">Informasi Personil</h2>
          </div>
          
          <form action={personalDispatch} className="space-y-4">
            <input type="hidden" name="officer_id" value={officer.id} />
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Nama Lengkap</label>
                <input type="text" name="full_name" className="field" defaultValue={officer.full_name} required />
              </div>
              <div>
                <label className="label">Callsign</label>
                <input type="text" name="callsign" className="field" defaultValue={officer.callsign} required />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Pangkat</label>
                <select name="rank" multiple className="field min-h-[120px]" defaultValue={officer?.rank ? officer.rank.split(", ") : []} required>
                  {RANKS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <p className="mt-1 text-[10px] text-slate-500">Tahan Ctrl/Cmd untuk memilih lebih dari 1</p>
              </div>
              <div>
                <label className="label">Divisi</label>
                <input type="text" name="division" className="field" defaultValue={officer.division} required />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 mt-4">
              <div>
                <label className="label">Jenis Kelamin</label>
                <select name="gender" className="field" defaultValue={officer.gender || "-"}>
                  <option value="-">-</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="label">Unit Task</label>
                <input type="text" name="unit_task" className="field" defaultValue={officer.unit_task === "-" ? "" : officer.unit_task} placeholder="Boleh dikosongkan..." />
              </div>
            </div>

            <div>
              <label className="label">Catatan Pribadi</label>
              <textarea name="notes" rows={3} className="field resize-none" defaultValue={officer.notes === "-" ? "" : officer.notes} placeholder="Catatan tambahan..." />
            </div>

            {personalState?.error && (
              <p className="text-sm text-crimson-400">{personalState.error}</p>
            )}

            <div className="pt-2">
              <button type="submit" className="btn btn-primary w-full" disabled={personalPending}>
                {personalPending ? "Menyimpan..." : "Simpan Informasi"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card p-6">
        <div className="mb-6 flex items-center gap-3">
          <Lock className="size-5 text-crimson-400" />
          <h2 className="font-rajdhani text-xl font-bold text-white">Ubah Password</h2>
        </div>
        
        <form ref={passFormRef} action={passDispatch} className="space-y-4">
          <input type="hidden" name="user_id" value={session.id} />
          
          <div>
            <label className="label">Password Lama</label>
            <input type={showPassword ? "text" : "password"} name="old_password" required className="field" placeholder="Ketik password lama..." />
          </div>
          <div>
            <label className="label">Password Baru</label>
            <input type={showPassword ? "text" : "password"} name="new_password" required className="field" placeholder="Ketik password baru..." />
          </div>
          <div>
            <label className="label">Konfirmasi Password Baru</label>
            <input type={showPassword ? "text" : "password"} name="confirm_password" required className="field" placeholder="Ketik ulang password baru..." />
          </div>

          <div className="flex justify-end pt-1">
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              {showPassword ? "Sembunyikan" : "Lihat"} Password
            </button>
          </div>

          {passState?.error && (
            <p className="text-sm text-crimson-400">{passState.error}</p>
          )}

          <div className="pt-2">
            <button type="submit" className="btn btn-primary w-full" disabled={passPending}>
              {passPending ? "Mengubah..." : "Ubah Password"}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
