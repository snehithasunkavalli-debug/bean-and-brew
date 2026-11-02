if (window.__menu_js_loaded) { /* already loaded */ } else {
window.__menu_js_loaded = true;
/* ===================================================================
   BEAN & BREW - MENU & SHOPPING INTERACTION (menu.js)
   Filter, Search, Grind Selector, and Dynamic Catalog Rendering
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initMenuCatalog();
});

function initMenuCatalog() {
  const grid = document.getElementById('menuItemsGrid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('menuSearchInput');
  const activeCountEl = document.getElementById('itemsMatchCount');

  if (!grid) return;

  let currentCategory = 'all';
  let searchQuery = '';

  function renderItems() {
    const products = window.COFFEE_PRODUCTS || [];

    const filtered = products.filter(item => {
      const matchCat = (currentCategory === 'all') || (item.category === currentCategory);
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    if (activeCountEl) {
      activeCountEl.textContent = `Showing ${filtered.length} artisan creation${filtered.length === 1 ? '' : 's'}`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
          <h3 style="margin-bottom: 0.5rem;">No Coffee Creations Found</h3>
          <p style="color: var(--c-text-muted); margin-bottom: 1.5rem;">
            Try adjusting your search keywords or resetting your filter category.
          </p>
          <button class="btn btn-outline" id="resetFiltersBtn">Reset Filters</button>
        </div>
      `;
      document.getElementById('resetFiltersBtn')?.addEventListener('click', () => {
        currentCategory = 'all';
        searchQuery = '';
        if (searchInput) searchInput.value = '';
        filterBtns.forEach(b => b.classList.toggle('active', b.dataset.category === 'all'));
        renderItems();
      });
      return;
    }

    grid.innerHTML = filtered.map(item => `
      <article class="item-card" data-category="${item.category}">
        <div class="item-card-image">
          <img src="${item.image}" alt="${item.name}" loading="lazy" />
          <span class="item-badge">${item.roast}</span>
        </div>
        <div class="item-card-body">
          <div class="item-tags">
            <span class="tag">📍 ${item.origin}</span>
            ${item.category === 'beans' ? '<span class="tag">100% Arabica</span>' : ''}
          </div>
          <h3>${item.name}</h3>
          <p>${item.description}</p>
          
          <div style="font-size: 0.8rem; color: var(--c-crema-hover); font-weight: 600; margin-bottom: 1rem;">
            👅 ${item.notes}
          </div>

          ${item.category === 'beans' ? `
            <div style="margin-bottom: 1rem;">
              <label style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--c-text-muted); display: block; margin-bottom: 0.25rem;">
                Grind Preference:
              </label>
              <select class="form-control" id="grind-${item.id}" style="padding: 0.4rem 0.6rem; font-size: 0.85rem;">
                <option value="Whole Bean">Whole Bean (Maximum Freshness)</option>
                <option value="French Press">Coarse (French Press / Cold Brew)</option>
                <option value="Pour Over / V60">Medium (V60 / Chemex / Drip)</option>
                <option value="Fine Espresso">Fine (Home Espresso / Moka Pot)</option>
              </select>
            </div>
          ` : ''}

          <div class="item-card-footer">
            <span class="item-price">₹${item.price.toFixed(2)}</span>
            <div style="display:flex; gap:0.5rem;">
              <button class="btn btn-outline btn-sm" onclick="window.openTastingNotes('${item.id}')" title="View Cupping Notes">
                Notes
              </button>
              <button class="btn btn-primary btn-sm" onclick="handleAddToCart('${item.id}')">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </article>
    `).join('');
  }

  // Handle add with selected grind
  window.handleAddToCart = function(productId) {
    const grindSelect = document.getElementById(`grind-${productId}`);
    const grind = grindSelect ? grindSelect.value : null;
    if (window.cartManager) {
      window.cartManager.addItem(productId, grind);
    }
  };

  // Filter Buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category || 'all';
      renderItems();
    });
  });

  // Search Input with Debounce
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderItems();
    });
  }

  // Initial render
  renderItems();
}

}
