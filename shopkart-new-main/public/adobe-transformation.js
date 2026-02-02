// Adapted Transformation Script for Shopkart Data Layer
// This script maps the 'xdmCommerce.products' array to the target schema.
// It is intended to be used within Adobe Launch or similar tag management rules.

(function () {
    // Retrieve the products array from the data layer
    var dl = window.adobeDataLayer || [];

    // Find the last event that contains xdmCommerce.products
    var lastEvents = dl.slice().reverse();
    var productEvent = lastEvents.find(function (e) {
        return e.xdmCommerce && e.xdmCommerce.products;
    });

    var products = productEvent ? productEvent.xdmCommerce.products : [];

    // If using a Data Element, you might use:
    // var products = _satellite.getVar("productArray");

    var items = [];

    if (!Array.isArray(products)) {
        return items;
    }

    products.forEach(function (item) {
        // Ensure we handle quantity correctly (default to 1 if missing)
        var qty = Number(item.quantity) || 1;
        var price = Number(item.price) || 0;

        items.push({
            // Shopkart uses 'productID' and lowercase 'sku'
            _id: item.productID || item.sku,

            SKU: item.sku || "",

            name: item.productName || "",

            product: item.productName || "",

            quantity: qty,

            // Shopkart is USD based
            currencyCode: "USD",

            // Calculate total if strictly needed (Price * Qty)
            priceTotal: (price * qty),

            discountAmount: Number(item.discountAmount) || 0,

            productImageUrl: item.productImageUrl || "",

            // Map 'category' string to an array
            productCategories: item.category ? [item.category] : [],

            // Map variant/option data
            selectedOptions: item.variant ? [item.variant] : []
        });
    });

    return items;
})();
