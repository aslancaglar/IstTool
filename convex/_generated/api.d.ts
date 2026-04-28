/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as categories from "../categories.js";
import type * as data_snapshot from "../data/snapshot.js";
import type * as files from "../files.js";
import type * as gallery from "../gallery.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_constants from "../lib/constants.js";
import type * as lib_storage from "../lib/storage.js";
import type * as menuItems from "../menuItems.js";
import type * as mutations from "../mutations.js";
import type * as promoCodes from "../promoCodes.js";
import type * as queries from "../queries.js";
import type * as restaurantInfo from "../restaurantInfo.js";
import type * as reviews from "../reviews.js";
import type * as seed from "../seed.js";
import type * as stripe from "../stripe.js";
import type * as toppingsAdmin from "../toppingsAdmin.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  categories: typeof categories;
  "data/snapshot": typeof data_snapshot;
  files: typeof files;
  gallery: typeof gallery;
  "lib/auth": typeof lib_auth;
  "lib/constants": typeof lib_constants;
  "lib/storage": typeof lib_storage;
  menuItems: typeof menuItems;
  mutations: typeof mutations;
  promoCodes: typeof promoCodes;
  queries: typeof queries;
  restaurantInfo: typeof restaurantInfo;
  reviews: typeof reviews;
  seed: typeof seed;
  stripe: typeof stripe;
  toppingsAdmin: typeof toppingsAdmin;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
