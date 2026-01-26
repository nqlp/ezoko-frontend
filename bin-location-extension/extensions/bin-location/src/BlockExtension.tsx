import '@shopify/ui-extensions/preact';
import { render, Fragment } from 'preact';
import { useEffect, useState, useCallback } from 'preact/hooks';
import { VARIANT_WAREHOUSE_STOCK_QUERY } from './queries';
import { MetaobjectNode, MetaobjectField, StockItem, WarehouseStockResponse } from './types/warehouseStock';
import { METAOBJECT_UPDATE_MUTATION, UpdateStockResponse } from './updateStock';

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
          setInitialQtyById(Object.fromEntries(parsed.map(i => [i.id, i.qty])));
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
    const parsedQty = parseInt(newValue, 10);
    const newQty = Number.isFinite(parsedQty) ? Math.max(0, parsedQty) : 0;

    setItems(prev => prev.map(item => (item.id === id ? { ...item, qty: newQty } : item)));
  }, []);

  return (
    <Fragment key={formKey}>
      <s-admin-block heading="Bin locations">
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
                  try {
                    const result = await query<UpdateStockResponse>(METAOBJECT_UPDATE_MUTATION, {
                      variables: {
                        id: item.id,
                        fields: [{ key: "qty", value: String(item.qty) }],
                      },
                    });

                    assertNoGqlErrors(result);
                    assertNoUserErrors(result?.data?.metaobjectUpdate?.userErrors);
                  } catch (e) {
                    const message = e instanceof Error ? e.message : "Failed to save bin quantities.";
                    throw new Error(message);
                  }
                }

                // update initial quantities
                setInitialQtyById(Object.fromEntries(items.map(i => [i.id, i.qty])));
                setFormKey((prev) => prev + 1);
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
          }}
        >
          <s-stack direction="block" >
            {loading && <s-text>Loading...</s-text>}
            {!loading && error && <s-text tone="critical">{error}</s-text>}
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
                          name={`qty-${item.id}`}
                          min={0}
                          defaultValue={String(initialQtyById[item.id] ?? item.qty)}
                          value={String(item.qty)}
                          onChange={(event: Event & { currentTarget: { value: string } }) =>
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
        </s-form>
      </s-admin-block>
    </Fragment>
  )
}