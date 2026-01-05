// Data layer helper functions
(function() {
  'use strict';

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
