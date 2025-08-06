/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as funcs_allowedTokens from "../funcs/allowedTokens.js";
import type * as funcs_notifications from "../funcs/notifications.js";
import type * as funcs_passkeys from "../funcs/passkeys.js";
import type * as funcs_session from "../funcs/session.js";
import type * as funcs_transactions from "../funcs/transactions.js";
import type * as funcs_users from "../funcs/users.js";
import type * as funcs_wallet from "../funcs/wallet.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "funcs/allowedTokens": typeof funcs_allowedTokens;
  "funcs/notifications": typeof funcs_notifications;
  "funcs/passkeys": typeof funcs_passkeys;
  "funcs/session": typeof funcs_session;
  "funcs/transactions": typeof funcs_transactions;
  "funcs/users": typeof funcs_users;
  "funcs/wallet": typeof funcs_wallet;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
