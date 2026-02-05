"use client";

import ScanInput from "./ScanInput";
import { getVariantByBarcode } from "@/app/actions/getVariantByBarcode";
import { useState } from "react";
import SnackBar from "./SnackBar";
import { ProductVariant } from "@/lib/types/ProductVariant";
import { StockLocation } from "@/lib/types/StockLocation";
import { incrementQty, decrementQty } from "@/lib/stockHelpers";
import BinLocationList from "./BinLocationList";

export default function MobileScanner() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [variant, setVariant] = useState<ProductVariant | null>(null);
    const [stockLocation, setStockLocation] = useState<StockLocation[]>([]);
    const [initialStock, setInitialStock] = useState<StockLocation[]>([]);
    const [selectedBins, setSelectedBins] = useState<string[]>([]);

    const handleScan = async (barcode: string) => {
        if (!barcode) return;

        // Reset errors
        setError(null);
        setVariant(null);
        setStockLocation([]);
        setInitialStock([]);

        // Check if barcode starts with a letter (Bin Location)
        if (/^[a-zA-Z]/.test(barcode)) {

            // Check if variant is not found
            if (!variant || stockLocation.length === 0) {
                const msg = `Barcode ${barcode} IS NOT a Product barcode.`;
                setError(msg);
                return;
            }

            // Try to match with displayed bin locations
            const matchingBin = stockLocation.find(
                location => location.binLocation.toLowerCase() === barcode.toLowerCase()
            );

            if (matchingBin) {
                // Auto-select this bin
                setSelectedBins([matchingBin.id]);
            } else {
                setError(`Bin location ${barcode} not found`);
            }
            return;
        }

        // Check if barcode starts with a number (Product)
        if (/^[0-9]/.test(barcode)) {
            setLoading(true);
            try {
                const response = await getVariantByBarcode(barcode);

                if (response.success && response.data) {
                    setVariant(response.data);
                    setStockLocation(response.data.binQty ?? []);
                    setInitialStock(JSON.parse(JSON.stringify(response.data.binQty ?? [])));

                    // Check if no stock
                    if (!response.data.binQty || response.data.binQty.length === 0) {
                        const productTitle = response.data.product?.title || "this product";
                        setError(`No Bin location stock for ${productTitle}`);
                    }
                }
                else if (!response.success) {
                    // If several variants, issue a message below the scan field
                    setError(response.message);
                }
                else {
                    // If variant does not exist
                    setError(`Barcode ${barcode} does NOT exist`);
                }
            } catch (error) {
                setError("Error scanning barcode");
            } finally {
                setLoading(false);
            }
            return;
        }
    }

    return (
        <div>
            <ScanInput onSubmit={handleScan} />

            {/* Snackbar Error (bottom) */}
            {error && (
                <SnackBar
                    message={error}
                    onClose={() => setError(null)}
                    autoHideDuration={3000}
                />
            )}
            {loading && <p>Loading...</p>}

            {/* Display variant details if found */}
            {stockLocation && stockLocation.length > 0 && (
                <BinLocationList
                    stockLocation={stockLocation}
                    selectedBins={selectedBins}
                    onBinSelectionChange={setSelectedBins}
                />
            )}
        </div>
    )
}