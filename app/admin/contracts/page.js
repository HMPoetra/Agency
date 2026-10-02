// app/admin/contracts/page.js
import { getContracts, getPricingTiers } from "@/lib/queries";
import { deleteContractAction, deletePricingAction } from "@/app/actions/admin";
import ContractForm from "./ContractForm";
import PricingForm from "./PricingForm";
import DeleteButton from "@/app/components/DeleteButton";
import { FileText, Trash2, Tag } from "lucide-react";

export const metadata = { title: "Harga & Kontrak — Admin COP-S" };

export default async function ContractsPage() {
  const [contracts, pricingTiers] = await Promise.all([
    getContracts(),
    getPricingTiers()
  ]);

  const statusStyle = {
    Active:     "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
    Pending:    "border-amber-500/25 bg-amber-500/10 text-amber-400",
    Expired:    "border-slate-500/25 bg-slate-500/10 text-slate-400",
    Terminated: "border-crimson-500/25 bg-crimson-500/10 text-crimson-400",
  };

  return (
    <div className="space-y-12">
      {/* ── PRICING SECTION ── */}
      <section>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">
              <span className="font-mono text-slate-600">03</span>
              <span className="h-px w-6 bg-crimson-500/40" />
              Manajemen
            </p>
            <h1 className="mt-1 font-orbitron text-xl font-bold text-white flex items-center gap-2">
              <Tag className="size-5 text-crimson-400" /> Paket Harga (Langganan)
            </h1>
          </div>
          <PricingForm mode="create" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pricingTiers.map((pricing) => (
            <div key={pricing.id} className="card flex flex-col p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] text-slate-500">{pricing.tag || "REGULAR"}</span>
                {pricing.is_popular && (
                  <span className="rounded border border-pine-500/30 bg-pine-500/10 px-2 py-0.5 font-mono text-[10px] tracking-[0.1em] text-pine-400">
                    POPULAR
                  </span>
                )}
              </div>
              <h3 className="mt-3 font-rajdhani text-lg font-bold text-white">{pricing.name}</h3>
              <p className="mt-1 flex-1 text-2xl font-bold text-crimson-400">
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(pricing.price_idr)}
                <span className="text-sm text-slate-500 font-normal">/{pricing.billing_period}</span>
              </p>
              
              <div className="mt-4 flex gap-2 border-t border-line pt-4">
                <PricingForm pricing={pricing} mode="edit" />
                <DeleteButton action={deletePricingAction.bind(null, pricing.id)} itemName="Paket Harga" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONTRACTS SECTION ── */}
      <section>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-line pt-12">
          <div>
            <h1 className="font-orbitron text-xl font-bold text-white flex items-center gap-2">
              <FileText className="size-5 text-crimson-400" /> Kontrak MOU (Partner)
            </h1>
          </div>
          <ContractForm mode="create" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {contracts.map((contract) => (
            <div key={contract.id} className="card flex flex-col p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] text-slate-500">{contract.mou_code}</span>
                <span className={`rounded border px-2 py-0.5 font-mono text-[10px] tracking-[0.1em] ${statusStyle[contract.status] ?? statusStyle.Expired}`}>
                  {contract.status.toUpperCase()}
                </span>
              </div>
              <h3 className="mt-3 font-rajdhani text-lg font-bold text-white">{contract.server_name}</h3>
              <p className="mt-1 flex-1 text-sm text-slate-400">{contract.detail}</p>
              {contract.personnel_count && (
                <p className="mt-2 text-xs text-slate-500">👥 {contract.personnel_count} personil</p>
              )}
              {contract.signed_at && (
                <p className="text-xs text-slate-600">
                  Tanda tangan: {new Date(contract.signed_at).toLocaleDateString("id-ID")}
                </p>
              )}
              <div className="mt-4 flex gap-2 border-t border-line pt-4">
                <ContractForm contract={contract} mode="edit" />
                <DeleteButton action={deleteContractAction.bind(null, contract.id)} itemName="Kontrak MOU" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
