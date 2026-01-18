"use client";

import { useEffect, useRef, useState } from "react";
import { getVariantByBarcode } from "./actions/getVariantByBarcode";
import VariantCard from "./scan/_components/VariantCard";
import StockTable from "./scan/_components/StockTable";
import { StockLocation } from "@/lib/types/StockLocation";
import { ProductVariant } from "@/lib/types/ProductVariant";

export default function Page() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foundProduct, setFoundProduct] = useState<ProductVariant | null>(null);
  const [stockLocation, setStockLocation] = useState<StockLocation[]>([]);

  const incrementQty = (index: number) => {
    setStockLocation((prev) => (prev.map((loc, i) => i === index ? { ...loc, quantity: loc.qty + 1 } : loc)));
  };

  const decrementQty = (index: number) => {
    setStockLocation((prev) => (prev.map((loc, i) => i === index ? { ...loc, quantity: Math.max(0, loc.qty - 1) } : loc)));
  }

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function submit() {
    const value = barcode.trim();
    if (!value) {
      setError("Entrer un barcode valide");
      return;
    }

    setLoading(true);
    setError(null);
    setStockLocation([]);
    setFoundProduct(null); // Clear for new search
    setBarcode("");
    inputRef.current?.focus();

    try {
      const result = await getVariantByBarcode(value);

      if (result.success && result.data) {
        const product = result.data;
        setFoundProduct(product); // Saving found product
        setStockLocation(product.binQty ?? []); // On remplit le tableau
      } else if (result.success && !result.data) {
        setError("Product not found");
      } else if (!result.success) {
        setError(result.message);
      }
    } catch (e) {
      setError("Error fetching product");
      console.error(e);
    } finally {
      setLoading(false);
      setBarcode("");
    }
  }

  return (
    <main className="min-h-screen">
      <div className="h-12 w-12 rounded-full border-2 border-(--ezoko-ink) bg-white p-2 mx-auto mt-4">
        <img src="/favicon.ico" alt="EZOKO logo" className="h-full w-full object-contain" />
      </div>
      <h1 className="text-4xl uppercase text-center text-(--ezoko-ink)">
        EZOKO Barcode
      </h1>

      <section className="p-3 mt-6 max-w-md mx-auto border-2 border-(--ezoko-ink) bg-(--ezoko-paper)">
        <div className="grid gap-3">
          <label
            htmlFor="barcode"
            className="text-xs uppercase text-(--ezoko-ink)"
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
            placeholder="Type your barcode here..."
            inputMode="numeric"
            autoComplete="off"
            disabled={loading}
            className="border-2 border-(--ezoko-ink) px-2 py-2 text-lg focus:border-(--ezoko-pine)"
          />

          <button
            onClick={submit}
            disabled={loading}
            className="border-2 border-(--ezoko-ink) px-2 py-4 uppercase hover:bg-(--ezoko-mint) hover:cursor-pointer"
          >
            {loading ? "Recherche..." : "Envoyer"}
          </button>

          {error && (
            <div className="mt-2 border border-(--ezoko-rust) bg-red-100 px-3 py-2 text-xs font-bold">
              {error}
            </div>
          )}
        </div>
      </section>

      {foundProduct && <VariantCard foundProduct={foundProduct} />}

      {foundProduct && (
        <StockTable
          stockLocation={stockLocation}
          incrementQty={incrementQty}
          decrementQty={decrementQty}
        />
      )}
    </main>
  );
}
