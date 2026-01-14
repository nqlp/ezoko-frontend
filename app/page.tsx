"use client";

import { useEffect, useRef, useState } from "react";
import { getVariantByBarcode } from "./actions/getVariantByBarcode";
import { BinQty, ProductVariant } from "@/lib/types/product";

export default function Page() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foundProduct, setFoundProduct] = useState<ProductVariant | null>(null);
  const [binQty, setBinQty] = useState<BinQty[]>([]);
  const [isMagnified, setIsMagnified] = useState(false);
  const displayImage = foundProduct?.image ?? foundProduct?.product.featuredImage ?? null;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key == "Escape") {
        setIsMagnified(false);
      }
    };

    if (isMagnified) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMagnified]);

  async function submit() {
    const value = barcode.trim();
    if (!value) {
      setError("Entrer un barcode valide");
      return;
    }

    setLoading(true);
    setError(null);
    setBinQty([]);
    setBarcode(""); // clear for the next scan/type
    setIsMagnified(false);
    inputRef.current?.focus();

    try {
      const result = await getVariantByBarcode(value);
      if (result.success && result.data.length > 0) {
        const product = result.data[0];
        setFoundProduct(product);
        setBinQty(product.binQty ?? []);
      }

      else if (result.success && result.data.length === 0) {
        setError("Produit non trouvé");
        setFoundProduct(null);
      }
      else if (!result.success) {
        setError(result.message);
        setFoundProduct(null);
      }
    }

    catch (error) {
      setError("Erreur lors de la récupération du produit");
      setFoundProduct(null);
    }

    finally {
      setLoading(false);
      setBarcode("");
      inputRef.current?.focus();
    }
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto w-full max-w-4xl border-2 border-(--ezoko-ink) bg-(--ezoko-surface) shadow-[10px_10px_0_var(--ezoko-mint)]">
        <div className="grid gap-0 md:grid-cols-[1.15fr_1fr]">
          <section className="border-b-2 border-(--ezoko-ink) p-8 md:border-b-0 md:border-r-2">
            <div className="ezoko-barcode mb-6" />
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full border-2 border-(--ezoko-ink)] bg-white p-2">
                <img src="/favicon.ico" alt="EZOKO logo" className="h-full w-full object-contain" />
              </div>
              <h1 className="text-4xl font-black tracking-tight md:text-5xl text-(--ezoko-ink)]">
                EZOKO Barcode
              </h1>
            </div>
            <p className="mt-3 text-sm text-(--ezoko-ink) opacity-70 md:text-base">
              Scan rapide pour retrouver un produit Shopify. Simple, net et sans friction.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-[10px] font-mono uppercase tracking-[0.35em] text-(--ezoko-ink)">
              <span className="border border-(--ezoko-ink) px-3 py-1">Scan</span>
              <span className="border border-(--ezoko-ink) px-3 py-1">Pêche</span>
              <span className="border border-(--ezoko-ink) px-3 py-1">Stock</span>
            </div>
          </section>

          <section className="p-8">
            <div className="grid gap-3">
              <label
                htmlFor="barcode"
                className="text-xs font-semibold uppercase tracking-[0.3em] text-(--ezoko-ink) opacity-70"
              >
                Barcode
              </label>

              <input
                id="barcode"
                ref={inputRef}
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    submit();
                  }
                }}
                placeholder="Taper le barcode"
                inputMode="numeric"
                autoComplete="off"
                className="rounded-none border-2 border-(--ezoko-ink)] px-4 py-3 text-lg font-mono tracking-widest focus:outline-none focus:ring-0 focus:border-(--ezoko-mint-strong)"
              />

              <div className="flex items-center justify-between text-xs text-(--ezoko-ink) opacity-60">
                <span>Entrée manuelle</span>
                <span>↵ Enter</span>
              </div>

              <button
                onClick={submit}
                className="mt-2 rounded-none border-2 border-(--ezoko-ink) px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-(--ezoko-ink) bg-(--ezoko-mint) hover:bg-(--ezoko-ink) hover:text-white transition-colors"
              >
                {loading ? "Recherche..." : "Envoyer"}
              </button>

              {error && (
                <div className="mt-2 border border-(--ezoko-ink) bg-white px-3 py-2 text-xs font-mono text-(--ezoko-ink)">
                  {error}
                </div>
              )}

              {foundProduct && (
                <div className="mt-4 border-2 border-(--ezoko-ink) bg-(--ezoko-paper) p-4 ezoko-rise">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-(--ezoko-ink)">Produit trouvé</h2>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-4 items-start">
                    <div
                      className={`h-28 w-28 border-2 border-(--ezoko-ink) bg-white flex items-center justify-center shrink-0 ${displayImage ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
                      onClick={() => displayImage && setIsMagnified(true)}
                    >
                      {displayImage ? (
                        <img
                          src={displayImage.url}
                          alt={displayImage.altText ?? "Product image"}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <span className="text-[10px] text-(--ezoko-ink) opacity-50 text-center uppercase tracking-widest">
                          Aucune image disponible
                        </span>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="text-base font-semibold text-(--ezoko-ink)">
                        {foundProduct.product.title}
                      </div>

                      <div className="text-sm text-(--ezoko-ink) opacity-80">
                        {foundProduct.selectedOptions.map((option) => (
                          <div key={option.name}>
                            {option.name}: {option.value}
                          </div>
                        ))}
                      </div>

                      <div className="text-xs font-mono uppercase tracking-widest text-(--ezoko-ink) opacity-70">
                        SKU {foundProduct.sku}
                      </div>

                      <div className="text-xs font-mono uppercase tracking-widest text-(--ezoko-ink) opacity-70">
                        On-hand {foundProduct.inventoryQuantity ?? "N/A"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between border-2 border-(--ezoko-ink) bg-(--ezoko-mint) px-3 py-2">
                      <span className="text-[10px] font-mono uppercase tracking-[0.35em] text-(--ezoko-ink)">
                        Stock par bin
                      </span>
                      <span className="text-[10px] font-mono uppercase text-(--ezoko-ink)">
                        {binQty.length} slot{binQty.length > 1 ? "s" : ""}
                      </span>
                    </div>

                    {binQty.length === 0 && (
                      <div className="border-x-2 border-b-2 border-(--ezoko-ink) bg-white px-3 py-2 text-[11px] font-mono text-(--ezoko-ink) opacity-70">
                        Aucun stock par bin
                      </div>
                    )}

                    {binQty.length > 0 && (
                      <div className="border-x-2 border-b-2 border-(--ezoko-ink) bg-white p-3">
                        <thead> 
                          <tr className="grid grid-cols-2 gap-4 border-b border-(--ezoko-ink) pb-2 mb-2">
                            <th className="text-[10px] font-mono uppercase tracking-[0.35em] text-(--ezoko-ink)] text-left">Bin Location</th>
                            <th className="text-[10px] font-mono uppercase tracking-[0.35em] text-(--ezoko-ink)] text-left">Quantity</th>
                          </tr>
                        </thead>
                        <div className="flex flex-wrap gap-2">
                          {binQty.map((entry, index) => (
                            <span
                              key={`${entry.binLocation}-${index}`}
                              className="rounded-lg border border-(--ezoko-ink) bg-(--ezoko-paper) px-3 py-1 text-xs font-semibold text-(--ezoko-ink)"
                            >
                              {entry.binLocation} {entry.qty}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {isMagnified && displayImage && (
        <div
          className="fixed inset-0 bg-[rgba(18,19,21,0.75)] backdrop-blur-sm flex items-center justify-center z-50 cursor-pointer p-4"
          onClick={() => setIsMagnified(false)}
        >
          <img
            src={displayImage.url}
            alt={displayImage.altText ?? "Magnified product image"}
            className="max-w-full max-h-full object-contain border-2 border-[(--ezoko-ink)] bg-white"
          />
          <button
            className="absolute top-4 right-4 text-(--ezoko-mint)] text-2xl font-bold p-2 hover:text-white"
            onClick={() => setIsMagnified(false)}
          >
            X
          </button>
        </div>
      )}
    </main>
  );
}
