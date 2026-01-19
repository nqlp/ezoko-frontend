import { StockLocation } from "@/lib/types/StockLocation";

interface StockTableProps {
    stockLocation: StockLocation[];
    incrementQty: (index: number) => void;
    decrementQty: (index: number) => void;
}

export default function StockTable({
    stockLocation,
    incrementQty,
    decrementQty,
}: StockTableProps) {

    return (
        <div className="mt-4">
            {stockLocation.length === 0 && (
                <div className="border-x-2 border-b-2 border-(--ezoko-ink) px-2 text-(--ezoko-ink)">
                    Aucun stock par bin
                </div>
            )}

            {stockLocation.length > 0 && (
                <div className="border-b-2 px-4">
                    <table className="w-full">
                        <thead>
                            <tr className="pb-2 text-center uppercase text-(--ezoko-ink)">
                                <th>
                                    Bin Location
                                </th>
                                <th>
                                    Quantity
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {stockLocation.map((entry, index) => (
                                <tr
                                    key={`${entry.binLocation}-${index}`}
                                    className="border-b border-(--ezoko-ink) last:border-b-0"
                                >
                                    <td className="py-2 text-xl text-center font-semibold text-(--ezoko-ink)">
                                        {entry.binLocation}
                                    </td>
                                    <td className="text-center">
                                        <div className="inline-flex items-center gap-2 rounded-full border-2 border-(--ezoko-ink) bg-(--ezoko-paper) px-2 py-1">
                                            <button
                                                type="button"
                                                aria-label="Decrease quantity"
                                                className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-(--ezoko-ink) bg-white text-xs font-bold text-(--ezoko-ink) transition-colors hover:bg-(--ezoko-ink) hover:text-white"
                                                onClick={() => decrementQty(index)}
                                            >
                                                -
                                            </button>
                                            <span className="min-w-[2ch] text-xs font-semibold text-(--ezoko-ink)">
                                                {entry.qty}
                                            </span>
                                            <button
                                                type="button"
                                                aria-label="Increase quantity"
                                                className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-(--ezoko-ink) bg-white text-xs font-bold text-(--ezoko-ink) transition-colors hover:bg-(--ezoko-ink) hover:text-white"
                                                onClick={() => incrementQty(index)}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}