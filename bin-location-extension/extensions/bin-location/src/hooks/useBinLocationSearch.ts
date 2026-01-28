import { useEffect, useState } from 'preact/hooks';
import { SEARCH_BIN_LOCATIONS_QUERY } from '../queries';
import { SearchBinLocationsResponse } from '../updateStock';
import { BinLocation } from '../types/warehouseStock';
import { getFieldValue, ShopifyQueryFct } from '../utils/helpers';

export type { BinLocation } from '../types/warehouseStock';

export interface UseBinLocationSearchResult {
    selectedBin: BinLocation | null;
    setSelectedBin: (bin: BinLocation | null) => void;
    draftQuery: string;
    draftQty: string;
    setDraftQty: (qty: string) => void;
    searching: boolean;
    searchResults: BinLocation[];
    onSelectResult: (result: BinLocation) => void;
    resetDraft: () => void;
    findBinLocationByHandle: (handle: string) => Promise<BinLocation | null>;
    handleQueryChange: (value: string) => void;
}

export function useBinLocationSearch(
    isAdding: boolean,
    query: ShopifyQueryFct
): UseBinLocationSearchResult {
    const [selectedBin, setSelectedBin] = useState<BinLocation | null>(null);
    const [draftQuery, setDraftQuery] = useState("");
    const [draftQty, setDraftQty] = useState("");
    const [searching, setSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<BinLocation[]>([]);

    const onSelectResult = (result: BinLocation) => {
        setSelectedBin(result);
        setDraftQuery(result.title || result.handle || "");
        setSearchResults([]);
    };

    const resetDraft = () => {
        setDraftQuery("");
        setDraftQty("");
        setSelectedBin(null);
        setSearchResults([]);
        setSearching(false);
    };

    const findBinLocationByHandle = async (handle: string): Promise<BinLocation | null> => {
        if (!handle) {
            return null;
        }
        const response = await query<SearchBinLocationsResponse>(SEARCH_BIN_LOCATIONS_QUERY, {
            variables: { query: `handle:${handle}` }
        });
        const nodes = response?.data?.metaobjects?.nodes ?? [];
        const match = nodes.find(node => node.handle === handle);
        return match ? { id: match.id, handle: match.handle, title: getFieldValue(match.fields, "bin_location") } : null;
    };

    const handleQueryChange = (value: string) => {
        setDraftQuery(value);
        setSelectedBin(null);
    };

    // Search effect
    useEffect(() => {
        if (!isAdding) return;
        const searchQuery = draftQuery.trim();
        if (!searchQuery || selectedBin) {
            setSearchResults([]);
            setSearching(false);
            return;
        }
        const timer = setTimeout(async () => {
            setSearching(true);
            try {
                const response = await query<SearchBinLocationsResponse>(SEARCH_BIN_LOCATIONS_QUERY, {
                    variables: { query: searchQuery }
                });

                const nodes = response?.data.metaobjects.nodes || [];
                const queryLower = searchQuery.toLowerCase();
                const mapped = nodes.map((node) => {
                    const title = (getFieldValue(node.fields, "bin_location") || node.handle || "").trim();
                    const titleLower = title.toLowerCase();
                    const handle = node.handle || "";
                    const handleLower = handle.toLowerCase();

                    const score = titleLower.startsWith(searchQuery) ? 3
                        : titleLower.includes(searchQuery) ? 2
                            : (titleLower.includes(queryLower) ||
                                handleLower.includes(queryLower)) ? 1 : 0;
                    return { id: node.id, handle, title, titleLower, handleLower, score };
                }).filter((node) => node.score > 0)
                    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
                setSearchResults(mapped.slice(0, 3).map(({ id, handle, title }) => ({ id, handle, title })));
            } catch (e) {
                console.error("Search failed", e);
            }
            setSearching(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [draftQuery, isAdding, query, selectedBin]);

    return {
        selectedBin,
        setSelectedBin,
        draftQuery,
        draftQty,
        setDraftQty,
        searching,
        searchResults,
        onSelectResult,
        resetDraft,
        findBinLocationByHandle,
        handleQueryChange,
    };
}
