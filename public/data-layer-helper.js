// Data layer helper functions
(function () {
  'use strict';

  // Initialize DL immediately
  window.adobeDataLayer = window.adobeDataLayer || [];

  // Restoration Logic
  try {
    const rawLinkData = sessionStorage.getItem("shopkart_lastLinkClicked");
    if (rawLinkData) {
      const linkData = JSON.parse(rawLinkData);

      // Check if this is stale (optional, but good practice - for now just restore as per req)
      // Requirement says: Restore the last linkClicked event from sessionStorage (if present)

      // Requirement: Restore linkClicked on navigation (Section 1)
      window.adobeDataLayer.push(linkData);
      console.log("ACDL: Restored linkClicked from previous page", linkData);

      // CRITICAL: Clear it immediately so it doesn't fire on Refresh (Section 1, Section 8)
      sessionStorage.removeItem("shopkart_lastLinkClicked");
    }
  } catch (e) {
    console.error("ACDL: Error restoring data layer", e);
  }

  const getCustData = () => {
    const user = window.StaticData ? window.StaticData.getUser() : null;
    if (user) {
      return {
        custId: user.id.toString(),
        emailID_plain: user.email,
        loginMethod: 'local',
        loginStatus: 'authenticated',
        mobileNo_plain: ''
      };
    }
    return {
      custId: '',
      emailID_plain: '',
      loginMethod: 'guest',
      loginStatus: 'anonymous',
      mobileNo_plain: ''
    };
  };

  window.DataLayerHelper = {
    buildBasePush: function ({ event, pageType, pageName, url, extra = {} }) {
      return {
        event,
        eventInfo: { eventName: event },
        custData: getCustData(),
        page: {
          language: 'en',
          pageName,
          pageType,
          url: url || window.location.href
        },
        timestamp: new Date().toISOString(),
        ...extra
      };
    },

    cartState: function () {
      if (!window.StaticData) return { items: [], total: 0 };
      const cart = window.StaticData.getCart();
      if (!cart.items || !Array.isArray(cart.items)) {
        return { items: [], total: 0 };
      }
      return {
        items: cart.items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          qty: item.qty,
          image: item.image,
          brand: item.brand
        })),
        total: Number(window.StaticData.getCartTotal().toFixed(2))
      };
    }
  };
})();
