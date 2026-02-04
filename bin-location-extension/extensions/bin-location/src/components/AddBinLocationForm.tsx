import { BinLocation } from '../hooks/useBinLocationSearch';

interface AddBinLocationFormProps {
    draftQuery: string;
    draftQty: string;
    searching: boolean;
    searchResults: BinLocation[];
    onQueryChange: (value: string) => void;
    onQtyChange: (value: string) => void;
    onSelectResult: (result: BinLocation) => void;
    noResultsFound?: boolean;
    validationError?: string;
}

export function AddBinLocationForm({
    draftQuery,
    draftQty,
    searching,
    searchResults,
    onQueryChange,
    onQtyChange,
    onSelectResult,
    noResultsFound,
    validationError,
}: AddBinLocationFormProps) {
    return (
        <s-stack direction="block">
            <s-text-field
                label="Search Bin Location"
                name="new-bin-location-search"
                value={draftQuery}
                labelAccessibilityVisibility="exclusive"
                onChange={(event: Event & { currentTarget: { value: string } }) => {
                    onQueryChange(event.currentTarget.value);
                }}
                placeholder="Search bin location..."
            />
            {searching && <s-text>Searching...</s-text>}
            {!searching && noResultsFound && draftQuery && (
                <s-text tone="critical">Bin Location "{draftQuery}" does not exist. Try another search.</s-text>
            )}
            {searchResults.length > 0 && (
                <s-stack direction="block">
                    {searchResults.map(result => (
                        <s-button key={result.id} onClick={() => onSelectResult(result)}>
                            {result.title || result.handle}
                        </s-button>
                    ))}
                </s-stack>
            )}
            {validationError && <s-text tone="critical">{validationError}</s-text>}
            <s-text-field
                label="Quantity"
                name="new-bin-location-qty"
                labelAccessibilityVisibility="visible"
                value={draftQty}
                onChange={(event: Event & { currentTarget: { value: string } }) => onQtyChange(event.currentTarget.value)}
                placeholder="Enter quantity..."
            />
        </s-stack>
    );
}