import { StockItem } from '../types/warehouseStock';

interface StockTableProps {
  items: StockItem[];
  onQtyChange: (id: string, newValue: string) => void;
}

export function StockTable({ items, onQtyChange }: StockTableProps) {
  if (items.length === 0) {
    return null;
  }

  return (
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
                  onQtyChange(item.id, event.currentTarget.value);
                }}
              />
            </s-table-cell>
          </s-table-row>
        ))}
      </s-table-body>
    </s-table>
  );
}
