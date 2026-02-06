"use client";

import ScanInput from "./ScanInput";
import { getVariantByBarcode } from "@/app/actions/getVariantByBarcode";
import { moveStockBetweenBins } from "@/app/actions/moveStockBetweenBins";
import { useState } from "react";
import SnackBar from "./SnackBar";
import { ProductVariant } from "@/lib/types/ProductVariant";
import { StockLocation } from "@/lib/types/StockLocation";
import BinLocationTable from "./BinLocationTable";

interface MobileScannerProps {
    userName?: string;
}

export default function MobileScanner({ userName }: MobileScannerProps) {
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [variant, setVariant] = useState<ProductVariant | null>(null);
    const [stockLocation, setStockLocation] = useState<StockLocation[]>([]);
    const [selectedBins, setSelectedBins] = useState<string[]>([]);

    // MOVE workflow state
    const [sourceBin, setSourceBin] = useState<StockLocation | null>(null);
    const [destinationBin, setDestinationBin] = useState<StockLocation | null>(null);
    const [moveQty, setMoveQty] = useState<number>(1);

    const handleScan = async (barcode: string) => {
        if (!barcode) return;

        // Reset errors
        setError(null);

        // Check if barcode starts with a letter (Bin Location)
        if (/^[a-zA-Z]/.test(barcode)) {

            // Check if variant is not found
            if (!variant || stockLocation.length === 0) {
                const msg = `Only source bin could be scanned at this point. ${barcode} is not a source bin`;
                setError(msg);
                return;
            }

            // Try to match with displayed bin locations
            const matchingBin = stockLocation.find(
                location => location.binLocation.toLowerCase() === barcode.toLowerCase()
            );

            if (matchingBin) {
                if (!sourceBin) {
                    setSourceBin(matchingBin);
                    setSelectedBins([matchingBin.id]);
                }
                else {
                    if (matchingBin.id === sourceBin.id) {
                        setError(`Source bin ${barcode} cannot be the same as destination bin`);
                    }

                    // Check if moveQty exceeds source bin quantity
                    else if (moveQty > sourceBin.qty) {
                        setError(`Cannot move ${moveQty} units. Source bin ${sourceBin.binLocation} only has ${sourceBin.qty} units available.`);
                    }
                    else {
                        // Perform the move: update Shopify bins and log to database
                        setLoading(true);
                        const moveResult = await moveStockBetweenBins({
                            sourceBinId: sourceBin.id,
                            sourceBinName: sourceBin.binLocation,
                            sourceBinQtyBefore: sourceBin.qty,
                            destinationBinId: matchingBin.id,
                            destinationBinName: matchingBin.binLocation,
                            destinationBinQtyBefore: matchingBin.qty,
                            moveQty: moveQty,
                            barcode: variant?.barcode,
                            variantTitle: variant?.title,
                            user: userName,
                        });
                        setLoading(false);

                        if (!moveResult.success) {
                            setError(moveResult.message || "Failed to move stock");
                            return;
                        }

                        setSuccessMessage(`Qty of ${moveQty} successfully moved from ${sourceBin.binLocation} to ${matchingBin.binLocation}`);

                        // Clear state
                        setVariant(null);
                        setStockLocation([]);
                        setSelectedBins([]);
                        setSourceBin(null);
                        setDestinationBin(null);
                        setMoveQty(1);
                    }
                }
            } else {
                setError(`Bin location ${barcode} not found`);
            }
            return;
        }

        // Check if barcode starts with a number (Product)
        if (/^[0-9]/.test(barcode)) {

            // Reset variant and stock location only when scanning a new product
            setVariant(null);
            setStockLocation([]);
            setSelectedBins([]);

            setLoading(true);
            try {
                const response = await getVariantByBarcode(barcode);

                if (response.success && response.data) {
                    setVariant(response.data);
                    setStockLocation(response.data.binQty ?? []);

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
                    autoHideDuration={3000} // 3 seconds
                    severity="error"
                />
            )}

            {/* Snackbar Success */}
            {successMessage && (
                <SnackBar
                    message={successMessage}
                    onClose={() => setSuccessMessage(null)}
                    autoHideDuration={5000} // 5 seconds
                    severity="success"
                />
            )}
            {loading && <p>Loading...</p>}

            {/* Display variant details if found */}
            {stockLocation && stockLocation.length > 0 && (
                <BinLocationTable
                    stockLocation={stockLocation}
                    selectedBins={selectedBins}
                    onBinSelectionChange={setSelectedBins}
                    moveQty={moveQty}
                    onMoveQtyChange={setMoveQty}
                />
            )}
        </div>
    )
}