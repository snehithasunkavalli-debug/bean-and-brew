/* ===================================================================
   BEAN & BREW - GLOBAL CART & CHECKOUT ENGINE (cart.js)
   Cross-page cart persistence, drawer management, and checkout
   =================================================================== */

const CART_STORAGE_KEY = 'bean_and_brew_cart';
const PROMO_STORAGE_KEY = 'bean_and_brew_promo';

const PROMO_CODES = {
  'BREW10': { discountPercent: 10, label: '10% Off Your Order' },
  'FIRSTSIP': { discountAmount: 5.00, label: '$5 Off Welcome Gift' },
  'FREESHIP': { freeShipping: true, label: 'Free Shipping Unlocked' }
};

// Global Catalog Data (Accessible across pages)
window.COFFEE_PRODUCTS = [
  {
    id: 'ethiopian-yirgacheffe',
    name: 'Ethiopian Yirgacheffe G1',
    category: 'beans',
    price: 19.50,
    roast: 'Light Roast',
    notes: 'Jasmine, Bergamot, Peach Nectar',
    origin: 'Gedeo Zone, Ethiopia (2,050m)',
    image: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=700&q=80',
    description: 'A delicately floral, tea-like washed Ethiopian bean with sparkling citrus acidity and a clean lingering honeysuckle finish.'
  },
  {
    id: 'colombian-huila-reserve',
    name: 'Colombian Huila Pink Bourbon',
    category: 'beans',
    price: 21.00,
    roast: 'Medium Roast',
    notes: 'Red Currant, Brown Sugar, Milk Chocolate',
    origin: 'Huila, Colombia (1,800m)',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=700&q=80',
    description: 'Rare Pink Bourbon varietal offering high sweetness, velvety body, and sweet caramel toffee notes.'
  },
  {
    id: 'sumatra-mandheling-dark',
    name: 'Sumatra Mandheling Vintage',
    category: 'beans',
    price: 18.50,
    roast: 'Dark Roast',
    notes: 'Dark Cocoa, Cedarwood, Roasted Walnut',
    origin: 'Lintong, Sumatra (1,500m)',
    image: 'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?auto=format&fit=crop&w=700&q=80',
    description: 'Wet-hulled processing yields heavy syrupy body, earthy cedar nuances, and an ultra-low acidity chocolate richness.'
  },
  {
    id: 'signature-espresso-blend',
    name: 'Velvet Crema House Espresso',
    category: 'beans',
    price: 17.50,
    roast: 'Espresso Roast',
    notes: 'Dark Chocolate, Toasted Hazelnut, Blackberry',
    origin: 'Brazil & Guatemala Blend',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=700&q=80',
    description: 'Our flagship espresso formula crafted to produce dense crema, rich mouthfeel, and luscious sweetness with milk.'
  },
  {
    id: 'artisan-caramel-cortado',
    name: 'Smoked Vanilla Cortado',
    category: 'hot-drinks',
    price: 5.75,
    roast: 'Beverage',
    notes: 'Equal parts espresso & textured oat milk, Madagascar vanilla',
    origin: 'Prepared Fresh in Café',
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=700&q=80',
    description: 'Double ristretto shot cut 1:1 with warm micro-foamed oat milk and infused with house-smoked Madagascar bourbon vanilla syrup.'
  },
  {
    id: 'nitro-cold-brew',
    name: 'Cascara Nitro Cold Brew',
    category: 'cold-drinks',
    price: 6.25,
    roast: 'Cold Beverage',
    notes: 'Guinness-like head, Dark Cherry, Malt',
    origin: 'Steeped for 20 Hours',
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=700&q=80',
    description: 'Slow-dripped single origin coffee infused with pure nitrogen for an ultra-velvety, creamy texture served ice-cold from tap.'
  },
  {
    id: 'spanish-honey-latte',
    name: 'Wildflower Honey Lavender Latte',
    category: 'hot-drinks',
    price: 6.50,
    roast: 'Beverage',
    notes: 'Organic Honey, French Lavender, Velvety Foam',
    origin: 'Prepared Fresh in Café',
    image: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=700&q=80',
    description: 'Single-origin espresso harmonized with organic raw wildflower honey, a whisper of organic lavender, and silky steamed milk.'
  },
  {
    id: 'almond-croissant',
    name: 'Double-Baked Almond Croissant',
    category: 'bakery',
    price: 4.85,
    roast: 'Fresh Bakery',
    notes: 'Frangipane almond cream, toasted flakes',
    origin: 'Baked In-House Daily at 5:00 AM',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=700&q=80',
    description: 'Buttery flaky laminated French pastry soaked with vanilla rum syrup, filled with rich frangipane cream and topped with sliced toasted almonds.'
  },
  {
    id: 'pourover-v60-kit',
    name: 'Hario V60 Ceramic Brewer Set',
    category: 'gear',
    price: 36.00,
    roast: 'Brewing Gear',
    notes: 'Ceramic 02 Dripper, Glass Server, 100 Paper Filters',
    origin: 'Tokyo, Japan',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=700&q=80',
    description: 'The golden standard pour-over brewing kit favored by competitive baristas world-wide for pristine flavor clarity and extraction control.'
  }
];

