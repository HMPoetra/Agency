"use client";

import { useActionState, useState } from "react";
import { createRankAction, deleteRankAction } from "@/app/actions/admin";
import { Trash2, Plus } from "lucide-react";

function RankForm() {
  const [state, dispatch, pending] = useActionState(createRankAction, null);
  const [name, setName] = useState("");

  return (
    <form action={(f) => { dispatch(f); setName(""); }} className="flex gap-2 mt-4">
      <input 
        name="name" 
        value={name} 
        onChange={e => setName(e.target.value)} 
        placeholder="Nama pangkat..." 
        className="field flex-1 h-9 text-sm" 
        required 
      />
      <button type="submit" disabled={pending} className="btn btn-primary h-9 px-3">
        <Plus className="size-4" /> Tambah
      </button>
    </form>
  );
}

export default function ManageMetadataClient({ ranks }) {
  return (
    <div className="mb-8 max-w-lg">
      {/* Ranks Card */}
      <div className="card p-5">
        <h2 className="font-rajdhani text-lg font-bold text-white mb-4 border-b border-line pb-2">Manajemen Pangkat</h2>
        <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
          {ranks.map(r => (
            <div key={r.id} className="flex items-center justify-between p-2 rounded bg-white/5 border border-line/50 hover:bg-white/10 transition-colors">
              <span className="text-sm font-mono text-slate-300">{r.name}</span>
              <button 
                onClick={() => {
                  if (confirm("Hapus pangkat ini?")) deleteRankAction(r.id);
                }}
                className="text-slate-500 hover:text-crimson-400"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
        <RankForm />
      </div>
    </div>
  );
}
