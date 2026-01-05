// Static data management using localStorage
(function() {
  'use strict';

  // Cart management
  const CART_KEY = 'shopkart_cart';
  const USER_KEY = 'shopkart_user';
  const ORDERS_KEY = 'shopkart_orders';

  window.StaticData = {
    // Cart operations
    getCart: function() {
      try {
        const cart = localStorage.getItem(CART_KEY);
        return cart ? JSON.parse(cart) : { items: [] };
      } catch (e) {
        return { items: [] };
      }
    },

    setCart: function(cart) {
      try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        return true;
      } catch (e) {
        return false;
      }
    },

    addToCart: function(productId, qty, product) {
      const cart = this.getCart();
      const existing = cart.items.find(item => item.productId === productId);
      
      if (existing) {
        existing.qty += qty;
      } else {
        cart.items.push({
          productId: product.id,
          productName: product.name,
          price: product.price,
          qty: qty,
          image: product.image,
          brand: product.brand
        });
      }
      
      this.setCart(cart);
      return this.getCart();
    },

    removeFromCart: function(productId) {
      const cart = this.getCart();
      cart.items = cart.items.filter(item => item.productId !== productId);
      this.setCart(cart);
      return this.getCart();
    },

    clearCart: function() {
      this.setCart({ items: [] });
    },

    getCartCount: function() {
      const cart = this.getCart();
      return cart.items.reduce((sum, item) => sum + item.qty, 0);
    },

    getCartTotal: function() {
      const cart = this.getCart();
      return cart.items.reduce((sum, item) => sum + item.price * item.qty, 0);
    },

    // User management
    getUser: function() {
      try {
        const user = localStorage.getItem(USER_KEY);
        return user ? JSON.parse(user) : null;
      } catch (e) {
        return null;
      }
    },

    setUser: function(user) {
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

    logout: function() {
      localStorage.removeItem(USER_KEY);
    },

    // User storage (for login/signup)
    getUsers: function() {
      try {
        const users = localStorage.getItem('shopkart_users');
        return users ? JSON.parse(users) : {};
      } catch (e) {
        return {};
      }
    },

    setUsers: function(users) {
      try {
        localStorage.setItem('shopkart_users', JSON.stringify(users));
        return true;
      } catch (e) {
        return false;
      }
    },

    // Orders
    getOrders: function() {
      try {
        const orders = localStorage.getItem(ORDERS_KEY);
        return orders ? JSON.parse(orders) : {};
      } catch (e) {
        return {};
      }
    },

    setOrder: function(orderId, order) {
      try {
        const orders = this.getOrders();
        orders[orderId] = order;
        localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
        return true;
      } catch (e) {
        return false;
      }
    },

    getOrder: function(orderId) {
      const orders = this.getOrders();
      return orders[orderId] || null;
    }
  };
})();
