(function () {
  const safeGet = (obj, path) => {
    if (!path) return undefined;
    return path.split('.').reduce((acc, key) => {
      if (acc && Object.prototype.hasOwnProperty.call(acc, key)) {
        return acc[key];
      }
      return undefined;
    }, obj);
  };

  const getLastPush = () => {
    const dl = window.adobeDataLayer || [];
    return dl.length ? dl[dl.length - 1] : null;
  };

  // Math Helper: Round to 2 decimals to avoid floating point errors
  const roundToTwo = (num) => {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  };

  // Helper to get consistent customer data
  const getCustData = () => {
    const user = window.StaticData ? window.StaticData.getUser() : null;
    return {
      customerID: user ? user.id : "",
      lang: "en",
      loginStatus: user ? "logged-in" : "guest",
      platform: "desktop website"
    };
  };

  // Helper to ensure product completeness and correct schema
  const ensureProductFields = (p) => {
    // Try to lookup full details if we have an ID but missing other fields
    let fullProd = {};
    if (typeof PRODUCTS !== 'undefined' && (p.productID || p.id)) {
      fullProd = PRODUCTS.find(prod => prod.id === (p.productID || p.id)) || {};
    }

    // Math Logic for Product Discount
    const price = Number(p.price || fullProd.price || 0);
    const mrp = Number(p.originalPrice || fullProd.mrp || fullProd.price || p.price || 0);

    let productDiscountAmount = 0;
    let productDiscountPercentage = 0;

    if (mrp > price) {
      productDiscountAmount = roundToTwo(mrp - price);
      productDiscountPercentage = Math.round((productDiscountAmount / mrp) * 100);
    }

    return {
      sku: p.sku || fullProd.sku || '',
      productID: p.productID || p.id || fullProd.id || '',
      productName: p.productName || p.name || fullProd.name || '',
      brand: p.brand || fullProd.brand || 'shopkart',
      category: p.category || fullProd.category || '',
      price: roundToTwo(price),
      originalPrice: roundToTwo(mrp),
      productDiscountAmount: roundToTwo(productDiscountAmount),
      productDiscountPercentage: productDiscountPercentage,
      quantity: Number(p.quantity || p.qty || 1),
      color: p.color || '',
      size: p.size || '',
      rating: p.rating || 4.5,
      stockavailable: p.stockavailable || 'true',
      productImageUrl: p.productImageUrl || p.image || fullProd.productImageUrl || fullProd.image || '',
      currencyCode: "USD"
    };
  };

  // Required Namespace
  const getNamespace = () => ({
    _digiwebanoptznapcptrsd: {}
  });

  window.adl = {
    get: (path) => safeGet(getLastPush(), path),
    getLastPush,
    roundToTwo, // Expose for use in pages

    // 1. PAGE LOADED helpers (if needed, mostly inline in pages)

    // 2. LINK CLICKED
    trackLinkClick: function (linkName, linkType, linkPosition, linkPageName) {
      window.adobeDataLayer.push({
        event: "linkClicked",
        custData: getCustData(),
        ...getNamespace(),
        xdmActionDetails: {
          web: {
            webInteraction: {
              brand: "shopkart",
              channel: "web|" + (linkPageName || "unknown"),
              linkName: linkName,
              linkType: linkType,
              linkPosition: linkPosition,
              linkPageName: linkPageName,
              linkURL: window.location.href
            }
          }
        }
      });
      console.log("ACDL: linkClicked tracked", linkName);
    },

    // 3. ADD TO CART
    trackAddToCart: function (product) {
      const fullProduct = ensureProductFields(product);

      const eventData = {
        event: "addToCart",
        custData: getCustData(),
        ...getNamespace(),
        xdmCommerce: {
          product: fullProduct
        }
      };

      // Add CTA metadata
      if (product.linkPosition || product.linkType) {
        eventData.xdmCommerce.product.linkPosition = product.linkPosition || '';
        eventData.xdmCommerce.product.linkType = product.linkType || '';
      }

      window.adobeDataLayer.push(eventData);
      console.log("ACDL: addToCart tracked", fullProduct.sku);
    },

    // 4. REMOVE FROM CART
    trackRemoveFromCart: function (product, context) {
      const fullProduct = ensureProductFields(product);

      // 1. Track Link Click
      this.trackLinkClick(
        'remove ' + (fullProduct.productName || 'item'),
        'removeFromCart',
        context.linkPosition || 'cart-table',
        context.pageName || 'cart'
      );

      // 2. Track Commerce Event
      window.adobeDataLayer.push({
        event: "removeFromCart",
        custData: getCustData(),
        ...getNamespace(),
        xdmCommerce: {
          product: fullProduct
        }
      });
      console.log("ACDL: removeFromCart tracked", fullProduct.sku);
    },

    // 5. CART VIEW
    // STRICT SCHEMA ENFORCEMENT
    trackShoppingCartView: function (data) {
      // data expected: { products: [], subtotal, productDiscountAmount, couponDiscountAmount, totalDiscount, totalValue, couponCode }

      window.adobeDataLayer.push({
        event: "scView",
        custData: getCustData(),
        ...getNamespace(),
        xdmCommerce: {
          cart: {
            products: data.products.map(p => ensureProductFields(p)),
            // Totals
            subtotal: roundToTwo(data.subtotal),
            productDiscountAmount: roundToTwo(data.productDiscountAmount),
            couponDiscountAmount: roundToTwo(data.couponDiscountAmount),
            totalDiscount: roundToTwo(data.totalDiscount),
            totalValue: roundToTwo(data.totalValue),
            couponCode: data.couponCode || '',

            totalQuantity: data.totalQuantity || data.products.reduce((acc, p) => acc + (p.quantity || 1), 0),
            currencyCode: "USD"
          }
        }
      });
      console.log("ACDL: scView tracked");
    },

    // 6. BEGIN CHECKOUT
    trackBeginCheckout: function (data, additionalContext) {
      const eventData = {
        event: "beginCheckout",
        custData: getCustData(),
        ...getNamespace(),
        xdmCommerce: {
          checkout: {
            totalQuantity: data.totalQuantity,
            totalValue: roundToTwo(data.totalValue)
          }
        }
      };

      if (additionalContext && additionalContext.phone) {
        if (!eventData.custData) eventData.custData = {};
        eventData.custData.mobilePhone = additionalContext.phone;
      }

      window.adobeDataLayer.push(eventData);
      console.log("ACDL: beginCheckout tracked");
    },

    // 7. CHECKOUT VIEW
    trackCheckout: function (data, phone) {
      const eventData = {
        event: "scCheckout",
        custData: getCustData(),
        ...getNamespace(),
        xdmCommerce: {
          checkout: {
            products: data.products.map(p => ensureProductFields(p)),

            subtotal: roundToTwo(data.subtotal),
            productDiscountAmount: roundToTwo(data.productDiscountAmount),
            couponDiscountAmount: roundToTwo(data.couponDiscountAmount),
            totalDiscount: roundToTwo(data.totalDiscount),
            totalValue: roundToTwo(data.totalValue),
            couponCode: data.couponCode || '',

            totalQuantity: data.totalQuantity,
            currencyCode: "USD"
          }
        }
      };

      if (phone) {
        eventData.custData.mobilePhone = phone;
      }

      window.adobeDataLayer.push(eventData);
      console.log("ACDL: scCheckout tracked");
    },

    // 8. PURCHASE
    trackPurchase: function (order) {
      const purchaseData = {
        event: "scPurchase",
        custData: getCustData(),
        ...getNamespace(),
        xdmCommerce: {
          order: {
            orderID: order.orderID,
            email: order.email || order.customerEmail,

            products: order.products.map(p => ensureProductFields(p)),

            subtotal: roundToTwo(order.subtotal),
            productDiscountAmount: roundToTwo(order.productDiscountAmount || 0),
            couponDiscountAmount: roundToTwo(order.couponDiscountAmount || 0),
            totalDiscount: roundToTwo(order.totalDiscount || order.discount || 0),
            totalValue: roundToTwo(order.totalValue),
            couponCode: order.couponCode || '',

            totalQuantity: order.totalQuantity,
            paymentMethod: order.paymentMethod || "credit_card",
            currencyCode: "USD"
          }
        }
      };

      // Add Phone
      if (order.shippingAddress && order.shippingAddress.phone) {
        purchaseData.custData.mobilePhone = order.shippingAddress.phone;
      } else if (order.custData && order.custData.mobilePhone) {
        purchaseData.custData.mobilePhone = order.custData.mobilePhone;
      }

      window.adobeDataLayer.push(purchaseData);
      console.log("ACDL: scPurchase tracked", order.orderID);
    }
  };
})();
