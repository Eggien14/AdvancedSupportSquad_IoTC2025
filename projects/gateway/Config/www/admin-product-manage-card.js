// Admin Product Management Card
// Quản lý sản phẩm cho Admin

import ApiConfig from '/local/api-config.js';
import AdminProductManagePopup from '/local/admin-product-manage-popup.js';

class AdminProductManageCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._products = [];
    this._filteredProducts = [];
    this._popup = new AdminProductManagePopup();
    this._debounce = null;
  }

  setConfig(config) {
    this._config = Object.assign({}, config || {});
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._rendered) this._render();
  }

  getCardSize() {
    return 12;
  }

  _render() {
    const style = `
      :host { 
        display: block; 
        font-family: system-ui, Roboto, Arial, sans-serif; 
        height: 100vh;
        overflow: hidden;
      }
      
      .container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background: var(--card-background-color, #1e1e1e);
        color: var(--primary-text-color, #eaeaea);
        padding: 20px;
        box-sizing: border-box;
      }

      .header {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-bottom: 20px;
        flex-shrink: 0;
      }

      .title {
        font-size: 24px;
        font-weight: 600;
        color: var(--primary-color, #2196F3);
        margin: 0;
      }

      .controls {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
      }

      .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
      }

      .btn-primary {
        background: var(--primary-color, #2196F3);
        color: white;
      }

      .btn-primary:hover {
        background: var(--primary-color-dark, #1976D2);
        transform: translateY(-1px);
      }

      .btn-success {
        background: var(--success-color, #4CAF50);
        color: white;
      }

      .btn-success:hover {
        background: var(--success-color-dark, #45a049);
        transform: translateY(-1px);
      }

      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }

      .search-container {
        display: flex;
        gap: 12px;
        flex: 1;
        min-width: 300px;
      }

      .search-input {
        padding: 10px 14px;
        border: 1px solid var(--divider-color, #444);
        border-radius: 8px;
        background: var(--secondary-background-color, #2d2d2d);
        color: var(--primary-text-color, #eaeaea);
        font-size: 14px;
        flex: 1;
        min-width: 120px;
      }

      .search-input::placeholder {
        color: var(--secondary-text-color, #9aa0a6);
      }

      .search-input:focus {
        outline: none;
        border-color: var(--primary-color, #2196F3);
      }

      .products-section {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
      }

      .products-count {
        font-size: 14px;
        color: var(--secondary-text-color, #9aa0a6);
        margin-bottom: 12px;
      }

      .products-list {
        flex: 1;
        overflow-y: auto;
        border: 1px solid var(--divider-color, #444);
        border-radius: 8px;
        background: var(--secondary-background-color, #2d2d2d);
      }

      .product-item {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid var(--divider-color, #444);
        cursor: pointer;
        transition: background 0.2s ease;
      }

      .product-item:hover {
        background: var(--primary-color-alpha, rgba(33, 150, 243, 0.1));
      }

      .product-item:last-child {
        border-bottom: none;
      }

      .product-info {
        flex: 1;
        min-width: 0;
      }

      .product-id {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-color, #2196F3);
        margin-bottom: 4px;
      }

      .product-name {
        font-size: 14px;
        color: var(--primary-text-color, #eaeaea);
        line-height: 1.4;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .delete-btn {
        padding: 8px;
        border: none;
        border-radius: 6px;
        background: var(--error-color, #f44336);
        color: white;
        cursor: pointer;
        transition: all 0.2s ease;
        margin-left: 12px;
        flex-shrink: 0;
      }

      .delete-btn:hover {
        background: var(--error-color-dark, #d32f2f);
        transform: scale(1.05);
      }

      .loading {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 40px;
        color: var(--secondary-text-color, #9aa0a6);
      }

      .error {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 40px;
        color: var(--error-color, #f44336);
        text-align: center;
      }

      .empty {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 40px;
        color: var(--secondary-text-color, #9aa0a6);
        text-align: center;
      }

      @media (max-width: 768px) {
        .container {
          padding: 16px;
        }
        
        .controls {
          flex-direction: column;
          align-items: stretch;
        }
        
        .search-container {
          min-width: auto;
        }
        
        .search-input {
          min-width: auto;
        }
        
        .btn {
          width: 100%;
        }
      }

      @media (max-width: 480px) {
        .container {
          padding: 12px;
        }
        
        .title {
          font-size: 20px;
        }
        
        .search-container {
          flex-direction: column;
        }
      }
    `;

    const html = `
      <style>${style}</style>
      <div class="container">
        <div class="header">
          <h1 class="title">🛠️ Product Manage & Update</h1>
          
          <div class="controls">
            <button class="btn btn-primary" id="loadAllBtn">
              📋 LIST ALL PRODUCTS
            </button>
            
            <button class="btn btn-success" id="newProductBtn">
              ➕ NEW PRODUCT
            </button>
            
            <div class="search-container">
              <input 
                type="text" 
                class="search-input" 
                id="searchId" 
                placeholder="Search by ID..."
              >
              <input 
                type="text" 
                class="search-input" 
                id="searchName" 
                placeholder="Search by name..."
              >
            </div>
          </div>
        </div>

        <div class="products-section">
          <div class="products-count" id="productsCount">
            No data loaded
          </div>
          
          <div class="products-list" id="productsList">
            <div class="empty">
              <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
              <div>Click "LIST ALL PRODUCTS" to load the product list</div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.shadowRoot.innerHTML = html;
    this._attachEventListeners();
  }

  _attachEventListeners() {
    const loadAllBtn = this.shadowRoot.getElementById('loadAllBtn');
    const newProductBtn = this.shadowRoot.getElementById('newProductBtn');
    const searchId = this.shadowRoot.getElementById('searchId');
    const searchName = this.shadowRoot.getElementById('searchName');

    loadAllBtn.addEventListener('click', () => this._loadAllProducts());
    newProductBtn.addEventListener('click', () => this._showNewProductPopup());

    // Debounced search
    const handleSearch = () => {
      clearTimeout(this._debounce);
      this._debounce = setTimeout(() => this._filterProducts(), 300);
    };

    searchId.addEventListener('input', handleSearch);
    searchName.addEventListener('input', handleSearch);
  }

  async _loadAllProducts() {
    const loadAllBtn = this.shadowRoot.getElementById('loadAllBtn');
    const productsList = this.shadowRoot.getElementById('productsList');
    const productsCount = this.shadowRoot.getElementById('productsCount');

    try {
      loadAllBtn.disabled = true;
      loadAllBtn.textContent = 'Loading...';
      
      productsList.innerHTML = '<div class="loading">📡 Loading product list...</div>';

      const apiBase = ApiConfig.getApiBaseAuto();
      const response = await fetch(`${apiBase}/products/list-all-product`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      this._products = await response.json();
      this._filteredProducts = [...this._products];
      
      console.log('Loaded products:', this._products.length);
      
      this._renderProductsList();
      this._updateProductsCount();

    } catch (error) {
      console.error('Error loading products:', error);
      productsList.innerHTML = `
        <div class="error">
          <div>❌ Error loading data</div>
          <div style="margin-top: 8px; font-size: 12px;">${error.message}</div>
        </div>
      `;
      productsCount.textContent = 'Error loading data';
    } finally {
      loadAllBtn.disabled = false;
      loadAllBtn.textContent = '📋 LIST ALL PRODUCTS';
    }
  }

  _filterProducts() {
    const searchId = this.shadowRoot.getElementById('searchId').value.trim().toLowerCase();
    const searchName = this.shadowRoot.getElementById('searchName').value.trim().toLowerCase();

    if (!searchId && !searchName) {
      this._filteredProducts = [...this._products];
    } else {
      this._filteredProducts = this._products.filter(product => {
        const matchId = !searchId || product.product_id.toString().includes(searchId);
        const matchName = !searchName || product.name.toLowerCase().includes(searchName);
        return matchId && matchName;
      });
    }

    this._renderProductsList();
    this._updateProductsCount();
  }

  _renderProductsList() {
    const productsList = this.shadowRoot.getElementById('productsList');

    if (this._filteredProducts.length === 0) {
      productsList.innerHTML = `
        <div class="empty">
          <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
          <div>No products found</div>
        </div>
      `;
      return;
    }

    const html = this._filteredProducts.map(product => `
      <div class="product-item" data-product-id="${product.product_id}">
        <div class="product-info">
          <div class="product-id">ID: ${product.product_id}</div>
          <div class="product-name">${this._escape(product.name)}</div>
        </div>
        <button class="delete-btn" data-product-id="${product.product_id}" title="Xóa sản phẩm">
          🗑️
        </button>
      </div>
    `).join('');

    productsList.innerHTML = html;

    // Add event listeners
    productsList.querySelectorAll('.product-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (!e.target.classList.contains('delete-btn')) {
          const productId = item.dataset.productId;
          this._showEditProductPopup(parseInt(productId));
        }
      });
    });

    productsList.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const productId = btn.dataset.productId;
        this._confirmDeleteProduct(parseInt(productId));
      });
    });
  }

  _updateProductsCount() {
    const productsCount = this.shadowRoot.getElementById('productsCount');
    const total = this._products.length;
    const filtered = this._filteredProducts.length;
    
    if (total === filtered) {
      productsCount.textContent = `Total: ${total} product`;
    } else {
      productsCount.textContent = `Display: ${filtered}/${total} product`;
    }
  }

  async _confirmDeleteProduct(productId) {
    const product = this._products.find(p => p.product_id === productId);
    if (!product) return;

    const confirmed = confirm(`Are you sure you want to remove this product?\n\nID: ${productId}\nTên: ${product.name}`);
    if (!confirmed) return;

    try {
      const apiBase = ApiConfig.getApiBaseAuto();
      const response = await fetch(`${apiBase}/products/delete-product/${productId}`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('Product deleted:', result);

      // Remove from local arrays
      this._products = this._products.filter(p => p.product_id !== productId);
      this._filteredProducts = this._filteredProducts.filter(p => p.product_id !== productId);

      // Re-render
      this._renderProductsList();
      this._updateProductsCount();

      alert(`✅ Product removed: ${result.deleted_product_name}`);

    } catch (error) {
      console.error('Error deleting product:', error);
      alert(`❌ Error removing product: ${error.message}`);
    }
  }

  _showNewProductPopup() {
    this._popup.showNew(ApiConfig, () => {
      // Callback when product created successfully
      this._loadAllProducts(); // Reload list
    });
  }

  _showEditProductPopup(productId) {
    this._popup.showEdit(productId, ApiConfig, () => {
      // Callback when product updated successfully
      this._loadAllProducts(); // Reload list
    });
  }

  _escape(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

// Register the custom element
customElements.define('admin-product-manage-card', AdminProductManageCard);

// Export cho sử dụng
window.AdminProductManageCard = AdminProductManageCard;
export default AdminProductManageCard;
