"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteOfficerAction } from "@/app/actions/admin";
import { toast } from "sonner";

export default function DeleteOfficerButton({ id, name }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!window.confirm(`Yakin ingin menghapus personil ${name}?`)) return;
    
    startTransition(async () => {
      try {
        await deleteOfficerAction(id);
        toast.success(`Personil ${name} berhasil dihapus!`);
      } catch (error) {
        toast.error(`Gagal menghapus personil ${name}`);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className={`btn btn-danger btn-sm ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={`Hapus ${name}`}
    >
      <Trash2 className="size-3.5" />
      {isPending && <span className="sr-only">Menghapus...</span>}
    </button>
  );
}
