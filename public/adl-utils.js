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

  // Helper to get consistent customer data
  const getCustData = () => {
    const user = window.StaticData ? window.StaticData.getUser() : null;
    return {
      customerID: user ? user.id : "",
      lang: "en", // Standardizing on 'lang' per reference
      loginStatus: user ? "logged-in" : "guest",
      platform: "desktop website"
    };
  };

  window.adl = {
    get: (path) => safeGet(getLastPush(), path),
    getLastPush,

    // 1. PAGE LOADED
    // Note: pageLoaded usually fired inline, but this helper can be used if needed
    // or we can just use the structure reference.

    // 2. LINK CLICKED
    trackLinkClick: function (linkName, linkType, linkPosition, linkPageName) {
      window.adobeDataLayer.push({
        event: "linkClicked",
        custData: getCustData(),
        xdmActionDetails: {
          web: {
            webInteraction: {
              brand: "shopkart",
              channel: "web|" + (linkPageName || "unknown"),
              linkName: linkName,
              linkType: linkType,
              linkPosition: linkPosition,
              linkPageName: linkPageName,
              linkURL: window.location.href // Optional, good for context
            }
          }
        }
      });
      console.log("ACDL: linkClicked tracked", linkName);
    },

    // 3. ADD TO CART
    trackAddToCart: function (product) {
      const eventData = {
        event: "addToCart",
        custData: getCustData(),
        xdmCommerce: {
          product: {
            sku: product.sku || '',
            productID: product.productID || product.id,
            productName: product.productName || product.name,
            brand: product.brand || 'shopkart',
            category: product.category || '',
            color: product.color || '',
            size: product.size || '',
            price: product.price,
            quantity: product.quantity || 1,
            currencyCode: "USD"
          }
        }
      };

      // Add CTA metadata if provided (passed via product object/augment)
      if (product.linkPosition || product.linkType) {
        eventData.xdmCommerce.product.linkPosition = product.linkPosition || '';
        eventData.xdmCommerce.product.linkType = product.linkType || '';
      }

      window.adobeDataLayer.push(eventData);
      console.log("ACDL: addToCart tracked", product.sku);
    },

    // 4. REMOVE FROM CART
    // Fires linkClicked THEN removeFromCart
    trackRemoveFromCart: function (product, context) {
      // 1. Track Link Click
      this.trackLinkClick(
        'remove ' + (product.productName || 'item'),
        'removeFromCart',
        context.linkPosition || 'cart-table',
        context.pageName || 'cart'
      );

      // 2. Track Commerce Event
      window.adobeDataLayer.push({
        event: "removeFromCart",
        custData: getCustData(),
        xdmCommerce: {
          product: {
            sku: product.sku || '',
            productID: product.productID || product.id,
            productName: product.productName || product.name,
            brand: product.brand || 'shopkart',
            category: product.category || '',
            price: product.price || 0,
            color: product.color || '',
            size: product.size || '',
            quantity: product.quantity || 1,
            currencyCode: "USD"
          }
        }
      });
      console.log("ACDL: removeFromCart tracked", product.sku);
    },

    // 5. CART VIEW
    trackShoppingCartView: function (cart, pageName) {
      window.adobeDataLayer.push({
        event: "scView",
        custData: getCustData(),
        xdmCommerce: {
          cart: {
            // Assuming cart object passed has these or we derive them
            totalQuantity: cart.totalQuantity,
            totalValue: cart.totalValue,
            products: cart.products.map(p => ({
              sku: p.sku || '',
              productID: p.productID || p.id,
              productName: p.productName || p.name,
              brand: p.brand || 'shopkart',
              category: p.category || '',
              price: p.price,
              color: p.color || '',
              size: p.size || '',
              quantity: p.quantity,
              currencyCode: "USD"
            }))
          }
        }
      });
      console.log("ACDL: scView tracked");
    },

    // 6. BEGIN CHECKOUT
    trackBeginCheckout: function (cart) {
      window.adobeDataLayer.push({
        event: "beginCheckout",
        custData: getCustData(),
        xdmCommerce: {
          checkout: {
            totalQuantity: cart.totalQuantity,
            totalValue: cart.totalValue
          }
        }
      });
      console.log("ACDL: beginCheckout tracked");
    },

    // 7. CHECKOUT VIEW
    trackCheckout: function (cart) {
      window.adobeDataLayer.push({
        event: "scCheckout",
        custData: getCustData(),
        xdmCommerce: {
          checkout: {
            totalQuantity: cart.totalQuantity,
            totalValue: cart.totalValue,
            products: cart.products.map(p => ({
              sku: p.sku || '',
              productID: p.productID || p.id,
              productName: p.productName || p.name,
              brand: p.brand || 'shopkart',
              category: p.category || '',
              price: p.price,
              color: p.color || '',
              size: p.size || '',
              quantity: p.quantity,
              currencyCode: "USD"
            }))
          }
        }
      });
      console.log("ACDL: scCheckout tracked");
    },

    // 8. PURCHASE
    trackPurchase: function (order) {
      window.adobeDataLayer.push({
        event: "scPurchase",
        custData: {
          ...getCustData(),
          customerID: order.customerEmail || getCustData().customerID // augment if available
        },
        xdmCommerce: {
          order: {
            orderID: order.orderID,
            totalQuantity: order.totalQuantity,
            subtotal: order.subtotal,
            shipping: order.shipping || 0,
            tax: order.tax || 0,
            totalValue: order.totalValue,
            paymentMethod: order.paymentMethod || "credit_card",
            currencyCode: "USD",

            products: order.products.map(p => ({
              sku: p.sku || '',
              productID: p.productID,
              productName: p.productName,
              brand: p.brand || 'shopkart',
              category: p.category || '',
              price: p.price,
              color: p.color || '',
              size: p.size || '',
              quantity: p.quantity,
              currencyCode: "USD"
            })),

            shippingAddress: order.shippingAddress ? {
              firstName: order.shippingAddress.firstName,
              lastName: order.shippingAddress.lastName,
              address: order.shippingAddress.address,
              city: order.shippingAddress.city,
              state: order.shippingAddress.state,
              zipCode: order.shippingAddress.zipCode
            } : undefined
          }
        }
      });
      console.log("ACDL: scPurchase tracked", order.orderID);
    }
  };
})();
