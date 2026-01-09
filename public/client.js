document.addEventListener('DOMContentLoaded', () => {
  const dl = window.adobeDataLayer || [];

  // LOGGING for pageLoaded
  // Find the pageLoaded event that was pushed (either purely inline or if we need to log it now)
  // Inline scripts usually run before DOMContentLoaded. 
  const pageData = dl.find(e => e.event === "pageLoaded");
  if (pageData) {
    console.log("ACDL: pageLoaded tracked", pageData);
    console.log("ACDL Length:", dl.length);

    // SAVE PAGE DATA TO SESSION STORAGE (Requirement 4)
    sessionStorage.setItem("shopkart_pageData", JSON.stringify({
      ...pageData,
      timestamp: Date.now()
    }));
  }

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

  // Resolvers for Link Tracking
  const getLinkName = (element) => {
    // Priority: visible text -> aria-label -> title -> product name -> fallback
    let name = element.textContent?.trim();
    if (!name) name = element.getAttribute('aria-label');
    if (!name) name = element.getAttribute('title');

    // Check for product context if inside a product card
    if (!name) {
      const card = element.closest('.card, .deal-card, .cat-card');
      if (card) {
        // Try to find a name inside the card
        const nameEl = card.querySelector('h3, h4, .cat-title');
        if (nameEl) name = nameEl.textContent.trim();
      }
    }

    if (!name) name = element.tagName === 'IMG' ? element.alt : '';

    // Final fallback
    if (!name) return 'Unlabeled Link';

    return name;
  };

  const getLinkPosition = (element) => {
    if (element.closest('header')) return 'header';
    if (element.closest('footer')) return 'footer';
    if (element.closest('.hero-carousel')) return 'hero-carousel';
    if (element.closest('.category-banners')) return 'category-banners';
    if (element.closest('#bestselling-products')) return 'bestselling-products';
    if (element.closest('#trending-products')) return 'trending-products';
    if (element.closest('.carousel')) return 'deals-carousel';
    if (element.closest('#category-cards')) return 'category-grid';
    if (element.closest('.product-grid')) return 'plp-grid';
    if (element.closest('.product-details')) return 'pdp-details';
    if (element.closest('.cart-container')) return 'cart-page';
    if (element.closest('#checkout-form')) return 'checkout-form';
    return 'body';
  };

  const getLinkType = (element) => {
    if (element.closest('nav') || element.closest('.categories') || element.closest('.topbar a')) return 'navigation';
    if (element.closest('.card') || element.closest('.deal-card')) return 'product';
    if (element.closest('.cat-card')) return 'category';
    if (element.classList.contains('button') || element.tagName === 'BUTTON' || element.type === 'submit') return 'cta';
    if (element.tagName === 'A') return 'link';
    return 'other';
  };

  // Generic click handler for all clickable elements
  const handleLinkClick = (element, e) => {
    const linkName = getLinkName(element);
    // Section 3: linkName must never be empty. If it resolves to empty (fallback covered above), technically we shouldn't track?
    // But 'Unlabeled Link' is a deterministic fallback.

    const linkType = getLinkType(element);
    const linkPosition = getLinkPosition(element);

    let pageName = getPageNameFromDL() || document.title;

    const eventData = {
      event: "linkClicked",
      custData: getCustData(),
      xdmActionDetails: {
        web: {
          webInteraction: {
            linkName: linkName,
            linkType: linkType,
            linkPosition: linkPosition,
            linkPageName: pageName,
            linkURL: element.href || ''
          }
        }
      },
      timestamp: Date.now()
    };

    const dl = window.adobeDataLayer || [];
    dl.push(eventData);

    // Save to Session Storage (State only, no auto-fire on load)
    sessionStorage.setItem("shopkart_lastLinkClicked", JSON.stringify(eventData));

    // LOGGING
    console.log("ACDL: linkClicked tracked", eventData);

    // Handle Navigation Logic
    const href = element.getAttribute('href');
    if (element.tagName === 'A' && href && !href.startsWith('#') && !href.startsWith('javascript:')) {
      e.preventDefault();
      setTimeout(() => {
        window.location.href = href;
      }, 300);
    }
  };

  // Add to cart handler - SEPARATE from linkClicked, fires once per click
  // Use single WeakSet for processing guard
  const addToCartProcessing = new WeakSet();

  // Global form submit handler for add to cart
  document.addEventListener('submit', (e) => {
    const form = e.target.closest('#add-to-cart-form');
    if (!form) return;

    e.preventDefault();
    e.stopPropagation();

    // Prevent duplicate submissions
    if (addToCartProcessing.has(form)) return;
    addToCartProcessing.add(form);

    if (!window.StaticData) {
      addToCartProcessing.delete(form);
      return;
    }

    const formData = new FormData(form);
    const productId = formData.get('id');
    const qty = Number(formData.get('qty')) || 1;
    const color = formData.get('color') || '';
    const productName = form.dataset.productName;
    const price = Number(form.dataset.price);

    // Find product from PRODUCTS array
    if (!window.PRODUCTS || !Array.isArray(window.PRODUCTS)) {
      addToCartProcessing.delete(form);
      return;
    }
    const product = window.PRODUCTS.find(p => p.id === productId);
    if (!product) {
      addToCartProcessing.delete(form);
      return;
    }

    // Add to cart with Color
    const itemToAdd = { ...product, color: color };
    window.StaticData.addToCart(productId, qty, itemToAdd);
    const cartState = fetchCart();
    const count = cartState.items.reduce((sum, item) => sum + item.qty, 0) || 0;
    updateCartBadge(count);

    // Push addToCart event (ONLY ONCE, separate from linkClicked)
    const category = form.dataset.category || '';
    const mrp = Number(form.dataset.mrp) || price;
    let discountAmount = 0;
    let discountPercent = 0;
    if (mrp > price) {
      discountAmount = mrp - price;
      discountPercent = Math.round((discountAmount / mrp) * 100);
    }

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
          originalPrice: mrp,
          discountAmount: discountAmount,
          discountPercent: discountPercent,
          quantity: qty,
          variant: color // Tracking color as variant
        }
      }
    });

    const notice = document.querySelector('#cart-notice');
    if (notice) {
      notice.textContent = 'Added to cart. Proceed to cart or keep shopping.';
      notice.style.display = 'block';
    }

    // Reset processing flag after delay
    setTimeout(() => {
      addToCartProcessing.delete(form);
    }, 800);
  });

  // Remove from cart - handled in cart.html inline script

  // GLOBAL CLICK HANDLER - ONE handler for ALL clicks
  // Uses event delegation, fires linkClicked for every clickable element
  document.addEventListener('click', (e) => {
    // Strict qualification (Section 2)
    const el = e.target.closest('a, button, input[type="submit"], [role="button"]');
    if (!el) return;

    // Ignore disabled elements
    if (el.disabled || el.getAttribute('aria-disabled') === 'true') return;

    // Skip form inputs and selects (not clickable elements for tracking)
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
      return;
    }

    // Fire linkClicked for ALL clicks (header nav, buttons, product cards, CTAs, etc.)
    handleLinkClick(el, e);

    // Special handling for Add to Cart button - let form submit handler fire addToCart separately
    if (el.type === 'submit' && el.closest('#add-to-cart-form')) {
      // linkClicked already fired above, form submit will fire addToCart
      return;
    }

    // Special handling for remove item - handled in cart.html
    if (el.hasAttribute('data-action') && el.getAttribute('data-action') === 'remove-item') {
      return;
    }

    // Special handling for checkout button - handled in cart.html
    if (el.closest('#checkout-button')) {
      return;
    }
  });

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

