# ShopKart Data Layer Audit & Refactoring Report

## Executive Summary
The ShopKart Adobe Data Layer (ACDL) implementation has been audited and refactored to align with the "Aurora Apparel" reference architecture while maintaining ShopKart branding. The goal was to eliminate duplicate tracking, separate page metadata from commerce data, and standardize event structures across the user journey.

## Key Changes & Refactoring

### 1. Standardization of Utilities
-   **Created `public/adl-utils.js`**: A centralized library for data layer interaction, replacing ad-hoc `push` calls.
-   **Implemented Helpers**: `trackLinkClick`, `trackAddToCart`, `trackRemoveFromCart`, `trackShoppingCartView`, `trackCheckout`, `trackPurchase`.
-   **Removed Legacy**: Deleted `public/data-layer-helper.js` and removed ad-hoc logic from `public/client.js`.

### 2. Page-Specific Improvements

#### Home (`index.html`)
-   **Status**: \u2705 Cleaned
-   **Change**: `pageLoaded` now contains only page metadata (Site Name, Page Name, Page Type, Channel). Removed potential duplicate tracking.

#### Product Listing Page (`plp.html`)
-   **Status**: \u2705 Refactored
-   **Change**: Removed `xdmCommerce` (Product List Views) from the `pageLoaded` event to strictly adhere to "Page Metadata Only" rule.
-   **Note**: Product rendering logic remains for UI, but data layer is now metadata-clean.

#### Product Detail Page (`pdp.html`)
-   **Status**: \u2705 Refactored
-   **Change**:
    -   Moved product details from `xdmCommerce` to `xdmPageLoad.web.productDetails` inside the `pageLoaded` event, aligning with Aurora PDP best practices.
    -   Removed non-standard `productOptionSelected` event.
    -   `addToCart` now uses the standardized `adl.trackAddToCart` helper.

#### Shopping Cart (`cart.html`)
-   **Status**: \u2705 Major Fix
-   **Change**:
    -   Separated `pageLoaded` (metadata) from `scView` (commerce).
    -   **Critical Logic Change**: Quantity changes and item removals now force a **Page Reload**. This ensures the data layer resets state correctly, preventing stale data accumulation—a key requirement from the reference guide.
    -   Implemented `trackRemoveFromCart` (firing `linkClicked` + `removeFromCart`) before reload.

#### Checkout (`checkout.html`)
-   **Status**: \u2705 standardized
-   **Change**: Implemented `scCheckout` event using `trackCheckout` helper. Cleaned `pageLoaded`.

#### Order Confirmation (`thankyou.html`)
-   **Status**: \u2705 standardized
-   **Change**:
    -   Implemented `trackPurchase` (`scPurchase`) with full order details (Tax, Shipping, Products).
    -   Fixed potential syntax errors and ensured robust product data reconstruction from the order object.

## Validation Checklist

Use this checklist to verify the implementation in the browser console:

1.  **Global**:
    -   [ ] `window.adl` should exist.
    -   [ ] `window.adobeDataLayer` should be an array.
2.  **Home**:
    -   [ ] Load page -> Check Console for "ACDL: pageLoaded tracked".
    -   [ ] Inspect `window.adobeDataLayer[0]`: Should have `xdmPageLoad` but NO `xdmCommerce`.
3.  **PLP**:
    -   [ ] Load page -> Check Console.
    -   [ ] `xdmPageLoad` should have `pageType: "category"`.
4.  **PDP**:
    -   [ ] Load page -> Check Console.
    -   [ ] `xdmPageLoad.web.productDetails` should contain product info (SKU, Name, Price).
    -   [ ] Click "Add to Cart" -> Check Console for "ACDL: addToCart tracked".
5.  **Cart**:
    -   [ ] Load page -> Check Console.
    -   [ ] Event 1: `pageLoaded` (Metadata only).
    -   [ ] Event 2: `scView` (Commerce data with products).
    -   [ ] **Action**: Change quantity -> Page should RELOAD -> Events should fire again.
    -   [ ] **Action**: Remove item -> "ACDL: removeFromCart tracked" -> Page Reload.
6.  **Checkout**:
    -   [ ] Load page -> Check Console for `scCheckout`.
7.  **Order Confirmation**:
    -   [ ] Complete Order -> Check Console for `scPurchase`.
    -   [ ] Verify `totalValue`, `totalDiscountAmount`, and line items match the order.

## Architecture Diagram (Event Flow)

```mermaid
graph TD
    User-->|Visits Page| PageLoad
    PageLoad-->|Fires| adl.push(pageLoaded metadata)
    
    subgraph Commerce Events
    User-->|View Cart| adl.trackShoppingCartView
    User-->|Checkout| adl.trackCheckout
    User-->|Purchase| adl.trackPurchase
    end
    
    subgraph Interactions
    User-->|Click Link| adl.trackLinkClick
    User-->|Add to Cart| adl.trackAddToCart
    User-->|Remove Item| adl.trackRemoveFromCart -> Reload
    end
```
