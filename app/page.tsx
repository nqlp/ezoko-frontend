"use client";

import { useEffect, useRef, useState } from "react";
import { getVariantByBarcode } from "./actions/getVariantByBarcode";
import VariantCard from "./scan/_components/VariantCard";
import StockTable from "./scan/_components/StockTable";
import { StockLocation } from "@/lib/types/StockLocation";
import { ProductVariant } from "@/lib/types/ProductVariant";
import { UpdateBinQtyByID } from "./actions/updateBinQty";

export default function Page() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foundProduct, setFoundProduct] = useState<ProductVariant | null>(null);
  const [stockLocation, setStockLocation] = useState<StockLocation[]>([]);
  const [initialStock, setInitialStock] = useState<StockLocation[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const incrementQty = async (index: number) => {
    setStockLocation((prev) => (
      prev.map((loc, i) => i === index ? { ...loc, qty: loc.qty + 1 } : loc)
    ));
  };

  const decrementQty = async (index: number) => {
    setStockLocation((prev) => (
      prev.map((loc, i) =>
        i === index ? { ...loc, qty: Math.max(0, loc.qty - 1) } : loc))
    );
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    setError(null);
    const changes = stockLocation.filter((loc, index) => loc.qty !== initialStock[index].qty);

    try {
      const results = await Promise.all(
        changes.map((loc) => UpdateBinQtyByID(loc.id, loc.qty))
      );

      const failedUpdates = results.filter((res) => !res.success);

      if (failedUpdates.length > 0) {
        setSaveStatus(`Save failed: ${failedUpdates[0].message}. Some lines were not updated.`);
      } else {
        setSaveStatus("Updates saved to Shopify.");
        setInitialStock(JSON.parse(JSON.stringify(stockLocation))); // Update to new stock
      }
    }
    catch (e) {
      console.error("Error saving changes:", e);
      setSaveStatus("Error when saving changes.");
      setInitialStock(JSON.parse(JSON.stringify(initialStock))); // Revert to initial stock
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = stockLocation.some((loc, index) => loc.qty !== initialStock[index].qty);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!saveStatus) return;
    const timer = setTimeout(() => setSaveStatus(null), 3000);
    return () => clearTimeout(timer);
  }, [saveStatus]);

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
        setStockLocation(product.binQty ?? []); // // Fill stock locations
        setInitialStock(JSON.parse(JSON.stringify(product.binQty))); // Deep copy for initial stock
        setSaveStatus(null);
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
            {loading ? "Looking for variants..." : "Send"}
          </button>

          {error && (
            <div className="mt-2 border border-(--ezoko-rust) bg-red-100 px-3 py-2 text-xs font-bold">
              {error}
            </div>
          )}
        </div>
      </section>

      {foundProduct && <VariantCard foundProduct={foundProduct} />}

      {foundProduct &&
        <>
          <StockTable
            stockLocation={stockLocation}
            initialStock={initialStock}
            incrementQty={incrementQty}
            decrementQty={decrementQty}
          />

          <div className="text-center mt-4">
            <button
              onClick={handleSaveChanges}
              disabled={!hasChanges || isSaving}
              className="border-2 border-(--ezoko-ink) px-4 py-2 uppercase font-bold hover:bg-(--ezoko-mint) disabled:opacity-50 disabled:cursor-not-allowed">
              {isSaving ? "Saving to Shopify" : "Confirm and Save Changes"}
            </button>


            {saveStatus &&
              <div
                className="update-toast fixed bottom-4 right-4 z-50 rounded-md border border-(--ezoko-pine) bg-green-50 px-4 py-2 font-semibold text-(--ezoko-pine) shadow-lg"
              >
                {saveStatus}
              </div>
            }

            {error &&
              <div className="mt-3 border border-(--ezoko-rust) bg-red-100 px-3 py-2 text-xs font-bold">
                {error}
              </div>
            }
          </div>
        </>
      }
    </main>
  );
}
