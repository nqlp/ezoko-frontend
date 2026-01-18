import { useEffect, useState } from "react";
import { ProductVariant } from "@/lib/types/ProductVariant";

type VariantCardProps = {
    foundProduct: ProductVariant | null;
};

export default function VariantCard({ foundProduct }: VariantCardProps) {
    const [isMagnified, setIsMagnified] = useState(false);

    if (!foundProduct) {
        return null;
    }

    const variantImage = foundProduct?.media?.nodes?.[0]?.image;
    const productImage = foundProduct?.product?.featuredMedia?.image;
    const displayImage = variantImage ?? productImage;
    const displayImageAlt = displayImage?.altText;

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key == "Escape") {
                setIsMagnified(false);
            }
        };

        if (isMagnified) {
            window.addEventListener("keydown", handleKeyDown);
        }
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isMagnified]);

    return (
        <div className="mt-4 border-2 border-(--ezoko-ink) bg-(--ezoko-paper) p-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-(--ezoko-ink)">Product found!</h2>
                </div>
            </div>

            <div className="mt-4 flex gap-4 items-start">
                <div
                    className={`h-28 w-28 border-2 border-(--ezoko-ink) bg-white flex items-center justify-center ${displayImage ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
                    onClick={() => displayImage && setIsMagnified(true)}
                >
                    {displayImage ? (
                        <img
                            src={displayImage.url}
                            alt={displayImageAlt ?? "Product image"}
                            className="max-w-full max-h-full object-contain"
                        />
                    ) : (
                        <span className="text-[10px] text-(--ezoko-ink) opacity-50 text-center uppercase">
                            No Image Available
                        </span>
                    )}
                </div>

                <div className="flex-1 space-y-2">
                    <div className="text-base font-semibold text-(--ezoko-ink)">
                        {foundProduct.product?.title}
                    </div>

                    <div className="text-sm text-(--ezoko-ink)">
                        {foundProduct.selectedOptions.map((variant) => (
                            <div key={variant.name}>
                                {variant.name}: {variant.value}
                            </div>
                        ))}
                    </div>

                    <div className="text-xs uppercase tracking-widest text-(--ezoko-ink)">
                        SKU: {foundProduct.sku}
                    </div>

                    <div className="text-xs uppercase tracking-widest text-(--ezoko-ink)">
                        On-hand: {foundProduct.inventoryQuantity ?? "N/A"}
                    </div>
                </div>
            </div>

            {isMagnified && displayImage && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-50 cursor-pointer p-4"
                    onClick={() => setIsMagnified(false)}
                >
                    <img
                        src={displayImage.url}
                        alt={displayImageAlt ?? "Magnified product image"}
                        className="max-w-full max-h-full object-contain border-2 border-(--ezoko-ink) bg-white"
                    />
                    <button
                        className="absolute top-4 right-4 text-(--ezoko-mint) text-2xl font-bold p-2 hover:text-white"
                        onClick={() => setIsMagnified(false)}
                    >
                        X
                    </button>
                </div>
            )}
        </div>
    );
}
