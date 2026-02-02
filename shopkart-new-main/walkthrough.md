# ShopKart Data Layer Refactoring Walkthrough

## Overview
This walkthrough details the changes made to ShopKart's Adobe Data Layer implementation to align with enterprise best practices (Aurora architecture).

## 1. Core Implementation
We established a new utility library to standardize tracking across the site.
- **Location**: `public/adl-utils.js`
- **Key Functions**: `trackLinkClick`, `trackAddToCart`, `trackRemoveFromCart`, `scView`, `scCheckout`, `scPurchase`.

## 2. Page Updates

### Home Page
- **Cleaned**: `pageLoaded` event now only contains metadata.

### Product Listing Page (PLP)
- **Refactored**: Removed commerce data from strictly informational `pageLoaded` event.

### Product Detail Page (PDP)
- **Refactored**: Product details are now correctly placed in `xdmPageLoad.web.productDetails`.
- **Cleaned**: Removed non-standard option selection events.

### Cart Page
- **Major Logic Change**: Implemented **Page Reloading** on cart modifications (quantity change, removal).
- **Why?**: This ensures the data layer state is reset cleanly between states, preventing data corruption.
- **Events**: `scView` is now fired separately from page load.

### Checkout & Confirmation
- **Standardized**: `scCheckout` and `scPurchase` events now use the robust utility helpers.

## 3. Verification Steps

### Automated Consistency Check
We replaced the ad-hoc `data-layer-helper.js` with `adl-utils.js` across all files (`index`, `plp`, `pdp`, `cart`, `checkout`, `thankyou`, `login`, `signup`, `account`).

### Manual Browser Testing
Open DevTools Console and filter for "ACDL".

1.  **Add to Cart**: Go to a PDP, click Add to Cart. Verify `addToCart` event.
2.  **View Cart**: Go to Cart. Verify `pageLoaded` then `scView`.
3.  **Modify Cart**: Change quantity. Verify page reloads and events fire again.
4.  **Checkout**: Proceed to checkout. Verify `scCheckout`.
5.  **Purchase**: Complete order. Verify `scPurchase` has correct revenue and line items.

## 4. Resources
- [Audit Report](file:///d:/shopkart-new-main/audit_report.md)
- [ADL Utilities](file:///d:/shopkart-new-main/public/adl-utils.js)
