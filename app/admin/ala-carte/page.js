// app/admin/ala-carte/page.js
import { getAlaCarte, getDivisions, getAlaCarteRanks } from "@/lib/queries";
import AlaCarteClient from "./AlaCarteClient";
import { ShoppingBag } from "lucide-react";

export const metadata = { title: "Ala Carte — Admin COP-S" };

export default async function AlaCartePage() {
  const [items, divisions, ranks] = await Promise.all([
    getAlaCarte(),
    getDivisions(),
    getAlaCarteRanks(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <p className="eyebrow">
          <span className="font-mono text-slate-600">07</span>
          <span className="h-px w-6 bg-crimson-500/40" />
          Layanan
        </p>
        <h1 className="mt-1 flex items-center gap-2 font-orbitron text-xl font-bold text-white">
          <ShoppingBag className="size-5 text-crimson-400" /> Ala Carte
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Atur biaya layanan lepas: harga dasar per divisi, harga per orang, dan
          harga request jabatan. Pelanggan memilihnya lewat kalkulator di Beranda.
        </p>
      </div>

      <AlaCarteClient items={items} divisions={divisions} ranks={ranks} />
    </div>
  );
}
