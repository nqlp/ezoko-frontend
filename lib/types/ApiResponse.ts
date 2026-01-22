export type ApiResponse<T> =
    | { success: true; data: T }
    | { success: false; message: string };

export interface UpdateStockResult {
    id: string;
    displayName: string;
    updatedQty: number;
}