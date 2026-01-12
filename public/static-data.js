// Static data management using localStorage
(function () {
  'use strict';

  // Cart management
  const CART_KEY = 'shopkart_cart';
  const USER_KEY = 'shopkart_user';
  const ORDERS_KEY = 'shopkart_orders';

  window.StaticData = {
    // Cart operations
    getCart: function () {
      try {
        const cart = localStorage.getItem(CART_KEY);
        return cart ? JSON.parse(cart) : { items: [] };
      } catch (e) {
        return { items: [] };
      }
    },

    setCart: function (cart) {
      try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        return true;
      } catch (e) {
        return false;
      }
    },

    addToCart: function (productId, qty, product) {
      const cart = this.getCart();
      if (!cart.items || !Array.isArray(cart.items)) {
        cart.items = [];
      }

      // Normalize variants
      const color = product.color || '';
      const size = product.size || '';

      // Check if existing item has same ID AND same Color AND same Size
      const existing = cart.items.find(item =>
        item.productId === productId &&
        (item.color || '') === color &&
        (item.size || '') === size
      );

      if (existing) {
        existing.qty += qty;
      } else {
        cart.items.push({
          itemId: `${productId}-${size}-${color}`.replace(/[^a-zA-Z0-9-]/g, ''),
          productId: product.id,
          productName: product.name,
          price: product.price,
          qty: qty,
          image: product.image,
          brand: product.brand,
          color: color,
          size: size
        });
      }

      this.setCart(cart);
      return this.getCart();
    },

    // New: Update Qty by Item Composite
    updateItemQty: function (productId, size, color, newQty) {
      const cart = this.getCart();
      const item = cart.items.find(item =>
        item.productId === productId &&
        (item.color || '') === (color || '') &&
        (item.size || '') === (size || '')
      );

      if (item) {
        item.qty = Math.max(1, newQty);
        this.setCart(cart);
      }
      return this.getCart();
    },

    removeFromCart: function (productId, size, color) {
      const cart = this.getCart();
      cart.items = cart.items.filter(item =>
        !(item.productId === productId &&
          (item.color || '') === (color || '') &&
          (item.size || '') === (size || ''))
      );
      this.setCart(cart);
      return this.getCart();
    },

    clearCart: function () {
      this.setCart({ items: [] });
    },

    getCartCount: function () {
      const cart = this.getCart();
      if (!cart.items || !Array.isArray(cart.items)) {
        return 0;
      }
      return cart.items.reduce((sum, item) => sum + item.qty, 0);
    },

    // Cart Total with Discount
    getCartTotal: function () {
      const cart = this.getCart();
      if (!cart.items || !Array.isArray(cart.items)) {
        return 0;
      }
      const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.qty, 0);

      // Apply coupon if exists
      const coupon = this.getCoupon();
      let discount = 0;
      if (coupon) {
        discount = this.getMaxCouponDiscount(subtotal, coupon);
      }

      return Math.max(0, subtotal - discount);
    },

    getCartSubtotal: function () {
      const cart = this.getCart();
      if (!cart.items || !Array.isArray(cart.items)) return 0;
      return cart.items.reduce((sum, item) => sum + item.price * item.qty, 0);
    },

    // Coupon Management
    getMaxCouponDiscount: function (subtotal, coupon) {
      if (!coupon) return 0;
      let discount = 0;
      if (coupon.type === 'percent') {
        discount = subtotal * (coupon.value / 100);
      } else if (coupon.type === 'flat') {
        discount = coupon.value;
      } else if (coupon.type === 'category') {
        // For category coupons, we need to sum only eligible items
        const cart = this.getCart();
        let eligibleTotal = 0;
        // We need to access global PRODUCTS to check category. 
        // If PRODUCTS is not available (e.g. race condition), this might fail validation, 
        // but applyCoupon checks validity first.
        // Here we re-calculate.
        if (typeof PRODUCTS !== 'undefined') {
          cart.items.forEach(item => {
            const p = PRODUCTS.find(prod => prod.id === item.productId);
            if (p && p.category.toLowerCase() === coupon.category.toLowerCase()) {
              eligibleTotal += (item.price * item.qty);
            }
          });
        }
        discount = eligibleTotal * (coupon.value / 100);
      } else if (coupon.type === 'cart_value') {
        // Flat off if cart value > min
        if (subtotal >= coupon.minCartValue) {
          discount = coupon.value;
        }
      }

      // Cap discount at subtotal
      return Math.min(discount, subtotal);
    },

    getAvailableCoupons: function () {
      return [
        { code: 'SAVE10', type: 'percent', value: 10, minCartValue: 0, description: '10% Off' },
        { code: 'FLAT50', type: 'flat', value: 50, minCartValue: 200, description: '$50 Off orders over $200' },
        { code: 'FASHION15', type: 'category', value: 15, category: 'fashion', minCartValue: 0, description: '15% Off Fashion Items' },
        { code: 'CART100', type: 'cart_value', value: 100, minCartValue: 500, description: '$100 Off orders over $500' }
      ];
    },

    getCoupon: function () {
      try {
        const coupon = localStorage.getItem('shopkart_coupon');
        return coupon ? JSON.parse(coupon) : null;
      } catch (e) {
        return null;
      }
    },

    applyCoupon: function (code) {
      const coupons = this.getAvailableCoupons();
      const coupon = coupons.find(c => c.code === code);

      if (!coupon) {
        return { success: false, message: 'Invalid coupon code' };
      }

      const subtotal = this.getCartSubtotal();

      // Min Value Check
      if (coupon.minCartValue > 0 && subtotal < coupon.minCartValue) {
        return { success: false, message: `Add items worth $${(coupon.minCartValue - subtotal).toFixed(2)} more to apply.` };
      }

      // Category Check
      if (coupon.type === 'category') {
        const cart = this.getCart();
        let hasCategory = false;
        if (typeof PRODUCTS !== 'undefined') {
          hasCategory = cart.items.some(item => {
            const p = PRODUCTS.find(prod => prod.id === item.productId);
            return p && p.category.toLowerCase() === coupon.category.toLowerCase();
          });
        }
        if (!hasCategory) {
          return { success: false, message: `Coupon applicable only on ${coupon.category} items.` };
        }
      }

      localStorage.setItem('shopkart_coupon', JSON.stringify(coupon));
      return { success: true, coupon: coupon };
    },

    removeCoupon: function () {
      localStorage.removeItem('shopkart_coupon');
    },

    // User management
    getUser: function () {
      try {
        const user = localStorage.getItem(USER_KEY);
        return user ? JSON.parse(user) : null;
      } catch (e) {
        return null;
      }
    },

    setUser: function (user) {
      try {
        if (user) {
          localStorage.setItem(USER_KEY, JSON.stringify(user));
        } else {
          localStorage.removeItem(USER_KEY);
        }
        return true;
      } catch (e) {
        return false;
      }
    },

    logout: function () {
      localStorage.removeItem(USER_KEY);
    },

    // User storage (for login/signup)
    getUsers: function () {
      try {
        const users = localStorage.getItem('shopkart_users');
        return users ? JSON.parse(users) : {};
      } catch (e) {
        return {};
      }
    },

    setUsers: function (users) {
      try {
        localStorage.setItem('shopkart_users', JSON.stringify(users));
        return true;
      } catch (e) {
        return false;
      }
    },

    // Orders
    getOrders: function () {
      try {
        const orders = localStorage.getItem(ORDERS_KEY);
        return orders ? JSON.parse(orders) : {};
      } catch (e) {
        return {};
      }
    },

    setOrder: function (orderId, order) {
      try {
        const orders = this.getOrders();
        orders[orderId] = order;
        localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
        return true;
      } catch (e) {
        return false;
      }
    },

    getOrder: function (orderId) {
      const orders = this.getOrders();
      return orders[orderId] || null;
    }
  };
})();
