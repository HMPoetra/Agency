"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function DeleteButton({ action, title = "Hapus", itemName = "Data" }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!window.confirm(`Yakin ingin menghapus ${itemName}?`)) return;
    
    startTransition(async () => {
      try {
        await action();
        toast.success(`${itemName} berhasil dihapus!`);
      } catch (error) {
        toast.error(`Gagal menghapus ${itemName}`);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className={`btn btn-ghost btn-sm text-crimson-400 hover:bg-crimson-500/10 hover:text-crimson-300 ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={title}
    >
      <Trash2 className="size-3.5" />
      {isPending && <span className="sr-only">Menghapus...</span>}
    </button>
  );
}
