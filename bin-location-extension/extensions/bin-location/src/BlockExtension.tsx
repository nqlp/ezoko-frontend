import '@shopify/ui-extensions/preact';
import { render } from 'preact';
import { useEffect, useState, useCallback } from 'preact/hooks';
import { VARIANT_WAREHOUSE_STOCK_QUERY } from './queries';
import { MetaobjectNode, MetaobjectField, StockItem, WarehouseStockResponse } from './types/warehouseStock';

export default async () => {
  render(<Extension />, document.body);
}

function Extension() {
  const { query, data } = shopify;

  // @ts-ignore
  const applyMetafieldChange = shopify.applyMetafieldChange;

  const variantId = data?.selected?.[0]?.id;

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<StockItem[]>([]);
  const [error, setError] = useState("");

  const getFieldValue = (list: MetaobjectField[], key: string): string | undefined => {
    const value = list.find((field) => field.key === key)?.value;
    return value ?? undefined;
  };

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

            return { id: node.id, bin: binName, qty: parseInt(qty, 10) };
          });
          setItems(parsed);
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

  const handleQtyChange = useCallback((id: string, newValue: string) => {
    const newQty = parseInt(newValue, 10) || 0;

    setItems(prev => {
      const newItems = prev.map(item => item.id === id ? { ...item, qty: newQty } : item);

      if (applyMetafieldChange) {
        applyMetafieldChange({
          type: "updateMetafield",
          namespace: "custom",
          key: "warehouse_stock",
          value: JSON.stringify(newItems.map(i => ({ id: i.id, qty: i.qty })))
        });
      }

      return newItems;
    });
  }, [applyMetafieldChange]);

  return (
    <s-admin-block heading="Bin locations">
      <s-stack direction="block" gap="small-500">
        {loading && <s-text>Loading...</s-text>}
        {!loading && error && <s-text tone="critical">{error}</s-text>}
        {!loading && !error && items.length === 0 && (
          <s-text>No bin locations found.</s-text>
        )}

        {!loading && !error && items.length > 0 && (
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
                      value={String(item.qty)}
                      onInput={(event: Event & { currentTarget: { value: string } }) =>
                        handleQtyChange(item.id, event.currentTarget.value)
                      }
                    />
                  </s-table-cell>
                </s-table-row>
              ))}
            </s-table-body>
          </s-table>
        )}
      </s-stack>
    </s-admin-block>
  );
}