class CartManager {
  constructor() {
    this.cart = this.loadCart();
    this.promoCode = localStorage.getItem(PROMO_STORAGE_KEY) || '';
    this.initDOM();
  }

  loadCart() {
    try {
      const data = localStorage.getItem(CART_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading cart:', e);
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.cart));
      if (this.promoCode) {
        localStorage.setItem(PROMO_STORAGE_KEY, this.promoCode);
      } else {
        localStorage.removeItem(PROMO_STORAGE_KEY);
      }
      this.updateBadges();
      this.renderDrawer();
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  }

  addItem(productId, grind = 'Whole Bean', quantity = 1) {
    const product = window.COFFEE_PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const cartItemId = `${productId}-${grind}`;
    const existingIndex = this.cart.findIndex(item => item.cartItemId === cartItemId);

    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += quantity;
    } else {
      this.cart.push({
        cartItemId,
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        grind: product.category === 'beans' ? grind : null,
        quantity: quantity
      });
    }

    this.saveCart();
    this.showToast(`Added "${product.name}" to cart!`);
    this.openDrawer();
  }

  updateQuantity(cartItemId, delta) {
    const index = this.cart.findIndex(i => i.cartItemId === cartItemId);
    if (index === -1) return;

    this.cart[index].quantity += delta;
    if (this.cart[index].quantity <= 0) {
      this.cart.splice(index, 1);
      this.showToast('Item removed from cart.');
    }
    this.saveCart();
  }

  removeItem(cartItemId) {
    this.cart = this.cart.filter(i => i.cartItemId !== cartItemId);
    this.saveCart();
    this.showToast('Item removed from cart.');
  }

  clearCart() {
    this.cart = [];
    this.promoCode = '';
    this.saveCart();
  }

  applyPromo(code) {
    const cleanCode = (code || '').trim().toUpperCase();
    if (PROMO_CODES[cleanCode]) {
      this.promoCode = cleanCode;
      this.saveCart();
      this.showToast(`Promo "${cleanCode}" applied! ${PROMO_CODES[cleanCode].label}`, 'success');
      return true;
    } else {
      this.showToast('Invalid promo code. Try "BREW10"', 'error');
      return false;
    }
  }

  removePromo() {
    this.promoCode = '';
    this.saveCart();
    this.showToast('Promo code removed.');
  }

  calculateTotals() {
    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = 0;
    let shipping = subtotal > 0 ? (subtotal >= 40 ? 0 : 4.99) : 0;

    if (this.promoCode && PROMO_CODES[this.promoCode]) {
      const promo = PROMO_CODES[this.promoCode];
      if (promo.discountPercent) {
        discount = subtotal * (promo.discountPercent / 100);
      } else if (promo.discountAmount) {
        discount = Math.min(subtotal, promo.discountAmount);
      }
      if (promo.freeShipping) {
        shipping = 0;
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discount);
    const tax = discountedSubtotal * 0.05; // 5% artisanal beverage tax
    const total = discountedSubtotal + tax + shipping;

    return {
      subtotal,
      discount,
      shipping,
      tax,
      total,
      itemCount: this.cart.reduce((count, item) => count + item.quantity, 0)
    };
  }

  updateBadges() {
    const totals = this.calculateTotals();
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(badge => {
      badge.textContent = totals.itemCount;
      badge.style.display = totals.itemCount > 0 ? 'flex' : 'none';
    });
  }

  initDOM() {
    // Inject Drawer Markup if not present
    if (!document.getElementById('cartDrawerOverlay')) {
      const drawerHTML = `
        <div class="cart-drawer-overlay" id="cartDrawerOverlay"></div>
        <aside class="cart-drawer" id="cartDrawer" aria-label="Shopping Cart">
          <div class="cart-drawer-header">
            <h3>Your Roastery Basket</h3>
            <button class="close-btn" id="closeCartBtn" aria-label="Close cart">&times;</button>
          </div>
          <div class="cart-items-list" id="cartItemsList">
            <!-- Rendered dynamically -->
          </div>
          <div class="cart-drawer-footer" id="cartDrawerFooter">
            <!-- Rendered dynamically -->
          </div>
        </aside>

        <!-- Checkout Modal -->
        <div class="modal-overlay" id="checkoutModalOverlay">
          <div class="modal-content">
            <div class="modal-header">
              <h3>Secure Checkout & Tasting Delivery</h3>
              <button class="close-btn" id="closeCheckoutBtn">&times;</button>
            </div>
            <div class="modal-body">
              <form id="checkoutForm">
                <div class="form-grid">
                  <div class="form-group">
                    <label class="form-label" for="custName">Full Name *</label>
                    <input type="text" id="custName" class="form-control" placeholder="Eleanor Vance" required />
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="custEmail">Email Address *</label>
                    <input type="email" id="custEmail" class="form-control" placeholder="eleanor@example.com" required />
                  </div>
                  <div class="form-group form-full">
                    <label class="form-label" for="custAddress">Delivery Address *</label>
                    <input type="text" id="custAddress" class="form-control" placeholder="742 Evergreen Terrace, Suite 4B" required />
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="custCity">City *</label>
                    <input type="text" id="custCity" class="form-control" placeholder="Portland" required />
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="custZip">Postal / ZIP Code *</label>
                    <input type="text" id="custZip" class="form-control" placeholder="97201" required />
                  </div>
                  <div class="form-group form-full">
                    <label class="form-label" for="orderNotes">Roasting or Barista Instructions (Optional)</label>
                    <textarea id="orderNotes" class="form-control" placeholder="Leave at porch, call on arrival, extra oat milk, etc."></textarea>
                  </div>
                  <div class="form-group form-full">
                    <label class="form-label">Payment Preference</label>
                    <div style="display: flex; gap: 1rem; margin-top: 0.3rem;">
                      <label style="display:flex; align-items:center; gap:0.4rem; font-size:0.9rem; cursor:pointer;">
                        <input type="radio" name="paymentMethod" value="card" checked /> Credit / Debit Card
                      </label>
                      <label style="display:flex; align-items:center; gap:0.4rem; font-size:0.9rem; cursor:pointer;">
                        <input type="radio" name="paymentMethod" value="applepay" /> Apple Pay / Google Pay
                      </label>
                      <label style="display:flex; align-items:center; gap:0.4rem; font-size:0.9rem; cursor:pointer;">
                        <input type="radio" name="paymentMethod" value="cod" /> Pay on Pickup / Delivery
                      </label>
                    </div>
                  </div>
                </div>

                <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--c-border); display:flex; justify-content: space-between; align-items:center;">
                  <div>
                    <span style="font-size: 0.85rem; color: var(--c-text-muted);">Amount Payable:</span>
                    <h3 id="checkoutModalTotal" style="color: var(--c-roast);">$0.00</h3>
                  </div>
                  <button type="submit" class="btn btn-primary btn-lg">Place Artisan Order</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Order Confirmation Modal -->
        <div class="modal-overlay" id="orderConfirmOverlay">
          <div class="modal-content" style="text-align: center; max-width: 500px;">
            <div class="modal-body" style="padding: 2.5rem 2rem;">
              <div style="width: 70px; height: 70px; background: var(--c-success-bg); color: var(--c-success); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; margin: 0 auto 1.5rem;">
                ✓
              </div>
              <h2 style="margin-bottom: 0.5rem;">Order Roasted & Confirmed!</h2>
              <p style="color: var(--c-text-muted); font-size: 0.95rem; margin-bottom: 1.5rem;">
                Thank you, <strong id="confirmCustomerName">Friend</strong>. Our master roasters are preparing your batch right now.
              </p>
              <div style="background: var(--c-cream-bg); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.5rem; text-align: left; font-size: 0.9rem;">
                <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem;">
                  <span style="color: var(--c-text-muted);">Order Tracking ID:</span>
                  <strong id="confirmOrderId" style="font-family: monospace;">BB-93821</strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem;">
                  <span style="color: var(--c-text-muted);">Estimated Dispatch:</span>
                  <strong>Tomorrow, 8:30 AM</strong>
                </div>
                <div style="display:flex; justify-content:space-between;">
                  <span style="color: var(--c-text-muted);">Total Paid:</span>
                  <strong id="confirmOrderTotal" style="color: var(--c-roast);">$0.00</strong>
                </div>
              </div>
              <button class="btn btn-primary" id="continueShoppingBtn" style="width: 100%;">Continue Exploring Bean & Brew</button>
            </div>
          </div>
        </div>

        <!-- Toast Notifications Area -->
        <div class="toast-container" id="toastContainer"></div>
      `;
      document.body.insertAdjacentHTML('beforeend', drawerHTML);
    }

    this.bindEvents();
    this.updateBadges();
    this.renderDrawer();
  }

  bindEvents() {
    const overlay = document.getElementById('cartDrawerOverlay');
    const closeBtn = document.getElementById('closeCartBtn');
    const checkoutCloseBtn = document.getElementById('closeCheckoutBtn');
    const continueBtn = document.getElementById('continueShoppingBtn');
    const checkoutForm = document.getElementById('checkoutForm');

    if (overlay) overlay.addEventListener('click', () => this.closeDrawer());
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeDrawer());
    if (checkoutCloseBtn) checkoutCloseBtn.addEventListener('click', () => this.closeCheckout());
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        document.getElementById('orderConfirmOverlay').classList.remove('open');
      });
    }

    // Cart trigger buttons
    document.querySelectorAll('.cart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openDrawer();
      });
    });

    if (checkoutForm) {
      checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitOrder(new FormData(checkoutForm));
      });
    }
  }

  openDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartDrawerOverlay');
    if (drawer && overlay) {
      this.renderDrawer();
      drawer.classList.add('open');
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  closeDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartDrawerOverlay');
    if (drawer && overlay) {
      drawer.classList.remove('open');
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  renderDrawer() {
    const list = document.getElementById('cartItemsList');
    const footer = document.getElementById('cartDrawerFooter');
    if (!list || !footer) return;

    if (this.cart.length === 0) {
      list.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-icon">☕</div>
          <h4>Your Cup Is Empty</h4>
          <p style="font-size: 0.9rem; margin-top: 0.4rem; color: var(--c-text-muted);">
            Explore our ethically roasted whole beans, signature drinks, and barista gear.
          </p>
          <a href="menu.html" class="btn btn-outline btn-sm" style="margin-top: 1.5rem;" onclick="window.cartManager.closeDrawer()">
            Browse Full Menu
          </a>
        </div>
      `;
      footer.innerHTML = '';
      return;
    }

    const totals = this.calculateTotals();

    list.innerHTML = this.cart.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          ${item.grind ? `<span class="tag" style="margin-bottom: 0.3rem; display:inline-block;">${item.grind}</span>` : ''}
          <div class="item-single-price">$${item.price.toFixed(2)} each</div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="window.cartManager.updateQuantity('${item.cartItemId}', -1)" aria-label="Decrease quantity">-</button>
            <span class="qty-number">${item.quantity}</span>
            <button class="qty-btn" onclick="window.cartManager.updateQuantity('${item.cartItemId}', 1)" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-weight: 700; color: var(--c-roast);">$${(item.price * item.quantity).toFixed(2)}</div>
          <button class="cart-item-remove" onclick="window.cartManager.removeItem('${item.cartItemId}')" title="Remove Item">&times;</button>
        </div>
      </div>
    `).join('');

    footer.innerHTML = `
      <div class="promo-group">
        <input type="text" class="promo-input" id="cartPromoInput" placeholder="Promo code (e.g. BREW10)" value="${this.promoCode}" />
        <button class="btn btn-secondary btn-sm" id="applyPromoBtn">Apply</button>
      </div>
      ${this.promoCode ? `
        <div style="display:flex; justify-content:space-between; align-items:center; background: var(--c-success-bg); color: var(--c-success); padding: 0.4rem 0.8rem; border-radius: var(--radius-sm); font-size: 0.8rem; margin-bottom: 0.8rem;">
          <span>✓ ${PROMO_CODES[this.promoCode]?.label || 'Code Applied'}</span>
          <button style="color: var(--c-danger); font-weight:700;" onclick="window.cartManager.removePromo()">Remove</button>
        </div>
      ` : ''}

      <div class="cart-summary-line">
        <span>Subtotal</span>
        <span>$${totals.subtotal.toFixed(2)}</span>
      </div>
      ${totals.discount > 0 ? `
        <div class="cart-summary-line" style="color: var(--c-success);">
          <span>Promo Discount</span>
          <span>-$${totals.discount.toFixed(2)}</span>
        </div>
      ` : ''}
      <div class="cart-summary-line">
        <span>Artisan Roastery Tax (5%)</span>
        <span>$${totals.tax.toFixed(2)}</span>
      </div>
      <div class="cart-summary-line">
        <span>Eco-Packaging Delivery</span>
        <span>${totals.shipping === 0 ? '<strong style="color: var(--c-success);">FREE</strong>' : `$${totals.shipping.toFixed(2)}`}</span>
      </div>

      <div class="cart-summary-total">
        <span>Estimated Total</span>
        <span>$${totals.total.toFixed(2)}</span>
      </div>

      <button class="btn btn-primary" id="openCheckoutBtn" style="width: 100%;">
        Proceed to Checkout ($${totals.total.toFixed(2)})
      </button>
    `;

    // Bind footer buttons
    const applyBtn = document.getElementById('applyPromoBtn');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        const input = document.getElementById('cartPromoInput');
        if (input) this.applyPromo(input.value);
      });
    }

    const openCheckoutBtn = document.getElementById('openCheckoutBtn');
    if (openCheckoutBtn) {
      openCheckoutBtn.addEventListener('click', () => {
        this.closeDrawer();
        this.openCheckout();
      });
    }
  }

  openCheckout() {
    const modal = document.getElementById('checkoutModalOverlay');
    const totalDisplay = document.getElementById('checkoutModalTotal');
    const totals = this.calculateTotals();

    if (modal && totalDisplay) {
      totalDisplay.textContent = `$${totals.total.toFixed(2)}`;
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  closeCheckout() {
    const modal = document.getElementById('checkoutModalOverlay');
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  submitOrder(formData) {
    const name = formData.get('custName') || 'Valued Guest';
    const totals = this.calculateTotals();
    const orderId = 'BB-' + Math.floor(10000 + Math.random() * 90000);

    // Close checkout
    this.closeCheckout();

    // Fill confirmation
    document.getElementById('confirmCustomerName').textContent = name;
    document.getElementById('confirmOrderId').textContent = orderId;
    document.getElementById('confirmOrderTotal').textContent = `$${totals.total.toFixed(2)}`;

    // Show confirmation modal
    const confirmModal = document.getElementById('orderConfirmOverlay');
    if (confirmModal) {
      confirmModal.classList.add('open');
    }

    // Reset cart
    this.clearCart();
    this.showToast(`Order #${orderId} placed successfully! Check your inbox for roast updates.`, 'success');
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'success' ? 'toast-success' : type === 'error' ? 'toast-error' : ''}`;
    toast.innerHTML = `<span>☕</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  window.cartManager = new CartManager();
});
