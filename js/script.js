document.addEventListener('DOMContentLoaded', () => {
  const preloader = document.querySelector('.preloader');
  const scrollTopBtn = document.querySelector('.scroll-top');
  const reveals = document.querySelectorAll('.reveal');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const galleryImage = document.getElementById('galleryImage');
  const cartStorageKey = 'madams-boutique-cart';
  const cartBadgeSelector = '.cart-badge';

  const ensureProgressBar = () => {
    let progressBar = document.querySelector('.progress-bar-top');
    if (!progressBar) {
      progressBar = document.createElement('div');
      progressBar.className = 'progress-bar-top';
      document.body.prepend(progressBar);
    }
    return progressBar;
  };

  const progressBar = ensureProgressBar();

  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader?.classList.add('hidden');
    }, 650);
  });

  const updateScrollEffects = () => {
    scrollTopBtn?.classList.toggle('show', window.scrollY > 600);
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
    progressBar.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
  };

  window.addEventListener('scroll', updateScrollEffects, { passive: true });
  updateScrollEffects();

  scrollTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const revealObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      )
    : null;

  reveals.forEach((item) => {
    if (revealObserver) {
      revealObserver.observe(item);
    } else {
      item.classList.add('is-visible');
    }
  });

  galleryItems.forEach((item) => {
    item.addEventListener('click', () => {
      const imageUrl = item.getAttribute('data-image');
      if (galleryImage && imageUrl) {
        galleryImage.src = imageUrl;
      }
    });
  });

  document.querySelectorAll('.btn, .control-btn, .cart-toggle, .nav-search').forEach((button) => {
    button.addEventListener('click', function (event) {
      if (this.classList.contains('add-to-cart-btn')) {
        return;
      }

      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.cssText = `
        width:${size}px;
        height:${size}px;
        left:${event.clientX - rect.left - size / 2}px;
        top:${event.clientY - rect.top - size / 2}px;
        position:absolute;
        border-radius:50%;
        background:rgba(255,255,255,.35);
        transform:scale(0);
        animation:ripple .6s linear;
        pointer-events:none;
      `;
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  const injectCartControls = () => {
    const topActions = document.querySelector('.top-actions');
    if (topActions && !topActions.querySelector('.cart-toggle')) {
      const cartButton = document.createElement('button');
      cartButton.type = 'button';
      cartButton.className = 'cart-toggle';
      cartButton.setAttribute('aria-label', 'Open shopping bag');
      cartButton.innerHTML = '<i class="bi bi-bag"></i><span class="cart-badge">0</span>';
      topActions.appendChild(cartButton);
    }

    const nav = document.querySelector('.navbar-collapse');
    if (nav && !nav.querySelector('.cart-toggle')) {
      const cartButton = document.createElement('button');
      cartButton.type = 'button';
      cartButton.className = 'cart-toggle';
      cartButton.setAttribute('aria-label', 'Open shopping bag');
      cartButton.innerHTML = '<i class="bi bi-bag"></i><span class="cart-badge">0</span>';
      const searchButton = nav.querySelector('.nav-search');
      if (searchButton) {
        nav.insertBefore(cartButton, searchButton);
      } else {
        nav.appendChild(cartButton);
      }
    }
  };

  const createCartMarkup = () => {
    if (document.getElementById('cartOffcanvas')) {
      return;
    }

    const markup = `
      <div class="offcanvas offcanvas-end cart-offcanvas" tabindex="-1" id="cartOffcanvas" aria-labelledby="cartOffcanvasLabel">
        <div class="offcanvas-header">
          <div>
            <h5 class="offcanvas-title" id="cartOffcanvasLabel">Your Bag</h5>
            <p class="mb-0 cart-subtitle">Luxury picks ready to reserve</p>
          </div>
          <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
          <div id="cartItems" class="cart-items"></div>
          <div class="cart-summary">
            <div class="summary-row"><span>Subtotal</span><strong id="cartSubtotal">$0</strong></div>
            <div class="summary-row"><span>Shipping</span><strong>Complimentary</strong></div>
            <div class="summary-row total-row"><span>Total</span><strong id="cartTotal">$0</strong></div>
            <button id="checkoutBtn" class="btn btn-primary w-100 mt-3" type="button">Complete Order</button>
          </div>
        </div>
      </div>
      <div id="cartToast" class="cart-toast" aria-live="polite"></div>
    `;

    document.body.insertAdjacentHTML('beforeend', markup);
  };

  const parsePrice = (value) => {
    const match = `${value}`.match(/\d+(?:,\d{3})*(?:\.\d{1,2})?/);
    if (!match) {
      return 0;
    }
    return Number(match[0].replace(/,/g, ''));
  };

  const formatCurrency = (value) => `$${value.toFixed(2)}`;

  const updateCartBadges = (quantity) => {
    document.querySelectorAll(cartBadgeSelector).forEach((badge) => {
      badge.textContent = quantity;
      badge.classList.toggle('is-empty', quantity <= 0);
    });
  };

  const getCart = () => {
    try {
      return JSON.parse(localStorage.getItem(cartStorageKey) || '[]');
    } catch (error) {
      console.error('Cart storage error', error);
      return [];
    }
  };

  const saveCart = (items) => {
    localStorage.setItem(cartStorageKey, JSON.stringify(items));
  };

  let cart = getCart();

  const showToast = (message) => {
    const toast = document.getElementById('cartToast');
    if (!toast) {
      return;
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timeout);
    showToast.timeout = setTimeout(() => toast.classList.remove('show'), 2200);
  };

  const renderCart = () => {
    const cartItems = document.getElementById('cartItems');
    const subtotalEl = document.getElementById('cartSubtotal');
    const totalEl = document.getElementById('cartTotal');

    if (!cartItems || !subtotalEl || !totalEl) {
      return;
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    updateCartBadges(itemCount);

    if (!cart.length) {
      cartItems.innerHTML = `
        <div class="cart-empty">
          <i class="bi bi-bag-heart"></i>
          <h6>Your bag is empty</h6>
          <p>Add a signature look to begin your private styling session.</p>
        </div>
      `;
      subtotalEl.textContent = formatCurrency(0);
      totalEl.textContent = formatCurrency(0);
      return;
    }

    cartItems.innerHTML = cart
      .map(
        (item) => `
          <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" />
            <div class="cart-item-details">
              <div class="d-flex justify-content-between align-items-start gap-2">
                <div>
                  <h6>${item.name}</h6>
                  <p>${item.category}</p>
                </div>
                <button class="remove-item" type="button" data-name="${item.name}" aria-label="Remove ${item.name}">×</button>
              </div>
              <div class="cart-item-actions">
                <button class="qty-btn" type="button" data-action="decrease" data-name="${item.name}">−</button>
                <span class="qty-value">${item.quantity}</span>
                <button class="qty-btn" type="button" data-action="increase" data-name="${item.name}">+</button>
              </div>
              <div class="cart-item-price">${formatCurrency(item.price * item.quantity)}</div>
            </div>
          </div>
        `
      )
      .join('');

    subtotalEl.textContent = formatCurrency(subtotal);
    totalEl.textContent = formatCurrency(subtotal);
  };

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.name === product.name);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    saveCart(cart);
    renderCart();
    showToast(`${product.name} added to your bag`);
  };

  const updateCartItemQuantity = (name, action) => {
    cart = cart
      .map((item) => {
        if (item.name !== name) {
          return item;
        }
        return {
          ...item,
          quantity: action === 'increase' ? item.quantity + 1 : Math.max(0, item.quantity - 1),
        };
      })
      .filter((item) => item.quantity > 0);
    saveCart(cart);
    renderCart();
  };

  const initializeCart = () => {
    injectCartControls();
    createCartMarkup();

    const cartToggleButtons = document.querySelectorAll('.cart-toggle');
    const offcanvasElement = document.getElementById('cartOffcanvas');
    const checkoutButton = document.getElementById('checkoutBtn');

    if (offcanvasElement && cartToggleButtons.length) {
      const cartPanel = new bootstrap.Offcanvas(offcanvasElement);
      cartToggleButtons.forEach((button) => {
        button.addEventListener('click', () => cartPanel.show());
      });
    }

    checkoutButton?.addEventListener('click', () => {
      if (!cart.length) {
        showToast('Your bag is still empty. Add a piece to continue.');
        return;
      }
      showToast('Order request received. Our stylist will contact you shortly.');
      cart = [];
      saveCart(cart);
      renderCart();
    });

    const cartItemsContainer = document.getElementById('cartItems');
    cartItemsContainer?.addEventListener('click', (event) => {
      const button = event.target.closest('button');
      if (!button) {
        return;
      }
      if (button.classList.contains('remove-item')) {
        const name = button.getAttribute('data-name');
        cart = cart.filter((item) => item.name !== name);
        saveCart(cart);
        renderCart();
      } else if (button.classList.contains('qty-btn')) {
        const name = button.getAttribute('data-name');
        const action = button.getAttribute('data-action');
        updateCartItemQuantity(name, action);
      }
    });

    document.querySelectorAll('.collection-card').forEach((card) => {
      if (card.querySelector('.add-to-cart-btn')) {
        return;
      }

      const title = card.querySelector('h4')?.textContent?.trim() || 'Signature Piece';
      const category = card.querySelector('.feature-pill')?.textContent?.trim() || 'Luxury Edit';
      const image = card.querySelector('img')?.getAttribute('src') || 'images/logo.svg';
      const price = parsePrice(card.querySelector('.price-tag')?.textContent || '0');

      const actions = document.createElement('div');
      actions.className = 'card-actions';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'add-to-cart-btn btn btn-sm btn-outline-primary';
      button.textContent = 'Add to bag';
      button.dataset.name = title;
      button.dataset.category = category;
      button.dataset.image = image;
      button.dataset.price = price;
      button.style.position = 'relative';
      button.style.zIndex = '2';
      button.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        addToCart({
          name: button.dataset.name || 'Signature Piece',
          category: button.dataset.category || 'Luxury Edit',
          image: button.dataset.image || 'images/logo.svg',
          price: Number(button.dataset.price || 0),
        });
      };
      actions.appendChild(button);
      card.querySelector('.card-content')?.appendChild(actions);
    });

    document.addEventListener('click', (event) => {
      const button = event.target.closest('.add-to-cart-btn');
      if (!button) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      if (button.onclick) {
        button.onclick(event);
      }
    });

    renderCart();
  };

  initializeCart();

  const updateActiveNav = () => {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach((link) => {
      const href = link.getAttribute('href') || '';
      const isActive = href === currentPath || (currentPath === 'index.html' && href === 'index.html');
      link.classList.toggle('active', isActive);
    });
  };

  updateActiveNav();
});


