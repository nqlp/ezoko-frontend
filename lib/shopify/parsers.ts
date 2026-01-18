// export const parseMetaobjectIds = (value?: string | null): string[] => {
//     if (!value) return [];
//     const trimmed = value.trim();
//     if (!trimmed) return [];

//   // Try to parse as JSON array
//   if (trimmed.startsWith("[")) {
//     try {
//       const parsed = JSON.parse(trimmed);
      
//       // Filter to ensure only strings are included
//       if (Array.isArray(parsed)) {
//         return parsed.filter((id): id is string => typeof id === "string");
//       }
//     } catch {
//       // JSON parsing failed, return empty array
//       return [];
//     }
//   }

//   // Handle single ID format
//   if (trimmed.startsWith("gid://")) {
//     return [trimmed];
//   }

//   return [];
// };

// export const parseMetaobjectFieldReference = (field: {
//     key: string;
//     value: string;
//     reference?: { fields: Array<{ key: string; value: string }> } | null;
// }): Array<{ key: string; value: string }> => {
//     if (field.reference && field.reference.fields) {
//         return field.reference.fields;
//     }
//     return [];
// };

// type MetaobjectField = {
//   key: string;
//   value: string;
//   reference?: {
//     fields: Array<{ key: string; value: string }>;
//   } | null;
// };

// /**
//  * Extract quantity from metaobject fields.
//  * Looks for a field with key "qty" and returns the numeric value.
//  * 
//  * @param fields - Array of metaobject fields
//  * @returns Parsed quantity or 0 if not found/invalid
//  */
// export const parseQtyFromFields = (fields: MetaobjectField[]): number => {
//   const qtyField = fields.find((field) => field.key === "qty");
//   const qty = Number.parseFloat(qtyField?.value ?? "0");
//   return Number.isFinite(qty) ? qty : 0;
// };

// /**
//  * Extract bin location from metaobject fields.
//  * First checks direct field with key "bin", then looks in referenced metaobjects.
//  * 
//  * @param fields - Array of metaobject fields
//  * @returns Bin location string or empty string if not found
//  */
// export const parseBinFromFields = (fields: MetaobjectField[]): string => {
//   // Try direct bin field
//   const binField = fields.find((field) => field.key === "bin")?.value;
//   if (binField?.trim()) {
//     return binField.trim();
//   }

//   // Try bin in referenced metaobject
//   for (const field of fields) {
//     const referenceFields = field.reference?.fields ?? [];
//     const refBin = referenceFields.find((ref) => ref.key === "bin")?.value;
//     if (refBin?.trim()) {
//       return refBin.trim();
//     }
//   }

//   return "";
// };

// /**
//  * Extract stock location (bin + qty) from metaobject fields.
//  * Returns null if no useful data found.
//  * 
//  * @param fields - Array of metaobject fields
//  * @returns StockLocation object or null if invalid
//  */
// export const parseStockLocation = (fields: MetaobjectField[]): { binLocation: string; qty: number } | null => {
//   const qty = parseQtyFromFields(fields);
//   const bin = parseBinFromFields(fields);

//   if (!bin) {
//     return qty > 0 ? { binLocation: "Unknown Bin", qty } : null;
//   }

//   return { binLocation: bin, qty };
// };