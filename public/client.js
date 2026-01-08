document.addEventListener('DOMContentLoaded', () => {
  const dl = window.adobeDataLayer || [];
  const cartBadge = document.querySelector('[data-role="cart-count"]');

  // Get custData from initial push if available
  const getCustData = () => {
    if (dl.length > 0 && dl[0].custData) {
      return dl[0].custData;
    }
    return {
      custId: '',
      emailID_plain: '',
      loginMethod: 'guest',
      loginStatus: 'anonymous',
      mobileNo_plain: ''
    };
  };

  const updateCartBadge = (count) => {
    if (cartBadge) cartBadge.textContent = count;
  };

  const pushEvent = (payload) => {
    const custData = getCustData();
    dl.push({
      ...payload,
      eventInfo: { eventName: payload.event },
      custData: payload.custData || custData,
      timestamp: new Date().toISOString()
    });
  };

  const fetchCart = () => {
    if (!window.StaticData) {
      return { items: [], total: 0 };
    }
    const cart = window.StaticData.getCart();
    if (!cart.items || !Array.isArray(cart.items)) {
      cart.items = [];
    }
    const count = cart.items.reduce((sum, item) => sum + item.qty, 0) || 0;
    updateCartBadge(count);
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
  };

  // initial cart badge refresh
  fetchCart();

  const getPageNameFromDL = () => {
    const dl = window.adobeDataLayer || [];
    const pageLoaded = dl.find(entry => entry && entry.event === 'pageLoaded' && entry.xdmPageLoad);
    if (pageLoaded && pageLoaded.xdmPageLoad.web && pageLoaded.xdmPageLoad.web.webPageDetails) {
      return pageLoaded.xdmPageLoad.web.webPageDetails.pageName;
    }
    return null;
  };

  // Generic click handler for all clickable elements
  const handleLinkClick = (element, e) => {
    const linkText = element.textContent?.trim() || element.getAttribute('aria-label') || '';
    const pageType = document.body.dataset.pageType || 'home';
    let pageName = getPageNameFromDL() || 'Home';
    
    // Fallback derivation if page name not in data layer yet
    if (!pageName) {
      if (pageType === 'pdp') {
        pageName = document.title.replace(' | ShopKart', '');
      } else if (pageType === 'plp') {
        pageName = 'Product Listing';
      } else if (pageType === 'cart') {
        pageName = 'Cart';
      } else if (pageType === 'checkout') {
        pageName = 'Checkout';
      } else if (pageType === 'thankyou') {
        pageName = 'Order Confirmation';
      }
    }
    
    // Determine link type and position
    let linkType = 'button';
    let linkPosition = 'body';
    
    if (element.closest('header')) {
      linkPosition = 'header';
      // All header links should be navigation type
      linkType = 'navigation';
    } else if (element.closest('.hero-carousel')) {
      linkPosition = 'body';
      linkType = 'cta';
    } else if (element.closest('.category-banners')) {
      linkPosition = 'body';
      linkType = 'banner';
    } else if (element.closest('.card') || element.closest('.deal-card')) {
      linkPosition = 'product-tile';
      linkType = 'card';
    } else if (element.closest('footer')) {
      linkPosition = 'footer';
      linkType = 'footer';
    }
    
    const dl = window.adobeDataLayer || [];
    dl.push({
      event: "linkClicked",
      xdmActionDetails: {
        web: {
          webInteraction: {
            linkName: linkText,
            linkType: linkType,
            linkPosition: linkPosition,
            linkPageName: pageName
          }
        }
      }
    });
  };

  // Add to cart handler - SEPARATE from linkClicked, fires once per click
  const addToCartProcessingFlags = new WeakSet();
  const addToCartHandledForms = new WeakSet();
  
  const attachAddToCartHandler = () => {
    const addToCartForm = document.querySelector('#add-to-cart-form');
    if (addToCartForm && !addToCartHandledForms.has(addToCartForm)) {
      addToCartHandledForms.add(addToCartForm);
      
      addToCartForm.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Prevent multiple submissions using WeakSet for better tracking
        if (addToCartProcessingFlags.has(addToCartForm)) {
          return;
        }
        addToCartProcessingFlags.add(addToCartForm);
        
        if (!window.StaticData) {
          addToCartProcessingFlags.delete(addToCartForm);
          return;
        }
        
        const formData = new FormData(addToCartForm);
        const productId = formData.get('id');
        const qty = Number(formData.get('qty')) || 1;
        const productName = addToCartForm.dataset.productName;
        const price = Number(addToCartForm.dataset.price);

        // Find product from PRODUCTS array
        if (!window.PRODUCTS || !Array.isArray(window.PRODUCTS)) {
          addToCartProcessingFlags.delete(addToCartForm);
          return;
        }
        const product = window.PRODUCTS.find(p => p.id === productId);
        if (!product) {
          addToCartProcessingFlags.delete(addToCartForm);
          return;
        }
        
        // Add to cart
        window.StaticData.addToCart(productId, qty, product);
        const cartState = fetchCart();
        const count = cartState.items.reduce((sum, item) => sum + item.qty, 0) || 0;
        updateCartBadge(count);

        // Push addToCart event (ONLY ONCE, separate from linkClicked)
        const category = addToCartForm.dataset.category || '';
        const dl = window.adobeDataLayer || [];
        dl.push({
          event: "addToCart",
          xdmActionDetails: {
            web: {
              webInteraction: {
                linkName: 'Add to Cart',
                linkType: 'button',
                linkPosition: 'pdp'
              }
            }
          },
          xdmCommerce: {
            product: {
              productID: productId,
              productName: productName,
              category: category,
              price: price,
              quantity: qty
            }
          }
        });

        const notice = document.querySelector('#cart-notice');
        if (notice) {
          notice.textContent = 'Added to cart. Proceed to cart or keep shopping.';
          notice.style.display = 'block';
        }
        
        // Reset processing flag after a short delay
        setTimeout(() => {
          addToCartProcessingFlags.delete(addToCartForm);
        }, 1000);
      });
    }
  };
  
  // Try to attach immediately
  attachAddToCartHandler();
  
  // Also try after DOM is fully loaded (in case form is created dynamically)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachAddToCartHandler);
  } else {
    attachAddToCartHandler();
  }
  
  // Use MutationObserver to catch dynamically added forms
  const observer = new MutationObserver(() => {
    attachAddToCartHandler();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Remove from cart - handled in cart.html inline script

  // GLOBAL CLICK HANDLER - ONE handler for ALL clicks
  // Uses event delegation, fires linkClicked for every clickable element
  document.addEventListener('click', (e) => {
    const target = e.target.closest('a, button, [role="button"]');
    if (!target) return;
    
    // Skip form inputs and selects (not clickable elements for tracking)
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
      return;
    }
    
    // Fire linkClicked for ALL clicks (header nav, buttons, product cards, Add to Cart, etc.)
    // This fires BEFORE navigation or form submission
    handleLinkClick(target, e);
    
    // Special handling for Add to Cart button - let form submit handler fire addToCart
    if (target.type === 'submit' && target.closest('#add-to-cart-form')) {
      // linkClicked already fired above, form submit will fire addToCart
      return;
    }
    
    // Special handling for remove item - handled in cart.html
    if (target.hasAttribute('data-action') && target.getAttribute('data-action') === 'remove-item') {
      return;
    }
    
    // Special handling for checkout button - handled in cart.html
    if (target.closest('#checkout-button')) {
      return;
    }
    
    // For all other clicks (links, navigation), allow default behavior
    // Navigation will proceed normally after linkClicked fires
  }, true); // Use capture phase to fire BEFORE other handlers

  // Search form submission (ensure it navigates properly)
  const searchForm = document.querySelector('.search');
  if (searchForm && searchForm.tagName === 'FORM') {
    searchForm.addEventListener('submit', (e) => {
      const input = searchForm.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        e.preventDefault();
        return false;
      }
      // Let form submit naturally to /plp?q=...
    });
  }

  // Hero Carousel
  const carousel = document.querySelector('.hero-carousel');
  if (carousel) {
    const slides = carousel.querySelectorAll('.carousel-slide');
    const dots = carousel.querySelectorAll('.dot');
    let currentSlide = 0;
    let carouselInterval;

    const showSlide = (index) => {
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
      currentSlide = index;
    };

    const nextSlide = () => {
      const next = (currentSlide + 1) % slides.length;
      showSlide(next);
    };

    // Auto-advance carousel
    const startCarousel = () => {
      carouselInterval = setInterval(nextSlide, 5000);
    };

    const stopCarousel = () => {
      if (carouselInterval) {
        clearInterval(carouselInterval);
      }
    };

    // Dot navigation
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        stopCarousel();
        showSlide(index);
        startCarousel();
      });
    });

    // Pause on hover
    carousel.addEventListener('mouseenter', stopCarousel);
    carousel.addEventListener('mouseleave', startCarousel);

    // Lazy load images (load next slide when current is active)
    const loadSlideImage = (index) => {
      const slide = slides[index];
      if (slide && !slide.dataset.loaded) {
        const bgImage = slide.style.backgroundImage;
        if (bgImage && bgImage.includes('url')) {
          const img = new Image();
          img.src = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/)[1];
          img.onload = () => {
            slide.dataset.loaded = 'true';
          };
        }
      }
    };

    // Load first slide immediately, others on demand
    loadSlideImage(0);
    slides.forEach((slide, index) => {
      if (index > 0) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              loadSlideImage(index);
              observer.unobserve(entry.target);
            }
          });
        }, { rootMargin: '50px' });
        observer.observe(slide);
      }
    });

    // Error handling for background images
    slides.forEach((slide) => {
      const bgImage = slide.style.backgroundImage;
      if (bgImage && bgImage.includes('url')) {
        const img = new Image();
        const imageUrl = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/)[1];
        img.onerror = () => {
          const fallback = slide.dataset.fallback;
          if (fallback) {
            slide.style.backgroundImage = `url('${fallback}')`;
          }
        };
        img.src = imageUrl;
      }
    });

    // Start carousel
    startCarousel();
  }
});

