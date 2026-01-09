// Data layer helper functions
(function() {
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
      
      window.adobeDataLayer.push(linkData);
      console.log("ACDL: Restored linkClicked from previous page", linkData);
      
      // Clear it to prevent restoring it again on reload if not intended? 
      // Req says: "Restore interaction context (linkClicked) before the next page load"
      // And "The data layer must NOT reset on each page load" implies we build up.
      // But we are static, so it resets in memory.
      // We should probably keep it until overwritten? 
      // The req says: "Restore the **last linkClicked event** from `sessionStorage` (if present)"
      // Let's leave it in storage for now, but strictly it was from the *previous* page.
      // If I just reload manually, it will restore again. That seems acceptable/intended for "state restoration".
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
    buildBasePush: function({ event, pageType, pageName, url, extra = {} }) {
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

    cartState: function() {
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
