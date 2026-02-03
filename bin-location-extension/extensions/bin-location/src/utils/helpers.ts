import { MetaobjectField } from '../types/warehouseStock';

/**
 * Type for Shopify's query function that returns { data?: T, errors?: GraphQLError[] }
 */
export type ShopifyQueryFct = <T>(
  gql: string,
  options?: { variables?: Record<string, any> }
) => Promise<{ data?: T; errors?: { message: string }[] }>;

/**
 * Assert that there are no GraphQL errors in the response
 */
const assertNoGqlErrors = (result: any): void => {
  if (result?.errors?.length) {
    throw new Error(result.errors.map((e: any) => e.message).join(" | "));
  }
};

/**
 * Assert that there are no user errors in the response
 */
const assertNoUserErrors = (userErrors?: { message: string }[]): void => {
  if (userErrors?.length) {
    throw new Error(userErrors.map(e => e.message).join(" | "));
  }
};

/**
 * Validate a Shopify GraphQL response for both GQL errors and user errors
 */
export const validateResponse = <T>(result: any, getUserErrors: (data: T) => { message: string }[] | undefined) => {
  assertNoGqlErrors(result);
  assertNoUserErrors(getUserErrors(result?.data));
};

/**
 * Get user errors as a concatenated message string
 */
export const getUserErrorsMessage = (userErrors?: { message: string }[]): string =>
  userErrors?.length ? userErrors.map(e => e.message).join(" | ") : "";

/**
 * Get a field value from a list of MetaobjectFields by key
 */
export const getFieldValue = (list: MetaobjectField[], key: string): string | undefined =>
  list.find((field) => field.key === key)?.value ?? undefined;