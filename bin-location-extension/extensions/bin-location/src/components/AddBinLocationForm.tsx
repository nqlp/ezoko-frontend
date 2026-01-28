import { BinLocation } from '../hooks/useBinLocationSearch';

interface AddBinLocationFormProps {
    draftQuery: string;
    draftQty: string;
    searching: boolean;
    searchResults: BinLocation[];
    onQueryChange: (value: string) => void;
    onQtyChange: (value: string) => void;
    onSelectResult: (result: BinLocation) => void;
}

export function AddBinLocationForm({
    draftQuery,
    draftQty,
    searching,
    searchResults,
    onQueryChange,
    onQtyChange,
    onSelectResult,
}: AddBinLocationFormProps) {
    return (
        <s-stack direction="block">
            <s-text-field
                label="Search Bin Location"
                name="new-bin-location-search"
                value={draftQuery}
                onChange={(e: Event & { currentTarget: { value: string } }) => {
                    onQueryChange(e.currentTarget.value);
                }}
                placeholder="Search bin location..."
            />
            {searching && <s-text>Searching...</s-text>}
            {searchResults.length > 0 && (
                <s-stack direction="block">
                    {searchResults.map(result => (
                        <s-button key={result.id} onClick={() => onSelectResult(result)}>
                            {result.title || result.handle}
                        </s-button>
                    ))}
                </s-stack>
            )}
            <s-text-field
                label="Quantity"
                name="new-bin-location-qty"
                value={draftQty}
                onChange={(e: Event & { currentTarget: { value: string } }) => onQtyChange(e.currentTarget.value)}
                placeholder="Enter quantity"
            />
        </s-stack>
    );
}