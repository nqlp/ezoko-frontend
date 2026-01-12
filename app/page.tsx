"use client";

import { useEffect, useRef, useState } from "react";
import { getProductByBarcode } from "./actions/getProductByBarcode";
import { ProductVariant } from "@/lib/types/product";

export default function Page() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foundProduct, setFoundProduct] = useState<ProductVariant | null>(null);
  const displayImage = foundProduct?.image ?? foundProduct?.product.featuredImage ?? null;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function submit() {
    const value = barcode.trim();
    if (!value) {
      setError("Entrer un barcode valide");
      return;
    }

    setError(null);
    setBarcode(""); // clear for the next scan/type
    inputRef.current?.focus();

    try {
      const result = await getProductByBarcode(barcode);
      if (result.success && result.data.length > 0) {
        setFoundProduct(result.data[0]);
      }

      else if (result.success && result.data.length === 0) {
        setError("Produit non trouvé");
      }
      else if (!result.success) {
        setError(result.message);
      }
    }

    catch (error) {
      setError("Erreur lors de la récupération du produit");
    }

    finally {
      setLoading(false);
      setBarcode("");
      inputRef.current?.focus();
    }
  }

  return (
    <main className="min-h-screen flex items-start justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6 text-gray-900">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">EZOKO Barcode</h1>

        <div className="grid gap-2">
          <label htmlFor="barcode" className="text-sm font-semibold flex justify-center text-gray-700">
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
            className="border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-black text-gray-900 placeholder-gray-400 bg-white"
          />

          <button
            onClick={submit}
            className="mt-2 rounded-xl border border-gray-300 px-4 py-2 font-medium hover:bg-gray-100 text-gray-900 bg-white"
          >
            {loading ? "Recherche..." : "Envoyer"}
          </button>

          {error && (
            <div className="mt-2">
              <span className="text-red-600 text-sm">{error}</span>
            </div>
          )}

          {foundProduct && (
            <div className="mt-4 p-4 border border-green-500 rounded-xl bg-green-50">
              <h2 className="text-lg font-semibold mb-3 text-green-800">
                Produit trouvé
              </h2>

              <div className="flex gap-4 items-start">
                {/* Image variant -> fallback produit */}
                <div className="w-28 h-28 bg-white rounded-lg border flex items-center justify-center shrink-0">
                  {displayImage ? (
                    <img
                      src={displayImage.url}
                      alt={displayImage.altText ?? "Product image"}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-gray-400 text-center">
                      Aucune image
                    </span>
                  )}
                </div>

                {/* Infos */}
                <div className="flex-1 space-y-1">
                  <div className="font-bold text-gray-900">
                    {foundProduct.product.title}
                  </div>

                  <div className="text-sm text-gray-700">
                    {foundProduct.selectedOptions.map((option) => (
                      <div key={option.name}>
                        {option.name}: {option.value}
                      </div>
                    ))}
                  </div>

                  <div className="text-sm text-gray-600">
                    SKU: {foundProduct.sku}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}