import '@shopify/ui-extensions/preact';
import { render, Fragment } from 'preact';
import { useEffect, useState, useCallback } from 'preact/hooks';
import { VARIANT_WAREHOUSE_STOCK_QUERY, SEARCH_BIN_LOCATIONS_QUERY } from './queries';
import { MetaobjectNode, MetaobjectField, StockItem, WarehouseStockResponse } from './types/warehouseStock';
import { METAOBJECT_UPDATE_MUTATION, UpdateStockResponse, INVENTORY_SET_QUANTITIES_MUTATION, InventorySetResponse, SearchBinLocationsResponse, METAOBJECT_CREATE_BIN_QTY_MUTATION, METAFIELDS_SET_MUTATION, CreateBinQtyResponse, MetafieldsSetResponse } from './updateStock';

export default async () => {
  render(<Extension />, document.body);
}

function Extension() {
  const { query, data } = shopify;

  const variantId = data?.selected?.[0]?.id;

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<StockItem[]>([]);
  const [error, setError] = useState("");
  const [initialQtyById, setInitialQtyById] = useState<Record<string, number>>({});
  const [formKey, setFormKey] = useState(0);
  const [inventoryItemId, setInventoryItemId] = useState<string | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [selectedBin, setSelectedBin] = useState<{ id: string; handle: string; title?: string } | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [draftQty, setDraftQty] = useState("");
  const [draftQuery, setDraftQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [variantBarcode, setVariantBarcode] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<{ id: string; handle: string; title?: string }[]>([]);

  const onSelectResult = (result: { id: string; handle: string; title?: string }) => {
    setSelectedBin(result);
    setDraftQuery(result.title || result.handle || "");
    setSearchResults([]);
  };

  type newBinLocationRow = {
    tempId: string;
    newBin: string;
    newQty: number;
    isNew: boolean;
  };


  const assertNoGqlErrors = (result: any) => {
    if (result?.errors?.length) {
      throw new Error(result.errors.map((e: any) => e.message).join(" | "));
    }
  };

  const assertNoUserErrors = (userErrors?: { message: string }[]) => {
    if (userErrors?.length) {
      throw new Error(userErrors.map(e => e.message).join(" | "));
    }
  };

  const getFieldValue = (list: MetaobjectField[], key: string): string | undefined =>
    list.find((field) => field.key === key)?.value ?? undefined;

  useEffect(() => {
    async function load() {
      if (!variantId) {
        setItems([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");

      try {
        const response = await query<WarehouseStockResponse>(VARIANT_WAREHOUSE_STOCK_QUERY, {
          variables: { id: variantId }
        });

        if (response?.data?.productVariant) {
          const warehouseStockMetafield = response.data.productVariant.metafields.nodes.find(
            (mf) => mf.key === "warehouse_stock"
          );
          const nodes: MetaobjectNode[] = warehouseStockMetafield?.references?.nodes || [];

          const parsed: StockItem[] = nodes.map((node) => {
            const fields = node.fields;
            const binLocationRef = fields.find((field) => field.key === "bin_location")?.reference;
            const refFields = binLocationRef?.fields || [];
            const binName =
              getFieldValue(refFields, "bin_location") ||
              getFieldValue(fields, "bin") ||
              binLocationRef?.handle ||
              node.handle;
            const qty = getFieldValue(fields, "qty") || "0";

            return { id: node.id, bin: binName, qty: parseInt(qty, 10), binLocationId: binLocationRef?.id };
          });
          setItems(parsed);
          setInitialQtyById(Object.fromEntries(parsed.map(i => [i.id, i.qty])));
          setInventoryItemId(response.data.productVariant.inventoryItem?.id);
          setVariantBarcode(response.data.productVariant.barcode ?? null);
          setLocationId(response.data.productVariant.inventoryItem.inventoryLevels.nodes[0].location.id);
        } else {
          setItems([]);
        }
      } catch (e) {
        setError("Failed to load bin locations.");
      }
      setLoading(false);
    }
    load();
  }, [variantId, query]);


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
              : (titleLower.includes(queryLower) || handleLower.includes(queryLower)) ? 1 : 0;
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

  const handleQtyChange = useCallback((id: string, newValue: string) => {
    const parsedQty = parseInt(newValue, 10);
    const newQty = Number.isFinite(parsedQty) ? Math.max(0, parsedQty) : 0;

    setItems(prev => prev.map(item => (item.id === id ? { ...item, qty: newQty } : item)));
  }, []);

  const resetDraft = () => {
    setDraftQuery("");
    setDraftQty("");
    setSelectedBin(null);
    setSearchResults([]);
    setSearching(false);
  };

  const handleAddBinLocationStock = () => {
    setIsAdding(true);
    resetDraft();
  }

  return (
    <Fragment key={formKey}>
      <s-admin-block heading="Bin Locations">
        <s-stack direction="block">
          <s-form
            onSubmit={(event) => {

              // native save button behavior
              event.waitUntil((async () => {
                setError("");
                try {
                  const dirtyItems = items.filter(
                    (item) => item.qty !== (initialQtyById[item.id] ?? item.qty)
                  );

                  for (const item of dirtyItems) {
                    const result = await query<UpdateStockResponse>(METAOBJECT_UPDATE_MUTATION, {
                      variables: {
                        id: item.id,
                        fields: [{ key: "qty", value: String(item.qty) }],
                      },
                    });
                    assertNoGqlErrors(result);
                    assertNoUserErrors(result?.data?.metaobjectUpdate?.userErrors);
                  }

                  const nextItems = [...items];

                  if (isAdding) {
                    if (!selectedBin) {
                      throw new Error("Please select a bin location.");
                    }

                    const qtyNum = parseInt(draftQty, 10);
                    if (!Number.isFinite(qtyNum) || qtyNum < 0) {
                      throw new Error("Please enter a valid quantity.");
                    }

                    const existingIndex = nextItems.findIndex(i => i.binLocationId === selectedBin.id);
                    if (existingIndex >= 0) {
                      const existing = nextItems[existingIndex];
                      // Update existing
                      // We need to persist this change as well
                      const result = await query<UpdateStockResponse>(METAOBJECT_UPDATE_MUTATION, {
                        variables: {
                          id: existing.id,
                          fields: [{ key: "qty", value: String(qtyNum) }],
                        },
                      });
                      assertNoGqlErrors(result);
                      assertNoUserErrors(result?.data?.metaobjectUpdate?.userErrors);

                      // Update local state copy
                      nextItems[existingIndex] = { ...existing, qty: qtyNum };

                    } else {
                      // Create new
                      const handle = `${selectedBin.title ?? selectedBin.handle} - ${variantBarcode ?? "no-barcode"}`

                      const result = await query<CreateBinQtyResponse>(METAOBJECT_CREATE_BIN_QTY_MUTATION, {
                        variables: {
                          type: "bin_qty",
                          handle,
                          binLocationId: selectedBin.id,
                          qty: String(qtyNum),
                        },
                      });
                      assertNoGqlErrors(result);
                      assertNoUserErrors(result?.data?.metaobjectCreate?.userErrors);

                      const newId = result?.data?.metaobjectCreate?.metaobject?.id;
                      if (!newId) throw new Error("Failed to create bin quantity metaobject.");

                      // Add to variant metafield
                      // Note: we need to include ALL current items plus the new one.
                      const newBinQtyItem = JSON.stringify([...nextItems.map(item => item.id), newId]);

                      const setResponse = await query<MetafieldsSetResponse>(METAFIELDS_SET_MUTATION, {
                        variables: {
                          metafields: [
                            {
                              ownerId: variantId,
                              namespace: "custom",
                              key: "warehouse_stock",
                              type: "list.metaobject_reference",
                              value: newBinQtyItem,
                            },
                          ],
                        },
                      });
                      assertNoGqlErrors(setResponse);
                      assertNoUserErrors(setResponse?.data?.metafieldsSet?.userErrors);

                      nextItems.push({
                        id: newId,
                        bin: selectedBin.title || selectedBin.handle,
                        qty: qtyNum,
                        binLocationId: selectedBin.id,
                      });
                    }
                  }

                  // Sync inventory to Shopify
                  if (inventoryItemId && locationId) {
                    const sumOfBins = nextItems.reduce((current, item) => current + item.qty, 0);
                    const inventoryResult = await query<InventorySetResponse>(INVENTORY_SET_QUANTITIES_MUTATION, {
                      variables: {
                        inventoryItemId,
                        locationId,
                        quantity: sumOfBins
                      }
                    });
                    assertNoGqlErrors(inventoryResult);
                    assertNoUserErrors(inventoryResult?.data?.inventorySetQuantities?.userErrors);
                  }

                  // update initial quantities
                  setItems(nextItems);
                  setInitialQtyById(Object.fromEntries(nextItems.map(i => [i.id, i.qty])));
                  setFormKey((prev) => prev + 1);
                  if (isAdding) {
                    setIsAdding(false);
                    resetDraft();
                  }

                } catch (e) {
                  const message = e instanceof Error ? e.message : "Failed to save bin quantities.";
                  setError(message);
                  throw e;
                }
              })());
            }}

            // discard changes
            onReset={() => {
              setItems(prev => prev.map(item => ({ ...item, qty: initialQtyById[item.id] ?? item.qty })));
              setError("");
              setIsAdding(false);
              setSelectedBin(null);
              resetDraft();
            }}
          >
            <s-stack direction="block" >
              {!isAdding && (
                <s-button variant="primary" onClick={handleAddBinLocationStock}>Add Bin Location Stock</s-button>
              )}

              {isAdding && (
                <s-stack direction="block">
                  <s-text-field
                    label="Search Bin Location"
                    name="new-bin-location-search"
                    value={draftQuery}
                    onChange={(e: Event & { currentTarget: { value: string } }) => {
                      setDraftQuery(e.currentTarget.value);
                      setSelectedBin(null);
                    }}
                    placeholder="Search bin location..."
                  />
                  <s-text-field
                    label="Quantity"
                    name="new-bin-location-qty"
                    value={draftQty}
                    onChange={(e: Event & { currentTarget: { value: string } }) => setDraftQty(e.currentTarget.value)}
                    placeholder="Enter quantity"
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
                </s-stack>
              )}
              {loading && <s-text>Loading...</s-text>}
              {!loading && error && <s-text tone="critical">{error}</s-text>}
              {!loading && !error && items.length > 0 && (
                <>
                  <s-table variant="auto">
                    <s-table-header>
                      <s-table-header-row>
                        <s-table-header>Bin location</s-table-header>
                        <s-table-header format="numeric">Quantity</s-table-header>
                      </s-table-header-row>
                    </s-table-header>
                    <s-table-body>
                      {items.map((item) => (
                        <s-table-row key={item.id}>
                          <s-table-cell>
                            <s-text font-weight="bold">{item.bin}</s-text>
                          </s-table-cell>
                          <s-table-cell>
                            <s-number-field
                              name={`qty-${item.id}`}
                              value={String(item.qty)}
                              min={0}
                              onChange={(event: Event & { currentTarget: { value: string } }) => {
                                handleQtyChange(item.id, event.currentTarget.value);
                              }}
                            />
                          </s-table-cell>
                        </s-table-row>
                      ))}
                    </s-table-body>
                  </s-table>
                </>
              )}
            </s-stack>
          </s-form>
        </s-stack>
      </s-admin-block>
    </Fragment >
  )
}