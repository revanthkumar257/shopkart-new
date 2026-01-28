/**
 * Caterpillar Tracking Transformation Script
 * Adapts Shopkart's Adobe Data Layer for 3rd party tracking.
 */
(function () {
    var items = [];
    var products = [];

    // 1. Retrieve products from Adobe Data Layer
    if (window.adobeDataLayer) {
        var dl = window.adobeDataLayer;
        // Find the last event with xdmCommerce.products
        var lastEvents = dl.slice().reverse();
        var productEvent = lastEvents.find(function (e) {
            return e.xdmCommerce && e.xdmCommerce.products;
        });

        if (productEvent) {
            products = productEvent.xdmCommerce.products;
        }
    }

    // 2. Map to the requested format
    if (products && products.length) {
        for (var i = 0; i < products.length; i++) {
            var product = products[i];

            // --- User's Logic Adaptation Start ---

            // Note: The source 'product' here comes from xdmCommerce, so keys might differ from user's raw 'digitalData' reference.
            // We map available xdm keys to variables expected by user's logic or use specific checks.

            var int_product_reviews;
            // Shopkart data might not have reviews yet, handle safely
            if (product.productReviews || product.productReviews == 0) {
                int_product_reviews = parseInt(product.productReviews, 10);
            }

            var int_product_rating;
            if (product.productRating || product.productRating == 0) {
                int_product_rating = parseInt(product.productRating, 10);
            }

            var int_quantity;
            // xdm uses 'quantity', user ref uses 'productQuantity'
            var rawQty = product.quantity || product.productQuantity;
            if (rawQty) {
                if (String(rawQty).toUpperCase() === "NAIDL") {
                    int_quantity = 0;
                } else {
                    int_quantity = Number(rawQty);
                }
            }
            // Default to 1 if not present (common for PDP views)
            if (int_quantity === undefined) int_quantity = 1;


            var int_productOGprice;
            // xdm uses 'originalPrice' or 'mrp' usually? Let's check keys available in products.js mapping
            // In adobe-transformation.js, we saw basic keys. We might need to check 'originalPrice'
            var rawOGPrice = product.originalPrice || product.productOriginalPrice || product.mrp;
            if (rawOGPrice) {
                int_productOGprice = Number(rawOGPrice);
            }

            var int_product_price;
            // xdm uses 'price'
            var rawPrice = product.price || product.productPrice;
            if (rawPrice) {
                int_product_price = Number(rawPrice);
            }

            var int_product_discounted_price;
            // If we have discount amount, we can calc, or look for specific field
            if (product.productDiscountedprice) {
                int_product_discounted_price = Number(product.productDiscountedprice);
            } else if (product.discountAmount && int_product_price) {
                // Fallback calculation if needed, or leave undefined
                // int_product_discounted_price = int_product_price; // Usually 'price' is the effective price
            }

            var str_product_packof;
            if (product.productPackof) {
                str_product_packof = String(product.productPackof);
            }

            var str_product_size;
            // xdm might put size in 'sku' or separate field if valid
            var rawSize = product.size || product.productSize;
            if (rawSize) {
                str_product_size = String(rawSize);
            }

            var str_product_material;
            if (product.productMaterial) {
                str_product_material = String(product.productMaterial);
            }

            var str_product_fabric;
            if (product.productFabric) {
                str_product_fabric = String(product.productFabric);
            }

            var str_fabric_color;
            var rawColor = product.color || product.fabricColor;
            if (rawColor) {
                str_fabric_color = String(rawColor);
            }

            var str_product_warranty;
            if (product.productWarranty) {
                str_product_warranty = String(product.productWarranty);
            }

            var int_category_id;
            if (product.categoryID && product.categoryID != "NAIDL") {
                int_category_id = Number(product.categoryID);
            }

            var int_parent_product_id;
            if (product.parentProductId && product.parentProductId != "NAIDL") {
                int_parent_product_id = Number(product.parentProductId);
            }

            var int_sub_category_id;
            if (product.subCategoryid && product.subCategoryid != "NAIDL") {
                int_sub_category_id = Number(product.subCategoryid);
            }

            var int_sub_sub_category_id;
            if (product.subsubCategoryid && product.subsubCategoryid != "NAIDL") {
                int_sub_sub_category_id = Number(product.subsubCategoryid);
            }

            var int_total_product_price;
            if (product.productTotalPrice) {
                int_total_product_price = Number(product.productTotalPrice);
            } else if (int_product_price && int_quantity) {
                // Auto-calc if missing
                int_total_product_price = int_product_price * int_quantity;
            }

            var str_product_id;
            var rawID = product.productID || product.productID; // xdm uses productID
            if (rawID) {
                str_product_id = String(rawID);
            }

            var str_stockAvailable;
            if (product.stockAvailable !== undefined && product.stockAvailable !== null) {
                str_stockAvailable = String(product.stockAvailable);
            }

            // Mapping Category Fields
            // xdm usually has 'category' as a string or array.
            // User wants productCategory, productParentCategory, etc.
            // We'll take xdm 'category' and put it in 'productCategory' for now.
            var mainCategory = product.category || product.productCategory;


            items.push({
                SKU: rawID ? String(rawID) : (product.sku ? String(product.sku) : "NA000"), // User used productID as primary SKU source
                name: product.productName || product.name,
                quantity: int_quantity,
                priceTotal: int_total_product_price,

                // custom fields grouped under _caterpillarsigns
                _caterpillarsigns: {
                    productCategory: mainCategory,
                    productParentCategory: product.ProductParentCategory, // Likely undefined in Shopkart
                    productSubCategory: product.ProductSubCategory,
                    productSubSubCategory: product.ProductSubSubCategory,
                    productMaterial: str_product_material,
                    productOriginalPrice: int_productOGprice,
                    productPackOf: str_product_packof,
                    productPrice: int_product_price,
                    productRating: int_product_rating,
                    productReviews: int_product_reviews,
                    productSize: str_product_size,
                    stockAvailable: str_stockAvailable,
                    productDiscountedPrice: int_product_discounted_price,
                    productImageURL: product.productImageURL || product.image,
                    productFabric: str_product_fabric,
                    fabricColor: str_fabric_color,
                    productWarranty: str_product_warranty,
                    categoryID: int_category_id,
                    parentProductId: int_parent_product_id,
                    subCategoryid: int_sub_category_id,
                    subsubCategoryid: int_sub_sub_category_id
                }
            });
        }
    }

    if (items.length == 0) {
        // do nothing
        return [];
    } else {
        return items;
    }
})();
