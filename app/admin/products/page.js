import { getAllProducts } from "@/lib/queries";
import { deleteProductAction } from "@/app/actions/admin";
import ProductForm from "./ProductForm";
import DeleteButton from "@/app/components/DeleteButton";
import { Package, Trash2, ExternalLink } from "lucide-react";
import Image from "next/image";

export const metadata = { title: "Script & Assets — Admin COP-S" };

export default async function ProductsPage() {
  const products = await getAllProducts();

  return (
    <div className="space-y-12">
      <section>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">
              <span className="font-mono text-slate-600">06</span>
              <span className="h-px w-6 bg-crimson-500/40" />
              Toko
            </p>
            <h1 className="mt-1 font-orbitron text-xl font-bold text-white flex items-center gap-2">
              <Package className="size-5 text-crimson-400" /> Script & Assets
            </h1>
          </div>
          <ProductForm mode="create" />
        </div>

        {products.length === 0 ? (
          <div className="card p-8 text-center text-slate-400">
            Belum ada produk. Klik Tambah Script/Asset untuk membuat baru.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => {
              const photoUrls = product.photo_urls ? (typeof product.photo_urls === 'string' ? JSON.parse(product.photo_urls) : product.photo_urls) : [];
              const features = Array.isArray(product.features) ? product.features : JSON.parse(product.features ?? "[]");
              
              return (
                <div key={product.id} className="card flex flex-col p-5">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-[11px] text-slate-500 uppercase tracking-wider">{product.category}</span>
                    {!product.is_active && (
                      <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] tracking-[0.1em] text-amber-400">
                        NONAKTIF
                      </span>
                    )}
                  </div>
                  
                  {photoUrls.length > 0 && (
                    <div className="relative h-40 w-full rounded-lg overflow-hidden bg-black/40 mb-4 border border-line">
                      <Image
                        src={photoUrls[0]}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                      {photoUrls.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-xs px-2 py-1 rounded text-white font-mono">
                          +{photoUrls.length - 1} foto
                        </div>
                      )}
                    </div>
                  )}

                  <h3 className="font-rajdhani text-lg font-bold text-white">{product.title}</h3>
                  <p className="mt-1 flex-1 text-2xl font-bold text-crimson-400">
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(product.price_idr)}
                  </p>
                  
                  {product.description && (
                    <p className="mt-3 text-sm text-slate-400 line-clamp-2">{product.description}</p>
                  )}

                  {features.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {features.slice(0, 3).map((f, i) => (
                        <li key={i} className="text-xs text-slate-500 flex items-center gap-1.5">
                          <span className="size-1 bg-crimson-500/50 rounded-full" />
                          <span className="truncate">{f}</span>
                        </li>
                      ))}
                      {features.length > 3 && (
                        <li className="text-xs text-slate-600 pl-2.5">+{features.length - 3} fitur lainnya</li>
                      )}
                    </ul>
                  )}
                  
                  {product.video_url && (
                    <a href={product.video_url} target="_blank" rel="noopener noreferrer" className="mt-3 text-xs text-pine-400 hover:text-pine-300 flex items-center gap-1">
                      <ExternalLink className="size-3" /> Lihat Video
                    </a>
                  )}
                  
                  <div className="mt-4 flex gap-2 border-t border-line pt-4">
                    <ProductForm product={product} mode="edit" />
                    <DeleteButton action={deleteProductAction.bind(null, product.id)} itemName="Script/Asset" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
