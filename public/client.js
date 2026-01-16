document.addEventListener('DOMContentLoaded', () => {
  // Use Helper from adl-utils.js for logging if needed, or rely on internal logging
  // Initial Page Load logging could be handled here or inside the adl-utils themselves if we wanted centralized logging.
  // Existing pageLoaded logic is inside the HTML files (inline).

  const cartBadge = document.querySelector('[data-role="cart-count"]');

  const updateCartBadge = (count) => {
    if (cartBadge) cartBadge.textContent = count;
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

  // Resolvers for Link Tracking
  const getLinkName = (element) => {
    // Priority: visible text -> aria-label -> title -> product name -> fallback

    // FIX: Force "Cart" for the cart link
    if (element.closest('[data-role="cart-link"]') || element.closest('.cart-link')) {
      return 'Cart';
    }

    let name = element.textContent?.trim();
    if (!name) name = element.getAttribute('aria-label');
    if (!name) name = element.getAttribute('title');

    // Check for product context if inside a product card
    if (!name) {
      const card = element.closest('.card, .deal-card, .cat-card');
      if (card) {
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
    const linkType = getLinkType(element);
    const linkPosition = getLinkPosition(element);

    // Page Name retrieval - try to get from Data Layer if possible, or doc title
    let pageName = document.title;
    const dl = window.adobeDataLayer || [];
    const pageLoaded = dl.find(entry => entry && entry.event === 'pageLoaded' && entry.xdmPageLoad);
    if (pageLoaded && pageLoaded.xdmPageLoad.web && pageLoaded.xdmPageLoad.web.webPageDetails) {
      pageName = pageLoaded.xdmPageLoad.web.webPageDetails.pageName;
    }

    // Use centralized ADL Helper
    if (window.adl && window.adl.trackLinkClick) {
      window.adl.trackLinkClick(linkName, linkType, linkPosition, pageName);
    }

    // Handle Navigation Logic
    const href = element.getAttribute('href');
    if (element.tagName === 'A' && href && !href.startsWith('#') && !href.startsWith('javascript:')) {
      e.preventDefault();
      setTimeout(() => {
        window.location.href = href;
      }, 300);
    }
  };

  // Add to cart handler
  const addToCartProcessing = new WeakSet();

  document.addEventListener('submit', (e) => {
    const form = e.target.closest('#add-to-cart-form');
    if (!form) return;

    e.preventDefault();
    e.stopPropagation();

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
    const size = formData.get('size') || '';
    const productName = form.dataset.productName;
    const price = Number(form.dataset.price);
    const category = form.dataset.category || '';

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

    // Add to cart with Color & Size
    const itemToAdd = { ...product, color: color, size: size };
    window.StaticData.addToCart(productId, qty, itemToAdd);
    updateCartBadge(window.StaticData.getCartCount());

    // Track Add To Cart using standardized helper
    if (window.adl && window.adl.trackAddToCart) {
      window.adl.trackAddToCart({
        sku: product.sku || '',
        productID: productId,
        productName: productName,
        brand: product.brand || 'shopkart',
        category: category,
        price: price,
        color: color,
        size: size,
        quantity: qty,
        linkPosition: 'pdp', // Context
        linkType: 'cta'
      });
    }

    const notice = document.querySelector('#cart-notice');
    if (notice) {
      notice.textContent = 'Added to cart. Proceed to cart or keep shopping.';
      notice.style.display = 'block';
    }

    setTimeout(() => {
      addToCartProcessing.delete(form);
    }, 800);
  });

  // GLOBAL CLICK HANDLER
  document.addEventListener('click', (e) => {
    const el = e.target.closest('a, button, input[type="submit"], [role="button"]');
    if (!el) return;

    if (el.disabled || el.getAttribute('aria-disabled') === 'true') return;

    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
      return;
    }

    handleLinkClick(el, e);

    // Special handling for Add to Cart button - let form submit handler fire addToCart separately
    if (el.type === 'submit' && el.closest('#add-to-cart-form')) {
      return;
    }
  });

  // Search form submission
  const searchForm = document.querySelector('.search');
  if (searchForm && searchForm.tagName === 'FORM') {
    searchForm.addEventListener('submit', (e) => {
      const input = searchForm.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        e.preventDefault();
        return false;
      }
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
