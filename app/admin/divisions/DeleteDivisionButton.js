"use client";

import { useState } from "react";
import { deleteDivisionAction } from "@/app/actions/admin";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function DeleteDivisionButton({ id, name }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (confirm(`Apakah Anda yakin ingin menghapus divisi ${name}? Tindakan ini tidak dapat dibatalkan.`)) {
      setLoading(true);
      try {
        await deleteDivisionAction(id);
        toast.success(`Divisi ${name} berhasil dihapus!`);
      } catch (e) {
        toast.error(`Gagal menghapus divisi ${name}`);
      }
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="btn btn-ghost btn-sm flex-1 text-slate-500 hover:bg-crimson-500/10 hover:text-crimson-400"
      title="Hapus Divisi"
    >
      <Trash2 className="size-3.5" />
      Hapus
    </button>
  );
}
